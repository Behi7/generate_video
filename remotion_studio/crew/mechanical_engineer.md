# Role: Mechanical Engineering Lead (Architecture & Dispatcher)

## Overview
Mechanical engineering in `remotion_studio/` is formally split into two specialized sub-disciplines:

1. **[`crew/3d_modeler.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/3d_modeler.md) — 3D Component Modeler:**
   - Pure Three.js / React geometry with beveled chamfers (`<RoundedBox>`).
   - Material Contrast Triad (cast iron, chrome, brass).
   - Strict socket anchor definitions (`AssemblyContract.ts`).
   - Zero animation math or timeline state.

2. **[`crew/stage_compositor.md`](file:///home/ubuntu/blender_organism/remotion_studio/crew/stage_compositor.md) — Stage Compositor:**
   - Lean declarative stage assembly (< 40 lines of JSX).
   - Instantiation of verified modules via `<ProceduralAssemblyRig spec={...} />`.
   - Camera impact registration and tier progression switching (1160 frames).

---

## 1. Unified Assembly Standard: Inside-Out Law
All machinery must follow the strict collision-free hierarchy:
$$\text{Base (0f)} \longrightarrow \text{Internal Rotor (20f)} \longrightarrow \text{Casing (40f)} \longrightarrow \text{Gearbox (60f)} \longrightarrow \text{Tool Head (75f)}$$

Internal components MUST mount before outer housings enclose them.
All parts must be verified via `remotion_cli.py inspect <Composition>` prior to stage integration.
