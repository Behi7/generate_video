import React from "react";
import { useCurrentFrame } from "remotion";

export const NeonPipe: React.FC = () => {
  const frame = useCurrentFrame();

  // Pulsing neon light intensity
  const pulse = Math.sin(frame * 0.1) * 0.6 + 3.8;

  // Flowing droplet stream into barrel
  const dropProgress = ((frame * 0.08) % 1);
  const dropY = 0.85 - dropProgress * 0.45;

  return (
    <group position={[0, -2.1, 0]}>
      {/* 1. Control Valve Unit on the left of pipe (near seated character) */}
      <group position={[0.65, 0.65, 0]}>
        {/* Base pillar */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.65, 16]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Golden / Brass Valve Wheel */}
        <mesh position={[0, 0.12, 0]} rotation={[0, 0, frame * 0.02]}>
          <torusGeometry args={[0.12, 0.025, 16, 24]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 2. Main Glowing Fluid Conduit (from valve at 0.65 to spigot at 1.45) */}
      <mesh position={[1.05, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.8, 32]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00D2FC"
          emissiveIntensity={pulse}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 3. Downspout Spigot into Barrel */}
      <mesh position={[1.45, 0.6, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.35, 32]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00D2FC"
          emissiveIntensity={pulse}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Elbow joint */}
      <mesh position={[1.45, 0.75, 0]}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00D2FC"
          emissiveIntensity={pulse}
        />
      </mesh>

      {/* Animated Glowing Stream Drops */}
      <mesh position={[1.45, dropY, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#38BDF8"
          emissiveIntensity={4.5 * (1 - dropProgress * 0.6)}
        />
      </mesh>

      {/* Light bounce from pipe and flowing fluid */}
      <pointLight position={[1.1, 0.8, 0.3]} intensity={14} color="#00D2FC" distance={4} />
      <pointLight position={[1.45, 0.45, 0.2]} intensity={18} color="#38BDF8" distance={4} />

      {/* 4. Large Reservoir Barrel / Tank */}
      <group position={[1.45, 0.28, 0]}>
        {/* Metal Barrel Shell */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.35, 0.56, 32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Glowing Full Liquid Level */}
        <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={3.8}
          />
        </mesh>
      </group>
    </group>
  );
};
