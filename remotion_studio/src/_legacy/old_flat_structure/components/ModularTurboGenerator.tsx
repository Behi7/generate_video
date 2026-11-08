import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularTurboGenerator: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 310 to 504 (cleared before Tier 4 starts at 505)
  if (frame < 310 || frame >= 505) return null;

  // --- 1. MAGNETIC SNAP-LOCK KINEMATICS (frames 310 - 320) ---
  // Skid baseplate drops in from y = +3.5 to y = 0 (frames 310 - 312, 2 frames)
  const baseDropY = interpolate(frame, [310, 312], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Turbine module (left) and Alternator module (right) shoot in from x = -3.8 and x = +3.8
  // docking and snapping tight at frame 316 (4 frames, bezier)
  const moduleFlyProgress = interpolate(frame, [312, 316], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  const turbineModuleX = (1 - moduleFlyProgress) * -3.8;
  const alternatorModuleX = (1 - moduleFlyProgress) * 3.8;

  // Top searchlight bridge drops from y = +3.2 and clamps at frame 316
  const topBridgeY = interpolate(frame, [312, 316], [3.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst (frames 316 - 319, 4 frames)
  const snapSparkActive = frame >= 316 && frame <= 319;
  const snapSparkFrameOffset = frame - 316;

  // --- 2. ON-MACHINE PHYSICAL TRIGGER: Red Industrial Mushroom Button ---
  // Button depresses sharply at frame 360 (frames 359 - 361)
  const isStarted = frame >= 360;
  const buttonDepress = interpolate(frame, [359, 361], [0, 0.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });
  const buttonClickSpark = frame >= 360 && frame <= 363;
  const buttonClickOffset = frame - 360;

  // --- 3. OPERATIONAL KINEMATICS (frames 360 - 494) ---
  const activeFrame = isStarted ? frame - 360 : 0;
  const turbineRotorAngle = isStarted ? activeFrame * 0.72 : 0;

  // High-intensity searchlights (Turn on at frame 360, blowout at frame 496)
  const lightsOn = frame >= 360 && frame < 497;
  const lightIntensity = lightsOn ? 28.0 : 0;

  // --- 4. OVERLOAD PHYSICAL DESTRUCTION (frames 495 - 504) ---
  const isDestroyed = frame >= 495;
  const destroyProgress = interpolate(frame, [495, 504], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // 150-bar blowout valve explodes off upward & spinning
  const valveBlowoutY = isDestroyed ? destroyProgress * 2.8 : 0;
  const valveBlowoutRot = isDestroyed ? destroyProgress * 7.5 : 0;

  // Massive vertical steam cone eruption from ruptured valve port
  const steamActive = frame >= 495 && frame <= 503;
  const steamProgress = (frame - 495) / 8;
  const steamConeHeight = 0.5 + steamProgress * 2.5;
  const steamConeRadius = 0.2 + steamProgress * 0.85;
  const steamOpacity = Math.max(0, 0.92 - steamProgress * 0.95);

  // Turbine casing cracks & fractures outward
  const turbineFractureX = isDestroyed ? -destroyProgress * 0.42 : 0;
  const turbineFractureRotZ = isDestroyed ? -destroyProgress * 0.28 : 0;

  const alternatorFractureX = isDestroyed ? destroyProgress * 0.38 : 0;
  const alternatorFractureRotZ = isDestroyed ? destroyProgress * 0.22 : 0;

  // High pressure blowout spark burst (frames 495 - 499)
  const ruptureSparkActive = frame >= 495 && frame <= 499;
  const ruptureSparkOffset = frame - 495;

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.2, 1.2, 1.2]}>
      {/* Docking Seam Contact Spark Bursts (Frame 316) */}
      <SparkBurst
        active={snapSparkActive}
        frameOffset={snapSparkFrameOffset}
        position={[-0.2, 0.55, 0]}
        color="#38BDF8"
        scale={1.3}
      />
      <SparkBurst
        active={snapSparkActive}
        frameOffset={snapSparkFrameOffset}
        position={[0.2, 0.55, 0]}
        color="#38BDF8"
        scale={1.3}
      />

      {/* Button Depress Contact Spark (Frame 360) */}
      <SparkBurst
        active={buttonClickSpark}
        frameOffset={buttonClickOffset}
        position={[0.38, 0.88, 0.26]}
        color="#EF4444"
        scale={0.8}
      />

      {/* Blowout Valve Rupture Spark Burst (Frame 495) */}
      <SparkBurst
        active={ruptureSparkActive}
        frameOffset={ruptureSparkOffset}
        position={[-0.28, 1.12, 0]}
        color="#38BDF8"
        scale={1.6}
      />

      {/* --- STRUCTURAL CHANNEL SKID BASEPLATE (Monolithic steel, Zero bolts) --- */}
      <group position={[0, baseDropY, 0]}>
        {/* Main Monolithic Skid Base */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.92, 0.16, 0.95]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Longitudinal Skid Runners */}
        {[-0.38, 0.38].map((zPos, idx) => (
          <mesh key={idx} position={[0, 0.02, zPos]}>
            <boxGeometry args={[1.98, 0.04, 0.14]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
          </mesh>
        ))}
        {/* High-Tech Cyan Recessed Edge Trim */}
        <mesh position={[0, 0.165, 0]}>
          <boxGeometry args={[1.86, 0.01, 0.88]} />
          <meshStandardMaterial
            color="#0284C7"
            emissive="#38BDF8"
            emissiveIntensity={isStarted && !isDestroyed ? 1.4 : 0.2}
          />
        </mesh>
      </group>

      {/* --- LEFT MODULE: High-RPM Gas/Steam Turbine Volute & Rotor --- */}
      <group
        position={[turbineModuleX + turbineFractureX, baseDropY, 0]}
        rotation={[0, 0, turbineFractureRotZ]}
      >
        {/* Volute Spiral Casing Housing */}
        <mesh position={[-0.48, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.44, 0.52, 28]} />
          <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.92} />
        </mesh>
        {/* Inlet Duct Cone */}
        <mesh position={[-0.78, 0.58, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.28, 0.25, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Visible High-Speed Turbine Rotor Impeller (Spins inside shroud) */}
        <group position={[-0.48, 0.58, 0.27]} rotation={[0, 0, turbineRotorAngle]}>
          {/* Central Rotor Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 20]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.96} />
          </mesh>
          {/* 8 Radial Titanium Aerodynamic Impeller Blades */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const bladeAngle = (i * Math.PI) / 4;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(bladeAngle) * 0.22,
                  Math.sin(bladeAngle) * 0.22,
                  0,
                ]}
                rotation={[0, 0, bladeAngle + 0.35]}
              >
                <boxGeometry args={[0.22, 0.035, 0.03]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.98} />
              </mesh>
            );
          })}
        </group>

        {/* 150-Bar Safety Blowout Valve Port */}
        <mesh position={[-0.28, 0.98, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.22, 18]} />
          <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* 150-Bar Blowout Valve Cap (Explodes off at frame 495) */}
        <group
          position={[-0.28, 1.1 + valveBlowoutY, 0]}
          rotation={[0, isDestroyed ? valveBlowoutRot : 0, isDestroyed ? valveBlowoutRot : 0]}
        >
          {/* Valve Brass Bonnet */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.08, 0.12, 18]} />
            <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
          </mesh>
          {/* Top Hex Release Cap */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.06, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.96} />
          </mesh>
        </group>

        {/* Massive Vertical Steam Blowout Cone (Frames 495 - 503) */}
        {steamActive && (
          <group position={[-0.28, 1.05, 0]}>
            <mesh position={[0, steamConeHeight * 0.5, 0]}>
              <coneGeometry args={[steamConeRadius, steamConeHeight, 20]} />
              <meshStandardMaterial
                color="#FFFFFF"
                transparent
                opacity={steamOpacity}
                roughness={0.9}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* --- RIGHT MODULE: High-Output Brushless Alternator & Terminal Box --- */}
      <group
        position={[alternatorModuleX + alternatorFractureX, baseDropY, 0]}
        rotation={[0, 0, alternatorFractureRotZ]}
      >
        {/* Monolithic Finned Alternator Body */}
        <mesh position={[0.48, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.36, 0.62, 28]} />
          <meshStandardMaterial color="#1E293B" roughness={0.28} metalness={0.92} />
        </mesh>
        {/* Radial Heatsink Fins with Cyan Neon Accents */}
        {[-0.24, -0.12, 0, 0.12, 0.24].map((dx, idx) => (
          <mesh key={idx} position={[0.48 + dx, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.37, 0.018, 12, 28]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={isStarted && !isDestroyed ? 2.5 : 0.3}
            />
          </mesh>
        ))}

        {/* Machined Terminal Box on Alternator Top */}
        <mesh position={[0.38, 0.88, 0.18]}>
          <boxGeometry args={[0.32, 0.18, 0.28]} />
          <meshStandardMaterial color="#334155" roughness={0.22} metalness={0.9} />
        </mesh>

        {/* --- ON-MACHINE TRIGGER: Red Industrial Mushroom Button --- */}
        <group position={[0.38, 0.98 - buttonDepress, 0.22]}>
          {/* Yellow Safety Collar Ring */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.075, 0.08, 0.03, 20]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.3} />
          </mesh>
          {/* Depressible Stem */}
          <mesh position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.05, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Emergency Red Mushroom Palm Head */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.065, 20, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* --- UPPER ARCH: QUAD-SEARCHLIGHTS (Clamps at frame 316, ignites at 360) --- */}
      <group position={[0, baseDropY + topBridgeY, 0]}>
        {/* Overhead Bridge Arch Bar */}
        <mesh position={[0, 1.25, 0.15]}>
          <boxGeometry args={[1.36, 0.06, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* 4 Searchlight Pods */}
        {[-0.51, -0.17, 0.17, 0.51].map((xPos, idx) => (
          <group key={idx} position={[xPos, 1.25, 0.15]} rotation={[0.4, 0, 0]}>
            {/* Lamp Cylindrical Pod Casing */}
            <mesh position={[0, -0.06, 0]}>
              <cylinderGeometry args={[0.09, 0.075, 0.16, 18]} />
              <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* High-Output Cyan/White LED Face */}
            <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.075, 18]} />
              <meshStandardMaterial
                color="#E0F2FE"
                emissive="#38BDF8"
                emissiveIntensity={lightsOn ? 5.5 : 0}
              />
            </mesh>
            {/* Projected Volumetric Light Cone */}
            {lightsOn && (
              <mesh position={[0, -0.65, 0]}>
                <coneGeometry args={[0.35, 1.1, 16]} />
                <meshBasicMaterial
                  color="#38BDF8"
                  transparent
                  opacity={0.18}
                />
              </mesh>
            )}
          </group>
        ))}

        {/* Overhead Cast Light illumination */}
        {lightIntensity > 0 && (
          <pointLight
            position={[0, 1.1, 0.6]}
            intensity={lightIntensity}
            color="#38BDF8"
            distance={8.0}
            decay={1.8}
          />
        )}
      </group>
    </group>
  );
};
