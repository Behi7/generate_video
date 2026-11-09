import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export interface TexturedFactoryBrickWallProps {
  /** Ground-level pivot position [X, Y, Z] (default: [0, 1.5, -6.5] for studio backdrops) */
  position?: [number, number, number];
  /** Euler rotation [X, Y, Z] in radians */
  rotation?: [number, number, number];
  /** Uniform or axis scale */
  scale?: [number, number, number] | number;
  /** Width of the wall (default: 12.0m) */
  width?: number;
  /** Height of the wall (default: 5.0m) */
  height?: number;
  /** Whether to include utility pipe and wall hydrant (default: true) */
  includeUtilities?: boolean;
}

/**
 * PBR Historic Factory Brick Colors
 * Authentic 19th/20th-century weathered industrial kiln-fired clay.
 * Calibrated diffuse reflectance with high roughness and low non-metal reflectance.
 */
export const BRICK_COLOR_PALETTE = {
  BURNT_UMBER: "#4A2E2B", // Deep burnt umber iron-rich clay
  OXIDIZED_TERRACOTTA: "#5C3A35", // Warm oxidized historic red brick
  SOOT_IRONSTONE: "#3E2421", // Dark soot-stained industrial ironstone
  WEATHERED_CLINKER: "#341E1C", // Charcoal-edge kiln overfired brick
  HISTORIC_RED: "#52322E", // Historic deep masonry clay
  DEEP_MORTAR: "#1C1A18", // Recessed dark charcoal/lime mortar
  ROUGH_CONCRETE: "#3D4653", // Weathered structural reinforced concrete
  CURB_CONCRETE: "#323B47", // Heavy bottom curb concrete
  CAST_IRON_PIPE: "#22272F", // Heavy oxidized cast-iron water pipe
  GALVANIZED_STEEL: "#3E4752", // Forged bracket clamp steel
  POLISHED_BRASS: "#D4AF37", // Industrial cast valve brass alloy
  BRASS_ACCENT: "#B8860B", // Deep antique brass for gauge bezel
} as const;

/**
 * High-quality 2D integer hash (Murmur3/xxHash bit-mixing style).
 * Produces flawless white-noise pseudo-random distribution with zero diagonal banding.
 */
function hash2D(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Creates beveled brick geometry with subtle 2.8mm chamfered edges.
 * Prevents razor-sharp CG edges and catches genuine specular rim highlights.
 */
function createChamferedBrickGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.0028
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const eps = 0.0001;
  const r = Math.max(eps, radius);
  const w = width;
  const h = height;

  // Chamfered 2D profile
  shape.moveTo(r, 0);
  shape.lineTo(w - r, 0);
  shape.quadraticCurveTo(w, 0, w, r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(r, h);
  shape.quadraticCurveTo(0, h, 0, h - r);
  shape.lineTo(0, r);
  shape.quadraticCurveTo(0, 0, r, 0);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth - r * 2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: 3,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  geom.computeVertexNormals();
  return geom;
}

/**
 * Subcomponent: Fast Instanced Mesh Group for Brick Tones.
 * Guarantees instance matrices are populated synchronously on mount.
 */
interface InstancedBrickGroupProps {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  color: string;
  roughness: number;
  metalness: number;
}

const InstancedBrickGroup: React.FC<InstancedBrickGroupProps> = ({
  matrices,
  geometry,
  color,
  roughness,
  metalness,
}) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  const applyMatrices = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    for (let i = 0; i < matrices.length; i++) {
      mesh.setMatrixAt(i, matrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    applyMatrices(meshRef.current);
  }, [matrices]);

  if (matrices.length === 0) return null;

  return (
    <instancedMesh
      ref={(mesh) => {
        meshRef.current = mesh;
        applyMatrices(mesh);
      }}
      args={[geometry, undefined, matrices.length]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </instancedMesh>
  );
};

/**
 * Workshop Utility: Heavy Industrial Wall Hydrant Valve with Brass Handwheel.
 */
const IndustrialWallHydrantAssembly: React.FC<{
  position?: [number, number, number];
}> = ({ position = [1.25, 0.35, 0.14] }) => {
  // 5 Spoke angles for handwheel
  const spokeAngles = useMemo(() => [0, 72, 144, 216, 288].map((deg) => (deg * Math.PI) / 180), []);

  return (
    <group position={position}>
      {/* 1. Pipe Tee fitting off the main supply pipe */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.14, 24]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
          roughness={0.52}
          metalness={0.82}
        />
      </mesh>

      {/* Horizontal branch extending forward (+Z) */}
      <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.13, 24]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
          roughness={0.52}
          metalness={0.82}
        />
      </mesh>

      {/* Heavy hexagonal union coupling bushing */}
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.035, 6]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
          roughness={0.38}
          metalness={0.88}
        />
      </mesh>

      {/* 2. Main Industrial Valve Body */}
      <group position={[0, 0, 0.20]}>
        {/* Central octagonal valve chamber */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.082, 8]} />
          <meshStandardMaterial
            color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
            roughness={0.48}
            metalness={0.82}
          />
        </mesh>

        {/* Threaded valve bonnet neck extending upward (+Y) */}
        <mesh position={[0, 0.052, 0]}>
          <cylinderGeometry args={[0.030, 0.030, 0.038, 16]} />
          <meshStandardMaterial
            color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
            roughness={0.36}
            metalness={0.88}
          />
        </mesh>

        {/* Hexagonal packing gland retention nut */}
        <mesh position={[0, 0.078, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.024, 6]} />
          <meshStandardMaterial
            color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
            roughness={0.30}
            metalness={0.92}
          />
        </mesh>

        {/* Polished stainless steel valve spindle / stem */}
        <mesh position={[0, 0.115, 0]}>
          <cylinderGeometry args={[0.010, 0.010, 0.075, 16]} />
          <meshStandardMaterial
            color="#E2E8F0"
            roughness={0.15}
            metalness={0.96}
          />
        </mesh>

        {/* 3. SOLID BRASS HANDWHEEL (Prominent 0.22m spoked valve wheel) */}
        <group position={[0, 0.152, 0]} rotation={[-0.15, 0, 0]}>
          {/* Outer Torus Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.108, 0.014, 16, 40]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
              roughness={0.26}
              metalness={0.92}
            />
          </mesh>

          {/* 8 Scalloped Finger Grip Nodules on Outer Rim */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={i}
                position={[Math.cos(rad) * 0.108, 0, Math.sin(rad) * 0.108]}
              >
                <sphereGeometry args={[0.015, 12, 12]} />
                <meshStandardMaterial
                  color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
                  roughness={0.25}
                  metalness={0.94}
                />
              </mesh>
            );
          })}

          {/* Central brass drive hub */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.028, 16]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
              roughness={0.28}
              metalness={0.92}
            />
          </mesh>

          {/* Top retaining square drive hex nut */}
          <mesh position={[0, 0.018, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.014, 6]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
              roughness={0.32}
              metalness={0.9}
            />
          </mesh>

          {/* 5 Radial Spoke Rods connecting hub to outer rim */}
          {spokeAngles.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.058, 0, Math.sin(angle) * 0.058]}
              rotation={[0, -angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.0065, 0.0065, 0.088, 12]} />
              <meshStandardMaterial
                color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
                roughness={0.26}
                metalness={0.92}
              />
            </mesh>
          ))}
        </group>

        {/* 4. Downward Angled Discharge Nozzle (Spout) */}
        <group position={[0, -0.045, 0.025]}>
          {/* Angled 45-deg discharge elbow */}
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.027, 0.027, 0.07, 20]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
              roughness={0.30}
              metalness={0.92}
            />
          </mesh>

          {/* Male NST Fire Hydrant / Hose Bibb Threads */}
          <group position={[0, -0.052, 0.035]} rotation={[Math.PI / 3, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.042, 24]} />
              <meshStandardMaterial
                color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
                roughness={0.32}
                metalness={0.92}
              />
            </mesh>
            {/* External thread ridges */}
            {[-0.012, 0, 0.012].map((ty, ti) => (
              <mesh key={ti} position={[0, ty, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.026, 0.0025, 8, 24]} />
                <meshStandardMaterial
                  color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
                  roughness={0.28}
                  metalness={0.94}
                />
              </mesh>
            ))}
          </group>

          {/* Heavy Hexagonal Spout Wrench Collar */}
          <mesh position={[0, -0.02, 0.015]} rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.033, 0.033, 0.02, 6]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
              roughness={0.38}
              metalness={0.88}
            />
          </mesh>
        </group>

        {/* 5. Industrial Analog Pressure Gauge (Mounted via upper brass siphon tube) */}
        <group position={[0, 0.175, -0.045]}>
          {/* Siphon connecting tube */}
          <mesh position={[0, -0.038, 0]}>
            <cylinderGeometry args={[0.0065, 0.0065, 0.075, 12]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
              roughness={0.24}
              metalness={0.94}
            />
          </mesh>

          {/* Gauge Brass Housing */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.052, 0.052, 0.036, 32]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.BRASS_ACCENT}
              roughness={0.22}
              metalness={0.92}
            />
          </mesh>

          {/* Polished Brass Bezel Ring */}
          <mesh position={[0, 0, 0.02]}>
            <torusGeometry args={[0.052, 0.0045, 12, 32]} />
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.POLISHED_BRASS}
              roughness={0.16}
              metalness={0.96}
            />
          </mesh>

          {/* White Dial Face Plate */}
          <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.002, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
          </mesh>

          {/* Dial Face Inner Ring Graphic */}
          <mesh position={[0, 0, 0.017]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.036, 0.001, 8, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>

          {/* Red Safety Pressure Arc Sector */}
          <mesh position={[0.014, 0.016, 0.018]}>
            <boxGeometry args={[0.024, 0.006, 0.001]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>

          {/* Black Pressure Needle Indicator (pointing at ~65 PSI) */}
          <mesh
            position={[0, 0.008, 0.019]}
            rotation={[0, 0, -0.68]}
          >
            <boxGeometry args={[0.0028, 0.032, 0.001]} />
            <meshStandardMaterial color="#020617" roughness={0.2} />
          </mesh>

          {/* Center Needle Pivot Pin */}
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.002, 12]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} />
          </mesh>

          {/* Protective Transparent Glass Lens */}
          <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.049, 0.049, 0.002, 32]} />
            <meshStandardMaterial
              color="#FFFFFF"
              roughness={0.05}
              metalness={0.1}
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>

        {/* 6. Stamped Safety Inspection Tag (Wired to valve body) */}
        <group position={[-0.08, 0.03, 0.025]} rotation={[0, 0.28, 0.18]}>
          {/* Yellow Stamped Inspection Tag */}
          <RoundedBox args={[0.042, 0.068, 0.0025]} radius={0.001} smoothness={2}>
            <meshStandardMaterial
              color="#F59E0B"
              roughness={0.42}
              metalness={0.25}
            />
          </RoundedBox>
          {/* Eyelet hole rivet */}
          <mesh position={[0, 0.026, 0.001]}>
            <cylinderGeometry args={[0.004, 0.004, 0.005, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Fine twisted suspension wire */}
          <mesh position={[0.022, 0.042, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.001, 0.001, 0.048, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.95} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * Heavy Wall-Anchor Standoff Bracket Clamp for Water Pipe.
 */
const WallAnchorBracketClamp: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  return (
    <group position={position}>
      {/* 1. Heavy Rectangular Wall Backing Plate flush to masonry */}
      <RoundedBox
        args={[0.18, 0.09, 0.016]}
        radius={0.003}
        smoothness={2}
        position={[0, 0, 0.008]}
        castShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
          roughness={0.45}
          metalness={0.85}
        />
      </RoundedBox>

      {/* 4 Masonry Sleeve Anchor Bolts */}
      {[
        [-0.065, 0.028],
        [0.065, 0.028],
        [-0.065, -0.028],
        [0.065, -0.028],
      ].map(([bx, by], bi) => (
        <group key={bi} position={[bx, by, 0.016]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.014, 6]} />
            <meshStandardMaterial
              color="#64748B"
              roughness={0.3}
              metalness={0.92}
            />
          </mesh>
          <mesh position={[0, 0, -0.003]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.003, 16]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.4}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* 2. Heavy Forged Standoff Strut Arm connecting plate to pipe */}
      <RoundedBox
        args={[0.042, 0.052, 0.12]}
        radius={0.003}
        smoothness={2}
        position={[0, 0, 0.075]}
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
          roughness={0.42}
          metalness={0.88}
        />
      </RoundedBox>

      {/* 3. Two-Piece Saddle Clamp Ring encircling pipe */}
      <group position={[0, 0, 0.14]}>
        {/* Front semi-circular clamp collar */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.044, 0.009, 12, 24, Math.PI]} />
          <meshStandardMaterial
            color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
            roughness={0.4}
            metalness={0.88}
          />
        </mesh>

        {/* Left & Right Clamping Flange Ears */}
        {[-0.054, 0.054].map((earX, ei) => (
          <group key={ei} position={[earX, 0, 0]}>
            <RoundedBox args={[0.024, 0.022, 0.012]} radius={0.002} smoothness={2}>
              <meshStandardMaterial
                color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
                roughness={0.42}
                metalness={0.88}
              />
            </RoundedBox>
            {/* Clamping hex bolt through ears */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0045, 0.0045, 0.038, 6]} />
              <meshStandardMaterial
                color="#CBD5E1"
                roughness={0.25}
                metalness={0.95}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

/**
 * Bolted Flange Pipe Coupling.
 */
const BoltedPipeFlange: React.FC<{ y: number; x?: number; z?: number }> = ({
  y,
  x = 1.25,
  z = 0.14,
}) => {
  const boltAngles = useMemo(() => [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180), []);

  return (
    <group position={[x, y, z]}>
      {/* Top mating flange disc */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.022, 32]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
          roughness={0.5}
          metalness={0.82}
        />
      </mesh>

      {/* Rubber sealing gasket */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.004, 32]} />
        <meshStandardMaterial color="#18181B" roughness={0.85} />
      </mesh>

      {/* Bottom mating flange disc */}
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.022, 32]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
          roughness={0.5}
          metalness={0.82}
        />
      </mesh>

      {/* 6 High-tensile clamping hex bolts with nuts */}
      {boltAngles.map((angle, bi) => (
        <group
          key={bi}
          position={[Math.cos(angle) * 0.06, 0, Math.sin(angle) * 0.06]}
        >
          <mesh>
            <cylinderGeometry args={[0.0055, 0.0055, 0.054, 6]} />
            <meshStandardMaterial
              color="#94A3B8"
              roughness={0.25}
              metalness={0.92}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/**
 * AAA Authentic Textured Factory Brick Wall.
 *
 * Technical & Aesthetic Features:
 * 1. Volumetric Masonry Relief:
 *    - Real 3D brick modules in running-bond course with recessed dark mortar joints (~0.015m mortar recess).
 *    - Natural subtle organic relief: individual bricks have organic step offsets (+/- 2–4mm)
 *      so overhead key lights cast real horizontal micro-shadows along course lines.
 *    - PBR tones: weathered historic industrial clay brick (#4A2E2B, #5C3A35, #3E2421, roughness 0.92, metalness 0.05).
 * 2. Structural Reinforcements:
 *    - Reinforced concrete lintels & pilasters framing the brick field (`RoundedBox`, rough concrete #475569).
 *    - Formwork tie-rod pockets and chamfered drip reveals.
 *    - Bottom concrete wainscot curb / washboard protection base (~0.6m high) with impact steel angle.
 * 3. Workshop Utility Additions:
 *    - Heavy vertical cast-iron/steel water supply pipe with bolted flanges & wall-anchor bracket clamps.
 *    - Industrial wall hydrant valve with solid brass spoked handwheel and analog pressure gauge.
 */
export const TexturedFactoryBrickWall: React.FC<TexturedFactoryBrickWallProps> = ({
  position = [0, 1.5, -6.5],
  rotation = [0, 0, 0],
  scale = 1,
  width = 12.0,
  height = 5.0,
  includeUtilities = true,
}) => {
  const normScale: [number, number, number] =
    typeof scale === "number" ? [scale, scale, scale] : scale;

  // Brick dimensional standards (Standard Metric/UK/US Industrial Modular)
  const brickLength = 0.24;
  const brickHeight = 0.068;
  const brickDepth = 0.082;
  const mortarWidth = 0.012;
  const mortarHeight = 0.012;

  const coursePitchX = brickLength + mortarWidth; // 0.252m
  const coursePitchY = brickHeight + mortarHeight; // 0.080m (12.5 courses/m)

  // Brick field vertical bounds (above wainscot curb at y = -0.88m up to lintel at y = 2.18m)
  const yStart = -0.88;
  const yEnd = 2.18;
  const totalCourses = Math.floor((yEnd - yStart) / coursePitchY); // ~38 courses

  // Wall horizontal span for bricks (-width/2 to width/2)
  const halfSpan = width / 2;

  // Precompute chamfered brick geometry (shared across all instances)
  const fullBrickGeom = useMemo(
    () => createChamferedBrickGeometry(brickLength, brickHeight, brickDepth, 0.0028),
    [brickLength, brickHeight, brickDepth]
  );

  // Group brick matrices by tone for realistic kiln-fired color variegation
  const { tone1Matrices, tone2Matrices, tone3Matrices, tone4Matrices, tone5Matrices } = useMemo(() => {
    const t1: THREE.Matrix4[] = [];
    const t2: THREE.Matrix4[] = [];
    const t3: THREE.Matrix4[] = [];
    const t4: THREE.Matrix4[] = [];
    const t5: THREE.Matrix4[] = [];

    const dummy = new THREE.Object3D();
    const halfBrickScale = (brickLength * 0.48) / brickLength;

    for (let r = 0; r < totalCourses; r++) {
      const y = yStart + r * coursePitchY + brickHeight / 2;
      const isOddRow = r % 2 !== 0;
      const rowOffset = isOddRow ? coursePitchX * 0.5 : 0;

      // Calculate start and end X to cover span
      const minX = -halfSpan + coursePitchX * 0.5;
      const maxX = halfSpan - coursePitchX * 0.5;

      const numCols = Math.ceil((maxX - minX) / coursePitchX);

      // If odd row, place half-brick at left edge
      if (isOddRow) {
        const leftX = minX - coursePitchX * 0.25;
        const dz = (hash2D(r * 11, 7) - 0.5) * 0.006; // +/- 3.0mm
        const rx = (hash2D(r * 13, 11) - 0.5) * 0.007;
        const ry = (hash2D(r * 17, 13) - 0.5) * 0.007;

        dummy.position.set(leftX, y, dz);
        dummy.rotation.set(rx, ry, 0);
        dummy.scale.set(halfBrickScale, 1, 1);
        dummy.updateMatrix();

        t2.push(dummy.matrix.clone());
      }

      for (let c = 0; c < numCols; c++) {
        const x = minX + c * coursePitchX + rowOffset;
        if (x > halfSpan - brickLength * 0.4) continue;

        // High-quality integer bit-mixing hash eliminates repeating diagonal patterns!
        const dz = (hash2D(c, r * 17) - 0.5) * 0.007; // +/- 3.5mm step offset
        const rx = (hash2D(c * 19, r) - 0.5) * 0.008; // micro pitch
        const ry = (hash2D(c, r * 23) - 0.5) * 0.008; // micro yaw

        dummy.position.set(x, y, dz);
        dummy.rotation.set(rx, ry, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        // Categorize into historic industrial clay brick tones with organic stochastic scattering
        const randTone = hash2D(c * 31, r * 47);
        if (randTone < 0.35) {
          t1.push(dummy.matrix.clone()); // #4A2E2B (Burnt Umber)
        } else if (randTone < 0.65) {
          t2.push(dummy.matrix.clone()); // #5C3A35 (Oxidized Terracotta)
        } else if (randTone < 0.82) {
          t3.push(dummy.matrix.clone()); // #3E2421 (Soot Ironstone)
        } else if (randTone < 0.93) {
          t4.push(dummy.matrix.clone()); // #341E1C (Weathered Clinker)
        } else {
          t5.push(dummy.matrix.clone()); // #52322E (Historic Deep Red)
        }
      }

      // If odd row, place half-brick at right edge
      if (isOddRow) {
        const rightX = maxX + coursePitchX * 0.25;
        const dz = (hash2D(r * 29, 19) - 0.5) * 0.006;
        const rx = (hash2D(r * 31, 23) - 0.5) * 0.007;
        const ry = (hash2D(r * 37, 29) - 0.5) * 0.007;

        dummy.position.set(rightX, y, dz);
        dummy.rotation.set(rx, ry, 0);
        dummy.scale.set(halfBrickScale, 1, 1);
        dummy.updateMatrix();

        t1.push(dummy.matrix.clone());
      }
    }

    return {
      tone1Matrices: t1,
      tone2Matrices: t2,
      tone3Matrices: t3,
      tone4Matrices: t4,
      tone5Matrices: t5,
    };
  }, [fullBrickGeom, coursePitchX, coursePitchY, halfSpan, totalCourses, yStart]);

  // Pilaster structural spacing framing central hero bay
  const pilasterXPositions = useMemo(() => [-5.2, -2.4, 2.4, 5.2], []);

  return (
    <group position={position} rotation={rotation} scale={normScale}>
      {/* ======================================================== */}
      {/* 1. RECESSED DARK MORTAR BED BACKING PLANE (~0.016m deep) */}
      {/* ======================================================== */}
      <mesh position={[0, (yStart + yEnd) / 2, -0.016]} receiveShadow>
        <planeGeometry args={[width + 0.4, yEnd - yStart + 0.1]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.DEEP_MORTAR}
          roughness={0.96}
          metalness={0.02}
        />
      </mesh>

      {/* Rear Structural Wall Backplate */}
      <mesh position={[0, 1.0, -0.05]} receiveShadow>
        <planeGeometry args={[width + 2.0, height + 1.0]} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* ======================================================== */}
      {/* 2. VOLUMETRIC MASONRY BRICK FIELD (INSTANCED RUNNING BOND)*/}
      {/* ======================================================== */}
      <group>
        {/* Tone 1: Burnt Umber (#4A2E2B, roughness 0.92, metalness 0.05) */}
        <InstancedBrickGroup
          matrices={tone1Matrices}
          geometry={fullBrickGeom}
          color={BRICK_COLOR_PALETTE.BURNT_UMBER}
          roughness={0.92}
          metalness={0.05}
        />

        {/* Tone 2: Oxidized Terracotta (#5C3A35, roughness 0.90, metalness 0.04) */}
        <InstancedBrickGroup
          matrices={tone2Matrices}
          geometry={fullBrickGeom}
          color={BRICK_COLOR_PALETTE.OXIDIZED_TERRACOTTA}
          roughness={0.9}
          metalness={0.04}
        />

        {/* Tone 3: Soot Ironstone (#3E2421, roughness 0.94, metalness 0.06) */}
        <InstancedBrickGroup
          matrices={tone3Matrices}
          geometry={fullBrickGeom}
          color={BRICK_COLOR_PALETTE.SOOT_IRONSTONE}
          roughness={0.94}
          metalness={0.06}
        />

        {/* Tone 4: Weathered Clinker (#341E1C, roughness 0.95, metalness 0.05) */}
        <InstancedBrickGroup
          matrices={tone4Matrices}
          geometry={fullBrickGeom}
          color={BRICK_COLOR_PALETTE.WEATHERED_CLINKER}
          roughness={0.95}
          metalness={0.05}
        />

        {/* Tone 5: Historic Deep Masonry Red (#52322E, roughness 0.91, metalness 0.04) */}
        <InstancedBrickGroup
          matrices={tone5Matrices}
          geometry={fullBrickGeom}
          color={BRICK_COLOR_PALETTE.HISTORIC_RED}
          roughness={0.91}
          metalness={0.04}
        />
      </group>

      {/* ======================================================== */}
      {/* 3. STRUCTURAL CONCRETE PILASTERS (VERTICAL FRAMING)      */}
      {/* ======================================================== */}
      {pilasterXPositions.map((px, pi) => (
        <group key={pi} position={[px, 0, 0]}>
          {/* Main vertical pilaster column (projects 0.10m proud of bricks) */}
          <RoundedBox
            args={[0.46, 3.42, 0.26]}
            radius={0.025}
            smoothness={4}
            position={[0, 0.73, 0.09]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.ROUGH_CONCRETE}
              roughness={0.92}
              metalness={0.06}
            />
          </RoundedBox>

          {/* Plinth Base at bottom meeting wainscot curb */}
          <RoundedBox
            args={[0.54, 0.18, 0.32]}
            radius={0.02}
            smoothness={3}
            position={[0, -0.84, 0.11]}
            castShadow
          >
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.CURB_CONCRETE}
              roughness={0.9}
              metalness={0.08}
            />
          </RoundedBox>

          {/* Capital Corbel supporting lintel beam */}
          <RoundedBox
            args={[0.54, 0.18, 0.32]}
            radius={0.02}
            smoothness={3}
            position={[0, 2.30, 0.11]}
            castShadow
          >
            <meshStandardMaterial
              color={BRICK_COLOR_PALETTE.ROUGH_CONCRETE}
              roughness={0.9}
              metalness={0.06}
            />
          </RoundedBox>

          {/* 5 Recessed Formwork Tie-Rod Pockets along centerline */}
          {[-0.35, 0.25, 0.85, 1.45, 1.95].map((py, ti) => (
            <group key={ti} position={[0, py, 0.22]}>
              {/* Recessed pocket cylinder */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.024, 16]} />
                <meshStandardMaterial color="#1E293B" roughness={0.7} />
              </mesh>
              {/* Internal tie-rod steel washer & bolt head */}
              <mesh position={[0, 0, -0.008]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.008, 6]} />
                <meshStandardMaterial
                  color="#475569"
                  roughness={0.3}
                  metalness={0.9}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ======================================================== */}
      {/* 4. REINFORCED CONCRETE LINTEL & OVERHEAD PARAPET          */}
      {/* ======================================================== */}
      {/* Horizontal Heavy Lintel Header Beam */}
      <RoundedBox
        args={[width + 0.4, 0.46, 0.26]}
        radius={0.025}
        smoothness={4}
        position={[0, 2.42, 0.09]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.ROUGH_CONCRETE}
          roughness={0.92}
          metalness={0.06}
        />
      </RoundedBox>

      {/* Underside Drip Reveal Notch (Casts crisp shadow line onto bricks) */}
      <mesh position={[0, 2.18, 0.06]} receiveShadow>
        <boxGeometry args={[width + 0.3, 0.022, 0.03]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>

      {/* Upper Masonry Parapet Wall above lintel */}
      <mesh position={[0, 2.9, 0.0]} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.52, 0.12]} />
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.BURNT_UMBER}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Concrete Roof Coping Cap Beam */}
      <RoundedBox
        args={[width + 0.6, 0.16, 0.34]}
        radius={0.02}
        smoothness={3}
        position={[0, 3.22, 0.1]}
        castShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.ROUGH_CONCRETE}
          roughness={0.9}
          metalness={0.08}
        />
      </RoundedBox>

      {/* ======================================================== */}
      {/* 5. BOTTOM CONCRETE WAINSCOT CURB (~0.6m high)             */}
      {/* ======================================================== */}
      {/* Main Base Curb Block (Height 0.54m, from y = -1.50 to -0.96) */}
      <RoundedBox
        args={[width + 0.4, 0.54, 0.32]}
        radius={0.025}
        smoothness={4}
        position={[0, -1.23, 0.12]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CURB_CONCRETE}
          roughness={0.9}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Sloped Top Washboard Wash (Sheds debris towards floor) */}
      <RoundedBox
        args={[width + 0.38, 0.10, 0.24]}
        radius={0.02}
        smoothness={3}
        position={[0, -0.92, 0.08]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.CURB_CONCRETE}
          roughness={0.88}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Steel Angle Impact Corner Guard along top-front curb edge */}
      <RoundedBox
        args={[width + 0.38, 0.05, 0.05]}
        radius={0.006}
        smoothness={2}
        position={[0, -0.97, 0.26]}
        castShadow
      >
        <meshStandardMaterial
          color={BRICK_COLOR_PALETTE.GALVANIZED_STEEL}
          roughness={0.35}
          metalness={0.88}
        />
      </RoundedBox>

      {/* Countersunk Anchor Hex Bolts along steel guard angle */}
      {[-4.8, -3.6, -2.4, -1.2, 0.0, 1.2, 2.4, 3.6, 4.8].map((bx, bi) => (
        <mesh
          key={bi}
          position={[bx, -0.97, 0.286]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.006, 6]} />
          <meshStandardMaterial
            color="#94A3B8"
            roughness={0.25}
            metalness={0.92}
          />
        </mesh>
      ))}

      {/* Vertical Expansion Joint Grooves in Concrete Curb */}
      {[-4.8, -2.4, 0.0, 2.4, 4.8].map((ejx, eji) => (
        <mesh key={eji} position={[ejx, -1.23, 0.282]}>
          <boxGeometry args={[0.016, 0.54, 0.012]} />
          <meshStandardMaterial color="#1E293B" roughness={0.95} />
        </mesh>
      ))}

      {/* ======================================================== */}
      {/* 6. WORKSHOP UTILITIES (PIPE, HYDRANT VALVE, HANDWHEEL)    */}
      {/* ======================================================== */}
      {includeUtilities && (
        <group>
          {/* Heavy Vertical Cast-Iron / Steel Water Supply Pipe */}
          <group position={[1.25, 0.9, 0.14]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.042, 0.042, 4.8, 32]} />
              <meshStandardMaterial
                color={BRICK_COLOR_PALETTE.CAST_IRON_PIPE}
                roughness={0.48}
                metalness={0.84}
              />
            </mesh>
          </group>

          {/* Bolted Pipe Flange 1 (Overhead joint at y = 1.70m) */}
          <BoltedPipeFlange y={1.70} x={1.25} z={0.14} />

          {/* Bolted Pipe Flange 2 (Lower joint at y = -0.40m) */}
          <BoltedPipeFlange y={-0.40} x={1.25} z={0.14} />

          {/* 4 Heavy Wall-Anchor Bracket Standoff Clamps */}
          <WallAnchorBracketClamp position={[1.25, -0.65, 0]} />
          <WallAnchorBracketClamp position={[1.25, 0.08, 0]} />
          <WallAnchorBracketClamp position={[1.25, 1.05, 0]} />
          <WallAnchorBracketClamp position={[1.25, 2.35, 0]} />

          {/* Industrial Wall Hydrant Valve with Solid Brass Handwheel */}
          <IndustrialWallHydrantAssembly position={[1.25, 0.35, 0.14]} />

          {/* Overhead Galvanized Electrical EMT Conduit Run */}
          <group position={[0, 2.24, 0.16]}>
            {/* Horizontal EMT conduit tube */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, width, 16]} />
              <meshStandardMaterial
                color="#94A3B8"
                roughness={0.3}
                metalness={0.92}
              />
            </mesh>

            {/* Industrial NEMA 4X Cast Metal Junction Box */}
            <group position={[-1.25, 0, 0.03]}>
              <RoundedBox args={[0.13, 0.15, 0.08]} radius={0.01} smoothness={2}>
                <meshStandardMaterial
                  color="#475569"
                  roughness={0.4}
                  metalness={0.85}
                />
              </RoundedBox>
              {/* Cover Screws */}
              {[
                [-0.045, 0.055],
                [0.045, 0.055],
                [-0.045, -0.055],
                [0.045, -0.055],
              ].map(([sx, sy], si) => (
                <mesh key={si} position={[sx, sy, 0.042]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.0035, 0.0035, 0.004, 12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.95} />
                </mesh>
              ))}
              {/* Warning Hazard Label Decal */}
              <mesh position={[0, 0, 0.042]}>
                <planeGeometry args={[0.065, 0.042]} />
                <meshStandardMaterial
                  color="#F59E0B"
                  roughness={0.4}
                  metalness={0.1}
                />
              </mesh>
            </group>
          </group>

          {/* Vertical Secondary Conduit running down the left pilaster */}
          <group position={[-2.4, 0.6, 0.23]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 3.2, 16]} />
              <meshStandardMaterial
                color="#94A3B8"
                roughness={0.28}
                metalness={0.94}
              />
            </mesh>
            {/* Unistrut mounting conduit straps */}
            {[-0.8, 0.0, 0.8].map((sy, si) => (
              <mesh key={si} position={[0, sy, -0.005]}>
                <boxGeometry args={[0.04, 0.025, 0.015]} />
                <meshStandardMaterial
                  color="#64748B"
                  roughness={0.35}
                  metalness={0.9}
                />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

export default TexturedFactoryBrickWall;
