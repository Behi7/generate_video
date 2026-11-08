import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { ShowroomEnvironment } from "../components/ShowroomEnvironment";
import { MicroHandPump } from "../components/MicroHandPump";
import { PistonPump } from "../components/PistonPump";
import { TurboPump } from "../components/TurboPump";
import { QuantumTurbine } from "../components/QuantumTurbine";
import { ShowroomHUD } from "../components/ShowroomHUD";

// Internal Three.js Camera Controller to ensure true lookAt along the showroom track
const CameraController: React.FC<{
  camX: number;
  camY: number;
  camZ: number;
  targetY: number;
}> = ({ camX, camY, camZ, targetY }) => {
  const { camera } = useThree();
  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX, targetY, 0);
  camera.updateProjectionMatrix();
  return null;
};

export const PumpProgression: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Spacing between stations: exactly 5.5 units
  // Station 1: x = 0
  // Station 2: x = 5.5
  // Station 3: x = 11.0
  // Station 4: x = 16.5

  // Eased camera glide along X
  const camX = interpolate(
    frame,
    [0, 300, 360, 630, 690, 960, 1030, 1380],
    [0, 0, 5.5, 5.5, 11.0, 11.0, 16.5, 16.5],
    {
      easing: Easing.bezier(0.35, 0, 0.25, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Camera height: perfectly vertically centered for 9:16 vertical video
  // Machines are rooted at y = -2.1 and extend up to y = -0.3.
  // Center is y = -1.1.
  const camY = -0.95;
  const targetY = -1.1;

  // Camera distance (Z): 4.8 for nice framing with margins, zooming to 4.2 at Stage 4
  const camZ = interpolate(
    frame,
    [0, 980, 1380],
    [4.85, 4.85, 4.2],
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
        backgroundColor: "#030712",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 1. Synchronized Multi-Layered ASMR Audio Master */}
      <Audio src={staticFile("audio/asmr_pump_progression.wav")} />

      {/* 2. 3D WebGL Showroom Arena */}
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
          targetY={targetY}
        />

        {/* Showroom Lighting & Mirror Floor */}
        <ShowroomEnvironment activeX={camX} />

        {/* Station 1 (x = 0): 10 ₽ Rusty Manual Lever Pump */}
        <MicroHandPump position={[0, -2.1, 0.1]} scale={1.25} />

        {/* Station 2 (x = 5.5): 100 ₽ Cast-Iron Piston & Spoked Flywheel */}
        <PistonPump position={[5.5, -2.1, 0.1]} scale={1.25} />

        {/* Station 3 (x = 11.0): 1 000 ₽ High-Pressure Turbo-Pump */}
        <TurboPump position={[11.0, -2.1, 0.1]} scale={1.25} />

        {/* Station 4 (x = 16.5): 100 000 ₽+ Quantum Reactor Turbine */}
        <QuantumTurbine position={[16.5, -2.1, 0.1]} scale={1.22} />
      </ThreeCanvas>

      {/* 3. Ultra-Minimalist Apple-Grade HUD */}
      <ShowroomHUD />
    </div>
  );
};
