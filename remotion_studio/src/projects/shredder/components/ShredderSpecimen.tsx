import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export interface ShredderSpecimenProps {
  localFrame?: number;
}

export const ShredderSpecimen: React.FC<ShredderSpecimenProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  // Nip center is at y = 1.65. Hopper top is at y = 2.15 to 2.3.
  // Feed Kinematics:
  // Local frames 0..69: Specimen arrives / hovers above hopper (y ≈ 2.5 down to 2.2)
  // Local frames 70..149: Machine starting, specimen edges down into hopper throat (y ≈ 2.2 down to 1.9)
  // Local frames 150..249: Intense shredding! Specimen pulled down through throat (y ≈ 1.9 down to 1.6),
  //                       active squash/deformation, and shredded debris streams out below (y ≈ 1.3 down to 0.7)
  // Local frames 250..289: Catastrophic jam at y ≈ 1.65!

  let specimenPosY = 2.4;
  let squashScaleY = 1.0;
  let stretchScaleX = 1.0;
  let stretchScaleZ = 1.0;
  let shredProgress = 0;

  if (local < 70) {
    // Arrival
    specimenPosY = interpolate(local, [10, 45], [3.2, 2.35], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 70 && local < 150) {
    // Pre-feed descent into hopper mouth
    specimenPosY = interpolate(local, [70, 150], [2.35, 1.95], {
      easing: Easing.linear,
    });
  } else if (local >= 150 && local < 255) {
    // Active shredding stroke
    shredProgress = (local - 150) / 105;
    specimenPosY = interpolate(local, [150, 255], [1.95, 1.62], {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });

    if (tier === 1) {
      squashScaleY = Math.max(0.25, 1.0 - shredProgress * 0.7);
      stretchScaleX = 1.0 + Math.sin(local * 0.5) * 0.08;
      stretchScaleZ = 1.0 - shredProgress * 0.3;
    } else if (tier === 2) {
      squashScaleY = Math.max(0.22, 1.0 - shredProgress * 0.75);
      stretchScaleX = 1.0 + shredProgress * 0.25;
      stretchScaleZ = 1.0 - shredProgress * 0.35;
    } else if (tier === 3) {
      // Buckling & tearing
      squashScaleY = Math.max(0.3, 1.0 - shredProgress * 0.65);
      stretchScaleX = 1.0 + Math.sin(local * 0.8) * 0.12;
      stretchScaleZ = 1.0 - shredProgress * 0.4;
    } else if (tier === 4) {
      // Quantum disintegration compression
      squashScaleY = Math.max(0.12, 1.0 - shredProgress * 0.85);
      stretchScaleX = Math.max(0.15, 1.0 - shredProgress * 0.82);
      stretchScaleZ = Math.max(0.15, 1.0 - shredProgress * 0.82);
    }
  } else {
    // Jammed in teeth (Act 4)
    specimenPosY = 1.62;
    shredProgress = 1.0;
    squashScaleY = tier === 4 ? 0.12 : 0.28;
    stretchScaleX = tier === 4 ? 0.15 : 1.25;
  }

  // Debris discharge below cutters during Act 3 (150..249f)
  const isDebrisActive = local >= 150 && local < 255;
  const debrisStreamOffset = (local * 0.06) % 0.65;

  // Cutting sparks during steady state
  const isSparkBursting = isDebrisActive && local % 12 >= 0 && local % 12 <= 4;
  const sparkFrameOffset = local % 12;

  return (
    <group>
      {/* 1. PRIMARY SPECIMEN IN FEED CHUTE / CUTTER NIP */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, specimenPosY, 0]}
        scale={[stretchScaleX, squashScaleY, stretchScaleZ]}
      >
        {/* Tier 1: Blue Recycled Polymer Bottle / Block */}
        {tier === 1 && (
          <group>
            {/* Main Polymer Bottle Body */}
            <RoundedBox args={[0.22, 0.38, 0.18]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                color="#0284C7"
                roughness={0.25}
                metalness={0.15}
                transparent
                opacity={0.88}
              />
            </RoundedBox>
            {/* White Bottle Neck & Cap */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.07, 18]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.27, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.03, 18]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        )}

        {/* Tier 2: Heavy Aluminum Billet / Beverage Can with Printed Band */}
        {tier === 2 && (
          <group>
            <RoundedBox args={[0.26, 0.36, 0.24]} radius={0.035} smoothness={4}>
              <meshStandardMaterial color="#E2E8F0" roughness={0.18} metalness={0.92} />
            </RoundedBox>
            {/* Red Stamped Brand Stripe */}
            <mesh position={[0, 0, 0.123]}>
              <planeGeometry args={[0.22, 0.12]} />
              <meshStandardMaterial color="#DC2626" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Punched Indents / Rivets */}
            {[-0.07, 0.07].map((rx, idx) => (
              <mesh key={idx} position={[rx, 0.12, 0.124]}>
                <circleGeometry args={[0.016, 12]} />
                <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
              </mesh>
            ))}
          </group>
        )}

        {/* Tier 3: Massive Industrial Titanium I-Beam Specimen */}
        {tier === 3 && (
          <group>
            {/* Central Web Plate */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.055, 0.44, 0.38]} />
              <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Left Heavy Flange */}
            <RoundedBox args={[0.045, 0.44, 0.38]} radius={0.01} smoothness={4} position={[-0.14, 0, 0]}>
              <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.92} />
            </RoundedBox>
            {/* Right Heavy Flange */}
            <RoundedBox args={[0.045, 0.44, 0.38]} radius={0.01} smoothness={4} position={[0.14, 0, 0]}>
              <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.92} />
            </RoundedBox>
            {/* Cyan Laser Serial Marking on Web */}
            <mesh position={[0.03, 0.05, 0]}>
              <planeGeometry args={[0.01, 0.22]} />
              <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )}

        {/* Tier 4: Dark Matter Obsidian Monolith Cube */}
        {tier === 4 && (
          <group>
            {/* Obsidian Monolith Cube */}
            <RoundedBox args={[0.32, 0.32, 0.32]} radius={0.04} smoothness={4}>
              <meshStandardMaterial
                color="#05050A"
                roughness={0.08}
                metalness={0.98}
                emissive="#00E5FF"
                emissiveIntensity={0.4 + shredProgress * 1.5}
              />
            </RoundedBox>
            {/* Internal Octahedral Singularity Seed */}
            <mesh>
              <octahedronGeometry args={[0.15]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}
      </group>

      {/* 2. SHREDDED DISCHARGE PARTICLES / FLAKES (Falling below cutters at y = 1.3..0.8) */}
      {isDebrisActive && (
        <group position={[0, 1.35 - debrisStreamOffset, 0]}>
          {[-0.08, 0, 0.08].map((dx, i) =>
            [-0.08, 0.08].map((dz, j) => {
              const chipColor =
                tier === 1
                  ? "#0284C7"
                  : tier === 2
                  ? "#CBD5E1"
                  : tier === 3
                  ? "#E2E8F0"
                  : "#00E5FF";
              return (
                <group key={`${i}_${j}`} position={[dx, -(i + j) * 0.08, dz]}>
                  <mesh rotation={[dx * 10, dz * 10, 0]}>
                    <boxGeometry args={[0.035, 0.018, 0.03]} />
                    <meshStandardMaterial
                      color={chipColor}
                      roughness={0.3}
                      metalness={tier === 1 ? 0.2 : 0.9}
                      emissive={tier === 4 ? "#00E5FF" : "#000000"}
                      emissiveIntensity={tier === 4 ? 1.5 : 0}
                    />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      )}

      {/* Continuous Crushing Spark Bursts in Cutting Throat during Act 3 */}
      {(tier === 2 || tier === 3) && (
        <SparkBurst
          active={isSparkBursting}
          frameOffset={sparkFrameOffset}
          position={[0, 1.62, 0.08]}
          color={tier === 3 ? "#F59E0B" : "#FBBF24"}
          scale={tier === 3 ? 1.1 : 0.85}
        />
      )}
    </group>
  );
};
