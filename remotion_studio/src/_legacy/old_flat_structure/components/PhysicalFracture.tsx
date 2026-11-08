import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export type FractureMode = "shear_and_tilt" | "fling_parabolic" | "shudder_and_crack";

export interface PhysicalFractureProps {
  children: React.ReactNode;
  breakFrame: number; // Local frame when fracture occurs (e.g. 265)
  mode?: FractureMode;
  impulse?: [number, number, number]; // Final offset displacement [dx, dy, dz]
  rotationImpulse?: [number, number, number]; // Final angular rotation [rx, ry, rz]
  sparkOrigin?: [number, number, number];
  sparkColor?: string;
  durationFrames?: number; // Duration of fall / fling trajectory (default: 15)
}

export const PhysicalFracture: React.FC<PhysicalFractureProps> = ({
  children,
  breakFrame,
  mode = "shear_and_tilt",
  impulse = [0.35, -0.45, 0.1],
  rotationImpulse = [0.4, 0, 1.2],
  sparkOrigin = [0, 0, 0],
  sparkColor = "#EF4444",
  durationFrames = 16,
}) => {
  const frame = useCurrentFrame();

  if (frame < breakFrame) {
    return <group>{children}</group>;
  }

  const endFrame = breakFrame + durationFrames;
  const progress = interpolate(frame, [breakFrame, endFrame], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let dx = 0;
  let dy = 0;
  let dz = 0;
  let rx = 0;
  let ry = 0;
  let rz = 0;

  if (mode === "fling_parabolic") {
    // Parabolic arc: launch up, accelerate down
    dx = impulse[0] * progress;
    dy = impulse[1] * progress * 2.2 - 2.8 * progress * progress;
    dz = impulse[2] * progress;
    rx = rotationImpulse[0] * progress * 2.5;
    ry = rotationImpulse[1] * progress * 2.5;
    rz = rotationImpulse[2] * progress * 2.5;
  } else if (mode === "shear_and_tilt") {
    // Drop onto bed and tilt
    dx = impulse[0] * progress;
    dy = impulse[1] * progress;
    dz = impulse[2] * progress;
    rx = rotationImpulse[0] * progress;
    ry = rotationImpulse[1] * progress;
    rz = rotationImpulse[2] * progress;
  } else if (mode === "shudder_and_crack") {
    // High-frequency seizure shudder then lock
    const shudder = Math.sin((frame - breakFrame) * 6.0) * 0.04 * Math.exp(-(frame - breakFrame) * 0.15);
    dx = shudder;
    dy = impulse[1] * progress * 0.1;
    rz = shudder * 0.5;
  }

  // Spark burst at fracture moment
  const isSparkActive = frame >= breakFrame && frame <= breakFrame + 4;
  const sparkOffset = frame - breakFrame;

  return (
    <group>
      <group position={[dx, dy, dz]} rotation={[rx, ry, rz]}>
        {children}
      </group>

      <SparkBurst
        active={isSparkActive}
        frameOffset={sparkOffset}
        position={sparkOrigin}
        color={sparkColor}
        scale={1.5}
        count={18}
      />
    </group>
  );
};
