import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { Environment } from "@react-three/drei";
import { RivetedSteelWall } from "../environment/backdrops/RivetedSteelWall";

/**
 * Custom High-Bay Factory Lighting Rig tailored for 20m x 14m Industrial Wall Architecture
 */
const WallInspectionLighting: React.FC = () => {
  return (
    <>
      {/* 1. Image-Based Lighting for PBR Metallic Reflections */}
      <Environment preset="warehouse" />

      {/* 2. Studio Background Tone */}
      <color attach="background" args={["#070B14"]} />

      {/* 3. Ambient Baseline */}
      <ambientLight intensity={0.95} color="#E2E8F0" />

      {/* 4. Main Overhead Key Light (grazes lap seams & rivets) */}
      <directionalLight
        position={[18, 24, 26]}
        intensity={3.2}
        color="#FFFFFF"
      />

      {/* 5. Left Fill Light (soft cool industrial slate) */}
      <directionalLight
        position={[-20, 14, 22]}
        intensity={2.0}
        color="#94A3B8"
      />

      {/* 6. Warm Amber Grazing Accent (simulates factory floor equipment glow) */}
      <pointLight
        position={[-13, -2, 7]}
        intensity={48}
        color="#F59E0B"
        distance={40}
      />

      {/* 7. Cyan High-Tech Rim Accent */}
      <pointLight
        position={[15, 3, 7]}
        intensity={52}
        color="#00E5FF"
        distance={40}
      />

      {/* 8. Concrete Factory Slab Floor beneath Wall Footing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.02, 0]}>
        <planeGeometry args={[36, 24]} />
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>
    </>
  );
};

export const RivetedWallInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Massive Riveted Steel Bulkhead Wall (20m x 14m) • Forensic 4-View Audit"
      subtitle="Lap-Joint Stepped Armor Plates • 5 Structural I-Beam Columns • 2500+ Volumetric 3D Rivets • 480V Utility Enclosure"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, 0, 0]}
      cameraFar={150}
      customEnvironment={<WallInspectionLighting />}
      showContactShadows={false}
      showGrid={false}
      viewConfigs={{
        1: {
          name: "01 • FRONT ELEVATION",
          badge: "XY PLANE (20m x 14m)",
          badgeColor: "#F59E0B",
          position: [0, 0.1, 31.0],
          target: [0, 0, 0],
          fov: 38,
        },
        2: {
          name: "02 • SIDE RIGHT PROFILE",
          badge: "ZY CROSS-SECTION",
          badgeColor: "#06B6D4",
          position: [15.5, 0.2, 2.2],
          target: [3.0, 0, 0.2],
          fov: 40,
        },
        3: {
          name: "03 • TOP-DOWN VIEW",
          badge: "XZ FLANGE PROFILE",
          badgeColor: "#8B5CF6",
          position: [0, 22.0, 4.0],
          target: [0, 0, 0],
          fov: 46,
        },
        4: {
          name: "04 • HEROIC 3/4 ISOMETRIC",
          badge: "STUDIO 3D PERSPECTIVE",
          badgeColor: "#10B981",
          position: [16.5, 12.0, 23.5],
          target: [0, -0.4, 0],
          fov: 42,
        },
      }}
    >
      <RivetedSteelWall
        position={[0, 0, 0]}
        showUtilities={true}
        showHazardMarkings={true}
        showStiffeners={true}
        showFloodlights={true}
      />
    </ModelInspector>
  );
};

export default RivetedWallInspection;
