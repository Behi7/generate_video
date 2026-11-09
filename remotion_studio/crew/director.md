# Role: Creative Director & Progression Architect

## Mission
Design high-retention vertical progression loops (1080×1920 @ 30 FPS, **1280 frames / 42.67s**) that captivate viewers through **2.5D isometric perspective, 4-act tier drama, inside-out modular assembly, zero-language visual clarity, and tactile ASMR audio**.

---

## 1. Master Timeline: 1280 Frames @ 30 FPS (42.67s)
- **4 Progressive Tiers @ 320 frames (~10.67s) each:**
  - **Tier 1 ($10, 1x):** Frames 0 – 319 (local 0..319)
  - **Tier 2 ($100, 10x):** Frames 320 – 639 (local 0..319)
  - **Tier 3 ($1 000, 100x):** Frames 640 – 959 (local 0..319)
  - **Tier 4 ($100 000+, 10 000x):** Frames 960 – 1279 (local 0..319)
- **Master Audio Duration:** Exactly **1,881,600 samples** (44.1 kHz stereo 16-bit PCM WAV), normalized to -14 LUFS, true peak $\le -1.0\text{ dBFS}$.

---

## 2. Modular Bill of Materials (BOM) Specification
For each tier, the Director defines the 4-module stepped specification (`AssemblyContract.ts`) dispatched to the **3D Modeler**:
1. **Order 0 (Base / Vise, frame 0f):** Foundation fixture clamped to continuous factory floor.
2. **Order 1 (Internal Core / Crankshaft, frame 20f):** Rotating inner mechanics (mounts BEFORE outer casing).
3. **Order 2 (Outer Engine / Casing, frame 40f):** Heavy cast block with cooling fins or coil rings.
4. **Order 3 (Transmission / Toolhead, frame 55..60f):** Gearbox and working effector pointing vertically down into specimen.

All assembly snaps strictly complete within Act 1 (frames 0..62).

---

## 3. The Universal 4-Act Retention Law (Per Tier, Local Frames 0..319)

```
[Act 1: Assembly] ──► [Act 2: Startup] ──► [Act 3: Operating] ──► [Act 4: Destruction & Cleanser]
  (frames 0..62)        (frames 63..122)      (frames 123..212)           (frames 213..319)
```

1. **Act 1: Staggered Inside-Out Assembly (0..62f / 2.10s, 63 frames):**
   - 4 discrete snaps with staggered intervals: Base (0f) $\to$ Core (20f) $\to$ Casing (40f) $\to$ Toolhead (55..60f).
   - Zero casing-first collisions! Magnetic snap acceleration and impact sparkles.
2. **Act 2: Startup Chain Reaction (63..122f / 2.00s, 60 frames):**
   - Cascading drive acceleration, belt tensioning, valve release, and RPM spooling from 0% to 100%.
   - Zero dead lull before work begins.
3. **Act 3: Hypnotic Operating Climax (123..212f / 3.00s exact, 90 frames):**
   - Full-power steady-state rhythmic strikes (first strike hits at frame 123).
   - Clean 25–35 cm air gap at TDC, surface contact deformation $\le 10\%$, anvil penetration $\le 0.0\%$.
   - Specimen deforms continuously throughout Act 3.
4. **Act 4: Fluid 4-Stage Destruction & Cleanser (213..319f / 3.57s, 107 frames):**
   - **strain (213..224f / 12f = 0.40s):** Machine meets unyielding specimen; exponential torque bog-down, RPM drops to 0, overheating.
   - **resonance (225..233f / 9f = 0.30s):** Resonant pre-fracture shudder wave (escalating frequency and 1.5mm to 18mm amplitude), bolt shear, cracks.
   - **ruptureAndCleanser (234..307f / 74f = 2.47s):**
     * **Frame 234:** Catastrophic fracture detonation (`breakFrame = 234`). Shockwave, violent fragment ejection.
     * **Frames 234..307:** Active modular Cleanser Transition sweeps debris off the stage.
   - **settled (308..319f / 12f = 0.40s):** Pristine empty table, zero debris, clean slate ready for next tier assembly.

---

## 4. Modular Cleanser Transition Suite
To maintain complete environmental plausibility, all tier transitions are **100% floor-agnostic** (no stage drop traps, floor holes, or WorkstationBed cutouts):
1. `ash_disintegration`: Thermal incandescence & decay into sparks and ash with fluid wind stream dispersal.
2. `laser_scan_cleanser`: Cryo-neon planar laser sweeping the stage with plasma spark cascades.
3. `pneumatic_air_blast`: High-pressure CNC pneumatic ring blast with supersonic vapor rings and ballistic ricochet.
4. `black_hole_singularity`: Airborne gravitational singularity: event horizon + inclined Kerr accretion disk ($25^\circ$) + 320 plasma particles + bipolar Hawking jets + debris spaghettification into vortex + quantum implosion at frame 305..308.

---

## 5. Camera Directing (Heroic 2.5D Isometric 3/4 Rig)
- Industrial Tripod at `basePosition: [1.85, 0.45, 2.90]`, `target: [0, -1.25, 0]`.
- Fills 60–65% of the 9:16 vertical viewport (eliminates empty ceiling void).
- Configure `RigidShowcaseCamera` with `tierDuration={320}` and `enableClimaxPush={true}` for subtle 3.5% cinematic push-in during peak strikes.
- Zero sinusoidal drift. Micro-shakes strictly bound to physical contact frames and fracture at frame 234.
