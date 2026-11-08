import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularPistonGenerator: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 125 to 309 (cleared before Tier 3 starts at 310)
  if (frame < 125 || frame >= 310) return null;

  // --- 1. MAGNETIC SNAP-LOCK KINEMATICS (frames 125 - 134) ---
  // Heavy cast bed lands (frames 125 - 128, 3 frames)
  const bedDropY = interpolate(frame, [125, 128], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Engine module (left) and Alternator module (right) shoot in from x=-3.8 and x=+3.8
  // docking and snapping tight at frame 133 (5 frames, bezier curve)
  const moduleFlyProgress = interpolate(frame, [128, 133], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  const leftModuleX = (1 - moduleFlyProgress) * -3.8;
  const rightModuleX = (1 - moduleFlyProgress) * 3.8;

  // Flywheel + top rocker assembly drops in from above and clamps at frame 133
  const topModuleY = interpolate(frame, [129, 133], [3.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst (frames 133 - 136, 4 frames)
  const snapSparkActive = frame >= 133 && frame <= 136;
  const snapSparkFrameOffset = frame - 133;

  // --- 2. ON-MACHINE PHYSICAL TRIGGER: Brass Throw-Lever on Machine Bed ---
  // Lever snaps down from angle 0.72 to -0.48 rad at frame 180 (frames 179 - 181)
  const isStarted = frame >= 180;
  const leverAngle = interpolate(frame, [179, 181], [0.72, -0.48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });
  const leverClickSpark = frame >= 180 && frame <= 183;
  const leverClickOffset = frame - 180;

  // --- 3. OPERATIONAL KINEMATICS (frames 180 - 299) ---
  const activeFrame = isStarted ? frame - 180 : 0;
  const flywheelSpeed = isStarted ? 0.36 : 0;
  const flywheelAngle = isStarted ? activeFrame * flywheelSpeed : 0;

  // Slider-crank kinematics
  const crankR = 0.22;
  const crankX = Math.cos(flywheelAngle) * crankR;
  const crankY = Math.sin(flywheelAngle) * crankR;
  const pistonStrokeX = crankX * 0.85;

  // Floodlight state
  const isLampOn = frame >= 180 && frame < 302;
  const lampIntensity = isLampOn ? 18.0 : 0;

  // --- 4. OVERLOAD PHYSICAL DESTRUCTION (frames 300 - 309) ---
  const isDestroyed = frame >= 300;
  const destroyProgress = interpolate(frame, [300, 309], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Flywheel shears off the spindle, tilts, drops, and rolls across the bed
  const flywheelShearX = isDestroyed ? -destroyProgress * 0.75 : 0;
  const flywheelShearY = isDestroyed ? -destroyProgress * 0.28 : 0;
  const flywheelRollAngle = isDestroyed ? flywheelAngle + destroyProgress * 4.2 : flywheelAngle;
  const flywheelTiltZ = isDestroyed ? destroyProgress * 0.52 : 0;

  // Cylinder block fractures and tilts
  const cylFractureX = isDestroyed ? -destroyProgress * 0.28 : 0;
  const cylFractureRotZ = isDestroyed ? destroyProgress * 0.35 : 0;

  // Snapped lever flies off bed
  const leverSnapY = isDestroyed
    ? destroyProgress * 1.5 - destroyProgress * destroyProgress * 2.2
    : 0;
  const leverSnapRot = isDestroyed ? destroyProgress * 5.0 : 0;

  // Exhaust fire & smoke blowout puff (frames 300 - 308)
  const exhaustBlowoutActive = frame >= 300 && frame <= 308;
  const exhaustProgress = (frame - 300) / 8;
  const exhaustScale = 0.3 + exhaustProgress * 2.2;
  const exhaustOpacity = Math.max(0, 0.95 - exhaustProgress * 1.0);

  // Steam/gas blowout cone from cracked cylinder (frames 300 - 309)
  const steamConeActive = frame >= 300 && frame <= 309;
  const steamConeProgress = (frame - 300) / 9;
  const steamConeScale = 0.4 + steamConeProgress * 2.4;
  const steamConeOpacity = Math.max(0, 0.85 - steamConeProgress * 0.9);

  // Shearing spindle spark burst
  const shearSparkActive = frame >= 300 && frame <= 304;
  const shearSparkOffset = frame - 300;

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.22, 1.22, 1.22]}>
      {/* Docking Seam Contact Spark Bursts (Frame 133) */}
      <SparkBurst
        active={snapSparkActive}
        frameOffset={snapSparkFrameOffset}
        position={[-0.22, 0.45, 0]}
        color="#F59E0B"
        scale={1.2}
      />
      <SparkBurst
        active={snapSparkActive}
        frameOffset={snapSparkFrameOffset}
        position={[0.22, 0.45, 0]}
        color="#F59E0B"
        scale={1.2}
      />

      {/* Lever Click Contact Spark (Frame 180) */}
      <SparkBurst
        active={leverClickSpark}
        frameOffset={leverClickOffset}
        position={[-0.45, 0.22, 0.32]}
        color="#FDE047"
        scale={0.7}
      />

      {/* Overload Flywheel Shearing Spark Burst (Frame 300) */}
      <SparkBurst
        active={shearSparkActive}
        frameOffset={shearSparkOffset}
        position={[0, 0.52, 0.15]}
        color="#EF4444"
        scale={1.5}
      />

      {/* --- CENTRAL FOUNDATION BED & GUIDE RAILS (Zero bolts) --- */}
      <group position={[0, bedDropY, 0]}>
        {/* Heavy Monolithic Cast-Iron Bed */}
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[1.72, 0.18, 0.92]} />
          <meshStandardMaterial color="#1E293B" roughness={0.32} metalness={0.88} />
        </mesh>
        {/* Machined Titanium Center Alignment Guide Rails */}
        {[-0.22, 0.22].map((zPos, idx) => (
          <mesh key={idx} position={[0, 0.19, zPos]}>
            <boxGeometry args={[1.68, 0.035, 0.06]} />
            <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.92} />
          </mesh>
        ))}
        {/* Flanged Docking Clamping Lugs */}
        {[-0.78, 0.78].map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 0.16, 0]}>
            <boxGeometry args={[0.08, 0.14, 0.75]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* --- LEFT MODULE: Reciprocating Piston Engine Cylinder & Exhaust --- */}
      <group position={[leftModuleX + cylFractureX, bedDropY, 0]} rotation={[0, 0, cylFractureRotZ]}>
        {/* Monolithic Engine Cylinder Block */}
        <mesh position={[-0.52, 0.52, 0]}>
          <boxGeometry args={[0.54, 0.56, 0.58]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Horizontal Cylinder Bore Housing */}
        <mesh position={[-0.38, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.44, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Cylinder Cooling Fins */}
        {[-0.64, -0.56, -0.48, -0.4].map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 0.52, 0]}>
            <boxGeometry args={[0.025, 0.62, 0.64]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}

        {/* Reciprocating Piston & Connecting Rod */}
        {!isDestroyed && (
          <group position={[-0.32 + pistonStrokeX, 0.52, 0]}>
            {/* Piston Head */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.24, 20]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* Connecting Rod */}
            <mesh position={[0.22, 0, 0]}>
              <boxGeometry args={[0.34, 0.05, 0.05]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.92} />
            </mesh>
          </group>
        )}

        {/* Heavy Upward Exhaust Manifold & Pipe */}
        <mesh position={[-0.62, 0.92, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.38, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.85} />
        </mesh>
        {/* Exhaust Flared Muffler Tip */}
        <mesh position={[-0.62, 1.15, 0]}>
          <cylinderGeometry args={[0.09, 0.055, 0.14, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Overload Exhaust Fire/Smoke Blowout (Frame 300 - 308) */}
        {exhaustBlowoutActive && (
          <group position={[-0.62, 1.25, 0]}>
            {/* Inner Fire Flame Cone */}
            <mesh position={[0, exhaustScale * 0.25, 0]}>
              <coneGeometry args={[0.16 * exhaustScale, 0.5 * exhaustScale, 16]} />
              <meshBasicMaterial color="#F97316" transparent opacity={exhaustOpacity} />
            </mesh>
            {/* Outer Smoke Halo */}
            <mesh position={[0, exhaustScale * 0.45, 0]}>
              <sphereGeometry args={[0.22 * exhaustScale, 12, 12]} />
              <meshBasicMaterial color="#374151" transparent opacity={exhaustOpacity * 0.8} />
            </mesh>
          </group>
        )}

        {/* Overload Cylinder Steam Blowout Cone (Frame 300 - 309) */}
        {steamConeActive && (
          <group position={[-0.38, 0.65, 0]} rotation={[0, 0, -0.4]}>
            <mesh position={[0, steamConeScale * 0.4, 0]}>
              <coneGeometry args={[0.25 * steamConeScale, 0.8 * steamConeScale, 16]} />
              <meshStandardMaterial
                color="#E2E8F0"
                transparent
                opacity={steamConeOpacity}
                roughness={0.8}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* --- RIGHT MODULE: Alternator Stator Housing & Coils --- */}
      <group position={[rightModuleX, bedDropY, 0]}>
        {/* Monolithic Alternator Stator Barrel */}
        <mesh position={[0.48, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.52, 28]} />
          <meshStandardMaterial color="#1E293B" roughness={0.28} metalness={0.9} />
        </mesh>
        {/* Alternator Outer Cooling Ribs */}
        {[-0.18, -0.06, 0.06, 0.18].map((dx, idx) => (
          <mesh key={idx} position={[0.48 + dx, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.325, 0.02, 12, 28]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.92} />
          </mesh>
        ))}
        {/* Heavy Alternator Copper Windings (Visible through open stator vents) */}
        <mesh position={[0.48, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.46, 20]} />
          <meshStandardMaterial
            color="#D97706"
            roughness={0.25}
            metalness={0.95}
            emissive="#B45309"
            emissiveIntensity={isStarted && !isDestroyed ? 0.8 : 0.1}
          />
        </mesh>
        {/* Alternator Rear Flanged Bearing Cap */}
        <mesh position={[0.76, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.18, 0.08, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.92} />
        </mesh>
      </group>

      {/* --- CENTER SECTION: Heavy Flywheel (Shears off at frame 300) --- */}
      <group
        position={[
          isDestroyed ? flywheelShearX : 0,
          bedDropY + topModuleY + (isDestroyed ? flywheelShearY : 0),
          0.12,
        ]}
        rotation={[
          0,
          0,
          isDestroyed ? flywheelRollAngle : flywheelAngle,
        ]}
      >
        <group rotation={[0, 0, isDestroyed ? flywheelTiltZ : 0]}>
          {/* Main Spindle Shaft */}
          {!isDestroyed && (
            <mesh position={[0, 0.52, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.55, 20]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.95} />
            </mesh>
          )}
          {/* Heavy Cast Flywheel Hub */}
          <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.14, 28]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.88} />
          </mesh>
          {/* Massive Flywheel Rim Ring */}
          <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.08, 16, 36]} />
            <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Heavy Monolithic Counterweight Spokes */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <mesh
              key={idx}
              position={[
                Math.cos(angle) * 0.22,
                0.52 + Math.sin(angle) * 0.22,
                0,
              ]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.26, 0.065, 0.08]} />
              <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.88} />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- ON-MACHINE TRIGGER: Brass Throw-Lever on Bed --- */}
      <group
        position={[
          -0.45,
          bedDropY + 0.22 + (isDestroyed ? leverSnapY : 0),
          0.32,
        ]}
        rotation={[
          0,
          0,
          isDestroyed ? leverAngle + leverSnapRot : leverAngle,
        ]}
      >
        {/* Machined Pivot Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Polished Brass Lever Arm */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.016, 0.02, 0.3, 16]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.18} metalness={0.95} />
        </mesh>
        {/* Brass Weighted Knob */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.042, 16, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.96} />
        </mesh>
      </group>

      {/* --- WARM INDUSTRIAL FLOODLIGHT (Turns on at frame 180) --- */}
      <group position={[0.56, bedDropY + 0.88, 0.28]}>
        {/* Floodlight Support Stanchion Arm */}
        <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.025, 0.03, 0.52, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Floodlight Bell Housing */}
        <mesh position={[0, 0, 0]} rotation={[0.3, -0.4, 0]}>
          <cylinderGeometry args={[0.14, 0.08, 0.18, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.88} />
        </mesh>
        {/* Floodlight Glass Lens */}
        <mesh position={[-0.04, -0.03, 0.08]} rotation={[0.3, -0.4, 0]}>
          <circleGeometry args={[0.13, 20]} />
          <meshStandardMaterial
            color="#FEF08A"
            emissive="#F59E0B"
            emissiveIntensity={isLampOn ? 4.2 : 0}
            roughness={0.1}
          />
        </mesh>
        {/* Cast Light Beam */}
        {lampIntensity > 0 && (
          <pointLight
            position={[-0.1, 0, 0.15]}
            intensity={lampIntensity}
            color="#F59E0B"
            distance={5.0}
            decay={1.8}
          />
        )}
      </group>
    </group>
  );
};
