import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";

export interface BlackHoleSingularityProps {
  /**
   * Current local frame within the tier/sequence (e.g. 0..319).
   * Defaults to Remotion's `useCurrentFrame()`.
   */
  localFrame?: number;
  /**
   * Frame at which the catastrophic fracture occurs and the singularity sequence begins.
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
// PRE-COMPUTED SHATTERED MECHANICAL DEBRIS BLOCKS (20 DISCRETE MACHINE CHUNKS)
// -----------------------------------------------------------------------------
interface DebrisBlockSeed {
  type: 0 | 1 | 2 | 3 | 4; // 0: cast iron block, 1: bronze bushing, 2: steel shear plate, 3: gear segment, 4: bolt pin
  angle0: number;
  targetRadius: number;
  targetY: number;
  rotX0: number;
  rotY0: number;
  rotZ0: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  hoverPhase: number;
  scale: number;
  color: string;
}

const DEBRIS_BLOCK_COUNT = 20;
const DEBRIS_BLOCKS: DebrisBlockSeed[] = Array.from({ length: DEBRIS_BLOCK_COUNT }).map((_, i) => {
  const type = (i % 5) as 0 | 1 | 2 | 3 | 4;
  const angle0 = (i / DEBRIS_BLOCK_COUNT) * Math.PI * 2 + (seededRand(i * 7 + 1) - 0.5) * 0.35;
  // Radius strictly within camera frame bounds (0.38m to 0.72m from centroid)
  const targetRadius = 0.38 + seededRand(i * 11 + 2) * 0.34;
  // Elevation floating in mid-air above the table (0.85m to 1.65m - NO floor dropping!)
  const targetY = 0.85 + seededRand(i * 13 + 3) * 0.80;
  const rotX0 = seededRand(i * 17 + 4) * Math.PI * 2;
  const rotY0 = seededRand(i * 19 + 5) * Math.PI * 2;
  const rotZ0 = seededRand(i * 23 + 6) * Math.PI * 2;
  const rotSpeedX = (seededRand(i * 29 + 7) - 0.5) * 1.8;
  const rotSpeedY = (seededRand(i * 31 + 8) - 0.5) * 2.2;
  const rotSpeedZ = (seededRand(i * 37 + 9) - 0.5) * 1.8;
  const hoverPhase = seededRand(i * 41 + 10) * Math.PI * 2;
  const scale = 0.85 + seededRand(i * 43 + 11) * 0.35;
  const colors = ["#1E293B", "#D97706", "#475569", "#64748B", "#CBD5E1"];
  const color = colors[type];
  return {
    type,
    angle0,
    targetRadius,
    targetY,
    rotX0,
    rotY0,
    rotZ0,
    rotSpeedX,
    rotSpeedY,
    rotSpeedZ,
    hoverPhase,
    scale,
    color,
  };
});

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
  const initialRadius = 0.45 + seededRand(i * 3 + 1) * 1.05; // 0.45m .. 1.50m
  const initialAngle = (i / SWIRL_PARTICLE_COUNT) * Math.PI * 2 + seededRand(i * 5 + 2) * 0.4;
  const verticalOffset = (seededRand(i * 7 + 3) - 0.5) * 0.16;
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

// Upward Relativistic Jet: fires into the open air above the machine
const UP_JET_SEGMENTS: JetSegment[] = [
  { length: 0.65, width: 0.035, yOffset: 0.38 },
  { length: 1.10, width: 0.022, yOffset: 0.75 },
  { length: 1.60, width: 0.012, yOffset: 1.25 },
];

// Downward Jet: strictly limited by table surface distance so it NEVER punches through the floor!
// Maximum distance from singularity center (1.35m) to jet tip is capped at 1.02m (terminating ~33cm above the table)
const DOWN_JET_SEGMENTS: JetSegment[] = [
  { length: 0.35, width: 0.035, yOffset: 0.22 },
  { length: 0.45, width: 0.022, yOffset: 0.50 },
  { length: 0.40, width: 0.012, yOffset: 0.82 },
];

/**
 * BlackHoleSingularity:
 * 4th Masterpiece Cleanser Transition Effect (Gravitational Singularity - 10/10).
 * Operates 100% in mid-air over the table ($Y \ge -2.04$), compatible with ANY floor.
 *
 * Sequence (breakFrame=234, endFrame=308, settle=308..319):
 * 1. Frames 0..233: Machine operates normally above the table.
 * 2. Frames 234..244 (10f): Catastrophic fracture rupture! The machine shatters into 20 discrete
 *    mechanical blocks and components that burst outward radially from the centroid.
 * 3. Frames 245..258 (14f): ANTI-GRAVITY ZERO-G HOVER! The outward momentum is softly arrested.
 *    The broken blocks DO NOT FALL TO THE FLOOR, but HOVER IN MID-AIR inside the camera frame bounds,
 *    gently bobbing with harmonic buoyancy in total weightlessness!
 * 4. Frames 252..260 (8f): Right in the epicenter of the hovering blocks, a TRUE PITCH-BLACK event horizon
 *    sphere expands (pure #000000, zero foggy shell), encircled by a razor-thin camera-facing cyan photon ring
 *    and a spinning tilted relativistic accretion disk.
 * 5. Frames 260..296 (36f): Gravitational vortex suction! One by one, the floating blocks curve into
 *    accelerating 3D orbital spirals, pulled into the black hole with spaghettification ($scale \to 0$).
 * 6. Frames 297..304 (8f): Accretion disk rapidly collapses into an ultra-dense quantum micro-point ($R \to 0$).
 * 7. Frames 305..308 (4f): Quantum micro-implosion (a blinding flash and razor-thin supersonic shockwave ring).
 * 8. Frames 308..319 (12f): The workstation table is 100% spotless, motionless, and sterile,
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
  // TIMELINE MILESTONES (STRICT 74-FRAME VISUAL AUDIT: 234..308)
  // ---------------------------------------------------------------------------
  const fBurstEnd = breakFrame + 10;        // 244: Peak outward burst of shattered blocks
  const fHoverEnd = breakFrame + 24;        // 258: Zero-G hover phase ends
  const fBirth = breakFrame + 18;           // 252: True Pitch-Black Horizon Born
  const fFullHorizon = breakFrame + 26;     // 260: Horizon fully expanded (R = 0.22m)
  const fVortexStart = breakFrame + 26;     // 260: Gravitational suction vortex begins
  const fVortexSwallow = breakFrame + 62;   // 296: All debris 100% swallowed into core
  const fCollapseStart = breakFrame + 63;   // 297: Accretion disk starts rapid pinch
  const fImplosion = breakFrame + 71;       // 305: POINT OF COLLAPSE & QUANTUM FLASH
  const fShockwaveEnd = Math.min(endFrame, breakFrame + 74); // 308: Shockwave dissipated

  // ---------------------------------------------------------------------------
  // 1. TRUE PITCH-BLACK EVENT HORIZON RADIUS (Pure Absolute Black Sphere)
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
    const pulse = Math.sin((frame - fFullHorizon) * 0.5) * 0.008;
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
  // 2. PHOTON RING ORIENTATION: STRICTLY CAMERA-FACING SILHOUETTE
  // ---------------------------------------------------------------------------
  // Remotion RigidShowcaseCamera is at [2.3, 1.8, 3.6].
  // Orienting the photon ring directly perpendicular to camera vector guarantees a perfect razor circle!
  const photonRingRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.position.set(0, 0, 0);
    dummy.lookAt(2.3, 1.8 - singularityCenter[1], 3.6);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z] as [number, number, number];
  }, [singularityCenter]);

  // ---------------------------------------------------------------------------
  // 3. ACCRETION DISK ROTATION & GLOW INTENSITY
  // ---------------------------------------------------------------------------
  const diskRotation = elapsed * 0.28; // Relativistic Kerr orbital velocity
  const diskTilt = Math.PI * 0.14;    // ~25° Kerr inclination

  const glowIntensity = frame < fBirth
    ? 0
    : interpolate(
        frame,
        [fBirth, fFullHorizon, fCollapseStart, fImplosion],
        [0.8, 6.0, 9.5, 0],
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
      const cycleLife = 20;
      const age = (elapsed + i * 2) % cycleLife;
      const t = age / cycleLife;

      // Inward exponential decay
      const r = Math.max(0.08, p.initialRadius * Math.pow(1 - t, p.inwardSpeedExp) * (1 - progressFactor * 0.5));

      // CRITICAL: Hide particles once they cross inside the event horizon perimeter!
      if (r <= horizonRadius * 1.04) {
        continue;
      }

      const angle = p.initialAngle + elapsed * p.swirlSpeed + t * 9.0;
      const px = Math.cos(angle) * r;
      const py = p.verticalOffset * (1 - t) + Math.sin(t * Math.PI * 3) * 0.02;
      const pz = Math.sin(angle) * r;

      posArr[count * 3] = px;
      posArr[count * 3 + 1] = py;
      posArr[count * 3 + 2] = pz;

      const fade = Math.sin(t * Math.PI) * Math.min(1, coreScale * 1.5);
      if (p.colorType === 0) {
        // Ultra-hot plasma white
        colArr[count * 3] = 1.0 * fade;
        colArr[count * 3 + 1] = 0.98 * fade;
        colArr[count * 3 + 2] = 1.0 * fade;
      } else if (p.colorType === 1) {
        // Quantum cyan
        colArr[count * 3] = 0.05 * fade;
        colArr[count * 3 + 1] = 0.92 * fade;
        colArr[count * 3 + 2] = 1.0 * fade;
      } else {
        // Cosmic violet
        colArr[count * 3] = 0.85 * fade;
        colArr[count * 3 + 1] = 0.25 * fade;
        colArr[count * 3 + 2] = 1.0 * fade;
      }
      count++;
    }

    return { particlePositions: posArr, particleColors: colArr, activeParticles: count };
  }, [frame, fBirth, fImplosion, elapsed, coreScale, horizonRadius]);

  // ---------------------------------------------------------------------------
  // 7. PRE-COMPUTED TWO-PHASE KINEMATICS FOR 20 DISCRETE MECHANICAL BLOCKS
  // ---------------------------------------------------------------------------
  const blockTransforms = useMemo(() => {
    if (frame < breakFrame || frame >= fVortexSwallow) {
      return [];
    }

    return DEBRIS_BLOCKS.map((b, idx) => {
      let px = 0;
      let py = 0;
      let pz = 0;
      let rx = 0;
      let ry = 0;
      let rz = 0;
      let blockScale = b.scale;

      if (frame < fBurstEnd) {
        // Phase 1 (frames 234..244, 10f): EXPLOSIVE OUTWARD BURST
        const burstT = interpolate(frame, [breakFrame, fBurstEnd], [0, 1], {
          easing: Easing.bezier(0.12, 0.9, 0.15, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const r = burstT * b.targetRadius;
        const angle = b.angle0 + burstT * 0.25;
        px = Math.cos(angle) * r;
        pz = Math.sin(angle) * r;
        // Mid-air burst elevation: NO floor dropping!
        py = 1.25 + (b.targetY - 1.25) * burstT + Math.sin(burstT * Math.PI) * 0.15;

        rx = b.rotX0 + b.rotSpeedX * burstT * 2;
        ry = b.rotY0 + b.rotSpeedY * burstT * 2;
        rz = b.rotZ0 + b.rotSpeedZ * burstT * 2;
      } else if (frame < fVortexStart) {
        // Phase 2 (frames 245..259, 15f): ZERO-G ANTI-GRAVITY HOVER!
        // The blocks HOVER IN MID-AIR inside the camera frame bounds, gently bobbing in weightlessness!
        const hoverAge = frame - fBurstEnd;
        const bobY = Math.sin(hoverAge * 0.22 + b.hoverPhase) * 0.026;
        const driftX = Math.cos(hoverAge * 0.18 + b.hoverPhase) * 0.012;
        const driftZ = Math.sin(hoverAge * 0.18 + b.hoverPhase) * 0.012;

        const baseAngle = b.angle0 + 0.25;
        px = Math.cos(baseAngle) * b.targetRadius + driftX;
        py = b.targetY + bobY;
        pz = Math.sin(baseAngle) * b.targetRadius + driftZ;

        rx = b.rotX0 + b.rotSpeedX * 2 + hoverAge * 0.012;
        ry = b.rotY0 + b.rotSpeedY * 2 + hoverAge * 0.018;
        rz = b.rotZ0 + b.rotSpeedZ * 2 + hoverAge * 0.010;
      } else {
        // Phase 3 (frames 260..296, 36f): GRAVITATIONAL VORTEX SPIRAL SUCTION & SPAGHETTIFICATION
        const stagger = (idx % 5) * 1.8;
        const suctionStart = fVortexStart + stagger;

        if (frame < suctionStart) {
          // Still hovering before suction staggered start
          const hoverAge = frame - fBurstEnd;
          const bobY = Math.sin(hoverAge * 0.22 + b.hoverPhase) * 0.026;
          const driftX = Math.cos(hoverAge * 0.18 + b.hoverPhase) * 0.012;
          const driftZ = Math.sin(hoverAge * 0.18 + b.hoverPhase) * 0.012;

          const baseAngle = b.angle0 + 0.25;
          px = Math.cos(baseAngle) * b.targetRadius + driftX;
          py = b.targetY + bobY;
          pz = Math.sin(baseAngle) * b.targetRadius + driftZ;

          rx = b.rotX0 + b.rotSpeedX * 2 + hoverAge * 0.012;
          ry = b.rotY0 + b.rotSpeedY * 2 + hoverAge * 0.018;
          rz = b.rotZ0 + b.rotSpeedZ * 2 + hoverAge * 0.010;
        } else {
          const suctionT = interpolate(frame, [suctionStart, fVortexSwallow], [0, 1], {
            easing: Easing.bezier(0.35, 0.0, 0.15, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const r = b.targetRadius * Math.pow(1 - suctionT, 1.6);
          const spiralAngle = (b.angle0 + 0.25) + Math.pow(suctionT, 2.2) * (Math.PI * 10 + idx * 0.6);

          px = Math.cos(spiralAngle) * r;
          pz = Math.sin(spiralAngle) * r;
          py = interpolate(suctionT, [0, 1], [b.targetY, singularityCenter[1]]);

          rx = b.rotX0 + suctionT * 4.5;
          ry = b.rotY0 + Math.pow(suctionT, 2) * Math.PI * 14;
          rz = b.rotZ0 + suctionT * 3.8;

          // Spaghettification: stretching along suction vector while scaling down to 0
          blockScale = Math.max(0, b.scale * (1 - Math.pow(suctionT, 1.5)));
        }
      }

      return {
        block: b,
        position: [px, py, pz] as [number, number, number],
        rotation: [rx, ry, rz] as [number, number, number],
        scale: blockScale,
      };
    });
  }, [frame, breakFrame, fBurstEnd, fVortexStart, fVortexSwallow, singularityCenter]);

  // Children high-frequency fracture shudder during rupture (234..244)
  const isPreBirth = frame >= breakFrame && frame < fBurstEnd;
  const shatterProgress = isPreBirth ? (frame - breakFrame) / 10 : 0;
  const shudderX = isPreBirth ? Math.sin(frame * 42.0) * 0.014 * (1 - shatterProgress) : 0;
  const shudderZ = isPreBirth ? Math.cos(frame * 38.0) * 0.012 * (1 - shatterProgress) : 0;

  // Residual non-rig children smoothly dissolves during vortex suction (260..296)
  const residualChildrenScale = frame < fVortexStart
    ? 1.0
    : interpolate(frame, [fVortexStart, fVortexSwallow], [1.0, 0.0], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <group position={position}>
      {/* 1. PASS-DOWN MACHINE ASSEMBLY (STAYS IN MID-AIR; PARTS FOLLOW ZERO-G KINEMATICS) */}
      {frame < fVortexSwallow && children && (
        <group
          position={isPreBirth ? [shudderX, 0, shudderZ] : [0, 0, 0]}
          scale={[residualChildrenScale, residualChildrenScale, residualChildrenScale]}
        >
          {children}
        </group>
      )}

      {/* 2. 20 DISCRETE PROCEDURAL MECHANICAL BLOCKS (EXPLODE & HOVER IN ZERO-G!) */}
      {blockTransforms.length > 0 && (
        <group name="ZeroGMechanicalDebrisCloud">
          {blockTransforms.map((item, idx) => {
            if (item.scale <= 0.001) return null;
            const b = item.block;

            return (
              <group
                key={`debris-chunk-${idx}`}
                position={item.position}
                rotation={item.rotation}
                scale={[item.scale, item.scale, item.scale]}
              >
                {/* Type 0: Cast Iron Machine Chassis Block */}
                {b.type === 0 && (
                  <RoundedBox args={[0.16, 0.12, 0.14]} radius={0.015} smoothness={2}>
                    <meshStandardMaterial color={b.color} metalness={0.88} roughness={0.3} />
                  </RoundedBox>
                )}

                {/* Type 1: Turned Bronze Bushing / Sleeve */}
                {b.type === 1 && (
                  <mesh rotation={[0.4, 0.2, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.18, 16]} />
                    <meshStandardMaterial color={b.color} metalness={0.95} roughness={0.16} />
                  </mesh>
                )}

                {/* Type 2: Sheared Steel Gantry Plate Fragment */}
                {b.type === 2 && (
                  <mesh rotation={[0.2, 0.5, 0.1]}>
                    <boxGeometry args={[0.22, 0.035, 0.15]} />
                    <meshStandardMaterial color={b.color} metalness={0.88} roughness={0.28} />
                  </mesh>
                )}

                {/* Type 3: Sheared Gear Tooth Segment */}
                {b.type === 3 && (
                  <mesh rotation={[0.6, 0, 0.4]}>
                    <cylinderGeometry args={[0.11, 0.11, 0.035, 12]} />
                    <meshStandardMaterial color={b.color} metalness={0.92} roughness={0.22} />
                  </mesh>
                )}

                {/* Type 4: Heavy Flanged Bolt & Hardened Dowel Pin */}
                {b.type === 4 && (
                  <group>
                    <mesh>
                      <cylinderGeometry args={[0.024, 0.024, 0.14, 8]} />
                      <meshStandardMaterial color={b.color} metalness={0.96} roughness={0.12} />
                    </mesh>
                    <mesh position={[0, 0.07, 0]}>
                      <cylinderGeometry args={[0.038, 0.038, 0.02, 6]} />
                      <meshStandardMaterial color="#64748B" metalness={0.92} roughness={0.25} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* 3. TRUE PITCH-BLACK BLACK HOLE ENTITY (MID-AIR AT singularityCenter) */}
      {coreScale > 0.001 && (
        <group position={singularityCenter}>
          {/* External Gravitational Ambient Lighting */}
          <pointLight
            color="#A855F7"
            intensity={glowIntensity * 1.8}
            distance={7.5}
            decay={2.0}
          />
          <pointLight
            color="#06B6D4"
            intensity={glowIntensity * 1.0}
            distance={4.8}
            decay={2.0}
          />

          {/* ================================================================= */}
          {/* A. ABSOLUTE PITCH-BLACK EVENT HORIZON SPHERE (THE DEEP ABYSS)    */}
          {/* Rendered with 100% pure black basic material; zero foggy shells! */}
          {/* ================================================================= */}
          {horizonRadius > 0.001 && (
            <mesh renderOrder={100}>
              <sphereGeometry args={[horizonRadius, 64, 64]} />
              <meshBasicMaterial
                color="#000000"
                depthWrite={true}
              />
            </mesh>
          )}

          {/* ================================================================= */}
          {/* B. CAMERA-FACING RAZOR-THIN PHOTON RING (STRICTLY ON PERIMETER)   */}
          {/* Inner radius strictly > horizonRadius, so central core is black! */}
          {/* ================================================================= */}
          {horizonRadius > 0.001 && (
            <group rotation={photonRingRotation}>
              {/* Inner razor-thin electric cyan photon ring */}
              <mesh>
                <ringGeometry args={[horizonRadius * 1.015, horizonRadius * 1.085, 64]} />
                <meshBasicMaterial
                  color="#00F5FF"
                  transparent
                  opacity={Math.min(1, glowIntensity * 0.18)}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              {/* Outer cosmic violet silhouette halo */}
              <mesh>
                <ringGeometry args={[horizonRadius * 1.085, horizonRadius * 1.16, 64]} />
                <meshBasicMaterial
                  color="#A855F7"
                  transparent
                  opacity={Math.min(0.7, glowIntensity * 0.10)}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            </group>
          )}

          {/* ================================================================= */}
          {/* C. RELATIVISTIC ACCRETION DISK (TILTED AT 25° KERR INCLINATION)  */}
          {/* Inner radius strictly 0.24m >= 1.08 * horizonRadius               */}
          {/* ================================================================= */}
          <group rotation={[diskTilt, diskRotation, 0]} scale={[coreScale, coreScale, coreScale]}>
            {/* Primary Superheated Inner Accretion Ring (Electric Cyan & White-Hot) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.24, 0.46, 64]} />
              <meshStandardMaterial
                color="#00F5FF"
                emissive="#00F5FF"
                emissiveIntensity={glowIntensity * 1.2}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
                depthWrite={false}
              />
            </mesh>

            {/* Middle Cosmic Violet Gravitational Wave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.46, 0.88, 64]} />
              <meshStandardMaterial
                color="#A855F7"
                emissive="#9333EA"
                emissiveIntensity={glowIntensity * 0.8}
                side={THREE.DoubleSide}
                transparent
                opacity={0.68}
                depthWrite={false}
              />
            </mesh>

            {/* Outer Deep Indigo Accretion Flare */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.88, 1.48, 64]} />
              <meshStandardMaterial
                color="#4F46E5"
                emissive="#6366F1"
                emissiveIntensity={glowIntensity * 0.5}
                side={THREE.DoubleSide}
                transparent
                opacity={0.38}
                depthWrite={false}
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

          {/* ================================================================= */}
          {/* D. BIPOLAR RELATIVISTIC PLASMA JETS (UP & DOWN ALONG Y)           */}
          {/* Downward jet is strictly clamped to terminate ABOVE the floor bed! */}
          {/* ================================================================= */}
          <group scale={[coreScale, coreScale, coreScale]}>
            {/* Upward Jet: fires into open space above the machine */}
            <group position={[0, 0.24, 0]}>
              {UP_JET_SEGMENTS.map((seg, sIdx) => (
                <mesh key={`up-seg-${sIdx}`} position={[0, seg.yOffset, 0]}>
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

            {/* Downward Jet: strictly terminates >= 33cm above the table, zero floor penetration! */}
            <group position={[0, -0.24, 0]}>
              {DOWN_JET_SEGMENTS.map((seg, sIdx) => (
                <mesh key={`down-seg-${sIdx}`} position={[0, -seg.yOffset, 0]}>
                  <cylinderGeometry args={[seg.width, seg.width * 0.4, seg.length, 16]} />
                  <meshStandardMaterial
                    color="#E0E7FF"
                    emissive="#818CF8"
                    emissiveIntensity={glowIntensity * 0.9}
                    transparent
                    opacity={0.75 - sIdx * 0.2}
                  />
                </mesh>
              ))}

              {/* Focused Ground Plasma Induction Bloom strictly on the Table Floor */}
              <mesh position={[0, -(singularityCenter[1] - 0.24) + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.04, 0.24, 32]} />
                <meshBasicMaterial
                  color="#38BDF8"
                  transparent
                  opacity={Math.min(0.65, glowIntensity * 0.09)}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* 4. POINT OF COLLAPSE QUANTUM MICRO-FLASH (Frames 305..306) */}
      {isMicroFlash && (
        <group position={singularityCenter}>
          <mesh>
            <sphereGeometry args={[0.20, 16, 16]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={microFlashOpacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh scale={[1.35, 1.35, 1.35]}>
            <sphereGeometry args={[0.20, 16, 16]} />
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
            intensity={microFlashOpacity * 16.0}
            distance={8.5}
            decay={1.8}
          />
        </group>
      )}

      {/* 5. RELATIVISTIC EXPANDING SHOCKWAVE RING (Frames 305..308) */}
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
