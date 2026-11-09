import React from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";

export interface ImpactShake {
  frame: number;
  duration?: number; // duration in frames (default: 4)
  intensity?: number; // displacement amplitude (default: 0.04)
}

interface RigidShowcaseCameraProps {
  /**
   * Base 2.5D 3/4 isometric position (Heroic framing):
   * Defaults to [2.3, 1.8, 3.6] (25°-30° horizontal offset, 20°-25° elevation, fills 60-65% of screen).
   */
  basePosition?: [number, number, number];
  /**
   * Target focus point:
   * Defaults to [0, -0.35, 0] (centered on the working bed).
   */
  target?: [number, number, number];
  /**
   * List of discrete impact events that trigger immediate 3-5 frame micro-shakes.
   */
  impacts?: ImpactShake[];
}

/**
 * RigidShowcaseCamera:
 * Enforces the 2.5D Isometric 3/4 Perspective Law and the Dead-Locked Tripod Law.
 * BANS all procedural sinus drift / sway. Moves strictly on physical impact impulses.
 */
export const RigidShowcaseCamera: React.FC<RigidShowcaseCameraProps> = ({
  basePosition = [2.3, 1.8, 3.6],
  target = [0, -0.35, 0],
  impacts = [],
}) => {
  const { camera } = useThree();
  const frame = useCurrentFrame();

  let shakeX = 0;
  let shakeY = 0;

  for (const impact of impacts) {
    const dur = impact.duration ?? 4;
    const intensity = impact.intensity ?? 0.04;
    const diff = frame - impact.frame;
    if (diff >= 0 && diff <= dur) {
      const decay = 1 - diff / dur;
      // High-frequency decaying impulse
      shakeX += Math.sin(diff * 3.8) * intensity * decay;
      shakeY += Math.cos(diff * 4.2) * (intensity * 0.75) * decay;
    }
  }

  // Dead-locked tripod: base position + discrete physical impact impulse ONLY
  const posX = basePosition[0] + shakeX;
  const posY = basePosition[1] + shakeY;
  const posZ = basePosition[2];

  camera.position.set(posX, posY, posZ);
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix();

  return null;
};
