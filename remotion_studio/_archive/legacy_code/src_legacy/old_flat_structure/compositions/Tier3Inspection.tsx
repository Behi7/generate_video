import React from "react";
import { ModelInspector } from "./ModelInspector";
import { ProceduralAssemblyRig } from "../components/ProceduralAssemblyRig";
import { Tier3AssemblySpec } from "../components/Tier3_Hydraulic";

export const Tier3Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Tier 3 Industrial Hydraulic Shredder • Forensic 4-View Audit"
      subtitle="H-Frame Bed + Mirror Chrome Hex Shafts + Ribbed Chamber & Hopper + Dual Manifold & Gearboxes + Discharge Bin"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show the fully assembled Tier 3 model at frame 150 (Act 3 steady operating state) */}
      <ProceduralAssemblyRig
        spec={Tier3AssemblySpec}
        localFrame={150}
        isRunning={true}
        rpm={35}
        isBroken={false}
      />
    </ModelInspector>
  );
};
