import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 1: $10 MANUAL HELVE TRIP HAMMER (HammerTier1_Manual.tsx)
 * ============================================================================
 * Operating under remotion_studio/crew/3d_modeler.md and AssemblyContract.ts.
 *
 * Golden Modular Inside-Out Assembly Sequence:
 * Order 0 (0f):  Base - Cast-Iron Table Vise Clamp with Acme Lead Screw Handle
 *                and Rugged Anvil Plate (#1E293B, roughness 0.75, metalness 0.4).
 * Order 1 (20f): Internal Cam/Pin Core - Raw steel unpolished eccentric cam,
 *                drive shaft & hardened fulcrum pivot pin (#64748B, roughness 0.5, metalness 0.85).
 *                MUST arrive strictly BEFORE casing/frame!
 * Order 2 (40f): Frame - Minimalist open skeleton uprights with split-pillow bearing
 *                caps and front rocker guide fork (<RoundedBox radius={0.02}>, #334155 steel).
 * Order 3 (60f): Drive - Polished brass hand-crank handle with turned hardwood grip
 *                and flywheel balance rim (#D97706 brass, roughness 0.15, metalness 0.95).
 * Order 4 (75f): Toolhead - Crude carbon steel hammer ram on pivoting hardwood rocker
 *                arm pointing vertically DOWN along Y-axis into specimen.
 *
 * Material Triad:
 * - Cast iron: #1E293B (roughness: 0.75, metalness: 0.40)
 * - Raw / Tool Steel: #64748B / #334155 (roughness: 0.50, metalness: 0.85)
 * - Polished Brass: #D97706 (roughness: 0.15, metalness: 0.95)
 * - Machined / Mirror Steel: #CBD5E1 (roughness: 0.12, metalness: 0.95)
 * - Turned Hardwood Ash: #854D0E / #92400E (roughness: 0.65, metalness: 0.05)
 *
 * Kinematics:
 * - Rocker arm pivots up and down rhythmically at ~2.5 Hz (frames 70..249).
 * - Hand crank and eccentric camshaft rotate synchronously when running.
 * - Overload fracture at frame 265: wooden arm snaps with impulse, pieces stay
 *   safely on platform bed (Y >= -2.04 in world space / local Y >= 0).
 * ============================================================================
 */

// PBR Material Presets
const MAT_CAST_IRON = { color: "#1E293B", roughness: 0.75, metalness: 0.40 };
const MAT_FRAME_STEEL = { color: "#334155", roughness: 0.55, metalness: 0.65 };
const MAT_RAW_TOOL_STEEL = { color: "#64748B", roughness: 0.50, metalness: 0.85 };
const MAT_CRUDE_CARBON_STEEL = { color: "#475569", roughness: 0.45, metalness: 0.75 };
const MAT_MACHINED_STEEL = { color: "#CBD5E1", roughness: 0.15, metalness: 0.92 };
const MAT_POLISHED_BRASS = { color: "#D97706", roughness: 0.15, metalness: 0.95 };
const MAT_HARDWOOD_ASH = { color: "#92400E", roughness: 0.65, metalness: 0.05 };
const MAT_HARDWOOD_GRIP = { color: "#854D0E", roughness: 0.60, metalness: 0.05 };
const MAT_SPLINTER_WOOD = { color: "#B45309", roughness: 0.75, metalness: 0.05 };
const MAT_DARK_RECESS = { color: "#0F172A", roughness: 0.90, metalness: 0.20 };

/**
 * Kinematic calculation for rocker arm tilt angle and cam rotation.
 * Continuous 4-phase physical model:
 * - Frames 150..224: Full power steady-state striking (ram at Y=1.05, plunges to Y=0.77..0.73, recoils).
 * - Frames 225..244: Torque bog-down / deceleration (RPM drops, ram settles to Y=0.73).
 * - Frames 245..264: Stall & High-Frequency Shudder (stops at contact Y=0.73, micro-vibrates 0.5..3mm).
 * - Frame 265: Catastrophic rupture (rocker arm snaps, ram rests at Y=0.73).
 */
function getHammerKinematics(localFrame: number, isRunning: boolean, isBroken: boolean) {
  const isBurst = isBroken || localFrame >= 265;
  const isOperating = isRunning && localFrame >= 150 && localFrame < 225;
  const isDecel = isRunning && localFrame >= 225 && localFrame < 245;
  const isStall = isRunning && localFrame >= 245 && localFrame < 265;

  // Crank rotation calculation
  let crankAngle = 0;
  if (isRunning && localFrame >= 70) {
    if (localFrame < 225) {
      crankAngle = (localFrame - 70) * ((2 * Math.PI) / 12);
    } else if (localFrame < 245) {
      const pDecel = (localFrame - 225) / 20;
      const baseSpeed = (2 * Math.PI) / 12;
      const decelSpeed = baseSpeed * (1 - Math.pow(pDecel, 1.5));
      crankAngle = (155 * baseSpeed) + (localFrame - 225) * decelSpeed;
    } else {
      crankAngle = 155 * ((2 * Math.PI) / 12) + 20 * 0.3 * ((2 * Math.PI) / 12);
    }
  }

  // Workpiece top = 0.770, anvil bolster = 0.630
  // Resting ram die bottom = 1.050 (28 cm air gap above workpiece)
  let dieY = 1.050;
  let impactShake = 0;

  if (isBurst) {
    dieY = 0.730;
    impactShake = 0;
  } else if (isStall) {
    const pShudder = (localFrame - 245) / 19;
    const amp = 0.0005 + pShudder * 0.0025; // 0.5mm to 3mm
    const shudder = Math.sin(localFrame * 35) * amp;
    dieY = 0.730 + shudder;
    impactShake = shudder;
  } else if (isDecel) {
    const pDecel = (localFrame - 225) / 20;
    dieY = 1.050 - (1.050 - 0.730) * Math.min(1, Math.pow(pDecel, 0.9));
  } else if (isOperating) {
    const cycle = (localFrame - 150) % 12;
    const defProg = (localFrame - 150) / 74;
    const strikeY = 0.770 - defProg * 0.040; // 0.770 down to 0.730
    if (cycle < 8) {
      // 65% of cycle (frames 0..7): ram stays HIGH in the air at 1.05
      dieY = 1.050;
    } else if (cycle < 10) {
      // Plunge with quadratic acceleration
      const t = (cycle - 8) / 2;
      dieY = 1.050 - (1.050 - strikeY) * (t * t);
    } else if (cycle === 10) {
      // Strike contact (touches top surface, strictly above anvil bolster 0.630)
      dieY = strikeY;
      impactShake = 0.004;
    } else {
      // Immediate recoil back up high
      dieY = 1.050;
    }
  } else if (isRunning && localFrame >= 70) {
    // Startup frames (70..149): ram stays at resting TDC 1.050
    dieY = 1.050;
  }

  // Exact ram head Y translation so that die face bottom lands exactly at dieY
  // TargetSocket is at Y = 1.00. Die face bottom is at (ramHeadY - 0.347) relative to socket.
  // 1.00 + ramHeadY - 0.347 = dieY => ramHeadY = dieY - 0.653
  const ramHeadY = dieY - 0.653;
  // Rocker arm tilt angle tracks linkage between pivot [0, 0, -0.05] and ram [0, ramHeadY, 0.12]
  const tiltAngle = Math.atan2(ramHeadY, 0.17);

  return {
    crankAngle,
    tiltAngle,
    ramHeadY,
    dieY,
    impactShake,
  };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): CAST-IRON TABLE VISE CLAMP & RUGGED ANVIL BASE
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "t1_base_vise",
  name: "Cast-Iron Table Vise Clamp with Lead Screw Handle & Rugged Anvil Plate",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#CBD5E1",
  sparkCount: 14,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Cast-Iron Workbench Plinth Plate */}
      <RoundedBox args={[0.84, 0.10, 0.70]} radius={0.02} smoothness={4} position={[0, 0.05, 0]}>
        <meshStandardMaterial {...MAT_CAST_IRON} />
      </RoundedBox>

      {/* 4 Corner Anchor Bolt Bosses & Machined Zinc Hex Bolts */}
      {[
        [-0.36, -0.28],
        [0.36, -0.28],
        [-0.36, 0.28],
        [0.36, 0.28],
      ].map(([bx, bz], idx) => (
        <group key={`base_bolt_${idx}`} position={[bx, 0.10, bz]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.026, 0.030, 0.02, 16]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
          <mesh position={[0, 0.024, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.025, 6]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>
      ))}

      {/* Workbench Edge Lip Recess Channel */}
      <mesh position={[0, 0.101, -0.32]}>
        <boxGeometry args={[0.80, 0.005, 0.04]} />
        <meshStandardMaterial {...MAT_DARK_RECESS} />
      </mesh>

      {/* 2. Heavy Cast-Iron Rugged Anvil Monolith (Front, Z = 0.12) */}
      <group position={[0, 0, 0.12]}>
        {/* Anvil Base Flange Foot */}
        <RoundedBox args={[0.46, 0.08, 0.38]} radius={0.02} smoothness={4} position={[0, 0.14, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Anvil Riser Waist Monolith */}
        <RoundedBox args={[0.40, 0.36, 0.32]} radius={0.025} smoothness={4} position={[0, 0.36, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Lateral Structural Strengthening Gussets */}
        {[-0.20, 0.20].map((gx, idx) => (
          <mesh key={`anvil_gusset_${idx}`} position={[gx, 0.24, 0]} rotation={[0, 0, (gx > 0 ? 1 : -1) * 0.35]}>
            <boxGeometry args={[0.06, 0.22, 0.28]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
        ))}

        {/* Anvil Top Bolster Table */}
        <RoundedBox args={[0.38, 0.06, 0.32]} radius={0.015} smoothness={4} position={[0, 0.57, 0]}>
          <meshStandardMaterial {...MAT_FRAME_STEEL} />
        </RoundedBox>

        {/* Hardened Tool-Steel Anvil Strike Plate (Die Bolster, Y = 0.615) */}
        <RoundedBox args={[0.26, 0.03, 0.24]} radius={0.01} smoothness={4} position={[0, 0.615, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Square Hardy Hole in Anvil Face */}
        <mesh position={[0.07, 0.621, 0]}>
          <boxGeometry args={[0.036, 0.022, 0.036]} />
          <meshStandardMaterial {...MAT_DARK_RECESS} />
        </mesh>

        {/* Round Pritchel Hole in Anvil Face */}
        <mesh position={[-0.07, 0.621, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.022, 16]} />
          <meshStandardMaterial {...MAT_DARK_RECESS} />
        </mesh>

        {/* Rugged Anvil Horn (Protruding forward along +Z) */}
        <group position={[0, 0.54, 0.16]}>
          {/* Conical Cast Anvil Horn */}
          <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.064, 0.22, 24]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
          {/* Spherical Rounded Horn Nose Tip */}
          <mesh position={[0, 0, 0.22]}>
            <sphereGeometry args={[0.024, 16, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Flat Cutting Step Table at Horn Base */}
          <RoundedBox args={[0.18, 0.035, 0.08]} radius={0.008} smoothness={4} position={[0, 0.015, 0.04]}>
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </RoundedBox>
        </group>
      </group>

      {/* 3. Integrated Table Vise Clamp Mechanism (Left Side, X = -0.36) */}
      <group position={[-0.36, 0, 0]}>
        {/* Fixed Vise Jaw Body */}
        <RoundedBox args={[0.12, 0.22, 0.28]} radius={0.015} smoothness={4} position={[0.04, 0.21, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Sliding Dynamic Vise Jaw */}
        <RoundedBox args={[0.10, 0.22, 0.28]} radius={0.015} smoothness={4} position={[-0.10, 0.21, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Hardened Cross-Hatched Steel Jaw Gripping Faces */}
        <mesh position={[0.095, 0.25, 0]}>
          <boxGeometry args={[0.012, 0.07, 0.24]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>
        <mesh position={[-0.045, 0.25, 0]}>
          <boxGeometry args={[0.012, 0.07, 0.24]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>

        {/* Twin Precision Cylindrical Steel Guide Rails */}
        {[-0.08, 0.08].map((gz, idx) => (
          <mesh key={`vise_rail_${idx}`} position={[-0.03, 0.14, gz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.28, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        ))}

        {/* Acme Lead Screw Shaft */}
        <mesh position={[-0.08, 0.23, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.36, 20]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>

        {/* Polished Brass Thrust Bearing Collar */}
        <mesh position={[-0.165, 0.23, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>

        {/* Lead Screw Head Socket & Sliding Tommy-Bar Handle */}
        <group position={[-0.19, 0.23, 0]}>
          {/* Spherical Screw Head with Cross-Bore */}
          <mesh>
            <sphereGeometry args={[0.032, 20, 20]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
          {/* Sliding Tommy-Bar Handle Rod */}
          <mesh position={[0, 0.03, 0]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.010, 0.010, 0.28, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* Polished Brass Spherical End Knobs on Tommy Bar */}
          <mesh position={[0, 0.03 + Math.cos(0.4) * 0.14, -Math.sin(0.4) * 0.14]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0, 0.03 - Math.cos(0.4) * 0.14, Math.sin(0.4) * 0.14]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* Underside Workbench C-Clamp Throat & Pad (Clamping under bench) */}
        <group position={[-0.04, -0.06, 0]}>
          <RoundedBox args={[0.06, 0.12, 0.10]} radius={0.01} smoothness={4} position={[0, -0.03, 0]}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Lower Clamp Screw & Swivel Shoe */}
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.012, 20]} />
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </mesh>
        </group>
      </group>

      {/* 4. Rear Upright Stanchion Mounting Pedestal (Z = -0.24) */}
      <group position={[0, 0, -0.24]}>
        <RoundedBox args={[0.46, 0.46, 0.22]} radius={0.025} smoothness={4} position={[0, 0.33, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Stanchion Weight-Relief Flutes */}
        {[-0.14, 0.14].map((fx, idx) => (
          <mesh key={`stanchion_flute_${idx}`} position={[fx, 0.33, 0.112]}>
            <boxGeometry args={[0.06, 0.34, 0.01]} />
            <meshStandardMaterial {...MAT_DARK_RECESS} />
          </mesh>
        ))}

        {/* Machined Frame Foundation Mounting Pads (Ready for Order 2 Frame Uprights) */}
        {[-0.18, 0.18].map((px, idx) => (
          <group key={`pad_${idx}`} position={[px, 0.565, 0]}>
            <RoundedBox args={[0.08, 0.03, 0.22]} radius={0.008} smoothness={4}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>
            {/* Threaded Foundation Stud Holes */}
            {[-0.06, 0.06].map((pz, j) => (
              <mesh key={`stud_hole_${j}`} position={[0, 0.016, pz]}>
                <cylinderGeometry args={[0.009, 0.009, 0.006, 12]} />
                <meshStandardMaterial {...MAT_DARK_RECESS} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Polished Brass Foundry Specification Plaque */}
        <group position={[0, 0.38, 0.114]}>
          <RoundedBox args={[0.22, 0.06, 0.008]} radius={0.003} smoothness={4}>
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </RoundedBox>
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.18, 0.025, 0.002]} />
            <meshStandardMaterial {...MAT_DARK_RECESS} />
          </mesh>
        </group>
      </group>
    </group>
  ),
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): INTERNAL CAM/PIN CORE (BEFORE Frame!)
// ============================================================================
const ModuleCamPinCore: ModularPartSpec = {
  id: "t1_cam_pin_core",
  name: "Raw Steel Eccentric Cam, Drive Shaft & Hardened Rocker Pivot Pin",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.2,
  targetSocket: [0, 1.00, 0],
  sparkColor: "#64748B",
  sparkCount: 16,
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { crankAngle } = getHammerKinematics(localFrame, isRunning, isBroken);

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Transverse Camshaft & Eccentric Cam Assembly (Z = -0.28, Y = -0.05) */}
        <group position={[0, -0.05, -0.28]}>
          {/* Rotating Camshaft & Cam Lobe Group */}
          <group rotation={[crankAngle, 0, 0]}>
            {/* Main Raw Steel Unpolished Drive Shaft (Spanning from X = -0.23 to +0.23) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.46, 24]} />
              <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
            </mesh>

            {/* Machined Longitudinal Shaft Keyway Channel */}
            <mesh position={[0, 0.021, 0]}>
              <boxGeometry args={[0.36, 0.004, 0.006]} />
              <meshStandardMaterial {...MAT_DARK_RECESS} />
            </mesh>

            {/* Central Eccentric Cam Monolith (Keyed to Shaft Centerline at X = 0) */}
            <group position={[0, 0, 0]}>
              {/* Cam Cylindrical Base Hub */}
              <mesh position={[0, 0.026, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.052, 0.052, 0.065, 32]} />
                <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
              </mesh>

              {/* Eccentric Helve Trip Lobe Horn (Progressive Lift Profile) */}
              <RoundedBox args={[0.062, 0.048, 0.060]} radius={0.012} smoothness={4} position={[0, 0.062, 0.018]}>
                <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
              </RoundedBox>

              {/* Cam Hub Split-Collar & Hex Set-Screw */}
              <mesh position={[0, 0.038, -0.026]}>
                <cylinderGeometry args={[0.008, 0.008, 0.02, 6]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            </group>

            {/* Drive Dog / Splined Key on Shaft Right End (Engages Order 3 Crank) */}
            <mesh position={[0.228, 0, 0]}>
              <boxGeometry args={[0.012, 0.012, 0.038]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>

          {/* Stationary Low-Friction Phosphor Bronze Journal Sleeve Bushings (X = ±0.18) */}
          {[-0.18, 0.18].map((bx, idx) => (
            <group key={`cam_bushing_${idx}`} position={[bx, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.030, 0.030, 0.042, 24]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Bushing Thrust Flange */}
              <mesh position={[bx > 0 ? 0.022 : -0.022, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.038, 0.038, 0.008, 24]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* High-Pressure Grease Fitting Cup */}
              <mesh position={[0, 0.035, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.016, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 2. Hardened Tool-Steel Rocker Fulcrum Pivot Pin (Z = -0.05, Y = 0) */}
        <group position={[0, 0, -0.05]}>
          {/* Main Hardened Ground Tool-Steel Pivot Axle Pin */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.024, 0.024, 0.38, 24]} />
            <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
          </mesh>

          {/* Polished Brass Thrust Washers */}
          {[-0.17, 0.17].map((wx, idx) => (
            <mesh key={`pivot_washer_${idx}`} position={[wx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 0.008, 24]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          ))}

          {/* Cross-Drilled Spring Cotter Pins / Split Retaining Pins */}
          {[-0.182, 0.182].map((cx, idx) => (
            <mesh key={`cotter_${idx}`} position={[cx, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.065, 12]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): MINIMALIST OPEN SKELETON UPRIGHTS & BEARING FRAME
// ============================================================================
const ModuleFrame: ModularPartSpec = {
  id: "t1_frame_skeleton",
  name: "Minimalist Open Skeleton Uprights & Pivot Bearing Frame",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "top",
  travelDistance: 3.4,
  targetSocket: [0, 1.00, 0],
  sparkColor: "#334155",
  sparkCount: 18,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* Dual Open Skeleton A-Frame Uprights Flanking Core (X = -0.18 and X = +0.18) */}
      {[-0.18, 0.18].map((ux, idx) => (
        <group key={`upright_${idx}`} position={[ux, 0, 0]}>
          {/* 1. Base Mounting Foot Clamping onto Module 0 Pedestal */}
          <RoundedBox args={[0.055, 0.045, 0.38]} radius={0.012} smoothness={4} position={[0, -0.41, -0.16]}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>

          {/* High-Tensile Foundation Hex Bolts */}
          {[-0.06, 0.06].map((fz, j) => (
            <mesh key={`foot_bolt_${j}`} position={[0, -0.38, -0.24 + fz]}>
              <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}

          {/* 2. Rear Vertical Column Stanchion (Enclosing Camshaft at Z = -0.28) */}
          <RoundedBox args={[0.050, 0.52, 0.08]} radius={0.02} smoothness={4} position={[0, -0.13, -0.28]}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>

          {/* Camshaft Split-Pillow Bearing Cap Housing (Z = -0.28, Y = -0.05) */}
          <group position={[0, -0.05, -0.28]}>
            <RoundedBox args={[0.065, 0.075, 0.09]} radius={0.015} smoothness={4}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>
            {/* Split Bearing Cap Retaining Bolts */}
            {[-0.032, 0.032].map((by, k) => (
              <mesh key={`cam_cap_bolt_${k}`} position={[0, by, 0.038]}>
                <cylinderGeometry args={[0.007, 0.007, 0.02, 6]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            ))}
          </group>

          {/* 3. Diagonal Skeleton Truss Strut (Connecting Foot to Pivot Fulcrum) */}
          <mesh position={[0, -0.20, -0.14]} rotation={[0.48, 0, 0]}>
            <boxGeometry args={[0.045, 0.44, 0.055]} />
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </mesh>

          {/* Rocker Fulcrum Bearing Housing (Z = -0.05, Y = 0) */}
          <group position={[0, 0, -0.05]}>
            <RoundedBox args={[0.065, 0.08, 0.09]} radius={0.015} smoothness={4}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>
            {/* Top Removable Split Cap & Hex Cap Screws */}
            {[-0.032, 0.032].map((bz, k) => (
              <mesh key={`pivot_cap_bolt_${k}`} position={[0, 0.038, bz]}>
                <cylinderGeometry args={[0.007, 0.007, 0.02, 6]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
            ))}
          </group>

          {/* 4. Forward Extension Arm to Rocker Guide (Connecting Pivot to Z = 0.12) */}
          <RoundedBox args={[0.045, 0.055, 0.20]} radius={0.015} smoothness={4} position={[0, -0.06, 0.04]}>
            <meshStandardMaterial {...MAT_FRAME_STEEL} />
          </RoundedBox>

          {/* Weight-Relief Flange Chamfers */}
          <mesh position={[0, -0.18, -0.21]}>
            <boxGeometry args={[0.052, 0.16, 0.06]} />
            <meshStandardMaterial {...MAT_DARK_RECESS} />
          </mesh>
        </group>
      ))}

      {/* 5. Transverse Structural Rigidity Tie-Rods */}
      {/* Rear Upper Tie-Rod Tube */}
      <mesh position={[0, 0.14, -0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.36, 16]} />
        <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
      </mesh>
      {/* Polished Brass Center Tie Sleeve */}
      <mesh position={[0, 0.14, -0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.020, 0.020, 0.16, 20]} />
        <meshStandardMaterial {...MAT_POLISHED_BRASS} />
      </mesh>
      {/* End Retaining Jam Nuts */}
      {[-0.20, 0.20].map((nx, idx) => (
        <mesh key={`tie_nut_${idx}`} position={[nx, 0.14, -0.28]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>
      ))}

      {/* 6. Front Vertical Rocker Guide Fork Uprights (Z = 0.12) */}
      <group position={[0, 0, 0.12]}>
        {/* Left & Right Vertical Guide Horns */}
        {[-0.065, 0.065].map((gx, idx) => (
          <group key={`guide_horn_${idx}`} position={[gx, -0.14, 0]}>
            <RoundedBox args={[0.026, 0.42, 0.06]} radius={0.01} smoothness={4}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>
            {/* Low-Friction Polished Brass Internal Wear Liner Strip */}
            <mesh position={[gx > 0 ? -0.014 : 0.014, 0, 0]}>
              <boxGeometry args={[0.006, 0.38, 0.045]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* Lower Cross Tie Bridge Beneath Specimen Throat */}
        <RoundedBox args={[0.18, 0.035, 0.06]} radius={0.008} smoothness={4} position={[0, -0.34, 0]}>
          <meshStandardMaterial {...MAT_FRAME_STEEL} />
        </RoundedBox>
      </group>
    </group>
  ),
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): POLISHED BRASS HAND-CRANK HANDLE & WOODEN GRIP
// ============================================================================
const ModuleDrive: ModularPartSpec = {
  id: "t1_drive_crank",
  name: "Polished Brass Hand-Crank Handle & Turned Hardwood Grip",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "right",
  travelDistance: 2.8,
  targetSocket: [0.24, 0.95, -0.28],
  sparkColor: "#D97706",
  sparkCount: 20,
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { crankAngle } = getHammerKinematics(localFrame, isRunning, isBroken);

    return (
      <group position={[0, 0, 0]}>
        {/* Revolving Crank Assembly (Rotates around X-axis with Camshaft) */}
        <group rotation={[crankAngle, 0, 0]}>
          {/* 1. Heavy Polished Brass Crank Hub */}
          <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.046, 0.046, 0.042, 24]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>

          {/* Hub Split Clamping Ears & Pinch Hex Bolt */}
          <mesh position={[0.02, 0.045, 0]}>
            <boxGeometry args={[0.038, 0.022, 0.030]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0.02, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.036, 6]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>

          {/* 2. Inertia Flywheel Rim with 4 Curved Brass Spokes */}
          <group position={[0.032, 0, 0]}>
            {/* Outer Flywheel Balance Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.022, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Rim Recess / Lightening Ring */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.155, 0.155, 0.024, 32]} />
              <meshStandardMaterial {...MAT_DARK_RECESS} />
            </mesh>
            {/* 4 Curved Balanced Spokes */}
            {[0, 90, 180, 270].map((deg, s) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <mesh key={`spoke_${s}`} position={[0, Math.cos(rad) * 0.08, Math.sin(rad) * 0.08]} rotation={[rad, 0, 0]}>
                  <cylinderGeometry args={[0.010, 0.012, 0.14, 16]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              );
            })}
          </group>

          {/* 3. Polished Brass Crank Web Arm (Radius = 0.22m) */}
          <group position={[0.040, 0.10, 0]}>
            <RoundedBox args={[0.024, 0.23, 0.044]} radius={0.01} smoothness={4}>
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </RoundedBox>
          </group>

          {/* Crank Arm Counterweight Lobe (Opposite to handle) */}
          <group position={[0.040, -0.065, 0]}>
            <RoundedBox args={[0.028, 0.09, 0.065]} radius={0.012} smoothness={4}>
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </RoundedBox>
          </group>

          {/* 4. Turned Hardwood Handle Grip on Steel/Brass Spindle Pin */}
          <group position={[0.045, 0.20, 0]}>
            {/* Brass Crank Pin Journal */}
            <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.011, 0.011, 0.13, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Ergonomic Turned Hardwood Ash Grip (Free-spinning) */}
            <mesh position={[0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.017, 0.105, 20]} />
              <meshStandardMaterial {...MAT_HARDWOOD_GRIP} />
            </mesh>

            {/* Turned Wood Grip Barrel Bulge Ribs */}
            <mesh position={[0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.026, 0.026, 0.035, 20]} />
              <meshStandardMaterial {...MAT_HARDWOOD_GRIP} />
            </mesh>

            {/* Outer Polished Brass Retaining Flange & Dome Acorn Nut */}
            <mesh position={[0.112, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.008, 20]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0.120, 0, 0]}>
              <sphereGeometry args={[0.014, 16, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): CRUDE CARBON STEEL HAMMER RAM & ROCKER ARM
// ============================================================================
const ModuleToolhead: ModularPartSpec = {
  id: "t1_toolhead_ram",
  name: "Crude Carbon Steel Hammer Ram & Pivoting Hardwood Rocker Arm",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "top",
  travelDistance: 3.0,
  targetSocket: [0, 1.00, 0],
  sparkColor: "#F59E0B",
  sparkCount: 22,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.016, 0.08, 0.02],
    rotationImpulse: [0.12, 0.02, -0.06],
    sparkOrigin: [0, 0.95, 0.04],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { tiltAngle, impactShake, ramHeadY } = getHammerKinematics(localFrame, isRunning, isBroken);
    const broken = isBroken || localFrame >= 265;

    return (
      <group position={[0, impactShake, 0]}>
        {/* Dynamic Pivoting Rocker Assembly (Pivots around fulcrum pin at [0, 0, -0.05]) */}
        <group position={[0, 0, -0.05]} rotation={[tiltAngle, 0, 0]}>
          {/* 1. Rocker Fulcrum Bearing Sleeve Hub */}
          <group position={[0, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 0.11, 24]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Grease Lubricator Cup atop Fulcrum Hub */}
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.022, 12]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>

          {/* 2. Rear Cam-Follower Tail (Extends back to Z = -0.23, resting on cam) */}
          <group position={[0, 0, 0]}>
            {/* Forged Steel Clevis Tail Fork */}
            <RoundedBox args={[0.078, 0.045, 0.22]} radius={0.01} smoothness={4} position={[0, -0.01, -0.115]}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>

            {/* Hardened Steel Follower Axle Pin & Rotating Cam Follower Roller */}
            <group position={[0, -0.02, -0.23]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.048, 24]} />
                <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
              </mesh>
              {/* Bronze Low-Friction Side Thrust Washers */}
              {[-0.026, 0.026].map((rx, idx) => (
                <mesh key={`roller_wash_${idx}`} position={[rx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.030, 0.030, 0.005, 20]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              ))}
            </group>
          </group>

          {/* 3. Hardwood Rocker Helve Beam (Ash Wood) */}
          {!broken ? (
            /* Intact Running State (Frames 0..264) */
            <group position={[0, 0, 0]}>
              {/* Main Ash Hardwood Helve Beam (Z = 0 to 0.17) */}
              <RoundedBox args={[0.065, 0.078, 0.18]} radius={0.015} smoothness={4} position={[0, 0.015, 0.09]}>
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </RoundedBox>

              {/* Forged Steel Helve Reinforcement Clamping Straps & Rivets */}
              {[0.04, 0.13].map((sz, idx) => (
                <group key={`strap_${idx}`} position={[0, 0.015, sz]}>
                  <mesh>
                    <boxGeometry args={[0.070, 0.084, 0.018]} />
                    <meshStandardMaterial {...MAT_FRAME_STEEL} />
                  </mesh>
                  {/* Brass Rivet Studs */}
                  {[-0.036, 0.036].map((rx, j) => (
                    <mesh key={`rivet_${j}`} position={[rx, 0, 0]}>
                      <cylinderGeometry args={[0.004, 0.004, 0.088, 12]} />
                      <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                    </mesh>
                  ))}
                </group>
              ))}

              {/* Tempered Arched Helve Leaf Spring Pack (Assisted Downward Acceleration) */}
              <group position={[0, 0.065, 0.04]}>
                {/* Master Tempered Leaf Strip */}
                <mesh position={[0, 0, 0]} rotation={[-0.08, 0, 0]}>
                  <boxGeometry args={[0.048, 0.008, 0.22]} />
                  <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
                </mesh>
                {/* Secondary Tempered Leaf Strip */}
                <mesh position={[0, 0.008, 0.01]} rotation={[-0.08, 0, 0]}>
                  <boxGeometry args={[0.048, 0.008, 0.15]} />
                  <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
                </mesh>
                {/* Center Spring U-Bolt Clamp */}
                <mesh position={[0, 0.008, 0]}>
                  <boxGeometry args={[0.056, 0.024, 0.025]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              </group>
            </group>
          ) : (
            /* Catastrophic Overload Fractured State (Frame 265+) */
            <group position={[0, 0, 0]}>
              {/* Rear Fractured Wooden Stump at Pivot Pin */}
              <RoundedBox args={[0.065, 0.078, 0.08]} radius={0.012} smoothness={4} position={[0, 0.015, 0.04]}>
                <meshStandardMaterial {...MAT_HARDWOOD_ASH} />
              </RoundedBox>

              {/* Jagged Splintered Wood Grain at Rupture Shear Plane */}
              {[-0.02, -0.005, 0.01, 0.022].map((sx, idx) => (
                <mesh key={`splinter_rear_${idx}`} position={[sx, 0.015 + (idx % 2) * 0.01, 0.085]} rotation={[0.1 * idx, 0.2, 0]}>
                  <cylinderGeometry args={[0.003, 0.006, 0.035, 6]} />
                  <meshStandardMaterial {...MAT_SPLINTER_WOOD} />
                </mesh>
              ))}

              {/* Buckled / Snapped Leaf Spring Flaring Upwards */}
              <group position={[0, 0.08, 0.02]}>
                <mesh rotation={[-0.35, 0, 0.12]}>
                  <boxGeometry args={[0.048, 0.008, 0.11]} />
                  <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
                </mesh>
              </group>
            </group>
          )}
        </group>

        {/* 4. Crude Carbon Steel Hammer Ram Head (Sliding vertically in guide fork at Z = 0.12) */}
        <group position={[0, ramHeadY, 0.12]}>
          {/* If broken, the severed front beam segment rebounds slightly upwards away from specimen */}
          <group rotation={broken ? [0.04, 0.02, 0.04] : [0, 0, 0]} position={broken ? [0.01, 0.01, 0.01] : [0, 0, 0]}>
            {/* Forged Steel Hammer Socket Collar */}
            <RoundedBox args={[0.085, 0.096, 0.085]} radius={0.015} smoothness={4} position={[0, 0.015, 0]}>
              <meshStandardMaterial {...MAT_FRAME_STEEL} />
            </RoundedBox>

            {/* If broken, display mating jagged wooden splinter fibers from severed front */}
            {broken && (
              <group position={[0, 0.015, -0.05]}>
                {[-0.018, 0.002, 0.02].map((fx, idx) => (
                  <mesh key={`splinter_front_${idx}`} position={[fx, 0, 0]} rotation={[-0.15, -0.1, 0]}>
                    <cylinderGeometry args={[0.004, 0.006, 0.03, 6]} />
                    <meshStandardMaterial {...MAT_SPLINTER_WOOD} />
                  </mesh>
                ))}
              </group>
            )}

            {/* Massive Crude Carbon Steel Hammer Ram (Tup Block) */}
            <group position={[0, -0.16, 0]}>
              {/* Main Carbon Steel Ram Body */}
              <RoundedBox args={[0.16, 0.26, 0.16]} radius={0.022} smoothness={4}>
                <meshStandardMaterial {...MAT_CRUDE_CARBON_STEEL} />
              </RoundedBox>

              {/* Vertical Weight-Relief Flute Recesses */}
              {[-0.081, 0.081].map((fx, idx) => (
                <mesh key={`ram_flute_${idx}`} position={[fx, 0, 0]}>
                  <boxGeometry args={[0.006, 0.18, 0.09]} />
                  <meshStandardMaterial {...MAT_DARK_RECESS} />
                </mesh>
              ))}

              {/* Transverse Hardened Locking Wedge Key & Drift Through Ram */}
              <group position={[0, 0.04, 0]}>
                <mesh>
                  <boxGeometry args={[0.20, 0.036, 0.042]} />
                  <meshStandardMaterial {...MAT_MACHINED_STEEL} />
                </mesh>
                {/* Protruding Taper Wedge Nose */}
                <mesh position={[0.105, 0, 0]}>
                  <cylinderGeometry args={[0.016, 0.020, 0.02, 6]} />
                  <meshStandardMaterial {...MAT_MACHINED_STEEL} />
                </mesh>
                <mesh position={[-0.105, 0, 0]}>
                  <boxGeometry args={[0.010, 0.028, 0.032]} />
                  <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
                </mesh>
              </group>

              {/* Polished Brass Maker's Plate on Ram Front Face */}
              <mesh position={[0, -0.04, 0.081]}>
                <boxGeometry args={[0.11, 0.045, 0.005]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>

              {/* 5. Hardened Tool-Steel Bottom Striking Die Nose (Points DOWN along Y into Specimen) */}
              <group position={[0, -0.155, 0]}>
                {/* Tapered Striking Nose Collar */}
                <RoundedBox args={[0.13, 0.05, 0.13]} radius={0.012} smoothness={4}>
                  <meshStandardMaterial {...MAT_FRAME_STEEL} />
                </RoundedBox>

                {/* Hardened Ground Mirror Steel Striking Face Die */}
                <mesh position={[0, -0.028, 0]}>
                  <boxGeometry args={[0.115, 0.008, 0.115]} />
                  <meshStandardMaterial {...MAT_MACHINED_STEEL} />
                </mesh>

                {/* Striking Face Chamfered Perimeter Bevel */}
                <mesh position={[0, -0.024, 0]}>
                  <boxGeometry args={[0.122, 0.006, 0.122]} />
                  <meshStandardMaterial {...MAT_RAW_TOOL_STEEL} />
                </mesh>
              </group>
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
export const HammerTier1Spec: MachineAssemblySpec = {
  id: "hammer_tier1_manual",
  name: "Tier 1: $10 Manual Helve Trip Hammer",
  tier: 1,
  strikeFrames: [160, 172, 184, 196, 208, 220],
  strikeIntensity: 0.040,
  modules: [
    ModuleBase,
    ModuleCamPinCore,
    ModuleFrame,
    ModuleDrive,
    ModuleToolhead,
  ],
};

// Backward compatibility aliases
export const HammerTier1AssemblySpec = HammerTier1Spec;
export default HammerTier1Spec;
