import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { ShowroomHUD } from "../components/ShowroomHUD";
import { RigidShowcaseCamera, ImpactShake } from "../components/RigidShowcaseCamera";
import { DrillStage } from "../components/DrillStage";

export const DrillProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Canonical impact shakes across the 4 tiers (Assembly snaps, trigger clacks, fractures)
  const impacts: ImpactShake[] = [
    // Tier 1 ($10): Auger Drill
    { frame: 0, duration: 4, intensity: 0.035 }, // Vise clamp
    { frame: 25, duration: 4, intensity: 0.03 }, // Auger spiral snap
    { frame: 50, duration: 4, intensity: 0.035 }, // T-handle snap
    { frame: 265, duration: 6, intensity: 0.055 }, // Shaft crack & handle fling

    // Tier 2 ($100): Gas Motor Drill
    { frame: 290, duration: 5, intensity: 0.04 }, // Sled frame bed landing
    { frame: 310, duration: 4, intensity: 0.035 }, // 2-stroke engine snap
    { frame: 330, duration: 4, intensity: 0.035 }, // Chain gearbox snap
    { frame: 350, duration: 4, intensity: 0.03 }, // Carbide bit dock
    { frame: 370, duration: 3, intensity: 0.025 }, // Clutch lever clack
    { frame: 555, duration: 6, intensity: 0.06 }, // Shear pin snap & chain whip

    // Tier 3 ($1 000): Diamond Core Drill
    { frame: 580, duration: 5, intensity: 0.045 }, // Blue vertical column land
    { frame: 600, duration: 4, intensity: 0.035 }, // Motor carrier dock
    { frame: 620, duration: 4, intensity: 0.035 }, // Water manifold snap
    { frame: 640, duration: 4, intensity: 0.03 }, // Diamond barrel bit dock
    { frame: 660, duration: 3, intensity: 0.025 }, // Red mushroom button thwack
    { frame: 845, duration: 7, intensity: 0.065 }, // Hose blowout & motor shear

    // Tier 4 ($100 000+): Plasma Tunnel Shield
    { frame: 870, duration: 5, intensity: 0.045 }, // Titanium shield housing dock
    { frame: 895, duration: 4, intensity: 0.035 }, // Rotary cutter head dock
    { frame: 920, duration: 4, intensity: 0.035 }, // Cryo manifold clamp
    { frame: 950, duration: 6, intensity: 0.065 }, // Armored cable plug slam
  ];

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
      {/* 1. Synchronized Procedural ASMR Audio Master (1160 frames @ 30 FPS) */}
      <Audio src={staticFile("audio/asmr_drill_progression.wav")} />

      {/* 2. 3D WebGL Arena with Locked 2.5D 3/4 Isometric Perspective */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          fov: 42,
          near: 0.1,
          far: 60,
        }}
      >
        <RigidShowcaseCamera
          basePosition={[2.3, 1.8, 3.6]}
          target={[0, -0.35, 0]}
          impacts={impacts}
        />
        <TestingBayEnvironment />
        <DrillStage />
      </ThreeCanvas>

      {/* 3. Single-Island Minimalist Zero-Language HUD */}
      <ShowroomHUD />
    </div>
  );
};
