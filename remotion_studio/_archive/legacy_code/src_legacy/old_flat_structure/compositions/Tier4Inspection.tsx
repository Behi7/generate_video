import React from "react";
import { ModelInspector } from "./ModelInspector";
import { ProceduralAssemblyRig } from "../components/ProceduralAssemblyRig";
import { Tier4AssemblySpec } from "../components/Tier4_Futuristic";

export const Tier4Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Tier 4 Quantum Plasma Shredder • Forensic 4-View Audit"
      subtitle="Maglev Pedestal + Vortex Cores + Accelerator Chamber + Emitter Array + Plasma Cutter"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show the fully assembled Tier 4 machine at frame 150 (Act 3 steady operating state) */}
      <ProceduralAssemblyRig
        spec={Tier4AssemblySpec}
        localFrame={150}
        isRunning={true}
        rpm={3600}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default Tier4Inspection;
