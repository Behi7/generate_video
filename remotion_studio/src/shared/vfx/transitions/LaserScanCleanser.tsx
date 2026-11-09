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
   * Frame at which machine fracture occurs (default: 234).
   * Between breakFrame and sweepStartFrame (234..243), pre-sweep charging & optics calibration occurs.
   */
  breakFrame?: number;

  /**
   * Frame at which the cleanser transition ends and fades completely (default: 308).
   * Stage settled, sterile, and ready for next tier docking at frame 320.
   */
  endFrame?: number;

  /**
   * Vertical spatial envelope of the machine being cleansed (in world/stage units).
   * minY: platform anvil bed height (default: -2.04, standard universal action bay datum).
   * maxY: top of the machine structure envelope (default: 1.8).
   */
  bounds?: {
    minY?: number;
    maxY?: number;
  };

  /**
   * Optional frame when the laser sheet begins descending (default: 244).
   */
  sweepStartFrame?: number;

  /**
   * Optional frame when the laser sheet reaches the platform bed (default: 300).
   * Delivers 56 frames (244..300) of continuous, hypnotic planar laser cutting.
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
   * Secondary laser accent color (default: "#38BDF8" - Electric Sky Blue).
   */
  secondaryColor?: string;

  /**
   * Searing white core color (default: "#FFFFFF").
   */
  coreColor?: string;

  /**
   * Total number of deterministic cutting sparks & micro-arcs (default: 320).
   */
  sparkCount?: number;

  /**
   * Whether to enable Three.js hardware clipping planes on child materials (default: true).
   */
  enableClipping?: boolean;

  /**
   * Child 3D elements (the machine mechanism or fractured parts).
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
  breakFrame = 234,
  endFrame = 308,
  bounds,
  sweepStartFrame = 244,
  sweepEndFrame = 300,
  position = [0, 0, 0],
  primaryColor = "#00F0FF",
  secondaryColor = "#38BDF8",
  coreColor = "#FFFFFF",
  sparkCount = 320,
  enableClipping = true,
  children,
}) => {
  // 1. UNIVERSAL ACTION BAY DATUM BOUNDS
  const minY = bounds?.minY ?? -2.04;
  const maxY = bounds?.maxY ?? 1.8;

  const totalDuration = Math.max(1, endFrame - breakFrame);
  const sweepStart =
    sweepStartFrame ??
    (breakFrame + Math.max(2, Math.round(totalDuration * 0.135))); // 234 + 10 = 244
  const sweepEnd =
    sweepEndFrame ??
    (breakFrame + Math.max(8, Math.round(totalDuration * 0.89))); // 234 + 66 = 300

  // Post-transition: stage is completely sterile and clear (308..319+)
  if (localFrame >= endFrame) {
    return null;
  }

  // Pre-break: render intact machine without any overhead or interference
  if (localFrame < breakFrame) {
    return <group position={position}>{children}</group>;
  }

  // --- SWEEP KINEMATICS & TIMING PHASES (234..308) ---
  const isPreSweep = localFrame >= breakFrame && localFrame < sweepStart; // 234..243
  const isSweeping = localFrame >= sweepStart && localFrame <= sweepEnd;  // 244..300 (56 frames)
  const isPostSweep = localFrame > sweepEnd && localFrame < endFrame;    // 301..307 (Floor impact & sterilizing flash)

  // Normalized sweep progress 0 -> 1 over frames 280..305
  const sweepProgress = interpolate(localFrame, [sweepStart, sweepEnd], [0, 1], {
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Current Y elevation of the descending horizontal laser sheet
  const currentLaserY = interpolate(sweepProgress, [0, 1], [maxY, minY]);

  // Pre-sweep charging progression (275..279)
  const preSweepProgress = interpolate(localFrame, [breakFrame, sweepStart], [0, 1], {
    easing: Easing.bezier(0.1, 0.8, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pre-sweep structural fracture vibration
  const preSweepJitter = isPreSweep
    ? Math.sin((localFrame - breakFrame) * 28.0) * 0.007 * preSweepProgress
    : 0;

  // Floor sterilizing shockwave progression (305..315)
  const impactProgress = interpolate(localFrame, [sweepEnd, endFrame], [0, 1], {
    easing: Easing.bezier(0.12, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const impactAlpha = Math.max(0, 1 - Math.pow(impactProgress, 1.25));

  // --- 2. TRUE THREE.JS CLIPPING PLANE FOR GEOMETRY SLICING (NO SQUASHING) ---
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // Enable hardware local clipping on WebGLRenderer
  useLayoutEffect(() => {
    if (gl && !gl.localClippingEnabled) {
      gl.localClippingEnabled = true;
    }
  }, [gl]);

  // Three.js clipping plane: normal pointing down (0, -1, 0).
  // Formula: -y + constant >= 0 => y <= constant.
  // Points with y <= currentLaserY are kept; points with y > currentLaserY are cleanly sliced away.
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), currentLaserY),
    [currentLaserY]
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

  // Machine geometry is visible up to sweepEnd (frame 305).
  // Past frame 305, it is completely vaporized.
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

      // Stagger birth frame along the downward laser path
      const birthProgress = 0.02 + r1 * 0.96;
      const birthFrame = sweepStart + Math.floor(birthProgress * sweepDur);

      // FIX: Anchor birth elevation permanently to the laser plane elevation at emission moment
      const birthY = interpolate(birthProgress, [0, 1], [maxY, minY]);

      // Cutting perimeter coordinate distribution
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
      const speedTangential = 2.2 + r5 * 3.4; // 2.2 .. 5.6 m/s
      const speedRadial = 0.6 + r3 * 1.2;     // 0.6 .. 1.8 m/s
      const vx = tangentX * speedTangential + radialX * speedRadial;
      const vz = tangentZ * speedTangential + radialZ * speedRadial;

      // FIX: Direct velocity downward through the kerf: vy = 0.9 .. 2.8 m/s downward
      const vy = 0.9 + r6 * 1.9;

      const lifespan = 7 + Math.floor(r3 * 11); // 7 to 18 frames
      const baseSize = 0.04 + r4 * 0.045;

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

        // FIX: Downward parabolic ballistics from anchored birth elevation:
        // y(t) = birthY - v_y * t - 0.5 * g * t^2 (NO emitter leash!)
        const gravity = 0.0042;
        let curY = s.birthY - s.vy * dt * 0.048 - 0.5 * gravity * dt * dt;

        // Anvil platform floor collision & sliding friction
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

  // --- 4. HIGH-VOLTAGE ELECTRIC MICRO-ARC FILAMENTS (LineSegments) ---
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
      const r1 = 0.4 + seedB * 0.45;

      const angle2 = angle1 + 0.32 + (seedB - 0.5) * 0.55;
      const r2 = 0.4 + seedA * 0.45;

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

  // --- 5. DYNAMIC HIGH-INTENSITY PHOTONIC LIGHTING ---
  const laserLightIntensity = useMemo(() => {
    if (localFrame < breakFrame) return 0;

    if (isPreSweep) {
      return preSweepProgress * 4.5;
    }

    if (isSweeping) {
      // Rapid photonic resonance hum (12.0 .. 15.0)
      const hum = Math.sin(localFrame * 38.0) * 1.8;
      return 13.5 + hum;
    }

    if (localFrame === sweepEnd) {
      // Blinding floor impact spike at frame 305
      return 24.0;
    }

    if (isPostSweep) {
      // Exponential decay of contact flash
      const decayProgress = (localFrame - sweepEnd) / (endFrame - sweepEnd);
      return Math.max(0, 20.0 * Math.pow(1 - decayProgress, 2.2));
    }

    return 0;
  }, [
    localFrame,
    breakFrame,
    isPreSweep,
    preSweepProgress,
    isSweeping,
    sweepEnd,
    isPostSweep,
    endFrame,
  ]);

  // Floor uplight intensity growing as laser descends closer to the anvil
  const floorGlowIntensity = useMemo(() => {
    if (isSweeping) {
      return sweepProgress * 6.5;
    }
    if (isPostSweep) {
      return impactAlpha * 8.0;
    }
    return 0;
  }, [isSweeping, sweepProgress, isPostSweep, impactAlpha]);

  // Tron scanning grid rotation
  const scanRotation = localFrame * 0.085;

  return (
    <group position={position}>
      {/* ========================================================= */}
      {/* 1. DYNAMIC VOLUMETRIC PHOTONIC LIGHT SOURCES              */}
      {/* ========================================================= */}
      {laserLightIntensity > 0.05 && (
        <pointLight
          position={[0, isSweeping ? currentLaserY + 0.06 : minY + 0.12, 0]}
          color={primaryColor}
          intensity={laserLightIntensity}
          distance={7.5}
          decay={2}
        />
      )}

      {floorGlowIntensity > 0.05 && (
        <pointLight
          position={[0, minY + 0.08, 0]}
          color={secondaryColor}
          intensity={floorGlowIntensity}
          distance={5.2}
          decay={2}
        />
      )}

      {/* ========================================================= */}
      {/* 2. PRE-SWEEP OPTICS & TOP EMITTER GANTRY (Frames 275..305) */}
      {/* ========================================================= */}
      {(isPreSweep || isSweeping) && (
        <group position={[0, maxY + 0.16, 0]}>
          {/* 4 Precision Anodized Corner Projector Nozzles */}
          {[
            [0.85, 0.85],
            [-0.85, 0.85],
            [0.85, -0.85],
            [-0.85, -0.85],
          ].map(([nx, nz], idx) => {
            const beamTargetY = isSweeping
              ? currentLaserY - (maxY + 0.16)
              : -(maxY + 0.16 - minY);
            const beamHeight = Math.abs(beamTargetY);

            return (
              <group key={idx} position={[nx, 0, nz]}>
                {/* Dark Anodized Emitter Housing */}
                <mesh>
                  <cylinderGeometry args={[0.045, 0.055, 0.1, 16]} />
                  <meshStandardMaterial
                    color="#0F172A"
                    roughness={0.25}
                    metalness={0.9}
                  />
                </mesh>

                {/* Blinding Cyan Focal Lens Ring */}
                <mesh position={[0, -0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.015, 0.04, 16]} />
                  <meshBasicMaterial
                    color={primaryColor}
                    transparent
                    opacity={isPreSweep ? preSweepProgress : 0.95}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>

                {/* Vertical Optical Guide Beam */}
                <mesh position={[0, beamTargetY * 0.5, 0]}>
                  <cylinderGeometry args={[0.003, 0.003, beamHeight, 8]} />
                  <meshBasicMaterial
                    color={primaryColor}
                    transparent
                    opacity={isPreSweep ? preSweepProgress * 0.45 : 0.75}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* ========================================================= */}
      {/* 3. MACHINE GEOMETRY WITH HARDWARE CLIPPING (NO SQUASH)    */}
      {/* ========================================================= */}
      {showMachineGeometry && (
        <group
          ref={groupRef}
          position={[preSweepJitter, 0, preSweepJitter * 0.5]}
        >
          {children}
        </group>
      )}

      {/* ========================================================= */}
      {/* 4. DESCENDING HORIZONTAL LASER BLADE & LIGHT SHEET (280..305) */}
      {/* ========================================================= */}
      {isSweeping && (
        <group position={[0, currentLaserY, 0]}>
          {/* A. Searing Molten Metal Severance Cap (Cross-section incandescence) */}
          <mesh
            position={[0, -0.006, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.74, 36]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={primaryColor}
              emissiveIntensity={8.5 + Math.sin(localFrame * 22.0) * 2.0}
              roughness={0.15}
              metalness={0.88}
            />
          </mesh>

          {/* B. Primary Neon Cyan Laser Cutting Edge Ribbon */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.02, 1.42, 48]} />
            <meshBasicMaterial
              color={primaryColor}
              transparent
              opacity={0.68}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* C. Blinding White-Hot Razor Cutting Core Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.36, 1.42, 48]} />
            <meshBasicMaterial
              color={coreColor}
              transparent
              opacity={0.96}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* D. Electric Blue Outer Blooming Halo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.42, 1.58, 48]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={0.48}
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
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.91, 0.925, 40]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.48}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Rotating Crosshair Axis Spokes */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.84, 0.012]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.012, 2.84]} />
              <meshBasicMaterial
                color={primaryColor}
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>

          {/* F. Volumetric Ionization Vapor Plasma Curtain (Trailing Upwards) */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[1.42, 1.45, 0.32, 36, 1, true]} />
            <meshBasicMaterial
              color={primaryColor}
              transparent
              opacity={0.24 * (1 - sweepProgress * 0.4)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* ========================================================= */}
      {/* 5. HIGH-VOLTAGE ELECTRIC MICRO-ARCS (LineSegments)        */}
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
      {/* 6. INCANDESCENT CUTTING SPARKS CASCADE (Points)           */}
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
      {/* 7. PLATFORM BED IMPACT & STERILIZING SHOCKWAVE (305..315)  */}
      {/* ========================================================= */}
      {isPostSweep && (
        <group position={[0, minY, 0]}>
          {/* A. Primary Fast-Expanding Neon Cyan Shockwave Ring */}
          {(() => {
            const r1 = 0.15 + impactProgress * 2.85;
            const w1 = 0.065 * (1 - impactProgress * 0.4);
            return (
              <mesh
                position={[0, 0.006, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
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
              <mesh
                position={[0, 0.005, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
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
