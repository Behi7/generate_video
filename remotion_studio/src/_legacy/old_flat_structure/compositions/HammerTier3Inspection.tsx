import React from "react";
import { ModelInspector } from "./ModelInspector";
import { ProceduralAssemblyRig } from "../components/ProceduralAssemblyRig";
import { HammerTier3Spec } from "../components/HammerTier3_Hydraulic";

export const HammerTier3Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Hammer Tier 3: Industrial Hydraulic Power Hammer • Forensic 4-View Audit"
      subtitle="H-Frame Bed + Chrome Hydraulic Ram + Steel Gantry + Valve Manifold + Forging Die"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Hammer Tier 3 model at frame 150 */}
      <ProceduralAssemblyRig
        spec={HammerTier3Spec}
        localFrame={150}
        isRunning={true}
        rpm={90}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default HammerTier3Inspection;
