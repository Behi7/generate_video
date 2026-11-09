import React from "react";
import { RoundedBox } from "@react-three/drei";
import { interpolate, Easing } from "remotion";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 2: $100 MOTORIZED ECCENTRIC FLYWHEEL PUNCH PRESS (PressTier2_Electric.tsx)
 * ============================================================================
 * Complies strictly with remotion_studio/crew/3d_modeler.md and AssemblyContract.ts.
 *
 * SPECIFICATION & KEY CONSTRAINTS:
 * - Coaxial alignment: Centerline strictly X = 0, Z = 0.
 * - Anvil bolster die top surface: Y = 0.630, X = 0, Z = 0.
 * - Workpiece top surface: Y = 0.770, X = 0, Z = 0.
 * - TDC resting bottom face at localFrame 150: Y = 1.050 (32 cm stroke above Y = 0.730).
 * - BDC punch strike bottom face: Y = 0.730 (10 cm safe clearance above bolster die 0.630).
 *
 * GOLDEN INSIDE-OUT ASSEMBLY SEQUENCE:
 * - Order 0 (Frame 0f):  Heavy welded H-frame chassis & bed with T-slots (#1E293B / #334155, roughness 0.6).
 * - Order 1 (Frame 20f): Internal hardened eccentric crankshaft, bronze connecting rod, and needle bearings
 *                        (#CBD5E1 chrome / #D97706 bronze). Arrives BEFORE casing!
 * - Order 2 (Frame 40f): Cast iron upright frame housing with prismatic vertical slide ways
 *                        (#0F766E industrial hammerite green, roughness 0.55).
 * - Order 3 (Frame 60f): Heavy cast-steel counterweighted flywheel (40cm diameter), dual V-belt pulleys,
 *                        and induction electric motor (#475569 steel, #D97706 brass pulley rim).
 * - Order 4 (Frame 75f): Toolhead reciprocating ram & carbide punch die pointing vertically DOWN
 *                        along Y-axis into specimen.
 *
 * 4-PHASE KINEMATICS & OVERLOAD:
 * - 0..69f:   Staggered modular assembly snap sequence.
 * - 70..149f: Motor startup hum, V-belts tension, flywheel spools to operating RPM. Ram at TDC (Y=1.050).
 * - 150..224f: Continuous rapid mechanical punching cycles (8-frame cycle: 1.050 -> 0.730 -> 1.050).
 * - 225..244f: Torque bog-down from 100% to 0% as clutch binds, ram descends to contact Y=0.730.
 * - 245..264f: Contact stall at Y=0.730 with high-frequency micro-shudder (1mm to 3mm).
 * - 265..289f: Fracture! Connecting rod buckles, drive belt snaps, motor mounts rupture, debris >= 0.630.
 */

// ============================================================================
// PBR MATERIAL PRESETS
// ============================================================================
const MAT_CHASSIS_DARK = { color: "#1E293B", roughness: 0.60, metalness: 0.50 };
const MAT_CHASSIS_STEEL = { color: "#334155", roughness: 0.55, metalness: 0.65 };
const MAT_HAMMERITE_GREEN = { color: "#0F766E", roughness: 0.55, metalness: 0.50 };
const MAT_HAMMERITE_DARK = { color: "#0B534C", roughness: 0.60, metalness: 0.45 };
const MAT_CHROME_STEEL = { color: "#CBD5E1", roughness: 0.08, metalness: 0.98 };
const MAT_MIRROR_CHROME = { color: "#E2E8F0", roughness: 0.06, metalness: 0.98 };
const MAT_CAST_BRONZE = { color: "#D97706", roughness: 0.20, metalness: 0.92 };
const MAT_CAST_STEEL = { color: "#475569", roughness: 0.38, metalness: 0.85 };
const MAT_CARBIDE_DIE = { color: "#1E293B", roughness: 0.25, metalness: 0.88 };
const MAT_MATTE_RUBBER = { color: "#111827", roughness: 0.92, metalness: 0.08 };
const MAT_SAFETY_RED = { color: "#EF4444", roughness: 0.25, metalness: 0.75 };
const MAT_SLOT_RECESS = { color: "#0F172A", roughness: 0.90, metalness: 0.10 };

// ============================================================================
// KINEMATICS ENGINE
// ============================================================================
export interface PressTier2Kinematics {
  crankAngle: number;
  flywheelAngle: number;
  motorAngle: number;
  strokeY: number; // World Y position of punch die bottom face
  ramLocalY: number; // Translation relative to targetSocket [0, 1.050, 0]
  conrodAngle: number; // Tilt in Y-Z plane (radians)
  conrodBuckle: number; // Buckle deflection factor (0..1)
  shudderY: number;
  isBurst: boolean;
}

export function getPressTier2Kinematics(
  localFrame: number,
  isRunning: boolean,
  rpm: number,
  isBroken: boolean
): PressTier2Kinematics {
  const isBurst = isBroken || localFrame >= 234;
  const isStall = isRunning && localFrame >= 225 && localFrame < 234;
  const isBog = isRunning && localFrame >= 213 && localFrame < 225;
  const isOperating = isRunning && localFrame >= 123 && localFrame < 213;
  const isSpooling = isRunning && localFrame >= 63 && localFrame < 123;

  // 1. Flywheel and Motor Spooling / Rotation
  let flywheelAngle = 0;
  if (isRunning && localFrame >= 63) {
    if (isSpooling) {
      // Smooth acceleration curve 63..122f
      const p = (localFrame - 63) / 59;
      flywheelAngle = Math.pow(p, 1.8) * 10 * Math.PI * 2;
    } else if (isOperating) {
      // Operating high-speed rotation: 10 revolutions across 88 frames (123..210f)
      const spoolTotal = 10 * Math.PI * 2;
      const opAngle = ((localFrame - 123) / 88) * 10 * Math.PI * 2;
      flywheelAngle = spoolTotal + opAngle;
    } else if (isBog) {
      // Rapid torque bog-down deceleration 213..224f
      const p = (localFrame - 213) / 11;
      const decel = 1 - Math.pow(p, 1.5);
      const spoolTotal = 10 * Math.PI * 2;
      const opTotal = 10 * Math.PI * 2;
      flywheelAngle = spoolTotal + opTotal + (localFrame - 213) * ((Math.PI * 2) / 8.8) * decel;
    } else {
      // Stalled / frozen
      const spoolTotal = 10 * Math.PI * 2;
      const opTotal = 10 * Math.PI * 2;
      flywheelAngle = spoolTotal + opTotal + 2.5 * Math.PI;
    }
  }
  const motorAngle = flywheelAngle * 3.42;

  // 2. Eccentric Crankshaft Angle & Punch Stroke Y
  // TDC resting face = 1.050 (air gap 32 cm above strike 0.730; 28 cm above specimen top 0.770)
  // BDC strike face = 0.730 (10 cm clearance above bolster die 0.630)
  let crankAngle = 0;
  let strokeY = 1.050;
  let shudderY = 0;
  let conrodBuckle = 0;

  if (isBurst) {
    strokeY = 0.730;
    conrodBuckle = Math.min(1, (localFrame - 234) / 5);
    crankAngle = Math.PI; // Frozen at BDC
  } else if (isStall) {
    // 225..233f: Contact stall at Y=0.730 with resonant micro-shudder (1mm to 3.5mm)
    const pStall = (localFrame - 225) / 8;
    const shudderAmp = 0.001 + pStall * 0.0025; // 1mm -> 3.5mm
    shudderY = Math.sin(localFrame * 42) * shudderAmp;
    strokeY = 0.730 + shudderY;
    crankAngle = Math.PI + (shudderY / 0.160);
  } else if (isBog) {
    // 213..224f: Torque bog-down from 100% to 0% as clutch binds
    // Starts smoothly at TDC Y = 1.050 (matching frame 212 TDC position)
    const pBog = (localFrame - 213) / 11;
    const easedBog = interpolate(pBog, [0, 1], [0, 1], {
      easing: Easing.bezier(0.2, 0.8, 0.4, 1),
    });
    strokeY = 1.050 - (1.050 - 0.730) * easedBog;
    crankAngle = easedBog * Math.PI;
  } else if (isOperating) {
    // 123..212f: Continuous rapid mechanical punching cycles (10 full revolutions across 88 frames)
    // At frames 211..212: Ram rests at TDC Y = 1.050 (zero jump to 213!)
    if (localFrame >= 211) {
      crankAngle = 0;
      strokeY = 1.050;
    } else {
      crankAngle = ((localFrame - 123) / 88) * 10 * Math.PI * 2;
      // Harmonic eccentric plunge: r = 0.160m
      // angle = 0: strokeY = 0.890 + 0.160 = 1.050 (TDC)
      // angle = pi: strokeY = 0.890 - 0.160 = 0.730 (BDC)
      strokeY = 0.890 + 0.160 * Math.cos(crankAngle);
      if (Math.cos(crankAngle) < -0.96) {
        shudderY = 0.003; // Impact snap shock at bottom dead center
      }
    }
  } else {
    // 0..122f: Ram rests safely at TDC Y = 1.050
    strokeY = 1.050;
    crankAngle = 0;
  }

  // Connecting rod articulation in Y-Z plane
  // Crank radius r = 0.160m, rod length L = 0.420m
  const crankRadius = 0.160;
  const rodLength = 0.420;
  const conrodAngle = Math.asin(
    Math.max(-0.99, Math.min(0.99, (-crankRadius * Math.sin(crankAngle)) / rodLength))
  );

  // ramLocalY is relative to targetSocket [0, 1.050, 0]
  const ramLocalY = strokeY - 1.050;

  return {
    crankAngle,
    flywheelAngle,
    motorAngle,
    strokeY,
    ramLocalY,
    conrodAngle,
    conrodBuckle,
    shudderY,
    isBurst,
  };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): HEAVY WELDED H-FRAME CHASSIS & BED WITH T-SLOTS
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "press_t2_base_bed",
  name: "Heavy Welded H-Frame Chassis & Bed with T-Slots",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  entryDirection: "bottom",
  travelDistance: 2.5,
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: () => {
    // Foundation anchor bolt positions [x, z]
    const foundationBolts: [number, number][] = [
      [-0.46, -0.34],
      [0.46, -0.34],
      [-0.46, 0.34],
      [0.46, 0.34],
    ];

    return (
      <group position={[0, 0, 0]}>
        {/* Dual Heavy Floor Runner Baseplates */}
        <RoundedBox args={[0.22, 0.08, 0.82]} radius={0.018} smoothness={4} position={[-0.46, 0.04, 0]}>
          <meshStandardMaterial {...MAT_CHASSIS_DARK} />
        </RoundedBox>
        <RoundedBox args={[0.22, 0.08, 0.82]} radius={0.018} smoothness={4} position={[0.46, 0.04, 0]}>
          <meshStandardMaterial {...MAT_CHASSIS_DARK} />
        </RoundedBox>

        {/* 4 Foundation Heavy Hex Studs & Washers */}
        {foundationBolts.map(([bx, bz], i) => (
          <group key={i} position={[bx, 0.08, bz]}>
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.01, 16]} />
              <meshStandardMaterial {...MAT_CHROME_STEEL} />
            </mesh>
            <mesh position={[0, 0.024, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.028, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            <mesh position={[0, 0.048, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.035, 16]} />
              <meshStandardMaterial {...MAT_CHROME_STEEL} />
            </mesh>
          </group>
        ))}

        {/* Lower Welded Chassis Box Pedestal (Y: 0.08 to 0.44) */}
        <RoundedBox args={[0.88, 0.36, 0.68]} radius={0.028} smoothness={4} position={[0, 0.26, 0]}>
          <meshStandardMaterial {...MAT_CHASSIS_DARK} />
        </RoundedBox>

        {/* Triangular Welded Gussets Stiffening the Column Mounts */}
        {[-0.38, 0.38].map((gx, idx) => (
          <group key={idx} position={[gx, 0.26, 0]}>
            <mesh position={[0, 0, 0.35]} rotation={[0.45, 0, 0]}>
              <boxGeometry args={[0.12, 0.22, 0.03]} />
              <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
            </mesh>
            <mesh position={[0, 0, -0.35]} rotation={[-0.45, 0, 0]}>
              <boxGeometry args={[0.12, 0.22, 0.03]} />
              <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
            </mesh>
          </group>
        ))}

        {/* Front Maintenance Inspection Hatch with 8 perimeter bolts */}
        <group position={[0, 0.26, 0.345]}>
          <mesh>
            <boxGeometry args={[0.48, 0.22, 0.015]} />
            <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
          </mesh>
          {[-0.21, 0.21].map((hx, i) =>
            [-0.08, 0, 0.08].map((hy, j) => (
              <mesh key={`${i}-${j}`} position={[hx, hy, 0.01]}>
                <cylinderGeometry args={[0.012, 0.012, 0.01, 6]} />
                <meshStandardMaterial {...MAT_CHROME_STEEL} />
              </mesh>
            ))
          )}
        </group>

        {/* ========================================================= */}
        {/* MACHINED BOLSTER BED TABLE (Y: 0.44 to 0.54)               */}
        {/* ========================================================= */}
        <RoundedBox args={[0.84, 0.10, 0.64]} radius={0.016} smoothness={4} position={[0, 0.49, 0]}>
          <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
        </RoundedBox>

        {/* Machined T-Slots along X-axis at Z = -0.16 and +0.16 */}
        {[-0.16, 0.16].map((tz, i) => (
          <group key={i} position={[0, 0.536, tz]}>
            {/* Slot Opening */}
            <mesh>
              <boxGeometry args={[0.78, 0.012, 0.042]} />
              <meshStandardMaterial {...MAT_SLOT_RECESS} />
            </mesh>
            {/* Recessed Undercut Cavity */}
            <mesh position={[0, -0.016, 0]}>
              <boxGeometry args={[0.78, 0.018, 0.075]} />
              <meshStandardMaterial {...MAT_SLOT_RECESS} />
            </mesh>
          </group>
        ))}

        {/* Bed Perimeter Waste / Coolant Trough */}
        <mesh position={[0, 0.538, -0.29]}>
          <boxGeometry args={[0.80, 0.008, 0.03]} />
          <meshStandardMaterial {...MAT_SLOT_RECESS} />
        </mesh>
        <mesh position={[0, 0.538, 0.29]}>
          <boxGeometry args={[0.80, 0.008, 0.03]} />
          <meshStandardMaterial {...MAT_SLOT_RECESS} />
        </mesh>

        {/* ========================================================= */}
        {/* LOWER BOLSTER DIE ASSEMBLY                                */}
        {/* Anvil bolster top surface is STRICTLY at Y = 0.630, X=0, Z=0 */}
        {/* ========================================================= */}
        {/* Circular Die Bolster Shoe Base (Y: 0.54 to 0.58) */}
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.18, 0.19, 0.04, 32]} />
          <meshStandardMaterial {...MAT_CHASSIS_DARK} />
        </mesh>

        {/* 4 Heavy Steel Clamp Dogs securing the die into T-slots */}
        {[-0.16, 0.16].map((cz, i) =>
          [-0.14, 0.14].map((cx, j) => (
            <group key={`${i}-${j}`} position={[cx, 0.56, cz]}>
              <RoundedBox args={[0.045, 0.035, 0.06]} radius={0.008} smoothness={4} position={[0, 0, 0]}>
                <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
              </RoundedBox>
              <mesh position={[0, 0.025, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshStandardMaterial {...MAT_CHROME_STEEL} />
              </mesh>
            </group>
          ))
        )}

        {/* Hardened Tool-Steel Lower Bolster Die (Y: 0.58 to 0.630) */}
        {/* Top face is at 0.58 + (0.05 / 2) = 0.605 -> from 0.58 to 0.630 = height 0.05, center at 0.605 */}
        <mesh position={[0, 0.605, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 32]} />
          <meshStandardMaterial {...MAT_CHROME_STEEL} />
        </mesh>

        {/* Center Punch Relief Cavity in Lower Die (Diameter 0.05m, depth 0.02m) */}
        <mesh position={[0, 0.625, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.012, 24]} />
          <meshStandardMaterial {...MAT_SLOT_RECESS} />
        </mesh>

        {/* 4 Hardened Dowel Locating Pins & Brass Die Specification Nameplate */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <mesh key={i} position={[Math.cos(ang) * 0.105, 0.628, Math.sin(ang) * 0.105]}>
            <cylinderGeometry args={[0.008, 0.008, 0.008, 16]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        ))}

        {/* Bolster Die Brass Spec Plate */}
        <mesh position={[0, 0.56, 0.185]}>
          <boxGeometry args={[0.14, 0.022, 0.006]} />
          <meshStandardMaterial {...MAT_CAST_BRONZE} />
        </mesh>
      </group>
    );
  },
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): INTERNAL ECCENTRIC CRANKSHAFT & CONROD
// Arrives BEFORE casing!
// ============================================================================
const ModuleInternalCrank: ModularPartSpec = {
  id: "press_t2_crankshaft_conrod",
  name: "Hardened Eccentric Crankshaft, Bronze Conrod & Needle Bearings",
  assemblyOrder: 1,
  snapFrame: 15,
  targetSocket: [0, 1.85, 0],
  entryDirection: "top",
  travelDistance: 2.8,
  sparkColor: "#38BDF8",
  sparkCount: 18,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [-1.8, 3.8, 2.2],
    rotationImpulse: [3.2, 1.5, -2.4],
    sparkOrigin: [0, 1.45, 0],
    sparkColor: "#38BDF8",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const k = getPressTier2Kinematics(localFrame, isRunning, rpm, isBroken);

    // Eccentric crankpin offset r = 0.160m
    const r = 0.160;
    const pinY = r * Math.cos(k.crankAngle);
    const pinZ = r * Math.sin(k.crankAngle);

    // Connecting rod length L = 0.420m
    const rodLength = 0.420;
    // Wrist pin in ram is at X=0, Z=0; Y position relative to crankshaft center [0, 1.85, 0]:
    // pinY - wristLocalY = sqrt(rodLength^2 - pinZ^2)
    const wristLocalY = pinY - Math.sqrt(Math.max(0.01, rodLength * rodLength - pinZ * pinZ));

    return (
      <group position={[0, 0, 0]}>
        {/* ========================================================= */}
        {/* MAIN CRANKSHAFT AXIS (Rotates with crankAngle along X-axis) */}
        {/* ========================================================= */}
        <group rotation={[k.crankAngle, 0, 0]}>
          {/* Main Central Drive Shaft (X: -0.44 to +0.48) */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.02, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.94, 24]} />
            <meshStandardMaterial {...MAT_CHROME_STEEL} />
          </mesh>

          {/* Dual Precision Needle Bearing Cages & Rollers at Column Seats */}
          {[-0.34, 0.34].map((bx, i) => (
            <group key={i} position={[bx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.048, 0.048, 0.08, 20]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
              <mesh position={[0, 0.035, 0]}>
                <cylinderGeometry args={[0.052, 0.052, 0.015, 20]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
            </group>
          ))}

          {/* Heavy Polished Counterweight Webs / Cheeks at X = -0.10 and +0.10 */}
          {[-0.10, 0.10].map((cx, i) => (
            <group key={i} position={[cx, 0, 0]}>
              {/* Counterweight Body (Offset opposite to crankpin) */}
              <RoundedBox args={[0.065, 0.28, 0.18]} radius={0.022} smoothness={4} position={[0, -0.07, 0]}>
                <meshStandardMaterial {...MAT_CAST_STEEL} />
              </RoundedBox>
              {/* Polished Brass Balance Weight Plugs */}
              <mesh position={[0, -0.13, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.068, 16]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
              <mesh position={[0, -0.13, -0.05]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.068, 16]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
            </group>
          ))}

          {/* Hardened Eccentric Crankpin Journal (Offset at Y = +0.160, Z = 0 in rotating frame) */}
          <group position={[0, r, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.036, 0.036, 0.135, 24]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        </group>

        {/* ========================================================= */}
        {/* CAST PHOSPHOR BRONZE CONNECTING ROD (PITMAN ARM)          */}
        {/* Big end mounts at [0, pinY, pinZ], small end at [0, wristLocalY, 0] */}
        {/* ========================================================= */}
        <group position={[0, pinY, pinZ]} rotation={[k.conrodAngle, 0, 0]}>
          {/* Big-End Bearing Housing (Encircles crankpin) */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.058, 0.058, 0.12, 24]} />
            <meshStandardMaterial {...MAT_CAST_BRONZE} />
          </mesh>

          {/* 4 High-Tensile Chrome Bearing Cap Bolts */}
          {[-0.045, 0.045].map((bx, i) =>
            [-0.04, 0.04].map((by, j) => (
              <mesh key={`${i}-${j}`} position={[bx, by, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.009, 0.009, 0.02, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))
          )}

          {/* Bronze Lube Cup on Big-End Cap */}
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.016, 0.012, 0.025, 16]} />
            <meshStandardMaterial {...MAT_CAST_BRONZE} />
          </mesh>

          {/* Connecting Rod I-Beam Shank (Extending downwards by rodLength) */}
          {!k.isBurst ? (
            <group position={[0, -rodLength / 2, 0]}>
              {/* Central Web */}
              <mesh>
                <boxGeometry args={[0.024, rodLength - 0.12, 0.065]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
              {/* Front Flange */}
              <mesh position={[0, 0, 0.03]}>
                <boxGeometry args={[0.055, rodLength - 0.12, 0.014]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
              {/* Rear Flange */}
              <mesh position={[0, 0, -0.03]}>
                <boxGeometry args={[0.055, rodLength - 0.12, 0.014]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
            </group>
          ) : (
            /* Overload Catastrophic Buckled Conrod Geometry */
            <group position={[0, -rodLength / 2, 0]}>
              <mesh position={[0.03, 0.04, 0.06]} rotation={[0.4, 0.2, 0.3]}>
                <boxGeometry args={[0.05, 0.18, 0.07]} />
                <meshStandardMaterial color="#B45309" roughness={0.35} metalness={0.9} />
              </mesh>
              <mesh position={[-0.02, -0.06, -0.04]} rotation={[-0.3, -0.1, -0.2]}>
                <boxGeometry args={[0.05, 0.18, 0.07]} />
                <meshStandardMaterial color="#B45309" roughness={0.35} metalness={0.9} />
              </mesh>
              {/* Jagged Fracture Shear Lip */}
              <mesh position={[0.02, 0, 0.02]}>
                <coneGeometry args={[0.035, 0.04, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          )}

          {/* Small-End Wrist Pin Eye (at distance -rodLength) */}
          <group position={[0, -rodLength, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 0.10, 24]} />
              <meshStandardMaterial {...MAT_CAST_BRONZE} />
            </mesh>
            {/* Mirror Chrome Wrist Pin */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.14, 20]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): CAST IRON UPRIGHT FRAME HOUSING & SLIDE WAYS
// Encloses Order 1 cleanly!
// ============================================================================
const ModuleUprightFrame: ModularPartSpec = {
  id: "press_t2_upright_frame",
  name: "Cast Iron Upright Frame Housing with Prismatic Slide Ways",
  assemblyOrder: 2,
  snapFrame: 30,
  targetSocket: [0, 1.25, 0],
  entryDirection: "left",
  travelDistance: 3.2,
  sparkColor: "#10B981",
  sparkCount: 16,
  render: () => {
    // Relative to targetSocket [0, 1.25, 0]:
    // Bolster bed top is at local Y = 0.54 - 1.25 = -0.71
    // Crankshaft center is at local Y = 1.85 - 1.25 = +0.60
    // Crown top is at local Y = +0.95 (world 2.20)
    return (
      <group position={[0, 0, 0]}>
        {/* ========================================================= */}
        {/* LEFT UPRIGHT COLUMN (X = -0.38)                            */}
        {/* ========================================================= */}
        <group position={[-0.38, 0, 0]}>
          {/* Main Structural Column Body (Y: -0.71 to +0.70) */}
          <RoundedBox args={[0.18, 1.42, 0.56]} radius={0.032} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial {...MAT_HAMMERITE_GREEN} />
          </RoundedBox>

          {/* External Stiffening Ribs on Outer Column Flank */}
          {[-0.45, -0.15, 0.15, 0.45].map((ry, i) => (
            <mesh key={i} position={[-0.095, ry, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.46]} />
              <meshStandardMaterial {...MAT_HAMMERITE_DARK} />
            </mesh>
          ))}

          {/* Machined Prismatic Slide Way (V-Way / Dovetail Inner Face at X = +0.09) */}
          <group position={[0.092, -0.05, 0]}>
            <mesh>
              <boxGeometry args={[0.016, 0.78, 0.28]} />
              <meshStandardMaterial {...MAT_CHROME_STEEL} />
            </mesh>
            {/* Prismatic V-Ridge */}
            <mesh position={[0.008, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.02, 0.76, 0.02]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>

          {/* 4 Brass Gib Adjusting Screws with Chrome Lock Nuts */}
          {[-0.32, -0.12, 0.08, 0.28].map((gy, i) => (
            <group key={i} position={[0, gy, 0.285]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 16]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
              <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.012, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          ))}

          {/* Main Crankshaft Bearing Pillow Block Housing (at Y = +0.60) */}
          <group position={[0, 0.60, 0]}>
            <RoundedBox args={[0.22, 0.24, 0.24]} radius={0.025} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial {...MAT_HAMMERITE_DARK} />
            </RoundedBox>
            {/* Split Bearing Cap Hex Nuts */}
            {[-0.08, 0.08].map((bz, i) => (
              <mesh key={i} position={[0, 0.13, bz]}>
                <cylinderGeometry args={[0.016, 0.016, 0.03, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ========================================================= */}
        {/* RIGHT UPRIGHT COLUMN (X = +0.38)                           */}
        {/* ========================================================= */}
        <group position={[0.38, 0, 0]}>
          {/* Main Structural Column Body (Y: -0.71 to +0.70) */}
          <RoundedBox args={[0.18, 1.42, 0.56]} radius={0.032} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial {...MAT_HAMMERITE_GREEN} />
          </RoundedBox>

          {/* External Stiffening Ribs on Outer Column Flank */}
          {[-0.45, -0.15, 0.15, 0.45].map((ry, i) => (
            <mesh key={i} position={[0.095, ry, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.46]} />
              <meshStandardMaterial {...MAT_HAMMERITE_DARK} />
            </mesh>
          ))}

          {/* Machined Prismatic Slide Way (V-Way / Dovetail Inner Face at X = -0.09) */}
          <group position={[-0.092, -0.05, 0]}>
            <mesh>
              <boxGeometry args={[0.016, 0.78, 0.28]} />
              <meshStandardMaterial {...MAT_CHROME_STEEL} />
            </mesh>
            {/* Prismatic V-Ridge */}
            <mesh position={[-0.008, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.02, 0.76, 0.02]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>

          {/* 4 Brass Gib Adjusting Screws with Chrome Lock Nuts */}
          {[-0.32, -0.12, 0.08, 0.28].map((gy, i) => (
            <group key={i} position={[0, gy, 0.285]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 16]} />
                <meshStandardMaterial {...MAT_CAST_BRONZE} />
              </mesh>
              <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.012, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          ))}

          {/* Main Crankshaft Bearing Pillow Block Housing (at Y = +0.60) */}
          <group position={[0, 0.60, 0]}>
            <RoundedBox args={[0.22, 0.24, 0.24]} radius={0.025} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial {...MAT_HAMMERITE_DARK} />
            </RoundedBox>
            {/* Split Bearing Cap Hex Nuts */}
            {[-0.08, 0.08].map((bz, i) => (
              <mesh key={i} position={[0, 0.13, bz]}>
                <cylinderGeometry args={[0.016, 0.016, 0.03, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ========================================================= */}
        {/* TOP CROWN CROSS-BEAM (Y = +0.76 to +0.95)                  */}
        {/* ========================================================= */}
        <group position={[0, 0.82, 0]}>
          <RoundedBox args={[0.94, 0.26, 0.58]} radius={0.032} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial {...MAT_HAMMERITE_GREEN} />
          </RoundedBox>

          {/* Cast Embossed Lettering Plate: "15-TON ECCENTRIC" */}
          <group position={[0, 0, 0.295]}>
            <mesh>
              <boxGeometry args={[0.54, 0.12, 0.01]} />
              <meshStandardMaterial {...MAT_HAMMERITE_DARK} />
            </mesh>
            <mesh position={[0, 0, 0.008]}>
              <boxGeometry args={[0.48, 0.06, 0.008]} />
              <meshStandardMaterial {...MAT_CAST_BRONZE} />
            </mesh>
          </group>

          {/* Dual Heavy Overhead Lifting Eye Bolts */}
          {[-0.26, 0.26].map((ex, i) => (
            <group key={i} position={[ex, 0.14, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.045, 0.015, 16, 24]} />
                <meshStandardMaterial {...MAT_CHROME_STEEL} />
              </mesh>
              <mesh position={[0, -0.02, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.025, 16]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): HEAVY CAST-STEEL COUNTERWEIGHTED FLYWHEEL,
// DUAL V-BELT PULLEYS, AND INDUCTION ELECTRIC MOTOR
// ============================================================================
const ModuleFlywheelMotor: ModularPartSpec = {
  id: "press_t2_flywheel_motor",
  name: "Counterweighted Flywheel, Dual V-Belt Pulleys & Induction Motor",
  assemblyOrder: 3,
  snapFrame: 45,
  targetSocket: [0.48, 1.85, 0], // Mounts on the right shaft extension
  entryDirection: "right",
  travelDistance: 2.8,
  sparkColor: "#F59E0B",
  sparkCount: 18,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [3.2, 4.5, -2.4],
    rotationImpulse: [4.2, 2.8, 3.5],
    sparkOrigin: [0.48, 1.55, -0.22],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const k = getPressTier2Kinematics(localFrame, isRunning, rpm, isBroken);

    // Motor position relative to socket [0.48, 1.85, 0]:
    // Socket is at Y = 1.85, Z = 0
    // Motor sits below and slightly behind at local Y = -0.55 (world 1.30), local Z = -0.26
    const motorLocY = -0.55;
    const motorLocZ = -0.26;

    // Flywheel 40cm diameter = radius 0.20m
    const flywheelRadius = 0.20;

    return (
      <group position={[0, 0, 0]}>
        {/* ========================================================= */}
        {/* HEAVY CAST-STEEL FLYWHEEL (40cm diameter = 0.20m radius)  */}
        {/* Rotates around X-axis with flywheelAngle                  */}
        {/* ========================================================= */}
        <group position={[0.04, 0, 0]} rotation={[k.flywheelAngle, 0, 0]}>
          {/* Central Keyed Hub Collar */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.10, 24]} />
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </mesh>

          {/* Shaft Keyway & Split Clamp Hex Bolt */}
          <mesh position={[0, 0.05, 0.03]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>

          {/* Heavy Cast-Steel Outer Inertia Rim (Radius 0.20m, width 0.08m) */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[flywheelRadius, flywheelRadius, 0.08, 36]} />
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </mesh>

          {/* Dual Polished Brass V-Belt Pulley Grooves machined into Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.015, 0, 0]}>
            <torusGeometry args={[flywheelRadius + 0.003, 0.012, 16, 36]} />
            <meshStandardMaterial {...MAT_CAST_BRONZE} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.015, 0, 0]}>
            <torusGeometry args={[flywheelRadius + 0.003, 0.012, 16, 36]} />
            <meshStandardMaterial {...MAT_CAST_BRONZE} />
          </mesh>

          {/* 5 Elliptical Spokes connecting Hub to Rim */}
          {[0, 1, 2, 3, 4].map((idx) => {
            const spokeAngle = (idx * Math.PI * 2) / 5;
            return (
              <group key={idx} rotation={[spokeAngle, 0, 0]}>
                <mesh position={[0, flywheelRadius * 0.55, 0]}>
                  <boxGeometry args={[0.035, flywheelRadius * 0.70, 0.024]} />
                  <meshStandardMaterial {...MAT_CAST_STEEL} />
                </mesh>
              </group>
            );
          })}

          {/* Heavy Integrated Counterweight Segment in Rim */}
          <group position={[0, flywheelRadius * 0.65, 0]}>
            <RoundedBox args={[0.075, 0.12, 0.16]} radius={0.02} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial {...MAT_CAST_STEEL} />
            </RoundedBox>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.08, 16]} />
              <meshStandardMaterial {...MAT_CAST_BRONZE} />
            </mesh>
          </group>
        </group>

        {/* ========================================================= */}
        {/* ELECTRIC INDUCTION MOTOR & MOUNTING BRACKET               */}
        {/* ========================================================= */}
        <group position={[0, motorLocY, motorLocZ]}>
          {/* Slotted Steel Motor Mount Plate with Tensioner Jack-Screws */}
          <RoundedBox args={[0.26, 0.03, 0.32]} radius={0.008} smoothness={4} position={[0, -0.12, 0]}>
            <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
          </RoundedBox>
          {[-0.08, 0.08].map((mx, i) =>
            [-0.10, 0.10].map((mz, j) => (
              <mesh key={`${i}-${j}`} position={[mx, -0.10, mz]}>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))
          )}

          {/* Finned Squirrel-Cage Motor Housing Body */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, 0.22, 24]} />
            <meshStandardMaterial {...MAT_CHASSIS_DARK} />
          </mesh>

          {/* 8 Radial Cooling Fins along Stator */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((finIdx) => {
            const fAngle = (finIdx * Math.PI) / 4;
            return (
              <mesh
                key={finIdx}
                rotation={[fAngle, 0, 0]}
                position={[0, Math.cos(fAngle) * 0.098, Math.sin(fAngle) * 0.098]}
              >
                <boxGeometry args={[0.20, 0.016, 0.012]} />
                <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
              </mesh>
            );
          })}

          {/* Top Electrical Conduit Junction Box */}
          <group position={[0, 0.11, 0]}>
            <RoundedBox args={[0.10, 0.05, 0.09]} radius={0.01} smoothness={4}>
              <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
            </RoundedBox>
            {/* High Voltage Danger Warning Badge */}
            <mesh position={[0, 0, 0.046]}>
              <planeGeometry args={[0.06, 0.03]} />
              <meshStandardMaterial color="#EAB308" roughness={0.4} />
            </mesh>
          </group>

          {/* Rear Motor Fan Shroud */}
          <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.092, 0.092, 0.04, 20]} />
            <meshStandardMaterial {...MAT_SLOT_RECESS} />
          </mesh>

          {/* Motor Output Shaft & Small Dual-Groove Brass Drive Pulley */}
          <group position={[0.12, 0, 0]} rotation={[k.motorAngle, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.05, 16]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Dual Brass Pulley */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0.015, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.045, 24]} />
              <meshStandardMaterial {...MAT_CAST_BRONZE} />
            </mesh>
          </group>
        </group>

        {/* ========================================================= */}
        {/* DUAL INDUSTRIAL V-BELTS                                   */}
        {/* Connecting motor pulley to flywheel rim                   */}
        {/* ========================================================= */}
        {!k.isBurst ? (
          <group position={[0.04, 0, 0]}>
            {/* Belt span calculated between flywheel (0, 0) and motor (motorLocY, motorLocZ) */}
            {[-0.015, 0.015].map((bx, bIdx) => {
              const dy = motorLocY;
              const dz = motorLocZ;
              const length = Math.sqrt(dy * dy + dz * dz);
              const beltTilt = Math.atan2(dz, dy);
              return (
                <group key={bIdx} position={[bx, 0, 0]}>
                  {/* Front Tight Span */}
                  <mesh
                    position={[0, dy / 2 + 0.08, dz / 2 - 0.03]}
                    rotation={[-beltTilt, 0, 0]}
                  >
                    <boxGeometry args={[0.016, length * 0.88, 0.014]} />
                    <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                  </mesh>
                  {/* Rear Slack Span */}
                  <mesh
                    position={[0, dy / 2 - 0.08, dz / 2 + 0.03]}
                    rotation={[-beltTilt, 0, 0]}
                  >
                    <boxGeometry args={[0.016, length * 0.88, 0.014]} />
                    <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                  </mesh>
                </group>
              );
            })}
          </group>
        ) : (
          /* Catastrophic Snapped V-Belt Fragments (Debris stays >= 0.630) */
          <group position={[0.04, 0, 0]}>
            {/* Snapped Belt Whipping Fragment 1 */}
            <mesh position={[0.02, motorLocY + 0.18, motorLocZ - 0.08]} rotation={[0.8, 0.4, 0.3]}>
              <boxGeometry args={[0.016, 0.22, 0.014]} />
              <meshStandardMaterial {...MAT_MATTE_RUBBER} />
            </mesh>
            {/* Snapped Belt Whipping Fragment 2 */}
            <mesh position={[-0.02, motorLocY + 0.06, motorLocZ + 0.12]} rotation={[-0.6, -0.3, -0.2]}>
              <boxGeometry args={[0.016, 0.18, 0.014]} />
              <meshStandardMaterial {...MAT_MATTE_RUBBER} />
            </mesh>
          </group>
        )}
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): TOOLHEAD RECIPROCATING RAM & CARBIDE PUNCH DIE
// Toolhead pointing vertically DOWN along Y-axis into specimen.
// TDC resting bottom face at localFrame 150: Y = 1.050 (32 cm air gap above 0.730).
// ============================================================================
const ModuleRamToolhead: ModularPartSpec = {
  id: "press_t2_ram_punch",
  name: "Reciprocating Ram Slide Block & Solid Tungsten Carbide Punch Die",
  assemblyOrder: 4,
  snapFrame: 60,
  targetSocket: [0, 1.050, 0], // At TDC (frame 150), bottom face of punch die is at world Y = 1.050!
  entryDirection: "top",
  travelDistance: 2.6,
  sparkColor: "#10B981",
  sparkCount: 20,
  fracture: {
    breakFrame: 234,
    mode: "shear_and_tilt",
    impulse: [0.8, 1.5, -0.5],
    rotationImpulse: [0.6, 0.2, -0.8],
    sparkOrigin: [0, 0.730, 0], // Contact throat shear sparks
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const k = getPressTier2Kinematics(localFrame, isRunning, rpm, isBroken);

    // Dynamic vertical stroke translation:
    // At TDC (localFrame 150): k.ramLocalY = 0 -> bottom face of punch is at world Y = 1.050.
    // At BDC (strike): k.ramLocalY = -0.320 -> bottom face of punch is at world Y = 0.730.
    // All debris stays at world Y >= 0.730 > 0.630.
    return (
      <group position={[0, k.ramLocalY, 0]}>
        {/* ========================================================= */}
        {/* RECIPROCATING RAM SLIDE BLOCK BODY                        */}
        {/* Height 0.42m, seated above die holder                     */}
        {/* ========================================================= */}
        <group position={[0, 0.32, 0]}>
          {/* Main Forged Cast Steel Slide Block (Width: 0.38m, Depth: 0.36m) */}
          <RoundedBox args={[0.38, 0.40, 0.36]} radius={0.024} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial {...MAT_CHASSIS_STEEL} />
          </RoundedBox>

          {/* Prismatic Dovetail Guide Wings on Left & Right Sides */}
          {[-0.19, 0.19].map((wx, i) => (
            <mesh key={i} position={[wx, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.028, 0.36, 0.26]} />
              <meshStandardMaterial {...MAT_CHROME_STEEL} />
            </mesh>
          ))}

          {/* Front Face Safety Hazard Chevron Stripes */}
          <mesh position={[0, 0.06, 0.182]}>
            <planeGeometry args={[0.32, 0.08]} />
            <meshStandardMaterial {...MAT_SAFETY_RED} />
          </mesh>
          <mesh position={[0, -0.06, 0.182]}>
            <planeGeometry args={[0.32, 0.08]} />
            <meshStandardMaterial color="#EAB308" roughness={0.4} />
          </mesh>

          {/* Shut-Height Ram Adjusting Micrometer Collar */}
          <group position={[0, 0.18, 0]}>
            <mesh>
              <cylinderGeometry args={[0.075, 0.075, 0.05, 24]} />
              <meshStandardMaterial {...MAT_CAST_BRONZE} />
            </mesh>
            {/* Graduated Vernier Micrometer Markings */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <mesh key={idx} position={[Math.cos(rad) * 0.076, 0, Math.sin(rad) * 0.076]}>
                  <boxGeometry args={[0.003, 0.03, 0.003]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              );
            })}
          </group>

          {/* Wrist Pin Journal Crosshead Boss */}
          <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 0.28, 20]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        </group>

        {/* ========================================================= */}
        {/* UPPER PUNCH DIE HOLDER & TOOL STEEL SHANK                 */}
        {/* ========================================================= */}
        {/* Flanged Die Holder Shoe (Y: 0.08 to 0.12 relative to socket) */}
        <mesh position={[0, 0.10, 0]}>
          <cylinderGeometry args={[0.13, 0.14, 0.04, 32]} />
          <meshStandardMaterial {...MAT_CHASSIS_DARK} />
        </mesh>

        {/* 4 Upper Clamp Studs Securing Punch Shank */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <mesh key={i} position={[Math.cos(ang) * 0.095, 0.11, Math.sin(ang) * 0.095]}>
            <cylinderGeometry args={[0.010, 0.010, 0.025, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        ))}

        {/* Ground Mirror-Chrome Punch Shank (Y: 0.03 to 0.08 relative to socket) */}
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 24]} />
          <meshStandardMaterial {...MAT_MIRROR_CHROME} />
        </mesh>

        {/* High-Temp Brazed Brass Cushion Ring */}
        <mesh position={[0, 0.026, 0]}>
          <cylinderGeometry args={[0.068, 0.068, 0.008, 24]} />
          <meshStandardMaterial {...MAT_CAST_BRONZE} />
        </mesh>

        {/* ========================================================= */}
        {/* SOLID HARDENED TUNGSTEN CARBIDE PUNCH DIE                 */}
        {/* Points vertically DOWN along Y-axis into specimen         */}
        {/* Bottom face is STRICTLY at local Y = 0 (world Y = 1.050 at TDC!) */}
        {/* Punch body extends from Y = 0 up to Y = 0.022            */}
        {/* ========================================================= */}
        <group position={[0, 0.011, 0]}>
          {/* Main Cylindrical Carbide Punch Body */}
          <mesh>
            <cylinderGeometry args={[0.052, 0.054, 0.022, 28]} />
            <meshStandardMaterial {...MAT_CARBIDE_DIE} />
          </mesh>
          {/* Beveled Chamfer Cutting Edge (Bottom face at Y = -0.011 relative to group = local Y = 0) */}
          <mesh position={[0, -0.009, 0]}>
            <cylinderGeometry args={[0.050, 0.052, 0.004, 28]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// FULL MACHINE ASSEMBLY SPECIFICATION
// ============================================================================
export const PressTier2Spec: MachineAssemblySpec = {
  id: "press_tier2_electric",
  name: "Tier 2: $100 Motorized Eccentric Flywheel Punch Press",
  tier: 2,
  strikeFrames: [127, 136, 145, 154, 163, 171, 180, 189, 198, 207],
  strikeIntensity: 0.045,
  modules: [
    ModuleBase,
    ModuleInternalCrank,
    ModuleUprightFrame,
    ModuleFlywheelMotor,
    ModuleRamToolhead,
  ],
};

export default PressTier2Spec;
