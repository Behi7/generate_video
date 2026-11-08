import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { MetalBucket } from "../environment/props/MetalBucket";

export const MetalBucketInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial Metal Bucket • Forensic 4-View Audit"
      subtitle="Galvanized Zinc Pail + Rolled Chime Rim + Beading Ribs + Riveted Ear Brackets + Wire Bail Handle"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, 0.22, 0]}
      cameraDistanceMultiplier={0.28}
      gridY={0}
      shadowY={-0.002}
    >
      <MetalBucket handleAngle={0.72} gripType="wood" />
    </ModelInspector>
  );
};

export default MetalBucketInspection;
