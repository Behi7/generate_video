import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const DestructibleDynamo: React.FC = () => {
  const frame = useCurrentFrame();

  // Active working phase: frames 0 - 114
  // Destruction phase: frames 115 - 124
  if (frame >= 125) {
    return null; // Platform clear for next tier
  }

  const isDestroyed = frame >= 115;
  const breakProgress = interpolate(frame, [115, 124], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Crank cycle & rotational speed (continuous hand crank rotation)
  const crankAngle = !isDestroyed ? frame * 0.32 : 115 * 0.32;
  const armatureAngle = crankAngle * 3.5; // Gear stepped up 3.5x

  // Bulb illumination flicker when operational
  const bulbFlicker = !isDestroyed
    ? Math.sin(frame * 0.8) * 0.15 + Math.cos(frame * 1.7) * 0.08 + 1.0
    : 0;
  const bulbEmissiveIntensity = !isDestroyed ? 3.5 * bulbFlicker : 0;
  const bulbLightIntensity = !isDestroyed ? 8.0 * bulbFlicker : 0;

  // Destruction physics:
  // 1. Crank handle snaps off and flings upward & left
  const handleFlyX = -breakProgress * 2.1;
  const handleFlyY = breakProgress * 1.8 - breakProgress * breakProgress * 2.7;
  const handleFlyRot = breakProgress * 6.5;

  // 2. Coil frame & cast stator split in half onto platform
  const frameLeftX = -breakProgress * 1.05;
  const frameLeftRotZ = -breakProgress * 1.57; // Tilts onto platform
  const frameRightX = breakProgress * 1.05;
  const frameRightRotZ = breakProgress * 1.57;
  const frameY = -breakProgress * 0.14;

  // 3. Bulb glass shards exploding radially
  const shardSpread = breakProgress * 1.4;

  // Contact / fracture spark bursts
  const breakSparkActive = frame >= 115 && frame <= 119;
  const breakSparkOffset = frame - 115;

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.25, 1.25, 1.25]}>
      {/* Docking / Break Spark Burst at axle and bulb socket */}
      <SparkBurst
        active={breakSparkActive}
        frameOffset={breakSparkOffset}
        position={[0, 0.85, 0]}
        color="#FBBF24"
        scale={1.3}
      />
      <SparkBurst
        active={breakSparkActive}
        frameOffset={breakSparkOffset}
        position={[0.42, 1.15, 0]}
        color="#FDE047"
        scale={1.0}
      />

      {/* --- LEFT HALF: Cast Footing, Pole Piece & Left Copper Coil --- */}
      <group position={[frameLeftX, frameY, 0]} rotation={[0, 0, frameLeftRotZ]}>
        {/* Monolithic cast iron bed bracket (Zero bolts) */}
        <mesh position={[-0.22, 0.1, 0]}>
          <boxGeometry args={[0.38, 0.2, 0.65]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Curved Pole Shoe / Stator Horn */}
        <mesh position={[-0.22, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.28} metalness={0.88} />
        </mesh>
        {/* Left Copper Wire Coil (Gleaming copper rings) */}
        <group position={[-0.22, 0.48, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.42, 24]} />
            <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Copper winding ribs */}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((z, idx) => (
            <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.185, 0.018, 12, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- RIGHT HALF: Cast Footing, Pole Piece, Right Coil & Bulb Mount --- */}
      <group position={[frameRightX, frameY, 0]} rotation={[0, 0, frameRightRotZ]}>
        {/* Monolithic cast iron bed bracket */}
        <mesh position={[0.22, 0.1, 0]}>
          <boxGeometry args={[0.38, 0.2, 0.65]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Curved Pole Shoe */}
        <mesh position={[0.22, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.28} metalness={0.88} />
        </mesh>
        {/* Right Copper Wire Coil */}
        <group position={[0.22, 0.48, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.42, 24]} />
            <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.92} />
          </mesh>
          {[-0.14, -0.07, 0, 0.07, 0.14].map((z, idx) => (
            <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.185, 0.018, 12, 24]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
            </mesh>
          ))}
        </group>

        {/* Heavy Angled Brass Stem to Bulb Socket */}
        <mesh position={[0.36, 0.85, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.028, 0.032, 0.35, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.22} metalness={0.9} />
        </mesh>
        {/* Brass Bulb Bayonet Base */}
        <mesh position={[0.42, 1.02, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.12, 20]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.92} />
        </mesh>
      </group>

      {/* --- ARMATURE ROTOR & SPINDLE (Inside Stator) --- */}
      {!isDestroyed && (
        <group position={[0, 0.48, 0]} rotation={[0, 0, armatureAngle]}>
          {/* Central hardened steel shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.72, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Armature core lamination stack */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.36, 20]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Armature copper windings */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.07, 0.26, 0.35]} />
            <meshStandardMaterial color="#EA580C" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Brass commutator rings */}
          <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.08, 16]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>
      )}

      {/* --- CRANK HANDLE & GEAR (Snaps off at frame 115) --- */}
      <group
        position={[
          isDestroyed ? handleFlyX : 0,
          0.48 + (isDestroyed ? handleFlyY : 0),
          0.38,
        ]}
        rotation={[
          0,
          0,
          isDestroyed ? crankAngle + handleFlyRot : crankAngle,
        ]}
      >
        {/* Drive Gear / Hub */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
          <meshStandardMaterial color="#64748B" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Machined Crank Arm */}
        <mesh position={[-0.26, 0, 0.03]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.52, 0.05, 0.03]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Hardwood / Bakelite Rotating Grip Handle */}
        <mesh position={[-0.48, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.22, 16]} />
          <meshStandardMaterial color="#78350F" roughness={0.4} />
        </mesh>
        {/* Grip end cap */}
        <mesh position={[-0.48, 0, 0.26]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* --- INCANDESCENT BULB & SHATTERED GLASS FRAGMENTS --- */}
      {/* Light cast by bulb during operation */}
      {bulbLightIntensity > 0 && (
        <pointLight
          position={[0.42, 1.18, 0]}
          intensity={bulbLightIntensity}
          color="#FBBF24"
          distance={4.5}
          decay={2}
        />
      )}

      {!isDestroyed ? (
        <group position={[0.42, 1.18, 0]}>
          {/* Glass Envelope (Intact) */}
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#F59E0B"
              emissiveIntensity={bulbEmissiveIntensity * 0.4}
              transparent
              opacity={0.65}
              roughness={0.05}
              metalness={0.1}
            />
          </mesh>
          {/* Filament Glowing Core */}
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.04, 0.008, 12, 20]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FDE047"
              emissiveIntensity={bulbEmissiveIntensity * 1.8}
            />
          </mesh>
        </group>
      ) : (
        /* Exploding Glass Shards at Frame 115-124 */
        <group position={[0.42, 1.18, 0]}>
          {[
            [0.8, 1.0, 0.4],
            [-0.9, 0.8, -0.5],
            [0.5, -0.6, 0.9],
            [-0.6, -0.5, -0.8],
            [1.0, -0.2, -0.6],
            [-0.4, 1.2, 0.7],
          ].map(([dx, dy, dz], i) => (
            <mesh
              key={i}
              position={[dx * shardSpread, dy * shardSpread, dz * shardSpread]}
              rotation={[
                breakProgress * (i + 1) * 3,
                breakProgress * (i + 2) * 2,
                0,
              ]}
              scale={[1 - breakProgress * 0.5, 1 - breakProgress * 0.5, 1 - breakProgress * 0.5]}
            >
              <boxGeometry args={[0.06, 0.07, 0.012]} />
              <meshStandardMaterial
                color="#FEF08A"
                transparent
                opacity={0.6 * (1 - breakProgress)}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
