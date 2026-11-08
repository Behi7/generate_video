import React from "react";
import { useCurrentFrame } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { HammerSpecimen } from "./HammerSpecimen";
import { HammerTier1Spec } from "./HammerTier1_Manual";
import { HammerTier2Spec } from "./HammerTier2_Electric";
import { HammerTier3Spec } from "./HammerTier3_Hydraulic";
import { HammerTier4Spec } from "./HammerTier4_Futuristic";

export const HammerStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  // Machinery runs during Acts 2, 3 & 4 up until fracture rupture at frame 265
  const isRunning = local >= 70 && local < 265;
  // Overload fracture occurs at frame 265..289
  const isBroken = local >= 265;

  // Operating base RPM / rate calibrated to tier specifications
  let baseRpm = 90;
  switch (tier) {
    case 1:
      baseRpm = 90;
      break;
    case 2:
      baseRpm = 120;
      break;
    case 3:
      baseRpm = 40;
      break;
    case 4:
      baseRpm = 2400;
      break;
  }

  // Smooth 4-phase RPM deceleration & stall physics
  let rpm = 0;
  if (isRunning) {
    if (local < 225) {
      rpm = baseRpm;
    } else if (local < 245) {
      const pDecel = (local - 225) / 20;
      rpm = baseRpm * (1 - Math.pow(pDecel, 1.5));
    } else {
      rpm = 0;
    }
  }

  return (
    <group position={[0, -2.04, 0]}>
      {/* Tier 1 ($10, Frames 0..289): Manual Sledge Hammer */}
      {tier === 1 && (
        <group scale={[1.15, 1.15, 1.15]}>
          {/* Universal Specimen on Lower Anvil Bolster across all 4 tiers (Anti-Ghosting Law) */}
          <HammerSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier1"
            spec={HammerTier1Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 2 ($100, Frames 290..579): Electric Rotary Jackhammer */}
      {tier === 2 && (
        <group scale={[0.88, 0.88, 0.88]}>
          <HammerSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier2"
            spec={HammerTier2Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 3 ($1 000, Frames 580..869): Industrial Hydraulic Power Hammer */}
      {tier === 3 && (
        <group scale={[0.74, 0.74, 0.74]}>
          <HammerSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier3"
            spec={HammerTier3Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 4 ($100 000+, Frames 870..1159): Quantum Kinetic Rail-Hammer */}
      {tier === 4 && (
        <group scale={[1.0, 1.0, 1.0]}>
          <HammerSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier4"
            spec={HammerTier4Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}
    </group>
  );
};
