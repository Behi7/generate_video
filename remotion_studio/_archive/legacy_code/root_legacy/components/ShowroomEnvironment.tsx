import React from "react";
import { MeshReflectorMaterial } from "@react-three/drei";

interface ShowroomEnvironmentProps {
  activeX: number;
}

export const ShowroomEnvironment: React.FC<ShowroomEnvironmentProps> = ({ activeX }) => {
  return (
    <>
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 10, 35]} />

      {/* Global Ambient */}
      <ambientLight intensity={0.65} />

      {/* Active Key Spotlight (Follows camera glide along X) */}
      <spotLight
        position={[activeX, 4.2, 4.2]}
        target-position={[activeX, -1.1, 0]}
        angle={0.65}
        penumbra={0.7}
        intensity={22}
        color="#F8FAFC"
      />

      {/* Active Front Soft Fill Light (Follows camera) */}
      <directionalLight
        position={[activeX, 0.5, 5.0]}
        intensity={1.8}
        color="#E2E8F0"
      />

      {/* Station 1: Warm Amber Accent (x = 0) */}
      <pointLight position={[-1.2, -0.6, -0.5]} intensity={18} color="#F59E0B" distance={6} />
      <pointLight position={[1.2, -0.6, -0.5]} intensity={14} color="#94A3B8" distance={6} />

      {/* Station 2: Bronze & Brass Accent (x = 5.5) */}
      <pointLight position={[4.3, -0.5, -0.5]} intensity={22} color="#D97706" distance={6} />
      <pointLight position={[6.7, -0.5, -0.5]} intensity={16} color="#FBBF24" distance={6} />

      {/* Station 3: Industrial Electric Blue Accent (x = 11.0) */}
      <pointLight position={[9.8, -0.5, -0.5]} intensity={25} color="#0284C7" distance={6} />
      <pointLight position={[12.2, -0.5, -0.5]} intensity={20} color="#38BDF8" distance={6} />

      {/* Station 4: Overdrive Cyan Plasma Accent (x = 16.5) */}
      <pointLight position={[15.2, -0.5, -0.5]} intensity={35} color="#00E5FF" distance={7} />
      <pointLight position={[17.8, -0.5, -0.5]} intensity={30} color="#06B6D4" distance={7} />

      {/* Continuous Polished Mirror Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.25, -2.1, 0]}>
        <planeGeometry args={[60, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mirror={0.82}
          mixBlur={0.8}
          mixStrength={30}
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#060913"
          metalness={0.92}
        />
      </mesh>
    </>
  );
};
