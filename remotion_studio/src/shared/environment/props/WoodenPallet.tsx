import React from "react";
import { RoundedBox } from "@react-three/drei";

export interface WoodenPalletProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

/**
 * Standard Industrial Euro-Pallet (EPAL 1 Specifications):
 * - Overall Dimensions: 1.20m (Length, X) x 0.80m (Width, Z) x 0.144m (Height, Y)
 * - 5 Top deck boards (3 wide 145mm + 2 narrow 100mm) with realistic 40-42mm gaps
 * - 3 Transverse stringer boards (145mm x 22mm x 800mm)
 * - 9 Solid spacer blocks (145mm x 145mm x 78mm)
 * - 3 Bottom base runner boards with beveled lead-in chamfers
 * - Authentic countersunk steel fluted nails at timber intersections
 * - Weathered industrial pine / aged oak wood tones (#785434, #8B5A2B, #5C4033)
 */
export const WoodenPallet: React.FC<WoodenPalletProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  // Wood color palette: weathered pine and seasoned oak
  const WOOD_TONES = {
    darkOak: "#5C4033",
    weatheredPine: "#785434",
    warmPine: "#8B5A2B",
    seasonedAmber: "#82572E",
    palePine: "#966F47",
    brandStamp: "#2E1A0C",
    nailSteel: "#1E293B",
  };

  // Dimensions
  const LENGTH = 1.2; // X
  const WIDTH = 0.8; // Z
  const BOARD_THICKNESS = 0.022; // Y thickness of all boards
  const BLOCK_HEIGHT = 0.078; // Y height of spacer blocks
  const BLOCK_SIZE = 0.145; // 145mm square footprint

  // Coordinates
  const RUNNER_Z = [-0.3275, 0.0, 0.3275]; // Z centers for 3 runners & block columns
  const STRINGER_X = [-0.5275, 0.0, 0.5275]; // X centers for 3 stringers & block rows

  // Top deck boards: [zCenter, width, colorTone]
  const TOP_BOARDS = [
    { z: -0.3275, w: 0.145, color: WOOD_TONES.weatheredPine }, // Outer front board
    { z: -0.165, w: 0.1, color: WOOD_TONES.warmPine }, // Intermediate front board
    { z: 0.0, w: 0.145, color: WOOD_TONES.seasonedAmber }, // Center board
    { z: 0.165, w: 0.1, color: WOOD_TONES.warmPine }, // Intermediate rear board
    { z: 0.3275, w: 0.145, color: WOOD_TONES.darkOak }, // Outer rear board
  ];

  // Stringer boards tones
  const STRINGER_COLORS = [
    WOOD_TONES.weatheredPine,
    WOOD_TONES.darkOak,
    WOOD_TONES.seasonedAmber,
  ];

  // Spacer block tones for organic wood variation
  const BLOCK_COLORS = [
    [WOOD_TONES.darkOak, WOOD_TONES.weatheredPine, WOOD_TONES.warmPine],
    [WOOD_TONES.weatheredPine, WOOD_TONES.seasonedAmber, WOOD_TONES.darkOak],
    [WOOD_TONES.warmPine, WOOD_TONES.darkOak, WOOD_TONES.weatheredPine],
  ];

  const normalizedScale: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  return (
    <group position={position} rotation={rotation} scale={normalizedScale}>
      {/* ============================================================== */}
      {/* 1. BOTTOM BASE RUNNER BOARDS (3 SKIDS ALONG X)                 */}
      {/* Y: 0.000 -> 0.022 (Center Y = 0.011)                           */}
      {/* ============================================================== */}
      {RUNNER_Z.map((zPos, idx) => {
        const runnerColor =
          idx === 0
            ? WOOD_TONES.weatheredPine
            : idx === 1
            ? WOOD_TONES.darkOak
            : WOOD_TONES.seasonedAmber;

        return (
          <group key={`runner-${idx}`} position={[0, BOARD_THICKNESS / 2, zPos]}>
            {/* Main runner board with beveled edges */}
            <RoundedBox
              args={[LENGTH, BOARD_THICKNESS, 0.145]}
              radius={0.005}
              smoothness={4}
            >
              <meshStandardMaterial
                color={runnerColor}
                roughness={0.82}
                metalness={0.05}
              />
            </RoundedBox>

            {/* Forklift Lead-in Chamfers at both ends (Left X = -0.58, Right X = +0.58) */}
            {[-0.585, 0.585].map((xEnd, cIdx) => (
              <mesh
                key={`chamfer-${cIdx}`}
                position={[xEnd, -BOARD_THICKNESS / 2 + 0.004, 0]}
                rotation={[0, 0, xEnd < 0 ? -0.45 : 0.45]}
              >
                <boxGeometry args={[0.035, 0.008, 0.143]} />
                <meshStandardMaterial
                  color={WOOD_TONES.darkOak}
                  roughness={0.85}
                  metalness={0.05}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ============================================================== */}
      {/* 2. NINE SOLID BLOCK SPACERS (3x3 MATRIX)                       */}
      {/* Y: 0.022 -> 0.100 (Center Y = 0.061)                           */}
      {/* ============================================================== */}
      {STRINGER_X.map((xPos, xIdx) =>
        RUNNER_Z.map((zPos, zIdx) => {
          const blockColor = BLOCK_COLORS[xIdx][zIdx];
          const isOuterCorner = (xIdx === 0 || xIdx === 2) && (zIdx === 0 || zIdx === 2);
          const isSideCenter = xIdx === 1 && (zIdx === 0 || zIdx === 2);

          return (
            <group
              key={`block-${xIdx}-${zIdx}`}
              position={[xPos, BOARD_THICKNESS + BLOCK_HEIGHT / 2, zPos]}
            >
              <RoundedBox
                args={[BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE]}
                radius={0.005}
                smoothness={4}
              >
                <meshStandardMaterial
                  color={blockColor}
                  roughness={0.8}
                  metalness={0.05}
                />
              </RoundedBox>

              {/* EPAL / EUR Heat-Treatment Burned Wood Brand Marks on exterior faces */}
              {isOuterCorner && (
                <mesh
                  position={[
                    xIdx === 0 ? -BLOCK_SIZE / 2 - 0.001 : BLOCK_SIZE / 2 + 0.001,
                    0,
                    0,
                  ]}
                  rotation={[0, xIdx === 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
                >
                  {/* Oval EPAL brand stamp decal */}
                  <cylinderGeometry args={[0.028, 0.028, 0.001, 16]} />
                  <meshStandardMaterial
                    color={WOOD_TONES.brandStamp}
                    roughness={0.95}
                    metalness={0.02}
                  />
                </mesh>
              )}

              {isSideCenter && (
                <mesh
                  position={[
                    0,
                    0,
                    zIdx === 0 ? -BLOCK_SIZE / 2 - 0.001 : BLOCK_SIZE / 2 + 0.001,
                  ]}
                >
                  {/* Center IPPC wheat stamp decal */}
                  <planeGeometry args={[0.065, 0.038]} />
                  <meshStandardMaterial
                    color={WOOD_TONES.brandStamp}
                    roughness={0.95}
                    metalness={0.02}
                  />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* ============================================================== */}
      {/* 3. THREE TRANSVERSE STRINGER BOARDS (CROSS BOARDS ALONG Z)      */}
      {/* Y: 0.100 -> 0.122 (Center Y = 0.111)                           */}
      {/* ============================================================== */}
      {STRINGER_X.map((xPos, idx) => (
        <group
          key={`stringer-${idx}`}
          position={[xPos, BOARD_THICKNESS + BLOCK_HEIGHT + BOARD_THICKNESS / 2, 0]}
        >
          <RoundedBox
            args={[0.145, BOARD_THICKNESS, WIDTH]}
            radius={0.005}
            smoothness={4}
          >
            <meshStandardMaterial
              color={STRINGER_COLORS[idx]}
              roughness={0.8}
              metalness={0.05}
            />
          </RoundedBox>
        </group>
      ))}

      {/* ============================================================== */}
      {/* 4. FIVE TOP DECK BOARDS (ALONG X WITH REALISTIC GAPS)           */}
      {/* Y: 0.122 -> 0.144 (Center Y = 0.133)                           */}
      {/* ============================================================== */}
      {TOP_BOARDS.map((board, idx) => (
        <group
          key={`top-board-${idx}`}
          position={[
            0,
            BOARD_THICKNESS * 2 + BLOCK_HEIGHT + BOARD_THICKNESS / 2,
            board.z,
          ]}
        >
          <RoundedBox
            args={[LENGTH, BOARD_THICKNESS, board.w]}
            radius={0.005}
            smoothness={4}
          >
            <meshStandardMaterial
              color={board.color}
              roughness={0.78}
              metalness={0.05}
            />
          </RoundedBox>
        </group>
      ))}

      {/* ============================================================== */}
      {/* 5. COUNTERSUNK INDUSTRIAL STEEL FASTENERS (NAIL HEADS)         */}
      {/* Surface at Y = 0.144 (Top Deck Surface)                        */}
      {/* ============================================================== */}
      {STRINGER_X.map((xPos, sIdx) =>
        TOP_BOARDS.map((board, bIdx) => {
          // 3 nails for wide boards (145mm), 2 nails for narrow boards (100mm)
          const zOffsets =
            board.w > 0.12 ? [-0.045, 0.0, 0.045] : [-0.028, 0.028];

          return zOffsets.map((zOff, nIdx) => (
            <mesh
              key={`nail-${sIdx}-${bIdx}-${nIdx}`}
              position={[
                xPos + (nIdx % 2 === 0 ? -0.015 : 0.015),
                BOARD_THICKNESS * 3 + BLOCK_HEIGHT + 0.0006,
                board.z + zOff,
              ]}
              rotation={[0, 0, 0]}
            >
              {/* Recessed spiral nail cap */}
              <cylinderGeometry args={[0.0035, 0.0035, 0.0012, 10]} />
              <meshStandardMaterial
                color={WOOD_TONES.nailSteel}
                roughness={0.45}
                metalness={0.82}
              />
            </mesh>
          ));
        })
      )}
    </group>
  );
};
