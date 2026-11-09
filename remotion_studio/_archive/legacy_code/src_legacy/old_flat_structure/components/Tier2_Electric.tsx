import React from "react";
import { RoundedBox } from "@react-three/drei";
import { MachineAssemblySpec, ModularPartSpec } from "./AssemblyContract";

/**
 * Tier 2 ($100 Electric Level) Modular Specification: Electric Twin Shredder
 * 
 * Enforces the Golden Inside-Out Assembly Sequence:
 * Order 0 (Frame 0f):  Welded sheet metal workshop pedestal with anchor bolts.
 * Order 1 (Frame 20f): Copper-wound armature rotor and bearings on twin shafts. (Arrives BEFORE casing!)
 * Order 2 (Frame 40f): Finned electric motor stator housing and cutting chamber (<RoundedBox radius={0.025}>).
 * Order 3 (Frame 60f): Dual-sprocket roller chain drive with chrome tensioner.
 * Order 4 (Frame 75f): High-speed carbide multi-tooth cutter discs pointing into specimen.
 * 
 * Material Triad:
 * - Industrial Teal/Blue Steel: "#0F766E", roughness: 0.45, metalness: 0.65
 * - Mirror Chrome Steel:        "#E2E8F0", roughness: 0.08, metalness: 0.98
 * - Warm Copper Windings:       "#B45309", roughness: 0.25, metalness: 0.85
 * - Polished Brass Accents:     "#D97706", roughness: 0.15, metalness: 0.95
 * - Heavy Cast Iron / Accents:  "#1E293B", roughness: 0.7,  metalness: 0.4
 * - Hardened Carbide Tips:      "#334155", roughness: 0.3,  metalness: 0.85
 */

// =========================================================================
// MODULE 0: WELDED SHEET METAL WORKSHOP PEDESTAL (Order 0, Frame 0f)
// =========================================================================
const Tier2BaseModule: ModularPartSpec = {
  id: "tier2_base",
  name: "Welded Sheet Metal Pedestal & Anchor Bed",
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
      [-0.56, -0.42],
      [0.56, -0.42],
      [-0.56, 0.42],
      [0.56, 0.42],
    ];

    return (
      <group position={[0, 0, 0]}>
        {/* Heavy Flanged Baseplate (rests on floor) */}
        <RoundedBox args={[1.28, 0.06, 1.02]} radius={0.02} smoothness={4} position={[0, 0.03, 0]}>
          <meshStandardMaterial color="#0A4D47" roughness={0.5} metalness={0.6} />
        </RoundedBox>

        {/* 4 Heavy Chrome Anchor Bolts & Washers */}
        {anchorCoords.map(([ax, az], i) => (
          <group key={i} position={[ax, 0.06, az]}>
            {/* Chrome Heavy Washer */}
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.01, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
            </mesh>
            {/* Mirror Chrome Hex Anchor Nut */}
            <mesh position={[0, 0.022, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.026, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Threaded Anchor Stud Core */}
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.03, 16]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Welded Sheet Metal Enclosed Workshop Pedestal Body */}
        <RoundedBox args={[1.12, 0.74, 0.86]} radius={0.025} smoothness={4} position={[0, 0.43, 0]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* Front Service Cabinet Access Door */}
        <group position={[0, 0.43, 0.435]}>
          {/* Recessed Door Frame Inset */}
          <RoundedBox args={[0.64, 0.54, 0.012]} radius={0.015} smoothness={4}>
            <meshStandardMaterial color="#0A4D47" roughness={0.55} metalness={0.6} />
          </RoundedBox>
          {/* Polished Chrome Compression Latch / Handle */}
          <mesh position={[0.24, 0, 0.018]}>
            <boxGeometry args={[0.025, 0.12, 0.022]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* Chrome Door Hinges */}
          <mesh position={[-0.3, 0.18, 0.012]}>
            <cylinderGeometry args={[0.012, 0.012, 0.05, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          <mesh position={[-0.3, -0.18, 0.012]}>
            <cylinderGeometry args={[0.012, 0.012, 0.05, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
        </group>

        {/* Stamped Ventilation Louver Slots on Side Panels */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((ly, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[-0.565, 0.45 + ly, 0]}>
              <boxGeometry args={[0.012, 0.016, 0.28]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
            <mesh position={[0.565, 0.45 + ly, 0]}>
              <boxGeometry args={[0.012, 0.016, 0.28]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Top Heavy Machined Bolster Plate / Bed Deck */}
        <RoundedBox args={[1.08, 0.06, 0.82]} radius={0.02} smoothness={4} position={[0, 0.83, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.75} />
        </RoundedBox>

        {/* 4 Precision Machined Bearing Pedestal Pads */}
        {[
          [-0.15, -0.32],
          [-0.15, 0.32],
          [0.15, -0.32],
          [0.15, 0.32],
        ].map(([px, pz], i) => (
          <group key={i} position={[px, 0.87, pz]}>
            <RoundedBox args={[0.18, 0.03, 0.12]} radius={0.01} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
            </RoundedBox>
            {/* Tapped Anchor Studs */}
            <mesh position={[-0.06, 0.02, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.015, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
            </mesh>
            <mesh position={[0.06, 0.02, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.015, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* Central Waste Drop Throat / Sloped Funnel Chute */}
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, -0.15, 0.24]} rotation={[-0.42, 0, 0]}>
            <boxGeometry args={[0.62, 0.32, 0.015]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.15, -0.24]} rotation={[0.42, 0, 0]}>
            <boxGeometry args={[0.62, 0.32, 0.015]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>

        {/* Emergency Stop Safety Switch Station on Front Corner */}
        <group position={[0.48, 0.72, 0.44]}>
          {/* Yellow Safety Enclosure */}
          <RoundedBox args={[0.07, 0.09, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.5} />
          </RoundedBox>
          {/* Red Mushroom E-Stop Button */}
          <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.016, 0.02, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} metalness={0.4} />
          </mesh>
        </group>
      </group>
    );
  },
};

// =========================================================================
// MODULE 1: ROTOR CORE & TWIN SHAFTS (Order 1, Frame 20f)
// Arrives BEFORE casing! Sockets at [0, 1.04, 0].
// =========================================================================
const Tier2RotorModule: ModularPartSpec = {
  id: "tier2_rotor",
  name: "Armature Rotor Core & Twin Keyed Shafts",
  assemblyOrder: 1,
  snapFrame: 20,
  targetSocket: [0, 1.04, 0],
  entryDirection: "top",
  travelDistance: 3.2,
  sparkColor: "#38BDF8",
  sparkCount: 18,
  render: ({ localFrame, isRunning, rpm }) => {
    // Kinematics: twin shafts counter-rotate to pull inward into center throat
    const effectiveRpm = rpm || 120;
    const rot = isRunning ? (localFrame * effectiveRpm * Math.PI) / 900 : 0;
    const motorRot = -rot * 3.0; // 3:1 reduction ratio to motor armature

    const leftShaftX = -0.15;
    const rightShaftX = 0.15;

    return (
      <group position={[0, 0, 0]}>
        {/* 4 Cast Iron Pillow Block Flange Bearings (Stationary base support) */}
        {[
          [leftShaftX, -0.32],
          [leftShaftX, 0.32],
          [rightShaftX, -0.32],
          [rightShaftX, 0.32],
        ].map(([bx, bz], i) => (
          <group key={i} position={[bx, 0, bz]}>
            {/* Cast Iron Split Housing */}
            <RoundedBox args={[0.16, 0.14, 0.06]} radius={0.016} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.45} />
            </RoundedBox>
            {/* Polished Chrome Spherical Bearing Race */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.046, 0.046, 0.062, 20]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Brass Grease Zerk Nipple on Top */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.024, 12]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* Left Drive Shaft (Rotates Clockwise: -rot) */}
        <group position={[leftShaftX, 0, 0]} rotation={[0, 0, -rot]}>
          {/* Ground Mirror Chrome Precision Solid Shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.84, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* Machined Keyway Slot */}
          <mesh position={[0.036, 0, 0]}>
            <boxGeometry args={[0.008, 0.008, 0.68]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
          {/* Shaft End Thrust Collars */}
          <mesh position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 20]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 20]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.9} />
          </mesh>
        </group>

        {/* Right Driven Shaft (Rotates Counter-Clockwise: +rot) */}
        <group position={[rightShaftX, 0, 0]} rotation={[0, 0, rot]}>
          {/* Ground Mirror Chrome Precision Solid Shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.84, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* Machined Keyway Slot */}
          <mesh position={[-0.036, 0, 0]}>
            <boxGeometry args={[0.008, 0.008, 0.68]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
          {/* Shaft End Thrust Collars */}
          <mesh position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 20]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 20]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.9} />
          </mesh>
        </group>

        {/* COPPER-WOUND ARMATURE ROTOR (Electric Motor Drive Core) */}
        {/* Positioned at rear drive mount: X = -0.48, Y = 0.12, Z = -0.14 */}
        <group position={[-0.48, 0.12, -0.14]} rotation={[0, 0, motorRot]}>
          {/* Armature Drive Shaft Core */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.38, 20]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Slotted Laminated Rotor Steel Core Stack */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.088, 0.088, 0.20, 24]} />
            <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
          </mesh>

          {/* 12 Dense Radial Copper Armature Coil Windings */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 12;
            return (
              <group key={i} rotation={[0, 0, angle]}>
                {/* Longitudinal Copper Coil Bundle */}
                <mesh position={[0.072, 0, 0]}>
                  <boxGeometry args={[0.022, 0.016, 0.19]} />
                  <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
                </mesh>
                {/* Copper Coil Overhang End-Turn Loops (Front & Rear) */}
                <mesh position={[0.068, 0, 0.105]} rotation={[0, Math.PI / 6, 0]}>
                  <boxGeometry args={[0.022, 0.016, 0.026]} />
                  <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
                </mesh>
                <mesh position={[0.068, 0, -0.105]} rotation={[0, -Math.PI / 6, 0]}>
                  <boxGeometry args={[0.022, 0.016, 0.026]} />
                  <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
                </mesh>
              </group>
            );
          })}

          {/* Precision Copper Commutator Segmented Drum */}
          <group position={[0, 0, 0.125]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.046, 0.046, 0.048, 24]} />
              <meshStandardMaterial color="#B45309" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Mica Insulation Segment Dividers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 2 * Math.PI) / 12;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.0465, Math.sin(a) * 0.0465, 0]}>
                  <boxGeometry args={[0.002, 0.002, 0.048]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.9} />
                </mesh>
              );
            })}
          </group>

          {/* Polished Brass Balance Ring & Studs */}
          <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.018, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>

        {/* Front Intermeshing Timing Spur Gears (Synchronize Left & Right Shafts) */}
        <group position={[0, 0, 0.38]}>
          {/* Left Chrome Spur Gear (Rotates Clockwise: -rot) */}
          <group position={[leftShaftX, 0, 0]} rotation={[0, 0, -rot]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.146, 0.146, 0.035, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Outer Involute Gear Teeth Array */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * 2 * Math.PI) / 24;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.148, Math.sin(a) * 0.148, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.014, 0.012, 0.034]} />
                  <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.94} />
                </mesh>
              );
            })}
          </group>

          {/* Right Chrome Spur Gear (Rotates Counter-Clockwise: +rot with mesh phase) */}
          <group position={[rightShaftX, 0, 0]} rotation={[0, 0, rot + Math.PI / 24]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.146, 0.146, 0.035, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Outer Involute Gear Teeth Array */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * 2 * Math.PI) / 24;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.148, Math.sin(a) * 0.148, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.014, 0.012, 0.034]} />
                  <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.94} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    );
  },
};

// =========================================================================
// MODULE 2: MOTOR STATOR HOUSING & CHAMBER (Order 2, Frame 40f)
// Finned electric stator + cutting chamber (<RoundedBox radius={0.025}>).
// =========================================================================
const Tier2MotorHousingModule: ModularPartSpec = {
  id: "tier2_motor_housing",
  name: "Finned Stator Housing & Shredder Chamber",
  assemblyOrder: 2,
  snapFrame: 40,
  targetSocket: [0, 1.04, 0],
  entryDirection: "top",
  travelDistance: 3.4,
  sparkColor: "#F59E0B",
  sparkCount: 20,
  render: () => {
    return (
      <group position={[0, 0, 0]}>
        {/* HEAVY CUTTING CHAMBER BOX (<RoundedBox radius={0.025}> standard) */}
        {/* Left Side Plate (Industrial Teal Painted Steel) */}
        <RoundedBox args={[0.04, 0.44, 0.72]} radius={0.025} smoothness={4} position={[-0.34, 0, 0]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* Right Side Plate (Industrial Teal Painted Steel) */}
        <RoundedBox args={[0.04, 0.44, 0.72]} radius={0.025} smoothness={4} position={[0.34, 0, 0]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* Front End Plate with Clearance Cutout for Synchronizer Gears */}
        <RoundedBox args={[0.64, 0.44, 0.04]} radius={0.025} smoothness={4} position={[0, 0, 0.34]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* Rear End Plate with Drive Shaft Pass-Through Port */}
        <RoundedBox args={[0.64, 0.44, 0.04]} radius={0.025} smoothness={4} position={[0, 0, -0.34]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* 4 High-Tensile Steel Tie Rods Passing through Chamber Corners */}
        {[
          [-0.355, -0.18],
          [-0.355, 0.18],
          [0.355, -0.18],
          [0.355, 0.18],
        ].map(([tx, ty], i) => (
          <group key={i} position={[tx, ty, 0]}>
            {/* Chrome Tie Rod Stud */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.76, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
            </mesh>
            {/* Mirror Chrome Hex Nuts on Front and Rear Ends */}
            <mesh position={[0, 0, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.025, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            <mesh position={[0, 0, -0.37]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.025, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
          </group>
        ))}

        {/* Flange Hex Cap Bolt Arrays on Left/Right Cheeks */}
        {[-0.14, 0, 0.14].map((by, idx) =>
          [-0.24, 0, 0.24].map((bz, j) => (
            <mesh key={`${idx}_${j}`} position={[-0.365, by, bz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
          ))
        )}

        {/* FLARED SAFETY HOPPER (Industrial Teal with Beveled Lip) */}
        <group position={[0, 0.36, 0]}>
          {/* Front & Rear Inclined Flared Walls */}
          <mesh position={[0, 0, 0.32]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.72, 0.34, 0.018]} />
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0, -0.32]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.72, 0.34, 0.018]} />
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </mesh>
          {/* Left & Right Inclined Flared Walls */}
          <mesh position={[-0.36, 0, 0]} rotation={[0, 0, -0.28]}>
            <boxGeometry args={[0.018, 0.34, 0.58]} />
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </mesh>
          <mesh position={[0.36, 0, 0]} rotation={[0, 0, 0.28]}>
            <boxGeometry args={[0.018, 0.34, 0.58]} />
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </mesh>

          {/* Top Rolled Lip Bevel Safety Frame (Open Perimeter Rim - hollow center for feed throat) */}
          <group position={[0, 0.16, 0]}>
            {/* Front Lip */}
            <RoundedBox args={[0.82, 0.038, 0.05]} radius={0.012} smoothness={4} position={[0, 0, 0.34]}>
              <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
            </RoundedBox>
            {/* Rear Lip */}
            <RoundedBox args={[0.82, 0.038, 0.05]} radius={0.012} smoothness={4} position={[0, 0, -0.34]}>
              <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
            </RoundedBox>
            {/* Left Lip */}
            <RoundedBox args={[0.05, 0.038, 0.64]} radius={0.012} smoothness={4} position={[-0.39, 0, 0]}>
              <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
            </RoundedBox>
            {/* Right Lip */}
            <RoundedBox args={[0.05, 0.038, 0.64]} radius={0.012} smoothness={4} position={[0.39, 0, 0]}>
              <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
            </RoundedBox>

            {/* Black Caution Hazard Stripes on Front & Rear Hopper Lips */}
            {[-0.22, -0.07, 0.07, 0.22].map((sx, idx) => (
              <mesh key={idx} position={[sx, 0.02, 0.34]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.035, 0.005, 0.048]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            ))}
          </group>
        </group>

        {/* FINNED ELECTRIC MOTOR STATOR HOUSING */}
        {/* Encloses the Rotor Armature at [-0.48, 0.12, -0.14] */}
        <group position={[-0.48, 0.12, -0.14]}>
          {/* Main Cylindrical Stator Barrel in Industrial Teal */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.132, 0.132, 0.34, 24]} />
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </mesh>

          {/* 8 Radial Cooling Fins Encircling Stator Body */}
          {Array.from({ length: 8 }).map((_, i) => {
            const finZ = (i - 3.5) * 0.038;
            return (
              <mesh key={i} position={[0, 0, finZ]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.152, 0.152, 0.008, 24]} />
                <meshStandardMaterial color="#0A4D47" roughness={0.5} metalness={0.7} />
              </mesh>
            );
          })}

          {/* Polished Mirror Chrome Rear Fan Shroud / End-Bell */}
          <RoundedBox args={[0.26, 0.26, 0.06]} radius={0.02} smoothness={4} position={[0, 0, -0.19]}>
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </RoundedBox>

          {/* Ventilation Louver Holes on Fan Shroud */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.cos(rad) * 0.08, Math.sin(rad) * 0.08, -0.222]}>
                <circleGeometry args={[0.012, 12]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            );
          })}

          {/* Electrical Junction Box with Brass Cable Gland */}
          <RoundedBox args={[0.09, 0.09, 0.09]} radius={0.015} smoothness={4} position={[0.12, 0.09, 0]}>
            <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
          </RoundedBox>
          <mesh position={[0.175, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.032, 12]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* Commutator & Copper Winding Inspection Port with Chrome Bezel Frame */}
          <group position={[-0.09, 0.08, 0.12]} rotation={[0, 0, Math.PI / 4]}>
            <RoundedBox args={[0.07, 0.045, 0.015]} radius={0.005} smoothness={4}>
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </RoundedBox>
            {/* Viewing Aperture exposing Copper Winding Commutator within */}
            <mesh position={[0, 0, 0.005]}>
              <boxGeometry args={[0.05, 0.026, 0.01]} />
              <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
            </mesh>
          </group>

          {/* Stamped Aluminum Motor Specification Nameplate */}
          <mesh position={[-0.134, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[0.08, 0.05, 0.002]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      </group>
    );
  },
};

// =========================================================================
// MODULE 3: GEARBOX & CHAIN DRIVE (Order 3, Frame 60f)
// Dual-sprocket roller chain drive with chrome tensioner. Sockets at [0, 1.04, -0.38].
// =========================================================================
const Tier2GearboxModule: ModularPartSpec = {
  id: "tier2_gearbox",
  name: "Dual-Sprocket Roller Chain Drive & Chrome Tensioner",
  assemblyOrder: 3,
  snapFrame: 60,
  targetSocket: [0, 1.04, -0.38],
  entryDirection: "back",
  travelDistance: 3.0,
  sparkColor: "#D97706",
  sparkCount: 16,
  render: ({ localFrame, isRunning, rpm, isBroken }) => {
    const effectiveRpm = rpm || 120;
    const rot = isRunning ? (localFrame * effectiveRpm * Math.PI) / 900 : 0;
    const motorRot = -rot * 3.0; // High speed motor sprocket
    const chainVibe = isRunning && !isBroken ? Math.sin(localFrame * 3.5) * 0.008 : 0;

    const leftShaftX = -0.15;
    const motorShaftX = -0.48;
    const motorShaftY = 0.12;

    return (
      <group position={[0, 0, 0]}>
        {/* Industrial Teal Laser-Cut Chain Guard Backplate */}
        <RoundedBox args={[0.54, 0.38, 0.014]} radius={0.02} smoothness={4} position={[-0.31, 0.06, -0.02]}>
          <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
        </RoundedBox>

        {/* MOTOR OUTPUT DRIVE SPROCKET (Small, 14-Tooth) */}
        {/* Positioned on motor shaft at [motorShaftX, motorShaftY, 0] */}
        <group position={[motorShaftX, motorShaftY, 0]} rotation={[0, 0, motorRot]}>
          {/* Chrome Steel Sprocket Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.025, 20]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* Keyed Shaft Collar with Set Screw */}
          <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.016, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
          </mesh>
          {/* 14 Sprocket Teeth Array */}
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * 2 * Math.PI) / 14;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.055, Math.sin(a) * 0.055, 0]} rotation={[0, 0, a]}>
                <boxGeometry args={[0.012, 0.01, 0.024]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
              </mesh>
            );
          })}
        </group>

        {/* MAIN SHAFT DRIVEN SPROCKET (Large 42-Tooth Reduction Wheel) */}
        {/* Positioned on left shaft at [leftShaftX, 0, 0] */}
        <group position={[leftShaftX, 0, 0]} rotation={[0, 0, -rot]}>
          {/* Chrome Steel Sprocket Disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.132, 0.132, 0.025, 28]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* 6 Circular Weight Reduction Holes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * 2 * Math.PI) / 6;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.028, 16]} />
                <meshStandardMaterial color="#0A4D47" roughness={0.7} metalness={0.5} />
              </mesh>
            );
          })}
          {/* 28 Sprocket Teeth along Outer Perimeter */}
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i * 2 * Math.PI) / 28;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.136, Math.sin(a) * 0.136, 0]} rotation={[0, 0, a]}>
                <boxGeometry args={[0.016, 0.012, 0.024]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
              </mesh>
            );
          })}
        </group>

        {/* HEAVY ROLLER CHAIN STRANDS */}
        {!isBroken ? (
          <group position={[0, chainVibe, 0]}>
            {/* Upper Taut Chain Strand */}
            <mesh position={[-0.315, 0.125, 0]} rotation={[0, 0, 0.32]}>
              <boxGeometry args={[0.38, 0.022, 0.022]} />
              <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.8} />
            </mesh>
            {/* Upper Chain Chrome Roller Pins */}
            {[-0.14, -0.07, 0, 0.07, 0.14].map((px, idx) => (
              <mesh key={idx} position={[-0.315 + px, 0.125 + px * 0.32, 0.012]}>
                <cylinderGeometry args={[0.005, 0.005, 0.008, 10]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
              </mesh>
            ))}

            {/* Lower Slack Chain Strand */}
            <mesh position={[-0.315, -0.02, 0]} rotation={[0, 0, -0.32]}>
              <boxGeometry args={[0.38, 0.022, 0.022]} />
              <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.8} />
            </mesh>
          </group>
        ) : (
          /* Broken Catastrophic Whipping Chain in Act 4 */
          <group position={[-0.22, -0.15, 0]} rotation={[0, 0, 0.8]}>
            <mesh>
              <boxGeometry args={[0.26, 0.022, 0.022]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        )}

        {/* CHROME TENSIONER ASSEMBLY */}
        {/* Tensioner Arm & Roller bearing against lower slack chain */}
        <group position={[-0.28, -0.07, 0]}>
          {/* Mirror Chrome Slotted Tensioner Arm */}
          <RoundedBox args={[0.03, 0.14, 0.02]} radius={0.008} smoothness={4} position={[0, 0, 0.015]}>
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </RoundedBox>

          {/* Mirror Chrome Tensioner Idler Roller Wheel */}
          <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.028, 20]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Chrome Threaded Adjustment Rod & Dual Locknuts */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.10, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.014, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.1} metalness={0.95} />
          </mesh>

          {/* Heavy Chrome Coil Tensioner Spring */}
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.045, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Warm Polished Brass Pivot Bushing */}
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.03, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>
      </group>
    );
  },
};

// =========================================================================
// MODULE 4: TOOLHEAD CUTTER DISCS (Order 4, Frame 75f)
// High-speed carbide multi-tooth cutter discs pointing into specimen.
// =========================================================================
const Tier2ToolheadModule: ModularPartSpec = {
  id: "tier2_toolhead",
  name: "High-Speed Carbide Multi-Tooth Cutter Discs",
  assemblyOrder: 4,
  snapFrame: 75,
  targetSocket: [0, 1.04, 0],
  entryDirection: "top",
  travelDistance: 2.8,
  sparkColor: "#10B981",
  sparkCount: 22,
  fracture: {
    breakFrame: 265,
    mode: "fling_parabolic",
    impulse: [0.45, -0.28, 0.22],
    rotationImpulse: [2.0, 0.8, 2.5],
    sparkOrigin: [0.15, 0, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm, isBroken }) => {
    const effectiveRpm = rpm || 120;
    const rot = isRunning ? (localFrame * effectiveRpm * Math.PI) / 900 : 0;

    const leftShaftX = -0.15;
    const rightShaftX = 0.15;
    const discCount = 7;
    const discSpacing = 0.065;

    return (
      <group position={[0, 0, 0]}>
        {/* LEFT SHAFT CUTTER DISCS ARRAY (Rotates Clockwise: -rot) */}
        {/* Teeth sweep downward and inward toward the center throat */}
        <group position={[leftShaftX, 0, 0]} rotation={[0, 0, -rot]}>
          {Array.from({ length: discCount }).map((_, i) => {
            const z = (i - (discCount - 1) / 2) * discSpacing;
            // Progressive 45-degree angular twist along the shaft creates a cutting spiral
            const discOffsetAngle = (i * Math.PI) / 4;

            return (
              <group key={`l_disc_${i}`} position={[0, 0, z]} rotation={[0, 0, discOffsetAngle]}>
                {/* Central Tool-Steel Disc Core */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.024, 28]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
                </mesh>

                {/* Mirror Ground Chrome Disc Cheeks */}
                <mesh position={[0, 0, 0.0125]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.002, 28]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                </mesh>
                <mesh position={[0, 0, -0.0125]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.002, 28]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                </mesh>

                {/* 4 Curved Claw Hooks with Tungsten Carbide Inserts */}
                {[0, 1, 2, 3].map((t) => {
                  const ang = (t * Math.PI) / 2;
                  return (
                    <group key={t} rotation={[0, 0, ang]}>
                      {/* Claw Tooth Base Wedge in Mirror Chrome Steel */}
                      <mesh position={[0.115, 0.02, 0]}>
                        <boxGeometry args={[0.065, 0.032, 0.024]} />
                        <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                      </mesh>
                      {/* High-Speed Brazed Hardened Carbide Hook Tip */}
                      <mesh position={[0.146, 0.046, 0]} rotation={[0, 0, -0.42]}>
                        <coneGeometry args={[0.018, 0.046, 4]} />
                        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>

        {/* RIGHT SHAFT CUTTER DISCS ARRAY (Rotates Counter-Clockwise: +rot) */}
        {/* Interleaved along Z between the left discs: offset by discSpacing / 2 */}
        <group position={[rightShaftX, 0, 0]} rotation={[0, 0, rot]}>
          {Array.from({ length: discCount }).map((_, i) => {
            const z = (i - (discCount - 1) / 2) * discSpacing + discSpacing * 0.5;
            if (z > 0.24 || z < -0.24) return null;
            const discOffsetAngle = (i * Math.PI) / 4 + Math.PI / 8;

            return (
              <group key={`r_disc_${i}`} position={[0, 0, z]} rotation={[0, 0, discOffsetAngle]}>
                {/* Central Tool-Steel Disc Core */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.024, 28]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
                </mesh>

                {/* Mirror Ground Chrome Disc Cheeks */}
                <mesh position={[0, 0, 0.0125]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.002, 28]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                </mesh>
                <mesh position={[0, 0, -0.0125]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.096, 0.096, 0.002, 28]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                </mesh>

                {/* 4 Curved Claw Hooks with Tungsten Carbide Inserts */}
                {[0, 1, 2, 3].map((t) => {
                  const ang = (t * Math.PI) / 2;
                  // Act 4 Fracture effect on right middle disc tooth 0
                  const isFracturedTooth = isBroken && i === 3 && t === 0;

                  return (
                    <group
                      key={t}
                      rotation={[0, 0, ang + (isFracturedTooth ? 1.5 : 0)]}
                      position={[isFracturedTooth ? 0.25 : 0, isFracturedTooth ? -0.25 : 0, 0]}
                    >
                      {/* Claw Tooth Base Wedge */}
                      <mesh position={[0.115, -0.02, 0]}>
                        <boxGeometry args={[0.065, 0.032, 0.024]} />
                        <meshStandardMaterial
                          color={isFracturedTooth ? "#EF4444" : "#E2E8F0"}
                          roughness={0.08}
                          metalness={0.98}
                        />
                      </mesh>
                      {/* High-Speed Brazed Hardened Carbide Hook Tip */}
                      <mesh position={[0.146, -0.046, 0]} rotation={[0, 0, 0.42]}>
                        <coneGeometry args={[0.018, 0.046, 4]} />
                        <meshStandardMaterial
                          color={isFracturedTooth ? "#EF4444" : "#334155"}
                          roughness={0.3}
                          metalness={0.85}
                        />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>

        {/* Clean Stripper Comb Finger Bars (Prevent Material Wrapping) */}
        {[-0.24, 0.24].map((sideX, sIdx) => (
          <group key={sIdx} position={[sideX, 0, 0]}>
            {Array.from({ length: 6 }).map((_, i) => {
              const fz = (i - 2.5) * discSpacing;
              return (
                <mesh key={i} position={[sideX > 0 ? -0.04 : 0.04, -0.06, fz]}>
                  <boxGeometry args={[0.08, 0.02, 0.016]} />
                  <meshStandardMaterial color="#0F766E" roughness={0.45} metalness={0.65} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    );
  },
};

// =========================================================================
// EXPORT SPECIFICATIONS (AssemblyContract Compliance)
// =========================================================================

export const Tier2Spec: ModularPartSpec[] = [
  Tier2BaseModule,
  Tier2RotorModule,
  Tier2MotorHousingModule,
  Tier2GearboxModule,
  Tier2ToolheadModule,
];

export const Tier2AssemblySpec: MachineAssemblySpec = {
  id: "tier2_electric",
  name: "Pro-Grade Electric Dual-Shaft Shredder",
  tier: 2,
  modules: Tier2Spec,
};
