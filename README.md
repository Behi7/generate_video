# generate_video

Autonomous Viral 3D Video Production Engine powered by **Remotion**, **Three.js**, **React**, and **Web Audio / ASMR Foley**.

Produces 30 FPS vertical Shorts/Reels (1080×1920 @ 30 FPS, 42.67s / 1280 frames) based on **Hyperbolic Mechanical Metaphors**, modular inside-out assembly, synchronized physical overload fractures, and pure multi-layered ASMR audio.

---

## 🚀 Key Features

- **Triple-A Three.js Visuals:** Physically-accurate metallic shaders, dynamic shadows, environmental lighting, and showroom HUD.
- **Inside-Out 4-Tier Progression:** Modular evolution ($10 manual tool $\to$ $100 electric $\to$ $1,000 industrial hydraulic $\to$ $100,000+ futuristic laser/plasma).
- **Automated Collision & Sync QC:**
  - `check-collisions`: Universal 3D bounding box audit preventing mesh interpenetration.
  - `check-sync`: Validates microsecond alignment between tool strikes, camera shockwaves, and audio transients.
- **Procedural ASMR Foley Engine:** Synthesizes and mixes 44.1 kHz multi-layer audio (heavy impacts, servo whines, metallic stress, crushing transients) from CC0 samples.
- **Smart GPU Acceleration:**
  - Fast local preview in Remotion Studio.
  - PC GPU Render Bridge (`render_on_pc.ps1` / RTX 4060 hardware acceleration via ANGLE).
  - Google Colab Tesla T4 pipeline (`export_colab_bundle.py`).

---

## 📁 Repository Structure

```
generate_video/
├── remotion_cli.py               # Root forwarding CLI wrapper
├── README.md                     # Project overview and documentation
├── GEMINI.md                     # Autonomous Agent instructions & dispatcher constitution
├── .gitignore                    # Git exclusions
├── .agents/
│   └── skills/
│       └── remotion-operator/    # AI agent skill definition, references, and anti-patterns
└── remotion_studio/              # Main Remotion React/Three.js project
    ├── package.json              # Node dependencies (@remotion/three, three, etc.)
    ├── remotion.config.ts        # Remotion configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── remotion_cli.py           # Production CLI (create-project, qc, render, export-pc)
    ├── run_render.py             # Headless rendering runner
    ├── export_colab_bundle.py    # Colab GPU package exporter
    ├── remotion_gpu_render.ipynb # Google Colab render notebook
    ├── crew/                     # Subagent specialization prompts (Director, Modeler, Critic...)
    ├── scripts/                  # Automated verification & audio synthesis scripts
    ├── public/                   # Static assets & CC0 ASMR Foley sound library
    └── src/
        ├── Root.tsx              # Remotion root registry
        ├── index.ts              # Entry point
        ├── shared/               # Shared components, contracts, rigs, and environments
        └── projects/             # Active video projects (e.g., Hammer, Press, Drill...)
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: 3.10+
- **FFmpeg**: Installed and in PATH

### 2. Installation
```bash
cd remotion_studio
npm install
```

### 3. Preview in Remotion Studio
```bash
npm start
```
Opens interactive Remotion Studio in your browser at `http://localhost:3000`.

---

## ⚡ CLI Workflow

From the repository root:

```bash
# List all active modular projects
./remotion_cli.py list

# Create a new video project
./remotion_cli.py create-project hydraulic_crusher

# Run automated 3D collision check
./remotion_cli.py check-collisions HammerProgression

# Run camera-physics-audio synchronization audit
./remotion_cli.py check-sync HammerProgression

# Generate 8-keyframe visual inspection sheet
./remotion_cli.py qc HammerProgression

# Package bundle for instant GPU rendering on PC
./remotion_cli.py export-pc HammerProgression
```

---

## 🤖 Autonomous Agent Pipeline

The project is architected for autonomous AI agents using the conveyor pipeline:
1. **Phase 0 — Workspace Initialization:** Dispatcher executes `remotion_cli.py create-project <slug>`.
2. **Phase 1 — Parallel Creator Swarm:** 4 Modelers (Tiers 1–4), 1 Scene Decorator, 1 Sound Designer.
3. **Phase 2 — Forensic QC Gates:** Visual contact sheet inspection + Spectrogram audio audit.
4. **Phase 3 — Kinematics & Drama Swarm:** Overload physics, deceleration, contact stall shudder, and fracture.
5. **Phase 4 — Automated Interceptors:** Universal `check-collisions` and `check-sync`.
6. **Phase 5 — Compositor & Final Critic:** Master assembly and 8-keyframe visual audit.
7. **Phase 6 — Smart GPU Render:** RTX GPU rendering via PC Bridge or Google Colab.

---

## 📄 License
MIT
