import React from "react";
import { useVideoConfig, staticFile, Audio } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { DynamicEnvironment } from "../components/environment/DynamicEnvironment";
import { ShowroomHUD } from "../components/ShowroomHUD";
import { RigidShowcaseCamera, ImpactShake } from "../components/RigidShowcaseCamera";
import { HammerStage } from "../components/HammerStage";

export const HammerProgression: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Canonical impact shakes across the 4 tiers (Assembly snaps, hammer strikes, triggers, and fractures)
  const impacts: ImpactShake[] = [
    // Tier 1 ($10): Manual Sledge Hammer (Frames 0..289)
    { frame: 0, duration: 4, intensity: 0.03 },    // Anvil base land
    { frame: 20, duration: 4, intensity: 0.03 },   // Hardwood shaft dock
    { frame: 40, duration: 4, intensity: 0.035 },  // Steel collar snap
    { frame: 60, duration: 4, intensity: 0.03 },   // Fixing wedge drive
    { frame: 75, duration: 4, intensity: 0.035 },  // Sledge head lock
    { frame: 110, duration: 5, intensity: 0.045 }, // Strike 1
    { frame: 150, duration: 5, intensity: 0.045 }, // Strike 2
    { frame: 190, duration: 5, intensity: 0.05 },  // Strike 3
    { frame: 230, duration: 5, intensity: 0.05 },  // Strike 4
    { frame: 265, duration: 7, intensity: 0.065 }, // Fracture / handle splinter

    // Tier 2 ($100): Electric Rotary Jackhammer (Frames 290..579)
    { frame: 290, duration: 4, intensity: 0.035 }, // Base chassis land
    { frame: 310, duration: 4, intensity: 0.03 },  // Motor stator dock
    { frame: 330, duration: 4, intensity: 0.035 }, // Gear casing snap
    { frame: 350, duration: 4, intensity: 0.03 },  // Piston crank snap
    { frame: 365, duration: 4, intensity: 0.035 }, // SDS chisel lock
    { frame: 370, duration: 3, intensity: 0.025 }, // Trigger switch clack
    { frame: 410, duration: 4, intensity: 0.04 },  // Rapid percussive burst
    { frame: 450, duration: 4, intensity: 0.04 },  // Rapid percussive burst
    { frame: 490, duration: 4, intensity: 0.045 }, // Rapid percussive burst
    { frame: 530, duration: 5, intensity: 0.05 },  // Strain spike
    { frame: 555, duration: 7, intensity: 0.07 },  // Gearbox shear & blowout

    // Tier 3 ($1,000): Industrial Hydraulic Power Hammer (Frames 580..869)
    { frame: 580, duration: 5, intensity: 0.04 },  // H-frame monolith land
    { frame: 600, duration: 4, intensity: 0.035 }, // Hydraulic ram dock
    { frame: 620, duration: 4, intensity: 0.04 },  // Press gantry snap
    { frame: 640, duration: 4, intensity: 0.035 }, // Valve manifold dock
    { frame: 655, duration: 5, intensity: 0.04 },  // Forging die toolhead lock
    { frame: 660, duration: 3, intensity: 0.03 },  // Hydraulic pilot valve trigger
    { frame: 700, duration: 6, intensity: 0.055 }, // High-tonnage forge impact 1
    { frame: 740, duration: 6, intensity: 0.06 },  // High-tonnage forge impact 2
    { frame: 780, duration: 6, intensity: 0.065 }, // High-tonnage forge impact 3
    { frame: 820, duration: 6, intensity: 0.07 },  // Peak pressure impact 4
    { frame: 845, duration: 8, intensity: 0.08 },  // 600-Bar hydraulic seal rupture

    // Tier 4 ($100,000+): Quantum Kinetic Rail-Hammer (Frames 870..1159)
    { frame: 870, duration: 5, intensity: 0.045 }, // Maglev bed land
    { frame: 890, duration: 4, intensity: 0.04 },  // Linear accelerator dock
    { frame: 895, duration: 5, intensity: 0.045 }, // Cryo jacket lock
    { frame: 910, duration: 4, intensity: 0.04 },  // Capacitor banks snap
    { frame: 930, duration: 4, intensity: 0.045 }, // Magnetic tip lock
    { frame: 950, duration: 6, intensity: 0.065 }, // High-voltage cable plug slam
    { frame: 990, duration: 6, intensity: 0.06 },  // Relativistic strike 1
    { frame: 1030, duration: 6, intensity: 0.065 },// Relativistic strike 2
    { frame: 1070, duration: 7, intensity: 0.07 },  // Relativistic strike 3
    { frame: 1110, duration: 7, intensity: 0.075 }, // Flux overload strike 4
    { frame: 1135, duration: 9, intensity: 0.09 },  // Quantum singularity core collapse
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

      {/* 3. Single-Island Minimalist Zero-Language HUD */}
      <ShowroomHUD />
    </div>
  );
};
