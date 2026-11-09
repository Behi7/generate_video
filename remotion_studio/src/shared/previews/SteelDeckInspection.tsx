import React from "react";
import { ModelInspector, CameraViewConfig } from "@shared/components/ModelInspector";
import { TestingBayEnvironment } from "@shared/components/TestingBayEnvironment";
import { ModularDiamondSteelDeck } from "../environment/floors/ModularDiamondSteelDeck";
import { IndustrialOilDrum } from "../environment/props/IndustrialOilDrum";
import { MetalBucket } from "../environment/props/MetalBucket";

const STEEL_DECK_VIEWS: Record<number, Partial<CameraViewConfig>> = {
  // 1. Front View: elevated 28-degree rake showcasing front kerb, hazard striping, plate seams & utility hatch
  1: {
    position: [0, 4.0, 11.2],
    target: [0, -2.04, 0.4],
    fov: 46,
  },
  // 2. Side Right View: showcasing side angle-iron kerb, welded triangular gussets, anchor bolts & deck profile
  2: {
    position: [11.8, 3.8, 0],
    target: [0, -2.04, 0],
    fov: 46,
  },
  // 3. Top View: complete orthogonal architectural overview of the 16m x 16m modular grid & utility hatch
  3: {
    position: [0, 15.2, 0.001],
    target: [0, -2.04, 0],
    fov: 54,
  },
  // 4. Heroic 3/4 Iso: cinematic high-contrast studio perspective with directional specular sheen
  4: {
    position: [7.2, 5.0, 9.0],
    target: [0.6, -2.04, 0.4],
    fov: 46,
  },
};

/**
 * SteelDeckInspection:
 * Forensic 4-View Inspection Composition (Front, Side, Top, Heroic Iso)
 * Auditing:
 * 1. Ground Standard Height: Floor surface lies strictly at Y = -2.04m.
 * 2. 16m x 16m Modular Heavy Diamond-Tread Steel Plate Panels (1.2m x 2.4m running bond).
 * 3. Expansion Joint Seams (8mm) & Array of Countersunk Corner Hex Fasteners.
 * 4. PBR Industrial Slate Galvanized Finish (#334155 / #475569, metalness 0.88, roughness 0.32).
 * 5. Welded Perimeter Angle-Iron Kerb Framing with Gussets & Anchor Studs.
 * 6. Embedded Maintenance Utility Access Hatch with Gasket Seal Groove & Flush Drop-Handle.
 */
export const SteelDeckInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial Steel Floor • Modular Diamond Steel Deck (16m x 16m)"
      subtitle="1.2m x 2.4m Modular Plates + Countersunk Fasteners + Welded Angle Kerb + Utility Service Hatch"
      modelCenter={[0, 0, 0]}
      cameraFar={70}
      showGrid={false}
      showContactShadows={false}
      customEnvironment={<TestingBayEnvironment showRearWall={false} showPedestal={false} />}
      viewConfigs={STEEL_DECK_VIEWS}
    >
      {/* High-Key Studio Lighting tailored for dark oxidized steel floor evaluation */}
      <ambientLight intensity={1.8} color="#E2E8F0" />
      {/* Overhead key downlight */}
      <directionalLight position={[0, 20, 0]} intensity={2.8} color="#FFFFFF" />
      {/* Back-to-front rake (illuminates Front View specular reflection) */}
      <directionalLight position={[0, 12, -14]} intensity={2.8} color="#F1F5F9" />
      {/* Left-to-right rake (illuminates Side Right View specular reflection) */}
      <directionalLight position={[-14, 12, 0]} intensity={2.4} color="#CBD5E1" />
      {/* Opposite-iso rake (illuminates Heroic 3/4 Iso specular reflection) */}
      <directionalLight position={[-10, 14, -10]} intensity={3.0} color="#FFFFFF" />
      {/* Front-right fill */}
      <directionalLight position={[10, 12, 10]} intensity={1.8} color="#E2E8F0" />
      {/* Warm & Cyan industrial rim accents */}
      <pointLight position={[-8, 4, -8]} intensity={35} color="#F59E0B" distance={30} />
      <pointLight position={[8, 4, 8]} intensity={35} color="#00E5FF" distance={30} />

      {/* Primary AAA Asset: 16m x 16m Modular Diamond Steel Deck */}
      <ModularDiamondSteelDeck
        position={[0, -2.04, 0]}
        span={16.0}
        showKerb={true}
        showHatch={true}
        hatchPosition={[1.2, 1.2]}
      />

      {/* Workshop Ground Contact Reference Assets at Periphery (Proving Y = -2.04m alignment) */}
      <IndustrialOilDrum
        position={[5.2, -2.04, -4.2]}
        rotation={[0, 0.4, 0]}
        color="#2F3E30"
        metalness={0.75}
        roughness={0.46}
      />
      <MetalBucket
        position={[-4.8, -2.04, 4.2]}
        rotation={[0, -0.6, 0]}
        handleAngle={0.5}
        gripType="wood"
      />
    </ModelInspector>
  );
};

export default SteelDeckInspection;
