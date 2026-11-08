# Blueprint: EpicTransformation Composition

This blueprint serves as the reference architecture for creating high-retention 30 FPS vertical progression videos in `remotion_studio/`.

---

## Technical Specifications
* **Resolution:** 1080 × 1920 (9:16 Vertical Shorts/Reels)
* **Frame Rate:** 30 FPS
* **Total Frames:** 720 frames (24.0 seconds)
* **Budget per Tier:**
  * **Tier 1 ($10):** Frames 0 – 124 (Snap & break at 115)
  * **Tier 2 ($100):** Frames 125 – 309 (Snap at 133, trigger at 180, shear blowout at 300)
  * **Tier 3 ($1 000):** Frames 310 – 504 (Snap at 316, button trigger at 360, rupture at 495)
  * **Tier 4 ($100 000+):** Frames 505 – 720 (Snap at 514, cable trigger at 560, climax to 720)

---

## Minimal Root Composition Pattern

```tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { EpicTransformingStage } from "../components/EpicTransformingStage";
import { ShowroomHUD } from "../components/ShowroomHUD";

export const EpicTransformation: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Dynamic camera impulse shake on impacts & triggers
  let shakeX = 0;
  let shakeY = 0;
  // Apply shake formulas based on frame windows...

  const camZ = interpolate(frame, [0, 560, 720], [4.85, 4.85, 4.15], {
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#0F172A", position: "relative" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [shakeX, -0.95 + shakeY, camZ], fov: 42, near: 0.1, far: 50 }}
      >
        <TestingBayEnvironment />
        <EpicTransformingStage />
      </ThreeCanvas>

      <ShowroomHUD />
      <Audio src={staticFile("audio/master_asmr_track.wav")} volume={1.0} />
    </div>
  );
};
```
