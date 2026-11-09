import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export interface RivetedSteelWallProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  showUtilities?: boolean;
  showHazardMarkings?: boolean;
  showStiffeners?: boolean;
  showFloodlights?: boolean;
}

// ============================================================================
// Procedural High-Resolution Industrial Stencil Textures
// ============================================================================

function createSectorStencilTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark weathered plate base
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(0, 0, 1024, 256);

  // Outer stencil border
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 992, 224);

  // Corner mounting notches
  ctx.fillStyle = "#0F172A";
  [
    [32, 32],
    [992, 32],
    [32, 224],
    [992, 224],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Stencil Text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Main Sector Header
  ctx.fillStyle = "#F1F5F9";
  ctx.font = "900 64px 'Courier New', monospace, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("SECTOR 04 • HEAVY FABRICATION", 512, 95);

  // Subtitle with tracking
  ctx.fillStyle = "#94A3B8";
  ctx.font = "700 32px 'Courier New', monospace, sans-serif";
  ctx.fillText("CRANE CAPACITY 50T • BULKHEAD CELL B-12", 512, 170);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createHazardStencilTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 512, 512);

  // Top Danger Red Bar
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(16, 16, 480, 130);

  // "DANGER" in White
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 68px system-ui, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("DANGER", 256, 80);

  // Black Divider
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(16, 146, 480, 12);

  // Warning text
  ctx.fillStyle = "#0F172A";
  ctx.font = "900 48px system-ui, sans-serif";
  ctx.fillText("480 VOLTS", 256, 210);

  ctx.font = "700 32px system-ui, sans-serif";
  ctx.fillText("HIGH VOLTAGE", 256, 270);
  ctx.fillText("AUTHORIZED", 256, 325);
  ctx.fillText("PERSONNEL ONLY", 256, 375);

  // Bottom Caution Diagonal Stripes
  const stripeH = 65;
  const startY = 430;
  ctx.fillStyle = "#EAB308";
  ctx.fillRect(16, startY, 480, stripeH);

  ctx.fillStyle = "#0F172A";
  const numStripes = 10;
  for (let i = 0; i < numStripes; i++) {
    ctx.beginPath();
    const sx = 16 + i * 50;
    ctx.moveTo(sx, startY + stripeH);
    ctx.lineTo(sx + 30, startY + stripeH);
    ctx.lineTo(sx + 55, startY);
    ctx.lineTo(sx + 25, startY);
    ctx.closePath();
    ctx.fill();
  }

  // Border
  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================================================
// Main Riveted Steel Bulkhead Wall Component
// ============================================================================

export const RivetedSteelWall: React.FC<RivetedSteelWallProps> = ({
  position = [0, 1.5, -6.5],
  rotation = [0, 0, 0],
  scale = 1.0,
  showUtilities = true,
  showHazardMarkings = true,
  showStiffeners = true,
  showFloodlights = true,
}) => {
  // 1. Procedural High-Res Stencil Textures
  const sectorTexture = useMemo(() => createSectorStencilTexture(), []);
  const hazardTexture = useMemo(() => createHazardStencilTexture(), []);

  // 2. Overlapping Heavy Steel Armor / Boiler Plate Grid (5 Tiers x 6 Bays = 30 Plates)
  const plates = useMemo(() => {
    const colEdges = [-10.0, -6.67, -3.33, 0.0, 3.33, 6.67, 10.0];
    const rowEdges = [-7.0, -4.2, -1.4, 1.4, 4.2, 7.0];
    const platePalette = [
      { color: "#1E293B", roughness: 0.52, metalness: 0.82 },
      { color: "#253346", roughness: 0.49, metalness: 0.85 },
      { color: "#1A2433", roughness: 0.55, metalness: 0.80 },
      { color: "#2D3B4E", roughness: 0.47, metalness: 0.87 },
      { color: "#212C3C", roughness: 0.53, metalness: 0.83 },
      { color: "#273549", roughness: 0.50, metalness: 0.84 },
    ];

    const result = [];
    for (let r = 0; r < rowEdges.length - 1; r++) {
      const y0 = rowEdges[r];
      const y1 = rowEdges[r + 1];
      const cy = (y0 + y1) / 2;
      const h = y1 - y0 + 0.16; // Lap overlap margin

      for (let c = 0; c < colEdges.length - 1; c++) {
        const x0 = colEdges[c];
        const x1 = colEdges[c + 1];
        const cx = (x0 + x1) / 2;
        const w = x1 - x0 + 0.18; // Lap overlap margin

        // Pronounced 45mm Step-Down Relief between alternating shiplap plates
        const isOuter = (r + c) % 2 === 1;
        const z = isOuter ? 0.045 : 0.0;
        const depth = 0.04; // 40mm thick boiler plate

        const paletteIdx = (r * 2 + c * 3) % platePalette.length;
        const mat = platePalette[paletteIdx];

        result.push({
          id: `plate-${r}-${c}`,
          x: cx,
          y: cy,
          z,
          w,
          h,
          depth,
          color: mat.color,
          roughness: mat.roughness,
          metalness: mat.metalness,
        });
      }
    }
    return result;
  }, []);

  // 3. Volumetric 3D Rivet Coordinate Calculation (Dense Arrays across seams, lap joints & flanges)
  const { rivetMesh } = useMemo(() => {
    const coords: [number, number, number][] = [];

    // A. 5 Vertical I-Beam Columns Front Flange Rivets (Double row down each column)
    const columnXs = [-8.0, -4.0, 0.0, 4.0, 8.0];
    const flangeZ = 0.418; // Sits directly on outermost face of I-beam front flange
    const flangeHalfOffset = 0.14; // Spread across 0.38m flange width

    columnXs.forEach((colX) => {
      // 62 rivets per line from y = -6.7 to +6.7 (spacing ~0.22m)
      for (let y = -6.7; y <= 6.75; y += 0.22) {
        coords.push([colX - flangeHalfOffset, y, flangeZ]);
        coords.push([colX + flangeHalfOffset, y, flangeZ]);
      }
    });

    // B. 4 Horizontal Stiffener C-Channel Rails Rivets
    const channelYs = [-4.5, -1.0, 2.5, 5.8];
    const channelZ = 0.132;
    channelYs.forEach((chY) => {
      for (let x = -9.75; x <= 9.8; x += 0.24) {
        // Skip points directly behind I-beam columns to avoid buried geometry
        const nearColumn = columnXs.some((cx) => Math.abs(x - cx) < 0.24);
        if (!nearColumn) {
          coords.push([x, chY + 0.07, channelZ]);
          coords.push([x, chY - 0.07, channelZ]);
        }
      }
    });

    // C. Vertical Boiler Plate Lap-Joint Seams (Staggered double rows)
    const seamXs = [-6.67, -3.33, 3.33, 6.67];
    const lapZ = 0.068; // On top of outer overlapping plate
    seamXs.forEach((sx) => {
      let toggle = false;
      for (let y = -6.8; y <= 6.85; y += 0.19) {
        const xOffset = toggle ? -0.05 : 0.05;
        const nearChannel = channelYs.some((cy) => Math.abs(y - cy) < 0.14);
        if (!nearChannel) {
          coords.push([sx + xOffset, y, lapZ]);
        }
        toggle = !toggle;
      }
    });

    // D. Horizontal Seam Splice Lines
    const horizSeamYs = [-4.2, 1.4, 4.2];
    horizSeamYs.forEach((sy) => {
      for (let x = -9.6; x <= 9.7; x += 0.22) {
        const nearColumn = columnXs.some((cx) => Math.abs(x - cx) < 0.26);
        if (!nearColumn) {
          coords.push([x, sy + 0.04, lapZ]);
        }
      }
    });

    // E. Structural Column Footings & Gusset Plate Rivets
    columnXs.forEach((colX) => {
      // Footing mounting rivets (8 per column footing)
      [-0.26, -0.15, 0.15, 0.26].forEach((fx) => {
        coords.push([colX + fx, -6.82, 0.44]);
        coords.push([colX + fx, -6.65, 0.44]);
      });

      // Gusset plate connection rivets (5 levels per column)
      [-5.2, -2.5, 0.0, 2.5, 5.5].forEach((gy) => {
        coords.push([colX - 0.16, gy + 0.14, 0.24]);
        coords.push([colX + 0.16, gy + 0.14, 0.24]);
        coords.push([colX - 0.16, gy - 0.14, 0.24]);
        coords.push([colX + 0.16, gy - 0.14, 0.24]);
        coords.push([colX - 0.28, gy, 0.16]);
        coords.push([colX + 0.28, gy, 0.16]);
      });
    });

    // Create authentic 3D Hemispherical Rivet Geometry (dome facing +Z)
    const rivetRadius = 0.024; // 48mm diameter authentic boiler rivet
    const rivetGeo = new THREE.SphereGeometry(rivetRadius, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    rivetGeo.rotateX(Math.PI / 2);

    const rivetMat = new THREE.MeshStandardMaterial({
      color: "#64748B",
      roughness: 0.38,
      metalness: 0.90,
    });

    const count = coords.length;
    const mesh = new THREE.InstancedMesh(rivetGeo, rivetMat, count);
    const dummy = new THREE.Object3D();

    coords.forEach((c, i) => {
      dummy.position.set(c[0], c[1], c[2]);
      // Organic hammered / hydraulically peened rotational jitter
      dummy.rotation.set(0, 0, (i * 0.47) % (Math.PI * 2));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    return { rivetMesh: mesh };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ================================================================== */}
      {/* 1. STRUCTURAL SUBSTRATE & HEAVY BACKING CASING                     */}
      {/* ================================================================== */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[20.4, 14.4, 0.06]} />
        <meshStandardMaterial color="#0B121E" roughness={0.7} metalness={0.75} />
      </mesh>

      {/* ================================================================== */}
      {/* 2. OVERLAPPING HEAVY STEEL BOILER PLATES (Lap Joints with Relief)  */}
      {/* ================================================================== */}
      {plates.map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
          <mesh>
            <boxGeometry args={[p.w, p.h, p.depth]} />
            <meshStandardMaterial
              color={p.color}
              roughness={p.roughness}
              metalness={p.metalness}
            />
          </mesh>
        </group>
      ))}

      {/* Horizontal & Vertical Seam Butt Straps (Splice Plates with Bevel Relief) */}
      {[-4.2, 1.4, 4.2].map((sy, idx) => (
        <mesh key={`h-strap-${idx}`} position={[0, sy, 0.058]}>
          <boxGeometry args={[19.8, 0.16, 0.02]} />
          <meshStandardMaterial color="#1E293B" roughness={0.46} metalness={0.86} />
        </mesh>
      ))}
      {[-6.67, -3.33, 3.33, 6.67].map((sx, idx) => (
        <mesh key={`v-strap-${idx}`} position={[sx, 0, 0.058]}>
          <boxGeometry args={[0.18, 13.8, 0.02]} />
          <meshStandardMaterial color="#242E3D" roughness={0.48} metalness={0.85} />
        </mesh>
      ))}

      {/* ================================================================== */}
      {/* 3. VERTICAL STRUCTURAL STEEL I-BEAM COLUMNS (5 Heavy Columns)     */}
      {/* ================================================================== */}
      {[-8.0, -4.0, 0.0, 4.0, 8.0].map((colX, i) => (
        <group key={`col-${i}`} position={[colX, 0, 0]}>
          {/* I-Beam Rear Flange (Anchored against wall plates) */}
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[0.38, 14.0, 0.03]} />
            <meshStandardMaterial color="#2E3C4E" roughness={0.44} metalness={0.88} />
          </mesh>

          {/* I-Beam Central Web Plate (Massive deep structural spine) */}
          <mesh position={[0, 0, 0.235]}>
            <boxGeometry args={[0.032, 14.0, 0.35]} />
            <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.88} />
          </mesh>

          {/* I-Beam Front Flange (Outermost facing camera) */}
          <mesh position={[0, 0, 0.40]}>
            <boxGeometry args={[0.38, 14.0, 0.036]} />
            <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.88} />
          </mesh>

          {/* Base Footing Mount (Stepped Heavy Cast Footing resting on floor) */}
          <group position={[0, -6.86, 0.25]}>
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[0.74, 0.16, 0.62]} />
              <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.80} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.56, 0.12, 0.48]} />
              <meshStandardMaterial color="#253243" roughness={0.50} metalness={0.82} />
            </mesh>
            {/* 4 Heavy Foundation Anchor Hex Nuts & Studs */}
            {[
              [-0.26, 0.14],
              [0.26, 0.14],
              [-0.26, 0.40],
              [0.26, 0.40],
            ].map(([nx, nz], ni) => (
              <group key={`nut-${ni}`} position={[nx, 0.14, nz]}>
                <mesh>
                  <cylinderGeometry args={[0.042, 0.042, 0.07, 6]} />
                  <meshStandardMaterial color="#64748B" roughness={0.32} metalness={0.94} />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.06, 16]} />
                  <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.96} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Triangular Web Gusset Stiffeners (5 Elevation Levels) */}
          {[-5.2, -2.5, 0.0, 2.5, 5.5].map((gy, gi) => (
            <group key={`gusset-${gi}`} position={[0, gy, 0.235]}>
              {/* Internal Left & Right Web Rib Stiffeners */}
              <mesh position={[-0.09, 0, 0]}>
                <boxGeometry args={[0.15, 0.024, 0.32]} />
                <meshStandardMaterial color="#2B384B" roughness={0.46} metalness={0.84} />
              </mesh>
              <mesh position={[0.09, 0, 0]}>
                <boxGeometry args={[0.15, 0.024, 0.32]} />
                <meshStandardMaterial color="#2B384B" roughness={0.46} metalness={0.84} />
              </mesh>

              {/* External Triangular Brackets to Wall */}
              <mesh position={[-0.25, 0, -0.09]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.22, 0.22, 0.024]} />
                <meshStandardMaterial color="#1E293B" roughness={0.48} metalness={0.82} />
              </mesh>
              <mesh position={[0.25, 0, -0.09]} rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.22, 0.22, 0.024]} />
                <meshStandardMaterial color="#1E293B" roughness={0.48} metalness={0.82} />
              </mesh>
            </group>
          ))}

          {/* Top Crane Gantry Bracket Seat (Level 5.8m) */}
          <group position={[0, 5.8, 0.42]}>
            <RoundedBox args={[0.46, 0.18, 0.22]} radius={0.015} smoothness={4}>
              <meshStandardMaterial color="#1E293B" roughness={0.42} metalness={0.88} />
            </RoundedBox>
            {/* Triangular knee brace beneath */}
            <mesh position={[0, -0.18, -0.08]} rotation={[Math.PI / 4, 0, 0]}>
              <boxGeometry args={[0.16, 0.28, 0.028]} />
              <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.86} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ================================================================== */}
      {/* 4. HORIZONTAL STIFFENER RAILS (C-Channels & Crane Runway Beam)    */}
      {/* ================================================================== */}
      {showStiffeners && (
        <>
          {/* 4 Heavy Horizontal C-Channels */}
          {[-4.5, -1.0, 2.5, 5.8].map((chY, ci) => (
            <group key={`chan-${ci}`} position={[0, chY, 0]}>
              {/* Channel Web Plate */}
              <mesh position={[0, 0, 0.105]}>
                <boxGeometry args={[19.8, 0.18, 0.026]} />
                <meshStandardMaterial color="#1F2937" roughness={0.45} metalness={0.86} />
              </mesh>
              {/* Top Flange */}
              <mesh position={[0, 0.08, 0.14]}>
                <boxGeometry args={[19.8, 0.024, 0.08]} />
                <meshStandardMaterial color="#1F2937" roughness={0.45} metalness={0.86} />
              </mesh>
              {/* Bottom Flange */}
              <mesh position={[0, -0.08, 0.14]}>
                <boxGeometry args={[19.8, 0.024, 0.08]} />
                <meshStandardMaterial color="#1F2937" roughness={0.45} metalness={0.86} />
              </mesh>
            </group>
          ))}

          {/* Continuous Crane Runway Heavy Rail atop Level 5.8m */}
          <group position={[0, 5.94, 0.44]}>
            <mesh>
              <boxGeometry args={[19.8, 0.10, 0.11]} />
              <meshStandardMaterial color="#475569" roughness={0.30} metalness={0.94} />
            </mesh>
            {/* Crane rail guide crown */}
            <mesh position={[0, 0.055, 0]}>
              <boxGeometry args={[19.8, 0.02, 0.06]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.20} metalness={0.96} />
            </mesh>
          </group>

          {/* Lower Impact Wainscot Curb Protection Bar */}
          <mesh position={[0, -6.9, 0.20]}>
            <boxGeometry args={[19.8, 0.20, 0.14]} />
            <meshStandardMaterial color="#111827" roughness={0.65} metalness={0.7} />
          </mesh>
        </>
      )}

      {/* ================================================================== */}
      {/* 5. VOLUMETRIC 3D RIVET ARRAYS (Instanced Hemispherical Geometry)  */}
      {/* ================================================================== */}
      <primitive object={rivetMesh} />

      {/* ================================================================== */}
      {/* 6. INDUSTRIAL UTILITY SYSTEMS (Electrical & Pneumatics)            */}
      {/* ================================================================== */}
      {showUtilities && (
        <group name="IndustrialUtilities">
          {/* A. Main 480V Heavy Industrial Electrical Distribution Enclosure */}
          <group position={[-2.1, -0.5, 0.26]}>
            {/* Outer Box Enclosure */}
            <RoundedBox args={[0.85, 1.15, 0.28]} radius={0.025} smoothness={4}>
              <meshStandardMaterial color="#232F3E" roughness={0.50} metalness={0.72} />
            </RoundedBox>

            {/* Recessed Enclosure Door Panel with Chamfer */}
            <RoundedBox
              args={[0.76, 1.05, 0.04]}
              radius={0.015}
              smoothness={4}
              position={[0, 0, 0.145]}
            >
              <meshStandardMaterial color="#1A2332" roughness={0.52} metalness={0.75} />
            </RoundedBox>

            {/* Heavy Cast Door Hinges (Left side) */}
            {[-0.40, 0.40].map((hy, idx) => (
              <mesh key={`hinge-${idx}`} position={[-0.39, hy, 0.145]}>
                <cylinderGeometry args={[0.024, 0.024, 0.11, 16]} />
                <meshStandardMaterial color="#475569" roughness={0.32} metalness={0.92} />
              </mesh>
            ))}

            {/* Heavy Industrial Chrome Latch Handles (Right side) */}
            {[-0.28, 0.28].map((ly, idx) => (
              <mesh key={`latch-${idx}`} position={[0.36, ly, 0.165]}>
                <boxGeometry args={[0.045, 0.14, 0.04]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.20} metalness={0.96} />
              </mesh>
            ))}

            {/* Rotary Safety Disconnect Switch */}
            <group position={[0.22, 0.26, 0.17]}>
              {/* Yellow Square Bezel */}
              <RoundedBox args={[0.14, 0.14, 0.024]} radius={0.01} smoothness={4}>
                <meshStandardMaterial color="#EAB308" roughness={0.35} metalness={0.30} />
              </RoundedBox>
              {/* Red Rotary Lever Handle */}
              <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0.4]}>
                <boxGeometry args={[0.035, 0.11, 0.035]} />
                <meshStandardMaterial color="#DC2626" roughness={0.30} metalness={0.40} />
              </mesh>
            </group>

            {/* Status Pilot Indicator Lamps */}
            {/* Green "POWER ON / LIVE BUS" */}
            <group position={[-0.20, 0.40, 0.17]}>
              <mesh>
                <cylinderGeometry args={[0.024, 0.024, 0.03, 16]} />
                <meshStandardMaterial
                  color="#22C55E"
                  emissive="#22C55E"
                  emissiveIntensity={4.0}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[0, 0, -0.012]}>
                <cylinderGeometry args={[0.034, 0.034, 0.012, 16]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>

            {/* Amber "FAULT / TRIP" */}
            <group position={[-0.08, 0.40, 0.17]}>
              <mesh>
                <cylinderGeometry args={[0.024, 0.024, 0.03, 16]} />
                <meshStandardMaterial
                  color="#F59E0B"
                  emissive="#F59E0B"
                  emissiveIntensity={3.0}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[0, 0, -0.012]}>
                <cylinderGeometry args={[0.034, 0.034, 0.012, 16]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>

            {/* Warning Stencil Plate mounted on enclosure door */}
            {hazardTexture && (
              <mesh position={[-0.08, -0.14, 0.172]}>
                <planeGeometry args={[0.42, 0.42]} />
                <meshStandardMaterial map={hazardTexture} roughness={0.35} metalness={0.2} />
              </mesh>
            )}
          </group>

          {/* B. Secondary Terminal Junction Box (Right Wing) */}
          <group position={[2.2, 1.1, 0.22]}>
            <RoundedBox args={[0.55, 0.68, 0.20]} radius={0.018} smoothness={4}>
              <meshStandardMaterial color="#2B374A" roughness={0.48} metalness={0.78} />
            </RoundedBox>
            {/* Box Front Face Plate with 4 Corner Hex Screws */}
            <mesh position={[0, 0, 0.105]}>
              <planeGeometry args={[0.48, 0.60]} />
              <meshStandardMaterial color="#1E293B" roughness={0.52} metalness={0.80} />
            </mesh>
            {[
              [-0.22, -0.27],
              [0.22, -0.27],
              [-0.22, 0.27],
              [0.22, 0.27],
            ].map(([sx, sy], sIdx) => (
              <mesh key={`screw-${sIdx}`} position={[sx, sy, 0.11]}>
                <cylinderGeometry args={[0.014, 0.014, 0.018, 12]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.22} metalness={0.96} />
              </mesh>
            ))}
          </group>

          {/* C. Hydraulic Pressure Sensor Control Box (Left Flank) */}
          <group position={[-6.0, -2.1, 0.20]}>
            <RoundedBox args={[0.46, 0.48, 0.18]} radius={0.018} smoothness={4}>
              <meshStandardMaterial color="#222E3F" roughness={0.52} metalness={0.75} />
            </RoundedBox>
            {/* Dual Analog Pressure Gauges */}
            {[-0.10, 0.10].map((gx, gIdx) => (
              <group key={`gauge-${gIdx}`} position={[gx, 0.08, 0.10]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.075, 0.075, 0.035, 32]} />
                  <meshStandardMaterial color="#D97706" roughness={0.22} metalness={0.94} />
                </mesh>
                {/* Dial Face */}
                <mesh position={[0, 0, 0.02]}>
                  <circleGeometry args={[0.064, 32]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.1} />
                </mesh>
                {/* Needle Indicator */}
                <mesh position={[0.015, 0.015, 0.024]} rotation={[0, 0, -0.5 - gIdx * 0.7]}>
                  <boxGeometry args={[0.006, 0.048, 0.004]} />
                  <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.3} />
                </mesh>
              </group>
            ))}
          </group>

          {/* D. Rigid Steel Electrical Conduit Pipe Routing (EMT / RMC) */}
          <group name="ConduitPipes">
            {/* 1. Main Vertical Feeder Conduit (Floor to Main Distribution Unit) */}
            <mesh position={[-2.35, -3.95, 0.20]}>
              <cylinderGeometry args={[0.042, 0.042, 5.8, 20]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.94} />
            </mesh>
            {/* Brass Compression Connector Hub at entry */}
            <mesh position={[-2.35, -1.08, 0.20]}>
              <cylinderGeometry args={[0.054, 0.054, 0.08, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.20} metalness={0.92} />
            </mesh>

            {/* 2. Horizontal Inter-Box Conduit Run (Main Unit to Right Junction Box) */}
            <mesh position={[0.05, 0.22, 0.20]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.034, 0.034, 3.8, 20]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.94} />
            </mesh>
            {/* Brass Hubs on both ends */}
            <mesh position={[-1.68, 0.22, 0.20]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.046, 0.046, 0.07, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.20} metalness={0.92} />
            </mesh>
            <mesh position={[1.93, 0.22, 0.20]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.046, 0.046, 0.07, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.20} metalness={0.92} />
            </mesh>

            {/* 3. Vertical Riser Conduit from Box 2 to Overhead Crane Rail */}
            <mesh position={[2.2, 3.5, 0.18]}>
              <cylinderGeometry args={[0.032, 0.032, 4.2, 20]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.94} />
            </mesh>

            {/* 4. Left Branch Conduit to Sensor Box */}
            <mesh position={[-4.1, -1.6, 0.18]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.032, 0.032, 3.2, 20]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.94} />
            </mesh>

            {/* 2-Hole Conduit Heavy Support Straps / Mounting Clamps */}
            {[
              [-2.35, -2.5, 0.20],
              [-2.35, -5.0, 0.20],
              [0.0, 0.22, 0.20],
              [2.2, 2.5, 0.18],
              [2.2, 4.8, 0.18],
              [-4.2, -1.6, 0.18],
            ].map(([cx, cy, cz], idx) => (
              <RoundedBox
                key={`clamp-${idx}`}
                args={[0.11, 0.05, 0.022]}
                radius={0.006}
                smoothness={3}
                position={[cx, cy, cz - 0.01]}
              >
                <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.88} />
              </RoundedBox>
            ))}
          </group>

          {/* E. Overhead Industrial High-Bay Sconce Floodlights */}
          {showFloodlights && (
            <group name="HighBayFloodlights">
              {[-2.0, 2.0].map((lx, idx) => (
                <group key={`flood-${idx}`} position={[lx, 5.2, 0.24]}>
                  {/* Angled Wall Support Arm */}
                  <mesh position={[0, 0.15, 0.15]} rotation={[0.5, 0, 0]}>
                    <cylinderGeometry args={[0.022, 0.022, 0.35, 16]} />
                    <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
                  </mesh>
                  {/* Domed Lamp Reflector Housing */}
                  <group position={[0, 0.28, 0.28]} rotation={[0.4, 0, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.06, 0.16, 0.14, 24, 1, true]} />
                      <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
                    </mesh>
                    {/* Interior High-Reflective Chrome Dome */}
                    <mesh position={[0, 0.02, 0]}>
                      <cylinderGeometry args={[0.05, 0.15, 0.12, 24, 1, true]} />
                      <meshStandardMaterial color="#F8FAFC" roughness={0.1} metalness={0.98} />
                    </mesh>
                    {/* Warm Amber Task Bulb (Emissive) */}
                    <mesh position={[0, 0.03, 0]}>
                      <sphereGeometry args={[0.045, 16, 16]} />
                      <meshStandardMaterial
                        color="#FDE047"
                        emissive="#F59E0B"
                        emissiveIntensity={3.5}
                        roughness={0.2}
                      />
                    </mesh>
                    {/* Protective Steel Wire Guard Grille */}
                    <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[0.15, 0.008, 8, 24]} />
                      <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
                    </mesh>
                  </group>
                </group>
              ))}
            </group>
          )}
        </group>
      )}

      {/* ================================================================== */}
      {/* 7. FACTORY SECTOR & HAZARD STENCILS                                */}
      {/* ================================================================== */}
      {showHazardMarkings && (
        <group name="StencilsAndMarkings">
          {/* Main Sector Header Stencil Plate (Centered between columns 0 and 4m) */}
          {sectorTexture && (
            <mesh position={[2.0, 4.4, 0.065]}>
              <planeGeometry args={[3.8, 0.95]} />
              <meshStandardMaterial
                map={sectorTexture}
                roughness={0.45}
                metalness={0.25}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          )}

          {/* Secondary Sector ID on Left Wall Bay */}
          <group position={[-5.8, 4.4, 0.065]}>
            <RoundedBox args={[2.5, 0.75, 0.02]} radius={0.012} smoothness={2}>
              <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.45} />
            </RoundedBox>
            <mesh position={[0, 0, 0.012]}>
              <planeGeometry args={[2.3, 0.58]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} />
            </mesh>
            {/* Caution Yellow Accent Band */}
            <mesh position={[0, 0.22, 0.015]}>
              <planeGeometry args={[2.1, 0.05]} />
              <meshStandardMaterial color="#EAB308" roughness={0.35} metalness={0.25} />
            </mesh>
          </group>

          {/* Yellow/Black Safety Chevron Band on Lower Floor Wainscot Curb */}
          <group position={[0, -6.65, 0.24]}>
            {/* Chevron backing bar */}
            <mesh>
              <boxGeometry args={[19.6, 0.18, 0.018]} />
              <meshStandardMaterial color="#EAB308" roughness={0.38} metalness={0.25} />
            </mesh>
            {/* Repeated black angled chevron stripes */}
            {Array.from({ length: 42 }).map((_, idx) => (
              <mesh
                key={`chv-${idx}`}
                position={[-9.45 + idx * 0.46, 0, 0.012]}
                rotation={[0, 0, Math.PI / 4]}
              >
                <planeGeometry args={[0.09, 0.28]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            ))}
          </group>

          {/* Crane Track Caution Band at Y = +5.8 */}
          <group position={[0, 5.76, 0.15]}>
            <mesh>
              <planeGeometry args={[19.6, 0.08]} />
              <meshStandardMaterial color="#EAB308" roughness={0.4} metalness={0.2} />
            </mesh>
            {Array.from({ length: 50 }).map((_, idx) => (
              <mesh
                key={`crane-chv-${idx}`}
                position={[-9.5 + idx * 0.39, 0, 0.005]}
                rotation={[0, 0, Math.PI / 4]}
              >
                <planeGeometry args={[0.045, 0.12]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

export default RivetedSteelWall;
