import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 1 ($10 MANUAL LEVEL) MODULAR SHREDDER SPECIFICATION
 * ============================================================================
 * 
 * Strict Mechanical Inside-Out Sequence:
 * Order 0 (Frame 0f):  Base - Cast-Iron Table Vise Clamp with Lead Screw Handle
 * Order 1 (Frame 20f): Shaft/Core - Raw Steel Unpolished Dual Hex Cutting Shafts & Bushings (BEFORE casing)
 * Order 2 (Frame 40f): Frame - Minimalist Open Skeleton Cutting Frame & Comb Strippers (<RoundedBox radius={0.02}>)
 * Order 3 (Frame 60f): Drive - Polished Brass Hand-Crank & Intermeshing Spur Gears with Teak/Rubber Grip
 * Order 4 (Frame 75f): Toolhead - Crude Carbon Steel Dual Interleaved Slitter Cutters into Specimen
 * 
 * Material Triad & Contrast:
 * - Cast Iron: #1E293B (roughness: 0.7, metalness: 0.4)
 * - Polished Warm Brass: #D97706 (roughness: 0.15, metalness: 0.95)
 * - Raw / Tool Steel: #64748B / #334155 (roughness: 0.5, metalness: 0.85)
 * - Bright Machined Steel Edges: #CBD5E1 / #E2E8F0 (roughness: 0.12, metalness: 0.95)
 */

// Left & Right shaft centerlines
const SHAFT_SPACING = 0.22; // 220mm between shafts
const LEFT_SHAFT_X = -SHAFT_SPACING / 2; // -0.11m
const RIGHT_SHAFT_X = SHAFT_SPACING / 2; // +0.11m
const CUTTER_RADIUS = 0.122; // Overlaps by 24mm at center nip (x = 0)

// Helper: Calculate rotation angle from localFrame & rpm
function getCrankAngle(props: ModularPartRenderProps): number {
  const { localFrame, isRunning, rpm } = props;
  if (isRunning) {
    return (localFrame * (rpm || 90) * Math.PI) / 1800;
  }
  if (localFrame >= 75) {
    return (localFrame - 75) * 0.25;
  }
  return 0;
}

// ============================================================================
// MODULE 0: BASE TABLE VISE CLAMP & COLUMN (Order 0, Frame 0f)
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "tier1_base",
  name: "Cast-Iron Table Vise Clamp & Pedestal",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#94A3B8",
  sparkCount: 12,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Cast-Iron Workbench Plinth Plate */}
      <RoundedBox args={[0.72, 0.10, 0.64]} radius={0.02} smoothness={4} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {/* 4 Corner Anchor Bolt Bosses & Zinc Hex Bolts */}
      {[
        [-0.30, -0.26],
        [0.30, -0.26],
        [-0.30, 0.26],
        [0.30, 0.26],
      ].map(([x, z], idx) => (
        <group key={`bolt_${idx}`} position={[x, 0.10, z]}>
          <cylinderGeometry args={[0.028, 0.032, 0.02, 16]} />
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.025, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Machined Table-Mounting T-Slot Guide */}
      <mesh position={[0, 0.101, 0]}>
        <boxGeometry args={[0.64, 0.01, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* 2. Upright Cast-Iron Support Stanchion Column */}
      <RoundedBox args={[0.22, 1.28, 0.26]} radius={0.025} smoothness={4} position={[0, 0.74, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {/* Triangular Stiffening Gussets (Left, Right, Rear) */}
      <group position={[-0.14, 0.22, 0]}>
        <RoundedBox args={[0.06, 0.26, 0.20]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
      </group>
      <group position={[0.14, 0.22, 0]}>
        <RoundedBox args={[0.06, 0.26, 0.20]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
      </group>
      <group position={[0, 0.22, -0.16]}>
        <RoundedBox args={[0.16, 0.26, 0.06]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
      </group>

      {/* Cast Iron Foundry Relief Plate on Column Face */}
      <RoundedBox args={[0.16, 0.07, 0.016]} radius={0.005} smoothness={4} position={[0, 0.95, 0.138]}>
        <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.9} />
      </RoundedBox>

      {/* 3. Workbench C-Clamp Throat & Brass Lead Screw Handle */}
      <group position={[0, 0.52, 0.22]}>
        {/* Upper Fixed Clamp Anvil Pad */}
        <RoundedBox args={[0.28, 0.07, 0.18]} radius={0.015} smoothness={4} position={[0, 0.12, 0.02]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* C-Frame Spine Curving Down */}
        <RoundedBox args={[0.16, 0.36, 0.08]} radius={0.015} smoothness={4} position={[0, -0.04, 0.11]}>
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
        </RoundedBox>

        {/* Lower Threaded Collar Boss */}
        <mesh position={[0, -0.20, 0.02]}>
          <cylinderGeometry args={[0.038, 0.038, 0.06, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Polished Warm Brass Acme Lead Screw */}
        <mesh position={[0, -0.10, 0.02]}>
          <cylinderGeometry args={[0.022, 0.022, 0.22, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Swivel Clamping Pad at top of screw */}
        <mesh position={[0, 0.01, 0.02]}>
          <cylinderGeometry args={[0.034, 0.034, 0.018, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Screw Lower Collar Hub */}
        <mesh position={[0, -0.23, 0.02]}>
          <cylinderGeometry args={[0.026, 0.026, 0.04, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Polished Brass Tommy Bar / T-Handle Crossbar */}
        <mesh position={[0, -0.25, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.010, 0.010, 0.22, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Spherical End Caps on T-Handle */}
        <mesh position={[-0.11, -0.25, 0.02]}>
          <sphereGeometry args={[0.016, 14, 14]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>
        <mesh position={[0.11, -0.25, 0.02]}>
          <sphereGeometry args={[0.016, 14, 14]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* 4. Upper Machine Saddle Bed Platform (at y = 1.38) */}
      <RoundedBox args={[0.56, 0.08, 0.46]} radius={0.02} smoothness={4} position={[0, 1.38, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {/* 4 Hex Saddle Fastener Bolts */}
      {[
        [-0.24, -0.18],
        [0.24, -0.18],
        [-0.24, 0.18],
        [0.24, 0.18],
      ].map(([x, z], idx) => (
        <mesh key={`saddle_bolt_${idx}`} position={[x, 1.43, z]}>
          <cylinderGeometry args={[0.014, 0.014, 0.024, 6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.9} />
        </mesh>
      ))}

      {/* 5. Lower Catch Funnel / Shredded Chute */}
      <RoundedBox args={[0.48, 0.34, 0.38]} radius={0.018} smoothness={4} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.65} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.97, 0]}>
        <boxGeometry args={[0.38, 0.02, 0.30]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>
    </group>
  ),
};

// ============================================================================
// MODULE 1: RAW STEEL DUAL CUTTING SHAFTS & BUSHINGS (Order 1, Frame 20f)
// Arrives BEFORE casing!
// ============================================================================
const ModuleInternalCore: ModularPartSpec = {
  id: "tier1_shafts_core",
  name: "Raw Steel Dual Hex Cutting Shafts & Bushings",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.5,
  targetSocket: [0, 1.62, 0],
  sparkColor: "#38BDF8",
  sparkCount: 16,
  render: (props) => {
    const angle = getCrankAngle(props);

    return (
      <group position={[0, 0, 0]}>
        {/* Front & Rear Cast Bearing Flange Plates */}
        <RoundedBox args={[0.52, 0.20, 0.04]} radius={0.015} smoothness={4} position={[0, 0, 0.26]}>
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.52, 0.20, 0.04]} radius={0.015} smoothness={4} position={[0, 0, -0.26]}>
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
        </RoundedBox>

        {/* Polished Brass Sleeve Bushings & Oil Zerks at Both Ends */}
        {[
          [LEFT_SHAFT_X, 0.26],
          [RIGHT_SHAFT_X, 0.26],
          [LEFT_SHAFT_X, -0.26],
          [RIGHT_SHAFT_X, -0.26],
        ].map(([x, z], idx) => (
          <group key={`bushing_${idx}`} position={[x, 0, z]}>
            {/* Brass Sleeve Collar */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.052, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* Grease Oiler Nipple */}
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.016, 8]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* Left Shaft Assembly (Clockwise rotation: -angle) */}
        <group position={[LEFT_SHAFT_X, 0, 0]} rotation={[0, 0, -angle]}>
          {/* Raw Steel Unpolished Hexagonal Cutting Shaft */}
          <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.72, 6]} />
            <meshStandardMaterial color="#64748B" roughness={0.48} metalness={0.85} />
          </mesh>

          {/* Front Shaft Extension Stub for Hand-Crank Mounting */}
          <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.12, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
          </mesh>

          {/* Shaft End Lock Collar */}
          <mesh position={[0, 0, -0.30]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.028, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </mesh>
        </group>

        {/* Right Shaft Assembly (Counter-Clockwise rotation: +angle) */}
        <group position={[RIGHT_SHAFT_X, 0, 0]} rotation={[0, 0, angle]}>
          {/* Raw Steel Unpolished Hexagonal Cutting Shaft */}
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.66, 6]} />
            <meshStandardMaterial color="#64748B" roughness={0.48} metalness={0.85} />
          </mesh>

          {/* Front Shaft Extension Stub for Driven Spur Gear */}
          <mesh position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.08, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
          </mesh>

          {/* Shaft End Lock Collar */}
          <mesh position={[0, 0, -0.30]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.028, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 2: MINIMALIST OPEN SKELETON CUTTING FRAME (Order 2, Frame 40f)
// Minimalist open skeleton cutting frame (<RoundedBox radius={0.02}>)
// ============================================================================
const ModuleSkeletonFrame: ModularPartSpec = {
  id: "tier1_skeleton_frame",
  name: "Minimalist Skeleton Cutting Frame & Comb Strippers",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "top",
  travelDistance: 3.2,
  targetSocket: [0, 1.62, 0],
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Left Open Skeleton Cheek Truss (allows full visual inspection of blades) */}
      <group position={[-0.23, 0.02, 0]}>
        {/* Top Longitudinal Rail */}
        <RoundedBox args={[0.035, 0.07, 0.54]} radius={0.015} smoothness={4} position={[0, 0.18, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Bottom Longitudinal Rail */}
        <RoundedBox args={[0.035, 0.07, 0.54]} radius={0.015} smoothness={4} position={[0, -0.18, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Front Upright Strut */}
        <RoundedBox args={[0.035, 0.32, 0.07]} radius={0.015} smoothness={4} position={[0, 0, 0.235]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Rear Upright Strut */}
        <RoundedBox args={[0.035, 0.32, 0.07]} radius={0.015} smoothness={4} position={[0, 0, -0.235]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Central Arch Truss Stiffener */}
        <RoundedBox args={[0.035, 0.32, 0.05]} radius={0.015} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
      </group>

      {/* 2. Right Open Skeleton Cheek Truss */}
      <group position={[0.23, 0.02, 0]}>
        {/* Top Longitudinal Rail */}
        <RoundedBox args={[0.035, 0.07, 0.54]} radius={0.015} smoothness={4} position={[0, 0.18, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Bottom Longitudinal Rail */}
        <RoundedBox args={[0.035, 0.07, 0.54]} radius={0.015} smoothness={4} position={[0, -0.18, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Front Upright Strut */}
        <RoundedBox args={[0.035, 0.32, 0.07]} radius={0.015} smoothness={4} position={[0, 0, 0.235]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Rear Upright Strut */}
        <RoundedBox args={[0.035, 0.32, 0.07]} radius={0.015} smoothness={4} position={[0, 0, -0.235]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        {/* Central Arch Truss Stiffener */}
        <RoundedBox args={[0.035, 0.32, 0.05]} radius={0.015} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
      </group>

      {/* 3. 4 Structural Tool Steel Tie Rods with Polished Brass Nuts */}
      {[
        [0.18, 0.22],
        [0.18, -0.22],
        [-0.15, 0.22],
        [-0.15, -0.22],
      ].map(([y, z], idx) => (
        <group key={`tie_rod_${idx}`} position={[0, y, z]}>
          {/* Solid Steel Cross Tie Rod */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.48, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
          </mesh>
          {/* Polished Brass Retention Hex Nuts on Outer Cheeks */}
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.022, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.022, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 4. Minimalist Flared Stamped Top Hopper Lips & Open Frame Collar */}
      <group position={[0, 0.26, 0]}>
        {/* Front Guide Infeed Slope */}
        <mesh position={[0, 0.02, 0.17]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[0.42, 0.14, 0.012]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Rear Guide Infeed Slope */}
        <mesh position={[0, 0.02, -0.17]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.42, 0.14, 0.012]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Hollow Open Rim Frame (keeps top view into cutters completely clear) */}
        <group position={[0, 0.08, 0]}>
          {/* Front Rim Rail */}
          <RoundedBox args={[0.45, 0.024, 0.035]} radius={0.008} smoothness={4} position={[0, 0, 0.19]}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </RoundedBox>
          {/* Rear Rim Rail */}
          <RoundedBox args={[0.45, 0.024, 0.035]} radius={0.008} smoothness={4} position={[0, 0, -0.19]}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </RoundedBox>
          {/* Left Rim Rail */}
          <RoundedBox args={[0.035, 0.024, 0.35]} radius={0.008} smoothness={4} position={[-0.21, 0, 0]}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </RoundedBox>
          {/* Right Rim Rail */}
          <RoundedBox args={[0.035, 0.024, 0.35]} radius={0.008} smoothness={4} position={[0.21, 0, 0]}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </RoundedBox>
        </group>
      </group>

      {/* 5. Lower Comb Stripper Bars (Prevents specimen wrapping) */}
      <group position={[0, -0.16, 0]}>
        {/* Left Comb Spine */}
        <mesh position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.025, 0.020, 0.42]} />
          <meshStandardMaterial color="#0F172A" roughness={0.85} />
        </mesh>
        {/* Right Comb Spine */}
        <mesh position={[0.05, 0, 0]}>
          <boxGeometry args={[0.025, 0.020, 0.42]} />
          <meshStandardMaterial color="#0F172A" roughness={0.85} />
        </mesh>
        {/* Interleaved Comb Stripper Teeth Fingers */}
        {[-0.15, -0.10, -0.05, 0.0, 0.05, 0.10, 0.15].map((z, idx) => (
          <mesh key={`comb_${idx}`} position={[0, 0, z]}>
            <boxGeometry args={[0.08, 0.008, 0.014]} />
            <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  ),
};

// ============================================================================
// MODULE 3: BRASS HAND-CRANK DRIVE & SPUR GEARS (Order 3, Frame 60f)
// Overload fracture at frame 265f
// ============================================================================
const ModuleDrive: ModularPartSpec = {
  id: "tier1_hand_crank_drive",
  name: "Brass Hand-Crank Handle & Intermeshing Spur Gears",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "front",
  travelDistance: 2.8,
  targetSocket: [0, 1.62, 0.28],
  sparkColor: "#D97706",
  sparkCount: 18,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.18, -0.25, 0.12],
    rotationImpulse: [1.4, 0.3, 2.0],
    sparkOrigin: [-0.11, 0, 0.1],
    sparkColor: "#EF4444",
  },
  render: (props) => {
    const angle = getCrankAngle(props);
    const toothCount = 16;
    const gearPitchRadius = 0.11; // 110mm radius = 220mm center distance

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Left Drive Spur Gear (Mounted on left shaft, rotates clockwise: -angle) */}
        <group position={[LEFT_SHAFT_X, 0, 0.02]} rotation={[0, 0, -angle]}>
          {/* Main Gear Disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.024, 32]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* 16 Radial Involute Gear Teeth */}
          {Array.from({ length: toothCount }).map((_, i) => {
            const rad = (i * 2 * Math.PI) / toothCount;
            return (
              <mesh
                key={`l_gear_tooth_${i}`}
                position={[Math.cos(rad) * gearPitchRadius, Math.sin(rad) * gearPitchRadius, 0]}
                rotation={[0, 0, rad]}
              >
                <boxGeometry args={[0.014, 0.022, 0.024]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            );
          })}
          {/* Recessed Center Web & Brass Retaining Nut */}
          <mesh position={[0, 0, 0.013]}>
            <cylinderGeometry args={[0.038, 0.038, 0.012, 20]} />
            <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>

        {/* 2. Right Driven Spur Gear (Mounted on right shaft, rotates counter-clockwise: +angle) */}
        <group position={[RIGHT_SHAFT_X, 0, 0.02]} rotation={[0, 0, angle]}>
          {/* Main Gear Disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.024, 32]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* 16 Radial Involute Gear Teeth (offset by half tooth pitch for perfect intermesh) */}
          {Array.from({ length: toothCount }).map((_, i) => {
            const rad = ((i + 0.5) * 2 * Math.PI) / toothCount;
            return (
              <mesh
                key={`r_gear_tooth_${i}`}
                position={[Math.cos(rad) * gearPitchRadius, Math.sin(rad) * gearPitchRadius, 0]}
                rotation={[0, 0, rad]}
              >
                <boxGeometry args={[0.014, 0.022, 0.024]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            );
          })}
          {/* Center Hub & Brass Locking Collar */}
          <mesh position={[0, 0, 0.013]}>
            <cylinderGeometry args={[0.038, 0.038, 0.012, 20]} />
            <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>

        {/* 3. Polished Brass Hand-Crank Lever Arm (Revolves with left shaft: -angle) */}
        <group position={[LEFT_SHAFT_X, 0, 0.05]} rotation={[0, 0, -angle]}>
          {/* Central Mounting Hub Boss */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.032, 24]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Mirror Chrome Center Acorn Lock Nut */}
          <mesh position={[0, 0, 0.02]}>
            <cylinderGeometry args={[0.018, 0.018, 0.018, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
          </mesh>

          {/* Chamfered Brass Crank Lever Arm (Length: 260mm) */}
          <RoundedBox args={[0.040, 0.26, 0.020]} radius={0.01} smoothness={4} position={[0, 0.12, 0.01]}>
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </RoundedBox>

          {/* Milled Weight-Reduction Center Slot */}
          <mesh position={[0, 0.12, 0.011]}>
            <boxGeometry args={[0.016, 0.18, 0.022]} />
            <meshStandardMaterial color="#B45309" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Outer Spindle Pivot Boss */}
          <mesh position={[0, 0.24, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.028, 20]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* 4. Ergonomic Grip Handle (Turned Teak Wood with Brass End Ferrules) */}
          <group position={[0, 0.24, 0.02]}>
            {/* Brass Spindle Pin */}
            <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.010, 0.010, 0.08, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Brass Inner Shoulder Washer */}
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.008, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Contoured Teak Wood Grip Barrel (Rotates freely on pin) */}
            <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.018, 0.13, 24]} />
              <meshStandardMaterial color="#78350F" roughness={0.45} metalness={0.05} />
            </mesh>

            {/* Outer Brass Ferrule Trim */}
            <mesh position={[0, 0, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.010, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Mirror Chrome Domed Retention Screw Head */}
            <mesh position={[0, 0, 0.165]}>
              <sphereGeometry args={[0.014, 14, 14]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4: CRUDE CARBON STEEL DUAL CUTTER BLADES (Order 4, Frame 75f)
// Interleaves into specimen nip zone
// ============================================================================
const ModuleToolhead: ModularPartSpec = {
  id: "tier1_cutter_blades",
  name: "Crude Carbon Steel Dual Interleaved Slitter Cutters",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "top",
  travelDistance: 2.6,
  targetSocket: [0, 1.62, 0],
  sparkColor: "#10B981",
  sparkCount: 20,
  fracture: {
    breakFrame: 265,
    mode: "shudder_and_crack",
    impulse: [0.03, -0.01, 0.02],
    rotationImpulse: [0.05, 0.02, 0.08],
    sparkOrigin: [0, 0, 0],
    sparkColor: "#EF4444",
  },
  render: (props) => {
    const angle = getCrankAngle(props);

    // Left discs: 8 discs spaced along Z
    const leftDiscZ = [-0.175, -0.125, -0.075, -0.025, 0.025, 0.075, 0.125, 0.175];
    // Right discs: 7 interleaved discs offset by half-pitch (0.025m)
    const rightDiscZ = [-0.150, -0.100, -0.050, 0.000, 0.050, 0.100, 0.150];

    const clawCount = 4;

    return (
      <group position={[0, 0, 0]}>
        {/* Left Shaft Rotary Slitter Cutters Array (Clockwise: -angle) */}
        <group position={[LEFT_SHAFT_X, 0, 0]} rotation={[0, 0, -angle]}>
          {leftDiscZ.map((z, discIdx) => (
            <group key={`left_cutter_${discIdx}`} position={[0, 0, z]}>
              {/* Main Carbon Steel Disc */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[CUTTER_RADIUS, CUTTER_RADIUS, 0.016, 24]} />
                <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.75} />
              </mesh>

              {/* Machined Bright Sharp Cutting Rim */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[CUTTER_RADIUS + 0.001, CUTTER_RADIUS + 0.001, 0.004, 24]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
              </mesh>

              {/* 4 Inward Hooked Shearing Teeth Claws */}
              {Array.from({ length: clawCount }).map((_, cIdx) => {
                const rad = (cIdx * 2 * Math.PI) / clawCount + discIdx * 0.2;
                return (
                  <mesh
                    key={`l_claw_${cIdx}`}
                    position={[
                      Math.cos(rad) * (CUTTER_RADIUS - 0.006),
                      Math.sin(rad) * (CUTTER_RADIUS - 0.006),
                      0,
                    ]}
                    rotation={[0, 0, rad - 0.45]}
                  >
                    <boxGeometry args={[0.028, 0.014, 0.016]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
                  </mesh>
                );
              })}

              {/* Darkened Phosphate Spacer Collar Between Blades */}
              <mesh position={[0, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.044, 0.044, 0.028, 16]} />
                <meshStandardMaterial color="#0F172A" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Right Shaft Rotary Slitter Cutters Array (Counter-Clockwise: +angle) */}
        <group position={[RIGHT_SHAFT_X, 0, 0]} rotation={[0, 0, angle]}>
          {rightDiscZ.map((z, discIdx) => (
            <group key={`right_cutter_${discIdx}`} position={[0, 0, z]}>
              {/* Main Carbon Steel Disc */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[CUTTER_RADIUS, CUTTER_RADIUS, 0.016, 24]} />
                <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.75} />
              </mesh>

              {/* Machined Bright Sharp Cutting Rim */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[CUTTER_RADIUS + 0.001, CUTTER_RADIUS + 0.001, 0.004, 24]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
              </mesh>

              {/* 4 Inward Hooked Shearing Teeth Claws (Hooked in opposing sense to pull down) */}
              {Array.from({ length: clawCount }).map((_, cIdx) => {
                const rad = (cIdx * 2 * Math.PI) / clawCount + discIdx * 0.2 + 0.4;
                return (
                  <mesh
                    key={`r_claw_${cIdx}`}
                    position={[
                      Math.cos(rad) * (CUTTER_RADIUS - 0.006),
                      Math.sin(rad) * (CUTTER_RADIUS - 0.006),
                      0,
                    ]}
                    rotation={[0, 0, rad + 0.45]}
                  >
                    <boxGeometry args={[0.028, 0.014, 0.016]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
                  </mesh>
                );
              })}

              {/* Darkened Phosphate Spacer Collar Between Blades */}
              <mesh position={[0, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.044, 0.044, 0.028, 16]} />
                <meshStandardMaterial color="#0F172A" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  },
};

// ============================================================================
// EXPORT SPECIFICATIONS
// ============================================================================
export const Tier1Spec: ModularPartSpec[] = [
  ModuleBase,
  ModuleInternalCore,
  ModuleSkeletonFrame,
  ModuleDrive,
  ModuleToolhead,
];

export const Tier1AssemblySpec: MachineAssemblySpec = {
  id: "tier1_manual_desk_shredder",
  name: "Tier 1: $10 Manual Desk Shredder",
  tier: 1,
  modules: Tier1Spec,
};
