import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { CoiledHose } from "../environment/props/CoiledHose";

export const CoiledHoseInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial Environment Asset • Heavy 15m Coiled Hydraulic Hose • 4-View Forensic Audit"
      subtitle="Reinforced Double-Wire Braid Rubber • Swaged Steel Ferrules • Solid Brass Quick-Disconnect Coupler"
      modelCenter={[0, 0, 0]}
      cameraTarget={[-0.18, 0.10, -0.08]}
      cameraDistanceMultiplier={0.52}
      gridY={0}
      shadowY={-0.002}
    >
      <CoiledHose variant="rubber_hydraulic" />
    </ModelInspector>
  );
};

export default CoiledHoseInspection;
