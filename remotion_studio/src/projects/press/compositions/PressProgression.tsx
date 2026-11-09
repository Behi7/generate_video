import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { DynamicEnvironment } from "@shared/environment/DynamicEnvironment";
import { ShowroomHUD } from "@shared/components/ShowroomHUD";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { CinematicOverlay } from "@shared/components/CinematicOverlay";
import { TIER_DURATION_FRAMES } from "@shared/contracts/StageTimeline";
import { PressStage } from "../components/PressStage";
import { computeProjectImpacts } from "@shared/contracts/AssemblyContract";
import { PressTier1Spec } from "../components/PressTier1_Manual";
import { PressTier2Spec } from "../components/PressTier2_Electric";
import { PressTier3Spec } from "../components/PressTier3_Hydraulic";
import { PressTier4Spec } from "../components/PressTier4_Futuristic";

export const PressProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Single Source of Truth: dynamic camera impacts computed directly from assembly specs
  // Enforces Triple Synchronization Law (Camera == Physics == Audio)
  const impacts = computeProjectImpacts([
    PressTier1Spec,
    PressTier2Spec,
    PressTier3Spec,
    PressTier4Spec,
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
      {/* 1. Synchronized Procedural ASMR Audio Master (1280 frames @ 30 FPS) */}
      <Audio src={staticFile("audio/asmr_press_progression.wav")} />

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
          enableClimaxPush={true}
          tierDuration={TIER_DURATION_FRAMES}
          impacts={impacts}
        />
        <DynamicEnvironment theme="factory" />
        <PressStage />
      </ThreeCanvas>

      {/* 3. Universal Cinematic 2D Post-Processing Layer (35mm Grain, Vignette, Aberration) */}
      <CinematicOverlay />

      {/* 4. Single-Island Minimalist Zero-Language HUD (Anti-Desync & Procedural Values) */}
      <ShowroomHUD
        seed="hydraulic_press_progression"
        contactFrames={[134, 127, 134, 133]}
      />
    </div>
  );
};

export default PressProgression;
