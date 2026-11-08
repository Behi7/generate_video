import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export const GasMotorDrill: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 2) return null;

  // --- ACT 1: MAGNETIC SNAP-LOCK KINEMATICS (frames 0..70 / global 290..360) ---
  // 1. Tubular sled frame bed lands at frame 0..4 (global 290f)
  const sledDropY = interpolate(local, [0, 4], [3.5, 0], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sledImpact = local <= 4;

  // 2. 2-stroke engine snaps from left (x = -3.5 to 0) at local 20f (global 310f)
  const engineFlyX = interpolate(local, [15, 20], [-3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const engineHasLanded = local >= 20;
  const engineSnapActive = local >= 20 && local <= 24;
  const engineSnapOffset = local - 20;

  // 3. Chain gearbox snaps from right (x = +3.5 to 0) at local 40f (global 330f)
  const gearboxFlyX = interpolate(local, [35, 40], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gearboxHasLanded = local >= 40;
  const gearboxSnapActive = local >= 40 && local <= 44;
  const gearboxSnapOffset = local - 40;

  // 4. Carbide drill bit docks below (y = -1.8 to 0) at local 60f (global 350f)
  const bitFlyY = interpolate(local, [55, 60], [-1.8, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bitHasLanded = local >= 60;
  const bitSnapActive = local >= 60 && local <= 64;
  const bitSnapOffset = local - 60;

  // --- ACT 2: STARTUP CHAIN REACTION (frames 71..150 / global 361..440) ---
  // Clutch lever on handle snaps at local 80f (global 370f)
  const leverAngle = interpolate(local, [78, 80], [0.65, -0.38], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leverSnapActive = local >= 80 && local <= 84;
  const leverSnapOffset = local - 80;

  // Engine starts at local 100f (global 390f)
  const engineRunning = local >= 100 && local < 275;
  const isJammed = local >= 255;
  const isSheared = local >= 265;

  // Reciprocating Piston Stroke inside cylinder
  let pistonStrokeY = 0;
  if (local >= 100 && local < 120) {
    pistonStrokeY = Math.sin((local - 100) * 0.8) * 0.025;
  } else if (local >= 120 && !isSheared) {
    pistonStrokeY = Math.sin((local - 120) * 1.8) * 0.035;
  } else if (isSheared && local < 280) {
    // Engine over-revs wildly after shear pin breaks!
    pistonStrokeY = Math.sin((local - 265) * 3.2) * 0.038;
  }

  // Exhaust Smoke Puff at startup (local 100..125)
  const smokeActive = local >= 100 && local <= 125;
  const smokeProgress = (local - 100) / 25;
  const smokeScale = 0.2 + smokeProgress * 0.7;
  const smokeOpacity = Math.max(0, 0.8 - smokeProgress * 0.8);

  // Chain Drive and Spindle Rotation
  let sprocketAngle = 0;
  let bitRotation = 0;
  if (local >= 120 && local < 150) {
    const ramp = interpolate(local, [120, 150], [0, 1], {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    sprocketAngle = ramp * (local - 120) * 0.6;
    bitRotation = sprocketAngle * 0.35;
  } else if (local >= 150 && local < 255) {
    // Act 3: Full operating RPM
    const baseRot = 18 * 0.6;
    sprocketAngle = baseRot + (local - 150) * 1.2;
    bitRotation = sprocketAngle * 0.35;
  } else if (isJammed && !isSheared) {
    // Jammed at 255f: bit seized, engine straining
    sprocketAngle = 255 * 0.6;
    bitRotation = sprocketAngle * 0.35;
  }

  // --- ACT 3: AGGRESSIVE ROCK DRILLING (frames 151..250 / global 441..540) ---
  const isDrilling = local >= 151 && local < 255;
  const feedDepth = interpolate(local, [151, 250], [0, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const feedY = -feedDepth;

  // Mechanical High-Frequency Vibration
  const vibeX = isDrilling ? Math.sin(local * 2.8) * 0.012 : 0;
  const vibeY = isDrilling ? Math.cos(local * 3.4) * 0.01 : 0;

  // --- ACT 4: OVERLOAD CATASTROPHE (frames 251..289 / global 541..579) ---
  // Shear pin snaps at local 265f (global 555f)
  const shearSparkActive = local >= 265 && local <= 269;
  const shearSparkOffset = local - 265;

  const breakProgress = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chain whips off sprockets and collapses onto frame bed
  const chainWhipX = isSheared ? breakProgress * 0.28 : 0;
  const chainWhipY = isSheared ? -breakProgress * 0.45 : 0;
  const chainWhipRotZ = isSheared ? breakProgress * 1.8 : 0;

  // Engine exhaust flame puff on over-rev blow out (local 265..285)
  const flameActive = local >= 265 && local <= 285;
  const flameProgress = (local - 265) / 20;
  const flameScale = 0.3 + flameProgress * 1.5;
  const flameOpacity = Math.max(0, 1.0 - flameProgress * 1.0);

  return (
    <group position={[vibeX, sledDropY + vibeY, 0]}>
      {/* Docking Spark Bursts */}
      <SparkBurst
        active={engineSnapActive}
        frameOffset={engineSnapOffset}
        position={[-0.22, 1.15, 0]}
        color="#FBBF24"
        scale={1.2}
        count={14}
      />
      <SparkBurst
        active={gearboxSnapActive}
        frameOffset={gearboxSnapOffset}
        position={[0.22, 1.15, 0]}
        color="#F59E0B"
        scale={1.2}
        count={14}
      />
      <SparkBurst
        active={bitSnapActive}
        frameOffset={bitSnapOffset}
        position={[0, 0.765, 0]}
        color="#FDE047"
        scale={1.3}
        count={16}
      />
      <SparkBurst
        active={leverSnapActive}
        frameOffset={leverSnapOffset}
        position={[-0.45, 1.38, 0.15]}
        color="#F59E0B"
        scale={0.9}
        count={10}
      />

      {/* Shear Pin Fracture Spark Burst at Gearbox Spindle (Frame 555) */}
      <SparkBurst
        active={shearSparkActive}
        frameOffset={shearSparkOffset}
        position={[0.18, 1.18 + feedY, 0]}
        color="#EF4444"
        scale={1.6}
        count={18}
        spread={1.3}
      />

      {/* ============================================================= */}
      {/* 1. TUBULAR SLED FRAME BED & ERGONOMIC HANDLES (Zero bolts)    */}
      {/* ============================================================= */}
      <group position={[0, 0, 0]}>
        {/* Left Ground Skid Runner Tube */}
        <mesh position={[-0.48, 0.42, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.045, 0.045, 0.9]} />
          <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Right Ground Skid Runner Tube */}
        <mesh position={[0.48, 0.42, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.045, 0.045, 0.9]} />
          <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Left Vertical Arch Tube to Handle */}
        <mesh position={[-0.48, 0.9, 0]}>
          <boxGeometry args={[0.045, 0.95, 0.045]} />
          <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Right Vertical Arch Tube to Handle */}
        <mesh position={[0.48, 0.9, 0]}>
          <boxGeometry args={[0.045, 0.95, 0.045]} />
          <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Top Crossbar / Upper Handle Bar */}
        <mesh position={[0, 1.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 1.05, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.85} />
        </mesh>

        {/* Heavy Cast Engine Mounting Deck Plate */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.82, 0.045, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.85} />
        </mesh>

        {/* ON-MACHINE PHYSICAL TRIGGER: Heavy Brass Throw-Lever / Clutch on Handle */}
        <group position={[-0.45, 1.38, 0.12]}>
          {/* Brass Pivot Block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Throw Lever Arm (Snaps down at frame 370) */}
          <mesh
            position={[0, Math.sin(leverAngle) * 0.07, Math.cos(leverAngle) * 0.07]}
            rotation={[leverAngle, 0, 0]}
          >
            <cylinderGeometry args={[0.012, 0.014, 0.16, 12]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.92} />
          </mesh>
        </group>
      </group>

      {/* ============================================================= */}
      {/* 2. 2-STROKE ENGINE BLOCK (Snaps from left at local 20f)       */}
      {/* ============================================================= */}
      {engineHasLanded && (
        <group position={[engineFlyX - 0.22, 1.12, 0]}>
          {/* Crankcase Bottom Housing */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.26, 0.22, 0.28]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.88} />
          </mesh>

          {/* Cylinder Block with 6 Horizontal Cooling Fins */}
          <group position={[0, 0.2, 0]}>
            {[0, 1, 2, 3, 4, 5].map((fIdx) => (
              <mesh key={fIdx} position={[0, fIdx * 0.04, 0]}>
                <boxGeometry args={[0.24, 0.014, 0.24]} />
                <meshStandardMaterial
                  color="#1E293B"
                  roughness={0.35}
                  metalness={0.9}
                />
              </mesh>
            ))}

            {/* Reciprocating Piston Head */}
            <mesh position={[0, 0.12 + pistonStrokeY, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
            </mesh>

            {/* Cylinder Head Cap */}
            <mesh position={[0, 0.26, 0]}>
              <boxGeometry args={[0.2, 0.04, 0.2]} />
              <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.85} />
            </mesh>

            {/* Spark Plug with Boot */}
            <mesh position={[0, 0.31, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.06, 12]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
            </mesh>
          </group>

          {/* Recoil Pull Starter Circular Hub (Left side) */}
          <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.85} />
          </mesh>

          {/* Semi-Translucent Fuel Tank (Top rear) */}
          <mesh position={[0.02, 0.18, -0.18]}>
            <boxGeometry args={[0.22, 0.14, 0.16]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.4}
              transparent={true}
              opacity={0.7}
            />
          </mesh>

          {/* Cast Exhaust Muffler Chamber & Exhaust Snout */}
          <group position={[0, 0.08, 0.18]}>
            <mesh>
              <cylinderGeometry args={[0.055, 0.055, 0.18, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.8} />
            </mesh>
            {/* Muffler Snout */}
            <mesh position={[0, 0.05, 0.06]} rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
            </mesh>

            {/* Act 2 Startup Smoke Puff */}
            {smokeActive && (
              <mesh
                position={[0, 0.15 * smokeProgress, 0.2 * smokeProgress]}
                scale={[smokeScale, smokeScale, smokeScale]}
              >
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial
                  color="#94A3B8"
                  transparent={true}
                  opacity={smokeOpacity}
                  roughness={0.9}
                />
              </mesh>
            )}

            {/* Act 4 Engine Flame Puff Blowout on Shear Jam */}
            {flameActive && (
              <mesh
                position={[0, 0.05, 0.12 + flameProgress * 0.22]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[flameScale, flameScale * 1.5, flameScale]}
              >
                <coneGeometry args={[0.09, 0.35, 16]} />
                <meshStandardMaterial
                  color="#F97316"
                  emissive="#EF4444"
                  emissiveIntensity={8.0}
                  transparent={true}
                  opacity={flameOpacity}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        </group>
      )}

      {/* ============================================================= */}
      {/* 3. CHAIN GEARBOX & SPROCKETS (Snaps from right at local 40f) */}
      {/* ============================================================= */}
      {gearboxHasLanded && (
        <group position={[gearboxFlyX + 0.18, 1.12, 0]}>
          {/* Gearbox Housing Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.28, 0.18, 0.24]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.88} />
          </mesh>

          {/* Drive Sprocket (Small, polished steel) */}
          <mesh
            position={[-0.08, 0.02, 0.14]}
            rotation={[0, 0, isSheared ? 0 : sprocketAngle]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.98} />
          </mesh>

          {/* Driven Sprocket (Large, polished steel) */}
          <mesh
            position={[0.08, 0.02, 0.14]}
            rotation={[0, 0, isSheared ? 0 : sprocketAngle * 0.35]}
          >
            <cylinderGeometry args={[0.085, 0.085, 0.02, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.98} />
          </mesh>

          {/* Roller Chain Loop / Whip Collapse on Frame Bed */}
          <group
            position={[chainWhipX, chainWhipY, 0.14]}
            rotation={[0, 0, chainWhipRotZ]}
          >
            {/* Top Chain Strand */}
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[0.18, 0.016, 0.02]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.95} />
            </mesh>
            {/* Bottom Chain Strand */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.18, 0.016, 0.02]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        </group>
      )}

      {/* ============================================================= */}
      {/* 4. CARBIDE DRILL STEM & BIT (Docks below at local 60f)        */}
      {/* ============================================================= */}
      {bitHasLanded && (
        <group position={[0, bitFlyY + feedY, 0]} rotation={[0, bitRotation, 0]}>
          {/* Heavy Machined Hex Chuck Collar */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.16, 6]} />
            <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.95} />
          </mesh>

          {/* Heavy Solid Drill Stem - Polished Bright Chrome Steel */}
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.22, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.98} />
          </mesh>

          {/* Cutting Head with Brazed Tungsten Carbide Teeth (y=0.765 is rock surface) */}
          <group position={[0, 0.77, 0]}>
            <mesh>
              <cylinderGeometry args={[0.052, 0.056, 0.045, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
            </mesh>

            {/* 4 Brazed Carbide Chisel Inserts */}
            {[0, 1, 2, 3].map((tIdx) => {
              const tAngle = (tIdx * Math.PI) / 2;
              return (
                <mesh
                  key={tIdx}
                  position={[
                    Math.cos(tAngle) * 0.042,
                    -0.022,
                    Math.sin(tAngle) * 0.042,
                  ]}
                  rotation={[0, tAngle, 0.3]}
                >
                  <boxGeometry args={[0.024, 0.018, 0.028]} />
                  <meshStandardMaterial
                    color="#F59E0B"
                    roughness={0.15}
                    metalness={0.95}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
    </group>
  );
};
