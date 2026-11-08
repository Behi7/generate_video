import React from "react";
import { useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export interface HammerSpecimenProps {
  localFrame?: number;
}

export const HammerSpecimen: React.FC<HammerSpecimenProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  // ============================================================================
  // ANTI-GHOSTING LAW:
  // Workpiece MUST be present on the lower anvil bolster across all 4 tiers
  // during cutting/striking frames (150..249f), and remain visible during
  // fracture (250..289f). Zero premature disappearance!
  // ============================================================================

  return (
    <group name="hammer_specimens_root">
      {tier === 1 && <Tier1AluminumBillet localFrame={local} />}
      {tier === 2 && <Tier2CopperBillet localFrame={local} />}
      {tier === 3 && <Tier3ForgingBlock localFrame={local} />}
      {tier === 4 && <Tier4QuantumSphere localFrame={local} />}
    </group>
  );
};

// ============================================================================
// TIER 1 SPECIMEN: DUCTILE ALUMINUM BILLET ON ANVIL (Z ≈ 0.12)
// Lower die bolster plate top surface: Y = 0.630, Z = 0.12
// Reciprocating trip strikes (~2.5 Hz, 12-frame cycle)
// Emits small flying silver chip particles and progressively squashes in Y.
// ============================================================================
const Tier1AluminumBillet: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const cycle = (localFrame - 150) % 12;
  const isOperating = localFrame >= 150 && localFrame < 225;
  const isDecel = localFrame >= 225 && localFrame < 245;
  const isStall = localFrame >= 245 && localFrame < 265;
  const isFractured = localFrame >= 265;

  // Strike impact occurs at cycle frame 10 (matching ram downward strike)
  const isImpact = isOperating && cycle === 10;

  // Progressive deformation across 4 phases:
  // Initial height 0.14m (top Y = 0.770, anvil at 0.630).
  // Target contact height at stall: 0.100m (top Y = 0.730).
  let p = 0;
  if (isOperating) {
    p = (localFrame - 150) / 74;
  } else if (isDecel) {
    p = 1.0;
  } else if (isStall || isFractured) {
    p = 1.0;
  }

  // Squash & Spread kinematics (Conservation of volume)
  // Target squash ratio at stall = 0.100 / 0.140 = 0.7143
  const targetSquash = 0.7143;
  const impactSquash = isImpact ? 0.02 : 0;
  const baseSquashY = 1.0 - p * (1.0 - targetSquash);
  const squashY = Math.max(targetSquash - (isImpact ? 0.02 : 0), baseSquashY - impactSquash);
  const spreadXZ = 1.0 + (1.0 - squashY) * 0.85;

  // Initial height: 0.14m. Bottom face is strictly pinned to lower anvil bolster top (Y = 0.630)
  const initialH = 0.14;
  const currentH = initialH * squashY;
  const posY = 0.630 + currentH / 2;
  const posZ = 0.12;

  // Chip particle emission timing (active for 3 frames following strike)
  const chipFrameOffset = (cycle - 10 + 12) % 12;
  const isChipBurst = isOperating && chipFrameOffset <= 3;

  return (
    <group position={[0, 0, posZ]}>
      {/* 1. Main Ductile Aluminum Billet */}
      <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, posY, 0]} scale={[spreadXZ, squashY, spreadXZ]}>
        {/* Chamfered Cylindrical Billet Core */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.078, 0.082, initialH, 24]} />
          <meshStandardMaterial
            color="#CBD5E1"
            roughness={0.24}
            metalness={0.88}
          />
        </mesh>

        {/* Top Strike Face Indentation Ring (Indented imprint from hammer ram die) */}
        <mesh position={[0, initialH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.072, 24]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.38} metalness={0.75} />
        </mesh>

        {/* Center Punch Dimple on Strike Face */}
        <mesh position={[0, initialH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.016, 16]} />
          <meshStandardMaterial color="#64748B" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Lateral Lathe-Turned Extrusion Grooves */}
        {[-0.035, 0, 0.035].map((gy, idx) => (
          <mesh key={`groove_${idx}`} position={[0, gy, 0]}>
            <cylinderGeometry args={[0.083, 0.083, 0.006, 24]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.35} metalness={0.8} />
          </mesh>
        ))}

        {/* Grade Stamp Plate on Front (AL-6061-T6) */}
        <mesh position={[0, 0, 0.083]}>
          <planeGeometry args={[0.07, 0.025]} />
          <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.5} />
        </mesh>
      </group>

      {/* 2. Silver Chip Particles Ejected on Strikes */}
      {isChipBurst && (
        <group position={[0, 0.630 + currentH, 0]}>
          {[
            [0.12, 0.02, 0.08],
            [-0.14, 0.04, -0.06],
            [0.08, 0.05, -0.11],
            [-0.10, 0.01, 0.12],
            [0.15, 0.03, -0.04],
            [-0.12, 0.06, 0.07],
          ].map(([cx, cy, cz], idx) => {
            const spread = 1.0 + chipFrameOffset * 0.45;
            return (
              <mesh
                key={`chip_${idx}`}
                position={[cx * spread, cy * (1 - chipFrameOffset * 0.2), cz * spread]}
                rotation={[chipFrameOffset * 0.8 * (idx + 1), chipFrameOffset * 0.5, 0]}
              >
                <boxGeometry args={[0.012, 0.006, 0.016]} />
                <meshStandardMaterial
                  color="#F1F5F9"
                  roughness={0.15}
                  metalness={0.95}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 3. Small Spark Micro-Burst on Metal-to-Metal Strike */}
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 11 ? 0 : 1}
        position={[0, 0.630 + currentH, 0]}
        color="#F8FAFC"
        scale={0.55}
        count={8}
      />
    </group>
  );
};

// ============================================================================
// TIER 2 SPECIMEN: HOT GLOWING COPPER/BRASS ROUND BILLET (Z ≈ 0.18)
// Lower die bolster plate top surface: Y = 0.553, Z = 0.18
// High-speed reciprocating percussive strikes (8-frame cycle)
// Color #EA580C with emissive orange glow, flattening into pancake with sparks.
// ============================================================================
const Tier2CopperBillet: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const cycle = (localFrame - 150) % 8;
  const isOperating = localFrame >= 150 && localFrame < 225;
  const isDecel = localFrame >= 225 && localFrame < 245;
  const isStall = localFrame >= 245 && localFrame < 265;
  const isFractured = localFrame >= 265;

  // Impact occurs at cycle frame 6 (matching ram strike contact)
  const isImpact = isOperating && cycle === 6;

  // Progressive deformation across 4 phases:
  // Initial height 0.14m (top Y = 0.693, lower die at 0.553).
  // Target contact height at stall: 0.057m (top Y = 0.610).
  let p = 0;
  if (isOperating) {
    p = (localFrame - 150) / 74;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Squashes in Y down to target 0.4071 (Y = 0.610), spreads in X/Z
  const targetSquash = 0.4071;
  const impactPulse = isImpact ? 0.015 : 0;
  const baseSquashY = 1.0 - p * (1.0 - targetSquash);
  const squashY = Math.max(targetSquash - (isImpact ? 0.015 : 0), baseSquashY - impactPulse);
  const spreadXZ = 1.0 + (1.0 - squashY) * 0.95;

  // Initial height: 0.14m. Bottom face pinned to lower anvil working face (Y = 0.553)
  const initialH = 0.14;
  const currentH = initialH * squashY;
  const posY = 0.553 + currentH / 2;
  const posZ = 0.18;

  // Thermal glow increases with friction compression and flashes on impact
  const thermalGlow = 1.2 + p * 1.8 + (isImpact ? 2.2 : 0);

  return (
    <group position={[0, 0, posZ]}>
      {/* 1. Hot Glowing Copper/Brass Billet Body */}
      <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, posY, 0]} scale={[spreadXZ, squashY, spreadXZ]}>
        {/* Main Glowing Cylindrical Round Billet */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.082, 0.086, initialH, 24]} />
          <meshStandardMaterial
            color="#EA580C"
            emissive="#EA580C"
            emissiveIntensity={thermalGlow}
            roughness={0.32}
            metalness={0.75}
          />
        </mesh>

        {/* Hot Incandescent Core Center Ring */}
        <mesh position={[0, initialH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.052, 20]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#F59E0B"
            emissiveIntensity={thermalGlow * 1.3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Lateral Hammer Stamping Ribs Formed by Repeated Blows */}
        {[-0.038, 0, 0.038].map((ry, idx) => (
          <mesh key={`rib_${idx}`} position={[0, ry, 0]}>
            <cylinderGeometry args={[0.088, 0.088, 0.008, 24]} />
            <meshStandardMaterial
              color="#D97706"
              emissive="#EA580C"
              emissiveIntensity={thermalGlow * 0.7}
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Thermal Heat Haze Halo / Glow Torus */}
      <mesh position={[0, posY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09 * spreadXZ, 0.15 * spreadXZ, 32]} />
        <meshBasicMaterial
          color="#EA580C"
          transparent
          opacity={0.35 + (isImpact ? 0.35 : 0)}
        />
      </mesh>

      {/* 3. Percussive Flying Sparks on High-Speed Strikes */}
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 4 ? 0 : 2}
        position={[0, 0.553 + currentH, 0]}
        color="#F59E0B"
        scale={0.85}
        count={14}
        spread={1.2}
      />
    </group>
  );
};

// ============================================================================
// TIER 3 SPECIMEN: GLOWING RED-HOT INDUSTRIAL STEEL FORGING BLOCK
// Resting on 5-ton lower anvil die (Die surface: Y = 0.790, Z ≈ 0.0)
// Heavy hydraulic compression strokes (22-frame cycle)
// Color #DC2626 with bright orange core #F97316, massive flattening, scale/spark bursts.
// Note on Z: die bolster riser sits at [0, 0.22, 0] (Y=0.22), die center coaxial at Z ≈ 0.0.
// Specimen depth spans 0.22m in Z, perfectly mating with both ram tup and die block.
// ============================================================================
const Tier3ForgingBlock: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const cycle = (localFrame - 150) % 22;
  const isOperating = localFrame >= 150 && localFrame < 225;
  const isDecel = localFrame >= 225 && localFrame < 245;
  const isStall = localFrame >= 245 && localFrame < 265;
  const isFractured = localFrame >= 265;

  // Impact occurs at cycle frame 19 (hydraulic plunge bottom strike)
  const isImpact = isOperating && (cycle === 18 || cycle === 19);

  // Progressive deformation across 4 phases:
  // Initial height 0.16m (top Y = 0.950, anvil face at 0.790).
  // Target contact height at stall: 0.060m (top Y = 0.850).
  let p = 0;
  if (isOperating) {
    p = (localFrame - 150) / 74;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Target squash ratio at stall = 0.060 / 0.160 = 0.375
  const targetSquash = 0.375;
  const impactPlunge = isImpact ? 0.015 : 0;
  const baseSquashY = 1.0 - p * (1.0 - targetSquash);
  const squashY = Math.max(targetSquash - (isImpact ? 0.015 : 0), baseSquashY - impactPlunge);
  const spreadXZ = 1.0 + (1.0 - squashY) * 0.9;

  // Initial block dimensions: 0.24 (X) x 0.16 (Y) x 0.22 (Z)
  const initialH = 0.16;
  const currentH = initialH * squashY;
  const posY = 0.790 + currentH / 2;
  const posZ = 0.0;

  // High-temperature radiation surge
  const coreGlow = 1.8 + p * 2.2 + (isImpact ? 3.0 : 0);

  return (
    <group position={[0, 0, posZ]}>
      {/* 1. Heavy Glowing Red-Hot Forging Ingot Block */}
      <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, posY, 0]} scale={[spreadXZ, squashY, spreadXZ]}>
        {/* Main Incandescent Red-Hot Steel Block (#DC2626) */}
        <RoundedBox args={[0.24, initialH, 0.22]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={coreGlow * 0.8}
            roughness={0.45}
            metalness={0.7}
          />
        </RoundedBox>

        {/* Bright Glowing Orange Core (#F97316) on Upper Working Face */}
        <mesh position={[0, initialH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 0.16]} />
          <meshStandardMaterial
            color="#F97316"
            emissive="#F97316"
            emissiveIntensity={coreGlow * 1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Hot Core Center Bullseye */}
        <mesh position={[0, initialH / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.045, 16]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#FBBF24"
            emissiveIntensity={coreGlow * 2.0}
            roughness={0.15}
          />
        </mesh>

        {/* Dark Oxide Scale Crust Patches (Peeling and buckling under compression) */}
        {[
          [-0.121, 0, 0, 0, Math.PI / 2, 0],
          [0.121, 0, 0, 0, -Math.PI / 2, 0],
          [0, 0, 0.111, 0, 0, 0],
          [0, 0, -0.111, 0, Math.PI, 0],
        ].map(([px, py, pz, rx, ry, rz], idx) => (
          <mesh key={`scale_${idx}`} position={[px, py, pz]} rotation={[rx, ry, rz]}>
            <planeGeometry args={[0.09, 0.08]} />
            <meshStandardMaterial
              color="#3F1515"
              roughness={0.85}
              metalness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Violent Industrial Scale & Spark Bursts on 100-Ton Forging Impact */}
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 21 ? 0 : 2}
        position={[0, 0.790 + currentH, 0]}
        color="#EF4444"
        scale={1.4}
        count={16}
        spread={1.5}
      />
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 21 ? 0 : 2}
        position={[0, 0.790 + currentH, 0]}
        color="#F97316"
        scale={1.0}
        count={10}
        spread={1.1}
      />

      {/* 3. Flying Scale / Iron Oxide Slag Chunks on Heavy Impact */}
      {isOperating && (cycle >= 21 || cycle <= 3) && (
        <group position={[0, 0.790 + currentH, 0]}>
          {[
            [0.18, 0.04, 0.12],
            [-0.20, 0.05, -0.10],
            [0.14, 0.08, -0.16],
            [-0.16, 0.03, 0.18],
          ].map(([sx, sy, sz], idx) => {
            const spread = 1.0 + ((cycle + 1) % 22) * 0.35;
            return (
              <mesh
                key={`slag_${idx}`}
                position={[sx * spread, sy, sz * spread]}
                rotation={[idx * 0.7, idx * 0.4, 0]}
              >
                <boxGeometry args={[0.022, 0.012, 0.018]} />
                <meshStandardMaterial color="#450A0A" emissive="#EF4444" emissiveIntensity={1.5} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// ============================================================================
// TIER 4 SPECIMEN: QUANTUM CRYSTALLINE TACHYON SPHERE (Z ≈ 0.0)
// Resting / levitating in Maglev Anvil Cradle (Top surface: Y = 0.350, Z = 0.0)
// Relativistic Rail-Punches (12-frame strike cycle)
// Cyan/purple crystalline refractive lattice, compressing with relativistic shock rings.
// ============================================================================
const Tier4QuantumSphere: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const cycle = (localFrame - 150) % 12;
  const isOperating = localFrame >= 150 && localFrame < 225;
  const isDecel = localFrame >= 225 && localFrame < 245;
  const isStall = localFrame >= 245 && localFrame < 265;
  const isFractured = localFrame >= 265;

  // Rail plunge impact occurs at cycle frame 10 (matching ram plunge impact)
  const isImpact = isOperating && cycle === 10;

  // Pre-activation gentle zero-point levitation (Frames 0..149)
  // Ensure hoverY never lifts sphere top above initial Y = 0.590 to avoid air gap violation
  const hoverY = localFrame < 150 ? (Math.sin(localFrame * 0.12) - 1) * 0.008 : 0;
  const idleSpin = localFrame * 0.035;

  let p = 0;
  if (isOperating) {
    p = (localFrame - 150) / 74;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Relativistic compression:
  // Initial height 0.24m (top Y = 0.590, cradle Y = 0.350).
  // Dynamic strikes compress sphere down to 0.450 (squashY = (0.450-0.350)/0.24 = 0.4167).
  // At stall (225..264), ultra-compressed to contact plane 0.420 (squashY = (0.420-0.350)/0.24 = 0.2917).
  const stallSquash = 0.2917;
  const strikeCompression = isImpact ? (1.0 - 0.4167) : 0;
  let squashY = 1.0 - strikeCompression;
  if (isDecel) {
    const pDecel = (localFrame - 225) / 20;
    squashY = 1.0 - pDecel * (1.0 - stallSquash);
  } else if (isStall || isFractured) {
    squashY = stallSquash;
  }

  const spreadXZ = Math.max(0.24, 1.0 + (1.0 - squashY) * 0.6);

  // Initial radius: 0.12m. Bottom resting plane in cradle is Y = 0.350
  const initialR = 0.12;
  const currentR_Y = initialR * squashY;
  const posY = 0.350 + currentR_Y + hoverY;
  const posZ = 0.0;

  // Expanding relativistic shock ring offset (0 to 1 over strike cycle)
  const shockRingProgress = ((cycle - 8 + 12) % 12) / 12;
  const shockRingRadius = 0.14 + shockRingProgress * 0.65;
  const shockRingOpacity = Math.max(0, 1.0 - shockRingProgress * 1.2);

  return (
    <group position={[0, 0, posZ]}>
      {/* 1. Quantum Tachyon Specimen Core */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, posY, 0]}
        scale={[spreadXZ, squashY, spreadXZ]}
        rotation={[0, idleSpin, 0]}
      >
        {/* Outer Crystalline Refractive Lattice (Electric Cyan #06B6D4 / #22D3EE) */}
        <mesh>
          <icosahedronGeometry args={[initialR, 1]} />
          <meshStandardMaterial
            color="#06B6D4"
            emissive="#22D3EE"
            emissiveIntensity={3.2 + (isImpact ? 3.5 : 0)}
            wireframe
            roughness={0.1}
          />
        </mesh>

        {/* Secondary Inner Geometric Geodesic Cage */}
        <mesh>
          <octahedronGeometry args={[initialR * 0.85, 2]} />
          <meshStandardMaterial
            color="#A855F7"
            emissive="#C084FC"
            emissiveIntensity={2.8 + (isImpact ? 2.5 : 0)}
            wireframe
            roughness={0.1}
          />
        </mesh>

        {/* Dense Inner Relativistic Core Sphere (Deep Purple Tachyon Plasma) */}
        <mesh>
          <sphereGeometry args={[initialR * 0.65, 24, 24]} />
          <meshStandardMaterial
            color="#9333EA"
            emissive="#A855F7"
            emissiveIntensity={4.0 + (isImpact ? 4.0 : 0)}
            roughness={0.08}
            metalness={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* 2. Relativistic Shock Rings Radiating Horizontally */}
      {isOperating && shockRingProgress < 0.85 && (
        <group position={[0, 0.350 + currentR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Primary Cyan Shockwave Ring */}
          <mesh>
            <ringGeometry args={[shockRingRadius - 0.02, shockRingRadius + 0.02, 36]} />
            <meshBasicMaterial
              color="#22D3EE"
              transparent
              opacity={shockRingOpacity * 0.85}
            />
          </mesh>

          {/* Secondary Purple Outer Expansion Shockwave Ring */}
          <mesh>
            <ringGeometry args={[shockRingRadius * 0.75 - 0.015, shockRingRadius * 0.75 + 0.015, 36]} />
            <meshBasicMaterial
              color="#C084FC"
              transparent
              opacity={shockRingOpacity * 0.65}
            />
          </mesh>
        </group>
      )}

      {/* 3. Magnetic Confinement Cradle Glow Disc */}
      <mesh position={[0, 0.351, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.18, 32]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#22D3EE"
          emissiveIntensity={2.0 + (isImpact ? 2.5 : 0)}
          roughness={0.1}
        />
      </mesh>

      {/* 4. High-Energy Tachyon Particle Bursts on Rail Impact */}
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 8 ? 0 : 2}
        position={[0, 0.350 + currentR_Y, 0]}
        color="#22D3EE"
        scale={1.2}
        count={16}
        spread={1.3}
      />
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={cycle === 8 ? 0 : 2}
        position={[0, 0.350 + currentR_Y, 0]}
        color="#C084FC"
        scale={0.9}
        count={12}
        spread={1.0}
      />
    </group>
  );
};
