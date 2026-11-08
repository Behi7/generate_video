import React from "react";
import { RoundedBox } from "@react-three/drei";

/** 1. 55-Gallon Industrial Steel Oil Barrels */
export const OilBarrels: React.FC<{ position?: [number, number, number] }> = ({
  position = [-2.6, -2.04, -1.8],
}) => (
  <group position={position}>
    {/* Blue Lubricant Drum */}
    <group position={[0, 0.44, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.88, 24]} />
        <meshStandardMaterial color="#1D4ED8" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Rib rings */}
      {[-0.2, 0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.325, 0.015, 8, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.5} />
        </mesh>
      ))}
    </group>
    {/* Red Solvent Drum (Offset) */}
    <group position={[0.55, 0.44, -0.2]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.88, 24]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  </group>
);

/** 2. Safety Warning Bollards (Black & Yellow Striped) */
export const WarningPillars: React.FC<{ position?: [number, number, number] }> = ({
  position = [2.4, -2.04, 1.8],
}) => (
  <group position={position}>
    <group position={[0, 0.45, 0]}>
      {/* Base flange */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>
      {/* Main post */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#EAB308" roughness={0.4} />
      </mesh>
      {/* Black hazard stripes */}
      {[-0.2, 0.0, 0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.08, 16]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>
      ))}
    </group>
  </group>
);

/** 3. Perimeter Cable Trays */
export const CableTrays: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, -2.04, -2.8],
}) => (
  <group position={position}>
    <RoundedBox args={[7.0, 0.08, 0.28]} radius={0.01} smoothness={4} position={[0, 0.04, 0]}>
      <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
    </RoundedBox>
    {/* Bundle of conduit cables */}
    {[-0.06, 0, 0.06].map((z, i) => (
      <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[0, 0.09, z]}>
        <cylinderGeometry args={[0.025, 0.025, 6.8, 12]} />
        <meshStandardMaterial color={i === 1 ? "#F59E0B" : "#0F172A"} roughness={0.8} />
      </mesh>
    ))}
  </group>
);

/** 4. Wall Tool Rack with Wrenches */
export const ToolRack: React.FC<{ position?: [number, number, number] }> = ({
  position = [-3.8, 0.5, -6.0],
}) => (
  <group position={position}>
    {/* Pegboard backing */}
    <RoundedBox args={[1.6, 2.2, 0.04]} radius={0.02} smoothness={4}>
      <meshStandardMaterial color="#1E293B" roughness={0.8} />
    </RoundedBox>
    {/* Chrome Wrenches */}
    {[-0.5, -0.2, 0.1, 0.4].map((x, i) => (
      <mesh key={i} position={[x, 0.2, 0.035]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.06, 0.6 + i * 0.12, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
      </mesh>
    ))}
  </group>
);

/** 5. Auxiliary Hydraulic Fluid Reservoir */
export const HydraulicReservoir: React.FC<{ position?: [number, number, number] }> = ({
  position = [2.7, -2.04, -2.2],
}) => (
  <group position={position}>
    <RoundedBox args={[0.68, 0.95, 0.68]} radius={0.03} smoothness={4} position={[0, 0.52, 0]}>
      <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
    </RoundedBox>
    {/* Vertical sight level tube */}
    <mesh position={[0.35, 0.52, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.6, 12]} />
      <meshStandardMaterial color="#D97706" roughness={0.1} transparent opacity={0.7} />
    </mesh>
    {/* Chrome pressure cap */}
    <mesh position={[0, 1.02, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
      <meshStandardMaterial color="#F8FAFC" roughness={0.1} metalness={0.95} />
    </mesh>
  </group>
);

/** 6. Metal Hazard Warning Sign */
export const WarningSign: React.FC<{ position?: [number, number, number] }> = ({
  position = [3.5, 1.4, -6.0],
}) => (
  <group position={position}>
    <RoundedBox args={[1.2, 0.7, 0.025]} radius={0.015} smoothness={4}>
      <meshStandardMaterial color="#EAB308" roughness={0.4} metalness={0.3} />
    </RoundedBox>
    {/* Inner black border */}
    <mesh position={[0, 0, 0.015]}>
      <planeGeometry args={[1.08, 0.58]} />
      <meshStandardMaterial color="#0F172A" roughness={0.9} />
    </mesh>
    {/* Warning text bar */}
    <mesh position={[0, 0.12, 0.018]}>
      <planeGeometry args={[0.9, 0.16]} />
      <meshStandardMaterial color="#DC2626" roughness={0.5} />
    </mesh>
  </group>
);
