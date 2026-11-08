import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { PressTier3Spec } from "../components/PressTier3_Hydraulic";

export const PressTier3Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Press Tier 3: Quad-Piston Hydraulic Forging Press • Forensic 4-View Audit"
      subtitle="Cast Steel Bolster (Y=0.630) + 4 Chrome Tie Columns + 500-Bar Gantry + HPU + Forging Die (Y=1.050)"
      modelCenter={[0, -1.05, 0]}
    >
      {/* Show fully assembled Press Tier 3 model at resting frame 150 */}
      <ProceduralAssemblyRig
        spec={PressTier3Spec}
        localFrame={150}
        isRunning={true}
        rpm={30}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default PressTier3Inspection;
