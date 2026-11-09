import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { BlackHoleSingularity } from "../vfx/transitions/BlackHoleSingularity";
import { RoundedBox } from "@react-three/drei";

/**
 * Preview harness for BlackHoleSingularity transition effect.
 * Tests:
 * 1. Broken machine resting on the table (frames 0..233).
 * 2. Outward explosive shrapnel fling (frames 234..248).
 * 3. Gravitational singularity formation in mid-air (frames 249..260).
 * 4. Vortex debris suction & spaghettification into event horizon (frames 261..296).
 * 5. Accretion disk micro-collapse (frames 297..304).
 * 6. Hawking radiation quantum implosion flash (frames 305..308).
 * 7. 100% sterile settled clean stage (frames 308..320).
 */
export const BlackHoleSingularityPreview: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#070B14" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [2.3, 1.8, 3.6], fov: 42 }}
      >
        <RigidShowcaseCamera
          basePosition={[2.3, 1.8, 3.6]}
          target={[0, -0.35, 0]}
          impacts={[
            { frame: 234, duration: 6, intensity: 0.05 }, // Fracture rupture impulse
            { frame: 249, duration: 8, intensity: 0.06 }, // Singularity birth shock
            { frame: 305, duration: 8, intensity: 0.09 }, // Quantum collapse shockwave
          ]}
        />
        <TestingBayEnvironment />

        {/* Action Bay Black Hole Singularity at Y = -2.04 */}
        <BlackHoleSingularity
          localFrame={frame}
          breakFrame={234}
          endFrame={308}
          position={[0, -2.04, 0]}
          singularityCenter={[0, 1.35, 0]}
        >
          {/* Fractured machine assembly on floor */}
          <group position={[0, 0.22, 0]}>
            <RoundedBox args={[0.38, 0.24, 0.32]} radius={0.02} smoothness={2}>
              <meshStandardMaterial color="#DC2626" metalness={0.75} roughness={0.28} />
            </RoundedBox>
            <mesh position={[0.16, 0.04, 0.1]} rotation={[0.6, 0.3, 0.9]}>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
              <meshStandardMaterial color="#D97706" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[-0.14, -0.03, 0.12]} rotation={[-0.3, 0.6, 0.2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.03, 12]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        </BlackHoleSingularity>
      </ThreeCanvas>
    </div>
  );
};

export default BlackHoleSingularityPreview;
