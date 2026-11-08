import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export const CrusherSpecimen: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  // Compression & crushing deformation across acts
  // Act 3 is frames 150..249: intense crushing and deformation
  let squashY = 1.0;
  let expandXZ = 1.0;
  let crackIntensity = 0;

  if (tier === 1) {
    if (local >= 150 && local < 255) {
      // Steady manual crushing
      const p = (local - 150) / 105;
      squashY = 1.0 - p * 0.22;
      expandXZ = 1.0 + p * 0.12;
      crackIntensity = p;
    } else if (local >= 255) {
      // Jammed & fractured state
      squashY = 0.78;
      expandXZ = 1.12;
      crackIntensity = 1.0;
    }
  } else if (tier === 2) {
    if (local >= 150 && local < 255) {
      // Pulsing hammer smash
      const p = (local - 150) / 105;
      const pulse = Math.abs(Math.sin((local - 150) * 0.4)) * 0.08;
      squashY = 1.0 - p * 0.35 - pulse;
      expandXZ = 1.0 + p * 0.22 + pulse * 0.5;
      crackIntensity = p;
    } else if (local >= 255) {
      squashY = 0.65;
      expandXZ = 1.22;
      crackIntensity = 1.0;
    }
  } else if (tier === 3) {
    if (local >= 150 && local < 255) {
      // 100-Ton steady hydraulic flattening
      const p = interpolate(local, [150, 250], [0, 1], {
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      });
      squashY = 1.0 - p * 0.55;
      expandXZ = 1.0 + p * 0.38;
      crackIntensity = p;
    } else if (local >= 255) {
      squashY = 0.45;
      expandXZ = 1.38;
      crackIntensity = 1.0;
    }
  } else if (tier === 4) {
    if (local >= 150 && local < 255) {
      // Quantum pinch: object shrinks and glows
      const p = (local - 150) / 105;
      squashY = Math.max(0.08, 1.0 - p * 0.85);
      expandXZ = Math.max(0.12, 1.0 - p * 0.75);
      crackIntensity = p * 2.5;
    } else if (local >= 255) {
      // Singularity core
      squashY = 0.15;
      expandXZ = 0.2;
      crackIntensity = 3.0;
    }
  }

  // Fracture chips & sparks
  const isPoundingTier2 = tier === 2 && local >= 150 && local < 255 && (local % 15 >= 0 && local % 15 <= 4);
  const poundFrameOffset = local % 15;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ANVIL BASE BED (Common heavy machined foundation) */}
      <group position={[0, 0.1, 0]}>
        {/* Solid Cast Iron Base Block */}
        <RoundedBox args={[1.5, 0.2, 1.2]} radius={0.025} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* Polished Hardened Tool-Steel Anvil Platen */}
        <RoundedBox args={[0.7, 0.08, 0.7]} radius={0.015} smoothness={4} position={[0, 0.14, 0]}>
          <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.96} />
        </RoundedBox>

        {/* Dual Heavy Anvil Clamping Lugs */}
        <mesh position={[-0.42, 0.12, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
          <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.42, 0.12, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
          <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* 2. CRUSHING SPECIMEN (Center anvil table, y = 0.32) */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, 0.28 + (0.16 * squashY), 0]}
        scale={[expandXZ, squashY, expandXZ]}
      >
        {/* Tier 1: Raw Brown Mineral Cube */}
        {tier === 1 && (
          <group>
            <RoundedBox args={[0.34, 0.32, 0.34]} radius={0.02} smoothness={4}>
              <meshStandardMaterial
                color="#78350F"
                roughness={0.88}
                metalness={0.12}
              />
            </RoundedBox>
            {/* Embedded Pyrite Veins */}
            <mesh position={[0.06, 0.02, 0.12]}>
              <boxGeometry args={[0.12, 0.06, 0.06]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        )}

        {/* Tier 2: Heavy Cast Ingot Block with Stamping Recess */}
        {tier === 2 && (
          <group>
            <RoundedBox args={[0.36, 0.34, 0.36]} radius={0.025} smoothness={4}>
              <meshStandardMaterial
                color="#475569"
                roughness={0.45}
                metalness={0.82}
              />
            </RoundedBox>
            {/* Stamping Mark on Face */}
            <mesh position={[0, 0, 0.185]}>
              <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        )}

        {/* Tier 3: Industrial Titanium Aerospace Billet */}
        {tier === 3 && (
          <group>
            <RoundedBox args={[0.38, 0.36, 0.38]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                color="#94A3B8"
                roughness={0.18}
                metalness={0.92}
              />
            </RoundedBox>
            {/* Precision Laser Serial Mark */}
            <mesh position={[0, 0.08, 0.192]}>
              <planeGeometry args={[0.22, 0.05]} />
              <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {/* Tier 4: Glowing Quantum Antimatter Cube */}
        {tier === 4 && (
          <group>
            <RoundedBox args={[0.32, 0.32, 0.32]} radius={0.04} smoothness={4}>
              <meshStandardMaterial
                color="#00E5FF"
                emissive="#00E5FF"
                emissiveIntensity={0.8 + crackIntensity * 1.5}
                roughness={0.05}
                metalness={0.98}
              />
            </RoundedBox>
            {/* Inner Floating Quantum Singularity Core */}
            <mesh>
              <octahedronGeometry args={[0.16]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={2.5 + crackIntensity * 2.0}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Spark Bursts on Tier 2 Repetitive Hammer Strikes */}
      {tier === 2 && (
        <SparkBurst
          active={isPoundingTier2}
          frameOffset={poundFrameOffset}
          position={[0, 0.35, 0.15]}
          color="#F59E0B"
          scale={0.8}
        />
      )}
    </group>
  );
};