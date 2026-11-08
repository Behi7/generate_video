import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularQuantumReactor: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 505 to 720
  if (frame < 505) return null;

  // 1. Magnetic Snap-Lock Kinematics (frames 505 - 518)
  // Heavy titanium base drops from y = +3.5 to y = 0 (frames 505 - 508, 3 frames)
  const baseDropY = interpolate(frame, [505, 508], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Core & twin impellers drop in and snap at frame 514 (frames 509 - 514, 5 frames)
  const coreDropY = interpolate(frame, [509, 514], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Battery vault slides in from right (frames 509 - 514, 5 frames)
  const vaultSlideX = interpolate(frame, [509, 514], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst at frame 514 (frames 514 - 517, 4 frames)
  const snapSparkActive = frame >= 514 && frame <= 517;
  const snapSparkFrameOffset = frame - 514;

  // 2. Physical Trigger 3: Armored Cable Plug Slams in at Frame 560
  // Cable shoots in from x = -2.8 to x = -0.58 between frames 555 and 560 (5 frames)
  const cablePlugX = interpolate(frame, [555, 560], [-2.8, -0.58], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Electric arc discharge spark flash at plug contact (frames 560 - 566)
  const electricArcActive = frame >= 560 && frame <= 566;
  const isPowered = frame >= 560;

  // 3. Operational Climax Kinematics (frames 560 - 720)
  const activeFrame = isPowered ? frame - 560 : 0;
  const rotorAngle = isPowered ? activeFrame * 0.32 : 0;
  const rotorReverse = isPowered ? -activeFrame * 0.26 : 0;

  // Blinding cyan plasma core ignition & energetic pulse
  const corePulse = isPowered
    ? Math.sin(frame * 0.4) * 0.9 + 5.2
    : 0.25;

  // High-pressure analog gauge needle violent jitter in overload zone
  const needleJitter = isPowered
    ? Math.sin(frame * 1.5) * 0.08 - 1.25
    : -0.2;

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.22, 1.22, 1.22]}>
      {/* --- HEAVY TITANIUM MONOLITHIC BASE --- */}
      <group position={[0, baseDropY, 0]}>
        {/* Monolithic Titanium Bed with Docking Guide Chamfer (Zero bolts) */}
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.62, 0.68, 0.28, 36]} />
          <meshStandardMaterial color="#0B132B" roughness={0.18} metalness={0.92} />
        </mesh>
        {/* Glowing Cyan Base Collar */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.04, 36]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00D2FC"
            emissiveIntensity={isPowered ? 4.0 : 0.5}
          />
        </mesh>
        {/* Precision Internal Alignment Guide Ring */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.02, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

      {/* --- CORE ASSEMBLY: Quartz Mantle, Impellers & Stator Housing (Snaps at 514) --- */}
      <group position={[0, coreDropY + baseDropY, 0]}>
        {/* Top Monolithic Stator Housing (Zero bolts) */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.52, 0.5, 0.16, 36]} />
          <meshStandardMaterial color="#0F172A" roughness={0.18} metalness={0.92} />
        </mesh>
        <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.51, 0.022, 16, 36]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00D2FC"
            emissiveIntensity={isPowered ? 3.8 : 0.4}
          />
        </mesh>

        {/* Heavy Transparent Quartz Mantle Sleeve */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 1.12, 36]} />
          <meshStandardMaterial
            color="#A5F3FC"
            roughness={0.05}
            metalness={0.15}
            transparent
            opacity={0.34}
          />
        </mesh>

        {/* Monolithic Central Titanium Drive Axle */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1.1, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.1} metalness={0.96} />
        </mesh>

        {/* Lower Radial Impeller Disk */}
        <group position={[0, 0.48, 0]} rotation={[0, rotorAngle, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.075, 24]} />
            <meshStandardMaterial color="#00E5FF" roughness={0.18} metalness={0.92} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.23, 0, Math.sin(angle) * 0.23]}
                rotation={[0, angle + 0.35, 0]}
              >
                <boxGeometry args={[0.21, 0.19, 0.018]} />
                <meshStandardMaterial
                  color="#E0F2FE"
                  roughness={0.12}
                  metalness={0.92}
                  emissive="#00D2FC"
                  emissiveIntensity={isPowered ? 1.2 : 0}
                />
              </mesh>
            );
          })}
        </group>

        {/* Central Glowing Cyan Plasma Reactor Core Sphere */}
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.17, 32, 32]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={corePulse}
          />
        </mesh>

        {/* Upper Counter-Rotating Radial Impeller Disk */}
        <group position={[0, 1.08, 0]} rotation={[0, rotorReverse, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.075, 24]} />
            <meshStandardMaterial color="#00E5FF" roughness={0.18} metalness={0.92} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.23, 0, Math.sin(angle) * 0.23]}
                rotation={[0, angle - 0.35, 0]}
              >
                <boxGeometry args={[0.21, 0.19, 0.018]} />
                <meshStandardMaterial
                  color="#E0F2FE"
                  roughness={0.12}
                  metalness={0.92}
                  emissive="#00D2FC"
                  emissiveIntensity={isPowered ? 1.2 : 0}
                />
              </mesh>
            );
          })}
        </group>

        {/* Monolithic Precision Analog Gauge (Facing Camera) */}
        <group position={[-0.4, 1.06, 0.28]} rotation={[0, 0.06, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.055, 24]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.012, 24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.038, 0.036]} rotation={[0, 0, needleJitter]}>
            <boxGeometry args={[0.014, 0.1, 0.006]} />
            <meshStandardMaterial
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={isPowered ? 2.0 : 0.2}
            />
          </mesh>
        </group>

        {/* ON-MACHINE TRIGGER 3: Heavy Flanged High-Voltage Receptacle Socket (Left Side) */}
        <group position={[-0.54, 0.46, 0]}>
          {/* Heavy Machined Titanium Flange (Zero bolts) */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Receptacle Guide Bevel Collar */}
          <mesh position={[-0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, 0.03, 24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* --- PHYSICAL TRIGGER 3: HEAVY INDUSTRIAL ARMORED POWER CABLE WITH BLACK/YELLOW PLUG --- */}
      <group position={[cablePlugX, 0.46 + baseDropY, 0]}>
        {/* Monolithic Armored Industrial 3-Pin Plug Head */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.095, 0.095, 0.18, 24]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.28} metalness={0.82} />
        </mesh>
        {/* High-Visibility Black Industrial Contrast Stripes on Plug */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.096, 0.096, 0.04, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.096, 0.096, 0.04, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Heavy Rubber Strain Relief Boot */}
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.092, 0.12, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.55} />
        </mesh>
        {/* Armored Flexible Power Conduit Cable Extending Off-Screen Left */}
        <mesh position={[-1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 2.4, 20]} />
          <meshStandardMaterial color="#0F172A" roughness={0.45} metalness={0.75} />
        </mesh>

        {/* High-Voltage Arc Discharge Sparks at Plug Contact (frame 560 - 566) */}
        {electricArcActive && (
          <>
            <mesh position={[0.1, 0, 0]}>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshBasicMaterial color="#E0F2FE" />
            </mesh>
            <SparkBurst
              active={true}
              frameOffset={frame - 560}
              position={[0.1, 0, 0]}
              color="#00E5FF"
              scale={1.6}
            />
          </>
        )}
      </group>

      {/* --- RIGHT MODULE: Monolithic Conduit & High-Capacity Battery Vault (Snaps from right) --- */}
      <group position={[vaultSlideX, coreDropY + baseDropY, 0]}>
        {/* Monolithic Titanium Docking Conduit Pipe (Zero bolts) */}
        <mesh position={[0.58, 0.64, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.38, 20]} />
          <meshStandardMaterial
            color="#E0F2FE"
            emissive="#00E5FF"
            emissiveIntensity={isPowered ? 3.5 : 0.25}
            roughness={0.08}
            metalness={0.3}
            transparent
            opacity={0.88}
          />
        </mesh>
        <mesh position={[0.44, 0.64, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
        </mesh>

        {/* Monolithic Armored High-Capacity Battery Vault */}
        <group position={[0.98, 0.64, 0]}>
          <mesh>
            <boxGeometry args={[0.48, 0.9, 0.48]} />
            <meshStandardMaterial color="#0B132B" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* 4 Illuminated Power Cells */}
          {[0, 1, 2, 3].map((cellIdx) => {
            const cellY = -0.3 + cellIdx * 0.19;
            return (
              <mesh key={cellIdx} position={[0.02, cellY, 0.245]}>
                <boxGeometry args={[0.36, 0.11, 0.02]} />
                <meshStandardMaterial
                  color="#10B981"
                  emissive="#10B981"
                  emissiveIntensity={isPowered ? 3.6 : 0.3}
                />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* --- DOCKING CONTACT SPARK BURSTS AT FRAME 514 (frames 514 - 517, 4 frames) --- */}
      {snapSparkActive && (
        <>
          {/* Base Rim Sparks */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0.35, 0.28, 0]}
            color="#00E5FF"
            scale={1.4}
          />
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[-0.35, 0.28, 0]}
            color="#00E5FF"
            scale={1.4}
          />
          {/* Conduit Seam Spark */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0.45, 0.64, 0]}
            color="#FFFFFF"
            scale={1.1}
          />
        </>
      )}
    </group>
  );
};
