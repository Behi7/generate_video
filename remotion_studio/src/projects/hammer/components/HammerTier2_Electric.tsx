import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 2: $100 ELECTRIC LEVEL POWER HAMMER (HammerTier2_Electric.tsx)
 * ============================================================================
 * Complies strictly with remotion_studio/crew/3d_modeler.md & AssemblyContract.ts
 *
 * Golden Modular Assembly Sequence (Inside-Out Law):
 * Order 0 (0f):  Base - Welded sheet metal workshop pedestal with anchor bolts,
 *                gussets, and hardened anvil block (#0F766E teal steel, roughness 0.6, metalness 0.5).
 * Order 1 (20f): Rotor/Core - Copper-wound armature rotor, eccentric crank disc,
 *                and bronze bearings (#B45309 copper, #F59E0B brass). MUST arrive BEFORE casing!
 * Order 2 (40f): Motor & Column Housing - Finned electric motor stator housing and
 *                vertical guide column (<RoundedBox radius={0.025}>, cooling ribs, junction box).
 * Order 3 (60f): Drive - Heavy dual-flanged flywheel, reduction pulley, and black rubber V-belt drive.
 * Order 4 (75f): Toolhead - High-speed reciprocating guided steel ram and hardened hammer die
 *                pointing vertically DOWN along Y-axis into specimen.
 *
 * Material Triad:
 * - Industrial Teal Painted Steel: #0F766E (roughness: 0.60, metalness: 0.50)
 * - Mirror Chrome Steel:           #E2E8F0 (roughness: 0.08, metalness: 0.98)
 * - Warm Copper Windings:          #B45309 (roughness: 0.25, metalness: 0.88)
 * Accents:
 * - Polished Brass / Bearing Bronze: #F59E0B (roughness: 0.16, metalness: 0.94)
 * - Machined Medium Steel:           #334155 (roughness: 0.45, metalness: 0.70)
 * - Cast Iron / Column Shadow:       #1E293B (roughness: 0.65, metalness: 0.55)
 * - Hardened Alloy Tool Steel:       #CBD5E1 (roughness: 0.18, metalness: 0.92)
 * - Matte Black Rubber:              #111827 (roughness: 0.92, metalness: 0.08)
 * - Emergency Warning Red:           #EF4444 (roughness: 0.22, metalness: 0.75)
 */

// Shared PBR Material Presets
const MAT_TEAL_STEEL = { color: "#0F766E", roughness: 0.60, metalness: 0.50 };
const MAT_TEAL_DARK = { color: "#0B534C", roughness: 0.65, metalness: 0.45 };
const MAT_MIRROR_CHROME = { color: "#E2E8F0", roughness: 0.08, metalness: 0.98 };
const MAT_COPPER_WINDING = { color: "#B45309", roughness: 0.25, metalness: 0.88 };
const MAT_POLISHED_BRASS = { color: "#F59E0B", roughness: 0.16, metalness: 0.94 };
const MAT_MACHINED_STEEL = { color: "#334155", roughness: 0.45, metalness: 0.70 };
const MAT_CAST_IRON = { color: "#1E293B", roughness: 0.65, metalness: 0.55 };
const MAT_HARDENED_DIE = { color: "#CBD5E1", roughness: 0.18, metalness: 0.92 };
const MAT_MATTE_RUBBER = { color: "#111827", roughness: 0.92, metalness: 0.08 };
const MAT_DANGER_RED = { color: "#EF4444", roughness: 0.22, metalness: 0.75 };

/**
 * Kinematics calculations for electric mechanical power hammer.
 * 120 RPM = 2.0 rev/sec @ 30 FPS => exactly 15 frames per complete harmonic cycle.
 * Flywheel and crank rotate continuously during frames 70..249.
 * Ram drops vertically along Y-axis into anvil lower die.
 * Catastrophic belt rupture & jam occurs on frame 265.
 */
export function getTier2HammerKinematics(
  localFrame: number,
  isRunning: boolean,
  rpm: number,
  isBroken: boolean
): {
  strokeY: number;
  crankAngle: number;
  motorAngle: number;
  impactShake: number;
  pitmanAngle: number;
  isBurst: boolean;
} {
  const isBurst = isBroken || localFrame >= 265;
  const isOperating = isRunning && localFrame >= 150 && localFrame < 225;
  const isDecel = isRunning && localFrame >= 225 && localFrame < 245;
  const isStall = isRunning && localFrame >= 245 && localFrame < 265;

  // Crank & motor rotation kinematics
  let crankAngle = 0;
  if (isRunning && localFrame >= 70) {
    if (localFrame < 225) {
      crankAngle = ((localFrame - 70) / 8) * Math.PI * 2;
    } else if (localFrame < 245) {
      const pDecel = (localFrame - 225) / 20;
      const baseSpeed = (Math.PI * 2) / 8;
      const decelSpeed = baseSpeed * (1 - Math.pow(pDecel, 1.5));
      crankAngle = (155 * baseSpeed) + (localFrame - 225) * decelSpeed;
    } else {
      crankAngle = 155 * ((Math.PI * 2) / 8) + 20 * 0.3 * ((Math.PI * 2) / 8);
    }
  }
  const motorAngle = crankAngle * 3.47;

  // Workpiece top = 0.693, lower die = 0.553
  // Resting ram die bottom = 0.980 (29 cm air gap above copper billet)
  let dieY = 0.980;
  let impactShake = 0;

  if (isBurst) {
    dieY = 0.610;
    impactShake = 0;
  } else if (isStall) {
    const pShudder = (localFrame - 245) / 19;
    const amp = 0.0005 + pShudder * 0.0025; // 0.5mm to 3mm
    const shudder = Math.sin(localFrame * 35) * amp;
    dieY = 0.610 + shudder;
    impactShake = shudder;
  } else if (isDecel) {
    const pDecel = (localFrame - 225) / 20;
    dieY = 0.980 - (0.980 - 0.610) * Math.min(1, Math.pow(pDecel, 0.9));
  } else if (isOperating) {
    const cycle = (localFrame - 150) % 8;
    const defProg = (localFrame - 150) / 74;
    const strikeY = 0.693 - defProg * (0.693 - 0.610); // 0.693 down to 0.610
    if (cycle < 5) {
      // 65% of cycle (frames 0..4): ram stays HIGH at TDC Y=0.980 (29 cm air gap)
      dieY = 0.980;
    } else if (cycle === 5) {
      // Plunge with acceleration
      dieY = 0.980 - (0.980 - strikeY) * 0.75;
    } else if (cycle === 6) {
      // Strike contact (touches copper billet, strictly above anvil 0.553)
      dieY = strikeY;
      impactShake = 0.005;
    } else {
      // Immediate recoil back up to TDC
      dieY = 0.980;
    }
  } else if (isRunning && localFrame >= 70) {
    // Startup frames (70..149): ram stays at resting TDC 0.980
    dieY = 0.980;
  }

  // Ram group position is [0, strokeY + impactShake, 0.24]
  // In ModuleRamToolhead: die face bottom is at (1.15 - 0.403 + strokeY) = (0.747 + strokeY)
  // strokeY = dieY - 0.747
  const strokeY = dieY - 0.747;

  // Pitman connecting rod deflection angle in Y-Z plane
  const crankRadius = 0.08;
  const rodLength = 0.36;
  const pitmanAngle = Math.asin(Math.max(-0.99, Math.min(0.99, (-crankRadius * Math.sin(crankAngle)) / rodLength)));

  return {
    strokeY,
    crankAngle,
    motorAngle,
    impactShake,
    pitmanAngle,
    isBurst,
  };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): WELDED SHEET METAL PEDESTAL & ANVIL BED
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "t2_pedestal_base",
  name: "Welded Sheet Metal Workshop Pedestal & Anvil Bed",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  entryDirection: "bottom",
  travelDistance: 2.5,
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: () => {
    // 4 Corner Anchor Bolt Locations [x, z]
    const anchorCoords: [number, number][] = [
      [-0.50, -0.40],
      [0.50, -0.40],
      [-0.50, 0.40],
      [0.50, 0.40],
    ];

    // Welded triangular gusset coordinates [x, z, rotY]
    const gussetCoords: [number, number, number][] = [
      [-0.43, 0, Math.PI / 2],
      [0.43, 0, -Math.PI / 2],
      [0, -0.37, Math.PI],
      [-0.28, 0.37, 0],
      [0.28, 0.37, 0],
    ];

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Heavy Welded Base Flange Plate (rests directly on floor bed) */}
        <RoundedBox args={[1.18, 0.06, 0.98]} radius={0.02} smoothness={4} position={[0, 0.03, 0]}>
          <meshStandardMaterial {...MAT_TEAL_DARK} />
        </RoundedBox>

        {/* 2. Four Heavy Chrome Anchor Studs, Nuts & Elastomer Damper Pads */}
        {anchorCoords.map(([ax, az], i) => (
          <group key={`anchor_${i}`} position={[ax, 0, az]}>
            {/* Rubber Elastomer Vibration Pad Under Flange */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.024, 20]} />
              <meshStandardMaterial {...MAT_MATTE_RUBBER} />
            </mesh>
            {/* Mirror Chrome Heavy Flanged Washer */}
            <mesh position={[0, 0.065, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.012, 20]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Chrome Heavy Hex Anchor Nut */}
            <mesh position={[0, 0.085, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.030, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Threaded High-Tensile Anchor Stud */}
            <mesh position={[0, 0.115, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.036, 16]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* 3. Main Welded Sheet Metal Workshop Pedestal Body */}
        <RoundedBox
          args={[0.86, 0.48, 0.46]}
          radius={0.025}
          smoothness={4}
          position={[0, 0.27, -0.19]}
        >
          <meshStandardMaterial {...MAT_TEAL_STEEL} />
        </RoundedBox>

        {/* Diagonal Welded Stiffener Gusset Plates */}
        {gussetCoords.map(([gx, gz, rotY], j) => (
          <group key={`gusset_${j}`} position={[gx, 0.16, gz]} rotation={[0, rotY, 0]}>
            <mesh rotation={[0.42, 0, 0]}>
              <boxGeometry args={[0.016, 0.28, 0.16]} />
              <meshStandardMaterial {...MAT_TEAL_DARK} />
            </mesh>
          </group>
        ))}

        {/* Front Service Cabinet Access Door */}
        <group position={[0, 0.26, 0.042]}>
          {/* Recessed Door Frame Inset */}
          <RoundedBox args={[0.46, 0.38, 0.014]} radius={0.015} smoothness={4}>
            <meshStandardMaterial {...MAT_TEAL_DARK} />
          </RoundedBox>
          {/* Mirror Chrome Compression Latch / T-Handle */}
          <group position={[0.18, 0, 0.015]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.010, 0.010, 0.018, 12]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            <mesh position={[0, 0, 0.012]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.022, 0.09, 0.014]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
          {/* Polished Chrome Heavy Door Hinges */}
          {[-0.14, 0.14].map((hy, idx) => (
            <mesh key={`hinge_${idx}`} position={[-0.22, hy, 0.012]}>
              <cylinderGeometry args={[0.012, 0.012, 0.045, 12]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))}
        </group>

        {/* Dual-Sided Louvered Ventilation Cooling Grilles */}
        {[-0.432, 0.432].map((lx, idx) => (
          <group key={`louver_${idx}`} position={[lx, 0.27, -0.19]}>
            {[-0.10, -0.05, 0, 0.05, 0.10].map((ly, k) => (
              <mesh key={`slot_${k}`} position={[0, ly, 0]} rotation={[0, 0, lx > 0 ? 0.35 : -0.35]}>
                <boxGeometry args={[0.008, 0.022, 0.32]} />
                <meshStandardMaterial {...MAT_CAST_IRON} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Polished Brass Machine Specification Plaque */}
        <group position={[0, 0.46, 0.044]}>
          <mesh>
            <boxGeometry args={[0.34, 0.065, 0.008]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          {/* Machine Name & Serial Stamped Bars */}
          <mesh position={[0, 0.014, 0.005]}>
            <boxGeometry args={[0.28, 0.016, 0.003]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
          <mesh position={[0, -0.014, 0.005]}>
            <boxGeometry args={[0.22, 0.012, 0.003]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Plaque Mounting Chrome Rivets */}
          {[-0.15, 0.15].map((rx, idx) => (
            <mesh key={`plaq_rivet_${idx}`} position={[rx, 0, 0.006]}>
              <cylinderGeometry args={[0.006, 0.006, 0.005, 12]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))}
        </group>

        {/* Emergency Operator Foot Treadle Bar at Base Front */}
        <group position={[0, 0.065, 0.42]}>
          {/* Main Treadle Cross-Bar */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.58, 20]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
          {/* Ribbed Anti-Slip Rubber Pedal Pad */}
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.24, 0.018, 0.07]} />
            <meshStandardMaterial {...MAT_MATTE_RUBBER} />
          </mesh>
          {/* Pivot Clevises with Brass Bushings */}
          {[-0.26, 0.26].map((cx, idx) => (
            <group key={`treadle_clevis_${idx}`} position={[cx, -0.01, -0.04]}>
              <mesh>
                <boxGeometry args={[0.024, 0.04, 0.06]} />
                <meshStandardMaterial {...MAT_TEAL_DARK} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 4. Heavy Anvil Monolith & Lower Forging Die Riser */}
        <group position={[0, 0, 0.18]}>
          {/* Solid Cast Anvil Riser Monolith */}
          <RoundedBox args={[0.44, 0.38, 0.38]} radius={0.025} smoothness={4} position={[0, 0.22, 0]}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>

          {/* Machined Steel Die Bolster Plate */}
          <RoundedBox args={[0.36, 0.06, 0.34]} radius={0.015} smoothness={4} position={[0, 0.44, 0]}>
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </RoundedBox>

          {/* Polished Brass Alignment Gib Keys on Bolster */}
          {[-0.16, 0.16].map((bx, idx) => (
            <mesh key={`bolster_gib_${idx}`} position={[bx, 0.44, 0]}>
              <boxGeometry args={[0.018, 0.032, 0.28]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          ))}

          {/* Replaceable Hardened Alloy Tool-Steel Lower Forging Die Block */}
          <RoundedBox args={[0.26, 0.08, 0.26]} radius={0.012} smoothness={4} position={[0, 0.51, 0]}>
            <meshStandardMaterial {...MAT_HARDENED_DIE} />
          </RoundedBox>

          {/* Precision Machined Striking Working Surface (Plane Y = 0.55) */}
          <mesh position={[0, 0.551, 0]}>
            <boxGeometry args={[0.22, 0.004, 0.22]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>

          {/* Transverse Hardened Wedge Key Securing Lower Die */}
          <group position={[0, 0.475, 0]}>
            <mesh>
              <boxGeometry args={[0.42, 0.035, 0.045]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0.22, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.03, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): COPPER-WOUND ARMATURE ROTOR & ECCENTRIC CRANK CORE
// ============================================================================
// MUST ARRIVE STRICTLY BEFORE CASING (INSIDE-OUT LAW)!
const ModuleRotorCrankCore: ModularPartSpec = {
  id: "t2_rotor_crank_core",
  name: "Copper-Wound Armature Rotor, Eccentric Crank Disc & Bronze Bearings",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.2,
  targetSocket: [0, 1.15, -0.06],
  sparkColor: "#B45309",
  sparkCount: 22,
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const { crankAngle, motorAngle } = getTier2HammerKinematics(
      localFrame,
      isRunning,
      rpm,
      isBroken
    );

    // 12 radial copper coil bundle rotations
    const coilAngles = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

    return (
      <group position={[0, 0, 0]}>
        {/* ================================================================= */}
        {/* SUB-ASSEMBLY A: HIGH-SPEED COPPER-WOUND ELECTRIC MOTOR ARMATURE   */}
        {/* Centered on Motor Axis: dY = 0.0, dZ = -0.32                     */}
        {/* ================================================================= */}
        <group position={[0, 0, -0.32]}>
          {/* Motor Armature Rotor Rotating Assembly */}
          <group rotation={[motorAngle, 0, 0]}>
            {/* Ground Alloy Mirror-Chrome Motor Drive Shaft along X-axis */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.54, 24]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>

            {/* Laminated Silicon-Steel Armature Core Cylinder */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.084, 0.084, 0.22, 28]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>

            {/* 12 Radial Varnished Copper Armature Windings in Core Slots */}
            {coilAngles.map((theta, i) => (
              <group key={`coil_${i}`} rotation={[theta, 0, 0]}>
                {/* Longitudinal Copper Wire Bundle along Armature */}
                <mesh position={[0, 0.088, 0]}>
                  <boxGeometry args={[0.21, 0.024, 0.018]} />
                  <meshStandardMaterial {...MAT_COPPER_WINDING} />
                </mesh>
                {/* End Overhang Loop of Wound Copper Coils */}
                <mesh position={[-0.115, 0.075, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.016, 0.016, 0.024, 12]} />
                  <meshStandardMaterial {...MAT_COPPER_WINDING} />
                </mesh>
                <mesh position={[0.115, 0.075, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.016, 0.016, 0.024, 12]} />
                  <meshStandardMaterial {...MAT_COPPER_WINDING} />
                </mesh>
              </group>
            ))}

            {/* Segmented Copper Commutator Ring with Mica Insulation Slots */}
            <group position={[-0.14, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.048, 0.048, 0.055, 24]} />
                <meshStandardMaterial {...MAT_COPPER_WINDING} />
              </mesh>
              {/* Commutator Segment Separation Lines */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.049, 0.049, 0.056, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} wireframe={true} />
              </mesh>
            </group>

            {/* Centrifugal Motor Cooling Fan Impeller */}
            <group position={[0.14, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.088, 0.088, 0.035, 24]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
              {/* Radial Aluminum Fan Blades */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, k) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <mesh
                    key={`blade_${k}`}
                    position={[0, Math.cos(rad) * 0.055, Math.sin(rad) * 0.055]}
                    rotation={[rad, 0.25, 0]}
                  >
                    <boxGeometry args={[0.028, 0.045, 0.005]} />
                    <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                  </mesh>
                );
              })}
            </group>
          </group>

          {/* Stationary Phosphor Bronze Sleeve Bearings on Shaft Ends */}
          {[-0.20, 0.20].map((bx, idx) => (
            <group key={`motor_bearing_${idx}`} position={[bx, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.034, 0.034, 0.042, 20]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Cast Bearing Flange */}
              <mesh position={[bx > 0 ? 0.015 : -0.015, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.044, 0.044, 0.012, 20]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ================================================================= */}
        {/* SUB-ASSEMBLY B: MAIN CRANKSHAFT & ECCENTRIC CRANK DISC           */}
        {/* Centered on Upper Crank Axis: dY = 0.55, dZ = 0.06                */}
        {/* ================================================================= */}
        <group position={[0, 0.55, 0.06]}>
          {/* Main Crankshaft & Counterweighted Eccentric Disc */}
          <group rotation={[crankAngle, 0, 0]}>
            {/* Heavy Forged Alloy Ground Crankshaft along X-axis */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.036, 0.036, 0.52, 28]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>

            {/* Massive Forged Steel Eccentric Crank Disc */}
            <group position={[0, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.165, 0.165, 0.065, 36]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>

              {/* Polished Disc Outer Chamfer Ring */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.170, 0.170, 0.018, 36]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>

              {/* Integrated Crescent Counterweight Lobe (Balances Reciprocating Ram) */}
              <RoundedBox
                args={[0.062, 0.11, 0.22]}
                radius={0.018}
                smoothness={4}
                position={[0, -0.085, 0]}
              >
                <meshStandardMaterial {...MAT_CAST_IRON} />
              </RoundedBox>

              {/* Hardened Alloy Eccentric Crankpin (Offset by r = 0.08m) */}
              <group position={[0, 0.08, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.026, 0.026, 0.095, 24]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
                {/* Polished Bronze Crankpin Sleeve Bearing Bushing */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.072, 24]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
                {/* Chrome Retaining Crankpin Washer & Castle Nut */}
                <mesh position={[0.052, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.036, 0.036, 0.012, 16]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Stationary Phosphor Bronze Split Journal Bearings */}
          {[-0.14, 0.14].map((jx, idx) => (
            <group key={`crank_bearing_${idx}`} position={[jx, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.048, 0.048, 0.048, 24]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Bronze Thrust Flange Rings */}
              <mesh position={[jx > 0 ? -0.026 : 0.026, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.058, 0.058, 0.010, 24]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): FINNED MOTOR STATOR HOUSING & COLUMN
// ============================================================================
const ModuleMotorColumnHousing: ModularPartSpec = {
  id: "t2_motor_column_housing",
  name: "Finned Electric Motor Stator Housing & Vertical Guide Column",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "front",
  travelDistance: 3.4,
  targetSocket: [0, 1.15, -0.06],
  sparkColor: "#0F766E",
  sparkCount: 18,
  render: () => {
    // 12 longitudinal motor cooling fins surrounding stator
    const finIndices = Array.from({ length: 12 }, (_, i) => i);

    return (
      <group position={[0, 0, 0]}>
        {/* ================================================================= */}
        {/* 1. MAIN VERTICAL C-FRAME GUIDE COLUMN (Industrial Teal Painted Steel) */}
        {/* ================================================================= */}
        {/* Main Upright Column Casting Body */}
        <RoundedBox
          args={[0.38, 1.34, 0.52]}
          radius={0.025}
          smoothness={4}
          position={[0, 0.03, -0.06]}
        >
          <meshStandardMaterial {...MAT_TEAL_STEEL} />
        </RoundedBox>

        {/* Side Recessed Panels for Weight Reduction & Mechanical Profile */}
        {[-0.192, 0.192].map((px, idx) => (
          <group key={`col_recess_${idx}`} position={[px, 0.08, -0.06]}>
            <mesh>
              <boxGeometry args={[0.010, 0.88, 0.36]} />
              <meshStandardMaterial {...MAT_TEAL_DARK} />
            </mesh>
            {/* Column Inspection Access Cover Plate */}
            <mesh position={[px > 0 ? 0.006 : -0.006, -0.12, 0]}>
              <boxGeometry args={[0.006, 0.28, 0.22]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Cover Retaining Chrome Cap Screws */}
            {[-0.09, 0.09].map((cz, j) => (
              <mesh
                key={`cov_screw_${j}`}
                position={[px > 0 ? 0.012 : -0.012, -0.12, cz]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.008, 0.008, 0.014, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Top Forward Gantry Overhang Head (Throat Extension above Anvil) */}
        <RoundedBox
          args={[0.38, 0.28, 0.44]}
          radius={0.025}
          smoothness={4}
          position={[0, 0.56, 0.12]}
        >
          <meshStandardMaterial {...MAT_TEAL_STEEL} />
        </RoundedBox>

        {/* Forged Crane Rigging Eye Lug at Top of Column */}
        <group position={[0, 0.72, -0.06]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 0.04, 20]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <torusGeometry args={[0.038, 0.014, 16, 24]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        </group>

        {/* 2. Precision Prismatic Vertical Guideways (Box Gibs / V-Ways) */}
        {/* Centered at dZ = 0.24 (world Z = 0.18 directly over anvil die!) */}
        <group position={[0, 0.06, 0.24]}>
          {/* Dual Mirror Chrome Vertical Guide Rails */}
          {[-0.145, 0.145].map((gx, idx) => (
            <group key={`guide_rail_${idx}`} position={[gx, 0, 0]}>
              {/* Precision Ground Chrome Guide Bar */}
              <mesh>
                <boxGeometry args={[0.028, 0.76, 0.12]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
              {/* Hardened Phosphor Bronze Wear Strips */}
              <mesh position={[gx > 0 ? -0.015 : 0.015, 0, 0]}>
                <boxGeometry args={[0.008, 0.72, 0.10]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Gib Setting & Tensioning Adjustment Bolts */}
              {[-0.28, -0.14, 0, 0.14, 0.28].map((by, k) => (
                <mesh
                  key={`gib_bolt_${k}`}
                  position={[gx > 0 ? 0.018 : -0.018, by, 0.03]}
                  rotation={[0, 0, gx > 0 ? Math.PI / 2 : -Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.009, 0.009, 0.022, 6]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* 3. Main Crankshaft Split-Pillow Block Bearing Pedestals */}
        <group position={[0, 0.55, 0.06]}>
          {[-0.15, 0.15].map((bx, idx) => (
            <group key={`pillow_block_${idx}`} position={[bx, 0, 0]}>
              {/* Cast Pillow Block Lower Half */}
              <mesh position={[0, -0.045, 0]}>
                <boxGeometry args={[0.065, 0.05, 0.14]} />
                <meshStandardMaterial {...MAT_TEAL_DARK} />
              </mesh>
              {/* Cast Removable Bearing Cap Upper Half */}
              <RoundedBox args={[0.065, 0.048, 0.14]} radius={0.012} smoothness={4} position={[0, 0.035, 0]}>
                <meshStandardMaterial {...MAT_TEAL_STEEL} />
              </RoundedBox>
              {/* Chrome High-Tensile Studs & Hex Cap Nuts */}
              {[-0.048, 0.048].map((sz, j) => (
                <group key={`cap_stud_${j}`} position={[0, 0.062, sz]}>
                  <mesh>
                    <cylinderGeometry args={[0.008, 0.008, 0.022, 16]} />
                    <meshStandardMaterial {...MAT_MACHINED_STEEL} />
                  </mesh>
                  <mesh position={[0, 0.006, 0]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.014, 6]} />
                    <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                  </mesh>
                </group>
              ))}
              {/* Brass Grease / Lubrication Cup on Top of Bearing Cap */}
              <group position={[0, 0.075, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.014, 0.014, 0.028, 16]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
                <mesh position={[0, 0.016, 0]}>
                  <sphereGeometry args={[0.016, 12, 12]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              </group>
            </group>
          ))}
        </group>

        {/* ================================================================= */}
        {/* 4. FINNED ELECTRIC MOTOR STATOR HOUSING & REAR MOUNT BRACKET      */}
        {/* Centered on Motor Axis: dY = 0.0, dZ = -0.32                     */}
        {/* ================================================================= */}
        <group position={[0, 0, -0.32]}>
          {/* Heavy Welded Sheet Steel Motor Mounting Saddle Bracket */}
          <group position={[0, -0.11, 0]}>
            <RoundedBox args={[0.34, 0.04, 0.32]} radius={0.012} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial {...MAT_TEAL_DARK} />
            </RoundedBox>
            {/* Triangular Stiffener Braces to Column */}
            {[-0.12, 0.12].map((sx, idx) => (
              <mesh key={`mot_brace_${idx}`} position={[sx, 0.04, 0.12]} rotation={[-0.45, 0, 0]}>
                <boxGeometry args={[0.022, 0.12, 0.08]} />
                <meshStandardMaterial {...MAT_TEAL_STEEL} />
              </mesh>
            ))}
            {/* 4 Motor Base Hex Fasteners */}
            {[
              [-0.12, -0.10],
              [0.12, -0.10],
              [-0.12, 0.10],
              [0.12, 0.10],
            ].map(([mx, mz], i) => (
              <mesh key={`mot_bolt_${i}`} position={[mx, 0.025, mz]}>
                <cylinderGeometry args={[0.011, 0.011, 0.016, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
          </group>

          {/* Finned Electric Motor Stator Cylindrical Shell */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.116, 0.116, 0.32, 32]} />
            <meshStandardMaterial {...MAT_TEAL_STEEL} />
          </mesh>

          {/* 12 Deep Longitudinal Cooling Fins for Heat Dissipation */}
          {finIndices.map((idx) => {
            const angle = (idx * Math.PI) / 6;
            const r = 0.122;
            return (
              <mesh
                key={`fin_${idx}`}
                position={[0, Math.cos(angle) * r, Math.sin(angle) * r]}
                rotation={[angle, 0, 0]}
              >
                <boxGeometry args={[0.30, 0.024, 0.006]} />
                <meshStandardMaterial {...MAT_TEAL_DARK} />
              </mesh>
            );
          })}

          {/* Cast Motor End-Bells with Radial Ventilation Louvers */}
          {[-0.165, 0.165].map((ex, idx) => (
            <group key={`endbell_${idx}`} position={[ex, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.118, 0.118, 0.024, 32]} />
                <meshStandardMaterial {...MAT_TEAL_DARK} />
              </mesh>
              {/* Ventilation Rings */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.075, 0.008, 12, 24]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            </group>
          ))}

          {/* Electric Motor Terminal Junction Box (On Top of Stator) */}
          <group position={[0, 0.145, 0]}>
            <RoundedBox args={[0.13, 0.09, 0.11]} radius={0.015} smoothness={4}>
              <meshStandardMaterial {...MAT_TEAL_STEEL} />
            </RoundedBox>
            {/* Terminal Box Cover with Gasket Lip */}
            <mesh position={[0, 0.048, 0]}>
              <boxGeometry args={[0.125, 0.010, 0.105]} />
              <meshStandardMaterial {...MAT_TEAL_DARK} />
            </mesh>
            {/* Cover Chrome Fastening Screws */}
            {[
              [-0.05, -0.04],
              [0.05, -0.04],
              [-0.05, 0.04],
              [0.05, 0.04],
            ].map(([tx, tz], i) => (
              <mesh key={`t_screw_${i}`} position={[tx, 0.055, tz]}>
                <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
            {/* Threaded Brass Cable Gland & Heavy Power Conduit */}
            <group position={[0.07, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.014, 0.014, 0.022, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.009, 0.009, 0.065, 16]} />
                <meshStandardMaterial {...MAT_MATTE_RUBBER} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): FLYWHEEL, REDUCTION PULLEY & V-BELT DRIVE
// ============================================================================
const ModuleFlywheelBeltDrive: ModularPartSpec = {
  id: "t2_flywheel_belt_drive",
  name: "Heavy Dual-Flanged Flywheel, Reduction Pulley & V-Belt Drive",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "right",
  travelDistance: 3.0,
  targetSocket: [0, 1.15, -0.06],
  sparkColor: "#F59E0B",
  sparkCount: 20,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.10, -0.06, 0.06],
    rotationImpulse: [0.18, -0.08, 0.28],
    sparkOrigin: [0.26, 1.45, -0.15],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const { crankAngle, motorAngle, isBurst } = getTier2HammerKinematics(
      localFrame,
      isRunning,
      rpm,
      isBroken
    );

    // 5 curved elliptical flywheel spokes
    const spokeAngles = [0, 72, 144, 216, 288];

    return (
      <group position={[0, 0, 0]}>
        {/* ================================================================= */}
        {/* 1. HEAVY DUAL-FLANGED FLYWHEEL ON UPPER CRANKSHAFT               */}
        {/* Mounted on Right Extension: dX = 0.24, dY = 0.55, dZ = 0.06      */}
        {/* ================================================================= */}
        <group position={[0.24, 0.55, 0.06]}>
          {/* Continuous Flywheel Rotation */}
          <group rotation={[crankAngle, 0, 0]}>
            {/* Massive Outer Rim in Machined Cast Steel with Dual V-Grooves */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.068, 48]} />
              <meshStandardMaterial {...MAT_CAST_IRON} />
            </mesh>

            {/* Polished Mirror-Chrome Outer Rim Face */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.245, 0.016, 16, 48]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>

            {/* Precision V-Belt Groove Recess in Rim Perimeter */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.235, 0.235, 0.026, 48]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>

            {/* Heavy Cast Central Shaft Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.068, 0.068, 0.085, 28]} />
              <meshStandardMaterial {...MAT_TEAL_STEEL} />
            </mesh>

            {/* Five Curved Elliptical Flywheel Spokes */}
            {spokeAngles.map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <group key={`spoke_${i}`} rotation={[rad, 0, 0]}>
                  {/* Tapered Elliptical Spoke Beam */}
                  <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0.08]}>
                    <boxGeometry args={[0.024, 0.16, 0.038]} />
                    <meshStandardMaterial {...MAT_TEAL_STEEL} />
                  </mesh>
                  {/* Spoke Polished Edge Ridge */}
                  <mesh position={[0.013, 0.14, 0]}>
                    <boxGeometry args={[0.004, 0.15, 0.022]} />
                    <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                  </mesh>
                </group>
              );
            })}

            {/* Polished Brass Shaft Collar & Square-Head Gib Key */}
            <group position={[0.045, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.022, 20]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Forged Steel Gib Key Head */}
              <mesh position={[0, 0.046, 0]}>
                <boxGeometry args={[0.024, 0.016, 0.016]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ================================================================= */}
        {/* 2. DUAL-GROOVE MOTOR REDUCTION PULLEY                             */}
        {/* Mounted on Motor Shaft: dX = 0.24, dY = 0.0, dZ = -0.32          */}
        {/* ================================================================= */}
        <group position={[0.24, 0, -0.32]}>
          <group rotation={[motorAngle, 0, 0]}>
            {/* Precision CNC Machined Aluminum Motor Pulley */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.072, 0.072, 0.058, 32]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Dual V-Belt Guide Flanges */}
            {[-0.02, 0.02].map((fx, idx) => (
              <mesh key={`pulley_flange_${idx}`} position={[fx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.078, 0.078, 0.008, 32]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
            {/* Polished Chrome Retaining End Washer & Hex Lock Nut */}
            <mesh position={[0.034, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.015, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        </group>

        {/* ================================================================= */}
        {/* 3. REINFORCED BLACK RUBBER V-BELT DRIVE TRANSMISSION             */}
        {/* Pulley at (0.24, 0.0, -0.32) -> Flywheel at (0.24, 0.55, 0.06)   */}
        {/* Center distance ~0.668m, inclination ~55.3 deg                    */}
        {/* ================================================================= */}
        <group position={[0.24, 0, 0]}>
          {!isBurst ? (
            /* Intact High-Tension Operating V-Belt */
            <group>
              {/* Taut Top Drive Run */}
              <group position={[0, 0.31, -0.16]} rotation={[0.965, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.020, 0.016, 0.62]} />
                  <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                </mesh>
              </group>

              {/* Taut Bottom Return Run */}
              <group position={[0, 0.24, -0.10]} rotation={[0.965, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.020, 0.016, 0.62]} />
                  <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                </mesh>
              </group>

              {/* Belt Tensioner Idler Arm & Bronze Roller */}
              <group position={[0.01, 0.28, -0.19]}>
                {/* Pivoting Tensioner Bracket Arm */}
                <mesh position={[-0.03, 0, 0]}>
                  <boxGeometry args={[0.04, 0.06, 0.08]} />
                  <meshStandardMaterial {...MAT_TEAL_DARK} />
                </mesh>
                {/* Phosphor Bronze Tensioning Idler Roller */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.038, 0.038, 0.032, 24]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
                {/* Tension Adjustment Threaded Handwheel */}
                <mesh position={[-0.04, 0.04, -0.03]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.015, 16]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              </group>
            </group>
          ) : (
            /* =============================================================== */
            /* CATASTROPHIC RUPTURE GEOMETRY (Act 4: Frame 265 Overload Event) */
            /* Ruptured jagged rubber belt ends flapping loose, sheared mounts */
            /* =============================================================== */
            <group>
              {/* Severed Upper Belt End Whipping Back from Flywheel */}
              <group position={[0, 0.46, 0.02]} rotation={[0.4, 0.2, -0.3]}>
                <mesh>
                  <boxGeometry args={[0.020, 0.016, 0.24]} />
                  <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                </mesh>
                {/* Shredded Rubber Strands & Kevlar Fibers */}
                <mesh position={[0, 0, -0.13]}>
                  <boxGeometry args={[0.024, 0.022, 0.04]} />
                  <meshStandardMaterial {...MAT_DANGER_RED} />
                </mesh>
              </group>

              {/* Severed Lower Belt End Drooping Down from Motor Pulley */}
              <group position={[0, 0.08, -0.26]} rotation={[1.4, -0.2, 0.4]}>
                <mesh>
                  <boxGeometry args={[0.020, 0.016, 0.28]} />
                  <meshStandardMaterial {...MAT_MATTE_RUBBER} />
                </mesh>
                {/* Jagged Shredded Fracture Tip */}
                <mesh position={[0, 0, 0.15]}>
                  <boxGeometry args={[0.022, 0.020, 0.035]} />
                  <meshStandardMaterial {...MAT_DANGER_RED} />
                </mesh>
              </group>

              {/* Sprung Idler Tensioner Arm Tilted under Broken Tension */}
              <group position={[0.03, 0.31, -0.18]} rotation={[0.35, 0.15, 0.45]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.038, 0.038, 0.032, 24]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              </group>

              {/* Sheared Chrome Bolt Shanks from Fractured Bracket Ear */}
              {[-0.03, 0.03].map((bx, j) => (
                <mesh
                  key={`sheared_bolt_${j}`}
                  position={[0.02 + bx, 0.12, -0.29]}
                  rotation={[0.2, 0.4, 0.6]}
                >
                  <cylinderGeometry args={[0.009, 0.009, 0.018, 6]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): GUIDED STEEL RAM & HARDENED HAMMER DIE
// ============================================================================
// Toolhead points strictly vertically DOWN along the Y-axis into specimen!
const ModuleRamToolhead: ModularPartSpec = {
  id: "t2_reciprocating_ram_toolhead",
  name: "High-Speed Reciprocating Guided Steel Ram & Hardened Hammer Die",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "bottom",
  travelDistance: 2.4,
  targetSocket: [0, 1.15, -0.06],
  sparkColor: "#10B981",
  sparkCount: 24,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.008, 0.08, 0.005],
    rotationImpulse: [0.012, 0.005, 0.018],
    sparkOrigin: [0, 0.60, 0.18],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    const { strokeY, impactShake, pitmanAngle, crankAngle } = getTier2HammerKinematics(
      localFrame,
      isRunning,
      rpm,
      isBroken
    );

    // Pitman link connecting rod pivots between eccentric crankpin and ram wristpin
    const crankRadius = 0.08;
    const crankpinY = 0.55 + Math.sin(crankAngle) * crankRadius;
    const crankpinZ = 0.06 - Math.cos(crankAngle) * crankRadius;

    // Ram wristpin position
    const wristpinY = 0.12 + strokeY;
    const wristpinZ = 0.24;

    // Midpoint between crankpin and wristpin for pitman arm
    const midY = (crankpinY + wristpinY) / 2;
    const midZ = (crankpinZ + wristpinZ) / 2;

    return (
      <group position={[0, 0, 0]}>
        {/* ================================================================= */}
        {/* 1. PITMAN CONNECTING ROD (Couples Eccentric Crank to Ram)         */}
        {/* ================================================================= */}
        <group position={[0, midY, midZ]} rotation={[pitmanAngle, 0, 0]}>
          {/* Heavy Forged Alloy Tool-Steel Connecting Shank */}
          <mesh>
            <boxGeometry args={[0.046, 0.32, 0.042]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Polished Chrome Lateral Stiffening Flanges */}
          {[-0.024, 0.024].map((fx, idx) => (
            <mesh key={`pitman_flange_${idx}`} position={[fx, 0, 0]}>
              <boxGeometry args={[0.004, 0.30, 0.038]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))}
          {/* Brass Lubrication Fitting on Connecting Rod Body */}
          <mesh position={[0, 0, 0.024]}>
            <cylinderGeometry args={[0.008, 0.008, 0.016, 12]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* Large-End Crankpin Journal Bearing Eye */}
        <group position={[0, crankpinY, crankpinZ]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.044, 0.044, 0.058, 24]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 0.062, 24]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* ================================================================= */}
        {/* 2. RECIPROCATING GUIDED STEEL RAM (TUP) & DIE ASSEMBLY            */}
        {/* Center: dZ = 0.24 (strictly vertical Y-axis coaxial with anvil)    */}
        {/* Moves along Y: strokeY + impactShake                             */}
        {/* ================================================================= */}
        <group position={[0, strokeY + impactShake, 0.24]}>
          {/* Small-End Wristpin Eye & Heavy Wristpin */}
          <group position={[0, 0.12, 0]}>
            {/* Ram Wristpin Journal */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.24, 24]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Mirror Chrome Wristpin Retainer End Plates */}
            {[-0.122, 0.122].map((wx, idx) => (
              <group key={`wrist_retainer_${idx}`} position={[wx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.032, 0.032, 0.008, 16]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </group>
            ))}
          </group>

          {/* Heavy Guided Steel Ram Body (Tup) */}
          <RoundedBox
            args={[0.26, 0.42, 0.26]}
            radius={0.02}
            smoothness={4}
            position={[0, -0.08, 0]}
          >
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </RoundedBox>

          {/* Precision Prismatic Guide Shoes Sliding in Column V-Ways */}
          {[-0.138, 0.138].map((sx, idx) => (
            <group key={`ram_shoe_${idx}`} position={[sx, -0.08, 0]}>
              {/* Mirror Chrome Lateral Runner Blade */}
              <mesh>
                <boxGeometry args={[0.022, 0.38, 0.16]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
              {/* Low-Friction Phosphor Bronze Wear Liners */}
              <mesh position={[sx > 0 ? -0.012 : 0.012, 0, 0]}>
                <boxGeometry args={[0.006, 0.36, 0.14]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ))}

          {/* Ram Front Machined Recess & Lubrication Inspection Port */}
          <group position={[0, -0.08, 0.132]}>
            <mesh>
              <boxGeometry args={[0.18, 0.26, 0.006]} />
              <meshStandardMaterial {...MAT_CAST_IRON} />
            </mesh>
            {/* Brass Oil Level Sight Glass */}
            <mesh position={[0, 0.04, 0.006]}>
              <cylinderGeometry args={[0.018, 0.018, 0.010, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.04, 0.011]}>
              <cylinderGeometry args={[0.013, 0.013, 0.004, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
            </mesh>
            {/* Grease Injection Zerks */}
            {[-0.05, 0.05].map((zx, idx) => (
              <mesh key={`zerk_${idx}`} position={[zx, -0.06, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.007, 0.007, 0.015, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            ))}
          </group>

          {/* =============================================================== */}
          {/* 3. UPPER TOOLHEAD DIE (POINTS VERTICALLY DOWN INTO SPECIMEN)     */}
          {/* =============================================================== */}
          <group position={[0, -0.29, 0]}>
            {/* Die Mounting Dovetail Bolster Block */}
            <RoundedBox
              args={[0.22, 0.06, 0.22]}
              radius={0.012}
              smoothness={4}
              position={[0, 0.01, 0]}
            >
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </RoundedBox>

            {/* Transverse Hardened Taper Wedge Key Locking Upper Die */}
            <group position={[0, 0.01, 0]}>
              <mesh>
                <boxGeometry args={[0.34, 0.028, 0.038]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              <mesh position={[0.18, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.025, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>

            {/* Hardened Alloy Tool-Steel Upper Forging Die Block */}
            <RoundedBox
              args={[0.18, 0.08, 0.18]}
              radius={0.012}
              smoothness={4}
              position={[0, -0.05, 0]}
            >
              <meshStandardMaterial {...MAT_HARDENED_DIE} />
            </RoundedBox>

            {/* Polished Chamfered Striking Nose (Points Directly DOWN) */}
            <group position={[0, -0.095, 0]}>
              <RoundedBox args={[0.14, 0.03, 0.14]} radius={0.008} smoothness={4}>
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </RoundedBox>
              {/* Precision Mirror Face Plate Contacting Workpiece */}
              <mesh position={[0, -0.016, 0]}>
                <boxGeometry args={[0.12, 0.004, 0.12]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// FULL MACHINE ASSEMBLY SPECIFICATION
// ============================================================================
export const HammerTier2Spec: MachineAssemblySpec = {
  id: "hammer_tier2_electric",
  name: "Tier 2: $100 Electric Power Hammer",
  tier: 2,
  strikeFrames: [156, 164, 172, 180, 188, 196, 204, 212, 220],
  strikeIntensity: 0.048,
  modules: [
    ModuleBase,
    ModuleRotorCrankCore,
    ModuleMotorColumnHousing,
    ModuleFlywheelBeltDrive,
    ModuleRamToolhead,
  ],
};

// Backward compatibility alias
export const HammerTier2AssemblySpec = HammerTier2Spec;
export default HammerTier2Spec;
