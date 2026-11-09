import React, { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";

export interface FactoryHeavyConcreteFloorProps {
  position?: [number, number, number];
  showMarkings?: boolean;
  showTrenchDrain?: boolean;
  showAnchorPlates?: boolean;
  enableSpecularHighlights?: boolean;
}

// ---------------------------------------------------------------------------
// 1. Concrete Slab Color Palette (Heavy Cured Industrial Portland Concrete)
// ---------------------------------------------------------------------------
// Subtle tonality variance across 4x4 slab pours
const SLAB_GRID_COLORS: string[][] = [
  ["#2C3545", "#334155", "#263040", "#2E394A"],
  ["#313D4E", "#283342", "#334155", "#2C3545"],
  ["#263040", "#2E394A", "#2C3545", "#313D4E"],
  ["#334155", "#263040", "#313D4E", "#283342"],
];

// ---------------------------------------------------------------------------
// 2. M24 Hexagonal Anchor Bolt Assembly Component
// ---------------------------------------------------------------------------
interface AnchorBoltProps {
  position: [number, number, number];
  rotationY?: number;
}

const M24AnchorBolt: React.FC<AnchorBoltProps> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position}>
      {/* Heavy Steel Hardened Flat Washer (Outer Dia 50mm, Thickness 5mm) */}
      <mesh position={[0, 0.0025, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.005, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.90} roughness={0.30} />
      </mesh>

      {/* M24 Heavy Hex Nut (Across flats 36mm, Radius ~0.021m, Height 22mm) */}
      <mesh position={[0, 0.016, 0]} rotation={[0, rotationY, 0]}>
        <cylinderGeometry args={[0.021, 0.021, 0.022, 6]} />
        <meshStandardMaterial color="#64748B" metalness={0.92} roughness={0.24} />
      </mesh>

      {/* Protruding High-Tensile Threaded Stud (M24 Dia 24mm, 20mm above nut) */}
      <mesh position={[0, 0.037, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.020, 16]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.94} roughness={0.20} />
      </mesh>

      {/* Stud Thread Crown / Chamfer Tip */}
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.009, 0.012, 0.003, 16]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3. Modular Trench Drain Grating Panel (0.60m x 0.28m Galvanized Cast Iron)
// ---------------------------------------------------------------------------
interface TrenchGratePanelProps {
  position: [number, number, number];
}

const TrenchGratePanel: React.FC<TrenchGratePanelProps> = ({ position }) => {
  // 10 transverse drainage slots per 0.60m panel section
  const slotBars = useMemo(() => {
    const bars: number[] = [];
    const count = 9;
    const spacing = 0.54 / count;
    for (let i = 0; i < count; i++) {
      bars.push(-0.27 + (i + 0.5) * spacing);
    }
    return bars;
  }, []);

  return (
    <group position={position}>
      {/* Longitudinal Left Bearing Bar */}
      <mesh position={[0, -0.006, -0.125]}>
        <boxGeometry args={[0.58, 0.014, 0.018]} />
        <meshStandardMaterial color="#64748B" metalness={0.90} roughness={0.26} />
      </mesh>

      {/* Longitudinal Right Bearing Bar */}
      <mesh position={[0, -0.006, 0.125]}>
        <boxGeometry args={[0.58, 0.014, 0.018]} />
        <meshStandardMaterial color="#64748B" metalness={0.90} roughness={0.26} />
      </mesh>

      {/* Center Longitudinal Spine Rib */}
      <mesh position={[0, -0.008, 0]}>
        <boxGeometry args={[0.58, 0.012, 0.014]} />
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.30} />
      </mesh>

      {/* Transverse Cast Iron Drainage Crossbars (Catching Directional Specular Highlights) */}
      {slotBars.map((xOffset, idx) => (
        <mesh key={idx} position={[xOffset, -0.004, 0]}>
          <boxGeometry args={[0.024, 0.012, 0.26]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#94A3B8" : "#64748B"}
            metalness={0.92}
            roughness={0.22}
          />
        </mesh>
      ))}

      {/* Corner Lockdown Hex Socket Screws */}
      {[-0.26, 0.26].map((x, xi) =>
        [-0.12, 0.12].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, -0.001, z]}>
            <cylinderGeometry args={[0.007, 0.007, 0.004, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.22} />
          </mesh>
        ))
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Main AAA Heavy Factory Concrete Floor Component
// ---------------------------------------------------------------------------
export const FactoryHeavyConcreteFloor: React.FC<FactoryHeavyConcreteFloorProps> = ({
  position = [0, -2.04, 0],
  showMarkings = true,
  showTrenchDrain = true,
  showAnchorPlates = true,
}) => {
  // Grid parameters: 4x4 slab layout spanning 16m x 16m
  // Pitch = 4.0m. Expansion joint width = 0.025m.
  // Slab dimension = 3.975m x 3.975m x 0.20m depth
  const slabSize = 3.975;
  const slabThickness = 0.20;
  const slabCenters = [-6.0, -2.0, 2.0, 6.0];

  // Recessed Bitumen Seams along X and Z
  const seamCoords = [-4.0, 0.0, 4.0];
  const jointWidth = 0.025;
  const jointDepth = 0.015; // 15mm recess below top surface

  // -------------------------------------------------------------------------
  // Machine Anchor Sole Plates Layout (Flush/semi-embedded steel plates)
  // -------------------------------------------------------------------------
  // 4 Primary Corner Bedplates: [X: ±1.45, Z: ±1.10]
  // 4 Mid-Span Stabilization Plates: [X: ±1.45, Z: 0], [X: 0, Z: ±1.10]
  // 2 Longitudinal Machine Bed Foundation Rails: [X: ±0.72, Z: 0]
  interface PlateDef {
    pos: [number, number, number];
    size: [number, number, number];
  }

  const cornerPlates: PlateDef[] = [
    { pos: [-1.45, 0.003, -1.10], size: [0.50, 0.014, 0.42] },
    { pos: [1.45, 0.003, -1.10], size: [0.50, 0.014, 0.42] },
    { pos: [-1.45, 0.003, 1.10], size: [0.50, 0.014, 0.42] },
    { pos: [1.45, 0.003, 1.10], size: [0.50, 0.014, 0.42] },
  ];

  const midPlates: PlateDef[] = [
    { pos: [-1.45, 0.003, 0.0], size: [0.46, 0.014, 0.36] },
    { pos: [1.45, 0.003, 0.0], size: [0.46, 0.014, 0.36] },
    { pos: [0.0, 0.003, -1.10], size: [0.54, 0.014, 0.36] },
    { pos: [0.0, 0.003, 1.10], size: [0.54, 0.014, 0.36] },
  ];

  // Anchor bolt positions on corner plates (4 bolts per plate)
  const cornerBolts = useMemo(() => {
    const list: { pos: [number, number, number]; rot: number }[] = [];
    const offsets = [
      [-0.17, -0.13],
      [0.17, -0.13],
      [-0.17, 0.13],
      [0.17, 0.13],
    ];
    let seed = 0;
    cornerPlates.forEach((plate) => {
      offsets.forEach(([dx, dz]) => {
        seed += 1.37;
        list.push({
          pos: [plate.pos[0] + dx, plate.pos[1] + 0.007, plate.pos[2] + dz],
          rot: (seed % Math.PI),
        });
      });
    });
    return list;
  }, []);

  // Anchor bolt positions on mid plates & bed rails
  const midBolts = useMemo(() => {
    const list: { pos: [number, number, number]; rot: number }[] = [];
    let seed = 2.11;
    // Mid plates: 2 bolts each
    midPlates.forEach((plate) => {
      const isXLong = plate.size[0] > plate.size[2];
      const offsets = isXLong ? [[-0.16, 0], [0.16, 0]] : [[0, -0.11], [0, 0.11]];
      offsets.forEach(([dx, dz]) => {
        seed += 0.89;
        list.push({
          pos: [plate.pos[0] + dx, plate.pos[1] + 0.007, plate.pos[2] + dz],
          rot: (seed % Math.PI),
        });
      });
    });

    // Longitudinal machinery mounting rails: 4 bolts each
    [-0.72, 0.72].forEach((rx) => {
      [-0.75, -0.25, 0.25, 0.75].forEach((rz) => {
        seed += 1.05;
        list.push({
          pos: [rx, 0.009, rz],
          rot: (seed % Math.PI),
        });
      });
    });

    return list;
  }, []);

  // -------------------------------------------------------------------------
  // Trench Drain Parameters (Running along X at Z = 1.30m in machine front apron)
  // -------------------------------------------------------------------------
  const trenchZ = 1.35;
  const trenchLength = 10.8;
  const trenchGrateWidth = 0.28;
  const trenchGrateSectionLength = 0.60;
  const trenchSectionsCount = 18; // 18 * 0.60 = 10.8m

  const trenchGratePositions = useMemo(() => {
    const list: [number, number, number][] = [];
    const startX = -trenchLength / 2 + trenchGrateSectionLength / 2;
    for (let i = 0; i < trenchSectionsCount; i++) {
      // Skip center slot where sump basin lid is located
      if (Math.abs(startX + i * trenchGrateSectionLength) < 0.2) continue;
      list.push([startX + i * trenchGrateSectionLength, 0, trenchZ]);
    }
    return list;
  }, []);

  // -------------------------------------------------------------------------
  // Safety Boundary Hazard Markings
  // -------------------------------------------------------------------------
  // Operator cell rectangle enclosing X: [-2.20, +2.20], Z: [-1.80, +1.80]
  const safetyStripeWidth = 0.15;
  const safetyY = 0.0012; // 1.2mm above slab to prevent Z-fighting

  // 45° diagonal hazard chevron segments along the front edge (facing walkway)
  const chevronCount = 22;
  const chevronSpacing = 4.40 / chevronCount;

  return (
    <group position={position}>
      {/* =================================================================== */}
      {/* 1. CONCRETE SLAB POURS (4x4 Grid with Tonality Variance)            */}
      {/* =================================================================== */}
      <group name="ConcreteSlabsGrid">
        {slabCenters.map((x, rowIdx) =>
          slabCenters.map((z, colIdx) => {
            const slabColor = SLAB_GRID_COLORS[rowIdx][colIdx];
            return (
              <group key={`slab-${rowIdx}-${colIdx}`} position={[x, -slabThickness / 2, z]}>
                {/* Solid Concrete Slab with crisp beveled edge */}
                <RoundedBox
                  args={[slabSize, slabThickness, slabSize]}
                  radius={0.006}
                  smoothness={2}
                >
                  <meshStandardMaterial
                    color={slabColor}
                    roughness={0.90}
                    metalness={0.12}
                  />
                </RoundedBox>

                {/* Embedded Brass Survey & Alignment Benchmark Dot (Found on industrial factory slabs) */}
                {(rowIdx === 0 && colIdx === 0) || (rowIdx === 3 && colIdx === 3) ? (
                  <mesh position={[1.8, slabThickness / 2 + 0.0006, 1.8]}>
                    <cylinderGeometry args={[0.022, 0.022, 0.003, 24]} />
                    <meshStandardMaterial color="#B45309" metalness={0.92} roughness={0.22} />
                  </mesh>
                ) : null}
              </group>
            );
          })
        )}
      </group>

      {/* =================================================================== */}
      {/* 2. RECESSED DARK BITUMEN EXPANSION JOINTS                           */}
      {/*    Width: 0.025m, Recessed Depth: 0.015m below slab surface         */}
      {/* =================================================================== */}
      <group name="BitumenExpansionJoints">
        {/* Longitudinal Seams (running along X across all 16m) */}
        {seamCoords.map((z, idx) => (
          <group key={`seam-x-${idx}`} position={[0, -jointDepth - 0.03, z]}>
            {/* Dark Bitumen Sealant Core */}
            <mesh>
              <boxGeometry args={[16.0, 0.06, jointWidth]} />
              <meshStandardMaterial color="#0B0F17" roughness={0.98} metalness={0.04} />
            </mesh>
            {/* Joint Expansion Cavity Shadow Backing */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[16.0, 0.04, jointWidth * 1.4]} />
              <meshStandardMaterial color="#05070B" roughness={1.0} metalness={0.0} />
            </mesh>
          </group>
        ))}

        {/* Transverse Seams (running along Z across all 16m) */}
        {seamCoords.map((x, idx) => (
          <group key={`seam-z-${idx}`} position={[x, -jointDepth - 0.03, 0]}>
            {/* Dark Bitumen Sealant Core */}
            <mesh>
              <boxGeometry args={[jointWidth, 0.06, 16.0]} />
              <meshStandardMaterial color="#0B0F17" roughness={0.98} metalness={0.04} />
            </mesh>
            {/* Joint Expansion Cavity Shadow Backing */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[jointWidth * 1.4, 0.04, 16.0]} />
              <meshStandardMaterial color="#05070B" roughness={1.0} metalness={0.0} />
            </mesh>
          </group>
        ))}

        {/* Joint Crossing Plugs at intersections */}
        {seamCoords.map((x, xi) =>
          seamCoords.map((z, zi) => (
            <mesh key={`plug-${xi}-${zi}`} position={[x, -jointDepth - 0.005, z]}>
              <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
              <meshStandardMaterial color="#080C12" roughness={0.96} metalness={0.02} />
            </mesh>
          ))
        )}
      </group>

      {/* =================================================================== */}
      {/* 3. INTEGRATED INDUSTRIAL TRENCH DRAIN CHANNELS                      */}
      {/*    Recessed trough, dark cavity, galvanized frame & 3D slotted grate*/}
      {/* =================================================================== */}
      {showTrenchDrain && (
        <group name="IndustrialTrenchDrain">
          {/* Deep Dark Drainage Cavity Trough */}
          <mesh position={[0, -0.08, trenchZ]}>
            <boxGeometry args={[trenchLength + 0.1, 0.14, trenchGrateWidth + 0.04]} />
            <meshStandardMaterial color="#05080E" roughness={0.98} metalness={0.10} />
          </mesh>

          {/* Recessed Galvanized Steel Frame Angle Rails (Embedded along left & right rims) */}
          <mesh position={[0, -0.006, trenchZ - 0.155]}>
            <boxGeometry args={[trenchLength, 0.014, 0.022]} />
            <meshStandardMaterial color="#475569" metalness={0.90} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.006, trenchZ + 0.155]}>
            <boxGeometry args={[trenchLength, 0.014, 0.022]} />
            <meshStandardMaterial color="#475569" metalness={0.90} roughness={0.28} />
          </mesh>

          {/* Grate Seat Retainer Ledges */}
          <mesh position={[0, -0.018, trenchZ - 0.14]}>
            <boxGeometry args={[trenchLength, 0.010, 0.012]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.018, trenchZ + 0.14]}>
            <boxGeometry args={[trenchLength, 0.010, 0.012]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.35} />
          </mesh>

          {/* Modular 3D Slotted Cast-Iron / Galvanized Grates */}
          {trenchGratePositions.map((gPos, idx) => (
            <TrenchGratePanel key={`grate-${idx}`} position={gPos} />
          ))}

          {/* Central Sump Cleanout Hatch Cover at X = 0, Z = trenchZ */}
          <group position={[0, 0.0005, trenchZ]}>
            {/* Cast Iron Heavy Sump Frame */}
            <mesh position={[0, -0.004, 0]}>
              <boxGeometry args={[0.34, 0.012, 0.34]} />
              <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.35} />
            </mesh>
            {/* Solid Center Access Plate with Recessed Lift Ring Pocket */}
            <mesh position={[0, -0.001, 0]}>
              <boxGeometry args={[0.26, 0.010, 0.26]} />
              <meshStandardMaterial color="#475569" metalness={0.90} roughness={0.28} />
            </mesh>
            {/* Recessed Lifting Eye Ring */}
            <mesh position={[0, 0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.024, 0.005, 12, 24]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.94} roughness={0.22} />
            </mesh>
          </group>
        </group>
      )}

      {/* =================================================================== */}
      {/* 4. EMBEDDED MACHINE ANCHOR PLATES & M24 HEX BOLT ARRAYS             */}
      {/* =================================================================== */}
      {showAnchorPlates && (
        <group name="MachineAnchorFoundation">
          {/* Precision Milled Longitudinal Steel Bed Rails (For machine skid mounting) */}
          {[-0.72, 0.72].map((railX, rIdx) => (
            <group key={`bed-rail-${rIdx}`} position={[railX, 0.004, 0]}>
              <RoundedBox args={[0.20, 0.012, 2.00]} radius={0.005} smoothness={2}>
                <meshStandardMaterial color="#374151" metalness={0.90} roughness={0.28} />
              </RoundedBox>
              {/* Precision Milled Top Slide Face catching bright specular highlight */}
              <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.18, 1.96]} />
                <meshStandardMaterial color="#64748B" metalness={0.94} roughness={0.16} />
              </mesh>
            </group>
          ))}

          {/* 4 Primary Corner Heavy Foundation Sole Plates */}
          {cornerPlates.map((plate, pIdx) => (
            <group key={`corner-plate-${pIdx}`} position={plate.pos}>
              {/* Solid Steel Anchor Armor Baseplate */}
              <RoundedBox args={plate.size} radius={0.006} smoothness={3}>
                <meshStandardMaterial color="#374151" metalness={0.90} roughness={0.30} />
              </RoundedBox>
              {/* Perimeter Grout Seam */}
              <mesh position={[0, -0.005, 0]}>
                <boxGeometry args={[plate.size[0] + 0.015, 0.003, plate.size[2] + 0.015]} />
                <meshStandardMaterial color="#1E2430" roughness={0.95} metalness={0.15} />
              </mesh>
            </group>
          ))}

          {/* 4 Mid-Span Stabilization Baseplates */}
          {midPlates.map((plate, mIdx) => (
            <group key={`mid-plate-${mIdx}`} position={plate.pos}>
              <RoundedBox args={plate.size} radius={0.006} smoothness={3}>
                <meshStandardMaterial color="#374151" metalness={0.90} roughness={0.30} />
              </RoundedBox>
            </group>
          ))}

          {/* High-Tensile M24 Hex Anchor Bolt & Stud Clusters */}
          {cornerBolts.map((bolt, bIdx) => (
            <M24AnchorBolt key={`cbolt-${bIdx}`} position={bolt.pos} rotationY={bolt.rot} />
          ))}
          {midBolts.map((bolt, bIdx) => (
            <M24AnchorBolt key={`mbolt-${bIdx}`} position={bolt.pos} rotationY={bolt.rot} />
          ))}

          {/* Heavy Equipment Protective Earth Grounding Lug Terminal */}
          <group position={[-1.72, 0.006, -1.35]}>
            {/* Copper Grounding Terminal Plate */}
            <mesh position={[0, 0.002, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.08]} />
              <meshStandardMaterial color="#B45309" metalness={0.92} roughness={0.20} />
            </mesh>
            {/* Brass Earthing Post & Cable Clamp */}
            <mesh position={[0, 0.016, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.020, 16]} />
              <meshStandardMaterial color="#D97706" metalness={0.90} roughness={0.25} />
            </mesh>
            {/* Hex Ground Nut */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.010, 6]} />
              <meshStandardMaterial color="#B45309" metalness={0.92} roughness={0.22} />
            </mesh>
          </group>
        </group>
      )}

      {/* =================================================================== */}
      {/* 5. WORKSHOP SAFETY BOUNDARY HAZARD MARKINGS                         */}
      {/*    Weathered, faded yellow hazard stripe around machine envelope    */}
      {/* =================================================================== */}
      {showMarkings && (
        <group name="WorkshopSafetyMarkings">
          {/* Left Flank Perimeter Safety Line (X = -2.20, from Z = -1.80 to +1.80) */}
          <mesh
            position={[-2.20, safetyY, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[safetyStripeWidth, 3.60]} />
            <meshStandardMaterial
              color="#B45309"
              roughness={0.82}
              metalness={0.04}
            />
          </mesh>

          {/* Right Flank Perimeter Safety Line (X = +2.20, from Z = -1.80 to +1.80) */}
          <mesh
            position={[2.20, safetyY, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[safetyStripeWidth, 3.60]} />
            <meshStandardMaterial
              color="#B45309"
              roughness={0.82}
              metalness={0.04}
            />
          </mesh>

          {/* Rear Maintenance Boundary Line (Z = -1.80, from X = -2.20 to +2.20) */}
          <mesh
            position={[0, safetyY, -1.80]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[4.40, safetyStripeWidth]} />
            <meshStandardMaterial
              color="#92400E"
              roughness={0.84}
              metalness={0.04}
            />
          </mesh>

          {/* Front Operator Access Hazard Edge (Z = +1.80, Facing Primary Aisle) */}
          {/* Alternating 45° Yellow & Black Hazard Chevron Segments               */}
          <group position={[0, safetyY, 1.80]}>
            {/* Solid Faded Weathered Yellow Base Carrier Stripe */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.40, safetyStripeWidth]} />
              <meshStandardMaterial
                color="#CA8A04"
                roughness={0.78}
                metalness={0.04}
              />
            </mesh>

            {/* Alternating Worn Black Industrial Warning Chevrons */}
            {Array.from({ length: chevronCount }).map((_, cIdx) => {
              if (cIdx % 2 === 0) return null;
              const xPos = -2.20 + (cIdx + 0.5) * chevronSpacing;
              return (
                <mesh
                  key={`chevron-${cIdx}`}
                  position={[xPos, 0.0002, 0]}
                  rotation={[-Math.PI / 2, 0, 0.785]} // 45 degree slant
                >
                  <planeGeometry args={[safetyStripeWidth * 0.90, safetyStripeWidth * 0.90]} />
                  <meshStandardMaterial
                    color="#1E2430"
                    roughness={0.92}
                    metalness={0.06}
                  />
                </mesh>
              );
            })}
          </group>

          {/* 4 Corner L-Bracket Boundary Anchors (Heavy Workshop Corner Marks) */}
          {[
            { cx: -2.20, cz: -1.80, rot: 0 },
            { cx: 2.20, cz: -1.80, rot: -Math.PI / 2 },
            { cx: 2.20, cz: 1.80, rot: Math.PI },
            { cx: -2.20, cz: 1.80, rot: Math.PI / 2 },
          ].map((corner, i) => (
            <group key={`corner-${i}`} position={[corner.cx, safetyY + 0.0003, corner.cz]} rotation={[0, corner.rot, 0]}>
              <mesh position={[0.15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.30, safetyStripeWidth * 1.1]} />
                <meshStandardMaterial color="#B45309" roughness={0.80} metalness={0.04} />
              </mesh>
              <mesh position={[0, 0, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[safetyStripeWidth * 1.1, 0.30]} />
                <meshStandardMaterial color="#B45309" roughness={0.80} metalness={0.04} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =================================================================== */}
      {/* 6. SUBTLE RUNOFF & HYDRAULIC COOLANT PATINA (Near Center Plinth)   */}
      {/* =================================================================== */}
      <group name="SlabPatinaAndStains" position={[0, 0.0004, 0]}>
        {/* Subtle coolant sheen near machine bed base */}
        <mesh position={[0.2, 0, 0.1]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshStandardMaterial
            color="#141C28"
            roughness={0.55}
            metalness={0.20}
            transparent
            opacity={0.30}
          />
        </mesh>
        {/* Runoff streak towards trench drain */}
        <mesh position={[0.15, 0, 0.8]} rotation={[-Math.PI / 2, 0, -0.1]}>
          <planeGeometry args={[0.5, 0.9]} />
          <meshStandardMaterial
            color="#0F1722"
            roughness={0.58}
            metalness={0.18}
            transparent
            opacity={0.25}
          />
        </mesh>
      </group>
    </group>
  );
};

export default FactoryHeavyConcreteFloor;
