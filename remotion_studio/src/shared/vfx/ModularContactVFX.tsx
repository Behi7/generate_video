import React from "react";
import * as THREE from "three";

export type ContactMaterialType =
  | "ferrous"
  | "brittle"
  | "ductile"
  | "polymer"
  | "energy";

export type ContactVFXMode =
  | "impact"
  | "continuous_grind"
  | "continuous_press";

export interface ModularContactVFXProps {
  /**
   * 3D world position of the contact/action point.
   * Default: [0, 0, 0].
   */
  position?: [number, number, number];
  /**
   * Material classification of the contact pair.
   * Default: "ferrous".
   */
  materialType?: ContactMaterialType;
  /**
   * Operational physics mode.
   * Default: "impact".
   */
  mode?: ContactVFXMode;
  /**
   * Current local frame within the tier/cycle.
   */
  localFrame: number;
  /**
   * Local frames where impact strikes take place (e.g. [160, 172, 184, 196, 208, 220]).
   */
  strikeFrames?: number[];
  /**
   * Optional custom tint for sparks/glow.
   */
  sparkColor?: string;
}

// Pre-computed normalized trajectories for sparks & debris
const FERROUS_SPARK_DIRECTIONS = [
  [1.0, 0.9, 0.4],
  [-0.9, 1.1, -0.3],
  [0.8, 0.6, 0.9],
  [-0.7, 0.8, -0.8],
  [0.3, 1.3, 0.6],
  [-0.4, 1.2, -0.7],
  [1.1, 0.5, -0.5],
  [-1.0, 0.7, 0.7],
  [0.6, 1.0, 1.0],
  [-0.5, 0.9, -1.1],
  [1.2, 0.8, -0.2],
  [-1.1, 1.0, 0.3],
  [0.2, 1.4, -0.4],
  [-0.3, 1.3, 0.5],
];

const METAL_SCALE_DIRECTIONS = [
  [0.6, 0.4, 0.5],
  [-0.5, 0.5, -0.6],
  [0.7, 0.3, -0.4],
  [-0.8, 0.4, 0.5],
  [0.3, 0.6, 0.7],
  [-0.4, 0.5, -0.7],
];

const ROCK_CHIP_DIRECTIONS = [
  [0.8, 1.2, 0.5],
  [-0.9, 1.0, -0.4],
  [0.6, 0.9, 0.9],
  [-0.7, 1.1, -0.7],
  [0.3, 1.4, 0.4],
  [-0.4, 1.3, -0.5],
  [1.0, 0.8, -0.6],
  [-1.0, 0.9, 0.6],
  [0.5, 1.1, 0.8],
  [-0.6, 1.0, -0.9],
  [0.8, 0.7, -0.8],
  [-0.7, 0.8, 0.7],
];

const POLYMER_CONFETTI_COLORS = [
  "#38BDF8", // Cyan
  "#F43F5E", // Rose
  "#FBBF24", // Amber
  "#34D399", // Emerald
  "#A855F7", // Violet
  "#FB923C", // Orange
  "#60A5FA", // Sky Blue
  "#E879F9", // Fuchsia
];

/**
 * ModularContactVFX:
 * Universal contact particle and debris generator for the Action Point.
 *
 * Physics Behaviors:
 * - `ferrous` + `impact`: Burst of high-velocity orange/yellow sparks + dark metal scale flakes on strikeFrames.
 * - `brittle` + `impact` / `grind`: Gray/white dust puff + fracturing rock chips.
 * - `polymer` + `grind`: Shredded colored confetti tumbling down.
 * - `ductile` + `press`: No sparks/debris; clean deformation without clutter.
 * - `energy` + `impact`: Radial plasma shockwave ring + cyan/violet emissive sparks.
 */
export const ModularContactVFX: React.FC<ModularContactVFXProps> = ({
  position = [0, 0, 0],
  materialType = "ferrous",
  mode = "impact",
  localFrame,
  strikeFrames = [],
  sparkColor,
}) => {
  // Ductile press: clean deformation without clutter
  if (materialType === "ductile" && (mode === "continuous_press" || mode === "impact")) {
    return null;
  }

  // Determine active strike frame offset for impact modes
  const IMPACT_LIFETIME = 5; // 0..4 frames
  let activeOffset = -1;

  if (mode === "impact" || strikeFrames.length > 0) {
    for (const strike of strikeFrames) {
      const diff = localFrame - strike;
      if (diff >= 0 && diff < IMPACT_LIFETIME) {
        activeOffset = diff;
        break;
      }
    }
  }

  // Normalized impact lifetime (0..1)
  const tImpact = activeOffset >= 0 ? activeOffset / (IMPACT_LIFETIME - 1) : -1;

  return (
    <group position={position}>
      {/* =================================================================== */}
      {/* 1. FERROUS + IMPACT: High-velocity sparks + dark metal scale flakes  */}
      {/* =================================================================== */}
      {materialType === "ferrous" && tImpact >= 0 && (
        <group>
          {/* Intense Core Flash on initial contact */}
          {tImpact < 0.4 && (
            <mesh>
              <sphereGeometry args={[0.08 * (1 - tImpact * 2.5), 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )}

          {/* High-velocity orange/yellow radiating sparks */}
          {FERROUS_SPARK_DIRECTIONS.map(([dx, dy, dz], i) => {
            const speed = 0.38 + (i % 4) * 0.08;
            const dist = (tImpact * speed + 0.04) * 1.5;
            const gravity = -0.15 * tImpact * tImpact;
            const pScale = (1 - tImpact * 0.8) * 1.2;
            const sparkTint =
              sparkColor || (i % 2 === 0 ? "#F59E0B" : "#FDE047");

            return (
              <mesh
                key={`ferrous_spark_${i}`}
                position={[dx * dist, dy * dist + gravity, dz * dist]}
                scale={[pScale, pScale, pScale]}
              >
                <boxGeometry args={[0.016, 0.016, 0.05]} />
                <meshStandardMaterial
                  color={sparkTint}
                  emissive={sparkTint}
                  emissiveIntensity={5.0}
                  roughness={0.15}
                  metalness={0.9}
                />
              </mesh>
            );
          })}

          {/* Dark metal scale flakes falling under gravity */}
          {METAL_SCALE_DIRECTIONS.map(([dx, dy, dz], i) => {
            const dist = tImpact * 0.22 + 0.02;
            const gravity = -0.28 * tImpact * tImpact;
            const flakeScale = (1 - tImpact * 0.6) * 0.9;
            const rotSpeed = tImpact * (3 + i);

            return (
              <mesh
                key={`metal_scale_${i}`}
                position={[dx * dist, dy * dist + gravity, dz * dist]}
                rotation={[rotSpeed, rotSpeed * 0.7, rotSpeed * 1.3]}
                scale={[flakeScale, flakeScale, flakeScale]}
              >
                <boxGeometry args={[0.028, 0.006, 0.024]} />
                <meshStandardMaterial
                  color="#1E293B"
                  roughness={0.85}
                  metalness={0.4}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* 2. BRITTLE + IMPACT: Gray/white dust puff + fracturing rock chips    */}
      {/* =================================================================== */}
      {materialType === "brittle" && tImpact >= 0 && (
        <group>
          {/* Gray/white dust puff expanding and fading */}
          <mesh
            position={[0, 0.04 + tImpact * 0.08, 0]}
            scale={[1 + tImpact * 3.5, 0.6 + tImpact * 2.0, 1 + tImpact * 3.5]}
          >
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial
              color="#CBD5E1"
              transparent
              opacity={(1 - tImpact) * 0.42}
              roughness={0.95}
              depthWrite={false}
            />
          </mesh>

          {/* Fracturing rock chips flying upward and tumbling */}
          {ROCK_CHIP_DIRECTIONS.map(([dx, dy, dz], i) => {
            const dist = tImpact * 0.32 + 0.03;
            const gravity = -0.32 * tImpact * tImpact;
            const chipScale = (1 - tImpact * 0.7) * 1.1;
            const chipColor =
              i % 3 === 0 ? "#64748B" : i % 3 === 1 ? "#475569" : "#94A3B8";
            const rot = tImpact * (4 + i);

            return (
              <mesh
                key={`rock_chip_${i}`}
                position={[dx * dist, dy * dist + gravity, dz * dist]}
                rotation={[rot, rot * 1.1, rot * 0.8]}
                scale={[chipScale, chipScale, chipScale]}
              >
                <boxGeometry args={[0.032, 0.028, 0.03]} />
                <meshStandardMaterial
                  color={chipColor}
                  roughness={0.88}
                  metalness={0.1}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* 3. BRITTLE + CONTINUOUS GRIND: Persistent dust & chip stream        */}
      {/* =================================================================== */}
      {materialType === "brittle" && mode === "continuous_grind" && (
        <group>
          {ROCK_CHIP_DIRECTIONS.slice(0, 8).map(([dx, dy, dz], i) => {
            const cycleProgress = ((localFrame * 0.18 + i * 0.125) % 1);
            const dist = cycleProgress * 0.28 + 0.02;
            const gravity = -0.25 * cycleProgress * cycleProgress;
            const pScale = (1 - cycleProgress * 0.6) * 0.8;
            const chipColor = i % 2 === 0 ? "#64748B" : "#94A3B8";

            return (
              <mesh
                key={`grind_chip_${i}`}
                position={[dx * dist, dy * dist + gravity, dz * dist]}
                rotation={[localFrame * 0.1 + i, localFrame * 0.15, 0]}
                scale={[pScale, pScale, pScale]}
              >
                <boxGeometry args={[0.022, 0.02, 0.022]} />
                <meshStandardMaterial
                  color={chipColor}
                  roughness={0.9}
                  metalness={0.1}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* 4. POLYMER + GRIND: Shredded colored confetti tumbling down         */}
      {/* =================================================================== */}
      {materialType === "polymer" && (
        <group>
          {POLYMER_CONFETTI_COLORS.map((color, i) => {
            const cycleProgress = ((localFrame * 0.06 + i * 0.12) % 1);
            // Flutter oscillation with low terminal velocity
            const flutterX =
              Math.sin(localFrame * 0.35 + i * 1.8) * 0.08 * cycleProgress;
            const flutterZ =
              Math.cos(localFrame * 0.28 + i * 2.2) * 0.08 * cycleProgress;
            const flutterY = -0.42 * cycleProgress;
            const flakeScale = (1 - cycleProgress * 0.4) * 0.9;

            return (
              <mesh
                key={`polymer_confetti_${i}`}
                position={[
                  (i % 2 === 0 ? 0.05 : -0.05) + flutterX,
                  flutterY,
                  flutterZ,
                ]}
                rotation={[
                  localFrame * 0.15 + i,
                  localFrame * 0.2 + i * 0.5,
                  localFrame * 0.1,
                ]}
                scale={[flakeScale, flakeScale, flakeScale]}
              >
                <boxGeometry args={[0.03, 0.004, 0.045]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.4}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* 5. ENERGY + IMPACT: Radial plasma shockwave ring + cyan/violet spark */}
      {/* =================================================================== */}
      {materialType === "energy" && tImpact >= 0 && (
        <group>
          {/* Radial plasma shockwave ring expanding horizontally */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry
              args={[
                0.03 + tImpact * 0.38,
                0.08 + tImpact * 0.48,
                32,
              ]}
            />
            <meshBasicMaterial
              color={sparkColor || "#06B6D4"}
              transparent
              opacity={(1 - tImpact) * 0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Cyan/violet emissive plasma sparks */}
          {FERROUS_SPARK_DIRECTIONS.map(([dx, dy, dz], i) => {
            const speed = 0.42 + (i % 3) * 0.1;
            const dist = (tImpact * speed + 0.03) * 1.6;
            const plasmaColor =
              sparkColor || (i % 2 === 0 ? "#22D3EE" : "#A855F7");
            const pScale = (1 - tImpact * 0.75) * 1.3;

            return (
              <mesh
                key={`plasma_spark_${i}`}
                position={[dx * dist, dy * dist * 0.8, dz * dist]}
                scale={[pScale, pScale, pScale]}
              >
                <boxGeometry args={[0.018, 0.018, 0.06]} />
                <meshStandardMaterial
                  color={plasmaColor}
                  emissive={plasmaColor}
                  emissiveIntensity={6.0}
                  roughness={0.1}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};
