import React from "react";
import { MeshReflectorMaterial } from "@react-three/drei";

export const DarkMirrorRoom: React.FC = () => {
  return (
    <>
      {/* Background ambient environment */}
      <color attach="background" args={["#04060A"]} />
      <fog attach="fog" args={["#04060A", 10, 26]} />

      {/* 3-Point Studio Lighting for Metallic Machines */}
      <ambientLight intensity={0.45} />
      
      {/* Top Main Studio Key Light */}
      <spotLight
        position={[0, 9, 5]}
        angle={0.65}
        penumbra={0.8}
        intensity={25}
        color="#F8FAFC"
      />

      {/* Warm Industrial Rim Light for Left Machine (Pump) */}
      <pointLight position={[-4, 2, -1]} intensity={16} color="#F59E0B" distance={8} />

      {/* Electric Cyan Rim Light for Right Machine (Turbine) */}
      <pointLight position={[4, 2, -1]} intensity={22} color="#00E5FF" distance={8} />

      {/* Front Fill Light */}
      <directionalLight position={[0, 2, 6]} intensity={1.2} color="#E2E8F0" />

      {/* Real-time Glossy Mirror Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mirror={0.8}
          mixBlur={0.85}
          mixStrength={25}
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
