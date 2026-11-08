import React from "react";
import { ModelInspector } from "./ModelInspector";
import { HeavyIndustrialShredder } from "../components/HeavyIndustrialShredder";

export const ShredderInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Heavy Industrial Dual-Shaft Shredder • Forensic 4-View Audit"
      subtitle="Hex Shafts + 5-Hook Claw Blades + Ribbed Cast Hopper + Planetary Drives"
      modelCenter={[0, -1.04, 0]}
    >
      {/* Show the fully assembled Tier 3 model at frame 150 (Act 3 steady operating state) */}
      <HeavyIndustrialShredder localFrame={150} />
    </ModelInspector>
  );
};
