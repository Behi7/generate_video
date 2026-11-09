import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularTurboPump: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 310 to 504 (cleared before Tier 4 starts at 505)
  if (frame < 310 || frame >= 505) return null;

  // 1. Magnetic Snap-Lock Kinematics (frames 310 - 320)
  // Monolithic baseplate drops in (frames 310 - 312)
  const baseDropY = interpolate(frame, [310, 312], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Motor and Volute modules fly in from offscreen (x=-3.8 and x=+3.8) and snap at frame 316 (4 frames)
  const moduleFlyProgress = interpolate(frame, [312, 316], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  const motorModuleX = (1 - moduleFlyProgress) * -3.8;
  const voluteModuleX = (1 - moduleFlyProgress) * 3.8;

  // Top discharge pipe drops from y = +3.2 and snaps at frame 316
  const topPipeY = interpolate(frame, [312, 316], [3.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst (frames 316 - 319, 4 frames)
  const snapSparkActive = frame >= 316 && frame <= 319;
  const snapSparkFrameOffset = frame - 316;

  // 2. Physical Trigger 2: Red Mushroom Button on Motor Box (depresses at frame 360)
  const isStarted = frame >= 360;
  const buttonDepress = interpolate(frame, [359, 361], [0, 0.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });
  const buttonClickSpark = frame >= 360 && frame <= 363;

  // 3. Operational Kinematics (frames 360 - 494)
  const activeFrame = isStarted ? frame - 360 : 0;
  const rotorAngle = isStarted ? activeFrame * 0.42 : 0;
  const needleAngle = isStarted
    ? -0.55 + Math.sin(frame * 1.2) * 0.08
    : -1.25;
  const showWaterJet = frame >= 364 && frame < 495;

  // 4. Overload Physical Destruction (frames 495 - 504)
  const isDestroyed = frame >= 495;
  const destroyProgress = interpolate(frame, [495, 504], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Gauge extreme spike before breaking
  const blowoutNeedleAngle = isDestroyed ? 0.95 : needleAngle;

  // Motor breaks off mount and tilts left on bed
  const motorDestructX = isDestroyed ? -destroyProgress * 0.42 : 0;
  const motorDestructRot = isDestroyed ? -destroyProgress * 0.38 : 0;

  // Volute casing bursts outward and fractures right on bed
  const voluteDestructX = isDestroyed ? destroyProgress * 0.38 : 0;
  const voluteDestructRot = isDestroyed ? destroyProgress * 0.42 : 0;
  const pipeDestructY = isDestroyed ? destroyProgress * 1.2 : 0;

  // Casing rupture spark burst at high pressure blowout
  const ruptureSparkActive = frame >= 495 && frame <= 500;

  // High-pressure steam blowout cone (frames 495 - 503)
  const steamActive = frame >= 495 && frame <= 503;
  const steamProgress = (frame - 495) / 8;
  const steamConeScale = 0.4 + steamProgress * 2.0;
  const steamOpacity = Math.max(0, 0.9 - steamProgress * 0.95);

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.25, 1.25, 1.25]}>
      {/* Monolithic Cast-Iron Baseplate with Docking Guide Rails (No bolts) */}
      <group position={[0, baseDropY, 0]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.7, 0.16, 0.88]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Machined Dovetail Docking Guide Rails */}
        <mesh position={[0, 0.17, -0.3]}>
          <boxGeometry args={[1.72, 0.03, 0.07]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.95} />
        </mesh>
        <mesh position={[0, 0.17, 0.3]}>
          <boxGeometry args={[1.72, 0.03, 0.07]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.95} />
        </mesh>
      </group>

      {/* --- LEFT MODULE: Monolithic Electric Motor & On-Motor Button --- */}
      <group
        position={[motorModuleX + motorDestructX, baseDropY, 0]}
        rotation={[0, 0, motorDestructRot]}
      >
        <group position={[-0.44, 0.76, 0]}>
          {/* Main Monolithic Motor Housing */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 0.54, 32]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.32} metalness={0.78} />
          </mesh>
          {/* Rear Cooling Cowling */}
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.34, 0.09, 32]} />
            <meshStandardMaterial color="#0F172A" roughness={0.38} metalness={0.82} />
          </mesh>

          {/* Monolithic Terminal Connection Box */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.22, 0.15, 0.24]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.28} metalness={0.7} />
          </mesh>

          {/* ON-MACHINE TRIGGER 2: Red Mushroom Button on Motor Terminal Box */}
          <group position={[0, 0.48, 0]}>
            {/* Caution Collar */}
            <mesh>
              <cylinderGeometry args={[0.075, 0.08, 0.022, 24]} />
              <meshStandardMaterial color="#EAB308" roughness={0.35} />
            </mesh>
            {/* Depressing Red Mushroom Cap (Depresses at frame 360) */}
            <mesh position={[0, 0.042 - buttonDepress, 0]}>
              <cylinderGeometry args={[0.07, 0.058, 0.042, 24]} />
              <meshStandardMaterial
                color="#DC2626"
                roughness={0.2}
                metalness={0.25}
                emissive="#EF4444"
                emissiveIntensity={isStarted ? 2.0 : 0.25}
              />
            </mesh>
          </group>
        </group>

        {/* Central Drive Shaft with Monolithic Titanium Coupling Sleeve */}
        <mesh position={[-0.06, 0.76, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.26, 24]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.96} />
        </mesh>

        {/* Heavy Flanged Motor Mounting Foot (Monolithic) */}
        <mesh position={[-0.44, 0.2, 0]}>
          <boxGeometry args={[0.56, 0.12, 0.72]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Trigger Contact Spark at Button Press */}
        {buttonClickSpark && (
          <SparkBurst
            active={true}
            frameOffset={frame - 360}
            position={[-0.44, 1.28, 0]}
            color="#EF4444"
            scale={0.7}
          />
        )}
      </group>

      {/* --- RIGHT MODULE: Monolithic Centrifugal Volute & Receiver Vessel --- */}
      <group
        position={[voluteModuleX + voluteDestructX, baseDropY, 0]}
        rotation={[0, 0, voluteDestructRot]}
      >
        {/* Heavy Flanged Volute Mounting Base (Monolithic) */}
        <mesh position={[0.3, 0.2, 0]}>
          <boxGeometry args={[0.58, 0.12, 0.72]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
        </mesh>

        <group position={[0.3, 0.76, 0]}>
          {/* Monolithic Annular Volute Body (Zero bolts) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.46, 0.46, 0.2, 32, 1, true]} />
            <meshStandardMaterial color="#334155" roughness={0.22} metalness={0.9} side={2} />
          </mesh>
          {/* Heavy Machined Backing Plate */}
          <mesh position={[0, 0, -0.1]}>
            <circleGeometry args={[0.46, 32]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.92} />
          </mesh>

          {/* 8-Blade Centrifugal Impeller */}
          <group position={[0, 0, 0]} rotation={[0, 0, rotorAngle]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.11, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.92} />
            </mesh>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const bAngle = (i * Math.PI) / 4;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(bAngle) * 0.19, Math.sin(bAngle) * 0.19, 0]}
                  rotation={[0, 0, bAngle + Math.PI / 3]}
                >
                  <boxGeometry args={[0.022, 0.17, 0.07]} />
                  <meshStandardMaterial
                    color="#00E5FF"
                    emissive="#00B4D8"
                    emissiveIntensity={isStarted ? 2.2 : 0.3}
                    roughness={0.15}
                    metalness={0.88}
                  />
                </mesh>
              );
            })}
          </group>

          {/* Transparent Quartz Front Window & Monolithic Machined Clamp Ring */}
          {!isDestroyed && (
            <>
              <mesh position={[0, 0, 0.1]}>
                <circleGeometry args={[0.4, 32]} />
                <meshStandardMaterial
                  color="#BAE6FD"
                  roughness={0.04}
                  metalness={0.12}
                  transparent
                  opacity={0.32}
                />
              </mesh>
              {/* Monolithic Machined Titanium Clamp Ring (No small screws) */}
              <mesh position={[0, 0, 0.102]}>
                <ringGeometry args={[0.4, 0.48, 32]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.96} />
              </mesh>
            </>
          )}
        </group>

        {/* High-Pressure Liquid Flow Stream */}
        {showWaterJet && (
          <mesh position={[0.76, 1.18, 0]}>
            <cylinderGeometry args={[0.034, 0.038, 1.08, 16]} />
            <meshStandardMaterial
              color="#06B6D4"
              roughness={0.06}
              metalness={0.15}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}

        {/* Monolithic High-Pressure Steel Receiver Vessel */}
        <mesh position={[0.76, 0.44, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.58, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.22} metalness={0.9} />
        </mesh>
      </group>

      {/* --- TOP MODULE: Monolithic Discharge Pipe & Pressure Gauge --- */}
      <group position={[0, topPipeY + pipeDestructY + baseDropY, 0]}>
        <group position={[0.3, 1.42, 0]}>
          <mesh>
            <cylinderGeometry args={[0.068, 0.068, 0.68, 24]} />
            <meshStandardMaterial color="#64748B" roughness={0.18} metalness={0.92} />
          </mesh>
          {/* Heavy Monolithic Docking Flanges */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.065, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.065, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
          </mesh>
        </group>

        {/* Precision Pressure Gauge (Monolithic Beveled Housing, Facing Camera) */}
        <group position={[0.3, 1.42, 0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.065, 24]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.012, 24]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.045, 0.042]} rotation={[0, 0, blowoutNeedleAngle]}>
            <boxGeometry args={[0.015, 0.11, 0.006]} />
            <meshStandardMaterial color="#EF4444" roughness={0.2} />
          </mesh>
        </group>

        {/* Horizontal Exit Pipe */}
        <mesh position={[0.56, 1.74, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.052, 0.052, 0.44, 20]} />
          <meshStandardMaterial color="#64748B" roughness={0.18} metalness={0.92} />
        </mesh>
      </group>

      {/* --- OVERLOAD STEAM BLOWOUT CONE (frames 495 - 503) --- */}
      {steamActive && (
        <group position={[0.3 + voluteDestructX * 0.5, 1.45, 0]}>
          <mesh position={[0, steamConeScale * 0.45, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.42 * steamConeScale, 0.95 * steamConeScale, 16, 1, true]} />
            <meshStandardMaterial
              color="#E0F2FE"
              emissive="#38BDF8"
              emissiveIntensity={1.5}
              transparent
              opacity={steamOpacity}
              roughness={0.85}
            />
          </mesh>
        </group>
      )}

      {/* --- CASING RUPTURE SPARK BURST (frame 495 - 500) --- */}
      {ruptureSparkActive && (
        <SparkBurst
          active={true}
          frameOffset={frame - 495}
          position={[0.2, 0.9, 0]}
          color="#38BDF8"
          scale={1.4}
        />
      )}

      {/* --- DOCKING CONTACT SPARK BURSTS (frame 316, 4 frames) --- */}
      {snapSparkActive && (
        <>
          {/* Seam Spark at Central Drive Shaft Collar */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.76, 0]}
            color="#00E5FF"
            scale={1.3}
          />
          {/* Seam Sparks at Baseplate Docking Locks */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.2, 0.25]}
            color="#FBBF24"
            scale={1.1}
          />
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.2, -0.25]}
            color="#FBBF24"
            scale={1.1}
          />
        </>
      )}
    </group>
  );
};
