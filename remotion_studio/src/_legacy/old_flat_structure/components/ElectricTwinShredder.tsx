import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export interface ElectricTwinShredderProps {
  localFrame?: number;
}

export const ElectricTwinShredder: React.FC<ElectricTwinShredderProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  if (overrideLocal === undefined && tier !== 2) return null;

  // --- ACT 1: INSIDE-OUT MODULAR ASSEMBLY (0..69f) ---
  // Order 0 (0f): Heavy Welded Steel Tubing Stand & Bed
  const standLandP = interpolate(local, [0, 8], [0, 1], {
    easing: Easing.out(Easing.back(1.4)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const standSnapSpark = local >= 6 && local <= 10;

  // Order 1 (20f): Internal Twin Keyed Shafts & Pillow Block Bearings
  const shaftDropY = interpolate(local, [15, 20], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shaftLanded = local >= 20;
  const shaftSnapSpark = local >= 20 && local <= 24;

  // Order 2 (40f): Welded Cutting Chamber Box & Flared Safety Hopper
  const chamberDropY = interpolate(local, [35, 40], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chamberLanded = local >= 40;
  const chamberSnapSpark = local >= 40 && local <= 44;

  // Order 3 (60f): 1.5kW Electric Induction Motor & Chain Drive
  const motorDropX = interpolate(local, [55, 60], [-3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const motorLanded = local >= 60;
  const motorSnapSpark = local >= 60 && local <= 64;

  // Order 4 (75f): Hardened 4-Hook Claw Discs Array
  const discsLanded = local >= 68;

  // --- ACT 2 & 3: ELECTRIC MOTOR & CHAIN KINEMATICS (70..249f) ---
  let shaftAngle = 0;
  let motorAngle = 0;
  let chainVibe = 0;

  if (local >= 75 && local < 105) {
    // Act 2: Switch clack, motor spin-up (acceleration)
    shaftAngle = interpolate(local, [75, 105], [0, Math.PI * 3.0], {
      easing: Easing.in(Easing.quad),
    });
    motorAngle = shaftAngle * 3.2; // Motor 3.2:1 reduction
    chainVibe = Math.sin(local * 2.8) * 0.012;
  } else if (local >= 105 && local < 150) {
    // Spooling to full 120 RPM speed
    const baseRot = Math.PI * 3.0;
    const addRot = interpolate(local, [105, 150], [0, Math.PI * 9.0], {
      easing: Easing.linear,
    });
    shaftAngle = baseRot + addRot;
    motorAngle = shaftAngle * 3.2;
    chainVibe = Math.sin(local * 3.5) * 0.008;
  } else if (local >= 150 && local < 255) {
    // Act 3: Steady 120 RPM continuous shredding
    const baseRot = Math.PI * 12.0;
    const opRot = (local - 150) * 0.42;
    shaftAngle = baseRot + opRot;
    motorAngle = shaftAngle * 3.2;
    chainVibe = Math.sin(local * 4.0) * 0.006;
  } else if (local >= 255) {
    // Jammed at frame 255
    shaftAngle = Math.PI * 12.0 + (255 - 150) * 0.42;
    motorAngle = shaftAngle * 3.2;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 276], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Rupture displacements: Chain snaps and flails downward/outward
  const chainSnapX = isBroken ? breakP * 0.45 : 0;
  const chainSnapY = isBroken ? -breakP * 0.35 : 0;
  const shearedToothOffset = isBroken ? breakP * 0.28 : 0;
  const shearedToothRot = isBroken ? breakP * 1.5 : 0;
  const frameShudder = isBroken && local < 280 ? Math.sin((local - 265) * 6) * 0.02 * (1 - breakP) : 0;

  // Dual Shaft Dimensions
  const leftShaftX = -0.15;
  const rightShaftX = 0.15;
  const shaftCenterY = 1.65;

  const discCount = 7;
  const discSpacing = 0.065;

  return (
    <group position={[frameShudder, 0, 0]}>
      {/* =========================================================================
          MODULE 0: WELDED BOX STEEL STAND & BED (Order 0, frame 0)
          ========================================================================= */}
      <group position={[0, (1 - standLandP) * 1.6, 0]}>
        {/* Foundation Base Bed Frame */}
        <RoundedBox args={[1.4, 0.14, 1.1]} radius={0.025} smoothness={4} position={[0, 0.07, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* 4 Heavy Tubular Steel Corner Legs */}
        {[
          [-0.55, -0.42],
          [0.55, -0.42],
          [-0.55, 0.42],
          [0.55, 0.42],
        ].map(([lx, lz], i) => (
          <group key={i} position={[lx, 0.72, lz]}>
            <RoundedBox args={[0.08, 1.16, 0.08]} radius={0.015} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
            </RoundedBox>
            {/* Vibration Damping Neoprene Foot Pad */}
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Diagonal Cross-Brace Gussets */}
        <mesh position={[0, 0.55, -0.42]} rotation={[0, 0, 0.48]}>
          <boxGeometry args={[1.15, 0.035, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.55, -0.42]} rotation={[0, 0, -0.48]}>
          <boxGeometry args={[1.15, 0.035, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
        </mesh>

        {/* Sheet Steel Funnel Discharge Chute */}
        <group position={[0, 1.05, 0]}>
          <mesh position={[0, -0.22, 0.28]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.72, 0.45, 0.015]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.22, -0.28]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.72, 0.45, 0.015]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          MODULE 1: INTERNAL TWIN SHAFTS & PILLOW BLOCK BEARINGS (Order 1, frame 20)
          ========================================================================= */}
      {shaftLanded && (
        <group position={[0, shaftDropY, 0]}>
          {/* 4 Cast Iron Pillow Block Flange Bearings */}
          {[
            [leftShaftX, 0.32],
            [leftShaftX, -0.32],
            [rightShaftX, 0.32],
            [rightShaftX, -0.32],
          ].map(([bx, bz], i) => (
            <group key={i} position={[bx, shaftCenterY, bz]}>
              <RoundedBox args={[0.16, 0.14, 0.05]} radius={0.02} smoothness={4}>
                <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
              </RoundedBox>
              {/* Brass Grease Zerk Fitting */}
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.025, 12]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            </group>
          ))}

          {/* Left Shaft Assembly (Clockwise rotation: -shaftAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0]} rotation={[0, 0, -shaftAngle]}>
            {/* Mirror Ground Chrome Precision Shaft */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.74, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Machined Keyway Slot */}
            <mesh position={[0.036, 0, 0]}>
              <boxGeometry args={[0.008, 0.008, 0.62]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </group>

          {/* Right Shaft Assembly (Counter-Clockwise rotation: +shaftAngle) */}
          <group position={[rightShaftX, shaftCenterY, 0]} rotation={[0, 0, shaftAngle]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.74, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            <mesh position={[-0.036, 0, 0]}>
              <boxGeometry args={[0.008, 0.008, 0.62]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 2: CUTTING CHAMBER & SAFETY HOPPER (Order 2, frame 40)
          ========================================================================= */}
      {chamberLanded && (
        <group position={[0, chamberDropY, 0]}>
          {/* Main Heavy Cutting Chamber Box */}
          <group position={[0, shaftCenterY, 0]}>
            {/* Left Plate with Hex Bolts */}
            <RoundedBox args={[0.03, 0.44, 0.68]} radius={0.015} smoothness={4} position={[-0.34, 0, 0]}>
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.65} />
            </RoundedBox>
            {/* Right Plate with Hex Bolts */}
            <RoundedBox args={[0.03, 0.44, 0.68]} radius={0.015} smoothness={4} position={[0.34, 0, 0]}>
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.65} />
            </RoundedBox>

            {/* Hex Bolt Arrays on Chamber Cheeks */}
            {[-0.15, 0, 0.15].map((by, idx) =>
              [-0.24, 0.24].map((bz, j) => (
                <mesh key={`${idx}_${j}`} position={[-0.36, by, bz]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.02, 6]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
                </mesh>
              ))
            )}
          </group>

          {/* Flared Sheet Steel Hopper with Yellow Hazard Stripe */}
          <group position={[0, shaftCenterY + 0.36, 0]}>
            {/* Front & Rear Inclined Flared Walls */}
            <mesh position={[0, 0, 0.32]} rotation={[0.35, 0, 0]}>
              <boxGeometry args={[0.72, 0.34, 0.018]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, -0.32]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.72, 0.34, 0.018]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Left & Right Inclined Walls */}
            <mesh position={[-0.36, 0, 0]} rotation={[0, 0, -0.28]}>
              <boxGeometry args={[0.018, 0.34, 0.58]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0.36, 0, 0]} rotation={[0, 0, 0.28]}>
              <boxGeometry args={[0.018, 0.34, 0.58]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>

            {/* Top Rolled Lip Bevel Frame */}
            <RoundedBox args={[0.82, 0.035, 0.72]} radius={0.015} smoothness={4} position={[0, 0.16, 0]}>
              <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
            </RoundedBox>

            {/* Black Hazard Stripes on Hopper Face */}
            {[-0.2, -0.07, 0.07, 0.2].map((sx, idx) => (
              <mesh key={idx} position={[sx, 0.16, 0.37]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.04, 0.038, 0.005]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 3: ELECTRIC MOTOR & ROLLER CHAIN DRIVE (Order 3, frame 60)
          ========================================================================= */}
      {motorLanded && (
        <group position={[motorDropX, 0, 0]}>
          {/* Finned Electric Induction Motor (Mounted at Rear-Left) */}
          <group position={[-0.48, shaftCenterY + 0.12, -0.38]}>
            {/* Motor Cylindrical Finned Body */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.32, 24]} />
              <meshStandardMaterial color="#1E3A8A" roughness={0.6} metalness={0.5} />
            </mesh>
            {/* 6 Cooling Fins Array */}
            {Array.from({ length: 6 }).map((_, i) => {
              const finZ = (i - 2.5) * 0.045;
              return (
                <mesh key={i} position={[0, 0, finZ]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.145, 0.145, 0.008, 24]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.5} metalness={0.7} />
                </mesh>
              );
            })}
            {/* Chrome Rear Fan Shroud Cover */}
            <RoundedBox args={[0.24, 0.24, 0.06]} radius={0.02} smoothness={4} position={[0, 0, -0.18]}>
              <meshStandardMaterial color="#E2E8F0" roughness={0.12} metalness={0.95} />
            </RoundedBox>

            {/* Electrical Junction Box with Brass Cable Gland */}
            <RoundedBox args={[0.08, 0.08, 0.08]} radius={0.015} smoothness={4} position={[0.12, 0.08, 0]}>
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
            </RoundedBox>
            <mesh position={[0.17, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.03, 12]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Motor Output Sprocket (Spinning at motorAngle) */}
            <group position={[0, 0, 0.18]} rotation={[0, 0, isBroken ? 0 : -motorAngle]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.048, 0.048, 0.025, 18]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
              </mesh>
            </group>
          </group>

          {/* Roller Chain Drive connecting Motor to Left Shaft Sprocket */}
          <group position={[leftShaftX, shaftCenterY, -0.38]}>
            {/* Left Shaft Driven Sprocket */}
            <group rotation={[0, 0, -shaftAngle]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.025, 24]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
              </mesh>
              {/* Perimeter Sprocket Teeth */}
              {Array.from({ length: 18 }).map((_, i) => {
                const a = (i * 2 * Math.PI) / 18;
                return (
                  <mesh key={i} position={[Math.cos(a) * 0.114, Math.sin(a) * 0.114, 0]} rotation={[0, 0, a]}>
                    <boxGeometry args={[0.018, 0.012, 0.025]} />
                    <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
                  </mesh>
                );
              })}
            </group>

            {/* Roller Chain Strands (Intact or Broken Whipping) */}
            {!isBroken ? (
              <group position={[0, chainVibe, 0]}>
                {/* Upper Chain Strand */}
                <mesh position={[-0.16, 0.09, 0]} rotation={[0, 0, 0.28]}>
                  <boxGeometry args={[0.36, 0.02, 0.02]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.8} />
                </mesh>
                {/* Lower Chain Strand */}
                <mesh position={[-0.16, -0.09, 0]} rotation={[0, 0, -0.28]}>
                  <boxGeometry args={[0.36, 0.02, 0.02]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.8} />
                </mesh>
              </group>
            ) : (
              /* Broken Chain Whipping Outward */
              <group position={[-chainSnapX, chainSnapY, 0]} rotation={[0, 0, chainSnapX * 1.8]}>
                <mesh position={[-0.12, 0, 0]}>
                  <boxGeometry args={[0.28, 0.024, 0.024]} />
                  <meshStandardMaterial color="#EF4444" roughness={0.5} metalness={0.8} />
                </mesh>
              </group>
            )}

            {/* Brass Chain Idler / Tensioner Bracket */}
            <mesh position={[-0.18, -0.14, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>

          {/* Front Intermeshing Transfer Gears connecting Left and Right Shafts */}
          <group position={[0, shaftCenterY, 0.38]}>
            {/* Left Transfer Gear (Clockwise: -shaftAngle) */}
            <mesh position={[leftShaftX, 0, 0]} rotation={[Math.PI / 2, 0, -shaftAngle]}>
              <cylinderGeometry args={[0.145, 0.145, 0.035, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.96} />
            </mesh>
            {/* Right Transfer Gear (Counter-Clockwise: +shaftAngle) */}
            <mesh position={[rightShaftX, 0, 0]} rotation={[Math.PI / 2, 0, shaftAngle + Math.PI / 16]}>
              <cylinderGeometry args={[0.145, 0.145, 0.035, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.96} />
            </mesh>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 4: HARDENED 4-HOOK CLAW CUTTER DISCS ARRAY (Order 4, frame 75)
          ========================================================================= */}
      {discsLanded && (
        <group>
          {/* Left Shaft Claw Discs Array (Clockwise: -shaftAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0]} rotation={[0, 0, -shaftAngle]}>
            {Array.from({ length: discCount }).map((_, i) => {
              const z = (i - (discCount - 1) / 2) * discSpacing;
              // Stagger claw tooth angular offset between adjacent discs for sequential biting
              const discOffsetAngle = (i * Math.PI) / 4;
              return (
                <group key={`l_disc_${i}`} position={[0, 0, z]} rotation={[0, 0, discOffsetAngle]}>
                  {/* Central Tool-Steel Disc Core */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.095, 0.095, 0.024, 28]} />
                    <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
                  </mesh>

                  {/* 4 Curved Claw Hooks (Hooking Inward/Down into throat) */}
                  {[0, 1, 2, 3].map((t) => {
                    const ang = (t * Math.PI) / 2;
                    return (
                      <group key={t} rotation={[0, 0, ang]}>
                        {/* Claw Tooth Base Wedge */}
                        <mesh position={[0.115, 0.02, 0]}>
                          <boxGeometry args={[0.065, 0.032, 0.024]} />
                          <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.96} />
                        </mesh>
                        {/* Sharp Hook Tip (angled forward in direction of clockwise rotation) */}
                        <mesh position={[0.145, 0.045, 0]} rotation={[0, 0, -0.45]}>
                          <coneGeometry args={[0.018, 0.045, 4]} />
                          <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>

          {/* Right Shaft Claw Discs Array (Counter-Clockwise: +shaftAngle) */}
          {/* Staggered along Z by discSpacing / 2 */}
          <group position={[rightShaftX, shaftCenterY, 0]} rotation={[0, 0, shaftAngle]}>
            {Array.from({ length: discCount }).map((_, i) => {
              const z = (i - (discCount - 1) / 2) * discSpacing + discSpacing * 0.5;
              if (z > 0.26 || z < -0.26) return null;
              const discOffsetAngle = (i * Math.PI) / 4 + Math.PI / 8;
              return (
                <group key={`r_disc_${i}`} position={[0, 0, z]} rotation={[0, 0, discOffsetAngle]}>
                  {/* Central Tool-Steel Disc Core */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.095, 0.095, 0.024, 28]} />
                    <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
                  </mesh>

                  {/* 4 Curved Claw Hooks (Hooking Inward/Down into throat) */}
                  {[0, 1, 2, 3].map((t) => {
                    const ang = (t * Math.PI) / 2;
                    // Fractured sheared tooth on right middle disc in Act 4
                    const isFractured = isBroken && i === 3 && t === 0;
                    return (
                      <group
                        key={t}
                        rotation={[0, 0, ang + (isFractured ? shearedToothRot : 0)]}
                        position={[isFractured ? shearedToothOffset : 0, isFractured ? -shearedToothOffset : 0, 0]}
                      >
                        {/* Claw Tooth Base Wedge */}
                        <mesh position={[0.115, -0.02, 0]}>
                          <boxGeometry args={[0.065, 0.032, 0.024]} />
                          <meshStandardMaterial
                            color={isFractured ? "#EF4444" : "#E2E8F0"}
                            roughness={0.1}
                            metalness={0.96}
                          />
                        </mesh>
                        {/* Sharp Hook Tip (angled forward in direction of CCW rotation) */}
                        <mesh position={[0.145, -0.045, 0]} rotation={[0, 0, 0.45]}>
                          <coneGeometry args={[0.018, 0.045, 4]} />
                          <meshStandardMaterial
                            color={isFractured ? "#EF4444" : "#E2E8F0"}
                            roughness={0.08}
                            metalness={0.98}
                          />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>
        </group>
      )}

      {/* Assembly & Fracture Spark FX */}
      <SparkBurst
        active={standSnapSpark}
        frameOffset={local - 6}
        position={[0, 0.12, 0]}
        color="#F59E0B"
        scale={0.85}
      />
      <SparkBurst
        active={shaftSnapSpark}
        frameOffset={local - 20}
        position={[0, shaftCenterY, 0]}
        color="#38BDF8"
        scale={0.9}
      />
      <SparkBurst
        active={chamberSnapSpark}
        frameOffset={local - 40}
        position={[0, shaftCenterY + 0.35, 0]}
        color="#F59E0B"
        scale={0.9}
      />
      <SparkBurst
        active={motorSnapSpark}
        frameOffset={local - 60}
        position={[-0.48, shaftCenterY + 0.12, -0.38]}
        color="#D97706"
        scale={0.85}
      />
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[rightShaftX, shaftCenterY, 0]}
        color="#EF4444"
        scale={1.3}
      />
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[-0.48, shaftCenterY + 0.12, -0.38]}
        color="#38BDF8"
        scale={1.0}
      />
    </group>
  );
};
