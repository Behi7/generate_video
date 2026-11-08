import React from "react";
import { ContactShadows } from "@react-three/drei";
import {
  ConcreteFactorySlab,
  DiamondPlateSteel,
  HeavyWoodBench,
  HexNeonGrid,
  DarkTitaniumMirror,
} from "./Floors";
import {
  FactoryTrusses,
  BrickWall,
  PipeAndCableRack,
  CyberpunkVoid,
  CleanroomWhite,
} from "./Backdrops";
import {
  IndustrialWarmRig,
  CyberpunkRig,
  GarageSpotRig,
  CleanroomRig,
} from "./LightingRigs";
import {
  OilBarrels,
  WarningPillars,
  CableTrays,
  ToolRack,
  HydraulicReservoir,
  WarningSign,
} from "./Props";
import { AtmosphericDust } from "./AtmosphericDust";

export type EnvironmentTheme =
  | "factory"
  | "garage"
  | "cyberpunk"
  | "cleanroom"
  | "dark_studio";

export interface DynamicEnvironmentProps {
  theme?: EnvironmentTheme;
  enableDust?: boolean;
}

export const DynamicEnvironment: React.FC<DynamicEnvironmentProps> = ({
  theme = "factory",
  enableDust = true,
}) => {
  return (
    <>
      {/* 1. LIGHTING RIG */}
      {theme === "factory" && <IndustrialWarmRig />}
      {theme === "garage" && <GarageSpotRig />}
      {theme === "cyberpunk" && <CyberpunkRig />}
      {theme === "cleanroom" && <CleanroomRig />}
      {theme === "dark_studio" && <IndustrialWarmRig />}

      {/* 2. BACKDROP ARCHITECTURE */}
      {theme === "factory" && <FactoryTrusses />}
      {theme === "garage" && <BrickWall />}
      {theme === "cyberpunk" && <CyberpunkVoid />}
      {theme === "cleanroom" && <CleanroomWhite />}
      {theme === "dark_studio" && <PipeAndCableRack />}

      {/* 3. GROUND FLOOR */}
      {theme === "factory" && <ConcreteFactorySlab />}
      {theme === "garage" && <HeavyWoodBench />}
      {theme === "cyberpunk" && <HexNeonGrid />}
      {theme === "cleanroom" && <DiamondPlateSteel />}
      {theme === "dark_studio" && <DarkTitaniumMirror />}

      {/* 4. PERIPHERAL STAGE DRESSING PROPS */}
      {theme === "factory" && (
        <>
          <OilBarrels position={[-2.8, -2.04, -1.8]} />
          <WarningPillars position={[2.5, -2.04, 1.6]} />
          <CableTrays position={[0, -2.04, -2.8]} />
          <WarningSign position={[3.6, 1.8, -6.0]} />
        </>
      )}

      {theme === "garage" && (
        <>
          <ToolRack position={[-3.8, 0.6, -6.0]} />
          <OilBarrels position={[2.8, -2.04, -1.5]} />
          <CableTrays position={[0, -2.04, -2.8]} />
        </>
      )}

      {theme === "cyberpunk" && (
        <>
          <WarningPillars position={[-2.6, -2.04, 1.8]} />
          <WarningPillars position={[2.6, -2.04, 1.8]} />
        </>
      )}

      {theme === "cleanroom" && (
        <>
          <HydraulicReservoir position={[2.8, -2.04, -1.8]} />
          <CableTrays position={[0, -2.04, -2.8]} />
        </>
      )}

      {theme === "dark_studio" && (
        <>
          <HydraulicReservoir position={[2.8, -2.04, -1.8]} />
          <WarningPillars position={[-2.6, -2.04, 1.8]} />
        </>
      )}

      {/* 5. PHYSICAL CONTACT SHADOW PLANE */}
      <ContactShadows
        position={[0, -2.03, 0]}
        opacity={0.85}
        scale={6.5}
        blur={1.6}
        far={3.5}
        color="#0B0F19"
      />

      {/* 6. ATMOSPHERIC INDUSTRIAL DUST MOTES */}
      {enableDust && <AtmosphericDust />}
    </>
  );
};
