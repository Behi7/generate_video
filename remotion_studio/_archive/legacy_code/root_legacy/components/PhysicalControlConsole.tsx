import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const PhysicalControlConsole: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Trigger 1: Brass Toggle Switch (snaps UP at frame 390 = 6.5s)
  const toggleAngle = interpolate(frame, [388, 394], [-0.55, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Trigger 2: Red Mushroom Pushbutton (slams down at frame 780 = 13.0s)
  const buttonDepress = spring({
    frame: frame - 780,
    fps,
    config: { damping: 10, mass: 0.25, stiffness: 240 },
  });
  const buttonY = frame < 780 ? 0 : Math.min(buttonDepress * 0.045, 0.045);

  // 3. Trigger 3: Heavy Copper Knife Switch (slams down at frame 1170 = 19.5s)
  const knifeAngle = interpolate(frame, [1168, 1176], [0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sparkActive = frame >= 1172 && frame <= 1180;

  return (
    <group position={[0, -2.15, 1.35]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* Sleek Compact Console Bed (Narrower so machines aren't blocked) */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.05, 0.1, 0.34]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Chrome Bezel Rim */}
      <mesh position={[0, 0.092, 0]}>
        <boxGeometry args={[1.02, 0.01, 0.31]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* --- TRIGGER 1: Brass Toggle Switch (Left, x = -0.32) --- */}
      <group position={[-0.32, 0.1, 0]}>
        {/* Hex Mounting Nut */}
        <mesh>
          <cylinderGeometry args={[0.045, 0.05, 0.02, 6]} />
          <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Pivoting Toggle Lever */}
        <group rotation={[toggleAngle, 0, 0]}>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.018, 0.02, 0.14, 16]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.026, 16, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
        {/* Green Status LED */}
        <mesh position={[0, 0.01, 0.08]}>
          <circleGeometry args={[0.016, 16]} />
          <meshStandardMaterial
            color={frame >= 390 ? "#22C55E" : "#475569"}
            emissive={frame >= 390 ? "#22C55E" : "#000000"}
            emissiveIntensity={frame >= 390 ? 3.5 : 0}
          />
        </mesh>
      </group>

      {/* --- TRIGGER 2: Red Mushroom Industrial Button (Center, x = 0) --- */}
      <group position={[0, 0.1, 0]}>
        {/* Yellow Caution Base Collar */}
        <mesh>
          <cylinderGeometry args={[0.085, 0.09, 0.02, 24]} />
          <meshStandardMaterial color="#EAB308" roughness={0.35} />
        </mesh>
        {/* Depressing Red Mushroom Cap */}
        <group position={[0, 0.055 - buttonY, 0]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.065, 0.045, 24]} />
            <meshStandardMaterial
              color="#DC2626"
              roughness={0.2}
              metalness={0.25}
              emissive="#EF4444"
              emissiveIntensity={frame >= 780 ? 1.8 : 0.25}
            />
          </mesh>
        </group>
      </group>

      {/* --- TRIGGER 3: Heavy Copper Knife Switch (Right, x = 0.32) --- */}
      <group position={[0.32, 0.1, 0]}>
        {/* Ceramic Insulator Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.025, 0.22]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Copper Jaw Contacts */}
        <mesh position={[0, 0.04, -0.06]}>
          <boxGeometry args={[0.06, 0.05, 0.025]} />
          <meshStandardMaterial color="#EA580C" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Pivoting Copper Knife Blade */}
        <group position={[0, 0.02, 0.07]} rotation={[-knifeAngle, 0, 0]}>
          {/* Blade Bar */}
          <mesh position={[0, 0.03, -0.07]}>
            <boxGeometry args={[0.028, 0.02, 0.16]} />
            <meshStandardMaterial color="#F97316" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Insulated Ball Handle */}
          <mesh position={[0, 0.03, -0.16]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color="#7C2D12" roughness={0.3} />
          </mesh>
        </group>

        {/* Electrical Arc Spark (Flashes at closure) */}
        {sparkActive && (
          <mesh position={[0, 0.07, -0.06]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#67E8F9" />
          </mesh>
        )}
      </group>
    </group>
  );
};
