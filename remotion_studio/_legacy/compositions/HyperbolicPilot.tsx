import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { DarkMirrorRoom } from "../components/DarkMirrorRoom";
import { MicroHandPump } from "../components/MicroHandPump";
import { QuantumTurbine } from "../components/QuantumTurbine";
import { HyperbolicHUD } from "../components/HyperbolicHUD";

export const HyperbolicPilot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Cinematic slow camera push
  const camX = Math.sin(frame * 0.008) * 0.06;
  const camY = -0.05 + Math.cos(frame * 0.01) * 0.02;
  const camZ = 7.5 - frame * 0.002;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#04060A",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D WebGL Mechanical Arena */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: [camX, camY, camZ],
          fov: 48,
          near: 0.1,
          far: 50,
        }}
      >
        {/* Dark Reflective Studio Floor with Real-Time Mirrors */}
        <DarkMirrorRoom />

        {/* Machine 1 (Left): Rusty Laborious Hand Pump */}
        <group position={[0.08, 0, 0]}>
          <MicroHandPump />
        </group>

        {/* Machine 2 (Right): High-RPM Quantum Plasma Centrifugal Turbine */}
        <group position={[0.08, 0, 0]}>
          <QuantumTurbine />
        </group>
      </ThreeCanvas>

      {/* Ultra-Minimal Kinetic Typography & Comparative HUD */}
      <HyperbolicHUD />
    </div>
  );
};
