import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { PressTier2Spec } from "../components/PressTier2_Electric";

/**
 * PressTier2Inspection.tsx
 * Forensic 4-View (2x2) Asset Audit Composition for Tier 2: $100 Motorized Eccentric Punch Press.
 * Audits Front (XY), Side (ZY), Top (XZ), and Heroic 3/4 Iso angles.
 */
export const PressTier2Inspection: React.FC = () => {
  return (
    <ModelInspector
      title="Press Tier 2: $100 Motorized Eccentric Flywheel Punch Press • Forensic 4-View Audit"
      subtitle="Welded H-Frame Chassis + Eccentric Crank & Bronze Conrod + Cast Iron Slideways + 40cm Flywheel & Induction Motor + Reciprocating Ram"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Frame 150: Fully assembled, TDC resting state with 32 cm air gap, operating ready state */}
      <ProceduralAssemblyRig
        spec={PressTier2Spec}
        localFrame={150}
        isRunning={true}
        rpm={180}
        isBroken={false}
      />
    </ModelInspector>
  );
};

export default PressTier2Inspection;
