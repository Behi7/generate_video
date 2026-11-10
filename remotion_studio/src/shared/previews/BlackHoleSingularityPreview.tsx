import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TestingBayEnvironment } from "../components/TestingBayEnvironment";
import { RigidShowcaseCamera } from "@shared/components/RigidShowcaseCamera";
import { BlackHoleSingularity } from "../vfx/transitions/BlackHoleSingularity";
import { RoundedBox } from "@react-three/drei";

/**
 * Preview harness for BlackHoleSingularity transition effect (10/10 Masterpiece).
 * Tests:
 * 1. Intact industrial mechanical press operating on the table (frames 0..233).
 * 2. Catastrophic rupture & explosive burst of separate blocks (frames 234..244).
 * 3. ZERO-G ANTI-GRAVITY HOVER: 20 blocks hover in mid-air within frame bounds (frames 245..258).
 * 4. PURE JET-BLACK EVENT HORIZON birth (pure #000000) & razor-thin cyan photon ring (frames 252..260).
 * 5. Gravitational vortex suction & spaghettification into the black hole (frames 260..296).
 * 6. Accretion disk quantum collapse & micro-implosion flash (frames 297..308).
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
            { frame: 252, duration: 8, intensity: 0.06 }, // Singularity birth shock
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
          {/* Heavy Industrial Mechanical Press Mechanism */}
          <group position={[0, 0, 0]}>
            {/* 1. Heavy Cast-Iron Anvil Base Bolster */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.48, 0.54, 0.24, 32]} />
              <meshStandardMaterial color="#1E293B" metalness={0.88} roughness={0.35} />
            </mesh>
            {/* Tool Steel Bolster Insert */}
            <mesh position={[0, 0.245, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.015, 32]} />
              <meshStandardMaterial color="#64748B" metalness={0.96} roughness={0.16} />
            </mesh>

            {/* 2. Dual Polished Steel Guide Columns */}
            {[-0.32, 0.32].map((colX, cIdx) => (
              <group key={`guide-col-${cIdx}`} position={[colX, 0.85, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.045, 0.045, 1.25, 24]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.96} roughness={0.12} />
                </mesh>
                {/* Column Base Flange Ring */}
                <mesh position={[0, -0.60, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.25} />
                </mesh>
              </group>
            ))}

            {/* 3. Heavy Top Crosshead Arch */}
            <group position={[0, 1.48, 0]}>
              <RoundedBox args={[0.82, 0.18, 0.24]} radius={0.02} smoothness={2}>
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.32} />
              </RoundedBox>
              {/* Bronze Guide Bushing */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.22, 24]} />
                <meshStandardMaterial color="#D97706" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>

            {/* 4. Central Bronze Acme Lead Screw & Flywheel Handle */}
            <group position={[0, 1.35, 0]}>
              {/* Vertical Lead Screw Shaft */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.85, 24]} />
                <meshStandardMaterial color="#D97706" metalness={0.95} roughness={0.18} />
              </mesh>
              {/* Hardened Toolhead Punch Die */}
              <mesh position={[0, -0.42, 0]}>
                <cylinderGeometry args={[0.08, 0.05, 0.14, 16]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.96} roughness={0.14} />
              </mesh>
              {/* Balanced Flywheel Disc on Top */}
              <group position={[0, 0.46, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.34, 0.045, 16, 36]} />
                  <meshStandardMaterial color="#DC2626" metalness={0.8} roughness={0.25} />
                </mesh>
                {/* Cross Spokes */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.68, 12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.68, 12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
                </mesh>
              </group>
            </group>

            {/* 5. Crushed Metal Workpiece on Bolster */}
            <group position={[0, 0.26, 0]}>
              <RoundedBox args={[0.16, 0.06, 0.16]} radius={0.01} smoothness={2}>
                <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.2} />
              </RoundedBox>
            </group>
          </group>
        </BlackHoleSingularity>
      </ThreeCanvas>
    </div>
  );
};

export default BlackHoleSingularityPreview;
