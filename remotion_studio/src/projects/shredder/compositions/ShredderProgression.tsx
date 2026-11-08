import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "@shared/components/TestingBayEnvironment";
import { ShowroomHUD } from "@shared/components/ShowroomHUD";
import { RigidShowcaseCamera, ImpactShake } from "@shared/components/RigidShowcaseCamera";
import { ShredderStage } from "../components/ShredderStage";

export const ShredderProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Canonical impact shakes across the 4 tiers (Assembly snaps, trigger clacks, fractures)
  const impacts: ImpactShake[] = [
    // Tier 1 ($10): Manual Hand-Crank Desk Shredder (Frames 0..289)
    { frame: 0, duration: 4, intensity: 0.035 }, // Order 0: Base Clamp Land
    { frame: 20, duration: 4, intensity: 0.03 }, // Order 1: Core Dual Hex Shafts Dock
    { frame: 40, duration: 4, intensity: 0.035 }, // Order 2: Skeleton Frame & Strippers Snap
    { frame: 60, duration: 4, intensity: 0.03 }, // Order 3: Brass Hand-Crank & Gears Snap
    { frame: 75, duration: 4, intensity: 0.035 }, // Order 4: Toolhead Cutters Lock
    { frame: 265, duration: 7, intensity: 0.065 }, // Catastrophic Overload Fracture

    // Tier 2 ($100): Workshop Electric Twin-Shaft Shredder (Frames 290..579)
    { frame: 290, duration: 4, intensity: 0.035 }, // Order 0: Tubular Chassis Bed Land
    { frame: 310, duration: 4, intensity: 0.03 }, // Order 1: Hex Shafts & Spur Gears Dock
    { frame: 330, duration: 4, intensity: 0.035 }, // Order 2: Heavy Steel Housing Snap
    { frame: 350, duration: 4, intensity: 0.03 }, // Order 3: Induction Motor & Chain Drive Snap
    { frame: 365, duration: 4, intensity: 0.035 }, // Order 4: Hopper & Safety Baffle Lock
    { frame: 555, duration: 7, intensity: 0.065 }, // Drive Chain Rupture & Motor Mount Shear

    // Tier 3 ($1 000): Heavy Industrial 2-Shaft Shredder (Frames 580..869)
    { frame: 580, duration: 5, intensity: 0.04 }, // Order 0: Heavy Cast Monolith Bed Land
    { frame: 600, duration: 4, intensity: 0.035 }, // Order 1: Dual Hex Shafts & Bearings Dock
    { frame: 620, duration: 4, intensity: 0.035 }, // Order 2: Armored Chamber Housing Snap
    { frame: 640, duration: 4, intensity: 0.035 }, // Order 3: Dual Hydraulic Motors & Manifold Snap
    { frame: 655, duration: 5, intensity: 0.04 }, // Order 4: Reinforced Infeed Funnel Lock
    { frame: 845, duration: 8, intensity: 0.075 }, // 600-Bar Hydraulic Hose Blowout

    // Tier 4 ($100 000+): Quantum Magnetic Plasma Disintegrator (Frames 870..1159)
    { frame: 870, duration: 5, intensity: 0.045 }, // Order 0: Anti-Gravity Monolithic Pedestal Land
    { frame: 890, duration: 4, intensity: 0.04 }, // Order 1: Singularity Compression Rollers Dock
    { frame: 910, duration: 4, intensity: 0.04 }, // Order 2: Quantum Toroid Stator Housing Snap
    { frame: 930, duration: 4, intensity: 0.045 }, // Order 3: Cryogenic Conduit & Solenoids Snap
    { frame: 945, duration: 6, intensity: 0.06 }, // Order 4: Plasma Hopper & Containment Field Lock
    { frame: 1135, duration: 9, intensity: 0.085 }, // Quantum Spacetime Singularity Collapse
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
      <Audio src={staticFile("audio/asmr_shredder_progression.wav")} />

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
        <ShredderStage />
      </ThreeCanvas>

      {/* 3. Single-Island Minimalist Zero-Language HUD */}
      <ShowroomHUD />
    </div>
  );
};
