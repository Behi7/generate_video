import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export const MotorPistonCrusher: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 2) return null;

  // --- ACT 1: STAGGERED LEGO SNAP ASSEMBLY (0..69f) ---
  // Step 2 (+20f): Heavy steel guide tower descends
  const towerDropY = interpolate(local, [15, 20], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const towerLanded = local >= 20;
  const towerSnap = local >= 20 && local <= 24;

  // Step 3 (+40f): 2-stroke engine + flywheel block docks to rear/top
  const engineDropX = interpolate(local, [35, 40], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const engineLanded = local >= 40;
  const engineSnap = local >= 40 && local <= 44;

  // Step 4 (+60f): Heavy mechanical drop-hammer ram slides down track
  const ramDropY = interpolate(local, [55, 60], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ramLanded = local >= 60;
  const ramSnap = local >= 60 && local <= 64;

  // --- ACT 2 & 3: RECIPROCATING CRANK & HAMMER KINEMATICS (70..249f) ---
  let crankAngle = 0;
  let hammerDisplacementY = 0;

  if (local >= 75 && local < 100) {
    // Act 2: Starter cord pull & initial compression hiccup
    crankAngle = interpolate(local, [75, 100], [0, Math.PI * 1.5], {
      easing: Easing.in(Easing.quad),
    });
  } else if (local >= 100 && local < 150) {
    // Accelerating engine chug-chug
    const baseCrank = Math.PI * 1.5;
    const addCrank = interpolate(local, [100, 150], [0, Math.PI * 8.0], {
      easing: Easing.linear,
    });
    crankAngle = baseCrank + addCrank;
    // Mild early stroke
    hammerDisplacementY = -Math.abs(Math.sin(crankAngle)) * 0.15;
  } else if (local >= 150 && local < 255) {
    // Act 3: High-speed mechanical pounding (180 RPM)
    const baseCrank = Math.PI * 9.5;
    const opCrank = (local - 150) * 0.65;
    crankAngle = baseCrank + opCrank;
    // Asymmetric impact stroke (quick fall, sharp strike)
    const cycle = (crankAngle % (Math.PI * 2)) / (Math.PI * 2);
    hammerDisplacementY = -Math.sin(cycle * Math.PI) * 0.28;
  } else if (local >= 255) {
    // Jammed at bottom impact
    crankAngle = Math.PI * 9.5 + (255 - 150) * 0.65;
    hammerDisplacementY = -0.28;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Broken displacements
  const conRodTiltZ = isBroken ? breakP * 0.55 : 0;
  const engineTiltX = isBroken ? breakP * 0.22 : 0;
  const chainWhipX = isBroken ? breakP * 0.45 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. HEAVY VERTICAL GUIDE TOWER & BED FIXTURE */}
      {towerLanded && (
        <group position={[0, towerDropY, 0]}>
          {/* Main Upright Box Column */}
          <group position={[0, 1.25, -0.25]}>
            <RoundedBox args={[0.54, 2.1, 0.42]} radius={0.03} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </RoundedBox>
            {/* Front Machined Dovetail Ways */}
            <mesh position={[0, 0, 0.22]}>
              <boxGeometry args={[0.42, 2.0, 0.03]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.96} />
            </mesh>
            {/* Left & Right Reinforcement Ribs */}
            <mesh position={[-0.32, -0.4, 0.08]} rotation={[0, 0, 0.25]}>
              <boxGeometry args={[0.08, 1.2, 0.24]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </mesh>
            <mesh position={[0.32, -0.4, 0.08]} rotation={[0, 0, -0.25]}>
              <boxGeometry args={[0.08, 1.2, 0.24]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* 2. INDUSTRIAL 2-STROKE ENGINE BLOCK & FLYWHEEL */}
      {engineLanded && (
        <group
          position={[
            engineDropX,
            1.85,
            -0.1,
          ]}
          rotation={[engineTiltX, 0, 0]}
        >
          {/* Vibrant Industrial Orange Engine Casing */}
          <RoundedBox args={[0.46, 0.44, 0.48]} radius={0.03} smoothness={4} position={[0, 0, -0.45]}>
            <meshStandardMaterial color="#EA580C" roughness={0.4} metalness={0.3} />
          </RoundedBox>

          {/* Finned Cylinder Head (Air Cooling) */}
          <group position={[0, 0.28, -0.45]}>
            {[0, 0.04, 0.08, 0.12].map((yOff, idx) => (
              <mesh key={idx} position={[0, yOff, 0]}>
                <boxGeometry args={[0.36, 0.018, 0.38]} />
                <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.2} />
              </mesh>
            ))}
          </group>

          {/* Chrome Exhaust Muffler Pipe & Canister */}
          <group position={[-0.28, 0.12, -0.42]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 0.32, 20]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.96} />
            </mesh>
            <mesh position={[-0.18, 0.12, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>

          {/* High-Mass Rotating Chrome Flywheel */}
          <group position={[0.28, 0, -0.1]} rotation={[crankAngle, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.08, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Polished Brass Counterweight Insert */}
            <mesh position={[0, 0.14, 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.09, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>

          {/* Connecting Rod Crank Pin (Drive linkages) */}
          <group position={[0, 0, 0]} rotation={[0, 0, conRodTiltZ]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.44, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
            </mesh>
            <mesh position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. HEAVY STAMPING HAMMER RAM */}
      {ramLanded && (
        <group
          position={[
            0,
            1.2 + ramDropY + hammerDisplacementY,
            0.02,
          ]}
        >
          {/* Main Slide Hammer Carriage */}
          <RoundedBox args={[0.42, 0.48, 0.36]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.6} />
          </RoundedBox>

          {/* Brass Slide Gibs (Running on guide tracks) */}
          <mesh position={[-0.22, 0, -0.06]}>
            <boxGeometry args={[0.03, 0.42, 0.1]} />
            <meshStandardMaterial color="#D97706" roughness={0.18} metalness={0.94} />
          </mesh>
          <mesh position={[0.22, 0, -0.06]}>
            <boxGeometry args={[0.03, 0.42, 0.1]} />
            <meshStandardMaterial color="#D97706" roughness={0.18} metalness={0.94} />
          </mesh>

          {/* Hardened Tool-Steel Pyramid Stamping Head */}
          <group position={[0, -0.32, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <coneGeometry args={[0.18, 0.22, 4]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Base collar flange */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 20]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.12} metalness={0.95} />
            </mesh>
          </group>
        </group>
      )}

      {/* Docking Snaps */}
      <SparkBurst active={towerSnap} frameOffset={local - 20} position={[0, 0.25, -0.25]} scale={0.7} />
      <SparkBurst active={engineSnap} frameOffset={local - 40} position={[0, 1.85, -0.25]} color="#EA580C" scale={0.8} />
      <SparkBurst active={ramSnap} frameOffset={local - 60} position={[0, 1.2, 0]} color="#E2E8F0" scale={0.85} />

      {/* Connecting Rod Failure Spark Burst */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0, 1.5, -0.1]}
        color="#F59E0B"
        scale={1.3}
        count={16}
      />
    </group>
  );
};