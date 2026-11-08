# Anti-Patterns: Remotion Mechanical Video Engine

This reference catalogs strictly forbidden practices and obsolete patterns in `remotion_studio/`. If any of these are detected during development or Forensic QC, the render must be **immediately rejected**.

---

## 🚫 1. Humanoid Primitives & Stickmen (Violation of Law 1)
* **Legacy Example:** `src/_legacy/components/GlowStickman.tsx`
* **Anti-Pattern:** Building stickmen or humanoid characters from primitive cylinders, spheres, and ragdolls.
* **Why Forbidden:** Looks cheap, amateurish, and destroys technical engineering realism.
* **Rule:** Only precision hyperbolic engineering machinery, satisfying progression loops, and physical destruction.

---

## 🚫 2. Words & Spoken Language (Violation of Law 3)
* **Legacy Example:** `src/_legacy/components/KineticText.tsx`, `src/_legacy/components/HyperbolicHUD.tsx`
* **Anti-Pattern:** Displaying text captions or badges with human words in any language (e.g., «МАСШТАБ», «РУЧНОЙ ТРУД», «PUMP», «PRESSURE»).
* **Why Forbidden:** Destroys international virality. Global viewers scroll away when encountering foreign languages.
* **Rule:** Zero words in any language. Use strictly universal global symbols, currency (`$10` → `$100` → `$1 000` → `$100 000+`), multipliers (`1x` → `10x` → `100x` → `10 000x`), and metric icons (`💧`, `⚡`, `⚙️`).

---

## 🚫 3. Elevator Drops & Floor Sinking (Violation of Law 6)
* **Legacy Example:** `src/_legacy/components/TransformingStage.tsx` (`[-2.1, -2.1, -5.0]`)
* **Anti-Pattern:** Dropping machines into a floor hatch like a boring museum elevator.
* **Why Forbidden:** Anti-climactic. Destroys the tension and visceral thrill of high-performance progression.
* **Rule:** Machines must fail on the bed through **catastrophic physical overload**:
  * Tier 1: Manual tool overstrains, handle snaps, spiral flutes crack in stone.
  * Tier 2: Shear pin snaps, sprockets seize, roller chain whips violently onto bed.
  * Tier 3: Water hammer shockwave, 2.5m high-pressure steam blowout, motor rack shear.
  * Tier 4: Blinding central plasma singularity flare + golden coin fountain.

---

## 🚫 4. Floating Control Consoles (Violation of Law 7)
* **Legacy Example:** `src/_legacy/components/PhysicalControlConsole.tsx`
* **Anti-Pattern:** Hovering a generic sci-fi control panel or button console at the bottom of the screen.
* **Why Forbidden:** Feels disconnected, arcade-like, and fake.
* **Rule:** The interactive trigger must be **physically integrated on the machine itself**:
  * Tier 2: Heavy polished brass throw-lever mounted to the engine frame.
  * Tier 3: Industrial red mushroom emergency button on the motor housing.
  * Tier 4: Armored high-voltage umbilical cable slamming into the reactor socket with an electric arc discharge.

---

## 🚫 5. Pitch-Black Voids & Missing IBL (Violation of Law 8)
* **Anti-Pattern:** Placing machines in an unlit pitch-black void (`#04060A`) without Image-Based Lighting (`<Environment />`).
* **Why Forbidden:** Without reflections, metals (`metalness: 0.9`) render as dark, lifeless grey plastic.
* **Rule:** Always use `<TestingBayEnvironment />` equipped with `@react-three/drei` `<Environment preset="warehouse" />` and `<ContactShadows />`. Rear wall features vertical white LED light bars for sharp rim reflections.

---

## 🚫 6. Coaxial Misalignment & Sideways Mounting
* **Anti-Pattern:** Mounting drills, cutters, or toolheads at a 90° angle sideways into open air.
* **Why Forbidden:** Violates basic mechanical engineering and physics. Drills must point into the material they cut.
* **Rule (Coaxial Y-Axis Law):**
  $$\text{Drive (Top)} \longrightarrow \text{Gearbox/Spindle (Mid)} \longrightarrow \text{Tool Head (Down)} \longrightarrow \text{Rock/Specimen (Bed)}$$

---

## 🚫 7. Obsolete 24-Second / 720-Frame Limit
* **Legacy Example:** 720 frames (24.0s).
* **Anti-Pattern:** Compressing 4 progression tiers into rushed, unwatchable 6-second segments with 0.3s teleports.
* **Rule:** Render at **30 FPS, exactly 1160 frames (38.67s)**. Every tier receives exactly 290 frames (~9.67s) partitioned into 4 human-digestible acts:
  1. Act 1 (0..69f / 2.33s): Staggered Lego Snap Assembly
  2. Act 2 (70..149f / 2.67s): Startup Chain Reaction
  3. Act 3 (150..249f / 3.33s): Hypnotic ASMR Operation
  4. Act 4 (250..289f / 1.33s): Catastrophic Physical Overload

---

## 🚫 8. Raw Sharp-Edged Box Primitives on Machine Bodies
* **Anti-Pattern:** Using `<boxGeometry />` for large visible chassis, engines, manifolds, and frames.
* **Why Forbidden:** Sharp 90° computer edges make assets look like low-poly 2000s games.
* **Rule:**
  * Major parts ($> 0.08\text{m}$): STRICTLY `<RoundedBox radius={0.02..0.035} smoothness={4}>` to catch specular highlights.
  * Micro-details ($< 0.05\text{m}$): Standard `<boxGeometry />` is permitted for tiny gear teeth, electrical pins, and thin shims.

---

## 🚫 9. Drunken Sinusoidal Camera Sway
* **Anti-Pattern:** Applying continuous sinusoidal sway (`Math.sin(time) * 0.2`) or smooth continuous zooming.
* **Why Forbidden:** Causes motion sickness on mobile screens; looks like an amateur hand-held camera.
* **Rule:** The camera rig (`RigidShowcaseCamera.tsx`) is a **dead-locked heavy industrial tripod** at `[2.3, 1.8, 3.6]` targeting `[0, -0.35, 0]`. Camera movement is strictly limited to discrete **3–6 frame impact shakes** triggered by assembly snaps, clacks, and fractures.
