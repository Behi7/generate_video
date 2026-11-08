import React from "react";
import { Composition } from "remotion";
import { DrillProgression } from "./compositions/DrillProgression";
import { CarbideDrillInspection } from "./compositions/CarbideDrillInspection";
import { TOTAL_DURATION_FRAMES } from "@shared/contracts/StageTimeline";

export const DrillCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="DrillProgression"
        component={DrillProgression}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CarbideDrillInspection"
        component={CarbideDrillInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};

export { DrillProgression, CarbideDrillInspection };
