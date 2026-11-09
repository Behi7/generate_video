import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { PneumaticAirBlast } from "../vfx/transitions/PneumaticAirBlast";
import { RoundedBox } from "@react-three/drei";

/**
 * Preview harness for PneumaticAirBlast transition effect.
 * Tests:
 * 1. Broken machine resting on the bed (frames 0..274).
 * 2. Supersonic pneumatic blast triggering at blastFrame (275).
 * 3. Radial ballistic impulse blasting broken parts beyond camera FOV.
 * 4. Multi-tier shockwave toruses & radial floor dust kick-up.
 * 5. Spotless, polished sterile bed left by frame 315.
 */
export const PneumaticAirBlastPreview: React.FC = () => {
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
            { frame: 234, duration: 8, intensity: 0.08 }, // Massive pneumatic discharge recoil
          ]}
        />
        <TestingBayEnvironment />

        {/* Action Bay Stage at Y = -2.04 */}
        <group position={[0, -2.04, 0]}>
          {/* Base Anvil Bed */}
          <group position={[0, 0, 0]}>
            <RoundedBox args={[1.2, 0.28, 1.2]} radius={0.03} smoothness={3}>
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
            </RoundedBox>
            {/* Hardened Polished Tool Steel Top Platen */}
            <mesh position={[0, 0.142, 0]}>
              <cylinderGeometry args={[0.48, 0.48, 0.015, 32]} />
              <meshStandardMaterial color="#64748B" metalness={0.96} roughness={0.16} />
            </mesh>
          </group>

          {/* Pneumatic Cleanser Transition */}
          <PneumaticAirBlast
            localFrame={frame}
            blastFrame={234}
            endFrame={308}
            origin={[0, 0.15, 0]}
            floorY={0.145}
            intensity={1.0}
            showNozzles={true}
          >
            {/* Broken machine debris resting on anvil before blast */}
            <group position={[0, 0.24, 0]}>
              {/* Fractured main housing */}
              <group rotation={[0.2, 0.4, -0.3]}>
                <RoundedBox args={[0.36, 0.22, 0.3]} radius={0.02} smoothness={2}>
                  <meshStandardMaterial color="#EF4444" metalness={0.7} roughness={0.3} />
                </RoundedBox>
              </group>
              {/* Sheared brass column */}
              <mesh position={[0.18, 0.05, 0.1]} rotation={[0.8, 0.2, 1.1]}>
                <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                <meshStandardMaterial color="#D97706" metalness={0.92} roughness={0.2} />
              </mesh>
              {/* Loose gear shard */}
              <mesh position={[-0.15, -0.02, 0.12]} rotation={[-0.4, 0.7, 0.3]}>
                <cylinderGeometry args={[0.12, 0.12, 0.03, 12]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          </PneumaticAirBlast>
        </group>
      </ThreeCanvas>
    </div>
  );
};
