import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "./AssemblyContract";

/**
 * ============================================================================
 * TIER 3: $1,000 INDUSTRIAL HYDRAULIC DUAL-SHAFT SHREDDER (Tier3_Hydraulic.tsx)
 * ============================================================================
 * Complies strictly with remotion_studio/crew/3d_modeler.md & AssemblyContract.ts
 *
 * Inside-Out Modular Assembly Law:
 * Order 0 (0f):  Bed - Structural H-frame cast iron bed, anchor pedestals, mounting pads.
 * Order 1 (20f): Shafts & Cutters Core - Mirror chrome hex shafts, 5-hook claw blades. (Arrives BEFORE casing)
 * Order 2 (40f): Cutting Chamber & Hopper - Finned chamber, beveled 0.9m x 0.78m hopper (<RoundedBox radius={0.035}>), discharge chute.
 * Order 3 (60f): Manifold & Drive - Brass distributor block, braided steel hoses, dual dial gauges, dual planetary gearboxes.
 * Order 4 (75f): Discharge Bin / Collector - Cast steel bin, forklift pockets, cleaning comb anvil fingers.
 *
 * Material Contrast Triad:
 * - Matte dark industrial gray: #1E293B (roughness: 0.70, metalness: 0.45)
 * - Mirror chrome: #E2E8F0 (roughness: 0.08, metalness: 0.98)
 * - Polished brass: #D97706 (roughness: 0.15, metalness: 0.95)
 */

// Shared Material Constants
const MAT_CAST_IRON = { color: "#1E293B", roughness: 0.70, metalness: 0.45 };
const MAT_CAST_STEEL = { color: "#334155", roughness: 0.55, metalness: 0.60 };
const MAT_BLACK_STEEL = { color: "#0F172A", roughness: 0.85, metalness: 0.40 };
const MAT_CHROME = { color: "#E2E8F0", roughness: 0.08, metalness: 0.98 };
const MAT_CHROME_BRIGHT = { color: "#CBD5E1", roughness: 0.12, metalness: 0.94 };
const MAT_POLISHED_BRASS = { color: "#D97706", roughness: 0.15, metalness: 0.95 };
const MAT_SAFETY_GOLD = { color: "#F59E0B", roughness: 0.25, metalness: 0.75 };
const MAT_GAUGE_FACE = { color: "#FFFFFF" };
const MAT_RED_DANGER = { color: "#EF4444" };

// Dimensions & Kinematic Constants
const SHAFT_X_OFFSET = 0.22; // Left: -0.22, Right: +0.22
const BLADE_COUNT = 7;
const BLADE_SPACING = 0.082;

// ============================================================================
// PART 0 (Order 0, Frame 0f): HEAVY STRUCTURAL H-FRAME CAST IRON BED
// ============================================================================
const ModuleBed: ModularPartSpec = {
  id: "tier3_bed",
  name: "Cast-Iron H-Frame Foundation Bed & Anchors",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Machined Foundation Bed Plate (Spans y = 0.00 to 0.24) */}
      <RoundedBox args={[1.72, 0.24, 1.44]} radius={0.035} smoothness={4} position={[0, 0.12, 0]}>
        <meshStandardMaterial {...MAT_CAST_IRON} />
      </RoundedBox>

      {/* 2. Machined T-Slots / Alignment Tracks on Bed Face */}
      {[-0.48, -0.16, 0.16, 0.48].map((tx, idx) => (
        <mesh key={`tslot_${idx}`} position={[tx, 0.241, 0]}>
          <boxGeometry args={[0.03, 0.005, 1.36]} />
          <meshStandardMaterial {...MAT_BLACK_STEEL} />
        </mesh>
      ))}

      {/* 3. Four Heavy Steel Anchor Pedestals with Quad M30 Foundation Bolts */}
      {[
        [-0.72, -0.56],
        [0.72, -0.56],
        [-0.72, 0.56],
        [0.72, 0.56],
      ].map(([ax, az], i) => (
        <group key={`anchor_${i}`} position={[ax, 0.24, az]}>
          {/* Steel Footing Pad */}
          <RoundedBox args={[0.22, 0.08, 0.22]} radius={0.015} smoothness={4} position={[0, 0.04, 0]}>
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </RoundedBox>

          {/* 4 Foundation Hex Studs with Brass Washers */}
          {[
            [-0.065, -0.065],
            [0.065, -0.065],
            [-0.065, 0.065],
            [0.065, 0.065],
          ].map(([bx, bz], j) => (
            <group key={`bolt_${j}`} position={[bx, 0.08, bz]}>
              {/* Brass Compression Washer */}
              <mesh position={[0, 0.005, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.01, 16]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Mirror Chrome High-Tensile Hex Stud */}
              <mesh position={[0, 0.035, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.05, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 4. Heavy Upright H-Frame Bed Columns (Rising to y = 1.395) & Rigid Rear Cross-Beam */}
      {/* Rear Structural Cross-Tie Beam connecting Left and Right Columns */}
      <group position={[0, 0.78, -0.06]}>
        <RoundedBox args={[0.92, 0.22, 0.16]} radius={0.02} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
      </group>

      {/* Left Column */}
      <group position={[-0.58, 0.82, 0]}>
        <RoundedBox args={[0.26, 1.15, 0.36]} radius={0.025} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Base Stiffener Gussets */}
        <mesh position={[0.08, -0.42, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.12, 0.24, 0.32]} />
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </mesh>
      </group>

      {/* Right Column */}
      <group position={[0.58, 0.82, 0]}>
        <RoundedBox args={[0.26, 1.15, 0.36]} radius={0.025} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Base Stiffener Gussets */}
        <mesh position={[-0.08, -0.42, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.12, 0.24, 0.32]} />
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </mesh>
      </group>

      {/* 5. Column Top Mounting Pads (Docking interface for Cutting Chamber Order 2) */}
      {[-0.51, 0.51].map((mx, idx) => (
        <group key={`mount_pad_${idx}`} position={[mx, 1.38, 0]}>
          <RoundedBox args={[0.18, 0.06, 0.58]} radius={0.012} smoothness={4}>
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </RoundedBox>
          {/* Threaded Guide Studs */}
          {[-0.22, 0.22].map((sz, j) => (
            <mesh key={`mstud_${j}`} position={[0, 0.04, sz]}>
              <cylinderGeometry args={[0.018, 0.018, 0.035, 6]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 6. Machine Foundation Inspection Access Hatch with Brass Rating Plaque on Bed Face */}
      <group position={[0, 0.12, 0.725]}>
        <RoundedBox args={[0.62, 0.16, 0.02]} radius={0.008} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>
        {/* Perimeter Retention Bolts */}
        {[
          [-0.28, -0.05],
          [0.28, -0.05],
          [-0.28, 0.05],
          [0.28, 0.05],
        ].map(([hx, hy], k) => (
          <mesh key={`hatch_bolt_${k}`} position={[hx, hy, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.012, 6]} />
            <meshStandardMaterial {...MAT_CHROME} />
          </mesh>
        ))}

        {/* Polished Brass Rating & Certification Plaque */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.32, 0.10]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>
      </group>

      {/* 7. Electrical Grounding Brass Stud on Lower Footing */}
      <group position={[-0.82, 0.18, 0.50]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.06, 12]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>
      </group>
    </group>
  ),
};

// ============================================================================
// PART 1 (Order 1, Frame 20f): SHAFTS & CUTTERS CORE
// Arrives BEFORE Casing (Inside-Out Assembly Law)
// ============================================================================
const ModuleShaftsAndCutters: ModularPartSpec = {
  id: "tier3_shafts_cutters",
  name: "Massive Mirror-Chrome Hex Shafts & 5-Hook Claws Core",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.8,
  targetSocket: [0, 1.65, 0],
  sparkColor: "#38BDF8",
  sparkCount: 18,
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    // Dynamic Rotation: Left clockwise (-angle), Right counter-clockwise (+angle)
    const isSpinning = isRunning || localFrame >= 75;
    const shaftAngle = isSpinning
      ? ((localFrame - (isRunning ? 0 : 75)) * (rpm || 35) * Math.PI) / 900
      : 0;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Four Heavy Split Spherical Roller Bearing Pillow Blocks */}
        {[
          [-SHAFT_X_OFFSET, 0.44],
          [-SHAFT_X_OFFSET, -0.44],
          [SHAFT_X_OFFSET, 0.44],
          [SHAFT_X_OFFSET, -0.44],
        ].map(([bx, bz], i) => (
          <group key={`pillow_${i}`} position={[bx, 0, bz]}>
            {/* Cast Steel Pillow Block Base */}
            <RoundedBox args={[0.24, 0.22, 0.09]} radius={0.025} smoothness={4}>
              <meshStandardMaterial {...MAT_CAST_IRON} />
            </RoundedBox>

            {/* Mirror Chrome Bearing Seal Retainer End Cap */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.095, 24]} />
              <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
            </mesh>

            {/* 4 Heavy Chrome Pillow Block Cap Fasteners */}
            {[
              [-0.08, -0.07],
              [0.08, -0.07],
              [-0.08, 0.07],
              [0.08, 0.07],
            ].map(([cx, cy], j) => (
              <mesh key={`pbolt_${j}`} position={[cx, cy, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            ))}

            {/* Polished Brass High-Pressure Grease Tube & Zerk Fitting */}
            <mesh position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.045, 12]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* 2. LEFT ROTOR ASSEMBLY (Clockwise: -shaftAngle) */}
        <group position={[-SHAFT_X_OFFSET, 0, 0]} rotation={[0, 0, -shaftAngle]}>
          {/* Solid Forged 170mm Mirror-Chrome Hexagonal Shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 1.02, 6]} />
            <meshStandardMaterial {...MAT_CHROME} />
          </mesh>

          {/* Precision Machined End Journals */}
          {[-0.52, 0.52].map((jz, idx) => (
            <mesh key={`l_journal_${idx}`} position={[0, 0, jz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.14, 24]} />
              <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
            </mesh>
          ))}

          {/* Left 5-Hook Claw Blade Discs */}
          {Array.from({ length: BLADE_COUNT }).map((_, i) => {
            const z = (i - (BLADE_COUNT - 1) / 2) * BLADE_SPACING;
            const bladeOffsetAng = (i * Math.PI) / 5;
            return (
              <group key={`l_blade_${i}`} position={[0, 0, z]} rotation={[0, 0, bladeOffsetAng]}>
                {/* Hexagonal Hub Core locked onto Hex Shaft */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.108, 0.108, 0.038, 6]} />
                  <meshStandardMaterial {...MAT_CAST_STEEL} />
                </mesh>

                {/* Ground Chrome Spacer Ring */}
                <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.094, 0.094, 0.042, 24]} />
                  <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
                </mesh>

                {/* 5 Massive Curved Claw Hooks (Curling inward toward center nip) */}
                {[0, 1, 2, 3, 4].map((h) => {
                  const ang = (h * 2 * Math.PI) / 5;
                  return (
                    <group key={`l_claw_${h}`} rotation={[0, 0, ang]}>
                      {/* Heavy Forged Claw Base Arm */}
                      <mesh position={[0.13, 0.025, 0]}>
                        <boxGeometry args={[0.085, 0.048, 0.038]} />
                        <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
                      </mesh>
                      {/* Hardened Mirror-Chrome Inward-Curved Claw Tip */}
                      <mesh position={[0.172, 0.062, 0]} rotation={[0, 0, -0.55]}>
                        <coneGeometry args={[0.026, 0.065, 4]} />
                        <meshStandardMaterial {...MAT_CHROME} />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>

        {/* 3. RIGHT ROTOR ASSEMBLY (Counter-Clockwise: +shaftAngle) */}
        {/* Interleaved with Left Blades along Z by half-spacing */}
        <group position={[SHAFT_X_OFFSET, 0, 0]} rotation={[0, 0, shaftAngle]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 1.02, 6]} />
            <meshStandardMaterial {...MAT_CHROME} />
          </mesh>

          {/* End Journals */}
          {[-0.52, 0.52].map((jz, idx) => (
            <mesh key={`r_journal_${idx}`} position={[0, 0, jz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.14, 24]} />
              <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
            </mesh>
          ))}

          {/* Right 5-Hook Claw Blade Discs */}
          {Array.from({ length: BLADE_COUNT }).map((_, i) => {
            const z = (i - (BLADE_COUNT - 1) / 2) * BLADE_SPACING + BLADE_SPACING * 0.5;
            if (z > 0.36 || z < -0.36) return null;
            const bladeOffsetAng = (i * Math.PI) / 5 + Math.PI / 10;
            return (
              <group key={`r_blade_${i}`} position={[0, 0, z]} rotation={[0, 0, bladeOffsetAng]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.108, 0.108, 0.038, 6]} />
                  <meshStandardMaterial {...MAT_CAST_STEEL} />
                </mesh>

                <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.094, 0.094, 0.042, 24]} />
                  <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
                </mesh>

                {[0, 1, 2, 3, 4].map((h) => {
                  const ang = (h * 2 * Math.PI) / 5;
                  const isStressTooth = isBroken && i === 3 && h === 0;
                  return (
                    <group key={`r_claw_${h}`} rotation={[0, 0, ang]}>
                      <mesh position={[0.13, -0.025, 0]}>
                        <boxGeometry args={[0.085, 0.048, 0.038]} />
                        <meshStandardMaterial
                          color={isStressTooth ? "#EF4444" : MAT_CHROME_BRIGHT.color}
                          roughness={MAT_CHROME_BRIGHT.roughness}
                          metalness={MAT_CHROME_BRIGHT.metalness}
                        />
                      </mesh>
                      <mesh position={[0.172, -0.062, 0]} rotation={[0, 0, 0.55]}>
                        <coneGeometry args={[0.026, 0.065, 4]} />
                        <meshStandardMaterial
                          color={isStressTooth ? "#EF4444" : MAT_CHROME.color}
                          roughness={MAT_CHROME.roughness}
                          metalness={MAT_CHROME.metalness}
                        />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>
      </group>
    );
  },
};

// ============================================================================
// PART 2 (Order 2, Frame 40f): FINNED CUTTING CHAMBER & OPEN BEVELED HOPPER
// Encloses Part 1 from the outside
// ============================================================================
const ModuleCuttingChamberAndHopper: ModularPartSpec = {
  id: "tier3_chamber_hopper",
  name: "Finned Cutting Chamber & Open Beveled Hopper",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "top",
  travelDistance: 3.8,
  targetSocket: [0, 1.65, 0],
  sparkColor: "#F59E0B",
  sparkCount: 18,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Lateral Bed Mounting Brackets (Rest atop upright H-frame column pads) */}
      {[-0.51, 0.51].map((bx, idx) => (
        <group key={`anchor_bracket_${idx}`} position={[bx, -0.27, 0]}>
          <RoundedBox args={[0.16, 0.08, 0.62]} radius={0.015} smoothness={4}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>
          {/* Heavy Mirror-Chrome Hex Retention Nuts */}
          {[-0.22, 0.22].map((bz, j) => (
            <mesh key={`bnut_${j}`} position={[0, 0.045, bz]}>
              <cylinderGeometry args={[0.02, 0.02, 0.022, 6]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 2. Main Heavy Finned Cutting Chamber Enclosure */}
      {/* Left Wall with 5 Vertical Stiffener Ribs */}
      <group position={[-0.44, 0, 0]}>
        <RoundedBox args={[0.05, 0.58, 0.92]} radius={0.02} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {[-0.34, -0.17, 0, 0.17, 0.34].map((rz, i) => (
          <mesh key={`l_rib_${i}`} position={[-0.035, 0, rz]}>
            <boxGeometry args={[0.035, 0.54, 0.035]} />
            <meshStandardMaterial {...MAT_BLACK_STEEL} />
          </mesh>
        ))}
      </group>

      {/* Right Wall with 5 Vertical Stiffener Ribs */}
      <group position={[0.44, 0, 0]}>
        <RoundedBox args={[0.05, 0.58, 0.92]} radius={0.02} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {[-0.34, -0.17, 0, 0.17, 0.34].map((rz, i) => (
          <mesh key={`r_rib_${i}`} position={[0.035, 0, rz]}>
            <boxGeometry args={[0.035, 0.54, 0.035]} />
            <meshStandardMaterial {...MAT_BLACK_STEEL} />
          </mesh>
        ))}
      </group>

      {/* Front Bolted End Cheek Plate */}
      <group position={[0, 0, 0.46]}>
        <RoundedBox args={[0.92, 0.58, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Perimeter Flange Hex Bolts */}
        {[-0.38, -0.19, 0, 0.19, 0.38].map((fx, k) => (
          <React.Fragment key={`f_bolt_col_${k}`}>
            <mesh position={[fx, 0.24, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.02, 6]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
            <mesh position={[fx, -0.24, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.02, 6]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Rear Bolted End Cheek Plate (Mating interface for Planetary Drives) */}
      <group position={[0, 0, -0.46]}>
        <RoundedBox args={[0.92, 0.58, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
      </group>

      {/* 3. Inverted Tapered Discharge Chute (Directing scrap down to collection bin) */}
      <group position={[0, -0.45, 0]}>
        {/* Front Inverted Deflector Plate */}
        <RoundedBox args={[0.84, 0.30, 0.02]} radius={0.006} smoothness={4} position={[0, 0, 0.28]} rotation={[-0.32, 0, 0]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>
        {/* Rear Inverted Deflector Plate */}
        <RoundedBox args={[0.84, 0.30, 0.02]} radius={0.006} smoothness={4} position={[0, 0, -0.28]} rotation={[0.32, 0, 0]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>
        {/* Left Inverted Deflector Plate */}
        <RoundedBox args={[0.02, 0.30, 0.56]} radius={0.006} smoothness={4} position={[-0.39, 0, 0]} rotation={[0, 0, 0.25]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>
        {/* Right Inverted Deflector Plate */}
        <RoundedBox args={[0.02, 0.30, 0.56]} radius={0.006} smoothness={4} position={[0.39, 0, 0]} rotation={[0, 0, -0.25]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>
        {/* Bottom Discharge Flange Collar */}
        <RoundedBox args={[0.68, 0.035, 0.54]} radius={0.008} smoothness={4} position={[0, -0.14, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
      </group>

      {/* 4. Enormous Flared Beveled Hopper (Open 0.90m x 0.78m Throat Aperture) */}
      {/* Built with <RoundedBox radius={0.035}> per contract */}
      <group position={[0, 0.50, 0]}>
        {/* Front Flared Beveled Slope */}
        <RoundedBox args={[0.98, 0.48, 0.03]} radius={0.035} smoothness={4} position={[0, 0, 0.44]} rotation={[0.40, 0, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Rear Flared Beveled Slope */}
        <RoundedBox args={[0.98, 0.48, 0.03]} radius={0.035} smoothness={4} position={[0, 0, -0.44]} rotation={[-0.40, 0, 0]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Left Flared Beveled Slope */}
        <RoundedBox args={[0.03, 0.48, 0.86]} radius={0.035} smoothness={4} position={[-0.49, 0, 0]} rotation={[0, 0, -0.32]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>
        {/* Right Flared Beveled Slope */}
        <RoundedBox args={[0.03, 0.48, 0.86]} radius={0.035} smoothness={4} position={[0.49, 0, 0]} rotation={[0, 0, 0.32]}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* Safety Golden Top Perimeter Rim Frame (Leaves open 0.90m x 0.78m throat) */}
        <group position={[0, 0.22, 0]}>
          {/* Front Rim Bar */}
          <RoundedBox args={[1.16, 0.048, 0.12]} radius={0.015} smoothness={4} position={[0, 0, 0.46]}>
            <meshStandardMaterial {...MAT_SAFETY_GOLD} />
          </RoundedBox>
          {/* Rear Rim Bar */}
          <RoundedBox args={[1.16, 0.048, 0.12]} radius={0.015} smoothness={4} position={[0, 0, -0.46]}>
            <meshStandardMaterial {...MAT_SAFETY_GOLD} />
          </RoundedBox>
          {/* Left Rim Bar */}
          <RoundedBox args={[0.12, 0.048, 0.84]} radius={0.015} smoothness={4} position={[-0.52, 0, 0]}>
            <meshStandardMaterial {...MAT_SAFETY_GOLD} />
          </RoundedBox>
          {/* Right Rim Bar */}
          <RoundedBox args={[0.12, 0.048, 0.84]} radius={0.015} smoothness={4} position={[0.52, 0, 0]}>
            <meshStandardMaterial {...MAT_SAFETY_GOLD} />
          </RoundedBox>

          {/* Safety Danger Stripe Stencil Plate on Front Rim Face */}
          <mesh position={[0, 0, 0.522]}>
            <planeGeometry args={[0.68, 0.035]} />
            <meshStandardMaterial {...MAT_BLACK_STEEL} />
          </mesh>
        </group>
      </group>
    </group>
  ),
};

// ============================================================================
// PART 3 (Order 3, Frame 60f): MANIFOLD & DRIVE
// Docks from rear along Z
// ============================================================================
const ModuleManifoldAndDrive: ModularPartSpec = {
  id: "tier3_manifold_drive",
  name: "Brass Distributor Block, Braided Hoses & Dual Planetary Drives",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "back",
  travelDistance: 3.4,
  targetSocket: [0, 1.65, -0.56],
  sparkColor: "#D97706",
  sparkCount: 16,
  fracture: {
    breakFrame: 265,
    mode: "fling_parabolic",
    impulse: [0.35, -0.22, 0.18],
    rotationImpulse: [1.6, 0.4, 2.0],
    sparkOrigin: [0.22, 1.65, -0.56],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    // Dynamic Hydraulic Operating Pressure & Needle Deflection
    const pressureBar = isRunning ? 420 : localFrame >= 75 ? Math.min(420, (localFrame - 75) * 8) : 0;
    const supplyNeedleAngle = (-135 + (pressureBar / 600) * 270) * (Math.PI / 180);
    const diffNeedleAngle = (-135 + (Math.min(350, pressureBar * 0.7) / 400) * 270) * (Math.PI / 180);

    return (
      <group position={[0, 0, 0]}>
        {/* 1. LEFT PLANETARY REDUCTION GEARBOX (Shaft Left: -0.22) */}
        <group position={[-SHAFT_X_OFFSET, 0, 0]}>
          <RoundedBox args={[0.34, 0.34, 0.18]} radius={0.03} smoothness={4}>
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </RoundedBox>

          {/* Mirror-Chrome Flange Mounting Ring */}
          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.165, 0.165, 0.02, 28]} />
            <meshStandardMaterial {...MAT_CHROME} />
          </mesh>

          {/* 8 Chrome Flange Retention Fasteners */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={`l_flange_bolt_${idx}`}
                position={[Math.cos(rad) * 0.14, Math.sin(rad) * 0.14, 0.095]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.01, 0.01, 0.018, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            );
          })}

          {/* Radial Piston Hydraulic Motor Housing */}
          <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.16, 24]} />
            <meshStandardMaterial {...MAT_BLACK_STEEL} />
          </mesh>

          {/* Polished Brass Port Block */}
          <mesh position={[-0.08, 0.11, -0.14]}>
            <boxGeometry args={[0.04, 0.04, 0.05]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* 2. RIGHT PLANETARY REDUCTION GEARBOX (Shaft Right: +0.22) */}
        <group position={[SHAFT_X_OFFSET, 0, 0]}>
          <RoundedBox args={[0.34, 0.34, 0.18]} radius={0.03} smoothness={4}>
            <meshStandardMaterial
              color={isBroken ? "#EF4444" : MAT_CAST_IRON.color}
              roughness={MAT_CAST_IRON.roughness}
              metalness={MAT_CAST_IRON.metalness}
            />
          </RoundedBox>

          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.165, 0.165, 0.02, 28]} />
            <meshStandardMaterial {...MAT_CHROME} />
          </mesh>

          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={`r_flange_bolt_${idx}`}
                position={[Math.cos(rad) * 0.14, Math.sin(rad) * 0.14, 0.095]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.01, 0.01, 0.018, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            );
          })}

          <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.16, 24]} />
            <meshStandardMaterial {...MAT_BLACK_STEEL} />
          </mesh>

          <mesh position={[0.08, 0.11, -0.14]}>
            <boxGeometry args={[0.04, 0.04, 0.05]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* 3. CENTRAL POLISHED BRASS DISTRIBUTOR BLOCK (MANIFOLD) */}
        <group position={[0, 0.18, -0.06]}>
          {/* Main Brass Hydraulic Block */}
          <RoundedBox args={[0.34, 0.22, 0.16]} radius={0.02} smoothness={4}>
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </RoundedBox>

          {/* Dual Brass Pressure Relief Cartridges on Top */}
          {[-0.10, 0.10].map((rx, idx) => (
            <group key={`relief_${idx}`} position={[rx, 0.13, 0]}>
              <mesh>
                <cylinderGeometry args={[0.022, 0.022, 0.06, 16]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              {/* Mirror Chrome Hex Adjuster */}
              <mesh position={[0, 0.035, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.018, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            </group>
          ))}

          {/* Electro-Hydraulic Solenoid Spool Valve Body on Rear */}
          <mesh position={[0, -0.06, -0.10]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.16, 16]} />
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </mesh>

          {/* 4. DUAL GLYCERINE-FILLED PRESSURE DIAL GAUGES (Tilted for Top + Iso Camera clarity) */}
          {/* Left Gauge: 0-600 Bar Main Supply Pressure */}
          <group position={[-0.08, 0.04, 0.085]} rotation={[-0.25, 0, 0]}>
            {/* Mirror Chrome Bezel */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.018, 24]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
            {/* Dial Face Plate */}
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[0.048, 24]} />
              <meshBasicMaterial {...MAT_GAUGE_FACE} />
            </mesh>
            {/* Red Danger Zone Arc (450-600 Bar) */}
            <mesh position={[0.018, 0.018, 0.011]}>
              <planeGeometry args={[0.028, 0.012]} />
              <meshBasicMaterial {...MAT_RED_DANGER} />
            </mesh>
            {/* Pressure Indicator Needle */}
            <group position={[0, 0, 0.012]} rotation={[0, 0, -supplyNeedleAngle]}>
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.004, 0.04, 0.002]} />
                <meshBasicMaterial color="#0F172A" />
              </mesh>
            </group>
          </group>

          {/* Right Gauge: 0-400 Bar Motor Differential Pressure */}
          <group position={[0.08, 0.04, 0.085]} rotation={[-0.25, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.018, 24]} />
              <meshStandardMaterial {...MAT_CHROME} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[0.048, 24]} />
              <meshBasicMaterial {...MAT_GAUGE_FACE} />
            </mesh>
            <mesh position={[0.018, 0.018, 0.011]}>
              <planeGeometry args={[0.024, 0.012]} />
              <meshBasicMaterial {...MAT_RED_DANGER} />
            </mesh>
            <group position={[0, 0, 0.012]} rotation={[0, 0, -diffNeedleAngle]}>
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.004, 0.04, 0.002]} />
                <meshBasicMaterial color="#0F172A" />
              </mesh>
            </group>
          </group>

          {/* 5. BRAIDED STEEL HIGH-PRESSURE HYDRAULIC HOSES */}
          {/* Left Hose (Intact) */}
          <group position={[-0.14, -0.08, 0.02]} rotation={[0, 0, -0.55]}>
            <mesh>
              <cylinderGeometry args={[0.018, 0.018, 0.28, 16]} />
              <meshStandardMaterial {...MAT_BLACK_STEEL} />
            </mesh>
            {/* Polished Brass Hose End Fittings */}
            {[-0.13, 0.13].map((hy, idx) => (
              <mesh key={`l_fitting_${idx}`} position={[0, hy, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.03, 12]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            ))}
          </group>

          {/* Right Hose (Intact or Ruptured Whipping in Act 4) */}
          {!isBroken ? (
            <group position={[0.14, -0.08, 0.02]} rotation={[0, 0, 0.55]}>
              <mesh>
                <cylinderGeometry args={[0.018, 0.018, 0.28, 16]} />
                <meshStandardMaterial {...MAT_BLACK_STEEL} />
              </mesh>
              {[-0.13, 0.13].map((hy, idx) => (
                <mesh key={`r_fitting_${idx}`} position={[0, hy, 0]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.03, 12]} />
                  <meshStandardMaterial {...MAT_POLISHED_BRASS} />
                </mesh>
              ))}
            </group>
          ) : (
            <group position={[0.16, -0.04, 0.02]} rotation={[0, 0, 1.45]}>
              <mesh position={[0.06, -0.08, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.24, 16]} />
                <meshStandardMaterial {...MAT_RED_DANGER} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    );
  },
};

// ============================================================================
// PART 4 (Order 4, Frame 75f): DISCHARGE BIN & CLEANING COMB ANVIL FINGERS
// Arrives from front under discharge chute onto bed plate
// ============================================================================
const ModuleDischargeBinAndComb: ModularPartSpec = {
  id: "tier3_discharge_collector",
  name: "Cast Steel Collection Bin & Cleaning Comb Anvil",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "front",
  travelDistance: 3.2,
  targetSocket: [0, 0.45, 0],
  sparkColor: "#10B981",
  sparkCount: 16,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Cast Steel Collection Bin Body (Spans y = -0.21 to +0.21 relative to 0.45, resting on bed at y=0.24) */}
      <RoundedBox args={[0.78, 0.42, 0.70]} radius={0.025} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial {...MAT_CAST_STEEL} />
      </RoundedBox>

      {/* Top Open Scrap Receiver Flange Rim */}
      <RoundedBox args={[0.82, 0.04, 0.74]} radius={0.012} smoothness={4} position={[0, 0.21, 0]}>
        <meshStandardMaterial {...MAT_CAST_IRON} />
      </RoundedBox>

      {/* 2. Dual Forklift Tine Channels / Pockets on Base */}
      {[-0.20, 0.20].map((fx, idx) => (
        <mesh key={`forklift_pocket_${idx}`} position={[fx, -0.17, 0]}>
          <boxGeometry args={[0.14, 0.07, 0.74]} />
          <meshStandardMaterial {...MAT_BLACK_STEEL} />
        </mesh>
      ))}

      {/* 3. Front Heavy Bin Pull Handle with Mirror-Chrome Grip */}
      <group position={[0, 0.06, 0.36]}>
        {/* Steel Stanchion Brackets */}
        {[-0.18, 0.18].map((hx, idx) => (
          <mesh key={`handle_bracket_${idx}`} position={[hx, 0, 0]}>
            <boxGeometry args={[0.03, 0.05, 0.06]} />
            <meshStandardMaterial {...MAT_CAST_IRON} />
          </mesh>
        ))}
        {/* Mirror-Chrome Heavy Grip Bar */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.36, 16]} />
          <meshStandardMaterial {...MAT_CHROME} />
        </mesh>
      </group>

      {/* 4. Front Scrap Fill Level Inspection Window with Polished Brass Frame */}
      <group position={[0, -0.04, 0.352]}>
        {/* Dark Recessed Backing */}
        <mesh>
          <planeGeometry args={[0.42, 0.16]} />
          <meshStandardMaterial {...MAT_BLACK_STEEL} />
        </mesh>
        {/* Polished Brass Retaining Frame */}
        <RoundedBox args={[0.46, 0.20, 0.015]} radius={0.008} smoothness={4} position={[0, 0, 0.005]}>
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </RoundedBox>
        {/* 5 Vertical Scrap Sight Grate Slits */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((sx, idx) => (
          <mesh key={`sight_slit_${idx}`} position={[sx, 0, 0.01]}>
            <boxGeometry args={[0.012, 0.13, 0.005]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
        ))}
      </group>

      {/* 5. CLEANING COMB ANVIL FINGERS (World y = 1.43, relative local y = 0.98) */}
      {/* Heavy Crossbar Anvil Beam */}
      <group position={[0, 0.98, 0]}>
        <RoundedBox args={[0.44, 0.055, 0.72]} radius={0.012} smoothness={4}>
          <meshStandardMaterial {...MAT_CAST_IRON} />
        </RoundedBox>

        {/* 8 Intermeshing High-Tensile Steel Anvil Cleaning Fingers */}
        {/* Reach horizontally between rotating claw blades to shear debris */}
        {Array.from({ length: 8 }).map((_, i) => {
          const z = (i - 3.5) * BLADE_SPACING;
          return (
            <group key={`comb_finger_${i}`} position={[0, 0, z]}>
              {/* Hardened Steel Finger Bar */}
              <mesh>
                <boxGeometry args={[0.38, 0.045, 0.026]} />
                <meshStandardMaterial {...MAT_CHROME_BRIGHT} />
              </mesh>
              {/* Beveled Chamfer Tips on Left and Right Ends */}
              {[-0.19, 0.19].map((cx, idx) => (
                <mesh
                  key={`tip_${idx}`}
                  position={[cx, 0, 0]}
                  rotation={[0, 0, cx < 0 ? Math.PI / 2 : -Math.PI / 2]}
                >
                  <coneGeometry args={[0.018, 0.045, 4]} />
                  <meshStandardMaterial {...MAT_CHROME} />
                </mesh>
              ))}
              {/* Chrome Retention Bolt */}
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.015, 6]} />
                <meshStandardMaterial {...MAT_CHROME} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  ),
};

// ============================================================================
// MODULAR EXPORTS (AssemblyContract Compliance)
// ============================================================================

/**
 * Tier3Spec: All 5 modular parts conforming strictly to ModularPartSpec[]
 */
export const Tier3Spec: ModularPartSpec[] = [
  ModuleBed,
  ModuleShaftsAndCutters,
  ModuleCuttingChamberAndHopper,
  ModuleManifoldAndDrive,
  ModuleDischargeBinAndComb,
];

/**
 * Tier3AssemblySpec: MachineAssemblySpec for Tier 3 Industrial Hydraulic Shredder
 */
export const Tier3AssemblySpec: MachineAssemblySpec = {
  id: "tier3_hydraulic",
  name: "50-Ton Heavy Industrial Dual-Shaft Shredder",
  tier: 3,
  modules: Tier3Spec,
};
