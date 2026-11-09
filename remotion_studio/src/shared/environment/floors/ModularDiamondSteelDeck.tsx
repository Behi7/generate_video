import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export interface ModularDiamondSteelDeckProps {
  /**
   * Position in world space.
   * Ground standard height is strictly [0, -2.04, 0].
   */
  position?: [number, number, number];
  /**
   * Rotation in Euler angles.
   */
  rotation?: [number, number, number];
  /**
   * Overall deck span in meters (default 16m x 16m).
   */
  span?: number;
  /**
   * Primary oxidized steel slate base color (#334155).
   */
  primaryColor?: string;
  /**
   * PBR metalness (default 0.88).
   */
  metalness?: number;
  /**
   * PBR roughness (default 0.32).
   */
  roughness?: number;
  /**
   * Whether to render the welded perimeter angle-iron kerb framing.
   */
  showKerb?: boolean;
  /**
   * Whether to embed the maintenance utility access hatch.
   */
  showHatch?: boolean;
  /**
   * Local position of the maintenance hatch [x, z].
   * Default [1.2, 1.2] aligns with modular 1.2m column.
   */
  hatchPosition?: [number, number];
}

/**
 * Procedural Diamond-Tread & Galvanized Steel Texture Generator.
 * Generates:
 * 1. Albedo Map: Galvanized dark slate steel with spangle grain, burnished lug crests (#475569) and oxidized valleys (#232D3B).
 * 2. Normal Map: Calibrated tangent-space normals for 2-bar alternating 45° diamond lugs with inverted WebGL Y.
 * 3. Bump Map: High-contrast height field for crisp Three.js surface relief.
 * 4. Roughness Map: High-specular polished lug tips (0.22) and matte oxidized valleys (0.42).
 */
function createDiamondTreadTextures(): {
  colorMap: THREE.CanvasTexture | null;
  normalMap: THREE.CanvasTexture | null;
  bumpMap: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture | null;
} {
  if (typeof document === "undefined") {
    return { colorMap: null, normalMap: null, bumpMap: null, roughnessMap: null };
  }

  const size = 512;

  // 1. Color / Albedo Canvas
  const canvasColor = document.createElement("canvas");
  canvasColor.width = size;
  canvasColor.height = size;
  const ctxColor = canvasColor.getContext("2d");

  // 2. Normal Map Canvas
  const canvasNormal = document.createElement("canvas");
  canvasNormal.width = size;
  canvasNormal.height = size;
  const ctxNormal = canvasNormal.getContext("2d");

  // 3. Bump / Height Canvas
  const canvasBump = document.createElement("canvas");
  canvasBump.width = size;
  canvasBump.height = size;
  const ctxBump = canvasBump.getContext("2d");

  // 4. Roughness Canvas
  const canvasRough = document.createElement("canvas");
  canvasRough.width = size;
  canvasRough.height = size;
  const ctxRough = canvasRough.getContext("2d");

  if (!ctxColor || !ctxNormal || !ctxBump || !ctxRough) {
    return { colorMap: null, normalMap: null, bumpMap: null, roughnessMap: null };
  }

  const imgColor = ctxColor.createImageData(size, size);
  const dataColor = imgColor.data;

  const imgNormal = ctxNormal.createImageData(size, size);
  const dataNormal = imgNormal.data;

  const imgBump = ctxBump.createImageData(size, size);
  const dataBump = imgBump.data;

  const imgRough = ctxRough.createImageData(size, size);
  const dataRough = imgRough.data;

  const cellSize = 64; // 8x8 repeating tile cells in 512x512
  const heightGrid = new Float32Array(size * size);

  const lugSemiMajor = 14; // half-length of diamond lug
  const lugSemiMinor = 4.8; // half-width of diamond lug

  for (let y = 0; y < size; y++) {
    const cy = y % cellSize;
    for (let x = 0; x < size; x++) {
      const cx = x % cellSize;
      const idx = y * size + x;

      let maxH = 0;

      // Lug 1: center (16, 32), angle +45 deg
      {
        const dx = cx - 16;
        const dy = cy - 32;
        const u = (dx + dy) * 0.70710678;
        const v = (-dx + dy) * 0.70710678;
        const du = Math.abs(u) / lugSemiMajor;
        const dv = Math.abs(v) / lugSemiMinor;
        const dist = Math.sqrt(du * du + dv * dv);
        if (dist < 1.0) {
          const h = Math.cos(dist * (Math.PI / 2));
          if (h > maxH) maxH = h;
        }
      }

      // Lug 2: center (48, 32), angle -45 deg
      {
        const dx = cx - 48;
        const dy = cy - 32;
        const u = (dx - dy) * 0.70710678;
        const v = (dx + dy) * 0.70710678;
        const du = Math.abs(u) / lugSemiMajor;
        const dv = Math.abs(v) / lugSemiMinor;
        const dist = Math.sqrt(du * du + dv * dv);
        if (dist < 1.0) {
          const h = Math.cos(dist * (Math.PI / 2));
          if (h > maxH) maxH = h;
        }
      }

      // Periodic tile wrapping check
      const neighbors = [
        [-cellSize, 0],
        [cellSize, 0],
        [0, -cellSize],
        [0, cellSize],
      ];
      for (let n = 0; n < neighbors.length; n++) {
        const ox = neighbors[n][0];
        const oy = neighbors[n][1];

        // Wrapped Lug 1
        const dx1 = cx + ox - 16;
        const dy1 = cy + oy - 32;
        const u1 = (dx1 + dy1) * 0.70710678;
        const v1 = (-dx1 + dy1) * 0.70710678;
        const d1 = Math.sqrt((u1 / lugSemiMajor) ** 2 + (v1 / lugSemiMinor) ** 2);
        if (d1 < 1.0) {
          const h1 = Math.cos(d1 * (Math.PI / 2));
          if (h1 > maxH) maxH = h1;
        }

        // Wrapped Lug 2
        const dx2 = cx + ox - 48;
        const dy2 = cy + oy - 32;
        const u2 = (dx2 - dy2) * 0.70710678;
        const v2 = (dx2 + dy2) * 0.70710678;
        const d2 = Math.sqrt((u2 / lugSemiMajor) ** 2 + (v2 / lugSemiMinor) ** 2);
        if (d2 < 1.0) {
          const h2 = Math.cos(d2 * (Math.PI / 2));
          if (h2 > maxH) maxH = h2;
        }
      }

      heightGrid[idx] = maxH;
    }
  }

  // Generate Normals, Bump, Albedo and Roughness
  const normalStrength = 4.2;
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const idx = y * size + x;
      const px = idx * 4;

      const hL = heightGrid[y * size + xm];
      const hR = heightGrid[y * size + xp];
      const hD = heightGrid[yp * size + x];
      const hU = heightGrid[ym * size + x];
      const h = heightGrid[idx];

      // Derivatives (Y inverted for WebGL tangent space)
      const dX = (hR - hL) * normalStrength;
      const dY = (hU - hD) * normalStrength;
      const dZ = 1.0;

      const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
      const nx = -dX / len;
      const ny = -dY / len;
      const nz = dZ / len;

      dataNormal[px] = Math.round((nx * 0.5 + 0.5) * 255);
      dataNormal[px + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      dataNormal[px + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      dataNormal[px + 3] = 255;

      const bVal = Math.round(h * 255);
      dataBump[px] = bVal;
      dataBump[px + 1] = bVal;
      dataBump[px + 2] = bVal;
      dataBump[px + 3] = 255;

      // Albedo wear tint map: Grayscale [0.80 .. 1.00] so p.color (#334155 / #475569)
      // retains its true calibrated brightness and tone without double-darkening!
      const noise = ((x * 13 + y * 29) % 17) - 8;
      const tintVal = Math.min(255, Math.max(190, Math.round(215 + h * 40 + noise)));
      dataColor[px] = tintVal;
      dataColor[px + 1] = tintVal;
      dataColor[px + 2] = tintVal;
      dataColor[px + 3] = 255;

      // Roughness map
      const rVal = Math.round((0.44 - h * 0.22) * 255);
      dataRough[px] = rVal;
      dataRough[px + 1] = rVal;
      dataRough[px + 2] = rVal;
      dataRough[px + 3] = 255;
    }
  }

  ctxNormal.putImageData(imgNormal, 0, 0);
  ctxBump.putImageData(imgBump, 0, 0);
  ctxColor.putImageData(imgColor, 0, 0);
  ctxRough.putImageData(imgRough, 0, 0);

  const normalTex = new THREE.CanvasTexture(canvasNormal);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(canvasBump);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.needsUpdate = true;

  const colorTex = new THREE.CanvasTexture(canvasColor);
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.needsUpdate = true;

  const roughTex = new THREE.CanvasTexture(canvasRough);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.wrapT = THREE.RepeatWrapping;
  roughTex.needsUpdate = true;

  return { colorMap: colorTex, normalMap: normalTex, bumpMap: bumpTex, roughnessMap: roughTex };
}

interface PanelDef {
  x: number;
  z: number;
  width: number;
  length: number;
  color: string;
}

interface FastenerTransform {
  x: number;
  z: number;
  rotationY: number;
}

/**
 * ModularDiamondSteelDeck:
 * Authentic, heavy modular diamond-tread steel plate floor for industrial test bays.
 * Floor surface lies strictly at Y = -2.04m in world coordinates (local Y = 0).
 */
export const ModularDiamondSteelDeck: React.FC<ModularDiamondSteelDeckProps> = ({
  position = [0, -2.04, 0],
  rotation = [0, 0, 0],
  span = 16.0,
  primaryColor = "#334155",
  metalness = 0.88,
  roughness = 0.32,
  showKerb = true,
  showHatch = true,
  hatchPosition = [1.2, 1.2],
}) => {
  // 1. Procedural PBR Diamond Tread Textures
  const { colorMap, normalMap, bumpMap, roughnessMap } = useMemo(
    () => createDiamondTreadTextures(),
    []
  );

  // 2. Palette of calibrated industrial galvanized / oxidized steel plate variations
  const plateTones = useMemo(
    () => [
      "#334155", // slate-700 primary
      "#384659", // slightly warmer graphite slate
      "#2E3A4B", // darker oxidized plate
      "#3E4D61", // slightly lighter weathered galvanized plate
      "#303E50", // deep manganese steel
      "#475569", // slate-600 specular tone
    ],
    []
  );

  // 3. Generate Modular Plate Grid (~16m x 16m total area, 1.2m x 2.4m panels)
  const { panels, fasteners, subBeams } = useMemo(() => {
    const pList: PanelDef[] = [];
    const fList: FastenerTransform[] = [];
    const beams: { x: number; z: number; w: number; l: number }[] = [];

    const nominalW = 1.2;
    const nominalL = 2.4;
    const seamGap = 0.008; // 8mm expansion seam gap
    const plateW = nominalW - seamGap;
    const plateL = nominalL - seamGap;
    const halfPlateL = nominalW - seamGap;

    const numCols = 13; // 13 * 1.2m = 15.6m inside perimeter kerb
    const startX = -((numCols - 1) * nominalW) / 2; // -7.2m

    // Hatch dimensions
    const hatchW = 1.14; // fits inside 1.2m column
    const hatchL = 0.92; // length along Z
    const hatchMinX = hatchPosition[0] - hatchW / 2;
    const hatchMaxX = hatchPosition[0] + hatchW / 2;
    const hatchMinZ = hatchPosition[1] - hatchL / 2;
    const hatchMaxZ = hatchPosition[1] + hatchL / 2;

    const addFastenersForPlate = (px: number, pz: number, pw: number, pl: number, seed: number) => {
      const insetX = pw / 2 - 0.06;
      const insetZ = pl / 2 - 0.06;
      if (insetX <= 0 || insetZ <= 0) return;

      // 4 Corner Fasteners
      const corners = [
        [-insetX, -insetZ],
        [insetX, -insetZ],
        [-insetX, insetZ],
        [insetX, insetZ],
      ];
      corners.forEach(([ox, oz], fIdx) => {
        fList.push({
          x: px + ox,
          z: pz + oz,
          rotationY: ((seed + fIdx * 3) % 6) * (Math.PI / 3),
        });
      });

      // Mid-span fasteners for panels >= 1.8m
      if (pl >= 1.8) {
        fList.push({
          x: px - insetX,
          z: pz,
          rotationY: ((seed + 2) % 6) * (Math.PI / 3),
        });
        fList.push({
          x: px + insetX,
          z: pz,
          rotationY: ((seed + 4) % 6) * (Math.PI / 3),
        });
      }
    };

    for (let c = 0; c < numCols; c++) {
      const colX = startX + c * nominalW;
      const isStaggered = c % 2 === 1;
      const colSeed = (c * 17 + 5) % 100;

      // Check if this column hosts the hatch
      const colHostsHatch =
        showHatch && Math.abs(colX - hatchPosition[0]) < 0.1;

      const rawRows = !isStaggered
        ? [
            { z: -7.2, len: halfPlateL },
            { z: -6.0, len: plateL },
            { z: -3.6, len: plateL },
            { z: -1.2, len: plateL },
            { z: 1.2, len: plateL },
            { z: 3.6, len: plateL },
            { z: 6.0, len: plateL },
            { z: 7.2, len: halfPlateL },
          ]
        : [
            { z: -6.9, len: halfPlateL * 1.5 },
            { z: -4.8, len: plateL },
            { z: -2.4, len: plateL },
            { z: 0.0, len: plateL },
            { z: 2.4, len: plateL },
            { z: 4.8, len: plateL },
            { z: 6.9, len: halfPlateL * 1.5 },
          ];

      rawRows.forEach((r, rIdx) => {
        const colorIdx = (colSeed + rIdx * 13) % plateTones.length;
        const pColor = plateTones[colorIdx];

        if (colHostsHatch) {
          const pMinZ = r.z - r.len / 2;
          const pMaxZ = r.z + r.len / 2;

          const overlapsZ = pMinZ < hatchMaxZ && pMaxZ > hatchMinZ;
          if (overlapsZ) {
            // South segment before hatch
            const southLen = hatchMinZ - pMinZ - seamGap;
            if (southLen > 0.1) {
              const southZ = pMinZ + southLen / 2;
              pList.push({
                x: colX,
                z: southZ,
                width: plateW,
                length: southLen,
                color: pColor,
              });
              addFastenersForPlate(colX, southZ, plateW, southLen, colSeed + rIdx);
            }

            // North segment after hatch
            const northLen = pMaxZ - hatchMaxZ - seamGap;
            if (northLen > 0.1) {
              const northZ = hatchMaxZ + seamGap + northLen / 2;
              pList.push({
                x: colX,
                z: northZ,
                width: plateW,
                length: northLen,
                color: pColor,
              });
              addFastenersForPlate(colX, northZ, plateW, northLen, colSeed + rIdx + 7);
            }
            return;
          }
        }

        // Standard panel
        pList.push({
          x: colX,
          z: r.z,
          width: plateW,
          length: r.len,
          color: pColor,
        });
        addFastenersForPlate(colX, r.z, plateW, r.len, colSeed + rIdx);
      });

      // Longitudinal sub-frame structural beam beneath each column seam
      beams.push({
        x: colX + nominalW / 2,
        z: 0,
        w: 0.045,
        l: 15.6,
      });
    }

    return { panels: pList, fasteners: fList, subBeams: beams };
  }, [plateTones, showHatch, hatchPosition]);

  // 4. Instanced Meshes for Countersunk Washers & Hex Bolts
  const collarMeshRef = useRef<THREE.InstancedMesh>(null);
  const hexMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!collarMeshRef.current || !hexMeshRef.current || fasteners.length === 0) return;

    const dummy = new THREE.Object3D();
    const count = fasteners.length;

    for (let i = 0; i < count; i++) {
      const f = fasteners[i];

      // Countersunk bevel collar sitting at Y = -0.0005 (recessed into plate top)
      dummy.position.set(f.x, -0.0005, f.z);
      dummy.rotation.set(0, f.rotationY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      collarMeshRef.current.setMatrixAt(i, dummy.matrix);

      // Grade 10.9 hex bolt head sitting proud at Y = +0.0015 so it catches raking specular highlights!
      dummy.position.set(f.x, 0.0015, f.z);
      dummy.rotation.set(0, f.rotationY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      hexMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    collarMeshRef.current.instanceMatrix.needsUpdate = true;
    hexMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [fasteners]);

  const sharedMaterialProps = useMemo(
    () => ({
      metalness,
      roughness,
      envMapIntensity: 0.75,
      normalMap: normalMap ?? undefined,
      normalScale: new THREE.Vector2(1.2, 1.2),
      bumpMap: bumpMap ?? undefined,
      bumpScale: 0.0035,
      roughnessMap: roughnessMap ?? undefined,
      map: colorMap ?? undefined,
    }),
    [metalness, roughness, normalMap, bumpMap, roughnessMap, colorMap]
  );

  return (
    <group position={position} rotation={rotation}>
      {/* ------------------------------------------------------------- */}
      {/* A. CONTINUOUS SUB-FLOOR STRUCTURAL BED & RECESSED SEAM BACKING */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[0, -0.065, 0]}>
        <boxGeometry args={[span, 0.05, span]} />
        <meshStandardMaterial color="#0B0F19" roughness={0.96} metalness={0.5} />
      </mesh>

      {/* Longitudinal dark structural steel backing channels beneath modular seams */}
      {subBeams.map((b, idx) => (
        <mesh key={`beam-${idx}`} position={[b.x, -0.039, b.z]}>
          <boxGeometry args={[b.w, 0.015, b.l]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} metalness={0.7} />
        </mesh>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* B. MODULAR HEAVY DIAMOND-TREAD STEEL PLATES                   */}
      {/* Surface top lies strictly at local Y = 0 (world Y = -2.04)    */}
      {/* ------------------------------------------------------------- */}
      {panels.map((p, idx) => (
        <group key={`plate-${idx}`} position={[p.x, -0.019, p.z]}>
          <RoundedBox
            args={[p.width, 0.038, p.length]}
            radius={0.003}
            smoothness={4}
          >
            <meshStandardMaterial
              color={p.color}
              {...sharedMaterialProps}
            />
          </RoundedBox>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* C. FASTENERS: COUNTERSUNK WASHERS + GRADE 10.9 HEX BOLTS       */}
      {/* ------------------------------------------------------------- */}
      {/* Countersunk Bevel Collars (44mm diameter) */}
      <instancedMesh
        ref={collarMeshRef}
        args={[undefined, undefined, fasteners.length]}
      >
        <cylinderGeometry args={[0.022, 0.015, 0.004, 16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.8} />
      </instancedMesh>

      {/* Grade 10.9 Machined Hex Bolt Heads (26mm hex head, bright metallic sheen) */}
      <instancedMesh
        ref={hexMeshRef}
        args={[undefined, undefined, fasteners.length]}
      >
        <cylinderGeometry args={[0.013, 0.013, 0.005, 6]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.14} metalness={0.98} />
      </instancedMesh>

      {/* ------------------------------------------------------------- */}
      {/* D. EMBEDDED MAINTENANCE UTILITY ACCESS HATCH                   */}
      {/* Recessed rectangular service hatch with perimeter gasket seal  */}
      {/* and flush drop-handle / finger pull ring.                      */}
      {/* ------------------------------------------------------------- */}
      {showHatch && (
        <group position={[hatchPosition[0], 0, hatchPosition[1]]}>
          {/* 1. Sub-floor Service Trench Pit */}
          <group position={[0, -0.22, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.16, 0.36, 0.94]} />
              <meshStandardMaterial color="#070B14" roughness={0.98} metalness={0.3} />
            </mesh>
            {/* Internal Trench Conduits / Cables visible below */}
            <mesh position={[0, -0.08, -0.2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 1.14, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.85} />
            </mesh>
            <mesh position={[0, -0.08, 0.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.026, 0.026, 1.14, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.9} />
            </mesh>
          </group>

          {/* 2. Coaming Outer Frame (Angle-iron rim with perimeter bolts) */}
          <group position={[0, -0.018, 0]}>
            {/* Frame Rim North & South */}
            <mesh position={[0, 0.009, 0.445]}>
              <boxGeometry args={[1.16, 0.02, 0.05]} />
              <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.009, -0.445]}>
              <boxGeometry args={[1.16, 0.02, 0.05]} />
              <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.85} />
            </mesh>
            {/* Frame Rim East & West */}
            <mesh position={[0.555, 0.009, 0]}>
              <boxGeometry args={[0.05, 0.02, 0.84]} />
              <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.85} />
            </mesh>
            <mesh position={[-0.555, 0.009, 0]}>
              <boxGeometry args={[0.05, 0.02, 0.84]} />
              <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.85} />
            </mesh>

            {/* Perimeter Mounting Frame Hex Bolts (12 frame bolts) */}
            {[-0.45, -0.22, 0, 0.22, 0.45].map((bx, bIdx) => (
              <React.Fragment key={`fb-ns-${bIdx}`}>
                <mesh position={[bx, 0.0195, 0.445]}>
                  <cylinderGeometry args={[0.009, 0.009, 0.003, 6]} />
                  <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
                </mesh>
                <mesh position={[bx, 0.0195, -0.445]}>
                  <cylinderGeometry args={[0.009, 0.009, 0.003, 6]} />
                  <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
                </mesh>
              </React.Fragment>
            ))}
          </group>

          {/* 3. Perimeter Gasket Seal Groove (Recessed channel with black neoprene seal) */}
          <group position={[0, -0.009, 0]}>
            <mesh position={[0, 0, 0.415]}>
              <boxGeometry args={[1.06, 0.008, 0.014]} />
              <meshStandardMaterial color="#080C14" roughness={0.96} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0, -0.415]}>
              <boxGeometry args={[1.06, 0.008, 0.014]} />
              <meshStandardMaterial color="#080C14" roughness={0.96} metalness={0.05} />
            </mesh>
            <mesh position={[0.525, 0, 0]}>
              <boxGeometry args={[0.014, 0.008, 0.816]} />
              <meshStandardMaterial color="#080C14" roughness={0.96} metalness={0.05} />
            </mesh>
            <mesh position={[-0.525, 0, 0]}>
              <boxGeometry args={[0.014, 0.008, 0.816]} />
              <meshStandardMaterial color="#080C14" roughness={0.96} metalness={0.05} />
            </mesh>
          </group>

          {/* 4. Flush Heavy Steel Hatch Lid with Diamond Tread */}
          {/* Top surface sits strictly at local Y = 0 */}
          <group position={[0, -0.0175, 0]}>
            <RoundedBox args={[1.04, 0.035, 0.81]} radius={0.0025} smoothness={4}>
              <meshStandardMaterial
                color="#2E3A4B"
                {...sharedMaterialProps}
              />
            </RoundedBox>

            {/* Brass Stamped Technical Placard: "UTILITY TRENCH UT-04 // 35 kN" */}
            <mesh position={[0.28, 0.0178, 0.22]}>
              <boxGeometry args={[0.22, 0.001, 0.09]} />
              <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.92} />
            </mesh>
            {/* Placard Mount Screws */}
            {[-0.095, 0.095].map((sx, sIdx) => (
              <mesh key={`sc-${sIdx}`} position={[0.28 + sx, 0.0185, 0.22]}>
                <cylinderGeometry args={[0.003, 0.003, 0.002, 12]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.15} metalness={0.98} />
              </mesh>
            ))}

            {/* Corner Hazard Chevron Safety Markings (Yellow & Black powder-coat) */}
            {[
              [-0.46, -0.34],
              [0.46, -0.34],
              [-0.46, 0.34],
              [0.46, 0.34],
            ].map(([cx, cz], cIdx) => (
              <mesh key={`haz-${cIdx}`} position={[cx, 0.0178, cz]}>
                <boxGeometry args={[0.07, 0.001, 0.07]} />
                <meshStandardMaterial color="#EAB308" roughness={0.4} metalness={0.2} />
              </mesh>
            ))}
          </group>

          {/* 5. Heavy Industrial Leaf Hinges (Mounted on rear edge Z = +0.415m) */}
          {[-0.34, 0.34].map((hx, hIdx) => (
            <group key={`hinge-${hIdx}`} position={[hx, 0.003, 0.412]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.014, 0.014, 0.09, 18]} />
                <meshStandardMaterial color="#475569" roughness={0.28} metalness={0.92} />
              </mesh>
              <mesh position={[0.047, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.009, 0.009, 0.006, 16]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.96} />
              </mesh>
              <mesh position={[0, -0.008, -0.024]}>
                <boxGeometry args={[0.07, 0.008, 0.035]} />
                <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
              </mesh>
            </group>
          ))}

          {/* 6. Flush Drop-Handle / Finger Pull Ring (Recessed Flush into Hatch Lid) */}
          <group position={[0, 0, -0.24]}>
            {/* Recessed Pocket Cup (recessed 18mm below walking surface) */}
            <mesh position={[0, -0.012, 0]}>
              <cylinderGeometry args={[0.052, 0.046, 0.024, 24]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.6} />
            </mesh>

            {/* Chamfered Pocket Bezel Ring */}
            <mesh position={[0, -0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.051, 0.004, 12, 24]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
            </mesh>

            {/* Horizontal Hinge Pivot Bar across top of pocket */}
            <mesh position={[0, -0.008, 0.026]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.07, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.18} metalness={0.95} />
            </mesh>

            {/* Heavy Forged Steel D-Ring Drop Handle (Lies completely flat at Y = -0.010m) */}
            <group position={[0, -0.010, -0.005]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh>
                <torusGeometry args={[0.026, 0.005, 16, 28, Math.PI]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.18} metalness={0.96} />
              </mesh>
              {/* Closing cross-bar of D-ring */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.005, 0.005, 0.052, 16]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.18} metalness={0.96} />
              </mesh>
            </group>

            {/* Twin Rubber Bumpers at bottom of pocket */}
            {[-0.022, 0.022].map((bx, bIdx) => (
              <mesh key={`bump-${bIdx}`} position={[bx, -0.023, -0.018]}>
                <cylinderGeometry args={[0.006, 0.006, 0.003, 12]} />
                <meshStandardMaterial color="#0A0F1A" roughness={0.95} metalness={0.05} />
              </mesh>
            ))}
          </group>

          {/* Emergency Pry-Bar Lifting Slot Notch on front edge */}
          <mesh position={[0, -0.007, -0.405]}>
            <boxGeometry args={[0.065, 0.014, 0.015]} />
            <meshStandardMaterial color="#0B0F19" roughness={0.9} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* E. WELDED PERIMETER ANGLE-IRON KERB FRAMING (16m x 16m)       */}
      {/* 75mm raised vertical toe-board lip + welded gusset stiffeners */}
      {/* and concrete floor anchor baseplates.                         */}
      {/* ------------------------------------------------------------- */}
      {showKerb && (
        <group position={[0, 0, 0]}>
          {/* North, South, East, West Kerb Rails */}
          {[
            // North Kerb: Z = +7.94m
            { pos: [0, 0.0375, span / 2 - 0.06], size: [span, 0.075, 0.014], rotY: 0 },
            // South Kerb: Z = -7.94m
            { pos: [0, 0.0375, -span / 2 + 0.06], size: [span, 0.075, 0.014], rotY: 0 },
            // East Kerb: X = +7.94m
            { pos: [span / 2 - 0.06, 0.0375, 0], size: [span - 0.12, 0.075, 0.014], rotY: Math.PI / 2 },
            // West Kerb: X = -7.94m
            { pos: [-span / 2 + 0.06, 0.0375, 0], size: [span - 0.12, 0.075, 0.014], rotY: Math.PI / 2 },
          ].map((k, kIdx) => (
            <mesh
              key={`kerb-lip-${kIdx}`}
              position={k.pos as [number, number, number]}
              rotation={[0, k.rotY, 0]}
            >
              <boxGeometry args={k.size as [number, number, number]} />
              <meshStandardMaterial
                color="#1E293B"
                roughness={0.38}
                metalness={0.85}
              />
            </mesh>
          ))}

          {/* Horizontal Base Flanges (welded to deck edge) */}
          {[
            { pos: [0, -0.006, span / 2 - 0.10], size: [span, 0.012, 0.09], rotY: 0 },
            { pos: [0, -0.006, -span / 2 + 0.10], size: [span, 0.012, 0.09], rotY: 0 },
            { pos: [span / 2 - 0.10, -0.006, 0], size: [span - 0.2, 0.012, 0.09], rotY: Math.PI / 2 },
            { pos: [-span / 2 + 0.10, -0.006, 0], size: [span - 0.2, 0.012, 0.09], rotY: Math.PI / 2 },
          ].map((f, fIdx) => (
            <mesh
              key={`kerb-flange-${fIdx}`}
              position={f.pos as [number, number, number]}
              rotation={[0, f.rotY, 0]}
            >
              <boxGeometry args={f.size as [number, number, number]} />
              <meshStandardMaterial color="#1E293B" roughness={0.42} metalness={0.85} />
            </mesh>
          ))}

          {/* Welded Triangular Gusset Stiffeners & Anchor Studs (every 1.6m along 4 sides) */}
          {[-6.4, -4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8, 6.4].map((offset, gIdx) => (
            <React.Fragment key={`gusset-group-${gIdx}`}>
              {/* North side gusset & anchor */}
              <group position={[offset, 0, span / 2 - 0.06]}>
                <mesh position={[0, 0.03, -0.035]}>
                  <boxGeometry args={[0.01, 0.058, 0.058]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.88} />
                </mesh>
                <mesh position={[0, -0.002, -0.08]}>
                  <boxGeometry args={[0.11, 0.014, 0.08]} />
                  <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.016, -0.08]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
                  <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.95} />
                </mesh>
              </group>

              {/* South side gusset & anchor */}
              <group position={[offset, 0, -span / 2 + 0.06]}>
                <mesh position={[0, 0.03, 0.035]}>
                  <boxGeometry args={[0.01, 0.058, 0.058]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.88} />
                </mesh>
                <mesh position={[0, -0.002, 0.08]}>
                  <boxGeometry args={[0.11, 0.014, 0.08]} />
                  <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.016, 0.08]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
                  <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.95} />
                </mesh>
              </group>

              {/* East side gusset & anchor */}
              <group position={[span / 2 - 0.06, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
                <mesh position={[0, 0.03, 0.035]}>
                  <boxGeometry args={[0.01, 0.058, 0.058]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.88} />
                </mesh>
                <mesh position={[0, -0.002, 0.08]}>
                  <boxGeometry args={[0.11, 0.014, 0.08]} />
                  <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.016, 0.08]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
                  <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.95} />
                </mesh>
              </group>

              {/* West side gusset & anchor */}
              <group position={[-span / 2 + 0.06, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
                <mesh position={[0, 0.03, -0.035]}>
                  <boxGeometry args={[0.01, 0.058, 0.058]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.88} />
                </mesh>
                <mesh position={[0, -0.002, -0.08]}>
                  <boxGeometry args={[0.11, 0.014, 0.08]} />
                  <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.016, -0.08]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
                  <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.95} />
                </mesh>
              </group>
            </React.Fragment>
          ))}

          {/* 4 Corner Welded 45-degree Miter Beads */}
          {[
            [span / 2 - 0.06, span / 2 - 0.06, Math.PI / 4],
            [-span / 2 + 0.06, span / 2 - 0.06, -Math.PI / 4],
            [span / 2 - 0.06, -span / 2 + 0.06, -Math.PI / 4],
            [-span / 2 + 0.06, -span / 2 + 0.06, Math.PI / 4],
          ].map(([mx, mz, mRot], mIdx) => (
            <mesh
              key={`miter-${mIdx}`}
              position={[mx, 0.038, mz]}
              rotation={[0, mRot, 0]}
            >
              <cylinderGeometry args={[0.008, 0.008, 0.06, 12]} />
              <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.8} />
            </mesh>
          ))}

          {/* Yellow / Black Hazard Chevrons on Front Entry Kerb */}
          {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((hx, hIdx) => (
            <mesh
              key={`hz-stripe-${hIdx}`}
              position={[hx, 0.076, span / 2 - 0.06]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[0.38, 0.002, 0.015]} />
              <meshStandardMaterial
                color={hIdx % 2 === 0 ? "#EAB308" : "#0F172A"}
                roughness={0.45}
                metalness={0.2}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

export default ModularDiamondSteelDeck;
