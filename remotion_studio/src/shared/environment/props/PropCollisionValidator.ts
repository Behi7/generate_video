import * as THREE from "three";

/**
 * Standard preset dimensions [width(X), height(Y), depth(Z)] for environment props.
 * Calibrated against models in src/shared/environment/Props.tsx
 */
export const PROP_PRESETS: Record<string, [number, number, number]> = {
  OIL_BARREL: [0.64, 0.88, 0.64],
  INDUSTRIAL_OIL_DRUM: [0.64, 0.88, 0.64],
  DRUM_CLUSTER: [1.24, 0.88, 0.84],
  WOODEN_PALLET: [1.2, 0.15, 1.2],
  EURO_PALLET: [1.2, 0.15, 0.8],
  METAL_BUCKET: [0.34, 0.33, 0.34],
  COILED_HOSE: [0.90, 0.08, 0.90],
  SCATTERED_HARDWARE: [0.36, 0.04, 0.32],
  WARNING_PILLAR: [0.32, 0.9, 0.32],
  CABLE_TRAY: [7.0, 0.08, 0.28],
  TOOL_RACK: [1.6, 2.2, 0.04],
  HYDRAULIC_RESERVOIR: [0.68, 0.95, 0.68],
  WARNING_SIGN: [1.2, 0.7, 0.025],
};

/**
 * Configuration interface for a positioned prop or decoration in the scene.
 */
export interface PlacedPropConfig {
  id: string;
  name?: string;
  type?: string;
  position: [number, number, number] | THREE.Vector3;
  dimensions?: [number, number, number] | THREE.Vector3;
  size?: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number] | THREE.Euler; // in radians
  rotationDeg?: [number, number, number]; // in degrees
  scale?: [number, number, number] | number;
  anchor?: "bottom" | "center" | "top"; // default "bottom"
  boundingBoxOffset?: [number, number, number] | THREE.Vector3;
  box?: THREE.Box3;
  isStatic?: boolean;
  ignoreCollisionWith?: string[];
  metadata?: Record<string, any>;
}

/**
 * Detailed volumetric intersection calculation result for two 3D boxes.
 */
export interface VolumetricOverlap {
  intersectBox: THREE.Box3;
  volumeA: number;
  volumeB: number;
  intersectVolume: number;
  overlapPercent: number; // V(inter) / min(V_A, V_B) * 100%
  overlapRatio: number; // alias for overlapPercent
}

/**
 * Represents an invalid collision violation where overlap exceeds the allowed threshold.
 */
export interface PropCollisionViolation {
  propAId: string;
  propBId: string;
  propAName?: string;
  propBName?: string;
  overlapPercent: number;
  maxAllowedPercent: number;
  excessOverlapPercent: number;
  intersectVolume: number;
  volumeA: number;
  volumeB: number;
  intersectBox: [number, number, number, number, number, number];
  boxA: [number, number, number, number, number, number];
  boxB: [number, number, number, number, number, number];
  message: string;
}

/**
 * Summary record for an evaluated pair of props.
 */
export interface PropCollisionPairResult {
  propAId: string;
  propBId: string;
  overlapPercent: number;
  isValid: boolean;
}

/**
 * Result returned by checkPropsCollisions.
 */
export interface CollisionValidationResult {
  isValid: boolean; // true strictly when NO pair exceeds maxAllowedOverlapPercent
  totalPropsChecked: number;
  totalPairsChecked: number;
  violationsCount: number;
  maxObservedOverlapPercent: number;
  violations: PropCollisionViolation[];
  pairs: PropCollisionPairResult[];
  summary: string;
}

/**
 * Options for the relaxation solver.
 */
export interface RelaxOptions {
  maxIterations?: number;
  targetOverlapPercent?: number; // target below threshold (default 1.5%)
  maxAllowedOverlapPercent?: number; // threshold (default 2.0%)
  stepFactor?: number; // step factor (default 0.6)
}

/**
 * Converts input coordinates to a THREE.Vector3.
 */
function toVector3(v?: [number, number, number] | THREE.Vector3): THREE.Vector3 {
  if (!v) return new THREE.Vector3(0, 0, 0);
  if (v instanceof THREE.Vector3) return v.clone();
  return new THREE.Vector3(v[0], v[1], v[2]);
}

/**
 * Converts input rotation to a THREE.Euler.
 */
function toEuler(
  rotRad?: [number, number, number] | THREE.Euler,
  rotDeg?: [number, number, number]
): THREE.Euler {
  if (rotRad instanceof THREE.Euler) return rotRad.clone();
  if (rotRad && Array.isArray(rotRad)) {
    return new THREE.Euler(rotRad[0], rotRad[1], rotRad[2]);
  }
  if (rotDeg && Array.isArray(rotDeg)) {
    const degToRad = Math.PI / 180;
    return new THREE.Euler(
      rotDeg[0] * degToRad,
      rotDeg[1] * degToRad,
      rotDeg[2] * degToRad
    );
  }
  return new THREE.Euler(0, 0, 0);
}

/**
 * Serializes a THREE.Box3 to an array [minX, minY, minZ, maxX, maxY, maxZ].
 */
export function boxToArray(box: THREE.Box3): [number, number, number, number, number, number] {
  return [
    Number(box.min.x.toFixed(4)),
    Number(box.min.y.toFixed(4)),
    Number(box.min.z.toFixed(4)),
    Number(box.max.x.toFixed(4)),
    Number(box.max.y.toFixed(4)),
    Number(box.max.z.toFixed(4)),
  ];
}

/**
 * Computes the 3D bounding box (THREE.Box3) for a prop configuration.
 * Considers dimensions, position, rotation, anchor, and scale.
 */
export function computePropBoundingBox(prop: PlacedPropConfig): THREE.Box3 {
  if (prop.box) {
    return prop.box.clone();
  }

  // Resolve dimensions
  let dims: THREE.Vector3;
  if (prop.dimensions) {
    dims = toVector3(prop.dimensions);
  } else if (prop.size) {
    dims = toVector3(prop.size);
  } else if (prop.type && PROP_PRESETS[prop.type]) {
    dims = toVector3(PROP_PRESETS[prop.type]);
  } else {
    dims = new THREE.Vector3(1, 1, 1);
  }

  // Apply scale
  if (typeof prop.scale === "number") {
    dims.multiplyScalar(prop.scale);
  } else if (Array.isArray(prop.scale)) {
    dims.x *= prop.scale[0];
    dims.y *= prop.scale[1];
    dims.z *= prop.scale[2];
  }

  const anchor = prop.anchor || "bottom";
  const offset = toVector3(prop.boundingBoxOffset);

  let localMin: THREE.Vector3;
  let localMax: THREE.Vector3;

  if (anchor === "bottom") {
    localMin = new THREE.Vector3(-dims.x / 2, 0, -dims.z / 2).add(offset);
    localMax = new THREE.Vector3(dims.x / 2, dims.y, dims.z / 2).add(offset);
  } else if (anchor === "top") {
    localMin = new THREE.Vector3(-dims.x / 2, -dims.y, -dims.z / 2).add(offset);
    localMax = new THREE.Vector3(dims.x / 2, 0, dims.z / 2).add(offset);
  } else {
    // "center"
    localMin = new THREE.Vector3(-dims.x / 2, -dims.y / 2, -dims.z / 2).add(offset);
    localMax = new THREE.Vector3(dims.x / 2, dims.y / 2, dims.z / 2).add(offset);
  }

  const pos = toVector3(prop.position);
  const rot = toEuler(prop.rotation, prop.rotationDeg);

  const hasRotation =
    Math.abs(rot.x) > 1e-6 || Math.abs(rot.y) > 1e-6 || Math.abs(rot.z) > 1e-6;

  if (!hasRotation) {
    return new THREE.Box3(
      new THREE.Vector3(pos.x + localMin.x, pos.y + localMin.y, pos.z + localMin.z),
      new THREE.Vector3(pos.x + localMax.x, pos.y + localMax.y, pos.z + localMax.z)
    );
  }

  // Transform 8 corner vertices by orientation matrix
  const corners: THREE.Vector3[] = [
    new THREE.Vector3(localMin.x, localMin.y, localMin.z),
    new THREE.Vector3(localMin.x, localMin.y, localMax.z),
    new THREE.Vector3(localMin.x, localMax.y, localMin.z),
    new THREE.Vector3(localMin.x, localMax.y, localMax.z),
    new THREE.Vector3(localMax.x, localMin.y, localMin.z),
    new THREE.Vector3(localMax.x, localMin.y, localMax.z),
    new THREE.Vector3(localMax.x, localMax.y, localMin.z),
    new THREE.Vector3(localMax.x, localMax.y, localMax.z),
  ];

  const q = new THREE.Quaternion().setFromEuler(rot);
  const box = new THREE.Box3();

  for (const corner of corners) {
    corner.applyQuaternion(q).add(pos);
    box.expandByPoint(corner);
  }

  return box;
}

/**
 * Computes the volume of an axis-aligned bounding box.
 */
export function getBoxVolume(box: THREE.Box3): number {
  if (box.isEmpty()) return 0;
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.x <= 1e-6 || size.y <= 1e-6 || size.z <= 1e-6) return 0;
  return size.x * size.y * size.z;
}

/**
 * Calculates the volumetric intersection between two bounding boxes:
 * - IntersectBox = BoxA.intersect(BoxB)
 * - Volume(Box) = size.x * size.y * size.z
 * - OverlapRatio = (Volume(IntersectBox) / min(Volume(BoxA), Volume(BoxB))) * 100%
 */
export function computeVolumetricIntersection(
  boxA: THREE.Box3,
  boxB: THREE.Box3
): VolumetricOverlap {
  const vA = getBoxVolume(boxA);
  const vB = getBoxVolume(boxB);

  if (vA <= 0 || vB <= 0 || !boxA.intersectsBox(boxB)) {
    return {
      intersectBox: new THREE.Box3(),
      volumeA: vA,
      volumeB: vB,
      intersectVolume: 0,
      overlapPercent: 0,
      overlapRatio: 0,
    };
  }

  const intersectBox = new THREE.Box3().copy(boxA).intersect(boxB);
  if (intersectBox.isEmpty()) {
    return {
      intersectBox,
      volumeA: vA,
      volumeB: vB,
      intersectVolume: 0,
      overlapPercent: 0,
      overlapRatio: 0,
    };
  }

  const interSize = new THREE.Vector3();
  intersectBox.getSize(interSize);
  if (interSize.x <= 1e-6 || interSize.y <= 1e-6 || interSize.z <= 1e-6) {
    return {
      intersectBox,
      volumeA: vA,
      volumeB: vB,
      intersectVolume: 0,
      overlapPercent: 0,
      overlapRatio: 0,
    };
  }

  const intersectVolume = interSize.x * interSize.y * interSize.z;
  const minVol = Math.min(vA, vB);
  const rawRatio = minVol > 0 ? (intersectVolume / minVol) * 100 : 0;
  const roundedPercent = Number(rawRatio.toFixed(4));

  return {
    intersectBox,
    volumeA: vA,
    volumeB: vB,
    intersectVolume,
    overlapPercent: roundedPercent,
    overlapRatio: roundedPercent,
  };
}

/**
 * Checks all positioned props for volumetric collisions.
 *
 * Requirements:
 * - Overlap MUST be strictly < 2.0% (<= 2.0% is valid contact, > 2.0% is flagged violation).
 *
 * @param props List of positioned prop configurations
 * @param maxAllowedOverlapPercent Allowed overlap threshold percentage (default: 2.0)
 * @returns CollisionValidationResult
 */
export function checkPropsCollisions(
  props: PlacedPropConfig[],
  maxAllowedOverlapPercent: number = 2.0
): CollisionValidationResult {
  const n = props.length;
  const boxes: THREE.Box3[] = props.map((p) => computePropBoundingBox(p));
  const violations: PropCollisionViolation[] = [];
  const pairs: PropCollisionPairResult[] = [];
  let maxObservedOverlap = 0;
  let totalPairsChecked = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const propA = props[i];
      const propB = props[j];
      totalPairsChecked++;

      // Check user-configured explicit ignore lists
      if (
        propA.ignoreCollisionWith?.includes(propB.id) ||
        propB.ignoreCollisionWith?.includes(propA.id)
      ) {
        continue;
      }

      const boxA = boxes[i];
      const boxB = boxes[j];
      const overlap = computeVolumetricIntersection(boxA, boxB);

      if (overlap.overlapPercent > maxObservedOverlap) {
        maxObservedOverlap = overlap.overlapPercent;
      }

      const isViolation = overlap.overlapPercent > maxAllowedOverlapPercent;

      pairs.push({
        propAId: propA.id,
        propBId: propB.id,
        overlapPercent: overlap.overlapPercent,
        isValid: !isViolation,
      });

      if (isViolation) {
        const excess = Number((overlap.overlapPercent - maxAllowedOverlapPercent).toFixed(4));
        const msg = `Prop collision violation between "${propA.name || propA.id}" and "${
          propB.name || propB.id
        }": volumetric overlap ${overlap.overlapPercent.toFixed(2)}% exceeds limit ${maxAllowedOverlapPercent.toFixed(2)}% (excess: +${excess.toFixed(2)}%).`;

        violations.push({
          propAId: propA.id,
          propBId: propB.id,
          propAName: propAName(propA),
          propBName: propAName(propB),
          overlapPercent: overlap.overlapPercent,
          maxAllowedPercent: maxAllowedOverlapPercent,
          excessOverlapPercent: excess,
          intersectVolume: overlap.intersectVolume,
          volumeA: overlap.volumeA,
          volumeB: overlap.volumeB,
          intersectBox: boxToArray(overlap.intersectBox),
          boxA: boxToArray(boxA),
          boxB: boxToArray(boxB),
          message: msg,
        });
      }
    }
  }

  const isValid = violations.length === 0;
  const summary = isValid
    ? `All ${n} props validated across ${totalPairsChecked} pairs. Maximum overlap: ${maxObservedOverlap.toFixed(2)}% (< ${maxAllowedOverlapPercent.toFixed(2)}%). Result: VALID.`
    : `Collision validation FAILED: ${violations.length} violations detected across ${totalPairsChecked} pairs. Maximum overlap: ${maxObservedOverlap.toFixed(2)}% (limit: ${maxAllowedOverlapPercent.toFixed(2)}%).`;

  return {
    isValid,
    totalPropsChecked: n,
    totalPairsChecked,
    violationsCount: violations.length,
    maxObservedOverlapPercent: maxObservedOverlap,
    violations,
    pairs,
    summary,
  };
}

function propAName(p: PlacedPropConfig): string {
  return p.name || p.id;
}

/**
 * Auto-push relaxation solver.
 * Gently pushes overlapping props apart along horizontal XZ planes until volumetric overlap < 2.0%.
 * Static props (isStatic === true) remain fixed in place.
 *
 * @param props List of positioned props
 * @param options Solver configuration options
 * @returns PlacedPropConfig[] with relaxed horizontal positions
 */
export function relaxPropsPositions(
  props: PlacedPropConfig[],
  options: RelaxOptions = {}
): PlacedPropConfig[] {
  const maxIterations = options.maxIterations ?? 100;
  const targetOverlap = options.targetOverlapPercent ?? 1.5;
  const threshold = options.maxAllowedOverlapPercent ?? 2.0;
  const stepFactor = options.stepFactor ?? 0.6;

  // Clone configurations so original input remains untouched
  const relaxed: PlacedPropConfig[] = props.map((p) => {
    const pos = toVector3(p.position);
    return {
      ...p,
      position: [pos.x, pos.y, pos.z],
    };
  });

  const n = relaxed.length;
  if (n <= 1) return relaxed;

  for (let iter = 0; iter < maxIterations; iter++) {
    // 1. Compute bounding boxes
    const boxes = relaxed.map((p) => computePropBoundingBox(p));
    let anyExceededTarget = false;

    // 2. Resolve pairwise overlaps
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const propA = relaxed[i];
        const propB = relaxed[j];

        if (
          propA.ignoreCollisionWith?.includes(propB.id) ||
          propB.ignoreCollisionWith?.includes(propA.id)
        ) {
          continue;
        }

        const boxA = boxes[i];
        const boxB = boxes[j];

        if (!boxA.intersectsBox(boxB)) continue;

        const overlap = computeVolumetricIntersection(boxA, boxB);
        if (overlap.overlapPercent <= targetOverlap) continue;

        anyExceededTarget = true;

        // Both static cannot be resolved horizontally
        if (propA.isStatic && propB.isStatic) continue;

        const interBox = overlap.intersectBox;
        const interSize = new THREE.Vector3();
        interBox.getSize(interSize);

        const centerA = new THREE.Vector3();
        const centerB = new THREE.Vector3();
        boxA.getCenter(centerA);
        boxB.getCenter(centerB);

        let dx = centerB.x - centerA.x;
        let dz = centerB.z - centerA.z;
        let distXZ = Math.hypot(dx, dz);

        // If centers coincide or are practically identical, pick deterministic separation angle
        if (distXZ < 1e-4) {
          const angle = ((i * 137.5 + j * 97.3) * Math.PI) / 180;
          dx = Math.cos(angle);
          dz = Math.sin(angle);
          distXZ = 1.0;
        }

        const dirX = dx / distXZ;
        const dirZ = dz / distXZ;

        // Push distance based on horizontal intersection dimensions
        const pushDist = (Math.max(interSize.x, interSize.z) * stepFactor + 0.01);
        const pushX = dirX * pushDist;
        const pushZ = dirZ * pushDist;

        const posA = relaxed[i].position as [number, number, number];
        const posB = relaxed[j].position as [number, number, number];

        if (propA.isStatic) {
          relaxed[j].position = [posB[0] + pushX, posB[1], posB[2] + pushZ];
        } else if (propB.isStatic) {
          relaxed[i].position = [posA[0] - pushX, posA[1], posA[2] - pushZ];
        } else {
          relaxed[i].position = [posA[0] - pushX * 0.5, posA[1], posA[2] - pushZ * 0.5];
          relaxed[j].position = [posB[0] + pushX * 0.5, posB[1], posB[2] + pushZ * 0.5];
        }

        // Update boxes for subsequent pairs in this iteration
        boxes[i] = computePropBoundingBox(relaxed[i]);
        boxes[j] = computePropBoundingBox(relaxed[j]);
      }
    }

    if (!anyExceededTarget) {
      break;
    }
  }

  return relaxed;
}

/**
 * Factory helper to construct a PlacedPropConfig with default dimensions from PROP_PRESETS.
 */
export function createProp(
  id: string,
  typeOrPreset: keyof typeof PROP_PRESETS | string,
  position: [number, number, number],
  overrides?: Partial<PlacedPropConfig>
): PlacedPropConfig {
  const presetDims = PROP_PRESETS[typeOrPreset] || [1, 1, 1];
  return {
    id,
    type: typeOrPreset,
    name: overrides?.name || `${typeOrPreset}_${id}`,
    position,
    dimensions: presetDims,
    anchor: "bottom",
    ...overrides,
  };
}
