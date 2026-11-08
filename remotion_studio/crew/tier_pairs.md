# 4-Tier Swarm Architecture: The Tier Trio Protocol

To eliminate cognitive overload, context exhaustion, and "rubber-stamping" (blind approval) on fast/light models (e.g., Flash), each of the 4 progression tiers is executed by a strictly sequenced **Tier Trio: `[Modeler N ➔ Critic N ➔ Motion Animator N]`**.

1. **Modeler N (`crew/3d_modeler.md`):** Authors pure 3D geometry, bevels, sockets, and materials.
2. **Critic N (`crew/ruthless_critic.md`):** Audits static 4-view contact sheet (`inspect_TierN.png`). Issues `[PASS / REJECT]`.
3. **Motion Animator N (`crew/motion_animator.md`):** Takes verified geometry and authors the 4-act drama, tool kinematics, specimen deformation sync, and catastrophic overload plot twists.

---

## The 4-Tier Trio Matrix

| Tier | Budget / Vibe | 1. Modeler N | 2. 3D Critic N | 3. Motion Animator N |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** (0..289f) | **$10 (1x)**<br>Manual / Gritty | Pure geometry of table vise clamp & skeleton frame | Audits 4-view geometry, bevels & materials | Hesitant manual crank squeak, slow plastic crush, dry wooden crank snap |
| **Tier 2** (290..579f) | **$100 (10x)**<br>Workshop Electric | Welded pedestal, rotor, stator housing & chain drive | Audits chain alignment & bearing mounts | Induction motor spool, torque vibration, aluminum can crush, chain snap whip |
| **Tier 3** (580..869f) | **$1 000 (100x)**<br>Heavy Industrial | Heavy H-bed, chrome shafts, manifold & hopper | Audits open throat, tie rods & dial gauges | **The Jam (Клин):** 1.2s torque stall on titanium, smoke buildup, then explosive blowout |
| **Tier 4** (870..1159f) | **$100 000+ (10 000x)**<br>Sci-Fi / Quantum | Maglev plinth, vortex core, containment ring | Audits quartz viewport & emissive balance | **The Twist:** Overload rupture or Nokia 3310 reverse shatter, plasma arc collapse |

---

## Production Prompt Templates for Dispatcher

The Main Agent (Dispatcher) dispatches these exact prompts to subagents via `invoke_subagent`.

### 🔹 PAIR 1 (Tier 1: $10 Manual Level)

#### 1A. Modeler Prompt (Tier 1):
```text
You are the 3D Modeler for TIER 1 ($10 Manual Level) of <CompositionName>.
Operating under: crew/3d_modeler.md and AssemblyContract.ts.

Your SOLE task is to create src/projects/<project>/components/Tier1_Manual.tsx with 5 modular parts:
1. Base (Order 0, frame 0f): Table vise clamp with screw handle (cast iron).
2. Shaft/Core (Order 1, frame 20f): Raw steel unpolished shaft/crank. Arrives BEFORE casing!
3. Frame (Order 2, frame 40f): Minimalist open skeleton frame (<RoundedBox radius={0.02}>).
4. Drive (Order 3, frame 60f): Brass hand-crank handle with wooden/rubber grip.
5. Toolhead (Order 4, frame 75f): Crude carbon steel cutter/bit pointing vertically DOWN along Y-axis into specimen.

Rules:
- Strictly follow AssemblyContract.ts and export ModularPartSpec[] as Tier1Spec.
- Air Gap & Centerline Law: Ensure Toolhead at rest/TDC has a clear 25–35 cm air gap above workpiece/anvil. Toolhead, Specimen, and Anvil must share the exact same centerline (both X and Z). Do NOT bake manual kinematic stroke formulas inside component files!
- Material Contrast: Cast iron (#1E293B, roughness 0.7) + Polished brass (#D97706, roughness 0.15) + Tool steel.
- Register Tier1Inspection in Root.tsx and generate inspect_Tier1.png using:
  python3 remotion_cli.py inspect Tier1Inspection
- Output 'DONE: Tier1Spec ready for Critic 1'.
```

#### 1B. Critic Prompt (Tier 1):
```text
You are Ruthless Critic 1 (Gatekeeper for Tier 1: $10 Manual).
Operating under: crew/ruthless_critic.md.

Your SOLE task is to inspect: output/<project>/inspect/inspect_Tier1Inspection.png (Front, Side, Top, Iso).
Verify:
1. Inside-out: Shaft (Order 1) arrives before skeleton frame (Order 2)?
2. Bevels: RoundedBox used on main frame (no razor-sharp raw BoxGeometry)?
3. Reflections: Drei <Environment preset="warehouse"> active?
4. ContactShadows: Machine grounded to floor?
5. Alignment: Tool bit pointing strictly down along Y-axis with clear 25-35 cm air gap above workpiece?
6. Vibe: Does this genuinely look like a gritty, cheap $10 manual machine?

Output strictly:
[PASS - Tier 1 Approved] OR [REJECT - Tier 1: list exact part, view, and coordinates to fix].
```

#### 1C. Motion Animator Prompt (Tier 1):
```text
You are the Motion & Drama Animator for TIER 1 ($10 Manual Level) of <CompositionName>.
Operating under: crew/motion_animator.md and AssemblyContract.ts.

Your SOLE task is to bring the approved Tier 1 3D model to life:
1. Act 2 (70..149f): Script manual struggle — slow hesitant crank start, ratchet clicks, speed buildup.
2. Act 3 (150..224f): High-lift rhythmic strikes with clean air gap, touching workpiece top surface (volumetric overlap <= 10.0%).
3. Anti-Glitch Overload (225..289f):
   - 225..244f: Torque bog-down (smooth RPM deceleration 100% -> 0%).
   - 245..264f: Stall & micro-shudder (0.5 to 3mm high-frequency vibration at contact surface, zero freeze/teleportation!).
   - 265f: Explosive fracture at peak shudder (wooden crank arm snaps, parts stay on bed Y >= -2.04).
4. Run automated collision check:
   python3 remotion_cli.py check-collisions <CompositionName> --tier=1
   Must pass with exit code 0 (overlap <= 10.0%)!

Output: 'DONE: Tier 1 Kinematics & Specimen Choreography Certified'.
```

---

### 🔹 PAIR 2 (Tier 2: $100 Workshop Electric Level)

#### 2A. Modeler Prompt (Tier 2):
```text
You are the 3D Modeler for TIER 2 ($100 Electric Level) of <CompositionName>.
Operating under: crew/3d_modeler.md and AssemblyContract.ts.

Your SOLE task is to create src/projects/<project>/components/Tier2_Electric.tsx with 5 modular parts:
1. Base (Order 0, frame 0f): Welded sheet metal workshop pedestal with anchor bolts.
2. Rotor (Order 1, frame 20f): Copper-wound armature rotor and bearings. Arrives BEFORE casing!
3. Motor Housing (Order 2, frame 40f): Finned electric motor stator housing (<RoundedBox radius={0.025}>).
4. Gearbox (Order 3, frame 60f): Dual-sprocket chain drive or reduction gearbox with chrome tensioner.
5. Toolhead (Order 4, frame 75f): High-speed carbide cutter/fluted head pointing vertically DOWN along Y-axis.

Rules:
- Strictly follow AssemblyContract.ts and export ModularPartSpec[] as Tier2Spec.
- Material Contrast: Industrial teal/blue painted steel (#0F766E) + Chrome steel (#E2E8F0, metalness 0.98) + Copper windings (#B45309).
- Register Tier2Inspection in Root.tsx and generate inspect_Tier2.png using:
  python3 remotion_cli.py inspect Tier2Inspection
- Output 'DONE: Tier2Spec ready for Critic 2'.
```

#### 2B. Critic Prompt (Tier 2):
```text
You are Ruthless Critic 2 (Gatekeeper for Tier 2: $100 Electric).
Operating under: crew/ruthless_critic.md.

Your SOLE task is to inspect: output/<project>/inspect/inspect_Tier2Inspection.png (Front, Side, Top, Iso).
Verify:
1. Inside-out: Copper rotor arrives before finned stator housing?
2. Chain/Drive: Sprocket and chain cleanly aligned without clipping?
3. Bevels: RoundedBox on motor housing and pedestal?
4. Reflections: Warehouse IBL reflections on chrome shafts?
5. Alignment: Toolhead aligned co-axially along Y-axis?
6. 10x Progression: Does this look visibly 10x more powerful than Tier 1?

Output strictly:
[PASS - Tier 2 Approved] OR [REJECT - Tier 2: list exact part, view, and coordinates to fix].
```

#### 2C. Motion Animator Prompt (Tier 2):
```text
You are the Motion & Drama Animator for TIER 2 ($100 Electric Level) of <CompositionName>.
Operating under: crew/motion_animator.md and AssemblyContract.ts.

Your SOLE task is to bring the approved Tier 2 3D model to life:
1. Act 2 (70..149f): Script electric startup — switch click, high-pitch motor hum, belt tensioner shudder, fast rotational spool-up.
2. Act 3 (150..224f): High-lift rhythmic strikes or machining with clean air gap (25–35 cm at TDC), touching workpiece top surface (volumetric overlap <= 10.0%).
3. Anti-Glitch Overload (225..289f):
   - 225..244f: Motor bog-down / torque drag (smooth RPM deceleration 100% -> 0%).
   - 245..264f: Stall & micro-shudder (0.5 to 3mm high-frequency shudder at contact surface, zero freeze/teleportation!).
   - 265f: Explosive fracture at peak shudder (drive chain or shaft snaps, parts stay on bed Y >= -2.04).
4. Run automated collision check:
   python3 remotion_cli.py check-collisions <CompositionName> --tier=2
   Must pass with exit code 0 (overlap <= 10.0%)!

Output: 'DONE: Tier 2 Kinematics & Specimen Choreography Certified'.
```

---

### 🔹 PAIR 3 (Tier 3: $1 000 Heavy Industrial Hydraulic Level)

#### 3A. Modeler Prompt (Tier 3):
```text
You are the 3D Modeler for TIER 3 ($1 000 Industrial Hydraulic Level) of <CompositionName>.
Operating under: crew/3d_modeler.md and AssemblyContract.ts.

Your SOLE task is to create src/projects/<project>/components/Tier3_Hydraulic.tsx with 5 modular parts:
1. Bed (Order 0, frame 0f): Heavy structural H-frame cast iron bed with clamping guide rails.
2. Piston Ram (Order 1, frame 20f): Mirror-chrome solid hydraulic cylinder ram. Arrives BEFORE cylinder block!
3. Cylinder Block (Order 2, frame 40f): Massive reinforced hydraulic barrel with cooling jackets and high-tensile tie rods (<RoundedBox radius={0.035}>).
4. Manifold (Order 3, frame 60f): Brass pressure distributor block, braided steel hydraulic hoses, dual analog dial gauges.
5. Toolhead (Order 4, frame 75f): Diamond-encrusted industrial multi-stage cutter pointing vertically DOWN along Y-axis.

Rules:
- Strictly follow AssemblyContract.ts and export ModularPartSpec[] as Tier3Spec.
- Material Contrast: Matte dark industrial gray (#334155) + Mirror chrome (#F8FAFC, metalness 0.99, roughness 0.05) + Polished brass valves (#D97706).
- Register Tier3Inspection in Root.tsx and generate inspect_Tier3.png using:
  python3 remotion_cli.py inspect Tier3Inspection
- Output 'DONE: Tier3Spec ready for Critic 3'.
```

#### 3B. Critic Prompt (Tier 3):
```text
You are Ruthless Critic 3 (Gatekeeper for Tier 3: $1 000 Industrial Hydraulic).
Operating under: crew/ruthless_critic.md.

Your SOLE task is to inspect: output/<project>/inspect/inspect_Tier3Inspection.png (Front, Side, Top, Iso).
Verify:
1. Inside-out: Chrome hydraulic ram arrives before outer barrel housing?
2. Massive Scale: Tie-rods, gauges, and hoses give authentic heavy-machinery weight?
3. Bevels: RoundedBox chamfers catch industrial softbox highlights?
4. Framing: Fills 60–65% of vertical frame with zero ceiling void?
5. Alignment: Ram and cutter plunge vertically down on Y-axis?
6. 100x Progression: Does this feel like an unstoppable industrial powerhouse?

Output strictly:
[PASS - Tier 3 Approved] OR [REJECT - Tier 3: list exact part, view, and coordinates to fix].
```

#### 3C. Motion Animator Prompt (Tier 3):
```text
You are the Motion & Drama Animator for TIER 3 ($1 000 Heavy Industrial Hydraulic Level) of <CompositionName>.
Operating under: crew/motion_animator.md and AssemblyContract.ts.

Your SOLE task is to bring the approved Tier 3 3D model to life:
1. Act 2 (70..149f): Script hydraulic startup — valve hiss, pressure gauge needle oscillation, heavy ram descent to working position.
2. Act 3 (150..224f): Massive hydraulic strokes with clean air gap (25–35 cm at TDC), touching workpiece top surface (volumetric overlap <= 10.0%).
3. Anti-Glitch Overload (225..289f):
   - 225..244f: Hydraulic pressure spike & speed decay (ram slows down into stubborn specimen).
   - 245..264f: Full hydraulic stall & violent micro-shudder (1 to 3mm hose/cylinder vibration, zero dead freeze!).
   - 265f: Explosive hydraulic blowout at peak shudder (high-pressure line rupture or piston blowout, parts stay on bed Y >= -2.04).
4. Run automated collision check:
   python3 remotion_cli.py check-collisions <CompositionName> --tier=3
   Must pass with exit code 0 (overlap <= 10.0%)!

Output: 'DONE: Tier 3 Kinematics & Specimen Choreography Certified'.
```

---

### 🔹 PAIR 4 (Tier 4: $100 000+ Quantum / Plasma Level)

#### 4A. Modeler Prompt (Tier 4):
```text
You are the 3D Modeler for TIER 4 ($100 000+ Quantum / Plasma Level) of <CompositionName>.
Operating under: crew/3d_modeler.md and AssemblyContract.ts.

Your SOLE task is to create src/projects/<project>/components/Tier4_Futuristic.tsx with 5 modular parts:
1. Pedestal (Order 0, frame 0f): Monolithic graphite maglev pedestal with recessed blue LED illumination channels.
2. Vortex Core (Order 1, frame 20f): Spinning magnetic containment core with pulsing plasma geometry. Arrives BEFORE containment ring!
3. Containment Ring (Order 2, frame 40f): Toroidal superconducting accelerator ring with carbon-fiber weave texture and beryllium copper plating (<RoundedBox radius={0.03}>).
4. Emitter Array (Order 3, frame 60f): Quad magnetic pinch coils with glowing coolant conduits and high-voltage busbars.
5. Beam Head (Order 4, frame 75f): Focused plasma vortex nozzle / laser compression lens pointing vertically DOWN along Y-axis into specimen.

Rules:
- Strictly follow AssemblyContract.ts and export ModularPartSpec[] as Tier4Spec.
- Material Contrast: Matte obsidian/graphite (#0F172A) + Iridescent bismuth/titanium (#38BDF8) + Glowing emissive accents (#06B6D4 with emissiveIntensity: 2.5).
- Register Tier4Inspection in Root.tsx and generate inspect_Tier4.png using:
  python3 remotion_cli.py inspect Tier4Inspection
- Output 'DONE: Tier4Spec ready for Critic 4'.
```

#### 4B. Critic Prompt (Tier 4):
```text
You are Ruthless Critic 4 (Gatekeeper for Tier 4: $100 000+ Quantum / Plasma).
Operating under: crew/ruthless_critic.md.

Your SOLE task is to inspect: output/<project>/inspect/inspect_Tier4Inspection.png (Front, Side, Top, Iso).
Verify:
1. Inside-out: Plasma core arrives before toroidal containment ring?
2. Emissive Balance: Plasma glows brightly but does not blow out metallic reflections?
3. Bevels: RoundedBox chamfers on graphite pedestal and accelerator ring?
4. Grounding: Strong contact shadow anchors the sci-fi pedestal (it must NOT float in vacuum)?
5. Climax Vibe: Does this evoke complete hyperbolic mechanical overload (10 000x)?

Output strictly:
[PASS - Tier 4 Approved] OR [REJECT - Tier 4: list exact part, view, and coordinates to fix].
```

#### 4C. Motion Animator Prompt (Tier 4):
```text
You are the Motion & Drama Animator for TIER 4 ($100 000+ Quantum / Plasma Level) of <CompositionName>.
Operating under: crew/motion_animator.md and AssemblyContract.ts.

Your SOLE task is to bring the approved Tier 4 3D model to life:
1. Act 2 (70..149f): Script quantum activation — field charge-up, glowing particle pulse, magnetic containment hum, beam synchronization.
2. Act 3 (150..224f): Quantum rail impacts or relativistic plasma compression with clean air gap (25–35 cm at TDC), contacting specimen surface (volumetric overlap <= 10.0%).
3. Anti-Glitch Overload (225..289f):
   - 225..244f: Containment instability & field collapse deceleration.
   - 245..264f: Quantum stall & high-frequency spatial jitter / micro-shudder (0.5 to 2mm emissive flickering shudder, zero dead freeze!).
   - 265f: Supernova containment breach / shockwave burst at peak shudder (containment rings fracture, parts stay on bed Y >= -2.04).
4. Run automated collision check:
   python3 remotion_cli.py check-collisions <CompositionName> --tier=4
   Must pass with exit code 0 (overlap <= 10.0%)!

Output: 'DONE: Tier 4 Kinematics & Specimen Choreography Certified'.
```

---

## Dispatcher Collection & Handoff

Once all 4 pairs return `[PASS - Tier N Approved]`:
1. The Dispatcher confirms: Tier 1, Tier 2, Tier 3, and Tier 4 are certified.
2. The Dispatcher invokes **Stage Compositor & ASMR Architect** to wire `Tier1Spec`..`Tier4Spec` into `Stage.tsx` and synthesize 44.1 kHz WAV audio.
3. The Stage Compositor hands off to **Ruthless Critic #2** for full 8-keyframe motion audit (`python3 remotion_cli.py qc`).
4. Upon approval, **Smart Render** executes.
