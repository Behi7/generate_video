import { interpolate, Easing } from "remotion";

export interface StaggerStep {
  startFrame: number;
  durationFrames?: number; // default: 5 frames
  from: [number, number, number];
  to: [number, number, number];
}

export interface SnapResult {
  position: [number, number, number];
  hasLanded: boolean;
  isImpactFrame: boolean;
  impactOffset: number; // 0..4 during impact window for SparkBurst
}

/**
 * Computes high-velocity staggered magnetic snap-lock kinematics.
 * Enforces the Staggered Sequential Snap Law (4-5 frames rapid acceleration + instant clamp).
 */
export function computeSnapTransform(frame: number, step: StaggerStep): SnapResult {
  const dur = step.durationFrames ?? 5;
  const landFrame = step.startFrame + dur;

  if (frame < step.startFrame) {
    return {
      position: step.from,
      hasLanded: false,
      isImpactFrame: false,
      impactOffset: -1,
    };
  }

  if (frame >= landFrame) {
    const offset = frame - landFrame;
    return {
      position: step.to,
      hasLanded: true,
      isImpactFrame: offset === 0,
      impactOffset: offset <= 4 ? offset : -1,
    };
  }

  // Rapid bezier snap curve
  const progress = interpolate(frame, [step.startFrame, landFrame], [0, 1], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const x = step.from[0] + (step.to[0] - step.from[0]) * progress;
  const y = step.from[1] + (step.to[1] - step.from[1]) * progress;
  const z = step.from[2] + (step.to[2] - step.from[2]) * progress;

  return {
    position: [x, y, z],
    hasLanded: false,
    isImpactFrame: false,
    impactOffset: -1,
  };
}
