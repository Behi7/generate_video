import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export const ManualScrewCrusher: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 1) return null;

  // --- ACT 1: STAGGERED LEGO SNAP ASSEMBLY (0..69f) ---
  // Step 1 (+0f): Base anvil bed already present
  // Step 2 (+20f): Twin vertical columns drop from above
  const colDropY = interpolate(local, [15, 20], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const colLanded = local >= 20;
  const colSnap = local >= 20 && local <= 24;

  // Step 3 (+40f): Upper crosshead & brass nut docks from top
  const headDropY = interpolate(local, [35, 40], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headLanded = local >= 40;
  const headSnap = local >= 40 && local <= 44;

  // Step 4 (+60f): ACME screw + T-handle drops into nut
  const screwDropY = interpolate(local, [55, 60], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const screwLanded = local >= 60;
  const screwSnap = local >= 60 && local <= 64;

  // --- ACT 2 & 3: ROTATION & CRUSHING KINEMATICS (70..249f) ---
  let rotationAngle = 0;
  let ramDisplacementY = 0;

  if (local >= 75 && local < 110) {
    // Act 2: Slow manual struggle and initial spin-up
    rotationAngle = interpolate(local, [75, 110], [0, Math.PI * 2.0], {
      easing: Easing.in(Easing.quad),
    });
  } else if (local >= 110 && local < 150) {
    // Accelerating spin to touch specimen
    const baseRot = Math.PI * 2.0;
    const addRot = interpolate(local, [110, 150], [0, Math.PI * 6.0], {
      easing: Easing.linear,
    });
    rotationAngle = baseRot + addRot;
    ramDisplacementY = interpolate(local, [130, 150], [0, -0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 150 && local < 255) {
    // Act 3: Rapid hypnotic spinning & crushing downward
    const baseRot = Math.PI * 8.0;
    const opRot = (local - 150) * 0.55;
    rotationAngle = baseRot + opRot;
    ramDisplacementY = interpolate(local, [150, 250], [-0.15, -0.32], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 255) {
    // Jammed state at frame 255
    const jammedRot = Math.PI * 8.0 + (255 - 150) * 0.55;
    const shudder = local < 265 ? Math.sin((local - 255) * 5.0) * 0.08 : 0;
    rotationAngle = jammedRot + shudder;
    ramDisplacementY = -0.32;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Destruction displacements
  const colCrackAngle = isBroken ? breakP * 0.18 : 0;
  const headFlyX = isBroken ? breakP * 0.28 : 0;
  const headFlyY = isBroken ? breakP * 0.12 : 0;
  const handleFlingAngle = isBroken ? breakP * 0.45 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TWIN VERTICAL CAST IRON GUIDE COLUMNS (Left & Right) */}
      {colLanded && (
        <group position={[0, colDropY, 0]}>
          {/* Left Column (Tilts on fracture) */}
          <group
            position={[-0.52, 1.05, 0]}
            rotation={[0, 0, colCrackAngle]}
          >
            <RoundedBox args={[0.16, 1.7, 0.18]} radius={0.02} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </RoundedBox>
            {/* Machined Inner Guide Track */}
            <mesh position={[0.08, 0, 0]}>
              <boxGeometry args={[0.015, 1.6, 0.08]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.92} />
            </mesh>
          </group>

          {/* Right Column */}
          <group position={[0.52, 1.05, 0]}>
            <RoundedBox args={[0.16, 1.7, 0.18]} radius={0.02} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </RoundedBox>
            <mesh position={[-0.08, 0, 0]}>
              <boxGeometry args={[0.015, 1.6, 0.08]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.92} />
            </mesh>
          </group>
        </group>
      )}

      {/* 2. UPPER CROSSHEAD ARCH & THREADED BRASS NUT */}
      {headLanded && (
        <group position={[headFlyX, 1.9 + headDropY + headFlyY, 0]}>
          {/* Heavy Cast Iron Bridge */}
          <RoundedBox args={[1.28, 0.24, 0.32]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
          </RoundedBox>

          {/* Center Polished Brass Guide Nut */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.28, 24]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* Brass Nut Mounting Hex Flange */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.18} metalness={0.92} />
          </mesh>
        </group>
      )}

      {/* 3. ROTATING ACME LEAD-SCREW, T-HANDLE & HARDENED PRESS RAM */}
      {screwLanded && (
        <group
          position={[
            0,
            1.9 + screwDropY + ramDisplacementY,
            0,
          ]}
          rotation={[0, 0, handleFlingAngle]}
        >
          {/* Central Chrome Lead-Screw Shaft */}
          <mesh
            position={[0, -0.5, 0]}
            rotation={[0, rotationAngle, 0]}
          >
            <cylinderGeometry args={[0.065, 0.065, 1.4, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Spiral Acme Thread simulation rings */}
          {[-0.8, -0.65, -0.5, -0.35, -0.2, -0.05, 0.1].map((yOffset, idx) => (
            <mesh
              key={idx}
              position={[0, yOffset, 0]}
              rotation={[0, rotationAngle + idx * 0.8, 0]}
            >
              <torusGeometry args={[0.07, 0.012, 12, 24]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
            </mesh>
          ))}

          {/* Bottom Hardened Crushing Platen (Attached to Screw Tip) */}
          <group position={[0, -1.2, 0]}>
            <RoundedBox args={[0.48, 0.12, 0.48]} radius={0.02} smoothness={4}>
              <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.92} />
            </RoundedBox>
            {/* Guide shoes in side columns */}
            <mesh position={[-0.48, 0, 0]}>
              <boxGeometry args={[0.08, 0.14, 0.12]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0.48, 0, 0]}>
              <boxGeometry args={[0.08, 0.14, 0.12]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>

          {/* Top T-Handle Hub & Dual Counterweighted Brass Arms */}
          <group position={[0, 0.28, 0]} rotation={[0, rotationAngle, 0]}>
            {/* Chrome Central Hub */}
            <mesh>
              <cylinderGeometry args={[0.11, 0.11, 0.18, 20]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>

            {/* Long Horizontal Crossbar */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 1.45, 20]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
            </mesh>

            {/* Left & Right Heavy Polished Brass Counterweight Spheres */}
            <mesh position={[-0.72, 0, 0]}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.12} metalness={0.96} />
            </mesh>
            <mesh position={[0.72, 0, 0]}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.12} metalness={0.96} />
            </mesh>
          </group>
        </group>
      )}

      {/* Assembly Docking Spark Bursts */}
      <SparkBurst active={colSnap} frameOffset={local - 20} position={[-0.52, 0.2, 0]} scale={0.7} />
      <SparkBurst active={headSnap} frameOffset={local - 40} position={[0, 1.9, 0]} color="#D97706" scale={0.8} />
      <SparkBurst active={screwSnap} frameOffset={local - 60} position={[0, 2.0, 0]} color="#38BDF8" scale={0.9} />

      {/* Fracture Explosion Spark Burst on Overload */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[-0.52, 1.8, 0]}
        color="#F59E0B"
        scale={1.4}
        count={16}
      />
    </group>
  );
};