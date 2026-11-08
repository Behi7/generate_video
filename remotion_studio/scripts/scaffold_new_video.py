#!/usr/bin/env python3
"""
Scaffolds a new canonical 38-40s (1160 frames @ 30 FPS) Remotion Studio project.
Automatically sets up:
- Modular project structure in src/projects/<slug>/
- Isolated output directory in output/<slug>/ (with symlink in project dir)
- 4-act structure (StageTimeline)
- 2.5D Isometric 3/4 Heroic Camera ([2.3, 1.8, 3.6])
- Single-Island Minimalist HUD
- TestingBayEnvironment with Drei IBL & ContactShadows
- Immediate valid placeholder ASMR WAV generation (zero missing audio errors)
- Registration in Root.tsx
"""

import sys
import os
import re
import wave
import struct
import json

STUDIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(STUDIO_DIR, "src")
PROJECTS_DIR = os.path.join(SRC_DIR, "projects")
OUTPUT_DIR = os.path.join(STUDIO_DIR, "output")
ROOT_TSX = os.path.join(SRC_DIR, "Root.tsx")
PUBLIC_AUDIO_DIR = os.path.join(STUDIO_DIR, "public", "audio")
os.makedirs(PUBLIC_AUDIO_DIR, exist_ok=True)


def create_placeholder_wav(filepath, duration_sec=38.67, sample_rate=44100):
    """Creates a valid 44.1kHz 16-bit stereo WAV with subtle mechanical click ticks on tier boundaries."""
    if os.path.exists(filepath):
        return
    total_samples = int(duration_sec * sample_rate)
    with wave.open(filepath, "w") as wav:
        wav.setnchannels(2)  # Stereo
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(sample_rate)

        frames = bytearray()
        tier_interval = total_samples // 4

        for i in range(total_samples):
            # Gentle click every tier change
            offset_in_tier = i % tier_interval
            if offset_in_tier < 200:
                val = int(8000 * (1 - offset_in_tier / 200))
            else:
                val = 0
            frames.extend(struct.pack("<hh", val, val))

        wav.writeframes(frames)
    print(f"  + Generated placeholder audio: {filepath}")


def scaffold(name):
    slug = re.sub(r"[_\-\s]+", "_", name.lower()).strip("_")
    pascal_name = "".join(word.capitalize() for word in re.split(r"[_\-\s]+", name))
    if not pascal_name.endswith("Progression"):
        pascal_name += "Progression"

    theme_base = pascal_name.replace("Progression", "")

    project_root = os.path.join(PROJECTS_DIR, slug)
    comp_dir = os.path.join(project_root, "components")
    compositions_dir = os.path.join(project_root, "compositions")
    audio_dir = os.path.join(project_root, "audio")
    project_output = os.path.join(OUTPUT_DIR, slug)

    os.makedirs(comp_dir, exist_ok=True)
    os.makedirs(compositions_dir, exist_ok=True)
    os.makedirs(audio_dir, exist_ok=True)

    # 1. Create project output directories
    for cat in ["qc", "inspect", "stills", "collisions", "pc_bundle"]:
        os.makedirs(os.path.join(project_output, cat), exist_ok=True)

    # Symlink project output
    symlink_path = os.path.join(project_root, "output")
    if not os.path.exists(symlink_path):
        try:
            os.symlink(f"../../../output/{slug}", symlink_path)
        except Exception:
            pass

    composition_file = os.path.join(compositions_dir, f"{pascal_name}.tsx")
    stage_file = os.path.join(comp_dir, f"{theme_base}Stage.tsx")
    audio_rel = f"audio/asmr_{slug}_progression.wav"
    audio_full = os.path.join(STUDIO_DIR, "public", audio_rel)

    print(f"🛠️  Scaffolding modular project '{slug}' -> {pascal_name} (1160 frames @ 30 FPS)...")

    # 0. Placeholder audio
    create_placeholder_wav(audio_full, duration_sec=38.67)

    # 1. Project metadata
    project_json_file = os.path.join(project_root, "project.json")
    if not os.path.exists(project_json_file):
        project_meta = {
            "id": slug,
            "name": f"{theme_base} Progression",
            "compositionId": pascal_name,
            "fps": 30,
            "durationInFrames": 1160,
            "width": 1080,
            "height": 1920,
            "tiers": [
                {"tier": 1, "name": f"Manual {theme_base}", "cost": "$10"},
                {"tier": 2, "name": f"Electric {theme_base}", "cost": "$100"},
                {"tier": 3, "name": f"Hydraulic {theme_base}", "cost": "$1,000"},
                {"tier": 4, "name": f"Futuristic {theme_base}", "cost": "$100,000+"},
            ],
            "audioTrack": audio_rel,
        }
        with open(project_json_file, "w") as f:
            json.dump(project_meta, f, indent=2)
        print(f"  + Created project.json: {project_json_file}")

    # 2. Stage Component
    if not os.path.exists(stage_file):
        stage_content = f"""import React from "react";
import {{ useCurrentFrame }} from "remotion";
import {{ getCurrentTier, getTierLocalFrame }} from "@shared/contracts/StageTimeline";
import {{ RockSpecimen }} from "@shared/specimens/RockSpecimen";

export const {theme_base}Stage: React.FC = () => {{
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  return (
    <group position={[0, -2.04, 0]}>
      {{/* Specimen anchored on bed */}}
      <RockSpecimen />

      {{/* Tier 1 ($10, Frames 0..289): Manual / Analog Baseline */}}
      {{tier === 1 && (
        <group>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>
      )}}

      {{/* Tier 2 ($100, Frames 290..579): Mechanical / Motor Driven */}}
      {{tier === 2 && (
        <group>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial color="#1E222A" roughness={0.85} metalness={0.2} />
          </mesh>
        </group>
      )}}

      {{/* Tier 3 ($1 000, Frames 580..869): Heavy Industrial Hydraulic */}}
      {{tier === 3 && (
        <group>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      )}}

      {{/* Tier 4 ($100 000+, Frames 870..1159): Sci-Fi Quantum / Plasma */}}
      {{tier === 4 && (
        <group>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial color="#8B5CF6" roughness={0.1} metalness={0.95} />
          </mesh>
        </group>
      )}}
    </group>
  );
}};
"""
        with open(stage_file, "w") as f:
            f.write(stage_content)
        print(f"  + Created stage: {stage_file}")

    # 3. Composition File
    if not os.path.exists(composition_file):
        comp_content = f"""import React from "react";
import {{ useVideoConfig, staticFile, Audio }} from "remotion";
import {{ ThreeCanvas }} from "@remotion/three";
import {{ DynamicEnvironment }} from "@shared/environment/DynamicEnvironment";
import {{ ShowroomHUD }} from "@shared/components/ShowroomHUD";
import {{ RigidShowcaseCamera }} from "@shared/components/RigidShowcaseCamera";
import {{ CinematicOverlay }} from "@shared/components/CinematicOverlay";
import {{ computeProjectImpacts, ImpactShake }} from "@shared/contracts/AssemblyContract";
import {{ {theme_base}Stage }} from "../components/{theme_base}Stage";

export const {pascal_name}: React.FC = () => {{
  const {{ width, height }} = useVideoConfig();

  // Dynamic impact calculation from tier assembly specifications (Single Source of Truth)
  // Plug in Tier 1..4 MachineAssemblySpecs once authored: computeProjectImpacts([Tier1Spec, Tier2Spec, Tier3Spec, Tier4Spec])
  const impacts: ImpactShake[] = computeProjectImpacts([]);

  return (
    <div
      style={{{{
        width: "100%",
        height: "100%",
        backgroundColor: "#0F172A",
        position: "relative",
        overflow: "hidden",
      }}}}
    >
      <Audio src={{staticFile("{audio_rel}")}} />

      <ThreeCanvas
        width={{width}}
        height={{height}}
        camera={{{{
          fov: 42,
          near: 0.1,
          far: 60,
        }}}}
      >
        <RigidShowcaseCamera
          basePosition={{[1.85, 0.45, 2.90]}}
          target={{[0, -1.25, 0]}}
          impacts={{impacts}}
          enableClimaxPush={{true}}
          tierDuration={{290}}
        />
        <DynamicEnvironment theme="factory" />
        <{theme_base}Stage />
      </ThreeCanvas>

      <CinematicOverlay />
      <ShowroomHUD />
    </div>
  );
}};
"""
        with open(composition_file, "w") as f:
            f.write(comp_content)
        print(f"  + Created composition: {composition_file}")

    # 4. Project entry index.tsx
    index_file = os.path.join(project_root, "index.tsx")
    if not os.path.exists(index_file):
        index_content = f"""import React from "react";
import {{ Composition }} from "remotion";
import {{ {pascal_name} }} from "./compositions/{pascal_name}";
import {{ TOTAL_DURATION_FRAMES }} from "@shared/contracts/StageTimeline";

export const {theme_base}Compositions: React.FC = () => {{
  return (
    <>
      <Composition
        id="{pascal_name}"
        component={{{pascal_name}}}
        durationInFrames={{TOTAL_DURATION_FRAMES}}
        fps={{30}}
        width={{1080}}
        height={{1920}}
      />
    </>
  );
}};

export {{ {pascal_name} }};
"""
        with open(index_file, "w") as f:
            f.write(index_content)
        print(f"  + Created index.tsx: {index_file}")

    # 5. Register in Root.tsx if not already registered
    if os.path.exists(ROOT_TSX):
        with open(ROOT_TSX, "r") as f:
            root_src = f.read()

        import_line = f'import {{ {theme_base}Compositions }} from "./projects/{slug}";'
        comp_tag = f"      <{theme_base}Compositions />"

        if import_line not in root_src:
            # Insert import after other project imports
            root_src = re.sub(
                r'(import \{ DrillCompositions \}.*?\n)',
                r'\1' + import_line + '\n',
                root_src
            )
            # Insert tag in JSX
            root_src = re.sub(
                r'(<DrillCompositions \/>\n)',
                r'\1' + comp_tag + '\n',
                root_src
            )
            with open(ROOT_TSX, "w") as f:
                f.write(root_src)
            print(f"  + Registered <{theme_base}Compositions /> in Root.tsx")

    print(f"🎉 Project '{slug}' successfully scaffolded and ready!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./scripts/scaffold_new_video.py <Name>")
        sys.exit(1)
    scaffold(sys.argv[1])
