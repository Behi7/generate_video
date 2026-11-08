import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "@shared/components/TestingBayEnvironment";
import { ShowroomHUD } from "@shared/components/ShowroomHUD";
import { RigidShowcaseCamera, ImpactShake } from "@shared/components/RigidShowcaseCamera";
import { CrusherStage } from "../components/CrusherStage";

export const CrusherProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Canonical impact shakes across the 4 tiers (Assembly snaps, trigger clacks, fractures)
  const impacts: ImpactShake[] = [
    // Tier 1 ($10): Manual Screw Crusher
    { frame: 0, duration: 4, intensity: 0.035 }, // Anvil bed land
    { frame: 20, duration: 4, intensity: 0.03 }, // Column snap
    { frame: 40, duration: 4, intensity: 0.03 }, // Upper bridge snap
    { frame: 60, duration: 4, intensity: 0.035 }, // Screw drop & handle snap
    { frame: 265, duration: 7, intensity: 0.06 }, // Frame fracture on overload

    // Tier 2 ($100): Motor Piston Crusher
    { frame: 290, duration: 4, intensity: 0.035 }, // Bed landing
    { frame: 310, duration: 4, intensity: 0.03 }, // Guide tower snap
    { frame: 330, duration: 4, intensity: 0.035 }, // 2-stroke engine snap
    { frame: 350, duration: 4, intensity: 0.035 }, // Hammer ram dock
    { frame: 370, duration: 3, intensity: 0.025 }, // Starter pull & choke clack
    { frame: 555, duration: 7, intensity: 0.065 }, // Connecting rod snap & chain rupture

    // Tier 3 ($1 000): 100-Ton Hydraulic Portal Crusher
    { frame: 580, duration: 5, intensity: 0.04 }, // Portal columns land
    { frame: 600, duration: 4, intensity: 0.035 }, // Hydraulic ram dock
    { frame: 620, duration: 4, intensity: 0.035 }, // Manifold & hoses dock
    { frame: 640, duration: 4, intensity: 0.035 }, // Carbide platen dock
    { frame: 660, duration: 3, intensity: 0.03 }, // Red mushroom button press
    { frame: 845, duration: 8, intensity: 0.07 }, // 500-Bar hydraulic blowout

    // Tier 4 ($100 000+): Quantum Magnetic Plasma Crusher
    { frame: 870, duration: 5, intensity: 0.045 }, // Monolithic chassis dock
    { frame: 890, duration: 4, intensity: 0.04 }, // Superconducting toroids snap
    { frame: 910, duration: 4, intensity: 0.04 }, // Laser compression head dock
    { frame: 930, duration: 6, intensity: 0.065 }, // Armored cryo cable slam
    { frame: 1135, duration: 9, intensity: 0.085 }, // Singularity collapse shockwave
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
      <Audio src={staticFile("audio/asmr_crusher_progression.wav")} />

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
          basePosition={[2.3, 1.8, 3.6]}
          target={[0, -0.35, 0]}
          impacts={impacts}
        />
        <TestingBayEnvironment />
        <CrusherStage />
      </ThreeCanvas>

      {/* 3. Single-Island Minimalist Zero-Language HUD */}
      <ShowroomHUD />
    </div>
  );
};