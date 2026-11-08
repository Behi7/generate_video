# Canonical Component Catalog (Triple-A / Gen 4 Architecture)

All production-grade compositions in `remotion_studio/` rely on this modular suite of components conforming to the 1160-frame (38.67s @ 30 FPS) canonical standard.

---

## 1. Timeline & Core Infrastructure

### `StageTimeline.ts`
* **Purpose:** Mathematical foundation for the 1160-frame timeline.
* **Constants:**
  * `TIER_DURATION_FRAMES = 290` (~9.67s per tier)
  * `TOTAL_DURATION_FRAMES = 1160` (38.67s @ 30 FPS)
* **Act Ranges:**
  * `assembly`: `0 .. 69` (70 frames / 2.33s)
  * `startup`: `70 .. 149` (80 frames / 2.67s)
  * `operating`: `150 .. 249` (100 frames / 3.33s)
  * `destruction`: `250 .. 289` (40 frames / 1.33s)

### `TestingBayEnvironment.tsx`
* **Purpose:** High-Key industrial cleanroom testing bay eliminating dark-void rendering.
* **Key Features:**
  * Drei `<Environment preset="warehouse" />` for physical metallic IBL reflections.
  * `<ContactShadows />` beneath machines with deep ambient occlusion.
  * 6 vertical LED light-bars on rear slate wall (`#1E293B`) providing depth and rim lighting.
  * Titanium pedestal with glowing cyan border ring.

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

### `SparkBurst.tsx`
* **Purpose:** High-energy directional spark particle burst for magnetic impacts, lever throws, and ruptures.

### `MagneticSnap.tsx` & `PhysicalFracture.tsx`
* **Purpose:** Reusable procedural animation wrappers that handle magnetic arrival and overload destruction without manual per-mesh math.
