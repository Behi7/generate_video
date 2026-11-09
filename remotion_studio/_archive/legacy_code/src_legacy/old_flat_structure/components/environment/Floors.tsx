import React from "react";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";

export interface FloorProps {
  position?: [number, number, number];
}

/** 1. Rough Industrial Concrete with expansion seams */
export const ConcreteFactorySlab: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#334155" roughness={0.92} metalness={0.15} />
    </mesh>
    {/* Concrete expansion joints */}
    {[-2.5, 0, 2.5].map((x, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.048, 0]}>
        <planeGeometry args={[0.025, 14]} />
        <meshStandardMaterial color="#0F172A" roughness={1.0} />
      </mesh>
    ))}
    {/* Yellow/Black hazard warning boundary perimeter */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.047, 3.2]}>
      <planeGeometry args={[7, 0.2]} />
      <meshStandardMaterial color="#F59E0B" roughness={0.6} />
    </mesh>
  </group>
);

/** 2. Heavy Diamond Tread Steel Plate */
export const DiamondPlateSteel: React.FC<FloorProps> = ({ position = [0, -2.04, 0] }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.88} />
    </mesh>
    {/* Welded steel perimeter frame */}
    <RoundedBox args={[7.2, 0.06, 7.2]} radius={0.02} smoothness={4} position={[0, -0.03, 0]}>
      <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.5} />
    </RoundedBox>
  </group>
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
