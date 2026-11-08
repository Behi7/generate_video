import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { HammerTier4Spec } from "../components/HammerTier4_Futuristic";

export const HammerTier4Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Hammer Tier 4: Quantum Kinetic Rail-Hammer • Forensic 4-View Audit"
      subtitle="Maglev Bed + Linear Rail Cores + Cryo Jacket + Capacitor Banks + Tachyon Slug"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Hammer Tier 4 model at frame 150 */}
      <ProceduralAssemblyRig
        spec={HammerTier4Spec}
        localFrame={150}
        isRunning={true}
        rpm={90}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default HammerTier4Inspection;
