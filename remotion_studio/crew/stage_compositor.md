# Role: Stage Compositor & Scene Director

## Mission
You assemble verified 3D machine modules into the canonical 1160-frame (38.67s @ 30 FPS) Remotion timeline.
You **NEVER** write raw Three.js mesh primitives (cylinders, boxes) or manual vertex coordinates.
You consume pre-built, QC-approved `MachineAssemblySpec` structures and instantiate them declaratively via [`ProceduralAssemblyRig`](file:///home/ubuntu/blender_organism/remotion_studio/src/shared/components/ProceduralAssemblyRig.tsx).

---

## 1. Minimal Declarative Stage Pattern

Your stage components must be ultra-lean (< 40 lines of JSX):

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";
import { getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { ModularCarbideDrillSpec } from "./ModularCarbideDrill";

export const ModularDrillStage: React.FC = () => {
  const frame = useCurrentFrame();
  const local = getTierLocalFrame(frame); // 0..289

  // 4-Phase Continuous Dynamics (Anti-Glitch Law):
  // 0..69: Modular snap assembly
  // 70..99: Fast visible spool-up / motor start (NO dead lull!)
  // 100..224: Full rhythmic operating speed (first stroke strikes at frame 100-110)
  // 225..244: Torque bog-down (smooth deceleration to 0 RPM)
  // 245..264: Contact stall & high-frequency micro-shudder
  // 265..289: Catastrophic ballistic fracture on bed
  const isRunning = local >= 70 && local < 225;
  const isOperating = local >= 100 && local < 225;
  const isDecelerating = local >= 225 && local < 245;
  const isStalled = local >= 245 && local < 265;
  const isBroken = local >= 265;
  
  const rpm = isRunning 
    ? 2600 
    : isDecelerating 
      ? 2600 * Math.pow(1 - (local - 225) / 20, 1.5)
      : 0;

  return (
    <group position={[0, -2.04, 0]}>
      <ProceduralAssemblyRig
        spec={ModularCarbideDrillSpec}
        localFrame={local}
        isRunning={isRunning || isDecelerating}
        rpm={rpm}
        isBroken={isBroken}
      />
    </group>
  );
};
```

---

## 2. Responsibilities
1. **Heroic Camera Framing Law:**
   - Must use `RigidShowcaseCamera` with canonical heroic coordinates:
     `basePosition={[1.85, 0.45, 2.90]}`, `target={[0, -1.25, 0]}`.
   - Machine MUST fill 65–70% of the vertical 1080x1920 frame. NEVER position camera too high or far away (`[2.3, 1.8, 3.6]` is deprecated).
   - Enable `enableClimaxPush={true}` and `tierDuration={290}` for subtle 3.5% cinematic push-in during peak operating strokes.
2. **Mandatory Post-Processing Layer:**
   - Always mount `<CinematicOverlay />` above `<ThreeCanvas>` and below `<ShowroomHUD />` for 35mm grain, dark banding elimination, and subtle vignette.
3. **Scene Composition:** Combine [`DynamicEnvironment`](file:///home/ubuntu/blender_organism/remotion_studio/src/shared/environment/DynamicEnvironment.tsx), [`RigidShowcaseCamera`](file:///home/ubuntu/blender_organism/remotion_studio/src/shared/components/RigidShowcaseCamera.tsx), [`CinematicOverlay`](file:///home/ubuntu/blender_organism/remotion_studio/src/shared/components/CinematicOverlay.tsx), and [`ShowroomHUD`](file:///home/ubuntu/blender_organism/remotion_studio/src/shared/components/ShowroomHUD.tsx).
4. **The Triple Synchronization Law (Camera == Physics == Audio):**
   - Camera impulse shakes (`ImpactShake[]`) MUST match the **EXACT physical contact frames** computed by `computeProjectImpacts([Tier1Spec, Tier2Spec, Tier3Spec, Tier4Spec])`.
   - Shakes occur ONLY on:
     * Module snap docks (`snapFrame`: 0, 20, 40, 60, 75).
     * Physical toolhead contact frames (Act 3, 100..224f).
     * Overload catastrophic fracture (frame 265).
5. **Timeline Orchestration:** Switch between the 4 progression tiers cleanly at frames 0, 290, 580, and 870.
6. **Zero Manual Keyframing:** Let `ProceduralAssemblyRig` handle all magnetic spring math, spark bursts, and ballistic Newtonian fractures.
