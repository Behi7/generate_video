import React from "react";
import { useCurrentFrame } from "remotion";

interface TurboPumpProps {
  position?: [number, number, number];
  scale?: [number, number, number] | number;
}

export const TurboPump: React.FC<TurboPumpProps> = ({
  position = [0, -2.1, 0.1],
  scale = [1.25, 1.25, 1.25],
}) => {
  const frame = useCurrentFrame();

  // Machine starts ONLY after Trigger 2 (frame >= 780, red button slam)
  const isStarted = frame >= 780;
  const activeFrame = isStarted ? frame - 780 : 0;

  // Fast turbine rotation around Z-axis once triggered
  const rotorAngle = isStarted ? activeFrame * 0.18 : 0;

  // Pressure gauge needle (rests at zero before start, vibrates at 90 bar once running)
  const needleAngle = isStarted
    ? -0.55 + Math.sin(frame * 0.65) * 0.06
    : -1.25;

  // Water jet shoots once pump is running
  const showWaterJet = frame >= 786;

  return (
    <group position={position} scale={scale}>
      {/* 1. Heavy Machined Steel Bedplate */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.6, 0.24, 0.85]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 2. Heavy Electric Drive Motor (Mounted at x = -0.42) */}
      <group position={[-0.42, 0.75, 0]}>
        {/* Main Cylindrical Motor Housing */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.52, 32]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.35} metalness={0.75} />
        </mesh>
        {/* Rear Fan Cowling */}
        <mesh position={[-0.29, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.32, 0.08, 32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Terminal Connection Box */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.2, 0.14, 0.22]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.65} />
        </mesh>
      </group>

      {/* 3. Central Drive Shaft & Rigid Coupling Flange */}
      <mesh position={[-0.05, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.24, 24]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
      </mesh>
      <mesh position={[-0.05, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.07, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* 4. Centrifugal Turbo Volute Casing (Facing Front at x = 0.28) */}
      <group position={[0.28, 0.75, 0]}>
        {/* Hollow Annular Cylinder Body (openEnded: true so interior is visible!) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.18, 32, 1, true]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} side={2} />
        </mesh>
        {/* Dark Metallic Backing Plate */}
        <mesh position={[0, 0, -0.09]}>
          <circleGeometry args={[0.44, 32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.9} />
        </mesh>

        {/* 5. Internal 8-Blade Centrifugal Impeller (Rotating around Z axis) */}
        <group position={[0, 0, 0]} rotation={[0, 0, rotorAngle]}>
          {/* Bronze Center Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 20]} />
            <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* 8 Curved Impeller Blades with Cyan Glow */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const bAngle = (i * Math.PI) / 4;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(bAngle) * 0.18,
                  Math.sin(bAngle) * 0.18,
                  0,
                ]}
                rotation={[0, 0, bAngle + Math.PI / 3]}
              >
                <boxGeometry args={[0.02, 0.16, 0.06]} />
                <meshStandardMaterial
                  color="#00E5FF"
                  emissive="#00B4D8"
                  emissiveIntensity={1.4}
                  roughness={0.2}
                  metalness={0.85}
                />
              </mesh>
            );
          })}
        </group>

        {/* Transparent Quartz Front Window */}
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[0.38, 32]} />
          <meshStandardMaterial
            color="#BAE6FD"
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Chrome Front Bezel Collar Ring */}
        <mesh position={[0, 0, 0.092]}>
          <ringGeometry args={[0.38, 0.46, 32]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* 6. Vertical High-Pressure Discharge Conduit with Flanges */}
      <group position={[0.28, 1.4, 0]}>
        {/* Pipe */}
        <mesh>
          <cylinderGeometry args={[0.065, 0.065, 0.65, 24]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Bottom Connection Flange */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Top Flange */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* 7. Precision Analog Pressure Gauge (Facing directly forward) */}
      <group position={[0.28, 1.4, 0.08]}>
        {/* Brass Housing */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 24]} />
          <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* White Dial Face */}
        <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.01, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* Vibrating Red Needle */}
        <mesh position={[0, 0.04, 0.04]} rotation={[0, 0, needleAngle]}>
          <boxGeometry args={[0.014, 0.1, 0.005]} />
          <meshStandardMaterial color="#EF4444" roughness={0.2} />
        </mesh>
      </group>

      {/* 8. High-Pressure Horizontal Jet Pipe to Receiver Tank */}
      <mesh position={[0.54, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.42, 20]} />
        <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.74, 1.7, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.05, 20]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Pressurized High-Velocity Water Stream (Shooting straight into tank) */}
      {showWaterJet && (
        <mesh position={[0.74, 1.15, 0]}>
          <cylinderGeometry args={[0.032, 0.036, 1.05, 16]} />
          <meshStandardMaterial
            color="#06B6D4"
            roughness={0.08}
            metalness={0.15}
            transparent
            opacity={0.88}
          />
        </mesh>
      )}

      {/* Stainless Steel High-Pressure Receiver Vessel */}
      <mesh position={[0.74, 0.42, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.55, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
      </mesh>
    </group>
  );
};
