import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { Environment } from "@react-three/drei";
import { TexturedFactoryBrickWall } from "../environment/backdrops/TexturedFactoryBrickWall";

/**
 * Calibrated Industrial High-Key Lighting Rig tailored for Masonry Relief Inspection.
 * Overhead steep key light grazes brick courses to reveal authentic 3D micro-relief shadows.
 */
const BrickWallInspectionLighting: React.FC = () => {
  return (
    <>
      {/* 1. Image-Based Lighting for PBR Metallic Reflections */}
      <Environment preset="warehouse" />

      {/* 2. Studio Background Tone */}
      <color attach="background" args={["#070B14"]} />

      {/* 3. Ambient Baseline */}
      <ambientLight intensity={0.72} color="#E2E8F0" />

      {/* 4. Main Overhead Steep Key Light: Grazes brick face at ~75 degrees */}
      {/* Real volumetric step offsets (+/-3.5mm) cast genuine horizontal micro-shadows! */}
      <directionalLight
        position={[0.8, 7.5, 1.8]}
        intensity={3.2}
        color="#FFFFFF"
        castShadow
      />

      {/* 5. Soft Front Fill Light */}
      <directionalLight
        position={[-2.5, 3.0, 5.5]}
        intensity={1.1}
        color="#CBD5E1"
      />

      {/* 6. Warm Amber Raking Accent (Brings out warm terracotta & brass handwheel) */}
      <pointLight
        position={[-3.2, 0.4, 1.8]}
        intensity={22}
        color="#F59E0B"
        distance={12}
      />

      {/* 7. Cool Cyan Specular Edge Accent */}
      <pointLight
        position={[3.2, 1.0, 1.8]}
        intensity={26}
        color="#00E5FF"
        distance={12}
      />

      {/* 8. Concrete Factory Ground Slab beneath Wall Footing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.505, 0]} receiveShadow>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.78}
          metalness={0.15}
        />
      </mesh>
    </>
  );
};

export const BrickWallInspection: React.FC = () => {
  return (
    <ModelInspector
      title="AAA Textured Factory Brick Wall • Forensic 4-View Audit"
      subtitle="Volumetric Masonry Relief (+/-3.5mm step offsets) • Recessed Mortar Joints (~16mm) • Concrete Pilasters & Curb • Cast-Iron Pipe & Brass Hydrant"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, 0.50, 0]}
      cameraDistanceMultiplier={1.0}
      cameraFar={90}
      customEnvironment={<BrickWallInspectionLighting />}
      showContactShadows={false}
      showGrid={false}
      viewConfigs={{
        // 01: FRONT VIEW (XY Plane) - Full bay, both pilasters, curb, pipe, valve
        1: {
          name: "01 • FRONT VIEW",
          badge: "XY PLANE",
          badgeColor: "#F59E0B",
          position: [0, 0.45, 6.9],
          target: [0, 0.45, 0],
          fov: 39,
        },
        // 02: SIDE RIGHT (ZY Plane) - Focused forensic inspection of brick relief depth, mortar recess & pipe standoff
        2: {
          name: "02 • SIDE RIGHT",
          badge: "ZY PLANE",
          badgeColor: "#06B6D4",
          position: [3.4, 0.45, 0.8],
          target: [1.25, 0.45, 0.14],
          fov: 38,
        },
        // 03: TOP VIEW (XZ Plane) - Elevated raking angle auditing brick top step offsets & valve spoked wheel
        3: {
          name: "03 • TOP VIEW",
          badge: "XZ PLANE",
          badgeColor: "#8B5CF6",
          position: [0.6, 3.6, 1.4],
          target: [0.6, 0.35, 0.12],
          fov: 42,
        },
        // 04: HEROIC 3/4 ISO (Studio 3D) - Dramatic isometric angle catching micro-shadows & metallic reflections
        4: {
          name: "04 • HEROIC 3/4 ISO",
          badge: "STUDIO 3D",
          badgeColor: "#10B981",
          position: [2.7, 1.8, 4.2],
          target: [0.35, 0.40, 0.1],
          fov: 39,
        },
      }}
    >
      <TexturedFactoryBrickWall
        position={[0, 0, 0]}
        width={12.0}
        height={5.0}
        includeUtilities={true}
      />
    </ModelInspector>
  );
};

export default BrickWallInspection;
