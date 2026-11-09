import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  Audio,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { GeneratorStage } from "../components/GeneratorStage";
import { ShowroomHUD } from "../components/ShowroomHUD";

// Camera Controller with subtle impact micro-shakes on docking, triggers & destructions
const CameraController: React.FC<{
  camX: number;
  camY: number;
  camZ: number;
  targetY: number;
}> = ({ camX, camY, camZ, targetY }) => {
  const { camera } = useThree();
  camera.position.set(camX, camY, camZ);
  camera.lookAt(0, targetY, 0);
  camera.updateProjectionMatrix();
  return null;
};

export const GeneratorProgression: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Subtle physical camera shakes on assembly snaps, triggers & destruction events
  let shakeX = 0;
  let shakeY = 0;

  // 1. Hand Dynamo handle snap & bulb pop (frames 115 - 124)
  if (frame >= 115 && frame <= 124) {
    const decay = 1 - (frame - 115) / 9;
    shakeX = Math.sin(frame * 2.8) * 0.035 * decay;
    shakeY = Math.cos(frame * 3.2) * 0.025 * decay;
  }
  // Snap impact: Piston Generator magnetic clamp (frames 133 - 136)
  else if (frame >= 133 && frame <= 136) {
    const decay = 1 - (frame - 133) / 3;
    shakeX = Math.sin(frame * 4.5) * 0.028 * decay;
    shakeY = Math.cos(frame * 4.8) * 0.022 * decay;
  }
  // Trigger 1: Brass throw-lever on cast bed (frames 180 - 183)
  else if (frame >= 180 && frame <= 183) {
    const decay = 1 - (frame - 180) / 3;
    shakeX = Math.sin(frame * 4.0) * 0.02 * decay;
    shakeY = Math.cos(frame * 4.2) * 0.015 * decay;
  }
  // Destruction 2: Flywheel blowout & cylinder fracture (frames 300 - 309)
  else if (frame >= 300 && frame <= 309) {
    const decay = 1 - (frame - 300) / 9;
    shakeX = Math.sin(frame * 3.0) * 0.045 * decay;
    shakeY = Math.cos(frame * 3.5) * 0.035 * decay;
  }
  // Snap impact: Turbo Generator magnetic clamp (frames 316 - 319)
  else if (frame >= 316 && frame <= 319) {
    const decay = 1 - (frame - 316) / 3;
    shakeX = Math.sin(frame * 4.5) * 0.03 * decay;
    shakeY = Math.cos(frame * 4.8) * 0.025 * decay;
  }
  // Trigger 2: Red mushroom button depression (frames 360 - 363)
  else if (frame >= 360 && frame <= 363) {
    const decay = 1 - (frame - 360) / 3;
    shakeX = Math.sin(frame * 4.0) * 0.022 * decay;
    shakeY = Math.cos(frame * 4.2) * 0.018 * decay;
  }
  // Destruction 3: 150-bar blowout valve explosion & steam eruption (frames 495 - 504)
  else if (frame >= 495 && frame <= 504) {
    const decay = 1 - (frame - 495) / 9;
    shakeX = Math.sin(frame * 3.2) * 0.06 * decay;
    shakeY = Math.cos(frame * 3.8) * 0.045 * decay;
  }
  // Snap impact: Tokamak core magnetic clamp (frames 514 - 517)
  else if (frame >= 514 && frame <= 517) {
    const decay = 1 - (frame - 514) / 3;
    shakeX = Math.sin(frame * 4.5) * 0.035 * decay;
    shakeY = Math.cos(frame * 4.8) * 0.028 * decay;
  }
  // Trigger 3: Heavy armored cable plug slam & electric arc (frames 560 - 568)
  else if (frame >= 560 && frame <= 568) {
    const decay = 1 - (frame - 560) / 8;
    shakeX = Math.sin(frame * 4.2) * 0.05 * decay;
    shakeY = Math.cos(frame * 4.5) * 0.04 * decay;
  }

  // Smooth camera position with slow cinematic climax push during frames 560 - 720
  const camX = Math.sin(frame * 0.02) * 0.03 + shakeX;
  const camY = -0.95 + Math.cos(frame * 0.015) * 0.012 + shakeY;

  const camZ = interpolate(
    frame,
    [0, 560, 720],
    [4.85, 4.85, 4.15],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0F172A",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 1. Synchronized Generator Evolution Audio Master */}
      <Audio src={staticFile("audio/asmr_generator_progression.wav")} />

      {/* 2. 3D WebGL Testing Bay Arena */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          fov: 44,
          near: 0.1,
          far: 60,
        }}
      >
        <CameraController
          camX={camX}
          camY={camY}
          camZ={camZ}
          targetY={-1.1}
        />

        {/* High-Key Testing Bay Cleanroom with LED Pillars */}
        <TestingBayEnvironment />

        {/* In-Place Modular Destruction & Generator Assembly Progression Stage */}
        <GeneratorStage />
      </ThreeCanvas>

      {/* 3. Ultra-Clean Apple-Grade Frosted Glass HUD (Zero Words, Universal Currency/Multiplier) */}
      <ShowroomHUD />
    </div>
  );
};
