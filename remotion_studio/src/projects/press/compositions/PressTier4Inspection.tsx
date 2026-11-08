import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { PressTier4Spec } from "../components/PressTier4_Futuristic";

export const PressTier4Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Press Tier 4: Superconducting Quantum Pinch Press • Forensic 4-View Audit"
      subtitle="Carbon Plinth + Toroidal Coils + Armor Pylons + Flux Manifolds + Maglev Pinch Die"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show fully assembled Press Tier 4 model at localFrame 150 (TDC operating state, 32 cm air gap) */}
      <ProceduralAssemblyRig
        spec={PressTier4Spec}
        localFrame={150}
        isRunning={true}
        rpm={3600}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default PressTier4Inspection;
