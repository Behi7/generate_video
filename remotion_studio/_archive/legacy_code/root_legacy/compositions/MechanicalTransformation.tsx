import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { TransformingStage } from "../components/TransformingStage";
import { PhysicalControlConsole } from "../components/PhysicalControlConsole";
import { ShowroomHUD } from "../components/ShowroomHUD";

// Internal Three.js Camera Controller
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

export const MechanicalTransformation: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Gentle micro-sway for life, and dramatic slow push-in at Stage 4
  const camX = Math.sin(frame * 0.012) * 0.04;
  const camY = -0.95 + Math.cos(frame * 0.01) * 0.015;

  const camZ = interpolate(
    frame,
    [0, 1170, 1440],
    [4.9, 4.9, 4.2],
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
      {/* 1. Synchronized Multi-Layered ASMR Audio Master */}
      <Audio src={staticFile("audio/asmr_transformation.wav")} />

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

        {/* Modular In-Place Transforming Stage */}
        <TransformingStage />

        {/* Physical Industrial Control Console with 3 Triggers */}
        <PhysicalControlConsole />
      </ThreeCanvas>

      {/* 3. Ultra-Clean Apple-Grade Frosted Glass HUD */}
      <ShowroomHUD />
    </div>
  );
};
