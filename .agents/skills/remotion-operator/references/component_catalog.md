# Canonical Component Catalog (Triple-A / Gen 4 Architecture)

All production-grade compositions in `remotion_studio/` rely on this modular suite of components conforming to the 1280-frame (42.67s @ 30 FPS) canonical standard.

---

## 1. Timeline & Core Infrastructure

### `StageTimeline.ts`
* **Purpose:** Mathematical foundation for the 1280-frame timeline.
* **Constants:**
  * `TIER_DURATION_FRAMES = 320` (~10.67s per tier)
  * `TOTAL_DURATION_FRAMES = 1280` (42.67s @ 30 FPS)
* **Act Ranges:**
  * `assembly`: `0 .. 62` (63 frames / 2.10s)
  * `startup`: `63 .. 122` (60 frames / 2.00s)
  * `operating`: `123 .. 212` (90 frames / 3.00s exact)
  * `destruction`: `213 .. 319` (107 frames / 3.57s, rupture at 234f, clean table by 308f)

### `DynamicEnvironment.tsx`
* **Purpose:** 20-block LEGO environment kit eliminating dark-void rendering and solid continuous floor.
* **Themes:** `factory`, `garage`, `cyberpunk`, `cleanroom`, `dark_studio`.
* **Key Features:**
  * Drei `<Environment preset="warehouse" />` for physical metallic IBL reflections.
  * Continuous solid floors (DiamondPlateSteel, ConcreteFactorySlab, HexNeonGrid, etc.) with zero floor holes or cutouts.
  * `<ContactShadows />` beneath machines with deep ambient occlusion.
  * Atmospheric dust and modular rim light bars.

### `RigidShowcaseCamera.tsx`
* **Purpose:** Dead-locked 2.5D Isometric 3/4 camera rig.
* **Key Features:**
  * Heroic framing: `basePosition={[2.3, 1.8, 3.6]}`, `target={[0, -0.35, 0]}`.
  * Fills 60–65% of the 9:16 vertical viewport.
  * Zero continuous sinusoidal sway.
  * Discrete `ImpactShake` micro-impulses during snaps, triggers, and fractures.

### `ShowroomHUD.tsx`
* **Purpose:** Zero-language viral metric HUD.
* **Key Features:**
  * Single Dynamic Island frosted glass pill at top (`backdropFilter: blur(20px)`).
  * 4 progression tiers: `$10 (1x)` → `$100 (10x)` → `$1 000 (100x)` → `$100 000+ (10 000x)`.
  * Crisp 1px drop-shadow (zero blurry double-vision text halos).
  * Real-time formatted numeric coin counter with universal space separators.

---

## 2. Active Progression Suites

### Drill Progression (`DrillProgression.tsx` & `DrillStage.tsx`)
* **Specimen Bed (`RockSpecimen.tsx`):**
  * Heavy monolithic steel vise with ACME screw and dove-tail ways.
  * Tier 1: Sedimentary sandstone block with crumbly debris rim and conical crater.
  * Tier 2: Volcanic basalt block with cylindrical borehole, rock chips, and sparks.
  * Tier 3: Granite/concrete block with precision annular kerf trench, core pin, and water spray foam.
  * Tier 4: Obsidian meteorite block with glowing molten plasma channels and laser kerfs.

* **Machine Tiers:**
  1. `ManualAugerDrill.tsx` (Tier 1: $10, frames 0–289):
     * Helical tool-steel spiral, T-handle with polished brass grips.
     * Snaps at frame 265: handle flings in parabolic arc, spiral shears in stone.
  2. `GasMotorDrill.tsx` (Tier 2: $100, frames 290–579):
     * 2-stroke engine with finned cylinder, clutch lever trigger, roller chain drive.
     * Blowout at frame 555: shear pin snaps, chain whips onto bed, exhaust flame puff.
  3. `DiamondCoreDrill.tsx` (Tier 3: $1 000, frames 580–869):
     * Blue vertical column, motor carrier, red mushroom switch, water manifold.
     * Rupture at frame 845: water hammer, 2.5m vertical steam cone blowout, carrier shears.
  4. `PlasmaTunnelShield.tsx` (Tier 4: $100 000+, frames 870–1159):
     * Titanium shield, transparent quartz viewport, armored cable plug slam (electric arc).
     * 4 converging laser beams, blinding plasma singularity flare, golden coin fountain.

---

## 3. FX & Modular Nodes

### `ProceduralAssemblyRig.tsx`
* **Purpose:** Canonical assembly and ballistics rig wiring `MachineAssemblySpec` modules, magnetic snapping, fluid RPM deceleration, ballistic fracture ejection, and cleanser transitions.

### `CleanserTransitionWrapper.tsx`
* **Purpose:** Floor-agnostic active transition sweeper that cleanses machine debris between frames 234 and 307 across 4 modular effects:
  * `ash_disintegration`
  * `laser_scan_cleanser`
  * `pneumatic_air_blast`
  * `black_hole_singularity`

### `SparkBurst.tsx`
* **Purpose:** High-energy directional spark particle burst for magnetic impacts, lever throws, and ruptures.

### `MagneticSnap.tsx` & `PhysicalFracture.tsx`
* **Purpose:** Reusable procedural animation wrappers that handle magnetic arrival and overload destruction without manual per-mesh math.
