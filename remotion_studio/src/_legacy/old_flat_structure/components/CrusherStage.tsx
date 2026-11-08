import React from "react";
import { useCurrentFrame } from "remotion";
import { getCurrentTier } from "./StageTimeline";
import { CrusherSpecimen } from "./CrusherSpecimen";
import { ManualScrewCrusher } from "./ManualScrewCrusher";
import { MotorPistonCrusher } from "./MotorPistonCrusher";
import { HydraulicPortalCrusher } from "./HydraulicPortalCrusher";
import { QuantumMagneticCrusher } from "./QuantumMagneticCrusher";

export const CrusherStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);

  return (
    <group position={[0, -2.04, 0]}>
      {/* Central Crushing Specimen & Anvil Bed (Active across all 4 tiers) */}
      <CrusherSpecimen />

      {/* Tier 1: Manual Screw Crusher ($10, Frames 0..289) */}
      {tier === 1 && <ManualScrewCrusher />}

      {/* Tier 2: 2-Stroke Motor Piston Crusher ($100, Frames 290..579) */}
      {tier === 2 && <MotorPistonCrusher />}

      {/* Tier 3: 100-Ton Hydraulic Portal Crusher ($1 000, Frames 580..869) */}
      {tier === 3 && <HydraulicPortalCrusher />}

      {/* Tier 4: Quantum Magnetic Plasma Crusher ($100 000+, Frames 870..1159) */}
      {tier === 4 && <QuantumMagneticCrusher />}
    </group>
  );
};