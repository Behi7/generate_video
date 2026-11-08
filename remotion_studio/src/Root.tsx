import React from "react";
import { Composition } from "remotion";
import { HammerCompositions } from "./projects/hammer";
import { ShredderCompositions } from "./projects/shredder";
import { CrusherCompositions } from "./projects/crusher";
import { DrillCompositions } from "./projects/drill";
import { PressCompositions } from "./projects/press";
import { ModularAssemblyTest } from "./shared/previews/ModularAssemblyTest";
import { EnvironmentPreview } from "./shared/previews/EnvironmentPreview";
import { MetalBucketInspection } from "./shared/previews/MetalBucketInspection";
import { PalletHardwareInspection } from "./shared/previews/PalletHardwareInspection";
import { OilDrumInspection } from "./shared/previews/OilDrumInspection";
import { CoiledHoseInspection } from "./shared/previews/CoiledHoseInspection";

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
      <Composition
        id="MetalBucketInspection"
        component={MetalBucketInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="PalletHardwareInspection"
        component={PalletHardwareInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="OilDrumInspection"
        component={OilDrumInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="CoiledHoseInspection"
        component={CoiledHoseInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
