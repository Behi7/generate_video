import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";
import { ModularCarbideDrillSpec } from "@projects/drill/components/ModularCarbideDrill";

export const ModularAssemblyTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const isRunning = frame >= 85 && frame < 250;
  const isBroken = frame >= 250;
  const rpm = isRunning ? 2600 : 0;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#070B14" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [2.3, 1.8, 3.6], fov: 40 }}
      >
        <RigidShowcaseCamera
          basePosition={[2.3, 1.8, 3.6]}
          target={[0, -0.3, 0]}
          impacts={[
            { frame: 20, duration: 4, intensity: 0.03 },
            { frame: 40, duration: 4, intensity: 0.035 },
            { frame: 60, duration: 4, intensity: 0.04 },
            { frame: 75, duration: 5, intensity: 0.045 },
            { frame: 265, duration: 7, intensity: 0.07 },
          ]}
        />
        <TestingBayEnvironment />
        <group position={[0, -0.85, 0]}>
          <ProceduralAssemblyRig
            spec={ModularCarbideDrillSpec}
            localFrame={frame}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        </group>
      </ThreeCanvas>
    </div>
  );
};
