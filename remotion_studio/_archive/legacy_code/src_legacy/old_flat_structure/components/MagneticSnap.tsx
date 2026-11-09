import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export type SnapDirection = "top" | "bottom" | "left" | "right" | "front" | "back";

export interface MagneticSnapProps {
  children: React.ReactNode;
  snapFrame: number; // Local frame when part locks into place (e.g. 20, 40, 60)
  duration?: number; // Travel duration in frames (default: 5)
  from?: SnapDirection | [number, number, number];
  target?: [number, number, number];
  distance?: number; // Distance offset if using direction string (default: 3.5)
  sparkColor?: string;
  sparkCount?: number;
  overshoot?: boolean; // Subtle metallic bounce on lock
}

export const MagneticSnap: React.FC<MagneticSnapProps> = ({
  children,
  snapFrame,
  duration = 5,
  from = "top",
  target = [0, 0, 0],
  distance = 3.5,
  sparkColor = "#FBBF24",
  sparkCount = 14,
  overshoot = true,
}) => {
  const frame = useCurrentFrame();
  const startFrame = snapFrame - duration;

  // Don't render part before its arrival window starts
  if (frame < startFrame) {
    return null;
  }

  // Calculate start position
  let startPos: [number, number, number];
  if (Array.isArray(from)) {
    startPos = from;
  } else {
    switch (from) {
      case "top":
        startPos = [target[0], target[1] + distance, target[2]];
        break;
      case "bottom":
        startPos = [target[0], target[1] - distance, target[2]];
        break;
      case "left":
        startPos = [target[0] - distance, target[1], target[2]];
        break;
      case "right":
        startPos = [target[0] + distance, target[1], target[2]];
        break;
      case "front":
        startPos = [target[0], target[1], target[2] + distance];
        break;
      case "back":
        startPos = [target[0], target[1], target[2] - distance];
        break;
    }
  }

  // Trajectory interpolation
  let curX = target[0];
  let curY = target[1];
  let curZ = target[2];
  let scale = 1;

  if (frame < snapFrame) {
    const progress = interpolate(frame, [startFrame, snapFrame], [0, 1], {
      easing: Easing.bezier(0.05, 0.9, 0.1, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    curX = startPos[0] + (target[0] - startPos[0]) * progress;
    curY = startPos[1] + (target[1] - startPos[1]) * progress;
    curZ = startPos[2] + (target[2] - startPos[2]) * progress;
  } else if (overshoot && frame < snapFrame + 6) {
    // 6-frame micro elastic spring ring (1.02 -> 0.99 -> 1.0)
    const bounceOffset = frame - snapFrame;
    const bounceAmp = 0.03 * Math.exp(-bounceOffset * 0.5) * Math.sin(bounceOffset * Math.PI);
    scale = 1 + bounceAmp;
  }

  // Impact spark timing (5-frame life)
  const isImpactActive = frame >= snapFrame && frame <= snapFrame + 4;
  const impactOffset = frame - snapFrame;

  return (
    <group>
      <group position={[curX, curY, curZ]} scale={[scale, scale, scale]}>
        {children}
      </group>

      {/* Automatic synchronized contact spark burst */}
      <SparkBurst
        active={isImpactActive}
        frameOffset={impactOffset}
        position={target}
        color={sparkColor}
        scale={1.2}
        count={sparkCount}
      />
    </group>
  );
};
