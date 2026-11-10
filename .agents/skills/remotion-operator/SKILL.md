---
name: remotion-operator
description: Autonomous viral video operator using Remotion, Three.js, React, and Spring physics. Produces high-retention vertical Shorts/Reels (1080×1920 @ 30 FPS, 42.67s / 1280 frames) based on Hyperbolic Mechanical Metaphors, modular collision-free 3D assembly, pure multi-layered ASMR audio, and universal zero-language visual clarity.
---

# Remotion Operator Skill: Hyperbolic Mechanical & ASMR Video Engine

This skill governs the autonomous production of 30 FPS high-retention viral vertical Shorts/Reels (1080×1920) in `remotion_studio/`.

---

## 1. Zero-Code Dispatcher Constitution & Division of Labor

**The Main Agent is a pure Zero-Code Producer. Direct scene authoring in root conversation is STRICTLY PROHIBITED.**
Production MUST run through structured subagent invocations (`invoke_subagent`):

0. **Phase 0 — Modular Workspace Initialization (Dispatcher Execution):**
   - The Main Agent runs:
     ```bash
     python3 remotion_cli.py create-project <project_slug>
     ```
   - This automatically creates the isolated project workspace:
     * `src/projects/<project_slug>/` (`components/`, `compositions/`, `audio/`, `project.json`, `index.tsx`)
     * `output/<project_slug>/` (`qc/`, `inspect/`, `stills/`, `collisions/`, `pc_bundle/`)
     * Registers `<ThemeBase>Compositions` in `src/Root.tsx`
     * Generates immediate valid placeholder ASMR WAV in `public/audio/` so Remotion never crashes.

1. **Phase 1 — The Parallel Creator Swarm (6 Concurrent Producers):**
   - Dispatches 6 parallel subagents simultaneously:
     - **Modeler 1 (Tier 1: $10 Manual):** Writes `src/projects/<project>/components/Tier1_Manual.tsx` $\to$ `output/<project>/inspect/inspect_Tier1Inspection.png`.
     - **Modeler 2 (Tier 2: $100 Electric):** Writes `src/projects/<project>/components/Tier2_Electric.tsx` $\to$ `output/<project>/inspect/inspect_Tier2Inspection.png`.
     - **Modeler 3 (Tier 3: $1 000 Hydraulic):** Writes `src/projects/<project>/components/Tier3_Hydraulic.tsx` $\to$ `output/<project>/inspect/inspect_Tier3Inspection.png`.
     - **Modeler 4 (Tier 4: $100 000+ Quantum/Plasma):** Writes `src/projects/<project>/components/Tier4_Futuristic.tsx` $\to$ `output/<project>/inspect/inspect_Tier4Inspection.png`.
     - **Scene Decorator (`crew/scene_decorator.md`):** Selects environment theme (`factory`, `garage`, `cyberpunk`, `cleanroom`, `dark_studio`) and instantiates `<DynamicEnvironment />` from the 20-block LEGO kit (`src/shared/environment/`).
     - **Sound Designer (`crew/sound_editor.md`):** Assembles 44.1 kHz Foley ASMR master track in `src/projects/<project>/audio/` via `scripts/compose_asmr.py` from 162 CC0 samples.
2. **Phase 2 — Isolated Forensic QC Gatekeeping (5 Critics):**
   - **Visual Critics 1..4 (`crew/tier_pairs.md`):** Audit 4-view contact sheets in `output/<project>/inspect/`.
   - **Ruthless Sound Critic (`crew/sound_critic.md`):** Audits `inspect_audio.png` (spectrogram, RMS energy peak alignment, 0 synthetic sines).
   - All 5 gates MUST return `[PASS]` before advancing.
3. **Phase 3 — The Kinematics & Drama Swarm (4 Motion Animators, `crew/motion_animator.md`):**
   - 4 parallel Motion Animators author bespoke kinematics, specimen sync (Anti-Ghosting Law: strictly frames 123..233), and dramatic overload plot twists directly inside `src/projects/<project>/components/`.
   - Strictly enforces the **Anti-Glitch Overload Law** (torque deceleration $\to$ contact stall & resonant micro-shudder $\to$ fracture at peak shudder at frame 234).
4. **Phase 4 — Automated Forensic Interceptor Gates (`check-collisions` & `check-sync`):**
   - **Gate 4A: Volumetric Clearance:** `python3 remotion_cli.py check-collisions <project_slug>` across 52 keyframes.
     * Toolhead vs Specimen Overlap: MUST be $\le 10.0\%$ (elastic surface bite only).
     * Toolhead vs Anvil Bed Overlap: MUST be $\le 0.0\%$ (strictly no plunging into solid steel anvil).
     * Moving Parts vs Casing: MUST be $\le 0.0\%$ (no gouging housing walls).
   - **Gate 4B: Exact Tri-Sync Alignment:** `python3 remotion_cli.py check-sync <project_slug>`.
     * Verifies 100% phase alignment: 3D Strike Frames == Camera Impulses == Audio Foley Transients.
     * Zero phantom camera shakes allowed during startup or when toolhead is at TDC.
   - Exit code 1 (FAIL) automatically returns to Animators/Compositors with exact delta in mm and frame.
   - Exit code 0 (PASS) on BOTH gates authorizes Stage Compositor and human aesthetic critique.
5. **Phase 5 — Stage Compositor (`crew/stage_compositor.md`) & Ruthless Critic #2 (`crew/ruthless_critic.md`):**
   - Compositor wires verified tiers, `<DynamicEnvironment />`, and Foley ASMR audio via `<ProceduralAssemblyRig />` in `src/projects/<project>/components/<ThemeBase>Stage.tsx`.
   - Critic #2 runs `python3 remotion_cli.py qc <project_slug>` (8-keyframe audit across all 4 tiers in `output/<project>/qc/`).
   - Evaluates as a human spectator: Heroic Framing (60%–65% vertical occupancy, no top-edge clipping), lighting, material contrast, ASMR synchronization.
6. **Phase 6 — Smart Master Render & Hardware-Aware Law (GPU Auto-Detection):**
   - **ЕСЛИ В МАШИНЕ ЕСТЬ ВИДЕОКАРТА (NVIDIA / AMD GPU, например RTX 4060):** Агент обязан **СРАЗУ начинать рендеринг** мастер-видео прямо на машине с аппаратным ускорением:
     ```bash
     npx remotion render src/index.ts <Composition> output/<project>/<Composition>.mp4 --gl=angle --concurrency=6
     ```
     Рендеринг занимает всего 1–2 минуты, готовое видео отдаётся пользователю сразу.
   - **ЕСЛИ ВИДЕОКАРТЫ НЕТ (только слабый CPU):** Запрещено запускать многочасовой CPU-рендер! Агент автоматически упаковывает проект в zip-архив (`python remotion_cli.py export-pc <project_slug>` в `output/<project>/pc_bundle/`), выдаёт архив и **ждет команды пользователя** (например, подтверждения рендера на CPU или команды запуска на Google Colab).

---

## 2. The Golden Inside-Out Assembly Law (`AssemblyContract.ts`)

To guarantee zero clipping and physical impossibility of outer casings trapping parts:
$$\text{Base (0f)} \longrightarrow \text{Internal Core / Crankshaft (20f)} \longrightarrow \text{Outer Casing (40f)} \longrightarrow \text{Gearbox (60f)} \longrightarrow \text{Tool Head (75f)}$$

- **Order 0:** Base / Vise on platform bed.
- **Order 1:** Internal rotor, crankshaft, or piston core. **MUST mount before casing.**
- **Order 2:** Outer finned cylinder block / casing. Encloses Order 1 cleanly.
- **Order 3:** Transmission, gearbox, chuck.
- **Order 4:** Fluted bit, cutter, or plasma emitter.

---

## 3. The Canonical 42.67s 4-Act Formula (1280 Frames @ 30 FPS)

- **Total Timeline:** **1280 frames @ 30 FPS (strictly 42.6667 seconds)**.
- **Master Foley ASMR Audio:** Strictly **1,881,600 samples** (44.1 kHz 16-bit PCM stereo WAV), normalized to -14 LUFS, true peak $\le -1.0\text{ dBFS}$.
- **4 Progression Tiers:** Exactly **320 frames (~10.67 seconds)** per tier:
  - **Tier 1:** Frames 0 – 319 ($10, 1x)
  - **Tier 2:** Frames 320 – 639 ($100, 10x)
  - **Tier 3:** Frames 640 – 959 ($1 000, 100x)
  - **Tier 4:** Frames 960 – 1279 ($100 000+, 10 000x)

```
[Act 1: Modular Assembly] ──► [Act 2: Startup Reaction] ──► [Act 3: Hypnotic Operating] ──► [Act 4: Destruction & Cleanser]
     (0..62f / 2.10s)              (63..122f / 2.00s)              (123..212f / 3.00s)                 (213..319f / 3.57s)
```

1. **ACT 1: STAGGERED INSIDE-OUT ASSEMBLY (Local Frames 0..62 / 63 frames = 2.10s):**
   - Modules arrive strictly by `assemblyOrder` in staggered intervals: Base (0f) $\to$ Shaft/Core (20f) $\to$ Outer Casing (40f) $\to$ Toolhead (55..60f).
   - Magnetic spring snapping, zero casing-first collisions, impact sparkles. Last part docks by frame 60.
2. **ACT 2: PHYSICAL STARTUP CHAIN REACTION (Local Frames 63..122 / 60 frames = 2.00s) — ZERO DEAD LULL:**
   - Visible mechanical cause-and-effect: switch toggle $\to$ belt/sprocket spool-up $\to$ operating RPM.
   - **Zero Dead Lull Law:** Machine must NEVER sit idle after frame 60! Operating strokes begin strictly at frame 123.
3. **ACT 3: HYPNOTIC STEADY-STATE CLIMAX (Local Frames 123..212 / 90 frames = 3.00s exact):**
   - Peak mechanical power, rhythmic deformation strikes, coolant fluid spray, rock/debris fragmentation, crisp balance increment on single-island HUD.
   - **Air Gap & Coaxial Centerline Law:** Clear visual air gap (25–35 cm) between toolhead at TDC and workpiece top surface. Tool strikes surface and recoils; never embeds inside workpiece like a piston sleeve.
   - **Anti-Ghosting Law:** Specimen lifetime matches cutting/forging frames strictly across 123..233f.
4. **ACT 4: 4-STAGE OVERLOAD DESTRUCTION & MODULAR CLEANSER (Local Frames 213..319 / 107 frames = 3.57s):**
   - **strain (213..224f / 12f = 0.40s):** Torque bog-down from 100% to 0% RPM, mechanical jam, overheating.
   - **resonance (225..233f / 9f = 0.30s):** Pre-fracture shudder wave (increasing frequency & amplitude), bolt shear, cracks.
   - **ruptureAndCleanser (234..307f / 74f = 2.47s):**
     * **Frame 234:** Catastrophic fracture detonation (`breakFrame = 234`). Shockwave, violent fragment ejection with physical gravity and floor bounces.
     * **Frames 234..307:** Active modular Cleanser Transition (`ash_disintegration`, `laser_scan_cleanser`, `pneumatic_air_blast`, `black_hole_singularity`) sweeps debris off the stage.
   - **settled (308..319f / 12f = 0.40s):** Pristine empty table, zero debris, 100% clean slate ready for next tier assembly. Continuous floor across all themes (no trapdoors or floor cutouts).

---

## 4. 4-View Inspection & Forensic Quality Checklist

Run component audit before stage assembly:
```bash
python3 remotion_cli.py inspect <CompositionName>
python3 remotion_cli.py check-collisions <CompositionName>
```

The Critic MUST issue a **`REJECT`** if:
1. The outer casing arrives before the internal rotor/shaft (violation of `AssemblyContract`).
2. Metal looks flat or plastic (missing Drei `<Environment preset="warehouse" />`).
3. The machine floats in air (missing `<ContactShadows />`).
4. Structural bodies use sharp 90° cubes instead of beveled chamfers (`<RoundedBox>`).
5. Drill/cutter/ram bit is rotated sideways or strikes off-target (must align along vertical Y-axis).
6. Toolhead rests inside workpiece without a 25–35 cm air gap, or fails `check-collisions` (> 10% overlap).
7. Machine dead-freezes during Act 4 instead of smoothly decelerating (213..224f) and shuddering (225..233f) into fracture rupture at frame 234.
8. The machine occupies less than 55% of the vertical frame (camera positioned too far).
9. Numbers ghost or blur due to heavy drop-shadows on HUD.
10. The machine sinks into the floor or uses floor cutouts instead of continuous floor and modular cleanser transitions (`ash_disintegration`, `laser_scan_cleanser`, `pneumatic_air_blast`, `black_hole_singularity`).

---

## 5. PC-First Rendering & Export Workflow (`export-pc` / `render`)

**Never lock the 2-core cloud server into a 2-hour software CPU render by default.**

1. **Option 1: Render on User's Powerful PC (Recommended, 20–30s):**
   ```bash
   python3 remotion_cli.py export-pc <CompositionName>
   ```
   - Automatically bundles the project into `output/<CompositionName>_pc_bundle.zip` (40–45 MB).
   - Includes Windows 1-click `render.bat` (`npx remotion render ... --gl=angle --concurrency=8`) and `preview.bat`.
   - If user already works locally, simply run directly:
     ```bash
     npx remotion render src/index.ts <CompositionName> output/<CompositionName>.mp4 --gl=angle --concurrency=8
     ```

2. **Option 2: Free Remote Google Colab Tesla T4 GPU (25s):**
   ```bash
   python3 remotion_cli.py render <CompositionName> [--shutdown]
   ```
   - Discovers active Tesla T4 via Zero-Touch Sync channel or `.colab_url`. Renders on GPU in ~25–30s.

3. **Option 3: Cloud 2-Core CPU (Strictly Opt-In, 1–2 hours):**
   ```bash
   python3 remotion_cli.py render <CompositionName> --cpu
   ```
