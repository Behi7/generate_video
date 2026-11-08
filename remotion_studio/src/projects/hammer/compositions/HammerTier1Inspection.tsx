import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { HammerTier1Spec } from "../components/HammerTier1_Manual";

export const HammerTier1Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Hammer Tier 1: Manual Sledge • Forensic 4-View Audit"
      subtitle="Cast Anvil Base + Hardwood Shaft + Steel Collar + Fixing Wedge + Sledge Head"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Hammer Tier 1 model at frame 150 */}
      <ProceduralAssemblyRig
        spec={HammerTier1Spec}
        localFrame={150}
        isRunning={true}
        rpm={90}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default HammerTier1Inspection;
