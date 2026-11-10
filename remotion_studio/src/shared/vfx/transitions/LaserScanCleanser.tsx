import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { interpolate, Easing } from "remotion";

export interface LaserScanCleanserProps {
  /**
   * Current local frame within the tier or scene timeline.
   */
  localFrame: number;

  /**
   * Frame at which machine overload vibration starts (default: 213).
   * Machine stays 100% whole on the table, trembling under massive strain.
   */
  vibrationStartFrame?: number;

  /**
   * Frame at which the laser ring ignites above the machine (default: 234).
   * Blinding neon cyan & ultramarine circular energy ring flashes into existence at Y ≈ 2.0.
   */
  breakFrame?: number;

  /**
   * Frame at which the cleanser transition ends and fades completely (default: 308).
   * Stage settled, sterile, and ready for next tier docking at frame 320.
   */
  endFrame?: number;

  /**
   * Vertical spatial envelope of the machine being cleansed (in local stage units).
   * minY: platform anvil bed height (default: 0.0, the surface of the stage).
   * maxY: top of the machine structure envelope (default: 2.0).
   */
  bounds?: {
    minY?: number;
    maxY?: number;
  };

  /**
   * Optional manual override for the parent stage's world Y position (default: -2.04).
   * Automatically synchronizes the Three.js hardware clipping plane to the exact visual laser ring.
   */
  stageWorldY?: number;

  /**
   * Frame when the laser sheet begins descending from top (default: 236).
   */
  sweepStartFrame?: number;

  /**
   * Frame when the laser sheet reaches the platform bed (default: 298).
   * Delivers 62 frames (236..298, ~2.0 seconds) of continuous, hypnotic planar laser cutting.
   */
  sweepEndFrame?: number;

  /**
   * 3D group offset position [x, y, z] (default: [0, 0, 0]).
   */
  position?: [number, number, number];

  /**
   * Neon primary laser bloom color (default: "#00F0FF" - High-Voltage Neon Cyan).
   */
  primaryColor?: string;

  /**
   * Secondary laser accent color (default: "#38BDF8" - Electric Sky Blue / Ultramarine).
   */
  secondaryColor?: string;

  /**
   * Searing white core color (default: "#FFFFFF").
   */
  coreColor?: string;

  /**
   * Deep ultramarine / sapphire accent color (default: "#0055FF").
   */
  ultramarineColor?: string;

  /**
   * Total number of deterministic cutting sparks & micro-arcs (default: 320).
   */
  sparkCount?: number;

  /**
   * Whether to enable Three.js hardware clipping planes on child materials (default: true).
   */
  enableClipping?: boolean;

  /**
   * Child 3D elements (the whole machine mechanism).
   */
  children?: React.ReactNode;
}

interface LaserSparkSeed {
  angle: number;
  radius: number;
  ox: number;
  oz: number;
  birthProgress: number;
  birthFrame: number;
  birthY: number; // Fixed emission elevation at birthFrame
  vx: number;
  vy: number; // Downward velocity component
  vz: number;
  lifespan: number;
  baseSize: number;
  sparkType: number; // 0: cutting spark, 1: electric micro-arc, 2: plasma vapor
  arcFreq: number;
  arcPhase: number;
}

// Deterministic pseudo-random generator for frame-exact, repeatable rendering
function deterministicRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const LaserScanCleanser: React.FC<LaserScanCleanserProps> = ({
  localFrame,
  vibrationStartFrame = 213,
  breakFrame = 234,
  endFrame = 308,
  bounds,
  stageWorldY: overrideStageWorldY,
  sweepStartFrame = 236,
  sweepEndFrame = 298,
  position = [0, 0, 0],
  primaryColor = "#00F0FF",
  secondaryColor = "#38BDF8",
  coreColor = "#FFFFFF",
  ultramarineColor = "#0055FF",
  sparkCount = 320,
  enableClipping = true,
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // Enable hardware local clipping on WebGLRenderer
  useLayoutEffect(() => {
    if (gl && !gl.localClippingEnabled) {
      gl.localClippingEnabled = true;
    }
  }, [gl]);

  // Synchronously determine parent stage world Y offset (default: -2.04 in universal testing bay datum)
  let parentWorldY = overrideStageWorldY ?? -2.04;
  if (overrideStageWorldY === undefined && groupRef.current && groupRef.current.parent) {
    const worldVec = new THREE.Vector3();
    groupRef.current.parent.getWorldPosition(worldVec);
    parentWorldY = worldVec.y;
  }

  // 1. BOUNDS RESOLUTION (Local coordinates inside the stage group)
  // In all stage compositions (PressStage, CrusherStage, DrillStage, etc.), the stage is mounted at Y = -2.04.
  // The local stanina / bolster table surface is at local Y = 0.0, and the top of the machine envelope is at local Y = 2.0.
  const rawMinY = bounds?.minY;
  const rawMaxY = bounds?.maxY ?? 2.0;

  // If a caller passes minY = -2.04 intending the stanina in world coordinates, but the stage is already
  // offset by -2.04, the local stanina is at Y = 0.0:
  const isStageOffset = Math.abs(parentWorldY - -2.04) < 0.2;
  const minY = rawMinY !== undefined ? (rawMinY === -2.04 && isStageOffset ? 0.0 : rawMinY) : 0.0;
  const maxY = rawMaxY;

  // Exact timing intervals:
  // 213..233: Overload vibration shudder (machine whole, trembling on table)
  // 234..235: Blinding laser ring ignites at Y ≈ 2.0 above machine
  // 236..298: 62 frames of continuous, hypnotic downward laser slicing
  // 299..304: Laser hits the stanina bed with a brilliant final contact flash
  // 305..308: Laser ring collapses inward and extinguishes
  // 308..319: Pristine, clean empty table (returns null)
  const vibrationStart = vibrationStartFrame;
  const sweepStart = sweepStartFrame;
  const sweepEnd = sweepEndFrame;

  // Post-transition: stage is completely sterile and clear (308..319+)
  if (localFrame >= endFrame) {
    return null;
  }

  // Pre-vibration: render intact machine without any overhead or interference
  if (localFrame < vibrationStart) {
    return <group position={position}>{children}</group>;
  }

  // --- KINEMATICS & TIMING PHASES ---
  const isVibrating = localFrame >= vibrationStart && localFrame < breakFrame; // 213..233
  const isIgniting = localFrame >= breakFrame && localFrame < sweepStart;      // 234..235
  const isSweeping = localFrame >= sweepStart && localFrame <= sweepEnd;       // 236..298 (62 frames)
  const isImpact = localFrame > sweepEnd && localFrame <= 304;                 // 299..304 (Bed contact flash)
  const isCollapsing = localFrame >= 305 && localFrame < endFrame;             // 305..307 (Ring collapse)

  // 1. Overload vibration tremors (213..233)
  const vibrationProgress = isVibrating
    ? interpolate(localFrame, [vibrationStart, breakFrame], [0, 1], {
        easing: Easing.in(Easing.quad),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const jitterX = isVibrating
    ? Math.sin(localFrame * 48.0) * 0.007 * vibrationProgress
    : 0;
  const jitterY = isVibrating
    ? Math.cos(localFrame * 56.0) * 0.004 * vibrationProgress
    : 0;
  const jitterZ = isVibrating
    ? Math.sin(localFrame * 42.0 + 1.2) * 0.006 * vibrationProgress
    : 0;

  // 2. Normalized sweep progress 0 -> 1 over frames 236..298 (62 frames)
  const sweepProgress = interpolate(localFrame, [sweepStart, sweepEnd], [0, 1], {
    easing: Easing.bezier(0.25, 0.05, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Current Y elevation of the descending horizontal laser sheet (local space)
  const currentLaserY = interpolate(sweepProgress, [0, 1], [maxY, minY]);

  // 3. Ring ignition expansion at frame 234..235
  const ignitionProgress = isIgniting
    ? interpolate(localFrame, [breakFrame, sweepStart], [0, 1], {
        easing: Easing.out(Easing.quad),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // 4. Ring collapse at frame 305..308
  const collapseProgress = isCollapsing
    ? interpolate(localFrame, [305, endFrame], [0, 1], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const ringScale = isIgniting
    ? Math.min(1.0, 0.2 + ignitionProgress * 0.8)
    : isCollapsing
    ? Math.max(0.001, 1 - collapseProgress)
    : 1.0;

  const ringAlpha = isCollapsing ? Math.max(0, 1 - collapseProgress * 1.5) : 1.0;

  // 5. Floor impact flash & sterilizing shockwave (299..304)
  const impactProgress = interpolate(localFrame, [sweepEnd, 305], [0, 1], {
    easing: Easing.bezier(0.12, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const impactAlpha = Math.max(0, 1 - Math.pow(impactProgress, 1.2));

  // --- 2. HARDWARE CLIPPING PLANE SYNCHRONIZATION ---
  // In Three.js, clipping planes are evaluated in WORLD space!
  // Normal is [0, -1, 0]: dot([0, -1, 0], worldPoint) + constant >= 0 <=> worldPoint.y <= constant.
  // Since a mesh inside the stage has worldPoint.y = localPoint.y + parentWorldY:
  // localPoint.y + parentWorldY <= constant <=> localPoint.y <= constant - parentWorldY.
  // We want geometry ABOVE the laser to be sliced away (localPoint.y <= currentLaserY).
  // Therefore: constant = currentLaserY + parentWorldY!
  const planeWorldConstant = isSweeping ? currentLaserY + parentWorldY : maxY + 10.0;
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), planeWorldConstant),
    [planeWorldConstant]
  );

  // Attach clipping plane to child mesh materials during active sweep
  useLayoutEffect(() => {
    const currentGroup = groupRef.current;
    if (!currentGroup || !enableClipping) return;

    const activePlanes = isSweeping ? [plane] : [];

    currentGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.clippingPlanes = activePlanes;
              mat.clipIntersection = false;
              mat.needsUpdate = true;
            });
          } else {
            mesh.material.clippingPlanes = activePlanes;
            mesh.material.clipIntersection = false;
            mesh.material.needsUpdate = true;
          }
        }
      }
    });

    return () => {
      if (currentGroup) {
        currentGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  mat.clippingPlanes = [];
                });
              } else {
                mesh.material.clippingPlanes = [];
              }
            }
          }
        });
      }
    };
  }, [isSweeping, plane, enableClipping]);

  // Machine geometry is visible up to sweepEnd (frame 298).
  // Past frame 298, it is completely vaporized (0 ghost meshes!).
  const showMachineGeometry = localFrame <= sweepEnd;

  // --- 3. DETERMINISTIC CUTTING SPARKS WITH ANCHORED BIRTH & DOWNWARD BALLISTICS ---
  const sparkSeeds = useMemo<LaserSparkSeed[]>(() => {
    const list: LaserSparkSeed[] = [];
    const sweepDur = Math.max(1, sweepEnd - sweepStart);

    for (let i = 0; i < sparkCount; i++) {
      const r1 = deterministicRandom(i * 7 + 1);
      const r2 = deterministicRandom(i * 11 + 2);
      const r3 = deterministicRandom(i * 13 + 3);
      const r4 = deterministicRandom(i * 17 + 4);
      const r5 = deterministicRandom(i * 19 + 5);
      const r6 = deterministicRandom(i * 23 + 6);

      // Stagger birth frame along the downward laser path (frames 236..298)
      const birthProgress = 0.02 + r1 * 0.96;
      const birthFrame = sweepStart + Math.floor(birthProgress * sweepDur);

      // Anchor birth elevation permanently to the laser plane elevation at emission moment
      const birthY = interpolate(birthProgress, [0, 1], [maxY, minY]);

      // Cutting perimeter coordinate distribution (covers press column envelope)
      const angle = r2 * Math.PI * 2;
      const radius = 0.35 + r3 * 0.48;
      const ox = Math.cos(angle) * radius;
      const oz = Math.sin(angle) * radius;

      // Kerf tangential vector: (-sin(angle), cos(angle))
      const tangentSign = r4 < 0.5 ? -1 : 1;
      const tangentX = -Math.sin(angle) * tangentSign;
      const tangentZ = Math.cos(angle) * tangentSign;

      // Kerf radial outward vector
      const radialX = Math.cos(angle);
      const radialZ = Math.sin(angle);

      // High-velocity tangential spray along the kerf (70%) + radial expansion (30%)
      const speedTangential = 2.4 + r5 * 3.6; // 2.4 .. 6.0 m/s
      const speedRadial = 0.6 + r3 * 1.4;     // 0.6 .. 2.0 m/s
      const vx = tangentX * speedTangential + radialX * speedRadial;
      const vz = tangentZ * speedTangential + radialZ * speedRadial;

      // Strictly downward velocity through the kerf: vy = 1.0 .. 3.2 m/s downward
      const vy = 1.0 + r6 * 2.2;

      const lifespan = 7 + Math.floor(r3 * 12); // 7 to 19 frames
      const baseSize = 0.042 + r4 * 0.048;

      // 0: 70% incandescent cutting sparks, 1: 20% electric micro-arcs, 2: 10% plasma puffs
      const sparkType = r5 < 0.7 ? 0 : r5 < 0.9 ? 1 : 2;
      const arcFreq = 2.5 + r2 * 4.0;
      const arcPhase = r1 * Math.PI * 2;

      list.push({
        angle,
        radius,
        ox,
        oz,
        birthProgress,
        birthFrame,
        birthY,
        vx,
        vy,
        vz,
        lifespan,
        baseSize,
        sparkType,
        arcFreq,
        arcPhase,
      });
    }
    return list;
  }, [sparkCount, sweepStart, sweepEnd, minY, maxY]);

  // Compute dynamic point cloud buffer attributes for current frame
  const { sparkPositions, sparkColors, sparkSizes, activeSparkCount } =
    useMemo(() => {
      const posArr = new Float32Array(sparkCount * 3);
      const colArr = new Float32Array(sparkCount * 3);
      const sizeArr = new Float32Array(sparkCount);

      let active = 0;

      for (let i = 0; i < sparkSeeds.length; i++) {
        const s = sparkSeeds[i];

        if (localFrame < s.birthFrame || localFrame > s.birthFrame + s.lifespan) {
          posArr[i * 3] = 0;
          posArr[i * 3 + 1] = -999;
          posArr[i * 3 + 2] = 0;
          colArr[i * 3] = 0;
          colArr[i * 3 + 1] = 0;
          colArr[i * 3 + 2] = 0;
          sizeArr[i] = 0;
          continue;
        }

        const age = localFrame - s.birthFrame;
        const t = age / s.lifespan; // 0 -> 1
        active++;

        const dt = age;

        // Tangential & radial horizontal spray with aerodynamic drag
        const drag = Math.exp(-dt * 0.065);
        let curX = s.ox + s.vx * dt * 0.042 * drag;
        let curZ = s.oz + s.vz * dt * 0.042 * drag;

        // Downward parabolic ballistics from anchored birth elevation:
        // y(t) = birthY - v_y * t - 0.5 * g * t^2 (NO emitter leash!)
        const gravity = 0.0042;
        let curY = s.birthY - s.vy * dt * 0.048 - 0.5 * gravity * dt * dt;

        // Anvil platform floor collision & sliding friction at local minY
        if (curY <= minY + 0.008) {
          curY = minY + 0.008;
          curX = s.ox + s.vx * dt * 0.022;
          curZ = s.oz + s.vz * dt * 0.022;
        }

        // Electric micro-arc high-frequency lateral jitter
        if (s.sparkType === 1) {
          const jitterAmp = 0.034 * (1 - t);
          curX += Math.sin(dt * s.arcFreq + s.arcPhase) * jitterAmp;
          curZ += Math.cos(dt * s.arcFreq * 1.3 + s.arcPhase) * jitterAmp;
        }

        posArr[i * 3] = curX;
        posArr[i * 3 + 1] = curY;
        posArr[i * 3 + 2] = curZ;

        // Thermal color dissipation:
        // White-hot core -> Electric Neon Cyan (#00F0FF) -> Sky Blue (#38BDF8) -> Indigo (#6366F1)
        const fade = Math.max(0, 1 - Math.pow(t, 1.4));
        let r = 1.0;
        let g = 1.0;
        let b = 1.0;

        if (t < 0.2) {
          r = 1.0;
          g = 1.0;
          b = 1.0;
        } else if (t < 0.6) {
          const tMid = (t - 0.2) / 0.4;
          r = 1.0 - tMid * 1.0; // 1.0 -> 0.0
          g = 1.0 - tMid * 0.06; // 1.0 -> 0.94
          b = 1.0;
        } else {
          const tCool = (t - 0.6) / 0.4;
          r = tCool * 0.38;
          g = 0.94 - tCool * 0.54;
          b = 1.0 - tCool * 0.05;
        }

        colArr[i * 3] = r * fade;
        colArr[i * 3 + 1] = g * fade;
        colArr[i * 3 + 2] = b * fade;

        if (s.sparkType === 2) {
          sizeArr[i] = s.baseSize * (1 + t * 1.8) * fade;
        } else {
          sizeArr[i] = s.baseSize * (1 - t * 0.7) * fade;
        }
      }

      return {
        sparkPositions: posArr,
        sparkColors: colArr,
        sparkSizes: sizeArr,
        activeSparkCount: active,
      };
    }, [sparkSeeds, localFrame, sparkCount, minY]);

  // --- 4. HIGH-VOLTAGE ELECTRIC MICRO-ARCS (LineSegments) ---
  const { arcPositions, arcOpacity } = useMemo(() => {
    if (!isSweeping) {
      return { arcPositions: new Float32Array(0), arcOpacity: 0 };
    }

    const arcCount = 12;
    const positions = new Float32Array(arcCount * 2 * 3);

    for (let a = 0; a < arcCount; a++) {
      const seedA = deterministicRandom(localFrame * 31 + a * 17);
      const seedB = deterministicRandom(localFrame * 43 + a * 19);
      const angle1 = seedA * Math.PI * 2;
      const r1 = 0.4 + seedB * 0.48;

      const angle2 = angle1 + 0.32 + (seedB - 0.5) * 0.55;
      const r2 = 0.4 + seedA * 0.48;

      const x1 = Math.cos(angle1) * r1;
      const z1 = Math.sin(angle1) * r1;
      const y1 = currentLaserY + (seedA - 0.5) * 0.02;

      const x2 = Math.cos(angle2) * r2;
      const z2 = Math.sin(angle2) * r2;
      const y2 = currentLaserY + (seedB - 0.5) * 0.02;

      const idx = a * 6;
      positions[idx] = x1;
      positions[idx + 1] = y1;
      positions[idx + 2] = z1;

      positions[idx + 3] = x2;
      positions[idx + 4] = y2;
      positions[idx + 5] = z2;
    }

    const flicker = 0.55 + deterministicRandom(localFrame * 13) * 0.45;
    return { arcPositions: positions, arcOpacity: flicker };
  }, [localFrame, isSweeping, currentLaserY]);

  // --- 5. DYNAMIC PHOTONIC LIGHTING ---
  const laserLightIntensity = useMemo(() => {
    if (localFrame < vibrationStart) return 0;

    // Overload vibration warning glow
    if (isVibrating) {
      return Math.sin(localFrame * 12.0) * 1.5 * vibrationProgress;
    }

    // Laser ring ignition burst at Y ≈ 2.0 (frame 234)
    if (isIgniting) {
      return 22.0 * ignitionProgress;
    }

    // Active continuous slicing hum (236..298)
    if (isSweeping) {
      const hum = Math.sin(localFrame * 38.0) * 1.8;
      return 14.0 + hum;
    }

    // Blinding floor impact spike at frame 299
    if (localFrame === sweepEnd + 1) {
      return 24.0;
    }

    // Decay of floor impact flash
    if (isImpact) {
      const decayProgress = (localFrame - sweepEnd) / (305 - sweepEnd);
      return Math.max(0, 20.0 * Math.pow(1 - decayProgress, 2.2));
    }

    // Ring collapse glow
    if (isCollapsing) {
      return Math.max(0, 4.0 * (1 - collapseProgress));
    }

    return 0;
  }, [
    localFrame,
    vibrationStart,
    isVibrating,
    vibrationProgress,
    isIgniting,
    ignitionProgress,
    isSweeping,
    sweepEnd,
    isImpact,
    isCollapsing,
    collapseProgress,
  ]);

  // Floor uplight intensity growing as laser descends closer to the anvil
  const floorGlowIntensity = useMemo(() => {
    if (isSweeping) {
      return sweepProgress * 6.5;
    }
    if (isImpact) {
      return impactAlpha * 8.5;
    }
    return 0;
  }, [isSweeping, sweepProgress, isImpact, impactAlpha]);

  // Tron scanning grid rotation
  const scanRotation = localFrame * 0.085;

  return (
    <group position={position}>
      {/* ========================================================= */}
      {/* 1. DYNAMIC PHOTONIC LIGHT SOURCES                         */}
      {/* ========================================================= */}
      {laserLightIntensity > 0.05 && (
        <pointLight
          position={[0, isSweeping ? currentLaserY + 0.06 : isIgniting ? maxY : minY + 0.12, 0]}
          color={isVibrating ? "#EF4444" : primaryColor}
          intensity={laserLightIntensity}
          distance={8.0}
          decay={2}
        />
      )}

      {floorGlowIntensity > 0.05 && (
        <pointLight
          position={[0, minY + 0.08, 0]}
          color={secondaryColor}
          intensity={floorGlowIntensity}
          distance={5.5}
          decay={2}
        />
      )}

      {/* ========================================================= */}
      {/* 2. INTACT MACHINE GEOMETRY WITH CLIPPING & VIBRATION     */}
      {/* ========================================================= */}
      {showMachineGeometry && (
        <group
          ref={groupRef}
          position={[jitterX, jitterY, jitterZ]}
        >
          {children}
        </group>
      )}

      {/* ========================================================= */}
      {/* 3. LASER RING IGNITION & CUTTING BLADE SHEET (234..308)   */}
      {/* ========================================================= */}
      {(isIgniting || isSweeping || isCollapsing) && (
        <group
          position={[0, isIgniting ? maxY : currentLaserY, 0]}
          scale={[ringScale, 1, ringScale]}
        >
          {/* A. Searing Molten Metal Severance Cap (Additive Translucent Plasma Slice) */}
          {isSweeping && (
            <mesh position={[0, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.48, 36]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={0.55 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Secondary Molten Cyan Glow Disc */}
          {isSweeping && (
            <mesh position={[0, -0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.78, 36]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.32 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* B. Primary Neon Cyan Laser Cutting Edge Ribbon */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.02, 1.44, 48]} />
            <meshBasicMaterial
              color={primaryColor}
              transparent
              opacity={0.72 * ringAlpha}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* C. Blinding White-Hot Razor Cutting Core Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.38, 1.44, 48]} />
            <meshBasicMaterial
              color={coreColor}
              transparent
              opacity={0.98 * ringAlpha}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* D. Deep Ultramarine & Electric Blue Blooming Outer Halo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.44, 1.64, 48]} />
            <meshBasicMaterial
              color={ultramarineColor}
              transparent
              opacity={0.52 * ringAlpha}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* E. Holographic Tron CAD Scanner Grid & Radar Sweep */}
          <group rotation={[0, scanRotation, 0]}>
            {/* Concentric Scan Rings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.44, 0.455, 36]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.55 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.91, 0.925, 40]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.48 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Rotating Crosshair Axis Spokes */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.88, 0.012]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.65 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.012, 2.88]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.65 * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>

          {/* F. Volumetric Ionization Vapor Plasma Curtain (Trailing Upwards) */}
          {isSweeping && (
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[1.44, 1.48, 0.32, 36, 1, true]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.24 * (1 - sweepProgress * 0.4) * ringAlpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ========================================================= */}
      {/* 4. HIGH-VOLTAGE ELECTRIC MICRO-ARCS (LineSegments)        */}
      {/* ========================================================= */}
      {arcPositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={arcPositions.length / 3}
              array={arcPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={coreColor}
            transparent
            opacity={arcOpacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* ========================================================= */}
      {/* 5. INCANDESCENT CUTTING SPARKS CASCADE (Points)           */}
      {/* ========================================================= */}
      {activeSparkCount > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkCount}
              array={sparkPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={sparkCount}
              array={sparkColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}

      {/* ========================================================= */}
      {/* 6. PLATFORM BED IMPACT & STERILIZING SHOCKWAVE (299..305)  */}
      {/* ========================================================= */}
      {isImpact && (
        <group position={[0, minY, 0]}>
          {/* A. Primary Fast-Expanding Neon Cyan Shockwave Ring */}
          {(() => {
            const r1 = 0.15 + impactProgress * 2.85;
            const w1 = 0.065 * (1 - impactProgress * 0.4);
            return (
              <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[Math.max(0.01, r1 - w1), r1 + w1, 64]} />
                <meshBasicMaterial
                  color={primaryColor}
                  transparent
                  opacity={impactAlpha * 0.95}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })()}

          {/* B. Secondary Trailing Compression Shockwave Ring */}
          {(() => {
            const r2 = 0.08 + Math.pow(impactProgress, 0.85) * 2.25;
            const w2 = 0.08 * (1 - impactProgress * 0.5);
            return (
              <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[Math.max(0.01, r2 - w2), r2 + w2, 48]} />
                <meshBasicMaterial
                  color={secondaryColor}
                  transparent
                  opacity={impactAlpha * 0.58}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })()}

          {/* C. Holographic Floor CAD Coordinate Calibration Grid */}
          {[0.45, 0.95, 1.45, 1.95].map((rTarget, k) => {
            const currentR = 0.15 + impactProgress * 2.85;
            const dist = Math.abs(currentR - rTarget);
            const gridFlash = Math.max(0, 1 - dist * 3.0) * impactAlpha;

            if (gridFlash < 0.02) return null;

            return (
              <mesh
                key={k}
                position={[0, 0.003, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[rTarget - 0.008, rTarget + 0.008, 48]} />
                <meshBasicMaterial
                  color={primaryColor}
                  transparent
                  opacity={gridFlash * 0.72}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            );
          })}

          {/* 4 Radial Precision Floor Calibration Crosshair Axes */}
          <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2, 0.008]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={impactAlpha * 0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.008, 4.2]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={impactAlpha * 0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* D. Sterile Mirror Anvil Sheen (Reflective Finish) */}
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry
              args={[Math.min(2.4, 0.2 + impactProgress * 2.4), 48]}
            />
            <meshBasicMaterial
              color="#E0F2FE"
              transparent
              opacity={impactAlpha * 0.38}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* E. Instantaneous Floor Contact Photonic Core Flash */}
          {localFrame <= sweepEnd + 4 && (
            <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry
                args={[
                  Math.max(0.01, 0.45 * (1 - (localFrame - sweepEnd) / 4)),
                  32,
                ]}
              />
              <meshBasicMaterial
                color={coreColor}
                transparent
                opacity={1 - (localFrame - sweepEnd) / 4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

export default LaserScanCleanser;
