# Workspace Dispatcher: Video Production Engine

This workspace hosts three specialized autonomous video production pipelines:

## 1. Viral 3D Motion Studio (`remotion_studio/`)
- **Scope:** 30 FPS vertical Shorts/Reels (1080×1920, 1280 frames, 42.67s), Three.js 3D dark-studio scenes, modular inside-out assembly, ASMR audio, and physical overload fracture.
- **Rules:** Follow [`.agents/skills/remotion-operator/SKILL.md`](./.agents/skills/remotion-operator/SKILL.md) and [`remotion_studio/GEMINI.md`](./remotion_studio/GEMINI.md).
- **Skill:** Uses `remotion-operator` skill (`.agents/skills/remotion-operator/`).
- **Zero-Code Producer Law:** The root agent in chat is a STRICT DISPATCHER. It is strictly forbidden from writing scene code directly; it MUST invoke specialized subagents from `crew/` (Creators $\to$ Forensic QC Gates $\to$ Kinematics/Drama $\to$ Stage Compositor $\to$ Final QC $\to$ Smart Render).
- **Smart Render & Hardware-Aware Law (GPU Auto-Detection):**
  - **Если в системе есть видеокарта (NVIDIA / AMD GPU, например RTX 4060):** Агент обязан **СРАЗУ начинать рендеринг** готового видео локально с аппаратным ускорением (`npx remotion render src/index.ts <Composition> output/<project>/<Composition>.mp4 --gl=angle --concurrency=6`), без создания лишних архивов и без ожидания команды пользователя.
  - **Если видеокарты нет (только слабый CPU / сервер без дискретного GPU):** Запрещено запускать 2-часовой рендер на CPU! Агент автоматически упаковывает проект в zip-бандл (`python remotion_cli.py export-pc <project_slug>`), сообщает пользователю и **ждёт команды пользователя**.

## 2. 3D Procedural Engine (`3d_blender/`)
- **Scope:** Full 3D procedural modeling, Cycles/EEVEE shaders, lighting, camera orbits, `.blend` exports.
- **Rules:** Follow [`3d_blender/GEMINI.md`](./3d_blender/GEMINI.md) whenever creating or modifying 3D assets and scenes.
- **Skill:** Uses `blender-operator` skill (`.agents/skills/blender-operator/`).

## 3. 2D Vector & Technical Studio (`2d_studio/`)
- **Scope:** 2D motion graphics, technical blueprints, engineering cross-sections, and Kurzgesagt-style vector explainers.
- **Rules:** Follow [`2d_studio/GEMINI.md`](./2d_studio/GEMINI.md) whenever creating or modifying 2D vector animations and layouts.
- **Skill:** Uses `studio-2d-operator` skill (`.agents/skills/studio-2d-operator/`).
