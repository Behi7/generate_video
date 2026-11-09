import React from "react";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { FactoryHeavyConcreteFloor } from "./floors/FactoryHeavyConcreteFloor";
import { ModularDiamondSteelDeck } from "./floors/ModularDiamondSteelDeck";

export { FactoryHeavyConcreteFloor, ModularDiamondSteelDeck };

export interface FloorProps {
  position?: [number, number, number];
}

/** 1. AAA Heavy Factory Concrete Slab with expansion seams, trench drain, anchor plates, and hazard markings */
export const ConcreteFactorySlab: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <FactoryHeavyConcreteFloor position={position} />
);

/** 2. AAA Heavy Modular Diamond Tread Steel Plate Deck with Flush Utility Hatch */
export const DiamondPlateSteel: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <ModularDiamondSteelDeck position={position} />
);

/** 3. Heavy Laminated Oak Woodworking Bench */
export const HeavyWoodBench: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <group position={position}>
    {/* Laminated wood planks */}
    {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((x, i) => (
      <RoundedBox key={i} args={[0.86, 0.08, 7.0]} radius={0.015} smoothness={4} position={[x, -0.04, 0]}>
        <meshStandardMaterial color={i % 2 === 0 ? "#78350F" : "#92400E"} roughness={0.75} metalness={0.05} />
      </RoundedBox>
    ))}
    {/* Steel clamp dog holes */}
    {[-1.5, 0, 1.5].map((x, i) =>
      [-1.5, 0, 1.5].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.005, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      ))
    )}
  </group>
);

/** 4. High-Tech Hexagonal Cyber Neon Grid */
export const HexNeonGrid: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#050814" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Concentric glowing magnetic energy rings */}
    {[1.4, 2.4, 3.4].map((rad, i) => (
      <mesh key={i} position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rad - 0.025, rad, 48]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={2.5} />
      </mesh>
    ))}
  </group>
);

/** 5. Dark Titanium Mirror Reflective Arena */
export const DarkTitaniumMirror: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[16, 16]} />
      <MeshReflectorMaterial
        blur={[350, 80]}
        resolution={512}
        mirror={0.7}
        mixBlur={0.8}
        mixStrength={1.5}
        roughness={0.28}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0F172A"
        metalness={0.85}
      />
    </mesh>
  </group>
);
