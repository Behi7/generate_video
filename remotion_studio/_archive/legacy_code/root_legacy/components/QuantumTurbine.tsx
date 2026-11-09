import React from "react";
import { useCurrentFrame } from "remotion";

interface QuantumTurbineProps {
  position?: [number, number, number];
  scale?: [number, number, number] | number;
}

export const QuantumTurbine: React.FC<QuantumTurbineProps> = ({
  position = [0.55, -2.1, 0.1],
  scale = [1.18, 1.18, 1.18],
}) => {
  const frame = useCurrentFrame();

  // Machine starts ONLY after Trigger 3 (frame >= 1170, knife switch slam)
  const isStarted = frame >= 1170;
  const activeFrame = isStarted ? frame - 1170 : 0;

  // Smooth calibrated rotation speed once ignited
  const rotorAngle = isStarted ? activeFrame * 0.11 : 0;
  const rotorReverse = isStarted ? -activeFrame * 0.09 : 0;

  // Pulsing extreme plasma reactor core (dim before trigger, blazing after)
  const corePulse = isStarted
    ? Math.sin(frame * 0.18) * 0.8 + 4.8
    : 0.4;

  // Needle violently jittering in the red overload zone
  const needleJitter = isStarted
    ? Math.sin(frame * 0.7) * 0.06 - 1.25
    : -0.2;

  return (
    <group position={position} scale={scale}>
      {/* 1. Heavy Titanium Base with Cyan Neon Base Trim */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.58, 0.64, 0.28, 32]} />
        <meshStandardMaterial color="#0B132B" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Base Neon Ring Collar */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.04, 32]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00D2FC"
          emissiveIntensity={3.8}
        />
      </mesh>

      {/* 2. Top Turbine Housing Stator & Horizontal Collar */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.5, 0.48, 0.14, 32]} />
        <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.49, 0.02, 16, 32]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00D2FC" emissiveIntensity={3.5} />
      </mesh>

      {/* 3. Transparent Quartz Mantle (Enclosing the spinning rotor) */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 1.1, 32]} />
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.05}
          metalness={0.15}
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* 4. Physical Central Drive Shaft (Axle) */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 24]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* 5. Central Glowing Plasma Core (Visible between stages) */}
      <mesh position={[0, 0.76, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#00E5FF"
          emissiveIntensity={corePulse}
        />
      </mesh>
      <pointLight position={[0, 0.76, 0.2]} intensity={35} color="#00E5FF" distance={5} />

      {/* 6. Lower Turbine Stage (Forward Rotation) */}
      <group position={[0, 0.48, 0]} rotation={[0, rotorAngle, 0]}>
        {/* Hub Disk */}
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* 6 Aerodynamic Curved Impeller Blades */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI) / 3;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.24, 0, 0]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.2, 0.24, 0.018]} />
                <meshStandardMaterial
                  color="#00E5FF"
                  emissive="#00D2FC"
                  emissiveIntensity={2.5}
                  metalness={0.95}
                  roughness={0.1}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 7. Upper Counter-Rotating Turbine Stage */}
      <group position={[0, 1.05, 0]} rotation={[0, rotorReverse, 0]}>
        {/* Hub Disk */}
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* 6 Counter-rotating blades */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI) / 3;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.24, 0, 0]} rotation={[-0.3, 0, 0]}>
                <boxGeometry args={[0.2, 0.24, 0.018]} />
                <meshStandardMaterial
                  color="#38BDF8"
                  emissive="#0284C7"
                  emissiveIntensity={2.0}
                  metalness={0.95}
                  roughness={0.1}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 8. Industrial Pressure Gauge (Facing DIRECTLY towards camera) */}
      <group position={[-0.3, 1.02, 0.38]} rotation={[0, 0.06, 0]}>
        {/* Heavy Brass Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.045, 24]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Dark Gauge Face */}
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.125, 24]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
        {/* Red Overload Danger Arc */}
        <mesh position={[0, 0, 0.028]} rotation={[0, 0, -Math.PI / 4]}>
          <ringGeometry args={[0.075, 0.11, 24, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={3.5} />
        </mesh>
        {/* Vibrating Red Needle */}
        <group position={[0, 0, 0.03]} rotation={[0, 0, needleJitter]}>
          <mesh position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.006, 0.012, 0.09, 8]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={4.0} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.015, 12, 12]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
        </group>
      </group>

      {/* 9. Sealed Flanged Conduit: Connects Turbine into Battery Vault */}
      <group position={[0.38, 0.65, 0]}>
        {/* Flange on Turbine Body */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Horizontal Quartz Pipe Span */}
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.28, 24]} />
          <meshStandardMaterial
            color="#38BDF8"
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.4}
          />
        </mesh>
        {/* Inner Glowing Plasma Stream */}
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.3, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#00D2FC"
            emissiveIntensity={corePulse * 1.2}
          />
        </mesh>

        {/* Input Flange on Battery Vault */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* 10. Heavy Industrial Battery Vault (Fully inside frame safe area) */}
      <group position={[0.82, 0.55, 0]}>
        {/* Vault Main Housing */}
        <mesh>
          <boxGeometry args={[0.36, 0.85, 0.42]} />
          <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Front Meter Bezel */}
        <mesh position={[0, 0, 0.215]}>
          <boxGeometry args={[0.3, 0.74, 0.02]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* 4 Integrated Segmented Green Energy Bars */}
        {[0, 1, 2, 3].map((b) => (
          <mesh key={b} position={[0, -0.24 + b * 0.16, 0.228]}>
            <boxGeometry args={[0.24, 0.1, 0.01]} />
            <meshStandardMaterial
              color="#22C55E"
              emissive="#22C55E"
              emissiveIntensity={3.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
