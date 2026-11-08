import React from "react";
import { Composition } from "remotion";
import { PressProgression } from "./compositions/PressProgression";
import { PressTier1Inspection } from "./compositions/PressTier1Inspection";
import { PressTier2Inspection } from "./compositions/PressTier2Inspection";
import { PressTier3Inspection } from "./compositions/PressTier3Inspection";
import { PressTier4Inspection } from "./compositions/PressTier4Inspection";
import { TOTAL_DURATION_FRAMES } from "@shared/contracts/StageTimeline";

export const PressCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="PressProgression"
        component={PressProgression}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PressTier1Inspection"
        component={PressTier1Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="PressTier2Inspection"
        component={PressTier2Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="PressTier3Inspection"
        component={PressTier3Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="PressTier4Inspection"
        component={PressTier4Inspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};

export {
  PressProgression,
  PressTier1Inspection,
  PressTier2Inspection,
  PressTier3Inspection,
  PressTier4Inspection,
};
