# Remotion Studio: Hyperbolic Mechanism Video Engine

This directory produces viral vertical 30 FPS Shorts/Reels (1080×1920) focused on **Hyperbolic Mechanical Metaphors, 38–40s 4-Act Drama, Triple-A Three.js Photorealism, and Pure ASMR Soundscapes**.

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
     - **Sound Designer (`crew/sound_editor.md`):** Generates 44.1 kHz Foley ASMR master track in `src/projects/<project>/audio/` using `scripts/compose_asmr.py` from the 162-sample CC0 library.
2. **Phase 2 — Isolated Forensic QC Gatekeeping (5 Critics):**
   - **Visual Critics 1..4 (`crew/tier_pairs.md`):** Audit 4-view contact sheets for Tiers 1–4 in `output/<project>/inspect/`.
   - **Ruthless Sound Critic (`crew/sound_critic.md`):** Audits `inspect_audio.png` (spectrogram, RMS energy peak alignment, 0 synthetic sines).
   - All 5 gates MUST return `[PASS]` before advancing.
3. **Phase 3 — The Kinematics & Drama Swarm (4 Motion Animators, `crew/motion_animator.md`):**
   - 4 parallel Motion Animators take the approved static 3D models and author kinematics directly in `src/projects/<project>/components/`:
     - **Anti-Glitch 4-Phase Overload Law:**
       * Frames 150..224: Steady-state working strikes with clean 25–35 cm air gap and surface contact.
       * Frames 225..244: Torque bog-down / RPM deceleration from 100% to 0%.
       * Frames 245..264: Contact stall & high-frequency micro-shudder (0.5 to 3mm vibration, zero dead freeze!).
       * Frame 265: Explosive fracture at peak shudder (parts stay on bed Y >= -2.04).
     - **Anti-Ghosting Law:** Guarantees specimen lifetime strictly matches tool cutting frames (150..249f).
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
   - Compositor wires verified tiers, `<DynamicEnvironment />`, and Foley ASMR audio via `<ProceduralAssemblyRig />` in `src/projects/<project>/components/<ThemeBase>Stage.tsx`.
   - Critic #2 runs `python3 remotion_cli.py qc <project_slug>` (8-keyframe audit across all 4 tiers in `output/<project>/qc/`).
   - Evaluates as a human spectator: Heroic Framing (60%–65% vertical occupancy, no top-edge clipping), lighting, material contrast, ASMR synchronization.
   - If **PASS** $\to$ Authorized for final master render.
6. **Phase 6 — PC-First Smart Master Render & Export (`remotion_cli.py export-pc` or `render`):**
   - **Local PC GPU (Fastest, 20–30s):** When QC #2 returns `[PASS]`, run `python3 remotion_cli.py export-pc <project_slug>` to create `output/<project>/pc_bundle/<Composition>_pc_bundle.zip` with `render.bat` and `preview.bat` for the user's powerful PC.
   - **Colab Tesla T4 GPU (25s):** If Colab is online, routes to remote GPU.
   - **Cloud Server CPU (2-hour lock):** NEVER run by default! Strictly opt-in via `--cpu`.

---

## The Production Laws & Modular Architecture (1160 Frames @ 30 FPS)

1. **Inside-Out Modular Assembly (`AssemblyContract.ts`):**
   - Strictly enforces: `Base (0f)` $\to$ `Internal Core/Shaft (20f)` $\to$ `Outer Casing (40f)` $\to$ `Gearbox (60f)` $\to$ `Tool (75f)`.
   - Internal parts MUST mount before outer housings enclose them. Zero clipping!

2. **The 38–40s 4-Act Formula (290 frames per tier, local frames 0..289):**
   - Act 1 (0..69f / 70 frames): Staggered Inside-Out Snap Assembly (15–20f intervals).
   - Act 2 (70..149f / 80 frames): Visible Startup Chain Reaction.
   - Act 3 (150..224f / 75 frames): Hypnotic Full-Power Steady-State ASMR with clean air gap.
   - Act 4 (225..289f / 65 frames): Torque deceleration (225..244f) $\to$ Contact Stall & Shudder (245..264f) $\to$ Overload Fracture (265f). Zero dead freeze, zero floor sinking!

3. **Air Gap & Coaxial Centerline Law (Zero Piston Embedding):**
   - Toolhead at rest/TDC MUST provide a clear visual air gap (25–35 cm) above the workpiece and anvil.
   - Toolhead, Specimen, and Anvil must share the exact same centerline (X and Z axes). Toolhead die strikes the surface and recoils back up into the air; it never embeds inside the workpiece like a piston.

4. **The 10% Volumetric Clearance Law (`check-collisions`):**
   - Every composition must pass `python3 remotion_cli.py check-collisions <Composition>` with exit code 0. Overlap between toolhead and workpiece cannot exceed 10.0%, and toolhead cannot penetrate into the anvil bed (> 0.0%).

3. **4-View Model Inspection Rig (`ModelInspector.tsx`):**
   - Pure Remotion 4-View 2×2 contact sheets via `python3 remotion_cli.py inspect <Composition>`.
   - Evaluates Front, Side, Top, and Heroic Iso 3/4 before stage integration.

4. **Image-Based Lighting (IBL / HDRI Environment):**
   - Mandatory `<Environment preset="warehouse" />` from `@react-three/drei`. Metal surfaces must reflect real industrial studio softboxes, not dark voids.

5. **Contact Shadows (Ambient Occlusion):**
   - Mandatory `<ContactShadows />` beneath machines to physically anchor them to the platform floor.

6. **Bevel Chamfers vs BoxGeometry:**
   - Machine bodies, frames, and housings (> 0.08m) must use `<RoundedBox radius={0.02..0.035}>` to catch specular highlights. Micro-details (< 0.05m) may use `<boxGeometry>`.

7. **Material Contrast Triad:**
   - Dark textured cast iron (`roughness: 0.7`) + Mirror chrome steel (`roughness: 0.08`, `metalness: 0.98`) + Polished brass/copper (`roughness: 0.15`, `metalness: 0.95`).

8. **Heroic Framing & Coaxial Alignment:**
   - Machine fills 60–65% of the vertical frame (`basePosition: [2.3, 1.8, 3.6]`).
   - Coaxial alignment along Y-axis: Motor on Top $\to$ Chuck in Middle $\to$ Bit pointing Down $\to$ Rock in Vise at Bottom. Zero 90° accidental tilts.

9. **Razor-Sharp Single-Island HUD:**
   - Zero text-shadow blur ghosts. Sharp, legible numbers on frosted graphite card. Zero natural words.

10. **Unified Smart Rendering & Local PC Export Law:**
    - **Never lock the 2-core cloud server into a 2-hour software CPU render by default.**
    - When QC #2 passes, package the project for the user's powerful PC:
      `python3 remotion_cli.py export-pc <Composition>`
      Produces `output/<project>/pc_bundle/<Composition>_pc_bundle.zip` with 1-click Windows `render.bat` (`--gl=angle --concurrency=8`) and `preview.bat`.
    - Or route to Google Colab Tesla T4 GPU: `python3 remotion_cli.py render <Composition>`
    - Force local 2-core server CPU only if user explicitly demands it: `python3 remotion_cli.py render <Composition> --cpu`.

---

## Crew Directory
- [`crew/director.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/director.md) — 4-act drama, BOM modular specs, heroic framing, crisp HUD.
- [`crew/tier_pairs.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/tier_pairs.md) — 4-Pair Parallel 3D Modeling & Forensic Audit Swarm with prompt templates.
- [`crew/3d_modeler.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/3d_modeler.md) — Pure Three.js geometry, RoundedBox bevels, material triad, socket anchors.
- [`crew/stage_compositor.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/stage_compositor.md) — Lean declarative stage assembly via `<ProceduralAssemblyRig />`.
- [`crew/mechanical_engineer.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/mechanical_engineer.md) — Engineering dispatcher & inside-out assembly law.
- [`crew/sound_editor.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/sound_editor.md) — 4-act multi-band ASMR soundscape (1160 frames).
- [`crew/ruthless_critic.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/ruthless_critic.md) — Dual-stage QC gatekeeper: 4-View model audit + 8-keyframe motion audit.
