import React from "react";
import { Composition } from "remotion";
import { ShredderProgression } from "./compositions/ShredderProgression";
import { ShredderInspection } from "./compositions/ShredderInspection";
import { Tier1Inspection } from "./compositions/Tier1Inspection";
import { Tier2Inspection } from "./compositions/Tier2Inspection";
import { Tier3Inspection } from "./compositions/Tier3Inspection";
import { Tier4Inspection } from "./compositions/Tier4Inspection";
import { TOTAL_DURATION_FRAMES } from "@shared/contracts/StageTimeline";

export const ShredderCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="ShredderProgression"
        component={ShredderProgression}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShredderInspection"
        component={ShredderInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Tier1Inspection"
        component={Tier1Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Tier2Inspection"
        component={Tier2Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Tier3Inspection"
        component={Tier3Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Tier4Inspection"
        component={Tier4Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};

export {
  ShredderProgression,
  ShredderInspection,
  Tier1Inspection,
  Tier2Inspection,
  Tier3Inspection,
  Tier4Inspection,
};
