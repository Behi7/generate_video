import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { IndustrialBlastDoorWall } from "../environment/backdrops/IndustrialBlastDoorWall";

export const BlastDoorInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial Blast Door Wall • Class IV Armor Portal • Forensic 4-View Audit"
      subtitle="Deep Beveled Casing (0.44m) + X-Brace Stiffener Slab + 4 Welded Barrel Hinges + Rotary Dog Wheel + Vision Grate"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, -0.90, 0]}
      cameraDistanceMultiplier={2.10}
      gridY={-3.54}
      shadowY={-3.55}
    >
      <IndustrialBlastDoorWall
        position={[0, 0, 0]}
        beaconActive={true}
        beaconColor="#F59E0B"
      />
    </ModelInspector>
  );
};

export default BlastDoorInspection;
