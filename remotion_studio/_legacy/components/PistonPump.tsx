import React from "react";
import { useCurrentFrame } from "remotion";

interface PistonPumpProps {
  position?: [number, number, number];
  scale?: [number, number, number] | number;
}

export const PistonPump: React.FC<PistonPumpProps> = ({
  position = [0, -2.1, 0.1],
  scale = [1.25, 1.25, 1.25],
}) => {
  const frame = useCurrentFrame();

  // Machine starts ONLY after Trigger 1 (frame >= 390)
  const isStarted = frame >= 390;
  const activeFrame = isStarted ? frame - 390 : 0;

  // Smooth flywheel rotation accelerating after switch trigger
  const flywheelAngle = isStarted ? activeFrame * 0.12 : 0;

  // Crank kinematics
  const crankR = 0.18;
  const crankX = Math.cos(flywheelAngle) * crankR;
  const crankY = Math.sin(flywheelAngle) * crankR;

  // Piston stroke
  const pistonStrokeY = crankY * 0.7;

  // Water stream starts only after flywheel is spinning (frame >= 396)
  const showWaterStream = frame >= 396;

  return (
    <group position={position} scale={scale}>
      {/* 1. Heavy Cast-Iron Foundation Base */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.5, 0.24, 0.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* 2. Flywheel Bearing Pedestals */}
      <mesh position={[-0.38, 0.55, 0]}>
        <boxGeometry args={[0.14, 0.65, 0.26]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0.18, 0.55, 0]}>
        <boxGeometry args={[0.14, 0.65, 0.26]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* 3. Physical Central Drive Crankshaft (Coaxial) */}
      <mesh position={[-0.1, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.75, 24]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* 4. Large Spoked Flywheel (Mounted rigidly on drive shaft at x = -0.38) */}
      <group position={[-0.38, 0.82, 0]} rotation={[0, 0, flywheelAngle]}>
        {/* Outer Rim */}
        <mesh>
          <torusGeometry args={[0.48, 0.05, 16, 32]} />
          <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.1, 24]} />
          <meshStandardMaterial color="#92400E" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* 6 Radial Spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const spokeAngle = (i * Math.PI) / 3;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(spokeAngle) * 0.24,
                Math.sin(spokeAngle) * 0.24,
                0,
              ]}
              rotation={[0, 0, spokeAngle + Math.PI / 2]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.44, 16]} />
              <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* 5. Crank Disc with Pin */}
      <group position={[0.14, 0.82, 0.08]}>
        <mesh rotation={[Math.PI / 2, 0, flywheelAngle]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Crank Pin */}
        <mesh position={[crankX, crankY, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.06, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.12} metalness={0.95} />
        </mesh>
      </group>

      {/* 6. Structural Cast-Iron Support Pillars for Cylinder */}
      <mesh position={[0.38, 0.65, -0.1]}>
        <boxGeometry args={[0.08, 0.8, 0.08]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0.38, 0.65, 0.1]}>
        <boxGeometry args={[0.08, 0.8, 0.08]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* 7. Double-Acting Bronze Cylinder Assembly */}
      <group position={[0.38, 1.35, 0]}>
        {/* Lower Mounting Flange */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          <meshStandardMaterial color="#92400E" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Polished Bronze Cylinder Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
          <meshStandardMaterial color="#B45309" roughness={0.2} metalness={0.88} />
        </mesh>
        {/* Top Cylinder Head with Bolted Rim */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          <meshStandardMaterial color="#92400E" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Reciprocating Steel Piston Shaft */}
        <mesh position={[0, -0.22 + pistonStrokeY, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.45, 16]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.1} metalness={0.95} />
        </mesh>
      </group>

      {/* 8. Copper Discharge Gooseneck Pipe (Curves down into basin) */}
      <group position={[0.38, 1.55, 0]}>
        {/* Horizontal Exit Pipe with Flange */}
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.22, 20]} />
          <meshStandardMaterial color="#EA580C" roughness={0.2} metalness={0.88} />
        </mesh>
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.04, 20]} />
          <meshStandardMaterial color="#9A3412" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Downward Elbow Nozzle */}
        <mesh position={[0.26, -0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 20]} />
          <meshStandardMaterial color="#EA580C" roughness={0.2} metalness={0.88} />
        </mesh>
      </group>

      {/* 9. Continuous Steady Water Stream (Connects directly to nozzle mouth!) */}
      {showWaterStream && (
        <mesh position={[0.64, 0.85, 0]}>
          <cylinderGeometry args={[0.024, 0.028, 1.15, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* 10. Bronze Holding Basin */}
      <mesh position={[0.64, 0.32, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 0.36, 24]} />
        <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
      </mesh>
    </group>
  );
};
