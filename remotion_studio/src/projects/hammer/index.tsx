import React from "react";
import { Composition } from "remotion";
import { HammerProgression } from "./compositions/HammerProgression";
import { HammerTier1Inspection } from "./compositions/HammerTier1Inspection";
import { HammerTier2Inspection } from "./compositions/HammerTier2Inspection";
import { HammerTier3Inspection } from "./compositions/HammerTier3Inspection";
import { HammerTier4Inspection } from "./compositions/HammerTier4Inspection";
import { TOTAL_DURATION_FRAMES } from "@shared/contracts/StageTimeline";

export const HammerCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="HammerProgression"
        component={HammerProgression}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HammerTier1Inspection"
        component={HammerTier1Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="HammerTier2Inspection"
        component={HammerTier2Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="HammerTier3Inspection"
        component={HammerTier3Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="HammerTier4Inspection"
        component={HammerTier4Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};

export {
  HammerProgression,
  HammerTier1Inspection,
  HammerTier2Inspection,
  HammerTier3Inspection,
  HammerTier4Inspection,
};
