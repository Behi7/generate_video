import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularTokamakReactor: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 505 to 720
  if (frame < 505) return null;

  // --- 1. MAGNETIC SNAP-LOCK KINEMATICS (frames 505 - 518) ---
  // Heavy titanium toroidal base drops in (frames 505 - 508, 3 frames)
  const baseDropY = interpolate(frame, [505, 508], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Toroidal vessel & magnetic coil cage drops from above and snaps at frame 514 (5 frames, bezier)
  const coreDropY = interpolate(frame, [509, 514], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Cryogenic cooling manifolds slide in from right and snap at frame 514
  const manifoldSlideX = interpolate(frame, [509, 514], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst at frame 514 (frames 514 - 517, 4 frames)
  const snapSparkActive = frame >= 514 && frame <= 517;
  const snapSparkFrameOffset = frame - 514;

  // --- 2. ON-MACHINE PHYSICAL TRIGGER: Armored Power Cable Plug Slam at Frame 560 ---
  // Cable shoots in from x = -2.8 to x = -0.58 between frames 555 and 560 (5 frames)
  const cablePlugX = interpolate(frame, [555, 560], [-2.8, -0.58], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Electric arc discharge spark flash at plug contact (frames 560 - 566)
  const electricArcActive = frame >= 560 && frame <= 566;
  const electricArcOffset = frame - 560;

  // Climax Ignition state (frames 560 - 720)
  const isPowered = frame >= 560;
  const activeFrame = isPowered ? frame - 560 : 0;

  // Plasma ring swirling rotation & magnetic flux oscillations
  const plasmaRotation = isPowered ? activeFrame * 0.38 : 0;
  const plasmaPulse = isPowered ? Math.sin(frame * 0.45) * 0.8 + 6.2 : 0.2;
  const reactorLightIntensity = isPowered ? 36.0 + Math.sin(frame * 0.3) * 6.0 : 2.0;

  // Toroidal D-coil count (8 D-shaped superconducting magnetic field coils)
  const dCoilAngles = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.2, 1.2, 1.2]}>
      {/* Docking Assembly Contact Spark Burst (Frame 514) */}
      <SparkBurst
        active={snapSparkActive}
        frameOffset={snapSparkFrameOffset}
        position={[0, 0.65, 0]}
        color="#00E5FF"
        scale={1.5}
      />

      {/* Electric Arc Discharge Spark Flash at Plug Slam (Frame 560) */}
      <SparkBurst
        active={electricArcActive}
        frameOffset={electricArcOffset}
        position={[-0.58, 0.52, 0.22]}
        color="#A855F7"
        scale={2.0}
        count={16}
        spread={1.4}
      />
      <SparkBurst
        active={electricArcActive}
        frameOffset={electricArcOffset}
        position={[-0.58, 0.52, 0.22]}
        color="#00E5FF"
        scale={1.6}
        count={12}
      />

      {/* --- HEAVY TITANIUM MONOLITHIC TOROIDAL BASE (Zero bolts) --- */}
      <group position={[0, baseDropY, 0]}>
        {/* Monolithic Machined Titanium Base Pedestal */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.78, 0.84, 0.24, 36]} />
          <meshStandardMaterial color="#0B132B" roughness={0.18} metalness={0.92} />
        </mesh>
        {/* Glowing High-Tech Cyan Foundation Collar */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.86, 0.86, 0.04, 36]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={isPowered ? 3.5 : 0.6}
          />
        </mesh>
        {/* Precision Internal Torus Alignment Ring */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.03, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

      {/* --- TOROIDAL VACUUM VESSEL, PLASMA CORE & MAGNETIC D-COILS (Snaps at frame 514) --- */}
      <group position={[0, baseDropY + coreDropY, 0]}>
        {/* Central Solenoid Stack (Vertical magnet cylinder in torus center) */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.82, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.92} />
        </mesh>
        {/* Central Solenoid Neon Flux Rings */}
        {[-0.24, -0.08, 0.08, 0.24].map((yOffset, idx) => (
          <mesh key={idx} position={[0, 0.65 + yOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.165, 0.012, 12, 24]} />
            <meshStandardMaterial
              color="#A855F7"
              emissive="#A855F7"
              emissiveIntensity={isPowered ? 4.0 : 0.4}
            />
          </mesh>
        ))}

        {/* Outer Toroidal Vacuum Vessel (Dark titanium outer shell) */}
        <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.2, 24, 48]} />
          <meshStandardMaterial
            color="#1E293B"
            roughness={0.25}
            metalness={0.9}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Clear Aerospace Quartz Toroidal Observation Chamber */}
        <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.18, 20, 40]} />
          <meshStandardMaterial
            color="#E0F2FE"
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* --- VIOLET / CYAN PLASMA RING IGNITION (Grand Climax at frame 560) --- */}
        <group position={[0, 0.65, 0]} rotation={[0, plasmaRotation, 0]}>
          {/* Main Core Plasma Torus */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.46, 0.075, 20, 48]} />
            <meshStandardMaterial
              color="#A855F7"
              emissive={isPowered ? "#C084FC" : "#38BDF8"}
              emissiveIntensity={plasmaPulse}
              roughness={0.1}
            />
          </mesh>
          {/* Inner High-Energy Cyan Plasma Stream */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.46, 0.045, 16, 40]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={isPowered ? plasmaPulse * 1.4 : 0}
            />
          </mesh>
        </group>

        {/* 8 D-SHAPED SUPERCONDUCTING MAGNETIC FIELD COILS */}
        {dCoilAngles.map((angle, idx) => (
          <group key={idx} position={[0, 0.65, 0]} rotation={[0, angle, 0]}>
            {/* D-Coil Outer Curved Frame */}
            <mesh position={[0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.26, 0.035, 12, 24, Math.PI]} />
              <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.92} />
            </mesh>
            {/* D-Coil Inner Straight Return Leg */}
            <mesh position={[0.2, 0, 0]}>
              <boxGeometry args={[0.06, 0.52, 0.06]} />
              <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Superconducting Cyan Glow Stripe */}
            <mesh position={[0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.26, 0.012, 8, 24, Math.PI]} />
              <meshStandardMaterial
                color="#00E5FF"
                emissive="#00E5FF"
                emissiveIntensity={isPowered ? 4.5 : 0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Reactor Power Socket Housing on left flank (x = -0.58, y = 0.52, z = 0.22) */}
        <mesh position={[-0.58, 0.52, 0.22]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.15, 0.18, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Socket High-Voltage Interlock Guide Ring */}
        <mesh position={[-0.67, 0.52, 0.22]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.12, 0.018, 12, 20]} />
          <meshStandardMaterial
            color="#A855F7"
            emissive="#A855F7"
            emissiveIntensity={isPowered ? 3.5 : 0.4}
          />
        </mesh>
      </group>

      {/* --- RIGHT SIDE CRYOGENIC MANIFOLDS (Slides in at frame 514) --- */}
      <group position={[manifoldSlideX, baseDropY, 0]}>
        {/* Heavy Cryogenic Fluid Vault */}
        <mesh position={[0.78, 0.48, 0]}>
          <boxGeometry args={[0.26, 0.65, 0.42]} />
          <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Coolant Feed Lines */}
        {[-0.12, 0.12].map((zPos, idx) => (
          <mesh key={idx} position={[0.62, 0.48, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 0.28, 16]} />
            <meshStandardMaterial color="#00E5FF" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* --- ON-MACHINE TRIGGER: ARMORED POWER CABLE WITH HAZARD PLUG (Slams in at frame 560) --- */}
      <group position={[cablePlugX, baseDropY + 0.52, 0.22]}>
        {/* Armored Cable Connector Head */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.11, 0.2, 20]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.94} />
        </mesh>
        {/* High-Voltage Plug Hazard Ring (Alternating black & hazard neon) */}
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.04, 20]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#F59E0B"
            emissiveIntensity={isPowered ? 3.0 : 0.8}
          />
        </mesh>
        {/* Heavy Flexible Armored Cable Body (Curving offscreen to left) */}
        <mesh position={[-0.45, -0.06, 0]} rotation={[0, 0, 1.45]}>
          <cylinderGeometry args={[0.075, 0.075, 0.75, 20]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[-1.0, -0.22, 0]} rotation={[0, 0, 1.3]}>
          <cylinderGeometry args={[0.075, 0.075, 0.85, 20]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* --- VOLUMETRIC RADIANT PLASMA ILLUMINATION --- */}
      <pointLight
        position={[0, baseDropY + 0.65, 0]}
        intensity={reactorLightIntensity}
        color={isPowered ? "#00E5FF" : "#38BDF8"}
        distance={10.0}
        decay={1.8}
      />
      {isPowered && (
        <pointLight
          position={[0, baseDropY + 0.65, 0]}
          intensity={reactorLightIntensity * 0.75}
          color="#A855F7"
          distance={8.0}
          decay={1.8}
        />
      )}
    </group>
  );
};
