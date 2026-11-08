import React from "react";
import { useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { DynamicEnvironment } from "@shared/environment/DynamicEnvironment";
import { HeavyIndustrialShredder } from "@projects/shredder/components/HeavyIndustrialShredder";

export const EnvironmentPreview: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0F172A",
        position: "relative",
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          fov: 42,
          near: 0.1,
          far: 60,
        }}
      >
        <RigidShowcaseCamera
          basePosition={[2.3, 1.8, 3.6]}
          target={[0, -0.35, 0]}
        />
        {/* Testing the new Factory LEGO Environment */}
        <DynamicEnvironment theme="factory" />
        <HeavyIndustrialShredder />
      </ThreeCanvas>
    </div>
  );
};
