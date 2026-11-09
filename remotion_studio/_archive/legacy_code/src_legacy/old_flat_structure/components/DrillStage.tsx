import React from "react";
import { useCurrentFrame } from "remotion";
import { getCurrentTier } from "./StageTimeline";
import { RockSpecimen } from "./RockSpecimen";
import { ManualAugerDrill } from "./ManualAugerDrill";
import { GasMotorDrill } from "./GasMotorDrill";
import { DiamondCoreDrill } from "./DiamondCoreDrill";
import { PlasmaTunnelShield } from "./PlasmaTunnelShield";

export const DrillStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);

  return (
    <group position={[0, -2.04, 0]}>
      {/* Central Rock Specimen clamped in Heavy Steel Vise (Active across all 4 tiers) */}
      <RockSpecimen />

      {/* Tier 1: Manual Auger Drill ($10, Frames 0..289) */}
      {tier === 1 && <ManualAugerDrill />}

      {/* Tier 2: Gas Motor Drill ($100, Frames 290..579) */}
      {tier === 2 && <GasMotorDrill />}

      {/* Tier 3: Diamond Core Drill ($1 000, Frames 580..869) */}
      {tier === 3 && <DiamondCoreDrill />}

      {/* Tier 4: Plasma Tunnel Shield ($100 000+, Frames 870..1159) */}
      {tier === 4 && <PlasmaTunnelShield />}
    </group>
  );
};
