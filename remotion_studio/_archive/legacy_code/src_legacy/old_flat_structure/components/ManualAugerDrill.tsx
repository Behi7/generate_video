import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export const ManualAugerDrill: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 1) return null;

  // --- ACT 1: MAGNETIC SNAP-LOCK KINEMATICS (0..70f) ---
  // Helical spiral descends and snaps at frame 25
  const spiralDropY = interpolate(local, [20, 25], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spiralHasLanded = local >= 25;
  const spiralSnapActive = local >= 25 && local <= 29;
  const spiralSnapOffset = local - 25;

  // T-handle descends from top and snaps at frame 50
  const handleDropY = interpolate(local, [45, 50], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handleHasLanded = local >= 50;
  const handleSnapActive = local >= 50 && local <= 54;
  const handleSnapOffset = local - 50;

  // --- ACT 2 & 3: ROTATION & FEED KINEMATICS (71..250f) ---
  let rotationAngle = 0;
  let penetrationDepth = 0;

  if (local >= 75 && local < 100) {
    // Creaky slow rotation start
    rotationAngle = interpolate(local, [75, 100], [0, Math.PI * 1.5], {
      easing: Easing.in(Easing.quad),
    });
  } else if (local >= 100 && local < 150) {
    // Tip touching rock (100f) and initial boring
    const rotBase = Math.PI * 1.5;
    const rotNext = interpolate(local, [100, 150], [0, Math.PI * 5.0], {
      easing: Easing.linear,
    });
    rotationAngle = rotBase + rotNext;
    penetrationDepth = interpolate(local, [100, 150], [0, 0.08], {
      easing: Easing.linear,
    });
  } else if (local >= 150 && local < 255) {
    // Act 3: Steady helical boring loop
    const rotBase = Math.PI * 6.5;
    const rotOperating = (local - 150) * 0.42;
    rotationAngle = rotBase + rotOperating;
    penetrationDepth = interpolate(local, [150, 250], [0.08, 0.25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 255) {
    // Act 4: Jammed at frame 255
    const jammedRot = Math.PI * 6.5 + (255 - 150) * 0.42;
    const shudder =
      local < 265
        ? Math.sin((local - 255) * 6.0) * 0.06 * Math.exp(-(local - 255) * 0.15)
        : 0;
    rotationAngle = jammedRot + shudder;
    penetrationDepth = 0.25;
  }

  // Drill vertical feed offset (moves down into rock)
  const feedY = -penetrationDepth;

  // --- ACT 4: OVERLOAD PHYSICAL DESTRUCTION (251..289f) ---
  const isBroken = local >= 265;
  const breakProgress = interpolate(local, [265, 280], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const breakSparkActive = local >= 265 && local <= 269;
  const breakSparkOffset = local - 265;

  // Destruction displacements
  // 1. Lower shaft stays jammed in rock, tilts slightly
  const lowerTiltZ = isBroken ? breakProgress * 0.08 : 0;
  const lowerTiltX = isBroken ? -breakProgress * 0.05 : 0;

  // 2. Upper shaft snaps, twists, and drops onto the vise/bed
  const upperSnapX = isBroken ? breakProgress * 0.45 : 0;
  const upperSnapY = isBroken ? -breakProgress * 0.65 : 0;
  const upperRotZ = isBroken ? -breakProgress * 1.45 : 0;

  // 3. T-Handle flings off violently in parabolic arc and lands flat
  const handleFlyX = isBroken ? breakProgress * 1.55 : 0;
  const handleFlyY = isBroken
    ? breakProgress * 1.4 - breakProgress * breakProgress * 2.6
    : 0;
  const handleFlyRotZ = isBroken ? breakProgress * 4.6 : 0;
  const handleFlyRotX = isBroken ? breakProgress * 3.1 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* Docking Spark Bursts */}
      <SparkBurst
        active={spiralSnapActive}
        frameOffset={spiralSnapOffset}
        position={[0, 0.85, 0]}
        color="#FDE047"
        scale={1.1}
        count={12}
      />
      <SparkBurst
        active={handleSnapActive}
        frameOffset={handleSnapOffset}
        position={[0, 1.65, 0]}
        color="#FBBF24"
        scale={1.2}
        count={14}
      />

      {/* Shaft Break Spark Burst at Frame 265 */}
      <SparkBurst
        active={breakSparkActive}
        frameOffset={breakSparkOffset}
        position={[0, 1.15 + feedY, 0]}
        color="#F59E0B"
        scale={1.4}
        count={16}
        spread={1.2}
      />

      {/* ------------------------------------------------------------- */}
      {/* LOWER HELICAL AUGER (Boring Spiral & Carbide Pilot Tip)       */}
      {/* ------------------------------------------------------------- */}
      {spiralHasLanded && (
        <group
          position={[0, spiralDropY + feedY, 0]}
          rotation={[lowerTiltX, isBroken ? rotationAngle : rotationAngle, lowerTiltZ]}
        >
          {/* Central Lower Shaft Core - Heavy forged steel */}
          <mesh position={[0, 0.98, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.42, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.18} metalness={0.95} />
          </mesh>

          {/* Pointed Fishtail Carbide Pilot Tip at Bottom (y=0.765 is rock surface) */}
          <mesh position={[0, 0.76, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.065, 0.09, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.98} />
          </mesh>

          {/* Continuous Helical Flighting / Spiral Flutes (Heavy forged tool steel) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
            const finY = 0.8 + idx * 0.042;
            const finAngle = idx * (Math.PI / 2.5);
            return (
              <group key={idx} position={[0, finY, 0]} rotation={[0.18, finAngle, 0.12]}>
                <mesh position={[0.085, 0, 0]} rotation={[0, 0, 0.22]}>
                  <boxGeometry args={[0.14, 0.02, 0.07]} />
                  <meshStandardMaterial
                    color="#CBD5E1"
                    roughness={0.2}
                    metalness={0.94}
                  />
                </mesh>
                <mesh position={[-0.085, 0, 0]} rotation={[0, 0, -0.22]}>
                  <boxGeometry args={[0.14, 0.02, 0.07]} />
                  <meshStandardMaterial
                    color="#CBD5E1"
                    roughness={0.2}
                    metalness={0.94}
                  />
                </mesh>
              </group>
            );
          })}

          {/* Sandstone Debris Streaming Up Helical Flutes (Act 3: frames 150..250) */}
          {local >= 150 && local < 255 && (
            <group>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((cIdx) => {
                const cProgress = ((local * 0.04 + cIdx * 0.083) % 1.0);
                const cY = 0.77 + cProgress * 0.44;
                const cAng = cY * 18.0 + cIdx;
                const cRad = 0.065;
                const cScale = (1.0 - cProgress * 0.4) * 0.8;

                return (
                  <mesh
                    key={cIdx}
                    position={[
                      Math.cos(cAng) * cRad,
                      cY,
                      Math.sin(cAng) * cRad,
                    ]}
                    scale={[cScale, cScale, cScale]}
                  >
                    <boxGeometry args={[0.018, 0.016, 0.02]} />
                    <meshStandardMaterial color="#B45309" roughness={0.92} />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Jagged Fracture Node on Lower Shaft at Frame 265 */}
          {isBroken && (
            <mesh position={[0, 1.18, 0]}>
              <cylinderGeometry args={[0.028, 0.024, 0.04, 8]} />
              <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.8} />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* UPPER SHAFT SECTION (Twists and cracks off in Act 4)         */}
      {/* ------------------------------------------------------------- */}
      {spiralHasLanded && (
        <group
          position={[upperSnapX, spiralDropY + feedY + upperSnapY, 0]}
          rotation={[0, rotationAngle, upperRotZ]}
        >
          {/* Upper Shaft Shank - Chrome steel */}
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.42, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.98} />
          </mesh>

          {/* Square Taper Drive Socket Collar */}
          <mesh position={[0, 1.62, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEAVY FORGED T-HANDLE (Flings off violently in Act 4)          */}
      {/* ------------------------------------------------------------- */}
      {handleHasLanded && (
        <group
          position={[
            isBroken ? handleFlyX : 0,
            spiralDropY + feedY + handleDropY + (isBroken ? handleFlyY : 0),
            0,
          ]}
          rotation={[
            isBroken ? handleFlyRotX : 0,
            rotationAngle,
            isBroken ? handleFlyRotZ : 0,
          ]}
        >
          {/* Central Drive Hub Collar */}
          <mesh position={[0, 1.66, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.09, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.92} />
          </mesh>

          {/* Solid Polished Steel Crossbar */}
          <mesh position={[0, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.82, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.1} metalness={0.98} />
          </mesh>

          {/* Left Warm Polished Brass / Hardwood Grip */}
          <mesh position={[-0.34, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.048, 0.042, 0.22, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.88} />
          </mesh>

          {/* Right Warm Polished Brass / Hardwood Grip */}
          <mesh position={[0.34, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.048, 0.042, 0.22, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.88} />
          </mesh>

          {/* Heavy End Caps (Zero bolts) */}
          <mesh position={[-0.41, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.9} />
          </mesh>
          <mesh position={[0.41, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};
