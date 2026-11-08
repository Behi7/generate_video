import React, { Suspense, useState, useCallback, useEffect } from "react";
import { useVideoConfig, delayRender, continueRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { DynamicEnvironment } from "@shared/environment/DynamicEnvironment";
import { HeavyIndustrialShredder } from "@projects/shredder/components/HeavyIndustrialShredder";

const SceneReady: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // Render synchronous frame once all children are mounted in scene
    gl.render(scene, camera);
    const timer = setTimeout(() => {
      gl.render(scene, camera);
      onReady();
    }, 150);
    return () => clearTimeout(timer);
  }, [gl, scene, camera, onReady]);

  return null;
};

export const EnvironmentPreview: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() =>
    delayRender("Waiting for Initial Environment Draw", { timeoutInMilliseconds: 10000 })
  );

  const handleReady = useCallback(() => {
    continueRender(handle);
  }, [handle]);

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
        advanceOnCreated
        camera={{
          position: [2.3, 1.8, 3.6],
          fov: 42,
          near: 0.1,
          far: 60,
        }}
      >
        <Suspense fallback={null}>
          <RigidShowcaseCamera
            basePosition={[2.3, 1.8, 3.6]}
            target={[0, -0.35, 0]}
          />
          {/* Testing the new Factory LEGO Environment */}
          <DynamicEnvironment theme="factory" />
          <HeavyIndustrialShredder localFrame={70} />
          <SceneReady onReady={handleReady} />
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};
