import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { MicroHandPump } from "./MicroHandPump";
import { PistonPump } from "./PistonPump";
import { TurboPump } from "./TurboPump";
import { QuantumTurbine } from "./QuantumTurbine";

export const TransformingStage: React.FC = () => {
  const frame = useCurrentFrame();

  // --- STAGE 1: Rusty Hand Pump (0 - 360 frames) ---
  // Active: 0 - 300. Dismantles into floor: 300 - 350
  const pump1Y = interpolate(frame, [0, 300, 350], [-2.1, -2.1, -5.0], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showPump1 = frame < 360;

  // --- STAGE 2: Piston Pump (330 - 740 frames) ---
  // Deploys from floor: 330 - 388. Active: 390 - 690. Retracts: 690 - 740
  const pump2Y = interpolate(
    frame,
    [330, 388, 690, 740],
    [-5.0, -2.1, -2.1, -5.0],
    {
      easing: Easing.bezier(0.35, 0, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const showPump2 = frame >= 320 && frame < 750;

  // --- STAGE 3: Centrifugal Turbo-Pump (710 - 1140 frames) ---
  // Deploys: 710 - 778. Active: 780 - 1080. Retracts: 1080 - 1135
  const pump3Y = interpolate(
    frame,
    [710, 778, 1080, 1135],
    [-5.0, -2.1, -2.1, -5.0],
    {
      easing: Easing.bezier(0.35, 0, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const showPump3 = frame >= 700 && frame < 1140;

  // --- STAGE 4: Quantum Reactor Turbine (1100 - 1440 frames) ---
  // Deploys: 1100 - 1168. Climax: 1170 - 1440
  const pump4Y = interpolate(frame, [1100, 1168, 1440], [-5.0, -2.1, -2.1], {
    easing: Easing.bezier(0.35, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showPump4 = frame >= 1090;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Rusty Manual Lever Pump */}
      {showPump1 && (
        <group position={[0, pump1Y + 2.1, 0]}>
          <MicroHandPump position={[0, -2.1, 0]} scale={1.25} />
        </group>
      )}

      {/* 2. Cast-Iron Piston & Spoked Flywheel */}
      {showPump2 && (
        <group position={[0, pump2Y + 2.1, 0]}>
          <PistonPump position={[0, -2.1, 0]} scale={1.22} />
        </group>
      )}

      {/* 3. Centrifugal Turbo-Pump */}
      {showPump3 && (
        <group position={[0, pump3Y + 2.1, 0]}>
          <TurboPump position={[0, -2.1, 0]} scale={1.22} />
        </group>
      )}

      {/* 4. Quantum Reactor Turbine */}
      {showPump4 && (
        <group position={[0, pump4Y + 2.1, 0]}>
          <QuantumTurbine position={[0, -2.1, 0]} scale={1.22} />
        </group>
      )}
    </group>
  );
};
