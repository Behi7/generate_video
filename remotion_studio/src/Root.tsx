import React from "react";
import { Composition } from "remotion";
import { HammerCompositions } from "./projects/hammer";
import { ShredderCompositions } from "./projects/shredder";
import { CrusherCompositions } from "./projects/crusher";
import { DrillCompositions } from "./projects/drill";
import { PressCompositions } from "./projects/press";
import { ModularAssemblyTest } from "./shared/previews/ModularAssemblyTest";
import { EnvironmentPreview } from "./shared/previews/EnvironmentPreview";

export const Root: React.FC = () => {
  return (
    <>
      {/* Modular Project Compositions */}
      <HammerCompositions />
      <ShredderCompositions />
      <CrusherCompositions />
      <DrillCompositions />
      <PressCompositions />

      {/* Lab & Shared Preview Compositions */}
      <Composition
        id="ModularAssemblyTest"
        component={ModularAssemblyTest}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EnvironmentPreview"
        component={EnvironmentPreview}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
