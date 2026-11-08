import React from "react";
import { RoundedBox } from "@react-three/drei";
import { MachineAssemblySpec, ModularPartSpec } from "./AssemblyContract";

/**
 * 3D Modeler Layer: Modular Carbide Drill
 * Each module is purely responsible for its geometry, materials, and socket definitions.
 * ZERO manual spring keyframing or camera manipulation inside module files.
 */

// Module 0: Cast Iron Bed & Heavy Machine Vise
const ModuleBase: ModularPartSpec = {
  id: "base_vise",
  name: "Heavy Cast-Iron Bed & Vise",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  render: () => (
    <group position={[0, -0.72, 0]}>
      {/* Heavy ribbed machine base */}
      <RoundedBox args={[1.5, 0.16, 1.2]} radius={0.025} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {/* Machined T-slots */}
      <mesh position={[0, 0.082, -0.2]}>
        <boxGeometry args={[1.4, 0.015, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.082, 0.2]}>
        <boxGeometry args={[1.4, 0.015, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* Dual Heavy Vise Jaws */}
      <RoundedBox args={[0.7, 0.28, 0.14]} radius={0.018} smoothness={4} position={[0, 0.2, -0.28]}>
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.28, 0.14]} radius={0.018} smoothness={4} position={[0, 0.2, 0.28]}>
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
      </RoundedBox>

      {/* Brass Vise Lead-Screw */}
      <mesh position={[0, 0.2, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.22, 16]} />
        <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
      </mesh>
    </group>
  ),
};

// Module 1: Internal Counterweighted Crankshaft Core
const ModuleInternalCore: ModularPartSpec = {
  id: "internal_crankshaft",
  name: "Mirror Chrome Crankshaft & Flywheel",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 2.8,
  targetSocket: [0, 0.72, 0],
  sparkColor: "#38BDF8",
  sparkCount: 16,
  render: ({ localFrame, isRunning, rpm }) => {
    const rot = isRunning ? (localFrame * rpm * Math.PI) / 1800 : 0;
    return (
      <group position={[0, 0, 0]} rotation={[0, 0, rot]}>
        {/* Main crankshaft axis */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.52, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.06} metalness={0.98} />
        </mesh>

        {/* Dual Polished Counterweight Webs */}
        <RoundedBox args={[0.22, 0.14, 0.06]} radius={0.02} smoothness={4} position={[0, 0.06, -0.12]}>
          <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.92} />
        </RoundedBox>
        <RoundedBox args={[0.22, 0.14, 0.06]} radius={0.02} smoothness={4} position={[0, 0.06, 0.12]}>
          <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.92} />
        </RoundedBox>

        {/* Polished Brass Balance Studs */}
        <mesh position={[0.06, 0.06, 0.16]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>
    );
  },
};

// Module 2: Outer Ribbed Engine Block & Cylinder Casing (slides in AFTER internal core)
const ModuleEngineCasing: ModularPartSpec = {
  id: "engine_casing",
  name: "Finned Engine Block with Bevels",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "left",
  travelDistance: 3.2,
  targetSocket: [0, 0.72, 0],
  sparkColor: "#F59E0B",
  sparkCount: 18,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* Main Crankcase Housing */}
      <RoundedBox args={[0.62, 0.52, 0.58]} radius={0.035} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
      </RoundedBox>

      {/* Top Vertical Finned Cylinder */}
      <group position={[0, 0.38, 0]}>
        {[0, 0.06, 0.12, 0.18, 0.24].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <cylinderGeometry args={[0.24 - idx * 0.008, 0.24 - idx * 0.008, 0.022, 24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
        {/* Spark Plug on Cylinder Head */}
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
        </mesh>
      </group>

      {/* Lateral Pull-Starter Recoil Housing */}
      <mesh position={[-0.33, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 20]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  ),
};

// Module 3: Planetary Reduction Gearbox & Chuck
const ModuleGearboxChuck: ModularPartSpec = {
  id: "gearbox_chuck",
  name: "Planetary Reduction & Precision Chuck",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "right",
  travelDistance: 3.0,
  targetSocket: [0, 0.14, 0],
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: ({ localFrame, isRunning, rpm }) => {
    const rot = isRunning ? (localFrame * rpm * 0.4 * Math.PI) / 1800 : 0;
    return (
      <group position={[0, 0, 0]}>
        {/* Stationary Gearbox Flanged Housing */}
        <RoundedBox args={[0.42, 0.28, 0.42]} radius={0.03} smoothness={4} position={[0, 0.08, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
        </RoundedBox>

        {/* 6 Peripheral Mounting Hex Bolts */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={i} position={[Math.cos(rad) * 0.17, 0.23, Math.sin(rad) * 0.17]}>
              <cylinderGeometry args={[0.016, 0.016, 0.025, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
            </mesh>
          );
        })}

        {/* Rotating 3-Jaw Chuck Core */}
        <group position={[0, -0.12, 0]} rotation={[0, rot, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>
          {/* Chuck Knurled Grip Ring */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  },
};

// Module 4: Carbide Fluted Auger Bit (Snaps from Bottom, Overload fracture at 265f)
const ModuleCarbideBit: ModularPartSpec = {
  id: "carbide_bit",
  name: "Spiral Fluted Carbide Drill Bit",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "bottom",
  travelDistance: 2.2,
  targetSocket: [0, -0.28, 0],
  sparkColor: "#10B981",
  sparkCount: 20,
  fracture: {
    breakFrame: 265,
    mode: "fling_parabolic",
    impulse: [0.65, -0.3, 0.35],
    rotationImpulse: [1.8, 0.6, 2.4],
    sparkOrigin: [0, -0.15, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, rpm }) => {
    const rot = isRunning ? (localFrame * rpm * 0.4 * Math.PI) / 1800 : 0;
    return (
      <group position={[0, 0, 0]} rotation={[0, rot, 0]}>
        {/* Main Solid Drill Shank */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.18, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
        </mesh>

        {/* Fluted Spiral Auger Section */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.075, 0.05, 0.36, 16]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* High-Temp Brazed Golden Collar */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.025, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Hardened Tungsten Carbide Tip */}
        <mesh position={[0, -0.34, 0]}>
          <coneGeometry args={[0.06, 0.08, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>
    );
  },
};

// Full Machine Assembly Specification
export const ModularCarbideDrillSpec: MachineAssemblySpec = {
  id: "modular_carbide_drill",
  name: "Pro-Series Modular Gas Auger Drill",
  tier: 2,
  modules: [
    ModuleBase,
    ModuleInternalCore,
    ModuleEngineCasing,
    ModuleGearboxChuck,
    ModuleCarbideBit,
  ],
};
