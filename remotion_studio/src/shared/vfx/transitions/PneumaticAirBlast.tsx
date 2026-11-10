import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";

export interface PneumaticAirBlastProps {
  /** Current local frame within the animation or tier (e.g. 234..308). Defaults to `useCurrentFrame()`. */
  localFrame?: number;
  /** Frame when the high-pressure pneumatic blast triggers. Default: 234 */
  blastFrame?: number;
  /** Alias for blastFrame for full compatibility with CleanserTransitionWrapper */
  breakFrame?: number;
  /** Frame when the transition completes and stage is 100% pristine. Default: 308 */
  endFrame?: number;
  /** Child nodes (e.g. intact machine mechanism) to shatter and blast off the stage */
  children?: React.ReactNode;
  /** World position of the blast epicenter / air nozzle focus. Default: [0, 0, 0] */
  origin?: [number, number, number];
  /** Alias for origin for compatibility */
  position?: [number, number, number];
  /** Floor Y plane for ground bounce, floor scour, and ricochet sparks. Default: 0 */
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
// 32 DIVERSE INDUSTRIAL MECHANICAL FRAGMENT DEFINITIONS (Strictly 32 items)
// -----------------------------------------------------------------------------
export type FragmentType =
  | "spur_gear"
  | "m24_bolt"
  | "bevel_gear"
  | "piston_pin"
  | "rod_clevis"
  | "plate_shard"
  | "flanged_collar"
  | "spring_shard"
  | "splined_stub"
  | "bracket_lug";

interface MechanicalFragmentDef {
  id: number;
  type: FragmentType;
  /** Initial spawn coordinate inside the machine volume (X, Y, Z) */
  spawnPos: [number, number, number];
  /** Radial launch azimuth angle (radians) */
  angle: number;
  /** Base horizontal radial speed (m/frame) */
  speed: number;
  /** Initial vertical launch pop (m/frame) */
  popY: number;
  /** 3-axis rotational angular tumbling speeds (rad/frame) */
  rotSpeed: [number, number, number];
  scale: number;
  color: string;
  accentColor: string;
}

// Exactly 32 high-detail fragments matching machine components:
// Base (0..10), Columns/Guides (11..21), Upper Head/Ram/Motor (22..31)
const MECHANICAL_FRAGMENTS: MechanicalFragmentDef[] = Array.from({ length: 32 }).map((_, i) => {
  const types: FragmentType[] = [
    "spur_gear",
    "m24_bolt",
    "bevel_gear",
    "piston_pin",
    "rod_clevis",
    "plate_shard",
    "flanged_collar",
    "spring_shard",
    "splined_stub",
    "bracket_lug",
  ];
  const type = types[i % types.length];

  // Distribute spawn positions inside machine envelope:
  // Base region (i: 0..10)
  // Column region (i: 11..21)
  // Head/Ram region (i: 22..31)
  let spawnY = 0.18 + pseudoRandom(i * 7 + 1) * 0.22;
  if (i >= 11 && i < 22) {
    spawnY = 0.52 + pseudoRandom(i * 7 + 1) * 0.42;
  } else if (i >= 22) {
    spawnY = 1.05 + pseudoRandom(i * 7 + 1) * 0.45;
  }

  const spawnRadius = 0.10 + pseudoRandom(i * 11 + 2) * 0.24;
  const spawnAngle = (i / 32) * Math.PI * 2 + (pseudoRandom(i * 13 + 3) - 0.5) * 0.45;
  const spawnX = Math.cos(spawnAngle) * spawnRadius;
  const spawnZ = Math.sin(spawnAngle) * spawnRadius;

  // Controlled horizontal speed so parts bounce on anvil across frames 234..285
  // and only leave the frame around frames 295..305
  const blastAngle = (i / 32) * Math.PI * 2 + (pseudoRandom(i * 17 + 4) - 0.5) * 0.35;
  const speed = 0.032 + pseudoRandom(i * 19 + 5) * 0.016; // 0.032..0.048 m/frame base
  const popY = 0.12 + pseudoRandom(i * 23 + 6) * 0.09; // 0.12..0.21 m/frame vertical pop

  const colors = ["#334155", "#1E293B", "#475569", "#DC2626", "#D97706", "#64748B", "#94A3B8"];
  const accentColors = ["#E2E8F0", "#F8FAFC", "#D97706", "#38BDF8", "#F59E0B"];

  return {
    id: i,
    type,
    spawnPos: [spawnX, spawnY, spawnZ],
    angle: blastAngle,
    speed,
    popY,
    rotSpeed: [
      (pseudoRandom(i * 31 + 7) - 0.5) * 1.6,
      (pseudoRandom(i * 37 + 8) - 0.5) * 2.0,
      (pseudoRandom(i * 41 + 9) - 0.5) * 1.6,
    ],
    scale: 0.85 + pseudoRandom(i * 43 + 10) * 0.35,
    color: colors[i % colors.length],
    accentColor: accentColors[i % accentColors.length],
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
}

const FLOOR_DUST_PARTICLES: DustDef[] = Array.from({ length: 36 }).map((_, i) => {
  const angle = (i / 36) * Math.PI * 2 + (pseudoRandom(i * 5 + 7) - 0.5) * 0.35;
  return {
    angle,
    radialSpeed: 0.045 + pseudoRandom(i * 9 + 1) * 0.04,
    riseHeight: 0.03 + pseudoRandom(i * 13 + 3) * 0.12,
    size: 0.05 + pseudoRandom(i * 17 + 5) * 0.05,
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

// -----------------------------------------------------------------------------
// COMPONENT 1: HIGH-DETAIL 3D MECHANICAL FRAGMENT MESH
// -----------------------------------------------------------------------------
interface FragmentMeshProps {
  type: FragmentType;
  scale: number;
  color: string;
  accentColor: string;
}

const FragmentMesh: React.FC<FragmentMeshProps> = React.memo(({ type, scale, color, accentColor }) => {
  switch (type) {
    case "spur_gear":
      return (
        <group scale={[scale, scale, scale]}>
          <mesh>
            <cylinderGeometry args={[0.068, 0.068, 0.032, 16]} />
            <meshStandardMaterial color={color} metalness={0.92} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.017, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.002, 12]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          {Array.from({ length: 8 }).map((_, ti) => {
            const ta = (ti / 8) * Math.PI * 2;
            return (
              <mesh key={ti} position={[Math.cos(ta) * 0.076, 0, Math.sin(ta) * 0.076]} rotation={[0, -ta, 0]}>
                <boxGeometry args={[0.02, 0.032, 0.018]} />
                <meshStandardMaterial color={accentColor} metalness={0.94} roughness={0.18} />
              </mesh>
            );
          })}
        </group>
      );

    case "m24_bolt":
      return (
        <group scale={[scale, scale, scale]}>
          <mesh position={[0, 0.016, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.026, 6]} />
            <meshStandardMaterial color="#1E293B" metalness={0.94} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.002, 0]}>
            <cylinderGeometry args={[0.046, 0.046, 0.006, 16]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.92} roughness={0.16} />
          </mesh>
          <mesh position={[0, -0.046, 0]}>
            <cylinderGeometry args={[0.017, 0.017, 0.082, 14]} />
            <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.32} />
          </mesh>
        </group>
      );

    case "bevel_gear":
      return (
        <group scale={[scale, scale, scale]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.075, 0.038, 16]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      );

    case "piston_pin":
      return (
        <group scale={[scale, scale, scale]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, 0.13, 20]} />
            <meshStandardMaterial color="#F1F5F9" metalness={0.98} roughness={0.06} />
          </mesh>
          {[-0.066, 0.066].map((pz, zi) => (
            <mesh key={zi} position={[0, pz, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.002, 12]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
          ))}
        </group>
      );

    case "rod_clevis":
      return (
        <group scale={[scale, scale, scale]}>
          <RoundedBox args={[0.085, 0.075, 0.042]} radius={0.012} smoothness={2}>
            <meshStandardMaterial color="#DC2626" metalness={0.75} roughness={0.35} />
          </RoundedBox>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.044, 16]} />
            <meshStandardMaterial color="#D97706" metalness={0.88} roughness={0.25} />
          </mesh>
        </group>
      );

    case "plate_shard":
      return (
        <group scale={[scale, scale, scale]}>
          <RoundedBox args={[0.12, 0.028, 0.085]} radius={0.006} smoothness={2}>
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.4} />
          </RoundedBox>
          <mesh position={[0.028, 0.015, 0]}>
            <cylinderGeometry args={[0.016, 0.011, 0.004, 12]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        </group>
      );

    case "flanged_collar":
      return (
        <group scale={[scale, scale, scale]}>
          <mesh>
            <cylinderGeometry args={[0.062, 0.062, 0.015, 20]} />
            <meshStandardMaterial color="#64748B" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.02, 16]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      );

    case "spring_shard":
      return (
        <group scale={[scale, scale, scale]} rotation={[0.4, 0.8, 0]}>
          <mesh>
            <torusGeometry args={[0.042, 0.012, 10, 20, Math.PI * 1.5]} />
            <meshStandardMaterial color="#1E293B" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
      );

    case "splined_stub":
      return (
        <group scale={[scale, scale, scale]}>
          <mesh>
            <cylinderGeometry args={[0.026, 0.026, 0.105, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.22} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((sa, si) => (
            <mesh key={si} position={[Math.cos(sa) * 0.026, 0, Math.sin(sa) * 0.026]}>
              <boxGeometry args={[0.005, 0.1, 0.005]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.96} roughness={0.15} />
            </mesh>
          ))}
        </group>
      );

    case "bracket_lug":
    default:
      return (
        <group scale={[scale, scale, scale]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.075, 0.02, 0.065]} />
            <meshStandardMaterial color="#374151" metalness={0.88} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.032, -0.022]}>
            <boxGeometry args={[0.075, 0.046, 0.018]} />
            <meshStandardMaterial color="#374151" metalness={0.88} roughness={0.3} />
          </mesh>
        </group>
      );
  }
});

// -----------------------------------------------------------------------------
// COMPONENT 2: RICOCHET SPARK CLUSTER ON IMPACT (Frames 242..255 & 256..275)
// -----------------------------------------------------------------------------
interface RicochetSparkProps {
  position: [number, number, number];
  offset: number; // 0..4 frames
  scale?: number;
  count?: number;
}

const RicochetSparkCluster: React.FC<RicochetSparkProps> = ({ position, offset, scale = 1.0, count = 8 }) => {
  if (offset < 0 || offset > 4) return null;
  const t = offset / 4; // 0..1
  const spread = (t * 0.32 + 0.04) * scale;
  const sparkScale = (1 - t * 0.8) * scale;

  const sparkDirections = [
    [1.0, 0.5, 0.4],
    [-0.9, 0.7, -0.3],
    [0.6, 0.4, 0.9],
    [-0.7, 0.6, -0.8],
    [0.3, 0.8, 0.6],
    [-0.4, 0.7, -0.7],
    [0.9, 0.3, -0.6],
    [-0.8, 0.4, 0.7],
  ].slice(0, count);

  return (
    <group position={position}>
      {/* Intense Core Contact Glint */}
      {t < 0.5 && (
        <mesh position={[0, 0.005, 0]}>
          <sphereGeometry args={[0.045 * (1 - t * 2) * scale, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
        </mesh>
      )}

      {/* Fan of Golden Pyrophoric Sparks */}
      {sparkDirections.map(([dx, dy, dz], i) => (
        <mesh
          key={i}
          position={[dx * spread, Math.max(0.002, dy * spread), dz * spread]}
          scale={[sparkScale, sparkScale, sparkScale]}
        >
          <boxGeometry args={[0.016, 0.016, 0.036]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#F59E0B"
            emissiveIntensity={6.0}
            roughness={0.1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// -----------------------------------------------------------------------------
// MASTER COMPONENT: PNEUMATIC AIR BLAST
// -----------------------------------------------------------------------------
/**
 * PneumaticAirBlast:
 * High-pressure industrial pneumatic cleansing blast (inspired by 15-20 bar CNC air nozzles).
 *
 * Sequence (Frames 234..308):
 * 1. Frame < 234: Intact machine assembly rendered normally.
 * 2. Frame 234 (Supersonic Blast & Instant Cataclysmic Shatter):
 *    - Monolithic machine model ({children}) disappears instantly.
 *    - 32 diverse mechanical fragments (gears, bolts, pins, brackets) erupt from the machine volume.
 * 3. Frames 242..255 (Bounce 1):
 *    - Fragments fall under gravity and strike the anvil bed with pyrophoric ricochet sparks.
 * 4. Frames 256..275 (Bounce 2):
 *    - Secondary low ricochet with continuous 3-axis rotational tumbling right on the stage deck.
 * 5. Frames 276..290 (Floor Skidding across Bed):
 *    - Fragments skid across the anvil apron in full view of the camera.
 * 6. Frames 295..305 (Perimeter Frustum Clearance):
 *    - 20-bar pneumatic jet stream pushes fragments smoothly beyond the camera frustum edge.
 * 7. Frames 308..319 (Pristine Clean Stage Guarantee):
 *    - Table is 100% clean and empty (`null`), sterile and ready for the next machine tier.
 */
export const PneumaticAirBlast: React.FC<PneumaticAirBlastProps> = ({
  localFrame,
  blastFrame,
  breakFrame,
  endFrame = 308,
  children,
  origin,
  position,
  floorY = 0,
  intensity = 1.0,
  airColor = "#F8FAFC",
  shockwaveColor = "#38BDF8",
  showNozzles = true,
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame !== undefined ? localFrame : currentFrame;

  // Resolve trigger frame: breakFrame (from CleanserTransitionWrapper) or blastFrame, defaulting to canonical 234
  const actualBlastFrame = blastFrame ?? breakFrame ?? 234;
  const actualOrigin: [number, number, number] = origin ?? position ?? [0, 0, 0];

  // ---------------------------------------------------------------------------
  // 1. LIFETIME PHASING & CLEAN TABLE GUARANTEE
  // ---------------------------------------------------------------------------
  // Clean stage guarantee: at frame >= endFrame (308..319), return strictly null!
  if (frame >= endFrame) {
    return null;
  }

  // Pre-blast: frame < actualBlastFrame (0..233) -> render intact machine
  // Crucial: At frame >= actualBlastFrame, children is NEVER rendered as a monolith!
  if (frame < actualBlastFrame) {
    return <group position={actualOrigin}>{children}</group>;
  }

  const elapsed = frame - actualBlastFrame; // 0..74 frames (for 234..308)
  const isBlastActive = elapsed >= 0 && frame < endFrame;

  // Linear progression for time calculations
  const progressLinear = Math.min(1, Math.max(0, elapsed / Math.max(1, endFrame - actualBlastFrame)));

  // Fast punch progress (0..1 over first 12 frames) for nozzles & vapor flash
  const punchProgress = interpolate(frame, [actualBlastFrame, actualBlastFrame + 12], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 2. SUPERSONIC ATMOSPHERIC SHOCKWAVES & CONDENSATION CORE
  // ---------------------------------------------------------------------------
  // Primary shockwave expansion: expands across frames 234..270
  const shockwaveRadius = interpolate(elapsed, [0, 15, 36], [0.15, 2.2 * intensity, 4.2 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockwaveTube = interpolate(elapsed, [0, 15, 36], [0.075, 0.04, 0.012], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockwaveOpacity = interpolate(elapsed, [0, 3, 20, 36], [0, 0.88, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Secondary trailing rarefaction ring (delayed by 3 frames)
  const secondaryElapsed = Math.max(0, elapsed - 3);
  const secondaryRadius = interpolate(secondaryElapsed, [0, 38], [0.1, 3.6 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondaryOpacity = interpolate(secondaryElapsed, [0, 4, 22, 38], [0, 0.55, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Core condensation vapor flash (Joule-Thomson effect)
  const coreFlashScale = interpolate(elapsed, [0, 2, 7], [0.15, 0.55 * intensity, 0.85 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coreFlashOpacity = interpolate(elapsed, [0, 1, 4, 8], [0, 0.96, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Radial floor scour sheet (high-speed air sweeping the anvil plane)
  const floorScourInner = interpolate(elapsed, [0, 35], [0.1, 2.8 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floorScourOuter = interpolate(elapsed, [0, 35], [0.35, 3.8 * intensity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floorScourOpacity = interpolate(elapsed, [0, 4, 22, 36], [0, 0.65, 0.28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Supersonic nozzle air jet cones
  const jetLength = interpolate(punchProgress, [0, 0.2, 0.8, 1], [0.1, 1.4 * intensity, 1.5 * intensity, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jetOpacity = interpolate(punchProgress, [0, 0.15, 0.65, 1], [0, 0.88, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // 3. STERILE PRISTINE CLEANSE SHEEN (Frames 300..307: Final polish before null)
  // ---------------------------------------------------------------------------
  const sheenProgress = interpolate(frame, [endFrame - 9, endFrame], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenOpacity = interpolate(sheenProgress, [0, 0.4, 0.8, 1], [0, 0.75, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenPosX = interpolate(sheenProgress, [0, 1], [-1.3, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gravity constant (tuned so Bounce 1 occurs at frames 242..255 and Bounce 2 at 256..275)
  const g = 0.016;

  return (
    <group position={actualOrigin}>
      {/* =================================================================== */}
      {/* A. 32 SHATTERED MECHANICAL FRAGMENTS WITH DUAL BALLISTIC BOUNCES    */}
      {/* =================================================================== */}
      <group name="ShatteredMechanicalFragments">
        {MECHANICAL_FRAGMENTS.map((frag) => {
          const t = elapsed;
          const [x0, y0, z0] = frag.spawnPos;
          const v0y = frag.popY * intensity;
          const vh = frag.speed * intensity;

          // 1. Bounce 1 impact time: y0 + v0y*t - 0.5*g*t^2 = floorY
          const discriminant1 = v0y * v0y + 2 * g * (y0 - floorY);
          const tb1 = (v0y + Math.sqrt(Math.max(0, discriminant1))) / g; // 8..21 frames (Frames 242..255)

          // 2. Bounce 2 impact time with restitution e1 = 0.36
          const vImp1 = Math.sqrt(Math.max(0, discriminant1));
          const v1y = vImp1 * 0.36; // Rebound velocity after Bounce 1
          const tb2 = tb1 + (2 * v1y) / g; // 22..41 frames (Frames 256..275)

          // 3. Vertical Y position across phases
          let py = floorY;
          let isSparking1 = false;
          let isSparking2 = false;

          if (t < tb1) {
            // Phase 1 (Frames 234..tb1): Initial upward explosion and fall towards floor
            py = y0 + v0y * t - 0.5 * g * t * t;
          } else if (t < tb2) {
            // Phase 2 (Frames tb1..tb2): First rebound parabolic hop
            const dt1 = t - tb1;
            py = floorY + v1y * dt1 - 0.5 * g * dt1 * dt1;
            // Spark active during first 4 frames of floor contact (Frames 242..255)
            if (t >= tb1 && t < tb1 + 4) {
              isSparking1 = true;
            }
          } else {
            // Phase 3 (Frames tb2..end): Second low rebound settling into flat floor skidding
            const dt2 = t - tb2;
            const v2y = v1y * 0.22;
            const hopY = v2y * dt2 - 0.5 * g * dt2 * dt2;
            py = floorY + Math.max(0.008, hopY);
            // Micro-spark active during second contact (Frames 256..275)
            if (t >= tb2 && t < tb2 + 3) {
              isSparking2 = true;
            }
          }

          // 4. Horizontal flight distance:
          // Controlled speed keeping fragments on bed/stage deck through frames 234..285,
          // then aerodynamic sweep acceleration pushing them smoothly beyond FOV at frames 295..305
          const dtSweep = Math.max(0, t - 48);
          const flightDist = vh * t * (1 + 0.006 * t) + 0.0045 * dtSweep * dtSweep;
          const px = x0 + Math.cos(frag.angle) * flightDist;
          const pz = z0 + Math.sin(frag.angle) * flightDist;

          // 5. 3-axis rotational tumbling
          const rx = t * frag.rotSpeed[0];
          const ry = t * frag.rotSpeed[1];
          const rz = t * frag.rotSpeed[2];

          // 6. Camera Frustum Clearance Check:
          // Smoothly cull outside r > 6.0m or frame >= 305 so zero stray meshes linger before 308.
          const radialDist = Math.sqrt(px * px + pz * pz);
          if (radialDist > 6.5 || frame >= 306) {
            return null;
          }

          const fragmentOpacity = radialDist > 4.8 ? interpolate(radialDist, [4.8, 6.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

          if (fragmentOpacity <= 0) return null;

          return (
            <group key={`mech-frag-${frag.id}`}>
              {/* The Physical 3D Mechanical Part Mesh */}
              <group position={[px, py, pz]} rotation={[rx, ry, rz]}>
                <FragmentMesh
                  type={frag.type}
                  scale={frag.scale * intensity}
                  color={frag.color}
                  accentColor={frag.accentColor}
                />
              </group>

              {/* Ricochet Spark Burst on Bounce 1 (Frames 242..255) */}
              {isSparking1 && (
                <RicochetSparkCluster
                  position={[px, floorY + 0.005, pz]}
                  offset={Math.floor(t - tb1)}
                  scale={1.2 * intensity}
                  count={8}
                />
              )}

              {/* Secondary Micro-Sparks on Bounce 2 (Frames 256..275) */}
              {isSparking2 && (
                <RicochetSparkCluster
                  position={[px, floorY + 0.003, pz]}
                  offset={Math.floor(t - tb2)}
                  scale={0.7 * intensity}
                  count={4}
                />
              )}
            </group>
          );
        })}
      </group>

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
                    <mesh>
                      <coneGeometry args={[0.16 * intensity, jetLength, 16]} />
                      <meshBasicMaterial
                        color={shockwaveColor}
                        transparent
                        opacity={jetOpacity * 0.75}
                        depthWrite={false}
                      />
                    </mesh>
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

              {/* High-Pressure Braided Pneumatic Supply Hose */}
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
            const dist = dust.radialSpeed * elapsed * (1 - Math.min(elapsed * 0.012, 0.45)) * 2.8 * intensity;
            const px = Math.cos(dust.angle) * dist;
            const pz = Math.sin(dust.angle) * dist;

            const liftProgress = Math.min(1, elapsed / 55);
            const py = floorY + 0.015 + Math.sin(liftProgress * Math.PI) * dust.riseHeight * intensity;

            const puffScale = dust.size * (1 + liftProgress * 2.4) * intensity;
            const puffOpacity = interpolate(progressLinear, [0, 0.08, 0.5, 0.85], [0, 0.65, 0.35, 0], {
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
      {/* E. STERILE PRISTINE CLEANSE SHEEN (Frames 300..307: Final Polish)   */}
      {/* =================================================================== */}
      {sheenOpacity > 0 && (
        <group name="SterileSurfacePolishGleam" position={[sheenPosX, floorY + 0.003, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.22, 1.6]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={sheenOpacity * 0.45}
              depthWrite={false}
            />
          </mesh>
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
