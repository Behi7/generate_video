import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export const DestructibleHandPump: React.FC = () => {
  const frame = useCurrentFrame();

  // Active working phase: frames 0 - 114
  // Destruction phase: frames 115 - 124
  const isDestroyed = frame >= 115;
  const breakProgress = interpolate(frame, [115, 124], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Stroke cycle (1 stroke every 45 frames @ 30 FPS = 1.5s)
  const strokePhase = (frame % 45) / 45;
  const leverAngle =
    strokePhase < 0.35
      ? -0.3 + (strokePhase / 0.35) * 0.6
      : 0.3 - ((strokePhase - 0.35) / 0.65) * 0.6;

  const pistonY = 0.95 - Math.sin(leverAngle) * 0.22;
  const dropActive = !isDestroyed && strokePhase > 0.35 && strokePhase < 0.75;
  const dropY = 0.55 - ((strokePhase - 0.35) / 0.4) * 0.75;

  // Destruction Displacements (Visible cracking & falling onto platform)
  // Broken Lever flying up and tumbling in mid-air
  const leverFlyX = -breakProgress * 1.8;
  const leverFlyY = breakProgress * 1.8 - breakProgress * breakProgress * 2.6;
  const leverFlyRot = breakProgress * 5.2;

  // Cylinder halves splitting apart and falling flat on the platform floor
  const cylLeftX = -breakProgress * 1.35;
  const cylLeftRot = -breakProgress * 1.57; // Tilts 90 degrees onto platform
  const cylRightX = breakProgress * 1.35;
  const cylRightRot = breakProgress * 1.57;
  const cylY = -breakProgress * 0.15; // Rests on floor

  // Bucket rolling away to the right
  const bucketX = 0.42 + breakProgress * 1.7;
  const bucketRot = breakProgress * 3.8;

  if (frame >= 125) {
    return null; // Platform is completely clear for next assembly!
  }

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.25, 1.25, 1.25]}>
      {/* 1. Splitting Floor Base & Cylinder Left Half */}
      <group position={[cylLeftX, cylY, 0]} rotation={[0, 0, cylLeftRot]}>
        <mesh position={[-0.14, 0.12, 0]}>
          <boxGeometry args={[0.28, 0.24, 0.55]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[-0.09, 0.65, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.82, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      {/* 2. Splitting Floor Base & Cylinder Right Half */}
      <group position={[cylRightX, cylY, 0]} rotation={[0, 0, cylRightRot]}>
        <mesh position={[0.14, 0.12, 0]}>
          <boxGeometry args={[0.28, 0.24, 0.55]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.09, 0.65, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.82, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Brass Tap Spout */}
        <mesh position={[0.25, 0.55, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.035, 0.035, 0.2, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

      {/* 3. Piston Rod & Lever Assembly */}
      {!isDestroyed ? (
        <>
          <mesh position={[0.08, pistonY, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.45, 16]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.95} />
          </mesh>
          <group position={[0, 1.15, 0]} rotation={[0, 0, leverAngle]}>
            <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.95, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.036, 0.036, 0.22, 16]} />
              <meshStandardMaterial color="#B45309" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>
        </>
      ) : (
        /* Snapped Lever Flying Outward */
        <group
          position={[leverFlyX, 1.15 + leverFlyY, 0]}
          rotation={[0, 0, leverFlyRot]}
        >
          <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.036, 0.036, 0.22, 16]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* 4. Single Pathetic Water Droplet */}
      {dropActive && (
        <mesh position={[0.42, dropY, 0]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* 5. Tin Pail Collecting Droplets / Rolling Away */}
      <group position={[bucketX, 0.25 + cylY * 0.5, 0]} rotation={[0, 0, bucketRot]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.09, 0.28, 20]} />
          <meshStandardMaterial color="#64748B" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
