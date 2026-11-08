import React from "react";
import { useCurrentFrame } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { PressSpecimen } from "./PressSpecimen";
import { PressTier1Spec } from "./PressTier1_Manual";
import { PressTier2Spec } from "./PressTier2_Electric";
import { PressTier3Spec } from "./PressTier3_Hydraulic";
import { PressTier4Spec } from "./PressTier4_Futuristic";

export const PressStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  // Machinery runs during Acts 2, 3 & 4 up until fracture rupture at frame 265
  const isRunning = local >= 70 && local < 265;
  // Overload fracture occurs at frame 265..289
  const isBroken = local >= 265;

  // Operating base RPM / rate calibrated to tier specifications
  let baseRpm = 60;
  switch (tier) {
    case 1:
      baseRpm = 60;
      break;
    case 2:
      baseRpm = 180;
      break;
    case 3:
      baseRpm = 30;
      break;
    case 4:
      baseRpm = 3600;
      break;
  }

  // Smooth 4-phase RPM deceleration & stall physics:
  // localFrame < 225: full speed
  // 225..244: decel
  // 245..264: stall (rpm = 0)
  // 265+: broken
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
      {/* Tier 1 ($10, Frames 0..289): Manual Flywheel Screw Press */}
      {tier === 1 && (
        <group>
          <PressSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier1"
            spec={PressTier1Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 2 ($100, Frames 290..579): Motorized Eccentric Flywheel Punch Press */}
      {tier === 2 && (
        <group>
          <PressSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier2"
            spec={PressTier2Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 3 ($1 000, Frames 580..869): Quad-Piston Hydraulic Forging Press */}
      {tier === 3 && (
        <group>
          <PressSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier3"
            spec={PressTier3Spec}
            localFrame={local}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      )}

      {/* Tier 4 ($100 000+, Frames 870..1159): Superconducting Quantum Pinch Press */}
      {tier === 4 && (
        <group>
          <PressSpecimen localFrame={local} />
          <ProceduralAssemblyRig
            key="tier4"
            spec={PressTier4Spec}
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

export default PressStage;
