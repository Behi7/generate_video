import React from "react";
import { RoundedBox } from "@react-three/drei";

export interface BackdropProps {
  position?: [number, number, number];
}

/** 1. Structural Yellow Factory Steel Trusses */
export const FactoryTrusses: React.FC<BackdropProps> = ({ position = [0, 1.5, -6.5] }) => (
  <group position={position}>
    {/* Dark rear wall */}
    <mesh position={[0, 0, -0.2]}>
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#1E293B" roughness={0.8} />
    </mesh>
    {/* Vertical yellow crane columns */}
    {[-4.5, -1.5, 1.5, 4.5].map((x, i) => (
      <group key={i} position={[x, 0, 0]}>
        <RoundedBox args={[0.24, 12, 0.24]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color="#EAB308" roughness={0.5} metalness={0.6} />
        </RoundedBox>
        {/* Cross gusset plates */}
        {[-2.5, 0, 2.5].map((y, j) => (
          <mesh key={j} position={[0, y, 0.13]}>
            <boxGeometry args={[0.34, 0.12, 0.02]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>
        ))}
      </group>
    ))}
    {/* Horizontal runway beam */}
    <RoundedBox args={[16, 0.32, 0.28]} radius={0.02} smoothness={4} position={[0, 4.2, 0.1]}>
      <meshStandardMaterial color="#CA8A04" roughness={0.5} metalness={0.7} />
    </RoundedBox>
  </group>
);

/** 2. Heavy Industrial Brick Wall with Mortar */
export const BrickWall: React.FC<BackdropProps> = ({ position = [0, 1.5, -6.5] }) => (
  <group position={position}>
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#3E2723" roughness={0.95} />
    </mesh>
    {/* Embossed concrete pillar pilasters */}
    {[-5, -2.5, 2.5, 5].map((x, i) => (
      <RoundedBox key={i} args={[0.42, 12, 0.18]} radius={0.03} smoothness={4} position={[x, 0, 0.08]}>
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </RoundedBox>
    ))}
    {/* Lower concrete wainscot curb */}
    <RoundedBox args={[18, 0.6, 0.22]} radius={0.03} smoothness={4} position={[0, -3.2, 0.1]}>
      <meshStandardMaterial color="#334155" roughness={0.85} />
    </RoundedBox>
  </group>
);

/** 3. Industrial Pipe and Cable Tray Rack */
export const PipeAndCableRack: React.FC<BackdropProps> = ({ position = [0, 1.5, -6.5] }) => (
  <group position={position}>
    <mesh position={[0, 0, -0.3]}>
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#0F172A" roughness={0.8} />
    </mesh>
    {/* Horizontal overhead cable tray */}
    <RoundedBox args={[16, 0.12, 0.45]} radius={0.015} smoothness={4} position={[0, 3.8, 0.2]}>
      <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.8} />
    </RoundedBox>
    {/* High-pressure steel hydraulic pipes */}
    {[-2.0, -1.6, -1.2, 1.2, 1.6, 2.0].map((y, i) => (
      <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[0, y, 0.12]}>
        <cylinderGeometry args={[0.045, 0.045, 16, 16]} />
        <meshStandardMaterial
          color={i % 2 === 0 ? "#E2E8F0" : "#D97706"}
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
    ))}
  </group>
);

/** 4. Cyberpunk Infinite Vertical Light Columns */
export const CyberpunkVoid: React.FC<BackdropProps> = ({ position = [0, 1.5, -6.5] }) => (
  <group position={position}>
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#050814" roughness={0.6} metalness={0.5} />
    </mesh>
    {/* 8 Vertical LED Light Bars (Cyan & Violet) */}
    {[-5.0, -3.5, -2.0, -0.5, 0.5, 2.0, 3.5, 5.0].map((x, i) => (
      <mesh key={i} position={[x, 0, 0.04]}>
        <planeGeometry args={[0.07, 12]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive={i % 2 === 0 ? "#06B6D4" : "#D946EF"}
          emissiveIntensity={2.8}
        />
      </mesh>
    ))}
  </group>
);

/** 5. High-Tech White Cleanroom */
export const CleanroomWhite: React.FC<BackdropProps> = ({ position = [0, 1.5, -6.5] }) => (
  <group position={position}>
    {/* High-gloss white composite wall */}
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#F8FAFC" roughness={0.15} metalness={0.1} />
    </mesh>
    {/* Horizontal LED strip diffuser */}
    <mesh position={[0, 1.8, 0.02]}>
      <planeGeometry args={[18, 0.12]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#38BDF8" emissiveIntensity={1.5} />
    </mesh>
    {/* Inspection observation window */}
    <RoundedBox args={[7.2, 2.8, 0.08]} radius={0.03} smoothness={4} position={[0, 0, 0.04]}>
      <meshStandardMaterial color="#0284C7" roughness={0.05} metalness={0.9} transparent opacity={0.6} />
    </RoundedBox>
  </group>
);
