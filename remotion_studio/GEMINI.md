# Remotion Studio: Hyperbolic Mechanism Video Engine

This directory produces viral vertical 30 FPS Shorts/Reels (1080×1920) focused on **Hyperbolic Mechanical Metaphors, 42.67s 4-Act Drama (1280 frames @ 30 FPS), Triple-A Three.js Photorealism, and Pure ASMR Soundscapes**.

---

## ⛔ THE ZERO-CODE PRODUCER CONSTITUTION (IRONCLAD LAW)
**The Main Conversation Agent is a STRICT ORCHESTRATOR / DISPATCHER. It is ABSOLUTELY FORBIDDEN from writing or modifying 3D components, compositions, or audio scripts directly in the root conversation.**
Any direct authoring of `src/projects/<project>/components/*.tsx`, `src/projects/<project>/compositions/*.tsx`, or `scripts/*.py` by the root agent is a critical protocol violation.

### The Mandatory Subagent Conveyor Pipeline:
0. **Phase 0 — Modular Workspace Initialization (Dispatcher Execution):**
   - Main Agent executes: `python3 remotion_cli.py create-project <project_slug>`
   - Automatically sets up `src/projects/<project_slug>/`, isolated `output/<project_slug>/`, Root registration, and placeholder ASMR WAV.
1. **Phase 1 — The Parallel Creator Swarm (6 Concurrent Producers):**
   - Main agent dispatches 6 parallel subagents simultaneously:
     - **Modeler 1 (Tier 1, $10):** Authors `src/projects/<project>/components/Tier1_Manual.tsx` $\to$ `output/<project>/inspect/inspect_Tier1Inspection.png`.
     - **Modeler 2 (Tier 2, $100):** Authors `src/projects/<project>/components/Tier2_Electric.tsx` $\to$ `output/<project>/inspect/inspect_Tier2Inspection.png`.
     - **Modeler 3 (Tier 3, $1 000):** Authors `src/projects/<project>/components/Tier3_Hydraulic.tsx` $\to$ `output/<project>/inspect/inspect_Tier3Inspection.png`.
     - **Modeler 4 (Tier 4, $100 000+):** Authors `src/projects/<project>/components/Tier4_Futuristic.tsx` $\to$ `output/<project>/inspect/inspect_Tier4Inspection.png`.
     - **Scene Decorator (`crew/scene_decorator.md`):** Selects environment theme (`factory`, `garage`, `cyberpunk`, `cleanroom`, `dark_studio`) and instantiates `<DynamicEnvironment />` from the 20-block LEGO kit (`src/shared/environment/`).
     - **Sound Designer (`crew/sound_editor.md`):** Generates 44.1 kHz Foley ASMR master track (1,881,600 samples) in `src/projects/<project>/audio/` using `scripts/compose_asmr.py` from the 162-sample CC0 library.
2. **Phase 2 — Isolated Forensic QC Gatekeeping (5 Critics):**
   - **Visual Critics 1..4 (`crew/tier_pairs.md`):** Audit 4-view contact sheets for Tiers 1–4 in `output/<project>/inspect/`.
   - **Ruthless Sound Critic (`crew/sound_critic.md`):** Audits `inspect_audio.png` (spectrogram, RMS energy peak alignment at 234f local, 0 synthetic sines, 1,881,600 samples).
   - All 5 gates MUST return `[PASS]` before advancing.
3. **Phase 3 — The Kinematics & Drama Swarm (4 Motion Animators, `crew/motion_animator.md`):**
   - 4 parallel Motion Animators take the approved static 3D models and author kinematics directly in `src/projects/<project>/components/`:
     - **Anti-Glitch 4-Act Law (0..319f per tier):**
       * Act 1 (0..62f / 63 frames / 2.10s): Staggered Inside-Out Snap Assembly (4 modules: Base, Core, Casing, Toolhead).
       * Act 2 (63..122f / 60 frames / 2.00s): Visible Startup Chain Reaction (drive spool-up, belt tensioning, 0 -> 100% RPM).
       * Act 3 (123..212f / 90 frames / 3.00s): Steady-state working strikes with clean 25–35 cm air gap and surface contact.
       * Act 4 (213..319f / 107 frames / 3.57s): 4-Stage Destruction & Cleanser Law:
         - strain (213..224f / 12f): Torque bog-down / RPM deceleration from 100% to 0%, overheating, mechanical jam.
         - resonance (225..233f / 9f): Resonant pre-fracture shudder wave (escalating frequency & amplitude), bolt shear, cracks.
         - ruptureAndCleanser (234..307f / 74f = 2.47s): Catastrophic fracture detonation at frame 234 (`breakFrame = 234`), followed by active modular Cleanser Transition sweeping the stage.
         - settled (308..319f / 12f = 0.40s): Clean table, pristine workspace for next tier. Zero debris or ghost meshes.
     - **Anti-Ghosting Law:** Guarantees specimen lifetime strictly matches tool cutting frames (123..233f).
4. **Phase 4 — Automated Forensic Interceptor Gates (`check-collisions` & `check-sync`):**
   - Gate 4A: Volumetric Clearance: `python3 remotion_cli.py check-collisions <project_slug>`
     * Toolhead vs Specimen Overlap: MUST be <= 10.0% (elastic surface bite only).
     * Toolhead vs Anvil Bed Overlap: MUST be <= 0.0% (strictly no plunging into solid steel anvil).
     * Moving Parts vs Casing: MUST be <= 0.0% (no gouging housing walls).
   - Gate 4B: Exact Tri-Sync Alignment: `python3 remotion_cli.py check-sync <project_slug>`
     * Verifies 100% phase alignment: 3D Strike Frames == Camera Impulses == Audio Foley Transients.
     * Zero phantom camera shakes allowed during startup or when toolhead is at TDC.
   - If either returns exit code 1 (FAIL), automatically returns to Animators/Compositors with exact error.
   - If both return exit code 0 (PASS), authorizes Stage Compositor and human-perspective visual critique.
5. **Phase 5 — Stage Compositor (`crew/stage_compositor.md`) & Ruthless Critic #2 (`crew/ruthless_critic.md`):**
   - Compositor wires verified tiers, `<DynamicEnvironment />`, `<CleanserTransitionWrapper />`, and Foley ASMR audio via `<ProceduralAssemblyRig />` in `src/projects/<project>/components/<ThemeBase>Stage.tsx`.
   - Critic #2 runs `python3 remotion_cli.py qc <project_slug>` (8-keyframe audit across all 4 tiers in `output/<project>/qc/`).
   - Evaluates as a human spectator: Heroic Framing (60%–65% vertical occupancy, no top-edge clipping), lighting, material contrast, ASMR synchronization, clean table at 308..319f.
   - If **PASS** $\to$ Authorized for final master render.
6. **Phase 6 — Smart Master Render & Hardware-Aware Law (GPU Auto-Detection):**
   - **IF DEDICATED GPU DETECTED (NVIDIA / AMD GPU, e.g. RTX 4060):** The agent MUST immediately execute hardware-accelerated local master render:
     ```bash
     npx remotion render src/index.ts <Composition> output/<project>/<Composition>.mp4 --gl=angle --concurrency=6
     ```
     Rendering completes within 1–2 minutes, delivering final MP4 directly to user without waiting for manual confirmation.
   - **IF NO DEDICATED GPU DETECTED (low-power CPU only):** Never block the system with hours of software CPU rendering! Automatically package the project bundle (`python remotion_cli.py export-pc <project_slug>` to `output/<project>/pc_bundle/`), provide the zip bundle to the user, and wait for instructions (e.g., render in Google Colab or explicit CPU render command).

---

## The Production Laws & Modular Architecture (1280 Frames @ 30 FPS / 42.67s)

1. **Inside-Out Modular Assembly (`AssemblyContract.ts`):**
   - Strictly enforces 4-module hierarchy: `Base (0f)` $\to$ `Internal Core/Shaft (20f)` $\to$ `Outer Casing (40f)` $\to$ `Toolhead/Chuck (55..60f)`.
   - Internal parts MUST mount before outer housings enclose them. Zero clipping!

2. **The 42.67s 4-Act Formula (320 frames per tier, local frames 0..319, 4 tiers = 1280 frames):**
   - Act 1 (0..62f / 63 frames = 2.10s): Staggered Inside-Out Snap Assembly (4 modules: Base, Core, Casing, Toolhead).
   - Act 2 (63..122f / 60 frames = 2.00s): Visible Startup Chain Reaction, drive spool-up, belt tensioning.
   - Act 3 (123..212f / 90 frames = 3.00s exact): Hypnotic Full-Power Steady-State ASMR strikes with clean air gap.
   - Act 4 (213..319f / 107 frames = 3.57s): 4-Stage Destruction & Cleanser Law:
     * strain: 213..224f (12f / 0.40s) — torque bog-down, RPM drops to 0, overheating, mechanical jam.
     * resonance: 225..233f (9f / 0.30s) — resonant pre-fracture shudder wave (increasing frequency & amplitude).
     * ruptureAndCleanser: 234..307f (74f = 2.47s) — catastrophic fracture detonation at frame 234 (`breakFrame = 234`) + modular Cleanser Transition.
     * settled: 308..319f (12f / 0.40s) — clean table, empty stage ready for next tier.

3. **Floor-Agnostic Cleanser Transition Standard (Zero Cutouts / Zero Holes):**
   - The stage floor is 100% continuous and solid across all themes (`factory`, `garage`, `cyberpunk`, `cleanroom`, `dark_studio`).
   - Legacy `stage_drop_trap` and `WorkstationBed` cutouts are completely deprecated and deleted.
   - Every tier transition employs one of 4 modular cleanser effects:
     1. `ash_disintegration`: Thermal incandescence & decay into sparks and ash with fluid wind stream dispersal.
     2. `laser_scan_cleanser`: Cryo-neon planar laser sweeping the stage with plasma spark cascades.
     3. `pneumatic_air_blast`: High-pressure CNC pneumatic ring blast with supersonic vapor rings and ricochet.
     4. `black_hole_singularity`: Airborne gravitational singularity: event horizon + inclined Kerr accretion disk ($25^\circ$) + 320 plasma particles + bipolar Hawking jets + debris spaghettification into vortex + quantum implosion at frame 305..308.

4. **Master ASMR Audio Track Law:**
   - Stereo 44.1 kHz 16-bit PCM WAV, normalized to -14 LUFS, true peak $\le -1.0\text{ dBFS}$.
   - Total sample count: strictly **1,881,600 samples** (42.6667s @ 30 FPS).
   - Transient spikes strictly synced to 3D contacts in Act 3 (123..212f) and catastrophic fracture detonation at frame 234 local. Zero drift allowed.

5. **Air Gap & Coaxial Centerline Law (Zero Piston Embedding):**
   - Toolhead at rest/TDC MUST provide a clear visual air gap (25–35 cm) above the workpiece and anvil.
   - Toolhead, Specimen, and Anvil must share the exact same centerline (X and Z axes). Toolhead die strikes the surface and recoils back up into the air; it never embeds inside the workpiece like a piston.

6. **The 10% Volumetric Clearance Law (`check-collisions`):**
   - Every composition must pass `python3 remotion_cli.py check-collisions <Composition>` with exit code 0. Overlap between toolhead and workpiece cannot exceed 10.0%, and toolhead cannot penetrate into the anvil bed (> 0.0%).

7. **4-View Model Inspection Rig (`ModelInspector.tsx`):**
   - Pure Remotion 4-View 2×2 contact sheets via `python3 remotion_cli.py inspect <Composition>`.
   - Evaluates Front, Side, Top, and Heroic Iso 3/4 before stage integration.

8. **Image-Based Lighting (IBL / HDRI Environment):**
   - Mandatory `<Environment preset="warehouse" />` from `@react-three/drei`. Metal surfaces must reflect real industrial studio softboxes, not dark voids.

9. **Contact Shadows (Ambient Occlusion):**
   - Mandatory `<ContactShadows />` beneath machines to physically anchor them to the platform floor.

10. **Bevel Chamfers vs BoxGeometry:**
    - Machine bodies, frames, and housings (> 0.08m) must use `<RoundedBox radius={0.02..0.035}>` to catch specular highlights. Micro-details (< 0.05m) may use `<boxGeometry>`.

11. **Material Contrast Triad:**
    - Dark textured cast iron (`roughness: 0.7`) + Mirror chrome steel (`roughness: 0.08`, `metalness: 0.98`) + Polished brass/copper (`roughness: 0.15`, `metalness: 0.95`).

12. **Heroic Framing & Coaxial Alignment:**
    - Machine fills 60–65% of the vertical frame (`basePosition: [1.85, 0.45, 2.90]`, `target: [0, -1.25, 0]`).
    - Coaxial alignment along Y-axis: Motor on Top $\to$ Chuck in Middle $\to$ Bit pointing Down $\to$ Rock in Vise at Bottom. Zero 90° accidental tilts.

13. **Razor-Sharp Single-Island HUD:**
    - Zero text-shadow blur ghosts. Sharp, legible numbers on frosted graphite card. Zero natural words.

14. **Unified Smart Rendering & Local PC Export Law:**
    - **Never lock the 2-core cloud server into a 2-hour software CPU render by default.**
    - When QC #2 passes, package the project for the user's powerful PC:
      `python3 remotion_cli.py export-pc <Composition>`
      Produces `output/<project>/pc_bundle/<Composition>_pc_bundle.zip` with 1-click Windows `render.bat` (`--gl=angle --concurrency=8`) and `preview.bat`.
    - Or route to Google Colab Tesla T4 GPU: `python3 remotion_cli.py render <Composition>`
    - Force local 2-core server CPU only if user explicitly demands it: `python3 remotion_cli.py render <Composition> --cpu`.

---

## Crew Directory
- [`crew/director.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/director.md) — 4-act drama, 1280f master timeline, BOM modular specs, heroic framing, crisp HUD.
- [`crew/tier_pairs.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/tier_pairs.md) — 4-Pair Parallel 3D Modeling & Forensic Audit Swarm with prompt templates.
- [`crew/3d_modeler.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/3d_modeler.md) — Pure Three.js geometry, RoundedBox bevels, material triad, socket anchors.
- [`crew/stage_compositor.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/stage_compositor.md) — Lean declarative stage assembly via `<ProceduralAssemblyRig />` & `<CleanserTransitionWrapper />`.
- [`crew/motion_animator.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/motion_animator.md) — Anti-Glitch Overload Law (213..319f), rupture at 234f, clean table at 308..319f.
- [`crew/mechanical_engineer.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/mechanical_engineer.md) — Engineering dispatcher & inside-out assembly law.
- [`crew/sound_editor.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/sound_editor.md) — 4-act multi-band ASMR soundscape (1280 frames, 1,881,600 samples).
- [`crew/sound_critic.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/sound_critic.md) — Forensic audio gatekeeper: detonation at 234f local, 0 drift.
- [`crew/ruthless_critic.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/ruthless_critic.md) — Dual-stage QC gatekeeper: 4-View model audit + 8-keyframe motion audit, clean table check.
