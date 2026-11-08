import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { Tier2AssemblySpec } from "../components/Tier2_Electric";

export const Tier2Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Tier 2 Electric Dual-Shaft Shredder • Forensic 4-View Audit"
      subtitle="Pedestal + Armature Rotor + Stator Chamber + Roller Chain + Carbide Cutter Discs"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Fully assembled Tier 2 model at frame 150 (Act 3 steady operating state) */}
      <ProceduralAssemblyRig
        spec={Tier2AssemblySpec}
        localFrame={150}
        isRunning={true}
        rpm={120}
        isBroken={false}
      />
    </ModelInspector>
  );
};
