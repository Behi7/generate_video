import React from "react";
import { useCurrentFrame } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { ProceduralAssemblyRig } from "./ProceduralAssemblyRig";
import { ShredderSpecimen } from "./ShredderSpecimen";
import { Tier1AssemblySpec } from "./Tier1_Manual";
import { Tier2AssemblySpec } from "./Tier2_Electric";
import { Tier3AssemblySpec } from "./Tier3_Hydraulic";
import { Tier4AssemblySpec } from "./Tier4_Futuristic";

export const ShredderStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  const isRunning = local >= 70 && local < 250;
  const isBroken = local >= 250;

  // Operating RPM calibrated to tier specifications
  let rpm = 0;
  if (isRunning) {
    switch (tier) {
      case 1:
        rpm = 90;
        break;
      case 2:
        rpm = 120;
        break;
      case 3:
        rpm = 35;
        break;
      case 4:
        rpm = 3600;
        break;
      default:
        rpm = 120;
    }
  }

  return (
    <group position={[0, -2.04, 0]}>
      {/* Central Crushing / Feeding Specimen across all 4 tiers */}
      <ShredderSpecimen localFrame={local} />

      {/* Tier 1 ($10, Frames 0..289): Manual Hand-Crank Desk Shredder */}
      {tier === 1 && (
        <ProceduralAssemblyRig
          key="tier1"
          spec={Tier1AssemblySpec}
          localFrame={local}
          isRunning={isRunning}
          rpm={rpm}
          isBroken={isBroken}
        />
      )}

      {/* Tier 2 ($100, Frames 290..579): Workshop Electric Twin-Shaft Shredder */}
      {tier === 2 && (
        <ProceduralAssemblyRig
          key="tier2"
          spec={Tier2AssemblySpec}
          localFrame={local}
          isRunning={isRunning}
          rpm={rpm}
          isBroken={isBroken}
        />
      )}

      {/* Tier 3 ($1 000, Frames 580..869): Heavy Industrial 2-Shaft Shredder */}
      {tier === 3 && (
        <ProceduralAssemblyRig
          key="tier3"
          spec={Tier3AssemblySpec}
          localFrame={local}
          isRunning={isRunning}
          rpm={rpm}
          isBroken={isBroken}
        />
      )}

      {/* Tier 4 ($100 000+, Frames 870..1159): Quantum Magnetic Plasma Disintegrator */}
      {tier === 4 && (
        <ProceduralAssemblyRig
          key="tier4"
          spec={Tier4AssemblySpec}
          localFrame={local}
          isRunning={isRunning}
          rpm={rpm}
          isBroken={isBroken}
        />
      )}
    </group>
  );
};
