import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 1: $10 MANUAL FLYWHEEL SCREW PRESS (PressTier1_Manual.tsx)
 * ============================================================================
 * Operating under remotion_studio/crew/3d_modeler.md and AssemblyContract.ts.
 *
 * Golden Inside-Out Modular Assembly Sequence:
 * - Order 0 (Frame 0f):  Base - Heavy cast-iron C-frame anvil base with dual
 *                        clamping screws (#1E293B, roughness 0.75, metalness 0.40).
 *                        Lower anvil die top is strictly at Y = 0.630, X = 0, Z = 0.
 * - Order 1 (Frame 20f): Internal Core - Solid bronze lead screw shaft with Acme
 *                        threads (#D97706 bronze, roughness 0.15, metalness 0.95).
 *                        MUST arrive strictly BEFORE outer casing/gantry!
 * - Order 2 (Frame 40f): Casing - Outer arched cast-iron gantry & guide bushing
 *                        that encloses the lead screw (#334155 steel, roughness 0.55).
 * - Order 3 (Frame 60f): Drive - Top dual-ball balanced flywheel handle with turned
 *                        ash hardwood spinner knobs (#854D0E wood / #D97706 brass).
 * - Order 4 (Frame 75f): Toolhead - Hardened tool-steel punch die (#CBD5E1 machined steel),
 *                        pointing vertically DOWN along Y-axis into specimen.
 *                        TDC resting bottom face at localFrame 150: Y = 1.050
 *                        (giving 32 cm air gap above specimen top Y = 0.770).
 *
 * Coaxial Vertical Alignment:
 * - Toolhead punch die, Acme lead screw, guide bushing, and lower anvil bolster die
 *   all share the exact same vertical centerline: STRICTLY X = 0, Z = 0.
 *
 * Kinematics & 4-Phase Overload:
 * - 0..69f:   Staggered assembly snap.
 * - 70..149f: Manual spin-up / handle rotation.
 * - 150..224f: Full-power rhythmic pressing cycle (handle spins 720 deg, screw
 *             descends to Y=0.730, presses specimen, recoils to Y=1.050).
 * - 225..244f: Deceleration / torque bog-down from 100% to 0% RPM as hard obstacle is hit.
 * - 245..264f: Contact stall at Y=0.730 with micro-shudder (0.5mm to 3mm high-frequency shudder,
 *             NO motionless pause!).
 * - 265..289f: Fracture! Screw threads shear off, handle snaps and tilts, fractured parts
 *             stay strictly at Y >= 0.630 (no sinking below floor!).
 * ============================================================================
 */

// PBR Material Presets
const MAT_CAST_IRON = { color: "#1E293B", roughness: 0.75, metalness: 0.40 };
const MAT_FRAME_STEEL = { color: "#334155", roughness: 0.55, metalness: 0.65 };
const MAT_RAW_TOOL_STEEL = { color: "#64748B", roughness: 0.50, metalness: 0.85 };
const MAT_CRUDE_CARBON_STEEL = { color: "#475569", roughness: 0.45, metalness: 0.75 };
const MAT_MACHINED_STEEL = { color: "#CBD5E1", roughness: 0.15, metalness: 0.92 };
const MAT_POLISHED_BRONZE = { color: "#D97706", roughness: 0.15, metalness: 0.95 };
const MAT_POLISHED_BRASS = { color: "#D97706", roughness: 0.15, metalness: 0.95 };
const MAT_HARDWOOD_ASH = { color: "#854D0E", roughness: 0.60, metalness: 0.05 };
const MAT_DARK_RECESS = { color: "#0F172A", roughness: 0.90, metalness: 0.20 };
const MAT_SHEARED_THREAD = { color: "#F59E0B", roughness: 0.35, metalness: 0.90 };

export interface PressTier1Kinematics {
  flywheelAngle: number;
  strokeDeltaY: number; // 0 at TDC (Y = 1.050), -0.320 at BDC (touching specimen at Y = 0.730)
  dieY: number;         // 1.050 at TDC, 0.730 at BDC
  impactShake: number;  // Micro-shudder / impact shake
  stallProgress: number; // 0..1 during stall
  isBroken: boolean;
}

/**
 * Continuous 4-phase physical kinematic model for Tier 1 Manual Screw Press.
 */
export function getPressTier1Kinematics(
  localFrame: number,
  isRunning: boolean,
  isBroken: boolean
): PressTier1Kinematics {
  const broken = isBroken || localFrame >= 234;
  const isStall = isRunning && localFrame >= 225 && localFrame < 234;
  const isDecel = isRunning && localFrame >= 213 && localFrame < 225;
  const isOperating = isRunning && localFrame >= 123 && localFrame < 213;
  const isSpinUp = isRunning && localFrame >= 63 && localFrame < 123;

  let flywheelAngle = 0;
  let strokeDeltaY = 0; // relative to TDC (Y = 1.050)
  let dieY = 1.050;
  let impactShake = 0;
  let stallProgress = 0;

  if (broken) {
    // Phase 4 Catastrophic Rupture (234..319)
    // Screw threads sheared, handle snapped, die rests at stall contact Y = 0.730
    flywheelAngle = Math.PI * 4.5;
    strokeDeltaY = -0.320; // At Y = 0.730
    dieY = 0.730;
    impactShake = 0;
    stallProgress = 1;
  } else if (isStall) {
    // Phase 3 Resonant Contact Stall (225..233)
    // Contact stall at Y = 0.730 with micro-shudder (0.5mm to 3mm high-frequency shudder, NO motionless pause!)
    stallProgress = (localFrame - 225) / 8;
    const amp = 0.0005 + stallProgress * 0.0025; // 0.5mm to 3.0mm
    const shudder = Math.sin(localFrame * 45) * amp;
    dieY = 0.730 + shudder;
    strokeDeltaY = dieY - 1.050;
    impactShake = shudder;
    // Flywheel is torqued to maximum mechanical strain against obstacle
    flywheelAngle = Math.PI * 4.0 + Math.sin(localFrame * 45) * 0.02;
  } else if (isDecel) {
    // Phase 2 Deceleration / Torque Bog-Down (213..224)
    // RPM bogs down from 100% to 0% as hard obstacle is struck
    const pDecel = (localFrame - 213) / 11;
    const t = Math.min(1, Math.pow(pDecel, 0.8));
    dieY = 1.050 - 0.320 * t;
    strokeDeltaY = dieY - 1.050;
    flywheelAngle = pDecel * Math.PI * 4.0;
  } else if (isOperating) {
    // Phase 1 Full-power rhythmic pressing cycle (123..212)
    // 4 pressing strokes of 22 frames each (123..144, 145..166, 167..188, 189..210)
    // Strikes at frames: [134, 156, 178, 200]
    // At frames 211..212, parked at TDC Y = 1.050 (0 discontinuity into frame 213 decel!)
    if (localFrame >= 211) {
      dieY = 1.050;
      strokeDeltaY = 0;
      flywheelAngle = 0;
    } else {
      const cycleFrame = (localFrame - 123) % 22;
      if (cycleFrame < 10) {
        // Downward stroke: flywheel spins 720 deg (4*PI), screw descends to Y=0.730
        const t = cycleFrame / 9;
        const easeDown = t * t; // quadratic plunge
        strokeDeltaY = -0.320 * easeDown;
        dieY = 1.050 + strokeDeltaY;
        flywheelAngle = easeDown * (Math.PI * 4); // 720 deg rotation
      } else if (cycleFrame < 13) {
        // Strike contact & dwell at Y = 0.730 (impact frames: 134, 156, 178, 200)
        strokeDeltaY = -0.320;
        dieY = 0.730;
        flywheelAngle = Math.PI * 4;
        impactShake = 0.003;
      } else {
        // Recoil stroke: flywheel reverses 720 deg, screw lifts back to TDC Y = 1.050
        const t = (cycleFrame - 13) / 8;
        const easeUp = 1 - Math.pow(1 - t, 2);
        strokeDeltaY = -0.320 * (1 - easeUp);
        dieY = 1.050 + strokeDeltaY;
        flywheelAngle = (1 - easeUp) * (Math.PI * 4);
      }
    }
  } else if (isSpinUp) {
    // Manual spin-up / handle rotation (63..122f)
    // Flywheel spins up, toolhead parked safely at TDC Y = 1.050
    dieY = 1.050;
    strokeDeltaY = 0;
    const pSpin = (localFrame - 63) / 59;
    flywheelAngle = Math.sin(pSpin * Math.PI * 2) * (Math.PI * 2);
  } else {
    // Staggered assembly snap (0..62)
    dieY = 1.050;
    strokeDeltaY = 0;
    flywheelAngle = 0;
  }

  return {
    flywheelAngle,
    strokeDeltaY,
    dieY,
    impactShake,
    stallProgress,
    isBroken: broken,
  };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): HEAVY CAST-IRON C-FRAME ANVIL BASE & CLAMPING SCREWS
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "press_t1_base",
  name: "Heavy Cast-Iron C-Frame Anvil Base with Dual Clamping Screws",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#CBD5E1",
  sparkCount: 14,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Cast-Iron Workbench Plinth Bed Plate */}
      <RoundedBox args={[0.82, 0.08, 0.72]} radius={0.02} smoothness={4} position={[0, 0.04, 0]}>
        <meshStandardMaterial {...MAT_CAST_IRON} />
      </RoundedBox>

      {/* 4 Corner Anchor Bolt Bosses & Machined Zinc Hex Bolts */}
      {[
        [-0.35, -0.29],
        [0.35, -0.29],
        [-0.35, 0.29],
        [0.35, 0.29],
      ].map(([bx, bz], idx) => (
        <group key={`plinth_bolt_${idx}`} position={[bx, 0.08, bz]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.024, 0.028, 0.02, 16]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
          <mesh position={[0, 0.022, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.022, 6]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>
      ))}

      {/* Plinth T-Slot Center Guide Channel */}
      <mesh position={[0, 0.081, 0]}>
        <boxGeometry args={[0.76, 0.005, 0.06]} />
        <meshStandardMaterial {...MAT_DARK_RECESS} />
      </mesh>

      {/* 2. Central Anvil Pedestal Riser Column (Reaching up to die bolster) */}
      <group position={[0, 0, 0]}>
        {/* Flanged Pedestal Base */}
        <RoundedBox args={[0.46, 0.10, 0.46]} radius={0.02} smoothness={4} position={[0, 0.13, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Anvil Riser Monolith Column */}
        <RoundedBox args={[0.40, 0.38, 0.40]} radius={0.025} smoothness={4} position={[0, 0.37, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Lateral Structural Strengthening Gussets */}
        {[-0.20, 0.20].map((gx, idx) => (
          <mesh
            key={`pedestal_gusset_${idx}`}
            position={[gx, 0.28, 0]}
            rotation={[0, 0, (gx > 0 ? 1 : -1) * 0.32]}
          >
            <boxGeometry args={[0.06, 0.24, 0.32]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
        ))}

        {/* Bolster Table Transition Block */}
        <RoundedBox args={[0.36, 0.06, 0.36]} radius={0.015} smoothness={4} position={[0, 0.58, 0]}>
          <meshStandardMaterial {...MAT_FRAME_STEEL} />
        </RoundedBox>

        {/* Lower Anvil Die Bolster Block */}
        <RoundedBox args={[0.32, 0.024, 0.32]} radius={0.01} smoothness={4} position={[0, 0.612, 0]}>
          <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
        </RoundedBox>

        {/* Hardened Ground Tool-Steel Lower Anvil Die (Die top face strictly at Y = 0.630, X = 0, Z = 0) */}
        <group position={[0, 0.620, 0]}>
          {/* Circular Ground Die Strike Pad: height 0.020, center 0.620 => top is strictly Y = 0.630 */}
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.020, 32]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Ground Perimeter Bevel */}
          <mesh position={[0, 0.007, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.006, 32]} />
            <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
          </mesh>
          {/* Die Locator Dowel Pins */}
          {[-0.08, 0.08].map((px, idx) => (
            <mesh key={`dowel_pin_${idx}`} position={[px, 0.005, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.014, 16]} />
              <meshStandardMaterial {...MAT_DARK_RECESS} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Dual Workbench Table Clamping Screws (Left & Right Sides) */}
      {[
        { x: -0.40, rotZ: 0 },
        { x: 0.40, rotZ: Math.PI },
      ].map((clamp, idx) => (
        <group key={`table_clamp_${idx}`} position={[clamp.x, 0.04, -0.10]}>
          {/* Clamp Lower Cantilever Arm */}
          <RoundedBox
            args={[0.07, 0.16, 0.12]}
            radius={0.012}
            smoothness={4}
            position={[clamp.x > 0 ? 0.02 : -0.02, -0.06, 0]}
          >
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Clamp Under-Table Return Jaw */}
          <RoundedBox
            args={[0.12, 0.04, 0.10]}
            radius={0.01}
            smoothness={4}
            position={[clamp.x > 0 ? -0.04 : 0.04, -0.14, 0]}
          >
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Acme Clamping Screw Shaft */}
          <mesh position={[clamp.x > 0 ? -0.04 : 0.04, -0.08, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.16, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Swivel Clamp Foot Pad */}
          <mesh position={[clamp.x > 0 ? -0.04 : 0.04, -0.01, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.012, 16]} />
            <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
          </mesh>
          {/* Clamping Tommy-Bar Cross Handle */}
          <group position={[clamp.x > 0 ? -0.04 : 0.04, -0.17, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.007, 0.007, 0.16, 12]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {[-0.08, 0.08].map((bx, bIdx) => (
              <mesh key={`clamp_knob_${bIdx}`} position={[bx, 0, 0]}>
                <sphereGeometry args={[0.011, 12, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  ),
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): INTERNAL SOLID BRONZE LEAD SCREW SHAFT
// ============================================================================
// Inside-Out Law: MUST arrive BEFORE outer arched gantry/collar!
const ModuleLeadScrew: ModularPartSpec = {
  id: "press_t1_lead_screw",
  name: "Internal Solid Bronze Lead Screw Shaft with Acme Threads",
  assemblyOrder: 1,
  snapFrame: 15,
  entryDirection: "top",
  travelDistance: 3.5,
  targetSocket: [0, 1.25, 0],
  sparkColor: "#D97706",
  sparkCount: 16,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [1.8, 3.2, -1.2],
    rotationImpulse: [1.5, 0.8, -1.2],
    sparkOrigin: [0, 1.25, 0],
    sparkColor: "#F59E0B",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { flywheelAngle, strokeDeltaY, isBroken: broken } = getPressTier1Kinematics(
      localFrame,
      isRunning,
      isBroken
    );

    return (
      <group position={[0, strokeDeltaY, 0]} rotation={[0, flywheelAngle, 0]}>
        {/* Coaxial Centerline: strictly X = 0, Z = 0 */}
        {/* 1. Solid Heavy Bronze Lead Screw Core Shaft */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.74, 32]} />
          <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
        </mesh>

        {/* 2. Acme Trapezoidal Square Thread Ridges (18 stacked Bronze Annular Ribs) */}
        {Array.from({ length: 18 }).map((_, idx) => {
          const ribY = -0.16 + idx * 0.026;
          // If broken, threads near the shear plane (ribs 6..10) exhibit sheared damage
          const isShearZone = broken && idx >= 7 && idx <= 10;
          return (
            <group
              key={`acme_thread_${idx}`}
              position={[0, ribY, 0]}
              rotation={isShearZone ? [0.12, 0, 0.08] : [0, 0, 0]}
            >
              <mesh>
                <cylinderGeometry args={[0.054, 0.054, 0.013, 32]} />
                <meshStandardMaterial
                  {...(isShearZone ? MAT_SHEARED_THREAD : MAT_POLISHED_BRONZE)}
                />
              </mesh>
              {/* Helical Thread Lead Chamfer Accent */}
              <mesh position={[0, 0.007, 0]}>
                <cylinderGeometry args={[0.049, 0.054, 0.004, 32]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          );
        })}

        {/* Spiral Oil Groove Channel Indicator */}
        <mesh position={[0, 0.06, 0.043]}>
          <boxGeometry args={[0.005, 0.44, 0.004]} />
          <meshStandardMaterial {...MAT_DARK_RECESS} />
        </mesh>

        {/* 3. Lower Thrust Pivot Nose & Ball Joint (Seats into Toolhead Die Thrust Cup) */}
        <group position={[0, -0.27, 0]}>
          {/* Thrust Collar Flange */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.056, 0.056, 0.024, 32]} />
            <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
          </mesh>
          {/* Spherical Ground Ball Nose Tip */}
          <mesh position={[0, -0.01, 0]}>
            <sphereGeometry args={[0.038, 24, 24]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* 4. Upper Drive Journal & Keyed Flywheel Taper Section */}
        <group position={[0, 0.40, 0]}>
          {/* Upper Smooth Bearing Journal */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.10, 32]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Tapered Keyed Flywheel Socket Section */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.06, 24]} />
            <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
          </mesh>
          {/* Drive Keyway Slot Bar */}
          <mesh position={[0.022, 0.04, 0]}>
            <boxGeometry args={[0.008, 0.05, 0.010]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* If broken, sheared bronze metal filings/splinters around collar */}
        {broken && (
          <group position={[0, 0, 0]}>
            {[-0.05, 0.03, 0.06].map((fx, idx) => (
              <mesh
                key={`thread_shear_burr_${idx}`}
                position={[fx, 0.02, (idx % 2 === 0 ? 0.04 : -0.04)]}
                rotation={[0.3, 0.5, 0.2]}
              >
                <boxGeometry args={[0.012, 0.006, 0.016]} />
                <meshStandardMaterial {...MAT_SHEARED_THREAD} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): OUTER ARCHED CAST-IRON GANTRY & GUIDE BUSHING
// ============================================================================
// Encloses Order 1! Slips down over lead screw shaft.
const ModuleGantry: ModularPartSpec = {
  id: "press_t1_gantry",
  name: "Outer Arched Cast-Iron Gantry & Precision Guide Bushing",
  assemblyOrder: 2,
  snapFrame: 30,
  entryDirection: "top",
  travelDistance: 3.5,
  targetSocket: [0, 0.90, 0],
  sparkColor: "#334155",
  sparkCount: 18,
  fracture: {
    breakFrame: 234,
    mode: "shudder_and_crack",
    impulse: [0, 0, 0],
    rotationImpulse: [0, 0, 0],
    sparkOrigin: [0, 1.25, -0.15],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    const broken = isBroken || localFrame >= 234;

    return (
      <group position={[0, 0, 0]}>
        {/* 0. Rear Cast-Iron C-Frame Backbone Upright Tower (Mounted at Z = -0.28, Y from 0 to 0.90) */}
        <group position={[0, -0.90, -0.28]}>
          {/* Tower Foot Flange */}
          <RoundedBox args={[0.42, 0.12, 0.24]} radius={0.02} smoothness={4} position={[0, 0.14, 0]}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Massive Main Spine Column rising to Y = 0.90 */}
          <RoundedBox args={[0.34, 0.68, 0.22]} radius={0.025} smoothness={4} position={[0, 0.54, 0]}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Left & Right Tower Gusset Wings */}
          {[-0.17, 0.17].map((tx, idx) => (
            <mesh
              key={`tower_gusset_${idx}`}
              position={[tx, 0.52, 0.04]}
              rotation={[(tx > 0 ? 1 : -1) * 0.08, 0, 0]}
            >
              <boxGeometry args={[0.05, 0.58, 0.14]} />
              <meshStandardMaterial {...MAT_CAST_IRON} />
            </mesh>
          ))}
          {/* Top Mating Flange Table at Y = 0.90 (where Module 2 Gantry bolts) */}
          <RoundedBox args={[0.38, 0.06, 0.24]} radius={0.015} smoothness={4} position={[0, 0.88, 0]}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>
          {/* Heavy Gantry Anchor Studs */}
          {[
            [-0.13, -0.06],
            [0.13, -0.06],
            [-0.13, 0.06],
            [0.13, 0.06],
          ].map(([sx, sz], idx) => (
            <group key={`gantry_stud_${idx}`} position={[sx, 0.91, sz]}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.025, 6]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 1. Rear Base Mounting Foot (Flanges onto Base Backbone at Z = -0.28) */}
        <group position={[0, 0.02, -0.28]}>
          <RoundedBox args={[0.36, 0.05, 0.22]} radius={0.015} smoothness={4}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>
          {/* Mating Flange Hex Bolts */}
          {[
            [-0.13, -0.06],
            [0.13, -0.06],
            [-0.13, 0.06],
            [0.13, 0.06],
          ].map(([bx, bz], idx) => (
            <mesh key={`flange_bolt_${idx}`} position={[bx, 0.03, bz]}>
              <cylinderGeometry args={[0.014, 0.014, 0.022, 6]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}
        </group>

        {/* 2. Twin Forged Cast-Iron Arch Arms (Arching forward to X = 0, Z = 0) */}
        {[-0.14, 0.14].map((ax, idx) => (
          <group key={`arch_arm_${idx}`} position={[ax, 0.16, -0.14]}>
            {/* Arched Diagonal Strut Beam */}
            <mesh rotation={[-0.60, (ax > 0 ? -1 : 1) * 0.14, 0]}>
              <boxGeometry args={[0.09, 0.38, 0.14]} />
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </mesh>
            {/* Structural Stiffener Rib Flange */}
            <mesh
              position={[ax > 0 ? 0.045 : -0.045, 0, 0]}
              rotation={[-0.60, (ax > 0 ? -1 : 1) * 0.14, 0]}
            >
              <boxGeometry args={[0.02, 0.40, 0.16]} />
              <meshStandardMaterial {...MAT_CAST_IRON} />
            </mesh>
          </group>
        ))}

        {/* Central Arch Crown Monolith Bridge */}
        <RoundedBox args={[0.38, 0.16, 0.30]} radius={0.025} smoothness={4} position={[0, 0.35, -0.06]}>
          <meshStandardMaterial {...MAT_FRAME_STEEL} />
        </RoundedBox>

        {/* 3. Central Guide Bushing Sleeve Collar (Strictly X = 0, Z = 0) */}
        {/* Encloses Order 1 Acme Lead Screw */}
        <group position={[0, 0.35, 0]}>
          {/* Outer Cast-Iron Sleeve Boss */}
          <mesh>
            <cylinderGeometry args={[0.088, 0.094, 0.26, 32]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>

          {/* Internal Replaceable Solid Bronze Guide Nut / Bushing */}
          <mesh>
            <cylinderGeometry args={[0.058, 0.058, 0.28, 32]} />
            <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
          </mesh>

          {/* Top Bronze Bushing Retaining Flange */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.022, 32]} />
            <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
          </mesh>

          {/* 4 Bushing Retaining Hex Bolts */}
          {[
            [0.075, 0],
            [-0.075, 0],
            [0, 0.075],
            [0, -0.075],
          ].map(([hx, hz], idx) => (
            <mesh key={`bushing_bolt_${idx}`} position={[hx, 0.155, hz]}>
              <cylinderGeometry args={[0.009, 0.009, 0.018, 6]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}

          {/* Brass Lubrication Grease Cup / Ball Oiler with Flip Cap */}
          <group position={[0.07, 0.17, 0.04]}>
            <mesh>
              <cylinderGeometry args={[0.014, 0.010, 0.04, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.022, 0]}>
              <sphereGeometry args={[0.014, 16, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        </group>

        {/* 4. Raised Vintage Cast Nameplate Badge on Front Arch */}
        <group position={[0, 0.34, 0.13]}>
          <mesh>
            <boxGeometry args={[0.22, 0.065, 0.008]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          {/* Cast Raised Letters Border */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.20, 0.05, 0.004]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
        </group>

        {/* 5. Toolhead Anti-Rotation Slide Gib Ways in Throat (X = ±0.11) */}
        {[-0.11, 0.11].map((gx, idx) => (
          <group key={`slide_gib_${idx}`} position={[gx, 0.14, 0]}>
            {/* Ground Steel Dovetail Guide Strip */}
            <mesh>
              <boxGeometry args={[0.018, 0.28, 0.05]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Gib Adjustment Set-Screws */}
            {[-0.08, 0, 0.08].map((sy, sIdx) => (
              <mesh
                key={`gib_screw_${sIdx}`}
                position={[gx > 0 ? 0.012 : -0.012, sy, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.005, 0.005, 0.010, 6]} />
                <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
              </mesh>
            ))}
          </group>
        ))}

        {/* If broken, gantry exhibits micro-fracture stress lines near arch apex */}
        {broken && (
          <group position={[0, 0.44, -0.08]}>
            <mesh rotation={[0.1, 0.2, 0.1]}>
              <boxGeometry args={[0.08, 0.006, 0.01]} />
              <meshStandardMaterial {...MAT_DARK_RECESS} />
            </mesh>
          </group>
        )}
      </group>
    );
  },
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): TOP DUAL-BALL BALANCED FLYWHEEL HANDLE
// ============================================================================
const ModuleFlywheel: ModularPartSpec = {
  id: "press_t1_flywheel",
  name: "Top Dual-Ball Balanced Flywheel Handle with Turned Ash Knobs",
  assemblyOrder: 3,
  snapFrame: 45,
  entryDirection: "top",
  travelDistance: 3.0,
  targetSocket: [0, 1.70, 0],
  sparkColor: "#D97706",
  sparkCount: 20,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [-2.2, 4.8, 1.8],
    rotationImpulse: [2.8, 4.5, -2.0],
    sparkOrigin: [0, 1.70, 0],
    sparkColor: "#F59E0B",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { flywheelAngle, strokeDeltaY, isBroken: broken } = getPressTier1Kinematics(
      localFrame,
      isRunning,
      isBroken
    );

    return (
      <group position={[0, strokeDeltaY, 0]} rotation={[0, flywheelAngle, 0]}>
        {/* Coaxial Centerline: Hub strictly X = 0, Z = 0 */}
        {/* 1. Heavy Central Polished Brass Flywheel Hub */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.072, 0.08, 32]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>
        {/* Beveled Hub Ring Accent */}
        <mesh position={[0, 0.038, 0]}>
          <cylinderGeometry args={[0.058, 0.065, 0.015, 32]} />
          <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
        </mesh>

        {/* 2. Top Retaining Castle Nut & Split Cotter Pin */}
        <group position={[0, 0.06, 0]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.034, 0.036, 6]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Transverse Cotter Pin */}
          <mesh position={[0, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 12]} />
            <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
          </mesh>
        </group>

        {/* 3. Forged Tapered Horizontal Crossbar (Symmetric along X, -0.42 to +0.42) */}
        {/* Left Arm (-X) */}
        <group rotation={broken ? [0.15, 0, -0.22] : [0, 0, 0]}>
          <mesh position={[-0.20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.028, 0.38, 20]} />
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </mesh>

          {/* Left Solid Brass Counterweight Inertia Sphere */}
          <group position={[-0.42, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 32, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Equatorial Calibration Ridge */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.077, 0.077, 0.014, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
            </mesh>
            {/* Vertical Spindle Mount Post */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.014, 0.016, 0.05, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Turned Ash Hardwood Spinner Handle Knob */}
            <group position={[0, 0.14, 0]}>
              {/* Ergonomic Lathe-Turned Grip Waist */}
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.020, 0.016, 0.09, 20]} />
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </mesh>
              {/* Spherical Rounded Top Knob */}
              <mesh position={[0, 0.09, 0]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </mesh>
              {/* Brass Top Retaining Washer & Cap Nut */}
              <mesh position={[0, 0.116, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Right Arm (+X) - If broken, shears violently and tilts downwards */}
        <group
          position={broken ? [0.03, -0.04, 0.02] : [0, 0, 0]}
          rotation={broken ? [0.25, 0.10, -0.35] : [0, 0, 0]}
        >
          <mesh position={[0.20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.028, 0.38, 20]} />
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </mesh>

          {/* Sheared Metal Root Texture if broken */}
          {broken && (
            <mesh position={[0.065, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial {...MAT_SHEARED_THREAD} />
            </mesh>
          )}

          {/* Right Solid Brass Counterweight Inertia Sphere */}
          <group position={[0.42, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 32, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Equatorial Calibration Ridge */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.077, 0.077, 0.014, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
            </mesh>
            {/* Vertical Spindle Mount Post */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.014, 0.016, 0.05, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Turned Ash Hardwood Spinner Handle Knob */}
            <group position={[0, 0.14, 0]}>
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.020, 0.016, 0.09, 20]} />
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </mesh>
              <mesh position={[0, 0.116, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): TOOLHEAD PRESS DIE (HARDENED PUNCH DIE)
// ============================================================================
// Pointing vertically DOWN along Y-axis into specimen.
// TDC resting bottom face at localFrame 150: strictly Y = 1.050.
const ModuleToolhead: ModularPartSpec = {
  id: "press_t1_toolhead",
  name: "Hardened Tool-Steel Punch Die & Thrust Bearing Guide",
  assemblyOrder: 4,
  snapFrame: 60,
  entryDirection: "bottom",
  travelDistance: 2.5,
  targetSocket: [0, 1.050, 0],
  sparkColor: "#CBD5E1",
  sparkCount: 16,
  fracture: {
    breakFrame: 234,
    mode: "shear_and_tilt",
    impulse: [0.6, 1.2, 0.4],
    rotationImpulse: [0.8, 0.3, -0.6],
    sparkOrigin: [0, 0.75, 0],
    sparkColor: "#CBD5E1",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { strokeDeltaY, impactShake, isBroken: broken } = getPressTier1Kinematics(
      localFrame,
      isRunning,
      isBroken
    );

    return (
      <group
        position={[0, strokeDeltaY + impactShake, 0]}
        rotation={broken ? [0.03, 0.01, -0.04] : [0, 0, 0]}
      >
        {/* Coaxial vertical alignment: Centerline strictly X = 0, Z = 0 */}
        {/* At TDC (strokeDeltaY = 0): bottom punch face is at local Y = 0.000 */}
        {/* Since targetSocket is [0, 1.050, 0], bottom face is strictly at world Y = 1.050! */}

        {/* 1. Upper Thrust Bearing Cup & Housing (Mates with lead screw ball nose) */}
        <group position={[0, 0.17, 0]}>
          {/* Spherical Cup Collar */}
          <RoundedBox args={[0.13, 0.07, 0.13]} radius={0.015} smoothness={4}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>
          {/* Bronze Spherical Cup Insert */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.03, 24]} />
            <meshStandardMaterial {...MAT_POLISHED_BRONZE} />
          </mesh>
          {/* Retaining Lip Collar */}
          <mesh position={[0, 0.038, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.012, 24]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* 2. Main Toolholder Ram Body (High-Carbon Forged Steel) */}
        <RoundedBox args={[0.18, 0.11, 0.18]} radius={0.018} smoothness={4} position={[0, 0.09, 0]}>
          <meshStandardMaterial {...MAT_CRUDE_CARBON_STEEL} />
        </RoundedBox>

        {/* Anti-Rotation Guide Wings (Slides in Gantry Gib Ways at X = ±0.11) */}
        {[-0.10, 0.10].map((wx, idx) => (
          <mesh key={`guide_wing_${idx}`} position={[wx, 0.09, 0]}>
            <boxGeometry args={[0.022, 0.095, 0.045]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        ))}

        {/* Weight-Relief Flute Recesses (Front and Back) */}
        {[-0.091, 0.091].map((fz, idx) => (
          <mesh key={`ram_flute_${idx}`} position={[0, 0.09, fz]}>
            <boxGeometry args={[0.10, 0.07, 0.006]} />
            <meshStandardMaterial {...MAT_DARK_RECESS} />
          </mesh>
        ))}

        {/* Transverse Tool Locking Drift Wedge & Key */}
        <group position={[0, 0.10, 0]}>
          <mesh>
            <boxGeometry args={[0.22, 0.024, 0.030]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          <mesh position={[0.115, 0, 0]}>
            <cylinderGeometry args={[0.011, 0.014, 0.015, 6]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* Maker's Inspection Stamp Brass Tag */}
        <mesh position={[0, 0.065, 0.091]}>
          <boxGeometry args={[0.08, 0.025, 0.004]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>

        {/* 3. Hardened Tool-Steel Punch Die Nose (Points DOWN along Y into Specimen) */}
        <group position={[0, 0.025, 0]}>
          {/* Tapered Tool Collar */}
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.062, 0.075, 0.030, 32]} />
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </mesh>

          {/* Hardened Ground Punch Die Face Insert (Bottom strictly at local Y = 0.000) */}
          <group position={[0, -0.019, 0]}>
            {/* Die Cylinder: height 0.012, center at local -0.019 (within nose group Y=0.025) */}
            {/* Absolute local Y of center: 0.025 - 0.019 = 0.006 */}
            {/* Height is 0.012, so bottom face is at 0.006 - 0.006 = local Y 0.000! */}
            <mesh>
              <cylinderGeometry args={[0.058, 0.058, 0.012, 32]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Hardened Ground Punch Strike Face Perimeter Chamfer */}
            <mesh position={[0, 0.003, 0]}>
              <cylinderGeometry args={[0.060, 0.060, 0.005, 32]} />
              <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
            </mesh>
          </group>
        </group>

        {/* If broken, localized contact compression crack on die flank */}
        {broken && (
          <mesh position={[0.02, 0.02, 0.04]} rotation={[0.2, 0.1, 0.3]}>
            <boxGeometry args={[0.025, 0.04, 0.006]} />
            <meshStandardMaterial {...MAT_DARK_RECESS} />
          </mesh>
        )}
      </group>
    );
  },
};

// ============================================================================
// FULL MACHINE ASSEMBLY SPECIFICATION
// ============================================================================
export const PressTier1Spec: MachineAssemblySpec = {
  id: "press_tier1_manual",
  name: "Tier 1: $10 Manual Flywheel Screw Press",
  tier: 1,
  strikeFrames: [134, 156, 178, 200],
  strikeIntensity: 0.038,
  modules: [
    ModuleBase,
    ModuleLeadScrew,
    ModuleGantry,
    ModuleFlywheel,
    ModuleToolhead,
  ],
};

// Backward compatibility alias & default export
export const PressTier1AssemblySpec = PressTier1Spec;
export default PressTier1Spec;
