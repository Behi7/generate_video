# Workspace Dispatcher: Video Production Engine

This workspace hosts three specialized autonomous video production pipelines:

## 1. Viral 3D Motion Studio (`remotion_studio/`)
- **Scope:** 30 FPS vertical Shorts/Reels (1080×1920, 1160 frames, 38.67s), Three.js 3D dark-studio scenes, modular inside-out assembly, ASMR audio, and physical overload fracture.
- **Rules:** Follow [`.agents/skills/remotion-operator/SKILL.md`](./.agents/skills/remotion-operator/SKILL.md) and [`remotion_studio/GEMINI.md`](./remotion_studio/GEMINI.md).
- **Skill:** Uses `remotion-operator` skill (`.agents/skills/remotion-operator/`).
- **Zero-Code Producer Law:** The root agent in chat is a STRICT DISPATCHER. It is strictly forbidden from writing scene code directly; it MUST invoke specialized subagents from `crew/` (Creators $\to$ Forensic QC Gates $\to$ Kinematics/Drama $\to$ Stage Compositor $\to$ Final QC $\to$ Smart Render).
- **Smart Render & PC Export:** NEVER run a 2-hour CPU render on this 2-core cloud server by default. When the composition passes QC, package files for the user's powerful PC (`python3 remotion_cli.py export-pc <Composition>`) for instant 20-30s GPU rendering (`render.bat` / `npx remotion render ... --gl=angle`), or route to Colab Tesla T4 GPU (`python3 remotion_cli.py render`). Local 2-core CPU is strictly opt-in (`--cpu`).

## 2. 3D Procedural Engine (`3d_blender/`)
- **Scope:** Full 3D procedural modeling, Cycles/EEVEE shaders, lighting, camera orbits, `.blend` exports.
- **Rules:** Follow [`3d_blender/GEMINI.md`](./3d_blender/GEMINI.md) whenever creating or modifying 3D assets and scenes.
- **Skill:** Uses `blender-operator` skill (`.agents/skills/blender-operator/`).

## 3. 2D Vector & Technical Studio (`2d_studio/`)
- **Scope:** 2D motion graphics, technical blueprints, engineering cross-sections, and Kurzgesagt-style vector explainers.
- **Rules:** Follow [`2d_studio/GEMINI.md`](./2d_studio/GEMINI.md) whenever creating or modifying 2D vector animations and layouts.
- **Skill:** Uses `studio-2d-operator` skill (`.agents/skills/studio-2d-operator/`).
