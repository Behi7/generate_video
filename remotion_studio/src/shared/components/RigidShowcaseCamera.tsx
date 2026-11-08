import React from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import { ImpactShake } from "../contracts/AssemblyContract";

export { ImpactShake };

export interface RigidShowcaseCameraProps {
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
  /**
   * Whether to enable dynamic Climax Push & Recoil along the line of sight.
   * Default: true.
   */
  enableClimaxPush?: boolean;
  /**
   * Duration of each progression tier in frames.
   * Default: 290 (canonical StageTimeline duration).
   * Set to 0 or undefined for flat non-tiered sequences.
   */
  tierDuration?: number;
}

/**
 * RigidShowcaseCamera:
 * Enforces the 2.5D Isometric 3/4 Perspective Law and the Dead-Locked Tripod Law.
 * BANS all procedural sinus drift / sway. Moves strictly on physical impact impulses
 * and dynamic Act 3 Climax Push & Recoil:
 *
 * - Frames 0..149: Base camera position (dead-locked).
 * - Frames 150..224 (Act 3 Peak Operating): Camera smoothly interpolates 3.5% closer
 *   along the line of sight towards `target` (pos + (target - pos) * 0.035 * easeInOut(p)).
 * - Frames 225..264: Holds close tension during stall/micro-shudder.
 * - Frame 265 (Fracture): Explosive recoil step back to base with a 6-frame elastic bounce.
 */
export const RigidShowcaseCamera: React.FC<RigidShowcaseCameraProps> = ({
  basePosition = [2.3, 1.8, 3.6],
  target = [0, -0.35, 0],
  impacts = [],
  enableClimaxPush = true,
  tierDuration = 290,
}) => {
  const { camera } = useThree();
  const frame = useCurrentFrame();

  // 1. Calculate discrete physical impact impulses (Dead-locked tripod micro-shakes)
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

  // 2. Dynamic Climax Push & Recoil along line of sight
  let pushFactor = 0;
  if (enableClimaxPush) {
    const localFrame = tierDuration && tierDuration > 0 ? frame % tierDuration : frame;

    if (localFrame >= 150 && localFrame <= 224) {
      // Smooth S-curve interpolation 3.5% closer along line of sight
      const progress = (localFrame - 150) / (224 - 150);
      const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
      pushFactor = 0.035 * easeInOut;
    } else if (localFrame >= 225 && localFrame <= 264) {
      // Hold maximum close tension during machine stall / micro-shudder
      pushFactor = 0.035;
    } else if (localFrame >= 265 && localFrame <= 271) {
      // Frame 265 Fracture: Explosive recoil step back to base with a 6-frame elastic bounce
      const recoilDiff = localFrame - 265;
      const decay = Math.exp(-recoilDiff * 0.65);
      const bounce = Math.cos(recoilDiff * 1.2) * decay;
      pushFactor = -0.015 * bounce;
    } else {
      // Frames 0..149 and 272..289: Exact base position
      pushFactor = 0;
    }
  }

  // Line of sight vector towards target
  const dirX = target[0] - basePosition[0];
  const dirY = target[1] - basePosition[1];
  const dirZ = target[2] - basePosition[2];

  const pushX = dirX * pushFactor;
  const pushY = dirY * pushFactor;
  const pushZ = dirZ * pushFactor;

  // Base position + line-of-sight climax push + physical impact shake
  const posX = basePosition[0] + pushX + shakeX;
  const posY = basePosition[1] + pushY + shakeY;
  const posZ = basePosition[2] + pushZ;

  camera.position.set(posX, posY, posZ);
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix();

  return null;
};
