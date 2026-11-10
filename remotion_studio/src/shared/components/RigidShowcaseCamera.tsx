import React from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import { ImpactShake } from "../contracts/AssemblyContract";
import { TIER_DURATION_FRAMES } from "../contracts/StageTimeline";

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
   * Default: TIER_DURATION_FRAMES (canonical StageTimeline duration, 320 frames).
   * Set to 0 or undefined for flat non-tiered sequences.
   */
  tierDuration?: number;
  /**
   * Whether to accumulate kinetic step-back across progression tiers upon each overload fracture.
   * Masks camera re-framing behind explosive fracture events (Act 4: 265..289f).
   * Default: true.
   */
  enableTierStepback?: boolean;
  /**
   * Cumulative stepback factors per tier (relative to line of sight distance).
   * Negative values = camera pulled further back away from target.
   * Defaults to [0.0, -0.09, -0.19, -0.30] for Tiers 1, 2, 3, 4.
   */
  tierStepbacks?: number[];
}

/**
 * RigidShowcaseCamera:
 * Enforces the 2.5D Isometric 3/4 Perspective Law, the Dead-Locked Tripod Law,
 * and the Kinetic Recoil Reframe Law:
 *
 * - BANS all procedural sinus drift / sway.
 * - During Act 1 (0..149f): Dead-locked at the tier's calibrated baseline distance.
 * - During Act 3 (150..224f): Climax Push - smoothly moves 3.5% closer along line of sight.
 * - During Act 4A/B (225..264f): Holds close tension during stall / micro-shudder.
 * - During Act 4C (265..289f): Catastrophic fracture impulse triggers an explosive recoil
 *   that masks the camera step-back, smoothly settling into the next tier's wider baseline.
 * - Cumulatively steps back across Tiers 1 -> 2 -> 3 -> 4, framing giant late-game machines
 *   magnificently without edge-clipping.
 */
export const RigidShowcaseCamera: React.FC<RigidShowcaseCameraProps> = ({
  basePosition = [2.3, 1.8, 3.6],
  target = [0, -0.35, 0],
  impacts = [],
  enableClimaxPush = true,
  tierDuration = TIER_DURATION_FRAMES,
  enableTierStepback = true,
  tierStepbacks = [0.0, -0.09, -0.19, -0.30],
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

  // 2. Dynamic Climax Push & Kinetic Recoil Stepback along line of sight
  let pushFactor = 0;

  if (tierDuration && tierDuration > 0) {
    const tierIndex = Math.max(0, Math.floor(frame / tierDuration));
    const localFrame = Math.min(tierDuration - 1, Math.max(0, frame % tierDuration));

    const currentBaseline = enableTierStepback
      ? (tierStepbacks[Math.min(tierIndex, tierStepbacks.length - 1)] ?? 0)
      : 0;

    const nextBaseline = enableTierStepback
      ? (tierStepbacks[Math.min(tierIndex + 1, tierStepbacks.length - 1)] ?? currentBaseline)
      : currentBaseline;

    if (enableClimaxPush) {
      if (tierDuration >= 320) {
        // Canonical 320-frame timeline with fluid 4-stage escalation
        if (localFrame < 123) {
          // Acts 1 & 2 (0..122f): Steady dead-locked tripod at current tier baseline
          pushFactor = currentBaseline;
        } else if (localFrame >= 123 && localFrame <= 212) {
          // Act 3 Peak Operating (123..212f): Smooth S-curve push 3.5% closer along line of sight
          const progress = (localFrame - 123) / (212 - 123);
          const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
          pushFactor = currentBaseline + 0.035 * easeInOut;
        } else if (localFrame >= 213 && localFrame <= 233) {
          // Act 4 Strain & Resonance (213..233f): Hold maximum close tension during torque bog-down and pre-fracture shudder
          pushFactor = currentBaseline + 0.035;
        } else {
          // Act 4 Fracture & Cleanser Recoil (Frames 234..319): Catastrophic fracture detonation at breakFrame=234!
          // Masked by debris explosion and cleanser sweep, camera recoils backward into next tier's wider baseline.
          const recoilDiff = localFrame - 234;
          const startVal = currentBaseline + 0.035;
          const targetVal = nextBaseline;
          const delta = targetVal - startVal; // Negative delta (moving further away)

          // Damped elastic spring settling curve (alpha = 0.18, beta = 0.40):
          // Seamlessly settles into targetVal by frame 308..319
          const decay = Math.exp(-0.18 * recoilDiff);
          const oscCos = Math.cos(0.40 * recoilDiff);
          const oscSin = Math.sin(0.40 * recoilDiff);

          pushFactor = targetVal - delta * decay * oscCos - 0.025 * decay * oscSin;
        }
      } else {
        // Legacy fallback for < 320 frames
        if (localFrame < 150) {
          pushFactor = currentBaseline;
        } else if (localFrame >= 150 && localFrame <= 224) {
          const progress = (localFrame - 150) / (224 - 150);
          const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
          pushFactor = currentBaseline + 0.035 * easeInOut;
        } else if (localFrame >= 225 && localFrame <= 264) {
          pushFactor = currentBaseline + 0.035;
        } else {
          const recoilDiff = localFrame - 265;
          const startVal = currentBaseline + 0.035;
          const targetVal = nextBaseline;
          const delta = targetVal - startVal;
          const decay = Math.exp(-0.22 * recoilDiff);
          const oscCos = Math.cos(0.45 * recoilDiff);
          const oscSin = Math.sin(0.45 * recoilDiff);
          pushFactor = targetVal - delta * decay * oscCos - 0.025 * decay * oscSin;
        }
      }
    } else {
      pushFactor = currentBaseline;
    }
  } else {
    // Flat non-tiered sequence fallback
    if (enableClimaxPush) {
      if (frame >= 150 && frame <= 224) {
        const progress = (frame - 150) / (224 - 150);
        const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
        pushFactor = 0.035 * easeInOut;
      } else if (frame >= 225 && frame <= 264) {
        pushFactor = 0.035;
      } else if (frame >= 265 && frame <= 271) {
        const recoilDiff = frame - 265;
        const decay = Math.exp(-recoilDiff * 0.65);
        const bounce = Math.cos(recoilDiff * 1.2) * decay;
        pushFactor = -0.015 * bounce;
      } else {
        pushFactor = 0;
      }
    }
  }

  // 3. Line of sight vector towards target (Target - BasePosition)
  const dirX = target[0] - basePosition[0];
  const dirY = target[1] - basePosition[1];
  const dirZ = target[2] - basePosition[2];

  const pushX = dirX * pushFactor;
  const pushY = dirY * pushFactor;
  const pushZ = dirZ * pushFactor;

  // 4. Base position + line-of-sight climax push & recoil + physical impact micro-shakes
  const posX = basePosition[0] + pushX + shakeX;
  const posY = basePosition[1] + pushY + shakeY;
  const posZ = basePosition[2] + pushZ;

  camera.position.set(posX, posY, posZ);
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix();

  return null;
};
