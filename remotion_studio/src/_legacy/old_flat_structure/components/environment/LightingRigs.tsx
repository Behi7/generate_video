import React from "react";
import { Environment } from "@react-three/drei";

/** 1. Industrial Warm Lighting Scheme (3200K Workshop) */
export const IndustrialWarmRig: React.FC = () => (
  <>
    <Environment preset="warehouse" />
    <ambientLight intensity={0.8} color="#FEF3C7" />
    {/* Overhead Main Key Spot */}
    <spotLight position={[0, 9, 4.5]} angle={0.65} penumbra={0.7} intensity={36} color="#FFFBEB" />
    {/* Warm front fill */}
    <directionalLight position={[0, 2, 6]} intensity={2.0} color="#FDE68A" />
    {/* Warm tungsten left rim */}
    <pointLight position={[-4, 2, 1]} intensity={28} color="#F59E0B" distance={12} />
    {/* Steel blue contrast right rim */}
    <pointLight position={[4, 2, 1]} intensity={22} color="#60A5FA" distance={12} />
  </>
);

/** 2. Cyberpunk High-Contrast Rim Rig (Cyan + Magenta) */
export const CyberpunkRig: React.FC = () => (
  <>
    <Environment preset="city" />
    <ambientLight intensity={0.5} color="#0F172A" />
    {/* Overhead neutral key */}
    <spotLight position={[0, 8, 4]} angle={0.55} penumbra={0.8} intensity={25} color="#FFFFFF" />
    {/* Left Intense Cyan Rim */}
    <pointLight position={[-4.5, 2.5, 0.5]} intensity={42} color="#06B6D4" distance={14} />
    {/* Right Intense Magenta Rim */}
    <pointLight position={[4.5, 2.5, 0.5]} intensity={42} color="#D946EF" distance={14} />
  </>
);

/** 3. Underground Garage Single Overhead Spot */
export const GarageSpotRig: React.FC = () => (
  <>
    <Environment preset="night" />
    <ambientLight intensity={0.35} color="#334155" />
    {/* Harsh conical work-light directly overhead */}
    <spotLight position={[0, 6.5, 1.0]} angle={0.45} penumbra={0.35} intensity={55} color="#FFF7ED" />
    {/* Ground bounce fill */}
    <pointLight position={[0, -1.5, 2]} intensity={12} color="#94A3B8" distance={8} />
  </>
);

/** 4. High-CRI Cold Studio Cleanroom Rig (5600K) */
export const CleanroomRig: React.FC = () => (
  <>
    <Environment preset="studio" />
    <ambientLight intensity={1.1} color="#F8FAFC" />
    {/* Bright diffused ceiling panels */}
    <directionalLight position={[0, 8, 2]} intensity={3.2} color="#FFFFFF" />
    <directionalLight position={[0, 1, 5]} intensity={1.8} color="#E0F2FE" />
    {/* Subtle ice blue rim */}
    <pointLight position={[-3.5, 2, 0]} intensity={20} color="#38BDF8" distance={10} />
    <pointLight position={[3.5, 2, 0]} intensity={20} color="#38BDF8" distance={10} />
  </>
);
