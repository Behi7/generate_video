import React from "react";
import { useCurrentFrame } from "remotion";
import {
  getCurrentTier,
  getTierLocalFrame,
  getFluidRpm,
} from "@shared/contracts/StageTimeline";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { CleanserTransitionWrapper } from "@shared/vfx/transitions/CleanserTransitionWrapper";
import { getTierTransition } from "@shared/vfx/transitions/TransitionRegistry";
import { PressSpecimen } from "./PressSpecimen";
import { PressTier1Spec } from "./PressTier1_Manual";
import { PressTier2Spec } from "./PressTier2_Electric";
import { PressTier3Spec } from "./PressTier3_Hydraulic";
import { PressTier4Spec } from "./PressTier4_Futuristic";

export const PressStage: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  // Machinery runs during Acts 2, 3 and through Act 4 strain/resonance up until fracture rupture at frame 234
  const isRunning = local >= 63 && local < 234;
  // Overload fracture occurs at frame 234..319
  const isBroken = local >= 234;

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

  // Fluid 4-stage RPM deceleration & stall physics:
  // 0..212: full speed (baseRpm)
  // 213..224: exponential torque bog-down deceleration (fluid easing rather than linear snap)
  // 225..233: stall & resonant pre-fracture shudder wave (rpm = 0)
  // 234..307: fracture rupture & active cleanser transition (rpm = 0)
  // 308..319: stage settled, clean table (isBroken = true, meshes cleansed)
  const rpm = isRunning ? getFluidRpm(baseRpm, local) : 0;

  const seed = "hydraulic_press_progression";
  const transitionEffect = getTierTransition(seed, tier);

  return (
    <group position={[0, -2.04, 0]}>
      {/* Tier Cleanser Transition Wrapper: scrubs fractured parts seamlessly between 234 and 308 */}
      <CleanserTransitionWrapper
        effect={transitionEffect}
        localFrame={local}
        breakFrame={234}
        endFrame={308}
      >
        {/* Tier 1 ($10, Frames 0..319): Manual Flywheel Screw Press */}
        {tier === 1 && (
          <group>
            <PressSpecimen localFrame={local} />
            <ProceduralAssemblyRig
              key="tier1"
              seed={seed}
              transitionEffect={transitionEffect}
              spec={PressTier1Spec}
              localFrame={local}
              isRunning={isRunning}
              rpm={rpm}
              isBroken={isBroken}
            />
          </group>
        )}

        {/* Tier 2 ($100, Frames 320..639): Motorized Eccentric Flywheel Punch Press */}
        {tier === 2 && (
          <group>
            <PressSpecimen localFrame={local} />
            <ProceduralAssemblyRig
              key="tier2"
              seed={seed}
              transitionEffect={transitionEffect}
              spec={PressTier2Spec}
              localFrame={local}
              isRunning={isRunning}
              rpm={rpm}
              isBroken={isBroken}
            />
          </group>
        )}

        {/* Tier 3 ($1 000, Frames 640..959): Quad-Piston Hydraulic Forging Press */}
        {tier === 3 && (
          <group>
            <PressSpecimen localFrame={local} />
            <ProceduralAssemblyRig
              key="tier3"
              seed={seed}
              transitionEffect={transitionEffect}
              spec={PressTier3Spec}
              localFrame={local}
              isRunning={isRunning}
              rpm={rpm}
              isBroken={isBroken}
            />
          </group>
        )}

        {/* Tier 4 ($100 000+, Frames 960..1279): Superconducting Quantum Pinch Press */}
        {tier === 4 && (
          <group>
            <PressSpecimen localFrame={local} />
            <ProceduralAssemblyRig
              key="tier4"
              seed={seed}
              transitionEffect={transitionEffect}
              spec={PressTier4Spec}
              localFrame={local}
              isRunning={isRunning}
              rpm={rpm}
              isBroken={isBroken}
            />
          </group>
        )}
      </CleanserTransitionWrapper>
    </group>
  );
};

export default PressStage;
