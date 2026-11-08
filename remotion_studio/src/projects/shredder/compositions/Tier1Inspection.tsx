import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { Tier1AssemblySpec } from "../components/Tier1_Manual";

export const Tier1Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Tier 1: Manual Desk Shredder • Forensic 4-View Audit"
      subtitle="Vise Clamp + Dual Shafts + Skeleton Frame + Brass Hand-Crank + Slitter Blades"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Tier 1 model at frame 150 (Act 3 steady operating state) */}
      <ProceduralAssemblyRig
        spec={Tier1AssemblySpec}
        localFrame={150}
        isRunning={true}
        rpm={90}
        isBroken={false}
      />
    </ModelInspector>
  );
};
