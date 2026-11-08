import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { IndustrialOilDrum, DRUM_COLOR_PRESETS } from "../environment/props/IndustrialOilDrum";

export const OilDrumInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial 55-Gallon Steel Oil Drum (208L) • Forensic 4-View Audit"
      subtitle="Curled Chime Rims + Embossed Rolling Hoops + Recessed Lid (0.03m) + 2' & 3/4' Threaded Bung Caps"
      cameraTarget={[0, 0, 0]}
      cameraDistanceMultiplier={0.52}
      gridY={-0.44}
      shadowY={-0.45}
    >
      {/* Primary Hero Drum: Dark Weathered Olive-Drab (#2F3E30) */}
      <IndustrialOilDrum
        position={[-0.22, -0.44, 0]}
        rotation={[0, 0, 0]}
        color={DRUM_COLOR_PRESETS.WEATHERED_OLIVE}
        metalness={0.74}
        roughness={0.48}
        bungRotation={0}
      />

      {/* Secondary Companion Drum: Charcoal Anthracite (#22272F) with offset angle */}
      <IndustrialOilDrum
        position={[0.42, -0.44, -0.12]}
        rotation={[0, 1.35, 0]}
        color={DRUM_COLOR_PRESETS.CHARCOAL_ANTHRACITE}
        metalness={0.78}
        roughness={0.44}
        bungRotation={1.2}
      />
    </ModelInspector>
  );
};

export default OilDrumInspection;
