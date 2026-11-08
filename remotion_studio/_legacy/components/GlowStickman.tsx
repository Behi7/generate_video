import React from "react";
import { useCurrentFrame } from "remotion";

interface GlowStickmanProps {
  position?: [number, number, number];
  pose?: "walking" | "sitting" | "carrying";
  glowColor?: string;
}

export const GlowStickman: React.FC<GlowStickmanProps> = ({
  position = [0, 0, 0],
  pose = "sitting",
  glowColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing oscillation
  const breath = Math.sin(frame * 0.07) * 0.015;

  // Mannequin material with high-end studio emissive bloom
  const mat = (
    <meshStandardMaterial
      color={glowColor}
      emissive={glowColor}
      emissiveIntensity={2.4}
      roughness={0.2}
      metalness={0.15}
    />
  );

  // Joint sphere helper
  const joint = (r = 0.055) => (
    <mesh>
      <sphereGeometry args={[r, 16, 16]} />
      {mat}
    </mesh>
  );

  // Limb capsule helper (centered along local -Y)
  const limb = (radius: number, length: number) => (
    <mesh position={[0, -length / 2, 0]}>
      <cylinderGeometry args={[radius, radius * 0.9, length, 16]} />
      {mat}
    </mesh>
  );

  // 1. CARRYING POSE: Worker walking with two heavy buckets
  if (pose === "carrying") {
    const cycle = Math.sin(frame * 0.11);
    // Negative X angle swings limb forward towards camera (+Z)
    const legL = -cycle * 0.38;
    const legR = cycle * 0.38;
    const bob = Math.abs(Math.cos(frame * 0.11)) * 0.035;

    return (
      <group position={[position[0], position[1] + bob, position[2]]}>
        {/* Head: tilted forward under strain */}
        <mesh position={[0, 1.76, 0.08]} rotation={[-0.15, 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          {mat}
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.54, 0.03]}>
          <cylinderGeometry args={[0.04, 0.045, 0.1, 16]} />
          {mat}
        </mesh>

        {/* Torso: leaning forward under load */}
        <group position={[0, 1.22, 0]} rotation={[-0.12, 0, 0]}>
          {/* Chest */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.08, 0.065, 0.36, 16]} />
            {mat}
          </mesh>
          {/* Waist */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.065, 0.06, 0.22, 16]} />
            {mat}
          </mesh>

          {/* Left Arm (Shoulder -> Elbow -> Hand holding bucket) */}
          <group position={[-0.22, 0.26, 0]}>
            {joint()}
            <group rotation={[0.05, 0, 0.1]}>
              {limb(0.045, 0.32)}
              <group position={[0, -0.32, 0]}>
                {joint(0.048)}
                <group rotation={[0.05, 0, -0.05]}>
                  {limb(0.04, 0.34)}
                  <group position={[0, -0.34, 0]}>
                    {joint(0.045)}
                  </group>
                </group>
              </group>
            </group>
          </group>

          {/* Right Arm (Shoulder -> Elbow -> Hand holding bucket) */}
          <group position={[0.22, 0.26, 0]}>
            {joint()}
            <group rotation={[0.05, 0, -0.1]}>
              {limb(0.045, 0.32)}
              <group position={[0, -0.32, 0]}>
                {joint(0.048)}
                <group rotation={[0.05, 0, 0.05]}>
                  {limb(0.04, 0.34)}
                  <group position={[0, -0.34, 0]}>
                    {joint(0.045)}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* Pelvis */}
        <mesh position={[0, 1.02, 0]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          {mat}
        </mesh>

        {/* Left Leg */}
        <group position={[-0.12, 0.98, 0]}>
          {joint(0.06)}
          <group rotation={[legL, 0, 0]}>
            {limb(0.052, 0.44)}
            <group position={[0, -0.44, 0]}>
              {joint(0.05)}
              <group rotation={[Math.max(0, -legL * 0.75), 0, 0]}>
                {limb(0.044, 0.44)}
                <mesh position={[0, -0.45, 0.04]}>
                  <boxGeometry args={[0.07, 0.04, 0.14]} />
                  {mat}
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* Right Leg */}
        <group position={[0.12, 0.98, 0]}>
          {joint(0.06)}
          <group rotation={[legR, 0, 0]}>
            {limb(0.052, 0.44)}
            <group position={[0, -0.44, 0]}>
              {joint(0.05)}
              <group rotation={[Math.max(0, -legR * 0.75), 0, 0]}>
                {limb(0.044, 0.44)}
                <mesh position={[0, -0.45, 0.04]}>
                  <boxGeometry args={[0.07, 0.04, 0.14]} />
                  {mat}
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    );
  }

  // 2. SITTING POSE: Automator sitting comfortably on bench
  return (
    <group position={[position[0], position[1] + breath, position[2]]}>
      {/* Head: upright, relaxed */}
      <mesh position={[0, 1.48, 0.02]} rotation={[0.05, 0.15, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        {mat}
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.08, 16]} />
        {mat}
      </mesh>

      {/* Torso: upright, relaxed posture */}
      <group position={[0, 1.0, 0]} rotation={[0.08, 0.08, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.065, 0.34, 16]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.065, 0.06, 0.2, 16]} />
          {mat}
        </mesh>

        {/* Left Arm: resting relaxed on left thigh */}
        <group position={[-0.22, 0.24, 0]}>
          {joint()}
          <group rotation={[-0.45, 0, 0.15]}>
            {limb(0.045, 0.3)}
            <group position={[0, -0.3, 0]}>
              {joint(0.048)}
              <group rotation={[-0.55, 0, -0.1]}>
                {limb(0.04, 0.3)}
                <group position={[0, -0.3, 0]}>{joint(0.045)}</group>
              </group>
            </group>
          </group>
        </group>

        {/* Right Arm: gesturing casually towards the pipe / valve */}
        <group position={[0.22, 0.24, 0]}>
          {joint()}
          <group rotation={[-0.35, -0.2, -0.3]}>
            {limb(0.045, 0.3)}
            <group position={[0, -0.3, 0]}>
              {joint(0.048)}
              <group rotation={[-0.45, -0.2, -0.1]}>
                {limb(0.04, 0.3)}
                <group position={[0, -0.3, 0]}>{joint(0.045)}</group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Pelvis */}
      <mesh position={[0, 0.72, -0.04]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        {mat}
      </mesh>

      {/* Left Leg: Thigh forward towards camera (-X rot), Shin down (+X rot relative) */}
      <group position={[-0.14, 0.68, -0.02]}>
        {joint(0.06)}
        <group rotation={[-1.35, 0.15, 0.15]}>
          {limb(0.052, 0.44)}
          <group position={[0, -0.44, 0]}>
            {joint(0.05)}
            <group rotation={[1.35, -0.15, -0.1]}>
              {limb(0.044, 0.44)}
              <mesh position={[0, -0.45, 0.05]}>
                <boxGeometry args={[0.07, 0.04, 0.14]} />
                {mat}
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Right Leg: Thigh forward towards camera (-X rot), Shin down (+X rot relative) */}
      <group position={[0.14, 0.68, -0.02]}>
        {joint(0.06)}
        <group rotation={[-1.3, -0.15, -0.15]}>
          {limb(0.052, 0.44)}
          <group position={[0, -0.44, 0]}>
            {joint(0.05)}
            <group rotation={[1.3, 0.15, 0.1]}>
              {limb(0.044, 0.44)}
              <mesh position={[0, -0.45, 0.05]}>
                <boxGeometry args={[0.07, 0.04, 0.14]} />
                {mat}
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
