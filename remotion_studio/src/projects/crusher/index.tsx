import React from "react";
import { Composition } from "remotion";
import { CrusherProgression } from "./compositions/CrusherProgression";
import { TOTAL_DURATION_FRAMES } from "@shared/contracts/StageTimeline";

export const CrusherCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="CrusherProgression"
        component={CrusherProgression}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

export { CrusherProgression };
