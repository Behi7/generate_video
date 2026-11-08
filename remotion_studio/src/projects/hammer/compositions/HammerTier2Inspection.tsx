import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { HammerTier2Spec } from "../components/HammerTier2_Electric";

export const HammerTier2Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Hammer Tier 2: $100 Electric Power Hammer • Forensic 4-View Audit"
      subtitle="Pedestal Bed + Armature Rotor Core + Finned Motor & Column + Flywheel V-Belt + Reciprocating Ram"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Hammer Tier 2 model at frame 150 */}
      <ProceduralAssemblyRig
        spec={HammerTier2Spec}
        localFrame={150}
        isRunning={true}
        rpm={120}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default HammerTier2Inspection;
