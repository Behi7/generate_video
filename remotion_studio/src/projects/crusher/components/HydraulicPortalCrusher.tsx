import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export const HydraulicPortalCrusher: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 3) return null;

  // --- ACT 1: STAGGERED LEGO SNAP ASSEMBLY (0..69f) ---
  // Step 2 (+20f): Massive Hydraulic Ram drops into upper bridge
  const cylDropY = interpolate(local, [15, 20], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cylLanded = local >= 20;
  const cylSnap = local >= 20 && local <= 24;

  // Step 3 (+40f): Manifold, hoses & pressure dial dock
  const manifoldDropX = interpolate(local, [35, 40], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const manifoldLanded = local >= 40;
  const manifoldSnap = local >= 40 && local <= 44;

  // Step 4 (+60f): Heavy Carbide Crushing Platen docks to rod tip
  const platenDropY = interpolate(local, [55, 60], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const platenLanded = local >= 60;
  const platenSnap = local >= 60 && local <= 64;

  // --- ACT 2 & 3: HYDRAULIC PRESSURE & FEED KINEMATICS (70..249f) ---
  let pressureBar = 0;
  let strokeDisplacementY = 0;

  if (local >= 75 && local < 110) {
    // Act 2: Button pressed, pressure builds rapidly 0 -> 280 bar
    pressureBar = interpolate(local, [75, 110], [0, 280], {
      easing: Easing.out(Easing.quad),
    });
  } else if (local >= 110 && local < 150) {
    // Gauge vibrating in green zone, rod pre-descends to specimen
    const jitter = Math.sin(local * 2.5) * 6;
    pressureBar = 280 + jitter;
    strokeDisplacementY = interpolate(local, [120, 150], [0, -0.22], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 150 && local < 255) {
    // Act 3: 100-Ton slow crushing stroke (350 Bar peak)
    const jitter = Math.sin(local * 4.0) * 12;
    pressureBar = 350 + jitter;
    strokeDisplacementY = interpolate(local, [150, 250], [-0.22, -0.48], {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 255) {
    // Overload surge
    pressureBar = 520; // in red zone
    strokeDisplacementY = -0.48;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Rupture displacements
  const hoseWhipAngle = isBroken ? breakP * 1.2 : 0;
  const cylTiltZ = isBroken ? breakP * 0.12 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. MASSIVE PORTAL H-FRAME (Industrial Deep Blue) */}
      <group position={[0, 0, 0]}>
        {/* Left Vertical Portal Column */}
        <RoundedBox args={[0.26, 2.3, 0.44]} radius={0.035} smoothness={4} position={[-0.62, 1.25, 0]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
        </RoundedBox>

        {/* Right Vertical Portal Column */}
        <RoundedBox args={[0.26, 2.3, 0.44]} radius={0.035} smoothness={4} position={[0.62, 1.25, 0]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
        </RoundedBox>

        {/* Heavy Upper Crossbeam (Holds hydraulic cylinder) */}
        <RoundedBox args={[1.5, 0.42, 0.52]} radius={0.04} smoothness={4} position={[0, 2.2, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
        </RoundedBox>

        {/* Massive Steel Tie-Rods with Chrome Hex Nuts */}
        {[-0.68, 0.68].map((xOff, idx) => (
          <group key={idx} position={[xOff, 2.44, 0]}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.96} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. 300MM MIRROR-CHROME HYDRAULIC RAM CYLINDER */}
      {cylLanded && (
        <group
          position={[0, 1.85 + cylDropY, 0]}
          rotation={[0, 0, cylTiltZ]}
        >
          {/* Main Hydraulic Barrel Housing */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.82, 32]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.7} />
          </mesh>

          {/* Top Cylinder End Cap with Brass Ring */}
          <mesh position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* Mirror-Polished Chrome Piston Rod (Slides down under hydraulic stroke) */}
          <mesh
            position={[0, -0.42 + strokeDisplacementY, 0]}
          >
            <cylinderGeometry args={[0.13, 0.13, 0.95, 32]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.04} metalness={0.99} />
          </mesh>
        </group>
      )}

      {/* 3. MANIFOLD BLOCK, PRESSURE GAUGE & HIGH-PRESSURE HOSES */}
      {manifoldLanded && (
        <group position={[0.42 + manifoldDropX, 1.9, 0.2]}>
          {/* Polished Brass Valve Block */}
          <RoundedBox args={[0.22, 0.26, 0.2]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </RoundedBox>

          {/* Analog Pressure Gauge Face */}
          <group position={[0, 0.18, 0.05]} rotation={[0, 0, 0]}>
            {/* Chrome Bezel */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* White Dial Face */}
            <mesh position={[0, 0, 0.022]}>
              <circleGeometry args={[0.1, 24]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
            </mesh>
            {/* Vibrating Red Pointer Needle */}
            <mesh
              position={[0, 0, 0.025]}
              rotation={[0, 0, -(pressureBar / 600) * Math.PI * 1.5 + Math.PI * 0.75]}
            >
              <boxGeometry args={[0.012, 0.08, 0.005]} />
              <meshStandardMaterial color="#EF4444" roughness={0.3} />
            </mesh>
          </group>

          {/* Braided Armored High-Pressure Hose */}
          <group
            position={[0, -0.15, 0]}
            rotation={[0, 0, hoseWhipAngle]}
          >
            <mesh position={[-0.15, -0.2, 0]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.035, 0.035, 0.5, 16]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* 4. HARDENED TUNGSTEN-CARBIDE CRUSHING PLATEN & COOLANT JETS */}
      {platenLanded && (
        <group
          position={[
            0,
            1.0 + platenDropY + strokeDisplacementY,
            0,
          ]}
        >
          {/* Massive Hardened Crushing Platen */}
          <RoundedBox args={[0.58, 0.18, 0.58]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.92} />
          </RoundedBox>

          {/* Hardened Tungsten Insert Bottom Grid */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.5, 0.03, 0.5]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Dual Brass Coolant Nozzles on Front */}
          {[-0.2, 0.2].map((xOff, idx) => (
            <group key={idx} position={[xOff, -0.04, 0.31]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Assembly Docking Snaps */}
      <SparkBurst active={cylSnap} frameOffset={local - 20} position={[0, 2.2, 0]} scale={0.8} />
      <SparkBurst active={manifoldSnap} frameOffset={local - 40} position={[0.42, 1.9, 0.2]} color="#D97706" scale={0.7} />
      <SparkBurst active={platenSnap} frameOffset={local - 60} position={[0, 1.0, 0]} color="#38BDF8" scale={0.9} />

      {/* Hose Rupture Hydraulic Explosion */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0.42, 1.6, 0.2]}
        color="#38BDF8"
        scale={1.5}
        count={16}
      />
    </group>
  );
};