import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { DarkMirrorRoom } from "../components/DarkMirrorRoom";
import { GlowStickman } from "../components/GlowStickman";
import { NeonPipe } from "../components/NeonPipe";
import { KineticText } from "../components/KineticText";

export const PilotViral: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Cinematic slow camera orbit with subtle vertical drift & slow dolly in
  const camX = Math.sin(frame * 0.012) * 0.2;
  const camY = -0.32 + Math.cos(frame * 0.016) * 0.03;
  const camZ = 6.9 - frame * 0.0025;

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
      {/* 3D WebGL Scene */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: [camX, camY, camZ],
          fov: 46,
          near: 0.1,
          far: 50,
        }}
      >
        {/* Dark Reflective Studio Room with Real-Time Mirror Floor */}
        <DarkMirrorRoom />

        {/* Character A: Carrying heavy buckets in hands on the left */}
        <group position={[-0.8, -2.1, 0.1]}>
          <GlowStickman pose="carrying" glowColor="#E2E8F0" />

          {/* Left bucket held in hand */}
          <group position={[-0.28, 0.52, 0.08]}>
            {/* Handle wire */}
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
            {/* Bucket body */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.14, 0.11, 0.32, 24]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Glowing water */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.13, 24]} />
              <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={2.8} />
            </mesh>
          </group>

          {/* Right bucket held in hand */}
          <group position={[0.28, 0.52, 0.08]}>
            {/* Handle wire */}
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
            {/* Bucket body */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.14, 0.11, 0.32, 24]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Glowing water */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.13, 24]} />
              <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={2.8} />
            </mesh>
          </group>
        </group>

        {/* Character B: Relaxed, sitting on modern pedestal by glowing pipeline */}
        <group position={[0.12, -2.1, 0.1]}>
          {/* Minimalist Studio Cube Seat with glowing base rim */}
          <mesh position={[0, 0.35, -0.05]}>
            <boxGeometry args={[0.42, 0.7, 0.42]} />
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, -0.05]}>
            <boxGeometry args={[0.45, 0.04, 0.45]} />
            <meshStandardMaterial color="#00D2FC" emissive="#00D2FC" emissiveIntensity={2.5} />
          </mesh>

          <GlowStickman
            pose="sitting"
            glowColor="#FFFFFF"
          />
        </group>

        {/* Glowing Neon Fluid Conduit Pipe & Barrel on the right */}
        <NeonPipe />
      </ThreeCanvas>

      {/* Kinetic Typography Overlays with Spring Physics & Dynamic Live Counters */}
      <KineticText
        hook="ВЁДРА ИЛИ ТРУБА?"
        subHook="КУДА УХОДИТ ТВОЁ ВРЕМЯ"
        leftBadge="РАБОТА ЗА ЧАСЫ"
        rightBadge="СИСТЕМА"
        startFrame={6}
      />
    </div>
  );
};
