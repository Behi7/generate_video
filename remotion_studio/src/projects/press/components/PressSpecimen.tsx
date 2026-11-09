import React from "react";
import { useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import {
  getCurrentTier,
  getTierLocalFrame,
  getCleanserProgress,
  isStageCleansed,
} from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";
import { getPressTier1Kinematics } from "./PressTier1_Manual";
import { getPressTier2Kinematics } from "./PressTier2_Electric";
import { getPressHydraulicStroke } from "./PressTier3_Hydraulic";
import { getPressTier4Kinematics } from "./PressTier4_Futuristic";

export interface PressSpecimenProps {
  localFrame?: number;
}

/**
 * PressSpecimen: Universal Workpiece Specimen for the Press Progression.
 *
 * CRITICAL LAWS:
 * 1. Anti-Ghosting Law:
 *    The workpiece specimen MUST be present on the lower anvil bolster (Y=0.630, X=0, Z=0)
 *    across all 4 tiers strictly during operating frames (150..224f) and remain visible during
 *    overload deceleration (225..244f), stall (245..264f), and fracture (265..289f). Zero premature disappearance!
 *
 * 2. Geometric Alignment:
 *    - Centerline: Strictly coaxial along Y-axis: X=0, Z=0.
 *    - Bolster surface: Y = 0.630.
 *    - Initial specimen height: H = 0.140m (top surface at Y = 0.770m).
 *    - Deformed height at full compression / stall: H = 0.100m (top surface at Y = 0.730m).
 *    - Width / radius spreads outward (conservation of volume: as height decreases, radius expands).
 *
 * 3. 4 Tiers:
 *    - Tier 1: Ductile Annealed Copper Billet (#B45309 copper, metallic, roughness 0.35).
 *    - Tier 2: Aluminum 6061 Extrusion Ingot (#94A3B8 aluminum, roughness 0.40).
 *    - Tier 3: Red-Hot Titanium Forging Cube (#F97316 glowing thermal orange emissive core with dark scale crust).
 *    - Tier 4: Quantum Singularity Dark Matter Crystal (#8B5CF6 / #06B6D4 iridescent crystalline faceted geometry).
 */
export const PressSpecimen: React.FC<PressSpecimenProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  // Clean stage guarantee: by frame 310..319, table is completely clean
  if (isStageCleansed(local)) {
    return null;
  }

  // Smooth cleanser dissolve during active cleanser phase (275..309)
  const cleanserP = getCleanserProgress(local);
  const dissolveScale = Math.max(0, 1 - Math.pow(cleanserP, 2));

  return (
    <group name="press_specimens_root" scale={[dissolveScale, dissolveScale, dissolveScale]}>
      {tier === 1 && <Tier1CopperBillet localFrame={local} />}
      {tier === 2 && <Tier2AluminumIngot localFrame={local} />}
      {tier === 3 && <Tier3TitaniumCube localFrame={local} />}
      {tier === 4 && <Tier4QuantumCrystal localFrame={local} />}
    </group>
  );
};

// ============================================================================
// COMMON GEOMETRIC CONSTANTS
// ============================================================================
const BOLSTER_SURFACE_Y = 0.630;
const INITIAL_HEIGHT = 0.140; // Top surface at Y = 0.770
const STALL_HEIGHT = 0.100;   // Top surface at Y = 0.730
const TARGET_SQUASH = STALL_HEIGHT / INITIAL_HEIGHT; // 0.7142857

// ============================================================================
// TIER 1 SPECIMEN: DUCTILE ANNEALED COPPER BILLET
// Manual Flywheel Screw Press Workpiece
// Color: #B45309 copper, metallic 0.88, roughness 0.35.
// Squashes progressively from H=0.14 to H=0.10, micro-shudders on stall, emits small copper dust chips.
// ============================================================================
const Tier1CopperBillet: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const isOperating = localFrame >= 123 && localFrame < 213;
  const isDecel = localFrame >= 213 && localFrame < 225;
  const isStall = localFrame >= 225 && localFrame < 234;
  const isFractured = localFrame >= 234;

  // Progressive deformation across the 4 phases
  let p = 0;
  if (isOperating) {
    p = (localFrame - 123) / 89;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Micro-shudder on stall (245..264f): intense mechanical torque resistance jitter
  const shudderIntensity = isStall ? 0.0015 : 0;
  const shudderX = shudderIntensity * Math.sin(localFrame * 18.0);
  const shudderZ = shudderIntensity * Math.cos(localFrame * 16.0);

  // Progressive squash & volume conservation
  // Enforce zero rigid toolhead interpenetration by tracking actual dieY
  const { dieY } = getPressTier1Kinematics(localFrame, true, false);
  const maxAllowedH = Math.max(STALL_HEIGHT, dieY - BOLSTER_SURFACE_Y);
  const baseSquashY = 1.0 - p * (1.0 - TARGET_SQUASH);
  const uncompressedH = INITIAL_HEIGHT * baseSquashY;
  const currentH = Math.min(uncompressedH, maxAllowedH);

  const squashY = currentH / INITIAL_HEIGHT;
  // Volume conservation: radial spread expands as height contracts
  const spreadXZ = Math.sqrt(1.0 / Math.max(0.2, squashY));

  const posY = BOLSTER_SURFACE_Y + currentH / 2;

  // Small copper dust chips emitted during operating compression (100..224f)
  const isChipActive = isOperating || isDecel || isStall || isFractured;
  const chipProgress = Math.min(1.0, Math.max(0, (localFrame - 123) / 89));

  const chipPositions: [number, number, number][] = [
    [0.10, 0.005, 0.06],
    [-0.11, 0.005, -0.05],
    [0.07, 0.006, -0.09],
    [-0.08, 0.005, 0.08],
    [0.12, 0.004, -0.03],
    [-0.10, 0.006, 0.05],
    [0.05, 0.005, 0.11],
    [-0.06, 0.004, -0.10],
  ];

  return (
    <group position={[shudderX, 0, shudderZ]}>
      {/* 1. Main Ductile Annealed Copper Billet Body */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, posY, 0]}
        scale={[spreadXZ, squashY, spreadXZ]}
      >
        {/* Chamfered Cylindrical Billet Core (#B45309 copper, metallic 0.88, roughness 0.35) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.078, 0.082, INITIAL_HEIGHT, 32]} />
          <meshStandardMaterial
            color="#B45309"
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>

        {/* Barrel Bulge Ring (Plastic upsetting expansion around billet equator) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.083, 0.083, 0.032, 32]} />
          <meshStandardMaterial
            color="#9A3412"
            roughness={0.38}
            metalness={0.85}
          />
        </mesh>

        {/* Top Screw Press Platen Indentation Ring */}
        <mesh position={[0, INITIAL_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.038, 0.070, 32]} />
          <meshStandardMaterial
            color="#78350F"
            roughness={0.45}
            metalness={0.80}
          />
        </mesh>

        {/* Center Screw Die Punch Dimple */}
        <mesh position={[0, INITIAL_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.018, 20]} />
          <meshStandardMaterial
            color="#451A03"
            roughness={0.55}
            metalness={0.70}
          />
        </mesh>

        {/* Concentric Lathe Extrusion Grooves */}
        {[-0.035, 0.035].map((gy, idx) => (
          <mesh key={`groove_${idx}`} position={[0, gy, 0]}>
            <cylinderGeometry args={[0.083, 0.083, 0.005, 32]} />
            <meshStandardMaterial color="#9A3412" roughness={0.35} metalness={0.85} />
          </mesh>
        ))}

        {/* Industrial Grade Stamp Plate on Front (CU-ETP 99.9%) */}
        <mesh position={[0, 0, 0.082]}>
          <planeGeometry args={[0.065, 0.022]} />
          <meshStandardMaterial color="#78350F" roughness={0.5} metalness={0.7} />
        </mesh>
      </group>

      {/* 2. Copper Dust Micro-Chips (ejected during compression and settling on bolster) */}
      {isChipActive && (
        <group position={[0, BOLSTER_SURFACE_Y, 0]}>
          {chipPositions.map(([cx, cy, cz], idx) => {
            const spreadDist = 1.0 + chipProgress * 0.35 + (idx % 3) * 0.1;
            return (
              <mesh
                key={`chip_${idx}`}
                position={[cx * spreadDist, cy, cz * spreadDist]}
                rotation={[0, idx * 0.8, 0]}
              >
                <boxGeometry args={[0.008, 0.004, 0.010]} />
                <meshStandardMaterial
                  color="#EA580C"
                  roughness={0.30}
                  metalness={0.92}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// ============================================================================
// TIER 2 SPECIMEN: ALUMINUM 6061 EXTRUSION INGOT
// Motorized Eccentric Punch Press Workpiece
// Color: #94A3B8 aluminum, metallic 0.82, roughness 0.40.
// Punched rhythmically with spark bursts on contact, deforms from H=0.14 to H=0.10.
// ============================================================================
const Tier2AluminumIngot: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const isOperating = localFrame >= 123 && localFrame < 213;
  const isDecel = localFrame >= 213 && localFrame < 225;
  const isStall = localFrame >= 225 && localFrame < 234;
  const isFractured = localFrame >= 234;

  // Crank angle matching PressTier2_Electric (10 full revolutions across 88 frames)
  const crankAngle = isOperating ? ((localFrame - 123) / 88) * 10 * Math.PI * 2 : 0;
  // Punch strike occurs at bottom dead center contact (cos(crankAngle) < -0.92)
  const isImpact = isOperating && Math.cos(crankAngle) < -0.92;

  // Progressive deformation across the 4 phases
  let p = 0;
  if (isOperating) {
    p = (localFrame - 123) / 88;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Dynamic punch strike pulse
  const punchPulse = isImpact ? 0.015 : 0;
  const baseSquashY = 1.0 - p * (1.0 - TARGET_SQUASH);
  const targetSquashY = Math.max(TARGET_SQUASH - punchPulse, baseSquashY - punchPulse);

  // Enforce zero rigid toolhead interpenetration by tracking actual tool strokeY
  const { strokeY } = getPressTier2Kinematics(localFrame, true, 180, false);
  const maxAllowedH = Math.max(STALL_HEIGHT, strokeY - BOLSTER_SURFACE_Y);
  const uncompressedH = INITIAL_HEIGHT * targetSquashY;
  const currentH = Math.min(uncompressedH, maxAllowedH);
  const squashY = currentH / INITIAL_HEIGHT;
  const spreadXZ = Math.sqrt(1.0 / Math.max(0.2, squashY));

  const posY = BOLSTER_SURFACE_Y + currentH / 2;

  // Flying aluminum shear chips on rhythmic punch strokes
  const isShearChip = isOperating && isImpact;
  const chipFrameOffset = isImpact ? 1 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Aluminum 6061 Extrusion Ingot Body */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, posY, 0]}
        scale={[spreadXZ, squashY, spreadXZ]}
      >
        {/* Rounded Rectangular Extrusion Billet (#94A3B8 aluminum, roughness 0.40) */}
        <RoundedBox
          args={[0.165, INITIAL_HEIGHT, 0.165]}
          radius={0.016}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#94A3B8"
            roughness={0.40}
            metalness={0.82}
          />
        </RoundedBox>

        {/* Top Punch Die Stamping Imprint Pocket */}
        <mesh position={[0, INITIAL_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.038, 0.068, 24]} />
          <meshStandardMaterial color="#64748B" roughness={0.48} metalness={0.72} />
        </mesh>

        {/* Hardened Center Punch Recess */}
        <mesh position={[0, INITIAL_HEIGHT / 2 - 0.003, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.007, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.52} metalness={0.65} />
        </mesh>

        {/* Lateral Extrusion Rib Channels on 4 Sides */}
        {[-0.038, 0.038].map((ry, idx) => (
          <mesh key={`rib_${idx}`} position={[0, ry, 0]}>
            <boxGeometry args={[0.169, 0.007, 0.169]} />
            <meshStandardMaterial color="#64748B" roughness={0.38} metalness={0.78} />
          </mesh>
        ))}

        {/* Mill Spec Plate on Front (AL-6061-T6 FORGING) */}
        <mesh position={[0, 0, 0.084]}>
          <planeGeometry args={[0.085, 0.026]} />
          <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
        </mesh>
      </group>

      {/* 2. Rhythmic Spark Bursts on Punch Contact (Anti-Ghosting: active strictly on strikes) */}
      <SparkBurst
        active={isOperating && isImpact}
        frameOffset={chipFrameOffset}
        position={[0, BOLSTER_SURFACE_Y + currentH, 0]}
        color="#F8FAFC"
        scale={0.75}
        count={12}
        spread={1.2}
      />

      {/* 3. Ejected Aluminum Flakes on Punch Impact */}
      {isShearChip && (
        <group position={[0, BOLSTER_SURFACE_Y + currentH, 0]}>
          {[
            [0.12, 0.03, 0.07],
            [-0.13, 0.02, -0.06],
            [0.08, 0.04, -0.11],
            [-0.09, 0.02, 0.10],
          ].map(([fx, fy, fz], idx) => {
            const spread = 1.0 + chipFrameOffset * 0.4;
            return (
              <mesh
                key={`flake_${idx}`}
                position={[fx * spread, fy * (1 - chipFrameOffset * 0.15), fz * spread]}
                rotation={[chipFrameOffset * 0.7 * (idx + 1), chipFrameOffset * 0.4, 0]}
              >
                <boxGeometry args={[0.012, 0.005, 0.012]} />
                <meshStandardMaterial
                  color="#E2E8F0"
                  roughness={0.20}
                  metalness={0.95}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// ============================================================================
// TIER 3 SPECIMEN: RED-HOT TITANIUM FORGING CUBE
// Quad-Piston Hydraulic Forging Press Workpiece
// Color: #F97316 glowing thermal orange emissive core with dark scale crust.
// Compresses smoothly under hydraulic force from H=0.14 to H=0.10, steam/vapor bursts, intense orange thermal glow.
// ============================================================================
const Tier3TitaniumCube: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const isOperating = localFrame >= 123 && localFrame < 213;
  const isDecel = localFrame >= 213 && localFrame < 225;
  const isStall = localFrame >= 225 && localFrame < 234;
  const isFractured = localFrame >= 234;

  // Smooth hydraulic compression progress across phases
  let p = 0;
  if (isOperating) {
    p = (localFrame - 123) / 88;
  } else if (isDecel || isStall || isFractured) {
    p = 1.0;
  }

  // Hydraulic press die stroke height tracking matching PressTier3_Hydraulic exactly
  const { dieY } = getPressHydraulicStroke(localFrame, true, false);

  // Maximum allowed height to prevent rigid toolhead interpenetration (<= 0% overlap)
  const maxAllowedH = Math.max(STALL_HEIGHT, dieY - BOLSTER_SURFACE_Y);
  const baseSquashY = 1.0 - p * (1.0 - TARGET_SQUASH);
  const uncompressedH = INITIAL_HEIGHT * baseSquashY;
  const currentH = Math.min(uncompressedH, maxAllowedH);

  const squashY = currentH / INITIAL_HEIGHT;
  const spreadXZ = Math.sqrt(1.0 / Math.max(0.2, squashY));
  const posY = BOLSTER_SURFACE_Y + currentH / 2;

  // Intense thermal orange glow escalates under hydraulic compression work
  const coreGlow = 1.6 + p * 2.6;

  // Steam/vapor bursts emitted during hydraulic pressing (coolant vaporization on red-hot metal)
  const steamCycle = (localFrame - 100) % 25;
  const isSteamBurst = (isOperating && steamCycle >= 10 && steamCycle <= 14) || isStall;
  const steamOffset = steamCycle >= 10 ? (steamCycle - 10) / 4 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Incandescent Titanium Forging Cube */}
      <group
        name="specimen_workpiece"
        userData={{ isWorkpiece: true }}
        position={[0, posY, 0]}
        scale={[spreadXZ, squashY, spreadXZ]}
      >
        {/* Blazing Thermal Core (#F97316 glowing orange emissive core) */}
        <RoundedBox
          args={[0.18, INITIAL_HEIGHT, 0.18]}
          radius={0.02}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#F97316"
            emissive="#F97316"
            emissiveIntensity={coreGlow}
            roughness={0.35}
            metalness={0.70}
          />
        </RoundedBox>

        {/* Hot Incandescent Die Contact Face (Top Working Surface) */}
        <mesh position={[0, INITIAL_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 0.14]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#FBBF24"
            emissiveIntensity={coreGlow * 1.4}
            roughness={0.20}
            metalness={0.75}
          />
        </mesh>

        {/* White-Hot Core Bulls-Eye Spot */}
        <mesh position={[0, INITIAL_HEIGHT / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.042, 20]} />
          <meshStandardMaterial
            color="#FEF08A"
            emissive="#FEF08A"
            emissiveIntensity={coreGlow * 1.8}
            roughness={0.15}
          />
        </mesh>

        {/* Dark Oxide Scale Crust Patches (Buckling & separating under hydraulic expansion) */}
        {[
          [-0.091, 0, 0, 0, Math.PI / 2, 0],
          [0.091, 0, 0, 0, -Math.PI / 2, 0],
          [0, 0, 0.091, 0, 0, 0],
          [0, 0, -0.091, 0, Math.PI, 0],
        ].map(([px, py, pz, rx, ry, rz], idx) => (
          <mesh key={`crust_${idx}`} position={[px, py, pz]} rotation={[rx, ry, rz]}>
            <planeGeometry args={[0.075, 0.065]} />
            <meshStandardMaterial
              color="#271111"
              roughness={0.92}
              metalness={0.20}
            />
          </mesh>
        ))}

        {/* Dark Scale Corner Brackets */}
        {[
          [-0.075, 0, -0.075],
          [0.075, 0, -0.075],
          [-0.075, 0, 0.075],
          [0.075, 0, 0.075],
        ].map(([cx, cy, cz], idx) => (
          <mesh key={`corner_${idx}`} position={[cx, cy, cz]}>
            <boxGeometry args={[0.035, INITIAL_HEIGHT * 0.9, 0.035]} />
            <meshStandardMaterial
              color="#200C0C"
              roughness={0.88}
              metalness={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Steam / Vapor Bursts (Coolant vaporizing on red-hot titanium under hydraulic pressure) */}
      {isSteamBurst && (
        <group position={[0, BOLSTER_SURFACE_Y + currentH, 0]}>
          {[
            [0.10, 0.02, 0.08],
            [-0.11, 0.03, -0.07],
            [0.09, 0.01, -0.10],
            [-0.08, 0.02, 0.11],
            [0.12, 0.03, -0.04],
            [-0.10, 0.02, 0.06],
          ].map(([sx, sy, sz], idx) => {
            const expansion = 1.0 + steamOffset * 0.8;
            const steamRise = steamOffset * 0.08;
            const steamOpacity = Math.max(0, 0.45 * (1.0 - steamOffset));
            return (
              <mesh
                key={`steam_${idx}`}
                position={[sx * expansion, sy + steamRise, sz * expansion]}
              >
                <sphereGeometry args={[0.022 * expansion, 10, 10]} />
                <meshBasicMaterial
                  color="#F1F5F9"
                  transparent
                  opacity={steamOpacity}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 3. Incandescent Thermal Halo around Bolster Bed */}
      <mesh position={[0, BOLSTER_SURFACE_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12 * spreadXZ, 0.22 * spreadXZ, 32]} />
        <meshBasicMaterial
          color="#EA580C"
          transparent
          opacity={0.28 + (isOperating ? 0.15 : 0)}
        />
      </mesh>
    </group>
  );
};

// ============================================================================
// TIER 4 SPECIMEN: QUANTUM SINGULARITY DARK MATTER CRYSTAL
// Superconducting Quantum Pinch Press Workpiece
// Color: #8B5CF6 / #06B6D4 iridescent crystalline faceted geometry, refractive/specular, emissive inner core.
// Compressed by magnetic field from H=0.14 to H=0.10, intense prismatic flare on pinch, shatters on frame 265 into crystalline fragments.
// Anti-Ghosting Law: Fragments and dense singularity remnant stay on bolster bed throughout 265..289f!
// ============================================================================
const Tier4QuantumCrystal: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const isPreOp = localFrame < 63;
  const isOperating = localFrame >= 123 && localFrame < 213;
  const isDecel = localFrame >= 213 && localFrame < 225;
  const isStall = localFrame >= 225 && localFrame < 234;
  const isShattered = localFrame >= 234;

  // Gentle zero-point levitation hover before operation (0..99f)
  // Ensure hover never lifts specimen top above initial ceiling
  const hoverY = isPreOp ? (Math.sin(localFrame * 0.10) - 1) * 0.004 : 0;
  const idleSpin = localFrame * 0.025;

  // Smooth magnetic pinch compression progress across phases
  let p = 0;
  if (isOperating) {
    p = (localFrame - 123) / 84;
  } else if (isDecel || isStall || isShattered) {
    p = 1.0;
  }

  // Magnetic pinch die stroke tracking matching PressTier4_Futuristic exactly
  const { dieY } = getPressTier4Kinematics(localFrame, true, false);

  // Magnetic constriction pulses create intense prismatic flares
  const pinchCycle = (localFrame - 123) % 12;
  const isPinchPulse = isOperating && (pinchCycle === 10 || pinchCycle === 11);

  // Maximum allowed height to prevent rigid toolhead interpenetration (<= 0% overlap)
  const maxAllowedH = Math.max(STALL_HEIGHT, dieY - BOLSTER_SURFACE_Y);
  const baseSquashY = 1.0 - p * (1.0 - TARGET_SQUASH);
  const uncompressedH = INITIAL_HEIGHT * baseSquashY;
  const currentH = Math.min(uncompressedH, maxAllowedH);

  const squashY = currentH / INITIAL_HEIGHT;
  const spreadXZ = Math.sqrt(1.0 / Math.max(0.2, squashY));
  const posY = BOLSTER_SURFACE_Y + currentH / 2 + hoverY;

  // Prismatic flare shockwave radius expanding horizontally
  const shockProgress = ((pinchCycle - 9 + 12) % 12) / 12;
  const shockRadius = 0.12 + shockProgress * 0.55;
  const shockOpacity = Math.max(0, 0.85 * (1.0 - shockProgress * 1.2));

  // Shatter dynamics on frame 234 (Anti-Ghosting Law: shards explode outward, core remnant stays on bolster)
  const shatterProgress = isShattered ? Math.min(1.0, (localFrame - 234) / 24) : 0;
  const isFractureSpark = localFrame >= 234 && localFrame <= 238;

  // 14 deterministic shard trajectories for crystal shatter
  const shardTrajectories: [number, number, number, number, number, number][] = [
    [0.6, 0.8, 0.4, 1.2, 0.5, 0.8],
    [-0.7, 0.9, -0.3, -1.0, 0.8, 0.5],
    [0.5, 0.6, -0.7, 0.8, -1.1, 0.4],
    [-0.6, 0.7, 0.6, -0.7, 0.9, -0.6],
    [0.8, 0.5, -0.4, 1.4, -0.4, 0.9],
    [-0.8, 0.4, 0.5, -1.2, 0.6, -0.7],
    [0.3, 0.9, 0.7, 0.5, 1.2, -0.5],
    [-0.4, 0.8, -0.8, -0.6, -1.0, 0.8],
    [0.7, 0.3, 0.6, 1.0, 0.4, 1.1],
    [-0.7, 0.3, -0.6, -1.1, -0.5, -0.9],
    [0.2, 0.7, -0.9, 0.4, 1.3, 0.3],
    [-0.3, 0.6, 0.8, -0.5, -1.2, -0.4],
    [0.5, 0.2, -0.8, 0.9, 0.7, -0.8],
    [-0.5, 0.2, 0.8, -0.8, -0.6, 1.0],
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Intact Quantum Dark Matter Crystal (Frames 0..264) */}
      {!isShattered && (
        <group
          name="specimen_workpiece"
          userData={{ isWorkpiece: true }}
          position={[0, posY, 0]}
          scale={[spreadXZ, squashY, spreadXZ]}
          rotation={[0, idleSpin, 0]}
        >
          {/* Outer Faceted Crystalline Lattice (#06B6D4 / #22D3EE electric cyan) */}
          <mesh castShadow receiveShadow>
            <octahedronGeometry args={[0.070, 1]} />
            <meshStandardMaterial
              color="#06B6D4"
              emissive="#22D3EE"
              emissiveIntensity={2.4 + (isPinchPulse ? 3.0 : 0)}
              roughness={0.08}
              metalness={0.88}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Secondary Interlocking Crystalline Geodesic Cage (#8B5CF6 royal violet) */}
          <mesh>
            <icosahedronGeometry args={[0.056, 0]} />
            <meshStandardMaterial
              color="#8B5CF6"
              emissive="#A855F7"
              emissiveIntensity={2.8 + (isPinchPulse ? 2.5 : 0)}
              wireframe
              roughness={0.10}
            />
          </mesh>

          {/* Inner Dense Dark Matter Singularity Core (#6D28D9 deep tachyon plasma) */}
          <mesh>
            <sphereGeometry args={[0.035, 24, 24]} />
            <meshStandardMaterial
              color="#6D28D9"
              emissive="#8B5CF6"
              emissiveIntensity={4.2 + (isPinchPulse ? 3.8 : 0)}
              roughness={0.05}
              metalness={0.95}
            />
          </mesh>

          {/* Magnetic Flux Waist Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.070, 0.090, 32]} />
            <meshBasicMaterial
              color="#22D3EE"
              transparent
              opacity={0.45 + (isPinchPulse ? 0.4 : 0)}
            />
          </mesh>
        </group>
      )}

      {/* 2. Prismatic Flare Shockwaves Radiating on Magnetic Pinch */}
      {isOperating && shockProgress < 0.85 && (
        <group position={[0, BOLSTER_SURFACE_Y + currentH / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Primary Cyan Shockwave Ring */}
          <mesh>
            <ringGeometry args={[shockRadius - 0.015, shockRadius + 0.015, 36]} />
            <meshBasicMaterial
              color="#22D3EE"
              transparent
              opacity={shockOpacity * 0.9}
            />
          </mesh>

          {/* Secondary Violet Prismatic Ring */}
          <mesh>
            <ringGeometry args={[shockRadius * 0.78 - 0.012, shockRadius * 0.78 + 0.012, 36]} />
            <meshBasicMaterial
              color="#C084FC"
              transparent
              opacity={shockOpacity * 0.7}
            />
          </mesh>
        </group>
      )}

      {/* 3. Magnetic Cradle Flux Disc on Bolster Bed */}
      <mesh position={[0, BOLSTER_SURFACE_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.16, 32]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#22D3EE"
          emissiveIntensity={1.8 + (isPinchPulse ? 2.5 : 0)}
          roughness={0.12}
        />
      </mesh>

      {/* 4. Overload Shatter at Frame 265 (Anti-Ghosting Law: shards fling, core remnant stays on bolster) */}
      {isShattered && (
        <group name="specimen_workpiece" userData={{ isWorkpiece: true }}>
          {/* Exploding Crystalline Facet Fragments */}
          {shardTrajectories.map(([vx, vy, vz, rx, ry, rz], idx) => {
            const spreadDist = 0.08 + shatterProgress * 0.65;
            const posX = vx * spreadDist;
            // Parabolic gravity trajectory
            const posY = (BOLSTER_SURFACE_Y + 0.05) + vy * shatterProgress * 0.45 - 1.2 * shatterProgress * shatterProgress;
            const posZ = vz * spreadDist;
            const rotX = rx * shatterProgress * 4.5;
            const rotY = ry * shatterProgress * 4.5;
            const rotZ = rz * shatterProgress * 4.5;
            const shardScale = Math.max(0.012, 0.028 * (1.0 - shatterProgress * 0.35));

            return (
              <mesh
                key={`shard_${idx}`}
                position={[posX, Math.max(BOLSTER_SURFACE_Y + 0.005, posY), posZ]}
                rotation={[rotX, rotY, rotZ]}
              >
                <octahedronGeometry args={[shardScale, 0]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? "#06B6D4" : "#8B5CF6"}
                  emissive={idx % 2 === 0 ? "#22D3EE" : "#C084FC"}
                  emissiveIntensity={3.2 * (1.0 - shatterProgress * 0.5)}
                  roughness={0.10}
                  metalness={0.90}
                />
              </mesh>
            );
          })}

          {/* Hyper-Dense Collapsed Singularity Core Remnant (Resting stably on bolster bolster plate) */}
          <group position={[0, BOLSTER_SURFACE_Y + 0.038, 0]}>
            <mesh>
              <sphereGeometry args={[0.038, 20, 20]} />
              <meshStandardMaterial
                color="#4C1D95"
                emissive="#8B5CF6"
                emissiveIntensity={3.0}
                roughness={0.12}
                metalness={0.95}
              />
            </mesh>

            {/* Shattered Crystal Base Shards around Core on Bed */}
            {[0, 1.2, 2.4, 3.6, 4.8].map((angle, idx) => (
              <mesh
                key={`base_shard_${idx}`}
                position={[Math.cos(angle) * 0.055, -0.025, Math.sin(angle) * 0.055]}
                rotation={[0.3, angle, 0.4]}
              >
                <octahedronGeometry args={[0.022, 0]} />
                <meshStandardMaterial
                  color="#06B6D4"
                  emissive="#22D3EE"
                  emissiveIntensity={2.0}
                  roughness={0.15}
                  metalness={0.85}
                />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* 5. Prismatic Shatter Spark Bursts at Frame 234 */}
      <SparkBurst
        active={isFractureSpark}
        frameOffset={localFrame - 234}
        position={[0, BOLSTER_SURFACE_Y + 0.05, 0]}
        color="#06B6D4"
        scale={1.6}
        count={16}
        spread={1.5}
      />
      <SparkBurst
        active={isFractureSpark}
        frameOffset={localFrame - 234}
        position={[0, BOLSTER_SURFACE_Y + 0.05, 0]}
        color="#8B5CF6"
        scale={1.2}
        count={12}
        spread={1.2}
      />
    </group>
  );
};
