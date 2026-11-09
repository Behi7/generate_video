import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";

export interface PneumaticAirBlastProps {
  /** Current local frame within the animation or tier (e.g. 234..308). Defaults to `useCurrentFrame()`. */
  localFrame?: number;
  /** Frame when the high-pressure pneumatic blast triggers. Default: 234 */
  blastFrame?: number;
  /** Frame when the transition completes and stage is 100% pristine. Default: 308 */
  endFrame?: number;
  /** Child nodes (e.g. broken machine mechanism, fractured parts) to blast off the stage */
  children?: React.ReactNode;
  /** World position of the blast epicenter / air nozzle focus. Default: [0, 0, 0] */
  origin?: [number, number, number];
  /** Floor Y plane for ground bounce, floor scour, and dust kick-up. Default: 0 */
  floorY?: number;
  /** Intensity multiplier for blast velocity and visual dynamics. Default: 1.0 */
  intensity?: number;
  /** Primary air vapor color. Default: "#F8FAFC" */
  airColor?: string;
  /** Accent shockwave glow color. Default: "#38BDF8" */
  shockwaveColor?: string;
  /** Whether to render the industrial CNC pneumatic nozzle array around the stage. Default: true */
  showNozzles?: boolean;
}

/** Deterministic pseudo-random generator for consistent, reproducible procedural physics across renders. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// -----------------------------------------------------------------------------
// PRE-COMPUTED PROCEDURAL SHRAPNEL PARTICLES (24 discrete broken machine parts)
// -----------------------------------------------------------------------------
interface ShrapnelDef {
  type: 0 | 1 | 2 | 3 | 4; // 0: Hex nut, 1: Bracket shard, 2: Shear pin, 3: Plate chip, 4: Flange bolt
  dirX: number;
  dirZ: number;
  speed: number;
  popY: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  scale: number;
  color: string;
}

const SHRAPNEL_DEBRIS: ShrapnelDef[] = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i / 24) * Math.PI * 2 + (pseudoRandom(i * 3 + 1) - 0.5) * 0.45;
  const speed = 0.14 + pseudoRandom(i * 7 + 2) * 0.12; // 0.14..0.26 m/frame
  const popY = 0.12 + pseudoRandom(i * 11 + 3) * 0.14; // upward velocity
  const type = (i % 5) as 0 | 1 | 2 | 3 | 4;
  const colors = ["#475569", "#64748B", "#334155", "#94A3B8", "#D97706", "#CBD5E1"];
  return {
    type,
    dirX: Math.cos(angle),
    dirZ: Math.sin(angle),
    speed,
    popY,
    rotSpeedX: (pseudoRandom(i * 13 + 4) - 0.5) * 1.4,
    rotSpeedY: (pseudoRandom(i * 17 + 5) - 0.5) * 1.8,
    rotSpeedZ: (pseudoRandom(i * 19 + 6) - 0.5) * 1.4,
    scale: 0.7 + pseudoRandom(i * 23 + 7) * 0.6,
    color: colors[i % colors.length],
  };
});

// -----------------------------------------------------------------------------
// PRE-COMPUTED FLOOR DUST PARTICLES (36 radial ground mist & fine particulate puffs)
// -----------------------------------------------------------------------------
interface DustDef {
  angle: number;
  radialSpeed: number;
  riseHeight: number;
  size: number;
  swirlPhase: number;
}

const FLOOR_DUST_PARTICLES: DustDef[] = Array.from({ length: 36 }).map((_, i) => {
  const angle = (i / 36) * Math.PI * 2 + (pseudoRandom(i * 5 + 7) - 0.5) * 0.35;
  return {
    angle,
    radialSpeed: 0.08 + pseudoRandom(i * 9 + 1) * 0.09,
    riseHeight: 0.04 + pseudoRandom(i * 13 + 3) * 0.16,
    size: 0.04 + pseudoRandom(i * 17 + 5) * 0.06,
    swirlPhase: pseudoRandom(i * 29 + 11) * Math.PI * 2,
  };
});

// -----------------------------------------------------------------------------
// PRE-COMPUTED INDUSTRIAL CNC AIR NOZZLES (6 peripheral 20-bar nozzles)
// -----------------------------------------------------------------------------
interface NozzleDef {
  posX: number;
  posZ: number;
  rotY: number;
}

const NOZZLE_RING_RADIUS = 1.45;
const NOZZLES: NozzleDef[] = Array.from({ length: 6 }).map((_, i) => {
  const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
  return {
    posX: Math.cos(angle) * NOZZLE_RING_RADIUS,
    posZ: Math.sin(angle) * NOZZLE_RING_RADIUS,
    rotY: -angle - Math.PI / 2,
  };
});

/**
 * PneumaticAirBlast:
 * High-pressure industrial pneumatic cleansing blast (inspired by 15-20 bar CNC air nozzles).
 *
 * Sequence (Frames 234..308, clean hold 308..319):
 * 1. Blast initiation (234..245): Instantaneous supersonic air decompression with moisture condensation flash.
 * 2. Supersonic expanding vapor rings: Translucent multi-tier shockwave toruses scouring the air.
 * 3. Radial ballistic impulse (234..300): Broken machine assembly & debris fragments blasted outward with
 *    2-3 realistic ballistic floor bounces and ground friction.
 * 4. Ground dust kick-up: Annular floor scour sheet & billowing dust cloud rapidly sweeping the perimeter.
 * 5. Complete stage sterilization: By frame 306 all debris is beyond the camera frustum; by frame 308..319 the
 *    anvil floor is 100% spotless, polished, and ready for the next machine tier.
 */
export const PneumaticAirBlast: React.FC<PneumaticAirBlastProps> = ({
  localFrame,
  blastFrame = 234,
  endFrame = 308,
  children,
  origin = [0, 0, 0],
  floorY = 0,
  intensity = 1.0,
  airColor = "#F8FAFC",
  shockwaveColor = "#38BDF8",
  showNozzles = true,
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame !== undefined ? localFrame : currentFrame;

  // ---------------------------------------------------------------------------
  // 1. KINEMATICS & LIFETIME PHASING
  // ---------------------------------------------------------------------------
  const totalDuration = Math.max(1, endFrame - blastFrame);
  const elapsed = frame - blastFrame;
  const isBlastActive = elapsed >= 0 && frame <= endFrame;
  const isPreBlast = elapsed < 0;
  const isComplete = frame >= endFrame;

  // Normalized progress (0..1) through the transition window
  const progress = interpolate(frame, [blastFrame, endFrame], [0, 1], {
    easing: Easing.bezier(0.12, 0.9, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fast initial blast punch progress (0..1 over first 12 frames)
  const punchProgress = interpolate(frame, [blastFrame, blastFrame + 12], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 2. PRIMARY SHOCKWAVE TORUS #1 & SECONDARY TORUS #2
  // ---------------------------------------------------------------------------
  // Primary shockwave expansion: expands rapidly from 0.15m to 4.2m
  const shockwaveRadius = interpolate(progress, [0, 0.7, 1], [0.15, 3.4 * intensity, 4.4 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Shockwave tube thickness tapers down as it expands
  const shockwaveTube = interpolate(progress, [0, 0.3, 1], [0.075, 0.045, 0.012], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Shockwave opacity: spike on frame 1..3, smooth exponential decay to 0 by 70% progress
  const shockwaveOpacity = interpolate(progress, [0, 0.06, 0.45, 0.75], [0, 0.85, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Secondary trailing atmospheric rarefaction ring (delayed by 3 frames)
  const secondaryProgress = interpolate(frame, [blastFrame + 3, endFrame], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondaryRadius = interpolate(secondaryProgress, [0, 1], [0.1, 3.6 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondaryOpacity = interpolate(secondaryProgress, [0, 0.08, 0.5, 0.85], [0, 0.55, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 3. CORE MOISTURE CONDENSATION FLASH (Joule-Thomson adiabatic cooling)
  // ---------------------------------------------------------------------------
  const coreFlashScale = interpolate(elapsed, [0, 2, 7], [0.15, 0.55 * intensity, 0.85 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coreFlashOpacity = interpolate(elapsed, [0, 1, 4, 8], [0, 0.95, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 4. RADIAL FLOOR SCOUR SHEET (High-speed compressed air sweeping anvil plane)
  // ---------------------------------------------------------------------------
  const floorScourInner = interpolate(progress, [0, 0.85], [0.1, 3.2 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floorScourOuter = interpolate(progress, [0, 0.85], [0.35, 4.2 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floorScourOpacity = interpolate(progress, [0, 0.08, 0.45, 0.8], [0, 0.65, 0.25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 5. NOZZLE SUPERSONIC AIR JET CONES
  // ---------------------------------------------------------------------------
  const jetLength = interpolate(punchProgress, [0, 0.2, 0.8, 1], [0.1, 1.35 * intensity, 1.45 * intensity, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jetOpacity = interpolate(punchProgress, [0, 0.15, 0.65, 1], [0, 0.85, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 6. DISPLACEMENT & BALLISTIC TRAJECTORY OF PASS-DOWN `children`
  // ---------------------------------------------------------------------------
  // When blast strikes, the fractured machine assembly is flung backwards & sideways
  // beyond camera FOV with 2-3 realistic ballistic floor bounces, exiting frame by frame 306.
  let childrenPosX = 0;
  let childrenPosY = 0;
  let childrenPosZ = 0;
  let childrenRotX = 0;
  let childrenRotY = 0;
  let childrenRotZ = 0;
  let childrenScale = 1;

  if (isBlastActive) {
    // Non-linear horizontal acceleration across 74 frames
    const launchDist = Math.pow(progress, 1.22) * 8.6 * intensity;
    childrenPosX = launchDist * 0.78; // Flung toward +X
    childrenPosZ = -launchDist * 0.62; // Flung toward -Z (receding into stage depth)

    // 2-3 Realistic Ballistic Bounces along the floor:
    // Bounce 1 (t in 0..24, f=234..258): High initial impulse
    // Bounce 2 (t in 24..46, f=258..280): Restitution rebound
    // Bounce 3 (t in 46..64, f=280..298): Damped skid rebound
    // Slide (t >= 64, f=298..308): Friction slide off-screen
    let childBounceH = 0;
    if (elapsed < 24) {
      const t1 = elapsed / 24;
      childBounceH = Math.sin(t1 * Math.PI) * 0.95 * intensity;
    } else if (elapsed < 46) {
      const t2 = (elapsed - 24) / 22;
      childBounceH = Math.sin(t2 * Math.PI) * 0.42 * intensity;
    } else if (elapsed < 64) {
      const t3 = (elapsed - 46) / 18;
      childBounceH = Math.sin(t3 * Math.PI) * 0.16 * intensity;
    } else {
      childBounceH = 0;
    }
    childrenPosY = Math.max(floorY, floorY + childBounceH);

    // Violent multi-axis tumbling rotation
    childrenRotX = elapsed * 0.16;
    childrenRotY = elapsed * 0.24;
    childrenRotZ = elapsed * 0.14;

    // By frame 306 (elapsed >= 72), debris is >7.2m away (well past camera frustum).
    // Taper scale cleanly to 0 as it exits so no stray artifacts linger.
    childrenScale = interpolate(elapsed, [68, 73], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (isComplete) {
    childrenScale = 0;
  }

  // ---------------------------------------------------------------------------
  // 7. POLISHED CLEANSE SHEEN (Frames 300..308: Sterile pristine surface gleam)
  // ---------------------------------------------------------------------------
  const sheenProgress = interpolate(frame, [blastFrame + 66, endFrame], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenOpacity = interpolate(sheenProgress, [0, 0.35, 0.7, 1], [0, 0.7, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenPosX = interpolate(sheenProgress, [0, 1], [-1.2, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <group position={origin}>
      {/* =================================================================== */}
      {/* A. PASS-DOWN CHILDREN: BLASTED MACHINE WITH PHYSICAL BALLISTICS     */}
      {/* =================================================================== */}
      {!isComplete && childrenScale > 0 && (
        <group
          position={[childrenPosX, childrenPosY, childrenPosZ]}
          rotation={[childrenRotX, childrenRotY, childrenRotZ]}
          scale={[childrenScale, childrenScale, childrenScale]}
        >
          {children}
        </group>
      )}

      {/* =================================================================== */}
      {/* B. INDUSTRIAL 20-BAR CNC AIR NOZZLE RING                           */}
      {/* =================================================================== */}
      {showNozzles && (
        <group name="PneumaticNozzleArray">
          {NOZZLES.map((nozzle, idx) => (
            <group
              key={`cnc-nozzle-${idx}`}
              position={[nozzle.posX, floorY + 0.12, nozzle.posZ]}
              rotation={[0, nozzle.rotY, 0]}
            >
              {/* Heavy Machined Steel Mounting Block */}
              <RoundedBox args={[0.08, 0.08, 0.12]} radius={0.01} smoothness={2}>
                <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.32} />
              </RoundedBox>

              {/* M10 Anchor Hex Bolts on Block */}
              {[-0.026, 0.026].map((bx, bIdx) => (
                <mesh key={`nbolt-${bIdx}`} position={[bx, 0.042, 0]}>
                  <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
                  <meshStandardMaterial color="#64748B" metalness={0.92} roughness={0.2} />
                </mesh>
              ))}

              {/* Angled High-Pressure CNC Nozzle Body (pointing 28 deg downward toward center) */}
              <group position={[0, 0.015, -0.07]} rotation={[0.48, 0, 0]}>
                {/* Hexagonal Brass Fitting Collar */}
                <mesh position={[0, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.028, 0.028, 0.045, 6]} />
                  <meshStandardMaterial color="#D97706" metalness={0.92} roughness={0.18} />
                </mesh>

                {/* Precision Tapered Stainless Air Jet Nozzle Tip */}
                <mesh position={[0, 0, -0.085]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.014, 0.022, 0.07, 16]} />
                  <meshStandardMaterial color="#E2E8F0" metalness={0.96} roughness={0.12} />
                </mesh>

                {/* Dark Sonic Jet Orifice */}
                <mesh position={[0, 0, -0.121]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.004, 16]} />
                  <meshBasicMaterial color="#020617" />
                </mesh>

                {/* Supersonic Pressurized Air Jet Stream (Active at punch) */}
                {isBlastActive && jetOpacity > 0 && (
                  <group position={[0, 0, -0.12 - jetLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
                    {/* Primary High-Speed Air Cone */}
                    <mesh>
                      <coneGeometry args={[0.16 * intensity, jetLength, 16]} />
                      <meshBasicMaterial
                        color={shockwaveColor}
                        transparent
                        opacity={jetOpacity * 0.75}
                        depthWrite={false}
                      />
                    </mesh>
                    {/* Intense Inner Core Stream */}
                    <mesh scale={[0.45, 0.95, 0.45]}>
                      <cylinderGeometry args={[0.02, 0.06, jetLength, 12]} />
                      <meshBasicMaterial
                        color="#FFFFFF"
                        transparent
                        opacity={jetOpacity * 0.95}
                        depthWrite={false}
                      />
                    </mesh>
                  </group>
                )}
              </group>

              {/* High-Pressure Braided Hydraulic/Pneumatic Supply Hose */}
              <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.12, 12]} />
                <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =================================================================== */}
      {/* C. SUPERSONIC ATMOSPHERIC SHOCKWAVES & VAPOR CORE                   */}
      {/* =================================================================== */}
      {isBlastActive && (
        <group name="SupersonicShockwaves" position={[0, floorY + 0.08, 0]}>
          {/* 1. Core Adiabatic Condensation Flash */}
          {coreFlashOpacity > 0 && (
            <mesh scale={[coreFlashScale, coreFlashScale * 0.75, coreFlashScale]}>
              <sphereGeometry args={[0.45, 18, 18]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={coreFlashOpacity}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* 2. Primary High-Velocity Shockwave Torus Ring */}
          {shockwaveOpacity > 0 && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[shockwaveRadius, shockwaveTube, 16, 48]} />
              <meshStandardMaterial
                color={airColor}
                emissive={shockwaveColor}
                emissiveIntensity={1.2}
                roughness={0.12}
                metalness={0.1}
                transparent
                opacity={shockwaveOpacity}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* 3. Secondary Trailing Rarefaction Wave Ring */}
          {secondaryOpacity > 0 && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[secondaryRadius, 0.035, 12, 36]} />
              <meshStandardMaterial
                color="#E2E8F0"
                emissive="#93C5FD"
                emissiveIntensity={0.6}
                roughness={0.2}
                transparent
                opacity={secondaryOpacity}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* 4. High-Pressure Floor Scour Annular Disc */}
          {floorScourOpacity > 0 && (
            <mesh position={[0, -0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[floorScourInner, floorScourOuter, 42]} />
              <meshBasicMaterial
                color="#E2E8F0"
                transparent
                opacity={floorScourOpacity * 0.6}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      )}

      {/* =================================================================== */}
      {/* D. RADIAL FLOOR DUST KICK-UP PARTICLES (36 Billowing Ground Puffs)  */}
      {/* =================================================================== */}
      {isBlastActive && (
        <group name="RadialFloorDustCloud">
          {FLOOR_DUST_PARTICLES.map((dust, idx) => {
            // Radial distance governed by viscous floor drag
            const dist = dust.radialSpeed * elapsed * (1 - Math.min(elapsed * 0.018, 0.55)) * 3.2 * intensity;
            const px = Math.cos(dust.angle) * dist;
            const pz = Math.sin(dust.angle) * dist;

            // Damped ground-effect lift: dust rises slightly then settles/diffuses
            const liftProgress = Math.min(1, elapsed / (totalDuration * 0.85));
            const py = floorY + 0.015 + Math.sin(liftProgress * Math.PI) * dust.riseHeight * intensity;

            // Dust puffs expand as they disperse
            const puffScale = dust.size * (1 + liftProgress * 2.6) * intensity;
            const puffOpacity = interpolate(progress, [0, 0.1, 0.5, 0.88], [0, 0.65, 0.35, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            if (puffOpacity <= 0) return null;

            return (
              <mesh key={`dust-puff-${idx}`} position={[px, py, pz]} scale={[puffScale, puffScale * 0.6, puffScale]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial
                  color="#E2E8F0"
                  roughness={0.92}
                  metalness={0.05}
                  transparent
                  opacity={puffOpacity}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* E. 24 PHYSICAL FRACTURED MACHINE SHRAPNEL & METAL DEBRIS FRAGMENTS */}
      {/* =================================================================== */}
      {isBlastActive && (
        <group name="PhysicalFracturedShrapnel">
          {SHRAPNEL_DEBRIS.map((deb, idx) => {
            // Horizontal trajectory flying radially away
            const t = elapsed;
            const flightDist = deb.speed * t * (1 + t * 0.008) * intensity;
            const px = deb.dirX * flightDist;
            const pz = deb.dirZ * flightDist;

            // 2-3 Realistic Ballistic Bounces along the floor across 74 frames:
            const tOffset = (idx % 4) * 1.5;
            const localT = Math.max(0, t - tOffset);

            let bounceH = 0;
            if (localT < 24) {
              const t1 = localT / 24;
              bounceH = Math.sin(t1 * Math.PI) * deb.popY * 2.8;
            } else if (localT < 46) {
              const t2 = (localT - 24) / 22;
              bounceH = Math.sin(t2 * Math.PI) * deb.popY * 1.25;
            } else if (localT < 64) {
              const t3 = (localT - 46) / 18;
              bounceH = Math.sin(t3 * Math.PI) * deb.popY * 0.45;
            } else {
              bounceH = 0;
            }
            const py = floorY + 0.012 + Math.max(0, bounceH);

            // Tumbling rotational spin
            const rx = t * deb.rotSpeedX;
            const ry = t * deb.rotSpeedY;
            const rz = t * deb.rotSpeedZ;

            // Once fragments pass beyond 4.8m radius (outside camera frustum), cull smoothly by frame 306
            const radialDist = Math.sqrt(px * px + pz * pz);
            const fragmentOpacity = radialDist > 4.6 ? interpolate(radialDist, [4.6, 6.0], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

            if (fragmentOpacity <= 0) return null;

            const sc = deb.scale * intensity;

            return (
              <group
                key={`shrapnel-${idx}`}
                position={[px, py, pz]}
                rotation={[rx, ry, rz]}
                scale={[sc, sc, sc]}
              >
                {/* Type 0: Hex Nut */}
                {deb.type === 0 && (
                  <mesh>
                    <cylinderGeometry args={[0.035, 0.035, 0.024, 6]} />
                    <meshStandardMaterial color={deb.color} metalness={0.92} roughness={0.25} />
                  </mesh>
                )}

                {/* Type 1: Sheared Steel Bracket Fragment */}
                {deb.type === 1 && (
                  <mesh>
                    <boxGeometry args={[0.08, 0.018, 0.05]} />
                    <meshStandardMaterial color={deb.color} metalness={0.88} roughness={0.3} />
                  </mesh>
                )}

                {/* Type 2: Broken Hardened Dowel Pin */}
                {deb.type === 2 && (
                  <mesh rotation={[0.4, 0, 0.8]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.09, 12]} />
                    <meshStandardMaterial color={deb.color} metalness={0.96} roughness={0.15} />
                  </mesh>
                )}

                {/* Type 3: Jagged Cast Iron Plate Flake */}
                {deb.type === 3 && (
                  <mesh rotation={[0.2, 0.5, 0]}>
                    <boxGeometry args={[0.065, 0.012, 0.075]} />
                    <meshStandardMaterial color={deb.color} metalness={0.82} roughness={0.45} />
                  </mesh>
                )}

                {/* Type 4: Sheared M12 Bolt Head with Washer */}
                {deb.type === 4 && (
                  <group>
                    <mesh>
                      <cylinderGeometry args={[0.028, 0.028, 0.02, 6]} />
                      <meshStandardMaterial color={deb.color} metalness={0.94} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, -0.014, 0]}>
                      <cylinderGeometry args={[0.036, 0.036, 0.006, 16]} />
                      <meshStandardMaterial color="#94A3B8" metalness={0.92} roughness={0.22} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* =================================================================== */}
      {/* F. STERILE PRISTINE CLEANSE SHEEN (Frames 308..315)                 */}
      {/* =================================================================== */}
      {sheenOpacity > 0 && (
        <group name="SterileSurfacePolishGleam" position={[sheenPosX, floorY + 0.003, 0]}>
          {/* Diagonal Specular Reflection Sweep across the pristine anvil */}
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.22, 1.6]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={sheenOpacity * 0.45}
              depthWrite={false}
            />
          </mesh>
          {/* Precision Center Glint */}
          <mesh position={[0, 0.002, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={sheenOpacity * 0.75}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default PneumaticAirBlast;
