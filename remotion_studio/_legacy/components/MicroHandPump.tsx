import React from "react";
import { useCurrentFrame } from "remotion";

interface MicroHandPumpProps {
  position?: [number, number, number];
  scale?: [number, number, number] | number;
}

export const MicroHandPump: React.FC<MicroHandPumpProps> = ({
  position = [-0.75, -2.1, 0.1],
  scale = [1.25, 1.25, 1.25],
}) => {
  const frame = useCurrentFrame();

  // Slow laborious stroke cycle (1 stroke every 90 frames = 1.5s)
  const strokePhase = (frame % 90) / 90;
  // Lever angle in radians
  const leverAngle =
    strokePhase < 0.35
      ? -0.3 + (strokePhase / 0.35) * 0.6
      : 0.3 - ((strokePhase - 0.35) / 0.65) * 0.6;

  // Piston shaft vertical displacement synced to lever
  const pistonY = 0.95 - Math.sin(leverAngle) * 0.22;

  // Single pathetic drop falling into pail
  const dropActive = strokePhase > 0.35 && strokePhase < 0.75;
  const dropY = 0.55 - ((strokePhase - 0.35) / 0.4) * 0.75;

  return (
    <group position={position} scale={scale}>
      {/* 1. Heavy Cast-Iron Floor Pedestal */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.55, 0.24, 0.55]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* 2. Precision Steel Hydraulic Cylinder Body */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.82, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Cylinder Top Cap & Pivot Yoke */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.08, 32]} />
        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* 3. Linear Piston Shaft (Enters cylinder vertically) */}
      <mesh position={[0.08, pistonY, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 16]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* 4. Rocker Lever Assembly */}
      <group position={[0, 1.15, 0]} rotation={[0, 0, leverAngle]}>
        {/* Steel Lever Bar */}
        <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.75, 16]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Ergonomic Grip Handle */}
        <mesh position={[-0.68, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.2, 16]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        {/* Central Pivot Pin */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.16, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* 5. Analog Pressure Gauge (Facing Forward) */}
      <group position={[0.18, 0.75, 0.15]} rotation={[0, 0.1, 0]}>
        {/* Brass Outer Bezel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Dark Gauge Face */}
        <mesh position={[0, 0, 0.022]}>
          <circleGeometry args={[0.11, 24]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
        {/* Limp Red Needle Resting Near Zero */}
        <group position={[0, 0, 0.025]} rotation={[0, 0, 0.2]}>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.005, 0.008, 0.07, 8]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
          </mesh>
        </group>
      </group>

      {/* 6. Spigot Tap Pipe */}
      <mesh position={[0.2, 0.52, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.035, 0.04, 0.2, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* 7. Pathetic Single Droplet */}
      {dropActive && (
        <mesh position={[0.28, dropY, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={2.8}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* 8. Collector Metal Drum Below */}
      <group position={[0.28, 0.16, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.32, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
