import React from "react";
import { MeshReflectorMaterial, Environment, ContactShadows } from "@react-three/drei";

export interface TestingBayEnvironmentProps {
  showRearWall?: boolean;
  showPedestal?: boolean;
  showReflectiveFloor?: boolean;
}

export const TestingBayEnvironment: React.FC<TestingBayEnvironmentProps> = ({
  showRearWall = true,
  showPedestal = true,
  showReflectiveFloor = true,
}) => {
  return (
    <>
      {/* 1. Image-Based Lighting (IBL): Real Studio Environment for Metallic Reflections */}
      <Environment preset="warehouse" />

      {/* Studio Background: Industrial R&D Cleanroom Slate */}
      <color attach="background" args={["#0F172A"]} />
      <fog attach="fog" args={["#0F172A", 12, 38]} />

      {/* High-Key Studio Lighting (Mobile-Optimized: No Crushed Blacks!) */}
      <ambientLight intensity={0.9} color="#E2E8F0" />

      {/* Main Overhead Key Light */}
      <spotLight
        position={[0, 9, 4.5]}
        target-position={[0, -1, 0]}
        angle={0.65}
        penumbra={0.7}
        intensity={38}
        color="#FFFFFF"
      />

      {/* Front Soft Fill Light */}
      <directionalLight position={[0, 2, 6]} intensity={2.2} color="#F1F5F9" />

      {/* Left Rim Light: Warm Brass & Copper Accent */}
      <pointLight position={[-4, 2, 1]} intensity={24} color="#F59E0B" distance={12} />

      {/* Right Rim Light: High-Tech Cyan Accent */}
      <pointLight position={[4, 2, 1]} intensity={30} color="#00E5FF" distance={12} />

      {/* Background Architectural Wall with Vertical LED Light Columns */}
      {showRearWall && (
        <group position={[0, 1.5, -7]}>
          {/* Rear Wall Panel */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[20, 14]} />
            <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.4} />
          </mesh>

          {/* 6 Vertical LED Light Bars (Provide depth & contrast against machines) */}
          {[-4.5, -2.7, -0.9, 0.9, 2.7, 4.5].map((xPos, idx) => (
            <mesh key={idx} position={[xPos, 0, 0.05]}>
              <planeGeometry args={[0.08, 10]} />
              <meshStandardMaterial
                color="#E2E8F0"
                emissive="#38BDF8"
                emissiveIntensity={1.8}
              />
            </mesh>
          ))}

          {/* Subtle Horizontal Tech Stripe */}
          <mesh position={[0, -2.5, 0.04]}>
            <planeGeometry args={[16, 0.06]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}

      {/* 2. Contact Shadows (Ambient Occlusion beneath machines) */}
      <ContactShadows
        position={[0, -2.04, 0]}
        opacity={0.88}
        scale={6}
        blur={1.8}
        far={3}
      />

      {/* Central Titanium Testing Pedestal */}
      {showPedestal && (
        <group position={[0, -2.1, 0]}>
          {/* Main Circular Platform Bed */}
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[2.2, 2.35, 0.12, 48]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
          </mesh>
          {/* Neon Platform Border Trim Ring */}
          <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.18, 0.025, 16, 48]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={2.8}
            />
          </mesh>
          {/* Concentric Inner Radial Markings */}
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.35, 1.38, 48]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      )}

      {/* Reflective Studio Floor Surrounding Pedestal */}
      {showReflectiveFloor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.18, 0]}>
          <planeGeometry args={[30, 24]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.7}
            mixBlur={0.8}
            mixStrength={18}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0B132B"
            metalness={0.85}
          />
        </mesh>
      )}
    </>
  );
};
