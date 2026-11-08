import React from "react";

interface SparkBurstProps {
  active: boolean;
  frameOffset: number; // 0 to 4
  position?: [number, number, number];
  color?: string;
  scale?: number;
  count?: number;
  spread?: number;
}

export const SparkBurst: React.FC<SparkBurstProps> = ({
  active,
  frameOffset,
  position = [0, 0, 0],
  color = "#FBBF24",
  scale = 1,
  count,
  spread: spreadMultiplier = 1,
}) => {
  if (!active || frameOffset < 0 || frameOffset > 4) return null;

  const t = frameOffset / 4; // 0 to 1
  const spreadDist = (t * 0.45 + 0.08) * scale * spreadMultiplier;
  const particleScale = (1 - t * 0.75) * scale;

  // Up to 16 radial spark trajectories for high-impact docking burst
  const allDirections = [
    [1, 0.8, 0.5],
    [-1, 0.9, -0.4],
    [0.7, -0.6, 0.8],
    [-0.8, -0.7, -0.6],
    [0.2, 1.2, 0.7],
    [-0.3, 1.1, -0.8],
    [1.1, -0.2, -0.5],
    [-1.0, 0.3, 0.9],
    [0.5, 0.4, 1.0],
    [-0.6, -0.3, -1.0],
    [0.9, 0.5, -0.7],
    [-0.7, 0.8, 0.6],
    [0.4, -0.9, 0.4],
    [-0.5, -0.8, -0.5],
    [0.8, -0.4, -0.8],
    [-0.9, 0.2, -0.7],
  ];

  const directions = count ? allDirections.slice(0, count) : allDirections;

  return (
    <group position={position}>
      {/* Intense Core Flash */}
      {t < 0.5 && (
        <mesh>
          <sphereGeometry args={[0.09 * (1 - t * 2) * scale, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}

      {/* Radiating High-Energy Spark Particles */}
      {directions.map(([dx, dy, dz], i) => (
        <mesh
          key={i}
          position={[dx * spreadDist, dy * spreadDist, dz * spreadDist]}
          scale={[particleScale, particleScale, particleScale]}
        >
          <boxGeometry args={[0.024, 0.024, 0.055]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={5.0}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};
