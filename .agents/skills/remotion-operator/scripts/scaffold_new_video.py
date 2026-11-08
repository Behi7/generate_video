#!/usr/bin/env python3
"""
Scaffold New Video: Generates a 30 FPS canonical Remotion composition adhering to SKILL.md laws.
Usage:
    python3 scaffold_new_video.py <CompositionName> [--register]
"""

import os
import sys
import argparse

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../remotion_studio"))
COMPOSITIONS_DIR = os.path.join(WORKSPACE_ROOT, "src", "compositions")
ROOT_TSX = os.path.join(WORKSPACE_ROOT, "src", "Root.tsx")

TEMPLATE = """import React from "react";
import {{ useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile }} from "remotion";
import {{ ThreeCanvas }} from "@remotion/three";
import {{ TestingBayEnvironment }} from "../components/TestingBayEnvironment";
import {{ EpicTransformingStage }} from "../components/EpicTransformingStage";
import {{ ShowroomHUD }} from "../components/ShowroomHUD";

export const {name}: React.FC = () => {{
  const {{ width, height }} = useVideoConfig();
  const frame = useCurrentFrame();

  // 1. Physical camera impulse shake on impacts & destruction events
  let shakeX = 0;
  let shakeY = 0;

  if (frame >= 115 && frame <= 124) {{
    const decay = 1 - (frame - 115) / 9;
    shakeX = Math.sin(frame * 2.8) * 0.035 * decay;
    shakeY = Math.cos(frame * 3.2) * 0.025 * decay;
  }} else if (frame >= 133 && frame <= 136) {{
    const decay = 1 - (frame - 133) / 3;
    shakeX = Math.sin(frame * 4.5) * 0.028 * decay;
    shakeY = Math.cos(frame * 4.8) * 0.022 * decay;
  }} else if (frame >= 300 && frame <= 309) {{
    const decay = 1 - (frame - 300) / 9;
    shakeX = Math.sin(frame * 3.0) * 0.045 * decay;
    shakeY = Math.cos(frame * 3.5) * 0.035 * decay;
  }} else if (frame >= 495 && frame <= 504) {{
    const decay = 1 - (frame - 495) / 9;
    shakeX = Math.sin(frame * 3.2) * 0.06 * decay;
    shakeY = Math.cos(frame * 3.8) * 0.045 * decay;
  }}

  // 2. Cinematic slow climax push (FOV or Z)
  const camZ = interpolate(frame, [0, 560, 720], [4.85, 4.85, 4.15], {{
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }});

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
      <ThreeCanvas
        width={{width}}
        height={{height}}
        camera={{{{
          position: [shakeX, -0.95 + shakeY, camZ],
          fov: 42,
          near: 0.1,
          far: 50,
        }}}}
      >
        <TestingBayEnvironment />
        <EpicTransformingStage />
      </ThreeCanvas>

      {/* Pure numeric zero-language HUD */}
      <ShowroomHUD />

      {/* Multi-layered tactile mechanical ASMR */}
      <Audio src={{staticFile("audio/master_destruction_asmr.wav")}} volume={{1.0}} />
    </div>
  );
}};
"""


def scaffold(name, register=False):
    os.makedirs(COMPOSITIONS_DIR, exist_ok=True)
    target_path = os.path.join(COMPOSITIONS_DIR, f"{name}.tsx")

    if os.path.exists(target_path):
        print(f"⚠️ Composition {name} already exists at {target_path}")
        return False

    content = TEMPLATE.format(name=name)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Created composition: {target_path}")

    if register and os.path.exists(ROOT_TSX):
        with open(ROOT_TSX, "r", encoding="utf-8") as f:
            root_content = f.read()

        import_stmt = f'import {{ {name} }} from "./compositions/{name}";\n'
        comp_tag = f"""      <Composition
        id="{name}"
        component={{{name}}}
        durationInFrames={{720}} // 24s @ 30fps
        fps={{30}}
        width={{1080}}
        height={{1920}}
      />\n"""

        # Insert import
        idx = root_content.find('export const Root')
        new_root = root_content[:idx] + import_stmt + root_content[idx:]

        # Insert composition
        idx_end = new_root.rfind('</>')
        new_root = new_root[:idx_end] + comp_tag + new_root[idx_end:]

        with open(ROOT_TSX, "w", encoding="utf-8") as f:
            f.write(new_root)
        print(f"✅ Registered {name} in {ROOT_TSX}")

    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold New 30 FPS Remotion Composition")
    parser.add_argument("name", help="Name of new composition (e.g. HydroProgression)")
    parser.add_argument("--register", action="store_true", help="Automatically register in Root.tsx")
    args = parser.parse_args()

    scaffold(args.name, args.register)
