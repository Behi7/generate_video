import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export interface BlackHoleSingularityProps {
  /**
   * Current local frame within the tier/sequence (e.g. 0..319).
   * Defaults to Remotion's `useCurrentFrame()`.
   */
  localFrame?: number;
  /**
   * Frame at which the gravitational fracture occurs and the singularity sequence begins.
   * Default: 234.
   */
  breakFrame?: number;
  /**
   * Frame at which the singularity implodes and the stage is left 100% clean.
   * Default: 308.
   */
  endFrame?: number;
  /**
   * World origin offset for the transition effect.
   * Default: [0, 0, 0].
   */
  position?: [number, number, number];
  /**
   * Center position of the singularity in local space.
   * Default: [0, singularityHeight ?? 1.35, 0].
   */
  singularityCenter?: [number, number, number];
  /**
   * Vertical height of the singularity above the position origin (in meters).
   * Default: 1.35 (centers directly inside the machine core/workpiece).
   */
  singularityHeight?: number;
  /**
   * Machine assembly / debris to be pulled into the singularity.
   */
  children?: React.ReactNode;
}

/**
 * Deterministic pseudo-random generator for frame-reproducible cosmic particle physics.
 */
function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// -----------------------------------------------------------------------------
// PRE-COMPUTED ACCRETION SWIRL PARTICLES (320 INWARD-SPIRALING MATTER PARTICLES)
// -----------------------------------------------------------------------------
interface MatterSwirlParticle {
  initialRadius: number;
  initialAngle: number;
  verticalOffset: number;
  swirlSpeed: number;
  inwardSpeedExp: number;
  size: number;
  colorType: 0 | 1 | 2; // 0: White-hot plasma, 1: Electric Cyan, 2: Deep Cosmic Violet
}

const SWIRL_PARTICLE_COUNT = 320;
const SWIRL_SEEDS: MatterSwirlParticle[] = Array.from({ length: SWIRL_PARTICLE_COUNT }).map((_, i) => {
  const initialRadius = 0.40 + seededRand(i * 3 + 1) * 1.10; // 0.40m .. 1.50m
  const initialAngle = (i / SWIRL_PARTICLE_COUNT) * Math.PI * 2 + seededRand(i * 5 + 2) * 0.4;
  const verticalOffset = (seededRand(i * 7 + 3) - 0.5) * 0.18; // compressed accretion disk plane
  const swirlSpeed = 0.08 + seededRand(i * 11 + 4) * 0.15;
  const inwardSpeedExp = 1.3 + seededRand(i * 13 + 5) * 0.7;
  const size = 0.02 + seededRand(i * 17 + 6) * 0.03;
  const colorRand = seededRand(i * 19 + 7);
  const colorType: 0 | 1 | 2 = colorRand < 0.35 ? 0 : colorRand < 0.7 ? 1 : 2;
  return {
    initialRadius,
    initialAngle,
    verticalOffset,
    swirlSpeed,
    inwardSpeedExp,
    size,
    colorType,
  };
});

// Bipolar Relativistic Hawking Jets
interface JetSegment {
  length: number;
  width: number;
  yOffset: number;
}

const JET_SEGMENTS: JetSegment[] = [
  { length: 0.8, width: 0.04, yOffset: 0.45 },
  { length: 1.4, width: 0.025, yOffset: 0.75 },
  { length: 2.0, width: 0.015, yOffset: 1.10 },
];

/**
 * BlackHoleSingularity:
 * 4th Masterpiece Cleanser Transition Effect (Gravitational Singularity).
 * Operates 100% in mid-air over the table ($Y \ge -2.04$), compatible with ANY floor.
 *
 * Sequence (breakFrame=234, endFrame=308, settle=308..319):
 * 1. Frames 0..233: Machine operates and rests normally above the table.
 * 2. Frames 234..248 (15f / 0.50s): Catastrophic fracture rupture! Broken machine shards,
 *    gears, and brackets explode outward in a radial ballistic fling.
 * 3. Frames 249..260 (12f / 0.40s): Gravitational singularity is born at the machine centroid;
 *    event horizon (pure pitch-black sphere, radius 0 -> 0.22m) expands;
 *    relativistic accretion disk ignites (25° Kerr tilt) and bipolar plasma jets fire.
 * 4. Frames 261..296 (36f / 1.20s): Relativistic gravitational vortex intercepts the debris;
 *    reverses outward flight into an accelerating inward spiral with spaghettification ($scale \to 0$);
 *    320+ incandescent particles swirl into the event horizon.
 * 5. Frames 297..304 (8f): Accretion disk collapses into an ultra-dense quantum micro-point.
 * 6. Frames 305..308 (4f): Singularity implodes with a blinding quantum flash (305..306)
 *    and expanding supersonic energy shockwave ring (305..308).
 * 7. Frames 308..319 (12f): The workstation table is 100% spotless, motionless, and sterile,
 *    awaiting the assembly of the next machine tier at frame 320.
 */
export const BlackHoleSingularity: React.FC<BlackHoleSingularityProps> = ({
  localFrame,
  breakFrame = 234,
  endFrame = 308,
  position = [0, 0, 0],
  singularityCenter: propCenter,
  singularityHeight,
  children,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = localFrame !== undefined ? localFrame : remotionFrame;

  // Post-transition: clean stage guarantee (frame 308..319+)
  if (frame >= endFrame) {
    return null;
  }

  // Pre-break: render intact machine normally
  if (frame < breakFrame) {
    return <group position={position}>{children}</group>;
  }

  const singularityCenter: [number, number, number] = propCenter ?? [
    0,
    singularityHeight ?? 1.35,
    0,
  ];

  const elapsed = frame - breakFrame;

  // ---------------------------------------------------------------------------
  // TIMELINE MILESTONES (STRICT VISUAL AUDIT CALIBRATION: 234..308)
  // ---------------------------------------------------------------------------
  const fFlingEnd = breakFrame + 14;       // 248: Outward debris fling peak
  const fBirth = breakFrame + 15;          // 249: Singularity event horizon born
  const fFullHorizon = breakFrame + 26;    // 260: Horizon & accretion disk fully expanded
  const fVortexSwallow = breakFrame + 64;  // 298: All debris 100% swallowed into core
  const fCollapseStart = breakFrame + 63;  // 297: Accretion disk starts rapid pinch
  const fImplosion = breakFrame + 71;      // 305: POINT OF COLLAPSE & QUANTUM FLASH
  const fShockwaveEnd = Math.min(endFrame, breakFrame + 74); // 308: Shockwave dissipated

  // ---------------------------------------------------------------------------
  // 1. EVENT HORIZON RADIUS (Pure Absolute Black Sphere)
  // ---------------------------------------------------------------------------
  const maxHorizonRadius = 0.22; // 22cm event horizon sphere
  let horizonRadius = 0;
  if (frame < fBirth) {
    horizonRadius = 0;
  } else if (frame < fFullHorizon) {
    const birthT = interpolate(frame, [fBirth, fFullHorizon], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    horizonRadius = maxHorizonRadius * birthT;
  } else if (frame < fCollapseStart) {
    const pulse = Math.sin((frame - fFullHorizon) * 0.5) * 0.012;
    horizonRadius = maxHorizonRadius + pulse;
  } else if (frame < fImplosion) {
    const collapseT = interpolate(frame, [fCollapseStart, fImplosion], [1.0, 0], {
      easing: Easing.bezier(0.6, 0.04, 0.98, 0.34),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    horizonRadius = Math.max(0, maxHorizonRadius * collapseT);
  } else {
    horizonRadius = 0;
  }

  // ---------------------------------------------------------------------------
  // 2. CHOREOGRAPHED OUTWARD FLING (234..248) & GRAVITATIONAL VORTEX (249..298)
  // ---------------------------------------------------------------------------
  let debrisScale = 1;
  let debrisPos: [number, number, number] = [0, 0, 0];
  let debrisRotX = 0;
  let debrisRotY = 0;
  let debrisRotZ = 0;

  if (frame >= breakFrame && frame < fBirth) {
    // Phase A (234..248): Outward explosive shrapnel fling
    const flingT = interpolate(frame, [breakFrame, fFlingEnd], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const outwardDist = flingT * 0.38; // 0 -> 0.38m outward explosion
    const hopY = Math.sin(flingT * Math.PI) * 0.16;

    debrisPos = [
      Math.cos(1.15) * outwardDist,
      hopY,
      Math.sin(1.15) * outwardDist,
    ];
    debrisRotX = flingT * 0.75;
    debrisRotY = flingT * 1.6;
    debrisRotZ = flingT * 0.55;
    debrisScale = 1.0;
  } else if (frame >= fBirth && frame < fVortexSwallow) {
    // Phase B (249..298): Gravitational vortex intercepts debris and sucks it inward
    const suctionT = interpolate(frame, [fBirth, fVortexSwallow], [0, 1], {
      easing: Easing.bezier(0.35, 0.0, 0.15, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Inward spiral from initial outward radius (0.38m) into singularity center
    const spiralRadius = 0.38 * (1 - suctionT);
    const spiralAngle = 1.15 + suctionT * Math.PI * 10; // Rapid inward rotation

    const curY = interpolate(suctionT, [0, 1], [0.08, singularityCenter[1]]);

    debrisPos = [
      Math.cos(spiralAngle) * spiralRadius,
      curY,
      Math.sin(spiralAngle) * spiralRadius,
    ];

    debrisRotX = 0.75 + suctionT * 3.2;
    debrisRotY = 1.6 + Math.pow(suctionT, 2) * Math.PI * 18;
    debrisRotZ = 0.55 + suctionT * 2.8;

    // Spaghettification: stretching & scaling down towards 0
    debrisScale = Math.max(0, 1 - Math.pow(suctionT, 1.55));
  } else {
    // 100% swallowed by frame 298
    debrisScale = 0;
  }

  // ---------------------------------------------------------------------------
  // 3. ACCRETION DISK ROTATION & GLOW INTENSITY
  // ---------------------------------------------------------------------------
  const diskRotation = elapsed * 0.26; // Rapid relativistic orbit
  const diskTilt = Math.PI * 0.14;    // ~25° Kerr inclination

  const glowIntensity = frame < fBirth
    ? 0
    : interpolate(
        frame,
        [fBirth, fFullHorizon, fCollapseStart, fImplosion],
        [0.8, 5.0, 8.5, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );

  const coreScale = horizonRadius / maxHorizonRadius;

  // ---------------------------------------------------------------------------
  // 4. HAWKING RADIATION IMPLOSION QUANTUM FLASH (Frames 305..306)
  // ---------------------------------------------------------------------------
  const isMicroFlash = frame >= fImplosion && frame <= fImplosion + 1;
  const microFlashOpacity = frame === fImplosion ? 1.0 : 0.42;

  // ---------------------------------------------------------------------------
  // 5. CONCUSSIVE GRAVITATIONAL SHOCKWAVE RING (Frames 305..308)
  // ---------------------------------------------------------------------------
  const isShockwaveActive = frame >= fImplosion && frame <= fShockwaveEnd;
  const shockwaveProgress = isShockwaveActive
    ? interpolate(frame, [fImplosion, fShockwaveEnd], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const shockwaveRadius = 0.18 + shockwaveProgress * 2.5; // 0.18m -> 2.68m
  const shockwaveOpacity = (1 - shockwaveProgress) * 0.92;

  // ---------------------------------------------------------------------------
  // 6. 320+ ACCRETION STREAM PARTICLES (HIGH-PERFORMANCE THREE.JS POINTS BUFFER)
  // ---------------------------------------------------------------------------
  const { particlePositions, particleColors, activeParticles } = useMemo(() => {
    const posArr = new Float32Array(SWIRL_PARTICLE_COUNT * 3);
    const colArr = new Float32Array(SWIRL_PARTICLE_COUNT * 3);

    if (frame < fBirth || frame >= fImplosion) {
      return { particlePositions: posArr, particleColors: colArr, activeParticles: 0 };
    }

    let count = 0;
    const progressFactor = Math.min(1, elapsed / (fImplosion - fBirth));

    for (let i = 0; i < SWIRL_PARTICLE_COUNT; i++) {
      const p = SWIRL_SEEDS[i];
      // Periodic cycle so particles continuously spiral inward
      const cycleLife = 24;
      const age = (elapsed + i * 2) % cycleLife;
      const t = age / cycleLife;

      // Inward exponential decay
      const r = Math.max(0.06, p.initialRadius * Math.pow(1 - t, p.inwardSpeedExp) * (1 - progressFactor * 0.5));
      const angle = p.initialAngle + elapsed * p.swirlSpeed + t * 9.0;

      const px = Math.cos(angle) * r;
      const py = p.verticalOffset * (1 - t) + Math.sin(t * Math.PI * 3) * 0.02;
      const pz = Math.sin(angle) * r;

      posArr[i * 3] = px;
      posArr[i * 3 + 1] = py;
      posArr[i * 3 + 2] = pz;

      const fade = Math.sin(t * Math.PI) * Math.min(1, coreScale * 1.5);
      if (p.colorType === 0) {
        // Ultra-hot plasma white
        colArr[i * 3] = 1.0 * fade;
        colArr[i * 3 + 1] = 0.98 * fade;
        colArr[i * 3 + 2] = 1.0 * fade;
      } else if (p.colorType === 1) {
        // Quantum cyan
        colArr[i * 3] = 0.05 * fade;
        colArr[i * 3 + 1] = 0.92 * fade;
        colArr[i * 3 + 2] = 1.0 * fade;
      } else {
        // Cosmic violet
        colArr[i * 3] = 0.85 * fade;
        colArr[i * 3 + 1] = 0.25 * fade;
        colArr[i * 3 + 2] = 1.0 * fade;
      }
      count++;
    }

    return { particlePositions: posArr, particleColors: colArr, activeParticles: count };
  }, [frame, fBirth, fImplosion, elapsed, coreScale]);

  return (
    <group position={position}>
      {/* 1. DEBRIS SUCKED INTO THE SINGULARITY */}
      {debrisScale > 0.001 && children && (
        <group
          position={debrisPos}
          rotation={[debrisRotX, debrisRotY, debrisRotZ]}
          scale={[debrisScale, debrisScale, debrisScale]}
        >
          {children}
        </group>
      )}

      {/* 2. BLACK HOLE SINGULARITY ENTITY (MID-AIR AT singularityCenter) */}
      {coreScale > 0.001 && (
        <group position={singularityCenter}>
          {/* Gravitational Point Light Illuminating Scene */}
          <pointLight
            color="#A855F7"
            intensity={glowIntensity * 1.6}
            distance={7.0}
            decay={2.0}
          />
          <pointLight
            color="#06B6D4"
            intensity={glowIntensity * 0.9}
            distance={4.5}
            decay={2.0}
          />

          {/* Absolute Pitch-Black Event Horizon Core */}
          {horizonRadius > 0.001 && (
            <mesh>
              <sphereGeometry args={[horizonRadius, 32, 32]} />
              <meshBasicMaterial color="#000000" depthWrite={true} />
            </mesh>
          )}

          {/* Relativistic Photon Sphere Glowing Lensing Shell */}
          {horizonRadius > 0.001 && (
            <mesh scale={[1.08, 1.08, 1.08]}>
              <sphereGeometry args={[horizonRadius, 32, 32]} />
              <meshStandardMaterial
                color="#38BDF8"
                emissive="#38BDF8"
                emissiveIntensity={glowIntensity * 0.8}
                transparent
                opacity={0.65}
                roughness={0.1}
              />
            </mesh>
          )}

          {/* Concentric Accretion Corona Rings (Tilted Spacetime Distortion) */}
          <group rotation={[diskTilt, diskRotation, 0]} scale={[coreScale, coreScale, coreScale]}>
            {/* Primary Superheated Inner Accretion Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.26, 0.44, 48]} />
              <meshStandardMaterial
                color="#C084FC"
                emissive="#A855F7"
                emissiveIntensity={glowIntensity}
                side={THREE.DoubleSide}
                transparent
                opacity={0.88}
              />
            </mesh>

            {/* Secondary Cyan Gravitational Wave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.44, 0.76, 48]} />
              <meshStandardMaterial
                color="#06B6D4"
                emissive="#00F5FF"
                emissiveIntensity={glowIntensity * 0.7}
                side={THREE.DoubleSide}
                transparent
                opacity={0.65}
              />
            </mesh>

            {/* Outer Spiral Accretion Plasma Vortex */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.76, 1.25, 48]} />
              <meshStandardMaterial
                color="#6366F1"
                emissive="#818CF8"
                emissiveIntensity={glowIntensity * 0.45}
                side={THREE.DoubleSide}
                transparent
                opacity={0.38}
              />
            </mesh>

            {/* 320+ Swirling Inward Matter Stream Particles */}
            {activeParticles > 0 && (
              <points>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={activeParticles}
                    array={particlePositions}
                    itemSize={3}
                  />
                  <bufferAttribute
                    attach="attributes-color"
                    count={activeParticles}
                    array={particleColors}
                    itemSize={3}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.038}
                  vertexColors
                  transparent
                  opacity={0.92}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </points>
            )}
          </group>

          {/* Bipolar Relativistic Plasma Jets (Pointing Up & Down along Y-Axis) */}
          <group scale={[coreScale, coreScale, coreScale]}>
            {[-1, 1].map((dir, dIdx) => (
              <group key={`jet-dir-${dIdx}`} position={[0, dir * 0.28, 0]}>
                {JET_SEGMENTS.map((seg, sIdx) => (
                  <mesh key={`seg-${sIdx}`} position={[0, dir * seg.yOffset, 0]}>
                    <cylinderGeometry args={[seg.width * 0.4, seg.width, seg.length, 16]} />
                    <meshStandardMaterial
                      color="#E0E7FF"
                      emissive="#818CF8"
                      emissiveIntensity={glowIntensity * 0.9}
                      transparent
                      opacity={0.75 - sIdx * 0.2}
                    />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        </group>
      )}

      {/* 3. POINT OF COLLAPSE MICRO-FLASH (Frames 310..311) */}
      {isMicroFlash && (
        <group position={singularityCenter}>
          {/* Brilliant compact quantum core */}
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={microFlashOpacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Secondary cyan photonic corona */}
          <mesh scale={[1.4, 1.4, 1.4]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={microFlashOpacity * 0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            color="#E0F2FE"
            intensity={microFlashOpacity * 14.0}
            distance={8.0}
            decay={1.8}
          />
        </group>
      )}

      {/* 4. RELATIVISTIC EXPANDING SHOCKWAVE RING (Frames 310..314) */}
      {isShockwaveActive && shockwaveOpacity > 0.01 && (
        <group position={singularityCenter}>
          {/* Primary Supersonic Energy Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(0.01, shockwaveRadius - 0.12), shockwaveRadius, 48]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={shockwaveOpacity}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Secondary Cosmic Violet Warp Halo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(0.01, shockwaveRadius * 0.65 - 0.08), shockwaveRadius * 0.65, 36]} />
            <meshBasicMaterial
              color="#C084FC"
              transparent
              opacity={shockwaveOpacity * 0.55}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default BlackHoleSingularity;
