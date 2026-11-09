# Role: Mechanical Engineering Lead (Architecture & Dispatcher)

## Overview
Mechanical engineering in `remotion_studio/` is formally split into two specialized sub-disciplines operating under the 1280-frame (42.67s @ 30 FPS) canonical standard:

1. **[`crew/3d_modeler.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/3d_modeler.md) — 3D Component Modeler:**
   - Pure Three.js / React geometry with beveled chamfers (`<RoundedBox>`).
   - Material Contrast Triad (cast iron, chrome, brass).
   - Strict socket anchor definitions (`AssemblyContract.ts`).
   - Zero animation math or timeline state in component files.

2. **[`crew/stage_compositor.md`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/crew/stage_compositor.md) — Stage Compositor:**
   - Lean declarative stage assembly (< 40 lines of JSX).
   - Instantiation of verified modules via `<ProceduralAssemblyRig spec={...} />`.
   - Integration of `<CleanserTransitionWrapper />` for floor-agnostic tier transitions.
   - Exact camera impact registration and tier progression switching (1280 frames total, 320 frames per tier).

---

## 1. Unified Assembly Standard: Inside-Out Law (Act 1: 0..62f)
All machinery must follow the strict collision-free hierarchy during Act 1:
$$\text{Base (0f)} \longrightarrow \text{Internal Rotor / Shaft (20f)} \longrightarrow \text{Outer Casing (40f)} \longrightarrow \text{Toolhead / Transmission (55..60f)}$$

Internal components MUST mount before outer housings enclose them.
All parts must be verified via `python3 remotion_cli.py inspect <Composition>` prior to stage integration.

---

## 2. Canonical Operational & Lifecycle Grid (0..319f Per Tier)
1. **Act 1: Assembly (0..62f / 63 frames = 2.10s):** Modular inside-out snap assembly of 4 structural modules.
2. **Act 2: Startup (63..122f / 60 frames = 2.00s):** Drive train spool-up, belt tensioning, 0% to 100% RPM ramp.
3. **Act 3: Operating (123..212f / 90 frames = 3.00s exact):** Steady-state work cycles at full rated power with clean 25–35 cm air gap at TDC.
4. **Act 4: Destruction & Cleanser (213..319f / 107 frames = 3.57s):**
   - **strain (213..224f / 12f):** Mechanical jam, exponential torque bog-down, RPM drops to 0.
   - **resonance (225..233f / 9f):** Resonant pre-fracture shudder wave (1.5mm to 18mm amplitude).
   - **ruptureAndCleanser (234..307f / 74f = 2.47s):** Catastrophic fracture detonation at frame 234 (`breakFrame = 234`) and active Cleanser Transition.
   - **settled (308..319f / 12f):** Pristine empty table, ready for the next tier.

---

## 3. Floor-Agnostic Cleanser Transition Standard
To ensure seamless visual integration on any environment floor (`factory`, `garage`, `cyberpunk`, `cleanroom`, `dark_studio`), all transitions operate without floor cutouts or trapdoors:
- `ash_disintegration`: Thermal incandescence & spark plume with wind dispersal.
- `laser_scan_cleanser`: Planar cryo-neon laser sweep vaporizing debris into plasma sparks.
- `pneumatic_air_blast`: High-pressure pneumatic ring blast with ballistic ricochet off-screen.
- `black_hole_singularity`: Airborne gravitational singularity with inclined accretion disk ($25^\circ$), 320 plasma particles, bipolar Hawking jets, and quantum implosion at frame 305..308.

Legacy `stage_drop_trap` and `WorkstationBed` cutouts are strictly deprecated and deleted.
