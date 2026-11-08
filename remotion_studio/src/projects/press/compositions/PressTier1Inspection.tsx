import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { PressTier1Spec } from "../components/PressTier1_Manual";

export const PressTier1Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Press Tier 1: $10 Manual Flywheel Screw Press • Forensic 4-View Audit"
      subtitle="C-Frame Anvil Base + Bronze Acme Screw + Arched Gantry + Dual-Ball Flywheel + Toolhead Die"
      modelCenter={[0, -1.00, 0]}
    >
      {/* Fully assembled Manual Press at TDC resting frame 150 */}
      <ProceduralAssemblyRig
        spec={PressTier1Spec}
        localFrame={150}
        isRunning={true}
        rpm={60}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default PressTier1Inspection;
