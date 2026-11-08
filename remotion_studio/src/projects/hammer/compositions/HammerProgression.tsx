import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { DynamicEnvironment } from "@shared/environment/DynamicEnvironment";
import { ShowroomHUD } from "@shared/components/ShowroomHUD";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { CinematicOverlay } from "@shared/components/CinematicOverlay";
import { HammerStage } from "../components/HammerStage";
import { computeProjectImpacts } from "@shared/contracts/AssemblyContract";
import { HammerTier1Spec } from "../components/HammerTier1_Manual";
import { HammerTier2Spec } from "../components/HammerTier2_Electric";
import { HammerTier3Spec } from "../components/HammerTier3_Hydraulic";
import { HammerTier4Spec } from "../components/HammerTier4_Futuristic";

export const HammerProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Single Source of Truth: dynamic camera impacts computed directly from assembly specs
  const impacts = computeProjectImpacts([
    HammerTier1Spec,
    HammerTier2Spec,
    HammerTier3Spec,
    HammerTier4Spec,
  ]);

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
      <Audio src={staticFile("audio/asmr_hammer_progression.wav")} />

      {/* 2. 3D WebGL Arena with Locked 2.5D 3/4 Isometric Heroic Perspective */}
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
          basePosition={[1.85, 0.45, 2.90]}
          target={[0, -1.25, 0]}
          impacts={impacts}
        />
        <DynamicEnvironment theme="dark_studio" />
        <HammerStage />
      </ThreeCanvas>

      {/* 3. Universal Cinematic 2D Post-Processing Layer (35mm Grain, Vignette, Aberration) */}
      <CinematicOverlay />

      {/* 4. Single-Island Minimalist Zero-Language HUD (Anti-Desync & Procedural Values) */}
      <ShowroomHUD
        seed="hydraulic_hammer_evolution"
        contactFrames={[160, 156, 168, 160]}
      />
    </div>
  );
};
