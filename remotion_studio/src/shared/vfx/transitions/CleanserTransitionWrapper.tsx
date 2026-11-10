import React from "react";
import { TransitionEffectType } from "./TransitionRegistry";
import { AshDisintegration } from "./AshDisintegration";
import { LaserScanCleanser } from "./LaserScanCleanser";
import { PneumaticAirBlast } from "./PneumaticAirBlast";
import { BlackHoleSingularity } from "./BlackHoleSingularity";

export interface CleanserTransitionWrapperProps {
  effect?: TransitionEffectType | "laser_scan" | "none";
  localFrame: number;
  breakFrame?: number; // Default: 234
  endFrame?: number; // Default: 308
  position?: [number, number, number];
  bounds?: { minY?: number; maxY?: number };
  seed?: string;
  children?: React.ReactNode;
}

/**
 * CleanserTransitionWrapper:
 * Dynamic wrapper component that applies the assigned cleanser transition effect to children.
 * Seamlessly transitions destroyed machinery off the stage between frames 234 and 307,
 * guaranteeing a 100% clean, settled stage with zero ghost meshes by frame 308..319.
 */
export const CleanserTransitionWrapper: React.FC<CleanserTransitionWrapperProps> = ({
  effect = "ash_disintegration",
  localFrame,
  breakFrame = 234,
  endFrame = 308,
  position = [0, 0, 0],
  bounds = { minY: 0.0, maxY: 2.75 },
  seed,
  children,
}) => {
  // Post-transition: clean stage guarantee for ash / laser / pneumatic / black hole
  if (localFrame >= endFrame) {
    return null;
  }

  // Pre-break: render children normally
  if (localFrame < breakFrame) {
    return <group position={position}>{children}</group>;
  }

  const effectiveMinY = bounds.minY ?? 0.0;
  const effectiveMaxY = bounds.maxY ?? 2.75;
  const midHeight = (effectiveMinY + effectiveMaxY) * 0.5;

  switch (effect) {
    case "ash_disintegration":
      return (
        <AshDisintegration
          localFrame={localFrame}
          breakFrame={breakFrame}
          endFrame={endFrame}
          position={position}
          bedY={effectiveMinY}
        >
          {children}
        </AshDisintegration>
      );

    case "laser_scan_cleanser":
    case "laser_scan":
      return (
        <LaserScanCleanser
          localFrame={localFrame}
          breakFrame={breakFrame}
          endFrame={endFrame}
          position={position}
          bounds={bounds}
        >
          {children}
        </LaserScanCleanser>
      );

    case "pneumatic_air_blast":
      return (
        <PneumaticAirBlast
          localFrame={localFrame}
          blastFrame={breakFrame}
          endFrame={endFrame}
          origin={position}
          floorY={effectiveMinY}
        >
          {children}
        </PneumaticAirBlast>
      );

    case "black_hole_singularity":
      return (
        <BlackHoleSingularity
          localFrame={localFrame}
          breakFrame={breakFrame}
          endFrame={endFrame}
          position={position}
          singularityHeight={midHeight}
        >
          {children}
        </BlackHoleSingularity>
      );

    case "none":
    default:
      return <group position={position}>{children}</group>;
  }
};
