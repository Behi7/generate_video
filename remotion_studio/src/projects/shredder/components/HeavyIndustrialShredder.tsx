import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export interface HeavyIndustrialShredderProps {
  localFrame?: number;
}

export const HeavyIndustrialShredder: React.FC<HeavyIndustrialShredderProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  if (overrideLocal === undefined && tier !== 3) return null;

  // --- ACT 1: INSIDE-OUT MODULAR ASSEMBLY (0..69f) ---
  // Order 0 (0f): Massive Cast-Iron I-Beam Foundation Bed & Upright H-Frame Columns
  const bedLandP = interpolate(local, [0, 8], [0, 1], {
    easing: Easing.out(Easing.back(1.4)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bedSnapSpark = local >= 6 && local <= 10;

  // Order 1 (20f): Internal Twin Hexagonal Shafts AND 5-Hook Claw Blades Rotor Core (assembled together)
  const rotorDropY = interpolate(local, [15, 22], [3.8, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotorLanded = local >= 20;
  const rotorSnapSpark = local >= 20 && local <= 24;

  // Order 2 (40f): Ribbed Cutting Chamber, Beveled Hopper & Discharge Funnel drop around the rotor core
  const chamberDropY = interpolate(local, [35, 42], [3.8, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chamberLanded = local >= 40;
  const chamberSnapSpark = local >= 40 && local <= 44;

  // Order 3 (60f): Dual Planetary Gearboxes & Hydraulic Valve Manifold dock from rear
  const transDropX = interpolate(local, [55, 60], [3.4, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const transLanded = local >= 60;
  const transSnapSpark = local >= 60 && local <= 64;

  // --- ACT 2 & 3: HYDRAULIC DRIVE KINEMATICS (70..249f) ---
  let shaftAngle = 0;
  let pressureBar = 0;
  let hydraulicVibe = 0;

  if (local >= 75 && local < 110) {
    // Act 2: Hydraulic pump startup & pressure build (0 -> 350 Bar)
    pressureBar = interpolate(local, [75, 110], [0, 350], {
      easing: Easing.out(Easing.quad),
    });
    shaftAngle = interpolate(local, [85, 110], [0, Math.PI * 1.5], {
      easing: Easing.in(Easing.quad),
      extrapolateLeft: "clamp",
    });
    hydraulicVibe = Math.sin(local * 3.0) * 0.008;
  } else if (local >= 110 && local < 150) {
    // Spooling to full industrial crushing speed (35 RPM)
    const baseRot = Math.PI * 1.5;
    const addRot = interpolate(local, [110, 150], [0, Math.PI * 5.0], {
      easing: Easing.linear,
    });
    shaftAngle = baseRot + addRot;
    pressureBar = 350 + Math.sin(local * 2.5) * 15;
    hydraulicVibe = Math.sin(local * 3.5) * 0.006;
  } else if (local >= 150 && local < 255) {
    // Act 3: Steady 35 RPM continuous heavy industrial crushing
    const baseRot = Math.PI * 6.5;
    const opRot = (local - 150) * 0.22;
    shaftAngle = baseRot + opRot;
    pressureBar = 420 + Math.sin(local * 4.0) * 25; // High crushing load
    hydraulicVibe = Math.sin(local * 4.0) * 0.005;
  } else if (local >= 255) {
    // Overload surge
    shaftAngle = Math.PI * 6.5 + (255 - 150) * 0.22;
    pressureBar = 650; // In red zone!
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 276], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Fracture Kinematics
  const rupturedHoseAngle = isBroken ? breakP * 1.25 : 0;
  const shearedClawOffset = isBroken ? breakP * 0.32 : 0;
  const shearedClawRot = isBroken ? breakP * 1.8 : 0;
  const gearboxCrackGap = isBroken ? breakP * 0.025 : 0;
  const machineShudder = isBroken && local < 282 ? Math.sin((local - 265) * 7) * 0.018 * (1 - breakP) : 0;

  // Geometry Dimensions
  const leftShaftX = -0.22;
  const rightShaftX = 0.22;
  const shaftCenterY = 1.65;

  const bladeCount = 7;
  const bladeSpacing = 0.082;

  // Gauge needle rotation (0 to 650 bar -> -135deg to +135deg)
  const needleAngle = (-135 + (pressureBar / 650) * 270) * (Math.PI / 180);

  return (
    <group position={[machineShudder, 0, 0]}>
      {/* =========================================================================
          MODULE 0: MASSIVE CAST-IRON FOUNDATION BED & H-FRAME COLUMNS (Order 0, frame 0)
          ========================================================================= */}
      <group position={[0, (1 - bedLandP) * 1.8, 0]}>
        {/* Massive Machined Foundation Bed Plate */}
        <RoundedBox args={[1.7, 0.24, 1.4]} radius={0.035} smoothness={4} position={[0, 0.12, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.72} metalness={0.4} />
        </RoundedBox>

        {/* 4 Heavy Steel Anchor Pedestals with Quad M30 Foundation Bolts */}
        {[
          [-0.72, -0.55],
          [0.72, -0.55],
          [-0.72, 0.55],
          [0.72, 0.55],
        ].map(([ax, az], i) => (
          <group key={i} position={[ax, 0.24, az]}>
            <RoundedBox args={[0.22, 0.08, 0.22]} radius={0.015} smoothness={4} position={[0, 0.04, 0]}>
              <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
            </RoundedBox>
            {/* 4 Foundation Hex Studs */}
            {[
              [-0.06, -0.06],
              [0.06, -0.06],
              [-0.06, 0.06],
              [0.06, 0.06],
            ].map(([bx, bz], j) => (
              <mesh key={j} position={[bx, 0.1, bz]}>
                <cylinderGeometry args={[0.018, 0.018, 0.06, 6]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Heavy Upright H-Frame Bed Columns (Top at y = 1.395) */}
        <RoundedBox args={[0.26, 1.15, 0.36]} radius={0.025} smoothness={4} position={[-0.58, 0.82, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.26, 1.15, 0.36]} radius={0.025} smoothness={4} position={[0.58, 0.82, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* Front Cast Machine Inspection Hatch */}
        <RoundedBox args={[0.62, 0.35, 0.06]} radius={0.02} smoothness={4} position={[0, 0.72, 0.48]}>
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
        </RoundedBox>
        {/* Brass Warning Rating Plaque */}
        <mesh position={[0, 0.72, 0.515]}>
          <planeGeometry args={[0.34, 0.14]} />
          <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Lower Heavy Scrap Collection Bin Resting on Bed (y = 0.24..0.66) */}
        <group position={[0, 0.45, 0]}>
          <RoundedBox args={[0.76, 0.42, 0.68]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
          </RoundedBox>
          {/* Bin Forklift Pockets */}
          {[-0.2, 0.2].map((fx, i) => (
            <mesh key={i} position={[fx, -0.16, 0]}>
              <boxGeometry args={[0.14, 0.07, 0.72]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* =========================================================================
          MODULE 1: TWIN HEXAGONAL SHAFTS + 5-HOOK CLAW BLADES ROTOR CORE (Order 1, frame 20)
          Mounted BEFORE outer cutting chamber encloses it (Inside-Out Law)
          ========================================================================= */}
      {rotorLanded && (
        <group position={[0, rotorDropY, 0]}>
          {/* 4 Heavy Split Spherical Roller Bearing Blocks */}
          {[
            [leftShaftX, 0.42],
            [leftShaftX, -0.42],
            [rightShaftX, 0.42],
            [rightShaftX, -0.42],
          ].map(([bx, bz], i) => (
            <group key={i} position={[bx, shaftCenterY, bz]}>
              <RoundedBox args={[0.24, 0.22, 0.08]} radius={0.025} smoothness={4}>
                <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
              </RoundedBox>
              {/* Spherical Bearing Chrome End Cap */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.088, 0.088, 0.09, 24]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
              </mesh>
              {/* Brass High-Pressure Grease Tube */}
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            </group>
          ))}

          {/* Left Shaft Rotor Assembly: Hex Shaft + 5-Hook Claw Blades (Clockwise: -shaftAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0]} rotation={[0, 0, -shaftAngle]}>
            {/* Solid Forged 170mm Hexagonal Shaft Profile */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.98, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.07} metalness={0.98} />
            </mesh>

            {/* Left 5-Hook Claw Blades Array */}
            {Array.from({ length: bladeCount }).map((_, i) => {
              const z = (i - (bladeCount - 1) / 2) * bladeSpacing;
              const bladeOffsetAng = (i * Math.PI) / 5;
              return (
                <group key={`l_blade_${i}`} position={[0, 0, z]} rotation={[0, 0, bladeOffsetAng]}>
                  {/* Hexagonal Hub Core fitting tightly on Hex Shaft */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.108, 0.108, 0.038, 6]} />
                    <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
                  </mesh>

                  {/* 5 Massive Curved Claw Hooks (Curling inward clockwise toward center) */}
                  {[0, 1, 2, 3, 4].map((h) => {
                    const ang = (h * 2 * Math.PI) / 5;
                    return (
                      <group key={h} rotation={[0, 0, ang]}>
                        <mesh position={[0.13, 0.025, 0]}>
                          <boxGeometry args={[0.085, 0.048, 0.038]} />
                          <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
                        </mesh>
                        <mesh position={[0.172, 0.062, 0]} rotation={[0, 0, -0.55]}>
                          <coneGeometry args={[0.026, 0.065, 4]} />
                          <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>

          {/* Right Shaft Rotor Assembly: Hex Shaft + 5-Hook Claw Blades (Counter-Clockwise: +shaftAngle) */}
          {/* Interleaved with Left Blades by bladeSpacing / 2 along Z */}
          <group position={[rightShaftX, shaftCenterY, 0]} rotation={[0, 0, shaftAngle]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.98, 6]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.07} metalness={0.98} />
            </mesh>

            {/* Right 5-Hook Claw Blades Array */}
            {Array.from({ length: bladeCount }).map((_, i) => {
              const z = (i - (bladeCount - 1) / 2) * bladeSpacing + bladeSpacing * 0.5;
              if (z > 0.32 || z < -0.32) return null;
              const bladeOffsetAng = (i * Math.PI) / 5 + Math.PI / 10;
              return (
                <group key={`r_blade_${i}`} position={[0, 0, z]} rotation={[0, 0, bladeOffsetAng]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.108, 0.108, 0.038, 6]} />
                    <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
                  </mesh>

                  {[0, 1, 2, 3, 4].map((h) => {
                    const ang = (h * 2 * Math.PI) / 5;
                    const isToothFractured = isBroken && i === 3 && h === 0;
                    return (
                      <group
                        key={h}
                        rotation={[0, 0, ang + (isToothFractured ? shearedClawRot : 0)]}
                        position={[
                          isToothFractured ? shearedClawOffset : 0,
                          isToothFractured ? -shearedClawOffset : 0,
                          0,
                        ]}
                      >
                        <mesh position={[0.13, -0.025, 0]}>
                          <boxGeometry args={[0.085, 0.048, 0.038]} />
                          <meshStandardMaterial
                            color={isToothFractured ? "#EF4444" : "#CBD5E1"}
                            roughness={0.15}
                            metalness={0.92}
                          />
                        </mesh>
                        <mesh position={[0.172, -0.062, 0]} rotation={[0, 0, 0.55]}>
                          <coneGeometry args={[0.026, 0.065, 4]} />
                          <meshStandardMaterial
                            color={isToothFractured ? "#EF4444" : "#E2E8F0"}
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

      {/* =========================================================================
          MODULE 2: CUTTING CHAMBER, BEVELED HOPPER & DISCHARGE CHUTE (Order 2, frame 40)
          Encloses the rotor core from outside
          ========================================================================= */}
      {chamberLanded && (
        <group position={[0, chamberDropY, 0]}>
          {/* Lateral Anchor Support Brackets bridging Chamber to H-Frame Columns */}
          {/* Bridging X = -0.44 to -0.58 and X = 0.44 to 0.58 at y = 1.38 atop columns */}
          {[-0.51, 0.51].map((bx, i) => (
            <group key={i} position={[bx, 1.38, 0]}>
              <RoundedBox args={[0.16, 0.08, 0.6]} radius={0.015} smoothness={4}>
                <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
              </RoundedBox>
              {/* Chrome Heavy Anchor Bolts connecting bracket to column */}
              {[-0.22, 0.22].map((bz, j) => (
                <mesh key={j} position={[0, 0.045, bz]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
                  <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.95} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Main Heavy Ribbed Cutting Chamber Enclosure */}
          <group position={[0, shaftCenterY, 0]}>
            {/* Left Chamber Wall with Exterior Stiffener Ribs */}
            <group position={[-0.44, 0, 0]}>
              <RoundedBox args={[0.05, 0.58, 0.88]} radius={0.02} smoothness={4}>
                <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
              </RoundedBox>
              {/* 4 External Vertical Stiffener Ribs */}
              {[-0.32, -0.11, 0.11, 0.32].map((rz, i) => (
                <mesh key={i} position={[-0.035, 0, rz]}>
                  <boxGeometry args={[0.035, 0.54, 0.035]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.5} />
                </mesh>
              ))}
            </group>

            {/* Right Chamber Wall with Exterior Stiffener Ribs */}
            <group position={[0.44, 0, 0]}>
              <RoundedBox args={[0.05, 0.58, 0.88]} radius={0.02} smoothness={4}>
                <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
              </RoundedBox>
              {[-0.32, -0.11, 0.11, 0.32].map((rz, i) => (
                <mesh key={i} position={[0.035, 0, rz]}>
                  <boxGeometry args={[0.035, 0.54, 0.035]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.5} />
                </mesh>
              ))}
            </group>

            {/* Front & Rear Heavy Bolted End Cheek Plates */}
            <RoundedBox args={[0.88, 0.58, 0.05]} radius={0.02} smoothness={4} position={[0, 0, 0.44]}>
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
            </RoundedBox>
            <RoundedBox args={[0.88, 0.58, 0.05]} radius={0.02} smoothness={4} position={[0, 0, -0.44]}>
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
            </RoundedBox>

            {/* Underneath Cleaning Comb Anvil Fingers */}
            <group position={[0, -0.22, 0]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const cz = (i - 3.5) * bladeSpacing;
                return (
                  <mesh key={i} position={[0, 0, cz]}>
                    <boxGeometry args={[0.38, 0.045, 0.025]} />
                    <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.6} />
                  </mesh>
                );
              })}
            </group>
          </group>

          {/* Inverted Tapered Discharge Funnel below Cutting Chamber (y = 1.05 to 1.35) */}
          <group position={[0, 1.20, 0]}>
            {/* Front Inverted Plate */}
            <RoundedBox args={[0.82, 0.3, 0.02]} radius={0.006} smoothness={4} position={[0, 0, 0.28]} rotation={[-0.32, 0, 0]}>
              <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
            </RoundedBox>
            {/* Rear Inverted Plate */}
            <RoundedBox args={[0.82, 0.3, 0.02]} radius={0.006} smoothness={4} position={[0, 0, -0.28]} rotation={[0.32, 0, 0]}>
              <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
            </RoundedBox>
            {/* Left Inverted Plate */}
            <RoundedBox args={[0.02, 0.3, 0.54]} radius={0.006} smoothness={4} position={[-0.38, 0, 0]} rotation={[0, 0, 0.25]}>
              <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
            </RoundedBox>
            {/* Right Inverted Plate */}
            <RoundedBox args={[0.02, 0.3, 0.54]} radius={0.006} smoothness={4} position={[0.38, 0, 0]} rotation={[0, 0, -0.25]}>
              <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.6} />
            </RoundedBox>
            {/* Bottom Flange Collar */}
            <RoundedBox args={[0.66, 0.03, 0.52]} radius={0.008} smoothness={4} position={[0, -0.14, 0]}>
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.5} />
            </RoundedBox>
          </group>

          {/* Enormous Flared Industrial Hopper with Open Throat Aperture (0.90m × 0.78m) */}
          <group position={[0, shaftCenterY + 0.5, 0]}>
            {/* Beveled Front Flared Slope with Metallic IBL Edge Highlights */}
            <RoundedBox args={[0.96, 0.48, 0.025]} radius={0.008} smoothness={4} position={[0, 0, 0.42]} rotation={[0.4, 0, 0]}>
              <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
            </RoundedBox>
            {/* Beveled Rear Flared Slope */}
            <RoundedBox args={[0.96, 0.48, 0.025]} radius={0.008} smoothness={4} position={[0, 0, -0.42]} rotation={[-0.4, 0, 0]}>
              <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
            </RoundedBox>
            {/* Beveled Left Flared Slope */}
            <RoundedBox args={[0.025, 0.48, 0.84]} radius={0.008} smoothness={4} position={[-0.48, 0, 0]} rotation={[0, 0, -0.32]}>
              <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
            </RoundedBox>
            {/* Beveled Right Flared Slope */}
            <RoundedBox args={[0.025, 0.48, 0.84]} radius={0.008} smoothness={4} position={[0.48, 0, 0]} rotation={[0, 0, 0.32]}>
              <meshStandardMaterial color="#1E3A8A" roughness={0.55} metalness={0.45} />
            </RoundedBox>

            {/* OPEN PERIMETER TOP RIM FRAME (Safety Golden Yellow) */}
            {/* Leaves a completely open 0.90m × 0.78m throat aperture directly exposing shafts & claw blades */}
            <group position={[0, 0.22, 0]}>
              {/* Front Border Bar */}
              <RoundedBox args={[1.14, 0.045, 0.12]} radius={0.012} smoothness={4} position={[0, 0, 0.45]}>
                <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.75} />
              </RoundedBox>
              {/* Rear Border Bar */}
              <RoundedBox args={[1.14, 0.045, 0.12]} radius={0.012} smoothness={4} position={[0, 0, -0.45]}>
                <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.75} />
              </RoundedBox>
              {/* Left Border Bar */}
              <RoundedBox args={[0.12, 0.045, 0.82]} radius={0.012} smoothness={4} position={[-0.51, 0, 0]}>
                <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.75} />
              </RoundedBox>
              {/* Right Border Bar */}
              <RoundedBox args={[0.12, 0.045, 0.82]} radius={0.012} smoothness={4} position={[0.51, 0, 0]}>
                <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.75} />
              </RoundedBox>

              {/* Industrial Safety Warning Stencil Band on Front Rim Face */}
              <mesh position={[0, 0, 0.512]}>
                <planeGeometry args={[0.68, 0.035]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 3: DUAL PLANETARY GEARBOXES & HYDRAULIC MANIFOLD (Order 3, frame 60)
          ========================================================================= */}
      {transLanded && (
        <group position={[transDropX, 0, 0]}>
          {/* Dual Coaxial Planetary Reduction Gearboxes (Mounted on rear ends of shafts) */}
          {/* Left Planetary Gearbox */}
          <group position={[leftShaftX, shaftCenterY, -0.56]}>
            <RoundedBox args={[0.34, 0.34, 0.18]} radius={0.03} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.5} />
            </RoundedBox>
            {/* Mirror Chrome Flange Ring */}
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.165, 0.165, 0.02, 28]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            {/* Radial Piston Hydraulic Motor Housing */}
            <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.16, 24]} />
              <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.5} />
            </mesh>
          </group>

          {/* Right Planetary Gearbox (With stress crack in Act 4) */}
          <group position={[rightShaftX, shaftCenterY, -0.56]}>
            <RoundedBox
              args={[0.34, 0.34, 0.18]}
              radius={0.03}
              smoothness={4}
              position={[0, 0, isBroken ? gearboxCrackGap : 0]}
            >
              <meshStandardMaterial
                color={isBroken ? "#EF4444" : "#1E293B"}
                roughness={0.65}
                metalness={0.5}
              />
            </RoundedBox>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.165, 0.165, 0.02, 28]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>
            <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.16, 24]} />
              <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.5} />
            </mesh>
          </group>

          {/* Central Hydraulic High-Pressure Manifold Block */}
          <group position={[0, shaftCenterY + 0.18, -0.62]}>
            <RoundedBox args={[0.32, 0.22, 0.16]} radius={0.02} smoothness={4}>
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
            </RoundedBox>

            {/* Brass Pressure Relief Cartridges */}
            {[-0.09, 0.09].map((px, i) => (
              <mesh key={i} position={[px, 0.12, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            ))}

            {/* Analog Glycerine Pressure Dial Gauge */}
            <group position={[0, 0.04, 0.09]} rotation={[0, 0, 0]}>
              {/* Chrome Gauge Bezel */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.02, 24]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
              </mesh>
              {/* Dial Face Plate */}
              <mesh position={[0, 0, 0.012]}>
                <circleGeometry args={[0.058, 24]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              {/* Red Danger Zone Arc (500-650 bar) */}
              <mesh position={[0.02, 0.02, 0.013]}>
                <planeGeometry args={[0.035, 0.015]} />
                <meshBasicMaterial color="#EF4444" />
              </mesh>
              {/* Moving Pressure Indicator Needle */}
              <group position={[0, 0, 0.015]} rotation={[0, 0, -needleAngle]}>
                <mesh position={[0, 0.025, 0]}>
                  <boxGeometry args={[0.005, 0.048, 0.002]} />
                  <meshBasicMaterial color="#0F172A" />
                </mesh>
              </group>
            </group>

            {/* Steel-Braided Flexible Hydraulic Hoses */}
            {/* Left Hose (Intact) */}
            <mesh position={[-0.14, -0.1, 0.04]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.018, 0.018, 0.24, 16]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.3} />
            </mesh>

            {/* Right Hose (Intact or Ruptured Whipping in Act 4) */}
            {!isBroken ? (
              <mesh position={[0.14, -0.1, 0.04]} rotation={[0, 0, 0.6]}>
                <cylinderGeometry args={[0.018, 0.018, 0.24, 16]} />
                <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.3} />
              </mesh>
            ) : (
              <group position={[0.16, -0.06, 0.04]} rotation={[0, 0, 0.6 + rupturedHoseAngle]}>
                <mesh position={[0.08, -0.08, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.22, 16]} />
                  <meshStandardMaterial color="#EF4444" roughness={0.6} metalness={0.4} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      )}

      {/* Assembly, Crushing & Fracture Spark Bursts */}
      <SparkBurst
        active={bedSnapSpark}
        frameOffset={local - 6}
        position={[0, 0.18, 0]}
        color="#F59E0B"
        scale={1.0}
      />
      <SparkBurst
        active={rotorSnapSpark}
        frameOffset={local - 20}
        position={[0, shaftCenterY, 0]}
        color="#38BDF8"
        scale={1.1}
      />
      <SparkBurst
        active={chamberSnapSpark}
        frameOffset={local - 40}
        position={[0, shaftCenterY + 0.5, 0]}
        color="#F59E0B"
        scale={1.2}
      />
      <SparkBurst
        active={transSnapSpark}
        frameOffset={local - 60}
        position={[0, shaftCenterY + 0.18, -0.6]}
        color="#D97706"
        scale={1.0}
      />
      {/* Catastrophic 500-Bar Hydraulic Hose Blowout & Tooth Fracture Sparks */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0.16, shaftCenterY + 0.1, -0.6]}
        color="#EF4444"
        scale={1.5}
        count={16}
      />
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[rightShaftX, shaftCenterY, 0]}
        color="#F59E0B"
        scale={1.4}
        count={16}
      />
    </group>
  );
};
