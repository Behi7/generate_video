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
import { ConcreteFloorInspection } from "./shared/previews/ConcreteFloorInspection";
import { BlastDoorInspection } from "./shared/previews/BlastDoorInspection";
import { RivetedWallInspection } from "./shared/previews/RivetedWallInspection";
import { BrickWallInspection } from "./shared/previews/BrickWallInspection";
import { SteelDeckInspection } from "./shared/previews/SteelDeckInspection";
import { PneumaticAirBlastPreview } from "./shared/previews/PneumaticAirBlastPreview";
import { BlackHoleSingularityPreview } from "./shared/previews/BlackHoleSingularityPreview";


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
      <Composition
        id="ConcreteFloorInspection"
        component={ConcreteFloorInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="BlastDoorInspection"
        component={BlastDoorInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="RivetedWallInspection"
        component={RivetedWallInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="BrickWallInspection"
        component={BrickWallInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="SteelDeckInspection"
        component={SteelDeckInspection}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="PneumaticAirBlastPreview"
        component={PneumaticAirBlastPreview}
        durationInFrames={330}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BlackHoleSingularityPreview"
        component={BlackHoleSingularityPreview}
        durationInFrames={330}
        fps={30}
        width={1080}
        height={1920}
      />

    </>
  );
};
