import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { ModularCarbideDrillSpec } from "../components/ModularCarbideDrill";

export const CarbideDrillInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Modular Carbide Drill • Forensic 4-View Audit"
      subtitle="Base + Crankshaft + Engine Casing + Gearbox + Carbide Bit"
      modelCenter={[0, -0.15, 0]}
    >
      {/* Show the fully assembled model (frame 150 = Act 3 steady operating state) */}
      <ProceduralAssemblyRig
        spec={ModularCarbideDrillSpec}
        localFrame={150}
        isRunning={true}
        rpm={2400}
        isBroken={false}
      />
    </ModelInspector>
  );
};
