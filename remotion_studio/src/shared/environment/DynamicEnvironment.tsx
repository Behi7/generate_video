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
  RivetedSteelWall,
  IndustrialBlastDoorWall,
  TexturedFactoryBrickWall,
} from "./Backdrops";
import {
  IndustrialWarmRig,
  CyberpunkRig,
  GarageSpotRig,
  CleanroomRig,
} from "./LightingRigs";
import {
  OilBarrels,
  IndustrialOilDrum,
  DrumCluster,
  WoodenPallet,
  MetalBucket,
  CoiledHose,
  ScatteredHardware,
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
      {theme === "factory" && <RivetedSteelWall />}
      {theme === "garage" && <BrickWall />}
      {theme === "cyberpunk" && <CyberpunkVoid />}
      {theme === "cleanroom" && <CleanroomWhite />}
      {theme === "dark_studio" && <IndustrialBlastDoorWall />}

      {/* 3. GROUND FLOOR */}
      {theme === "factory" && <ConcreteFactorySlab />}
      {theme === "garage" && <HeavyWoodBench />}
      {theme === "cyberpunk" && <HexNeonGrid />}
      {theme === "cleanroom" && <DiamondPlateSteel />}
      {theme === "dark_studio" && <DarkTitaniumMirror />}

      {/* 4. PERIPHERAL STAGE DRESSING PROPS */}
      {theme === "factory" && (
        <>
          {/* Left Rear Supply Island: Wooden Pallet with resting Dual Drum Cluster */}
          <WoodenPallet position={[-2.7, -2.04, -2.0]} />
          <DrumCluster
            position={[-3.0, -1.896, -2.0]}
            primaryColor="#2F3E30"
            secondaryColor="#22272F"
          />
          {/* Floor Work Zone Dressing: Galvanized Metal Bucket & Scattered Hardware */}
          <MetalBucket
            position={[-2.2, -2.04, -1.1]}
            handleAngle={0.65}
            gripType="wood"
          />
          <ScatteredHardware position={[-2.4, -2.04, -0.65]} count={12} />
          {/* Right Flank & Perimeter Detail */}
          <CoiledHose
            position={[2.6, -2.04, -1.8]}
            rotation={[0, -0.35, 0]}
            variant="rubber_hydraulic"
          />
          <WarningPillars position={[2.5, -2.04, 1.6]} />
          <CableTrays position={[0, -2.04, -2.8]} />
          <WarningSign position={[3.6, 1.8, -6.0]} />
        </>
      )}

      {theme === "garage" && (
        <>
          {/* Wall Dressing */}
          <ToolRack position={[-3.8, 0.6, -6.0]} />
          <WarningSign position={[3.5, 1.8, -6.0]} />
          {/* Left Flank Workbench Supply Station */}
          <WoodenPallet position={[-2.6, -2.04, -1.8]} />
          <MetalBucket
            position={[-2.6, -1.896, -1.8]}
            handleAngle={0.72}
            gripType="wood"
          />
          <ScatteredHardware position={[-2.4, -2.04, -0.95]} count={12} />
          {/* Right Flank Staged Solvents & Hydraulic Hose */}
          <DrumCluster
            position={[2.7, -2.04, -1.9]}
            primaryColor="#374151"
            secondaryColor="#1E293B"
          />
          <CoiledHose
            position={[2.6, -2.04, -0.9]}
            rotation={[0, 0.8, 0]}
            variant="rubber_hydraulic"
          />
          <CableTrays position={[0, -2.04, -2.8]} />
        </>
      )}

      {theme === "cyberpunk" && (
        <>
          {/* Left Flank Hazard Cluster */}
          <DrumCluster
            position={[-2.7, -2.04, -2.0]}
            primaryColor="#22272F"
            secondaryColor="#1E293B"
          />
          <MetalBucket
            position={[-2.3, -2.04, -1.2]}
            handleAngle={0.45}
            gripType="metal"
          />
          {/* Right Flank Cyber Fluidic Hardware */}
          <HydraulicReservoir position={[2.7, -2.04, -2.2]} />
          <CoiledHose
            position={[2.6, -2.04, -1.2]}
            rotation={[0, 1.1, 0]}
            variant="braided_steel"
          />
          {/* High-Contrast Dual Flank Bollards & Conduit */}
          <WarningPillars position={[-2.6, -2.04, 1.8]} />
          <WarningPillars position={[2.6, -2.04, 1.8]} />
          <CableTrays position={[0, -2.04, -2.8]} />
        </>
      )}

      {theme === "cleanroom" && (
        <>
          {/* Left Flank Sterile Solvents & Sanitary Pail */}
          <DrumCluster
            position={[-2.7, -2.04, -2.1]}
            primaryColor="#374151"
            secondaryColor="#475569"
          />
          <MetalBucket
            position={[-2.3, -2.04, -1.25]}
            handleAngle={0.5}
            gripType="metal"
          />
          {/* Right Flank High-Precision Hydraulics */}
          <HydraulicReservoir position={[2.7, -2.04, -2.2]} />
          <CoiledHose
            position={[2.6, -2.04, -1.1]}
            rotation={[0, -0.6, 0]}
            variant="braided_steel"
          />
          {/* Perimeter & Protocol Sign */}
          <CableTrays position={[0, -2.04, -2.8]} />
          <WarningSign position={[-3.5, 1.8, -6.0]} />
        </>
      )}

      {theme === "dark_studio" && (
        <>
          {/* Left Flank Sleek Showroom Accents */}
          <DrumCluster
            position={[-2.7, -2.04, -2.0]}
            primaryColor="#1E293B"
            secondaryColor="#22272F"
          />
          <MetalBucket
            position={[-2.3, -2.04, -1.2]}
            handleAngle={0.7}
            gripType="metal"
          />
          {/* Right Flank Auxiliary Hydraulics & Hose */}
          <HydraulicReservoir position={[2.7, -2.04, -2.2]} />
          <CoiledHose
            position={[2.6, -2.04, -1.1]}
            rotation={[0, 0.4, 0]}
            variant="rubber_hydraulic"
          />
          {/* Peripheral Safety Perimeter */}
          <WarningPillars position={[-2.6, -2.04, 1.8]} />
          <WarningPillars position={[2.6, -2.04, 1.8]} />
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
