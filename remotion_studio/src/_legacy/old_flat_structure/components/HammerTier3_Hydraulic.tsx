import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "./AssemblyContract";

/**
 * ============================================================================
 * TIER 3: $1,000 INDUSTRIAL HYDRAULIC POWER HAMMER (HammerTier3_Hydraulic.tsx)
 * ============================================================================
 * Complies strictly with remotion_studio/crew/3d_modeler.md & AssemblyContract.ts
 *
 * Golden Modular Assembly Sequence (Inside-Out Law):
 * Order 0 (0f):  Base - Heavy H-frame seismic monolith base, vibration dampers and 5-ton hardened anvil block (dark gunmetal #1E293B, roughness 0.6).
 * Order 1 (20f): Piston Core - Massive dual hydraulic cylinder chrome shafts and internal piston plunger. MUST arrive BEFORE casing!
 * Order 2 (40f): Portal Frame Housing - Armored cast steel portal C-frame housing with dual guide ways (<RoundedBox radius={0.03}>, #0F172A).
 * Order 3 (60f): Drive - Hydraulic manifold block, high-pressure braided steel conduits, and brass dial pressure gauges.
 * Order 4 (75f): Toolhead - Massive alloy tool-steel drop ram with wedge key pointing vertically DOWN along Y-axis into specimen.
 *
 * Material Triad:
 * - Dark gunmetal: #1E293B (roughness: 0.60, metalness: 0.50) / #0F172A portal frame
 * - Mirror chrome: #F8FAFC (roughness: 0.08, metalness: 0.98)
 * - Polished brass: #F59E0B (roughness: 0.15, metalness: 0.95)
 */

// Shared PBR Material Presets
const MAT_GUNMETAL_BASE = { color: "#1E293B", roughness: 0.60, metalness: 0.50 };
const MAT_PORTAL_STEEL = { color: "#0F172A", roughness: 0.65, metalness: 0.60 };
const MAT_MACHINED_STEEL = { color: "#334155", roughness: 0.45, metalness: 0.70 };
const MAT_HARDENED_DIE = { color: "#CBD5E1", roughness: 0.18, metalness: 0.92 };
const MAT_MIRROR_CHROME = { color: "#F8FAFC", roughness: 0.08, metalness: 0.98 };
const MAT_POLISHED_BRASS = { color: "#F59E0B", roughness: 0.15, metalness: 0.95 };
const MAT_BRAIDED_CONDUIT = { color: "#94A3B8", roughness: 0.30, metalness: 0.85 };
const MAT_RUBBER_DAMPER = { color: "#0B0F19", roughness: 0.90, metalness: 0.10 };
const MAT_GAUGE_FACE = { color: "#FFFFFF", roughness: 0.30, metalness: 0.05 };
const MAT_DANGER_RED = { color: "#EF4444", roughness: 0.20, metalness: 0.80 };
const MAT_HYDRAULIC_OIL = { color: "#D97706", roughness: 0.10, metalness: 0.20, transparent: true, opacity: 0.75 };

/**
 * Kinematic calculation for heavy hydraulic stroke.
 * Heavy hydraulic stroke: slow powerful lift (frames 0..16), rapid explosive downward strike (frames 16..21).
 * Catastrophic blowout on frame 265: ram jams down onto anvil bed.
 */
function getHydraulicStroke(localFrame: number, isRunning: boolean, isBroken: boolean): { strokeY: number; impactShake: number } {
  const isBurst = isBroken || localFrame >= 265;
  const isOperating = isRunning && localFrame >= 150 && localFrame < 225;
  const isDecel = isRunning && localFrame >= 225 && localFrame < 245;
  const isStall = isRunning && localFrame >= 245 && localFrame < 265;

  // Ingot top = 0.950, anvil face = 0.790
  // Resting ram die bottom = 1.250 (30 cm air gap above workpiece)
  let dieY = 1.250;
  let impactShake = 0;

  if (isBurst) {
    dieY = 0.850;
    impactShake = 0;
  } else if (isStall) {
    const pShudder = (localFrame - 245) / 19;
    const amp = 0.0005 + pShudder * 0.0025; // 0.5mm to 3mm
    const shudder = Math.sin(localFrame * 35) * amp;
    dieY = 0.850 + shudder;
    impactShake = shudder;
  } else if (isDecel) {
    const pDecel = (localFrame - 225) / 20;
    dieY = 1.250 - (1.250 - 0.850) * Math.min(1, Math.pow(pDecel, 0.9));
  } else if (isOperating) {
    const cycle = (localFrame - 150) % 22;
    const defProg = (localFrame - 150) / 74;
    const strikeY = Math.max(0.795, 0.950 - defProg * (0.950 - 0.850)); // 0.950 down to 0.850, strictly >= 0.795
    if (cycle < 14) {
      // 65% of cycle (14/22 frames): ram stays HIGH at top Y=1.250 (30 cm air gap)
      dieY = 1.250;
    } else if (cycle < 18) {
      // Plunge with hydraulic acceleration
      const t = (cycle - 14) / 4;
      dieY = 1.250 - (1.250 - strikeY) * (t * t);
    } else if (cycle === 18 || cycle === 19) {
      // Strike contact (touches ingot, strictly >= 0.795, strictly above anvil 0.790)
      dieY = strikeY;
      impactShake = 0.006;
    } else {
      // Rapid hydraulic recoil back up to top Y=1.250
      dieY = 1.250;
    }
  } else if (isRunning && localFrame >= 70) {
    // Startup frames (70..149): ram stays at resting top position 1.250
    dieY = 1.250;
  }

  // In ModuleRamToolhead: targetSocket is [0, 1.15, 0]. Die face bottom is at (1.15 - 0.346 + strokeY) = (0.804 + strokeY)
  // strokeY = dieY - 0.804
  const strokeY = dieY - 0.804;

  return { strokeY, impactShake };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): HEAVY H-FRAME SEISMIC MONOLITH BASE & ANVIL
// ============================================================================
const ModuleBase: ModularPartSpec = {
  id: "t3_h_frame_base",
  name: "Heavy H-Frame Seismic Monolith Base & Anvil Block",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#F59E0B",
  sparkCount: 16,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy H-Frame Monolithic Bed Casting */}
      <RoundedBox args={[1.52, 0.22, 1.18]} radius={0.03} smoothness={4} position={[0, 0.11, 0]}>
        <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
      </RoundedBox>

      {/* Cast H-Frame Lateral Recesses (Creates True H-Profile) */}
      <mesh position={[0, 0.11, 0.58]}>
        <boxGeometry args={[0.72, 0.18, 0.08]} />
        <meshStandardMaterial {...MAT_PORTAL_STEEL} />
      </mesh>
      <mesh position={[0, 0.11, -0.58]}>
        <boxGeometry args={[0.72, 0.18, 0.08]} />
        <meshStandardMaterial {...MAT_PORTAL_STEEL} />
      </mesh>

      {/* Machined Alignment T-Slots along Base Table */}
      {[-0.42, 0.42].map((tx, idx) => (
        <mesh key={`tslot_${idx}`} position={[tx, 0.221, 0]}>
          <boxGeometry args={[0.04, 0.008, 1.08]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.85} metalness={0.4} />
        </mesh>
      ))}

      {/* 2. Four Heavy Seismic Vibration Dampers & Corner Tie-Down Anchors */}
      {[
        [-0.64, -0.48],
        [0.64, -0.48],
        [-0.64, 0.48],
        [0.64, 0.48],
      ].map(([dx, dz], i) => (
        <group key={`damper_${i}`} position={[dx, 0.22, dz]}>
          {/* Heavy Elastomer Damper Base Pad */}
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.07, 24]} />
            <meshStandardMaterial {...MAT_RUBBER_DAMPER} />
          </mesh>

          {/* Polished Brass Compression Retaining Ring */}
          <mesh position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.02, 24]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>

          {/* Mirror Chrome High-Tensile Anchor Stud & Nut */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.09, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
          <mesh position={[0, 0.155, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.03, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        </group>
      ))}

      {/* 3. 5-Ton Hardened Anvil Block Monolith */}
      <group position={[0, 0.22, 0]}>
        {/* Main Anvil Riser Body */}
        <RoundedBox args={[0.66, 0.42, 0.56]} radius={0.03} smoothness={4} position={[0, 0.21, 0]}>
          <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
        </RoundedBox>

        {/* Diagonal Structural Gussets Connecting Anvil to Base Flanges */}
        {[-0.38, 0.38].map((gx, idx) => (
          <group key={`gusset_${idx}`} position={[gx, 0.14, 0]}>
            <mesh rotation={[0, 0, (gx > 0 ? 1 : -1) * 0.45]}>
              <boxGeometry args={[0.14, 0.28, 0.48]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* Anvil Bolster Plate with Machined Dovetail Guides */}
        <RoundedBox args={[0.52, 0.07, 0.44]} radius={0.015} smoothness={4} position={[0, 0.455, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Polished Brass Locking Gib Keys on Bolster Face */}
        {[-0.23, 0.23].map((kx, idx) => (
          <mesh key={`gibkey_${idx}`} position={[kx, 0.46, 0]}>
            <boxGeometry args={[0.025, 0.04, 0.38]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        ))}

        {/* Replaceable Hardened Alloy Tool-Steel Lower Forging Die Block */}
        <RoundedBox args={[0.36, 0.08, 0.34]} radius={0.012} smoothness={4} position={[0, 0.53, 0]}>
          <meshStandardMaterial {...MAT_HARDENED_DIE} />
        </RoundedBox>

        {/* Precision Die Dovetail Tenon Key */}
        <mesh position={[0, 0.495, 0]}>
          <boxGeometry args={[0.26, 0.02, 0.30]} />
          <meshStandardMaterial {...MAT_MIRROR_CHROME} />
        </mesh>
      </group>
    </group>
  ),
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): PISTON CORE (Arrives BEFORE Casing!)
// ============================================================================
const ModulePistonCore: ModularPartSpec = {
  id: "t3_piston_core",
  name: "Dual Hydraulic Cylinder Chrome Shafts & Internal Piston Plungers",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.4,
  targetSocket: [0, 1.25, 0],
  sparkColor: "#38BDF8",
  sparkCount: 20,
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { strokeY } = getHydraulicStroke(localFrame, isRunning, isBroken);

    return (
      <group position={[0, 0, 0]}>
        {/* Synchronous Reciprocating Dual Shaft Core */}
        <group position={[0, strokeY, 0]}>
          {/* Dual Mirror Chrome Hydraulic Piston Shafts */}
          {[-0.34, 0.34].map((sx, idx) => (
            <group key={`shaft_${idx}`} position={[sx, 0, 0]}>
              {/* Massive Polished Mirror-Chrome Cylinder Shaft */}
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.048, 0.048, 0.96, 32]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>

              {/* Upper Internal High-Pressure Piston Head */}
              <mesh position={[0, 0.58, 0]}>
                <cylinderGeometry args={[0.078, 0.078, 0.10, 28]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>

              {/* Dual Cast Bronze Piston Compression Rings */}
              <mesh position={[0, 0.60, 0]}>
                <cylinderGeometry args={[0.081, 0.081, 0.018, 28]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              <mesh position={[0, 0.56, 0]}>
                <cylinderGeometry args={[0.081, 0.081, 0.018, 28]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>

              {/* Bottom Heavy Clevis Coupling Flange */}
              <RoundedBox args={[0.13, 0.08, 0.13]} radius={0.015} smoothness={4} position={[0, -0.34, 0]}>
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </RoundedBox>

              {/* Hex Mounting Studs on Coupler */}
              {[-0.04, 0.04].map((bx, j) => (
                <mesh key={`stud_${j}`} position={[bx, -0.39, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Heavy Synchronizer Cross-Tie Yoke Beam */}
          <RoundedBox args={[0.82, 0.09, 0.18]} radius={0.02} smoothness={4} position={[0, 0.52, 0]}>
            <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
          </RoundedBox>

          {/* Central Hydraulic Guide Pin with Brass Collar */}
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.16, 20]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* Stationary Polished Brass Lower Wiper Gland Collars */}
        {[-0.34, 0.34].map((sx, idx) => (
          <group key={`gland_${idx}`} position={[sx, -0.18, 0]}>
            <mesh>
              <cylinderGeometry args={[0.072, 0.072, 0.04, 24]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Hex Retainer Ring */}
            <mesh position={[0, -0.025, 0]}>
              <cylinderGeometry args={[0.078, 0.078, 0.02, 6]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): PORTAL FRAME HOUSING (Dual Guide Ways)
// ============================================================================
const ModulePortalFrame: ModularPartSpec = {
  id: "t3_portal_frame_housing",
  name: "Armored Cast Steel Portal C-Frame Housing with Dual Guide Ways",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "front",
  travelDistance: 3.5,
  targetSocket: [0, 1.05, 0],
  sparkColor: "#F59E0B",
  sparkCount: 18,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* 1. Twin Vertical Armored Portal Columns */}
      {[-0.48, 0.48].map((cx, idx) => (
        <group key={`col_${idx}`} position={[cx, 0, 0]}>
          {/* Main Column Cast Steel Box Body */}
          <RoundedBox args={[0.26, 1.52, 0.48]} radius={0.03} smoothness={4} position={[0, 0.04, 0]}>
            <meshStandardMaterial {...MAT_PORTAL_STEEL} />
          </RoundedBox>

          {/* Side Outer Stiffener Ribbing & Recessed Flange (Adds High-End Profile Depth in Side View) */}
          <group position={[cx > 0 ? 0.132 : -0.132, 0.04, 0]}>
            {/* Recessed Machined Flange Panel */}
            <mesh>
              <boxGeometry args={[0.008, 1.28, 0.36]} />
              <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
            </mesh>
            {/* Column Side Inspection Access Cover */}
            <mesh position={[cx > 0 ? 0.006 : -0.006, -0.15, 0]}>
              <boxGeometry args={[0.006, 0.38, 0.26]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Cover Retaining Brass Screws */}
            {[-0.12, 0.12].map((sz, j) => (
              <mesh
                key={`side_bolt_${j}`}
                position={[cx > 0 ? 0.012 : -0.012, -0.15, sz]}
                rotation={[0, 0, cx > 0 ? Math.PI / 2 : -Math.PI / 2]}
              >
                <cylinderGeometry args={[0.010, 0.010, 0.016, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            ))}

            {/* Heavy Forged Crane Lifting Trunnion / Eye Lug */}
            <group position={[cx > 0 ? 0.02 : -0.02, 0.52, 0]}>
              <mesh rotation={[0, 0, cx > 0 ? Math.PI / 2 : -Math.PI / 2]}>
                <cylinderGeometry args={[0.042, 0.042, 0.04, 20]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              <mesh
                position={[cx > 0 ? 0.03 : -0.03, 0, 0]}
                rotation={[0, cx > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              >
                <torusGeometry args={[0.036, 0.012, 16, 24]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          </group>

          {/* Machined Inner Vertical Prismatic V-Way Guides (Prismatic Gibs) */}
          <group position={[cx > 0 ? -0.125 : 0.125, -0.08, 0]}>
            <mesh>
              <boxGeometry args={[0.022, 1.22, 0.22]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Hardened Brass Wear Strip Plates */}
            <mesh position={[cx > 0 ? 0.012 : -0.012, 0, 0]}>
              <boxGeometry args={[0.008, 1.18, 0.20]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Gib Adjustment Setting Screws */}
            {[-0.45, -0.15, 0.15, 0.45].map((gy, j) => (
              <mesh key={`gibscrew_${j}`} position={[0, gy, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            ))}
          </group>

          {/* Heavy Pre-Stressed Tie Rod Penetrations */}
          {[-0.16, 0.16].map((tz, k) => (
            <mesh key={`tierod_${k}`} position={[0, 0.82, tz]}>
              <cylinderGeometry args={[0.026, 0.026, 0.10, 20]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))}
          {/* Tie Rod Anchor M42 Hex Nuts with Spherical Washers */}
          {[-0.16, 0.16].map((tz, k) => (
            <group key={`nut_${k}`} position={[0, 0.86, tz]}>
              <mesh position={[0, -0.01, 0]}>
                <cylinderGeometry args={[0.038, 0.038, 0.015, 24]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.034, 0.034, 0.045, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 2. Heavy Cast Top Portal Bridge & Crosshead Beam */}
      <RoundedBox args={[1.24, 0.32, 0.54]} radius={0.03} smoothness={4} position={[0, 0.74, 0]}>
        <meshStandardMaterial {...MAT_PORTAL_STEEL} />
      </RoundedBox>

      {/* 3. Dual Hydraulic Cylinder Jacketed Barrels */}
      {[-0.34, 0.34].map((bx, idx) => (
        <group key={`barrel_${idx}`} position={[bx, 0.62, 0]}>
          {/* Heavy Cast Cylinder Barrel */}
          <mesh>
            <cylinderGeometry args={[0.098, 0.098, 0.54, 32]} />
            <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
          </mesh>

          {/* Barrel External Cooling Fins */}
          {[-0.18, -0.09, 0, 0.09, 0.18].map((fy, j) => (
            <mesh key={`fin_${j}`} position={[0, fy, 0]}>
              <cylinderGeometry args={[0.108, 0.108, 0.016, 32]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}

          {/* Cylinder Top End-Cap Flange with High-Tensile Studs */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.116, 0.116, 0.04, 24]} />
            <meshStandardMaterial {...MAT_PORTAL_STEEL} />
          </mesh>
          {[0, 60, 120, 180, 240, 300].map((deg, s) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={`stud_${s}`} position={[Math.cos(rad) * 0.095, 0.305, Math.sin(rad) * 0.095]}>
                <cylinderGeometry args={[0.010, 0.010, 0.025, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* 4. Heavy Brass Specification Plaque on Front Bridge */}
      <group position={[0, 0.74, 0.275]}>
        <mesh>
          <boxGeometry args={[0.48, 0.12, 0.012]} />
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </mesh>
        <mesh position={[0, 0.025, 0.008]}>
          <boxGeometry args={[0.42, 0.03, 0.004]} />
          <meshStandardMaterial {...MAT_PORTAL_STEEL} />
        </mesh>
        <mesh position={[0, -0.025, 0.008]}>
          <boxGeometry args={[0.34, 0.025, 0.004]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.5} />
        </mesh>
        {/* Plaque Mounting Rivets */}
        {[-0.22, 0.22].map((rx, idx) => (
          <mesh key={`rivet_${idx}`} position={[rx, 0, 0.008]}>
            <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        ))}
      </group>
    </group>
  ),
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): DRIVE (Manifold, Braided Conduits & Dial Gauges)
// ============================================================================
const ModuleHydraulicDrive: ModularPartSpec = {
  id: "t3_hydraulic_drive",
  name: "Hydraulic Manifold Block, Braided Steel Conduits & Dial Pressure Gauges",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "right",
  travelDistance: 3.2,
  targetSocket: [0, 1.88, 0],
  sparkColor: "#F59E0B",
  sparkCount: 20,
  fracture: {
    breakFrame: 265,
    mode: "fling_parabolic",
    impulse: [0.55, 0.35, 0.40],
    rotationImpulse: [1.6, 0.9, 2.2],
    sparkOrigin: [0.24, 1.88, 0.16],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    const isBurst = isBroken || localFrame >= 265;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. CNC-Machined Solid Brass Hydraulic Manifold Block */}
        <RoundedBox args={[0.42, 0.18, 0.26]} radius={0.02} smoothness={4} position={[0, 0.06, 0]}>
          <meshStandardMaterial {...MAT_POLISHED_BRASS} />
        </RoundedBox>

        {/* Manifold Port Plugs & Pressure Tap Ports */}
        {[-0.14, 0, 0.14].map((px, idx) => (
          <mesh key={`port_${idx}`} position={[px, 0.155, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.02, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        ))}

        {/* 2. Proportional Solenoid Servo Valves */}
        {[-0.12, 0.12].map((vx, idx) => (
          <group key={`valve_${idx}`} position={[vx, 0.06, -0.16]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.12, 20]} />
              <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
            </mesh>
            <mesh position={[0, 0, -0.07]}>
              <boxGeometry args={[0.045, 0.045, 0.03]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* 3. Dual Analog Dial Pressure Gauges (600-Bar Specification) */}
        {[-0.13, 0.13].map((gx, idx) => (
          <group key={`gauge_${idx}`} position={[gx, 0.23, 0.12]} rotation={[-0.2, 0, 0]}>
            {/* Polished Brass Gauge Bezel Housing */}
            <mesh>
              <cylinderGeometry args={[0.072, 0.072, 0.036, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Gauge White Face Plate */}
            <mesh position={[0, 0.019, 0]}>
              <cylinderGeometry args={[0.064, 0.064, 0.005, 32]} />
              <meshStandardMaterial {...MAT_GAUGE_FACE} />
            </mesh>

            {/* Gauge Dial Markings / 600-Bar Danger Arc Ring */}
            <mesh position={[0, 0.022, 0]}>
              <ringGeometry args={[0.042, 0.056, 24, 1, 0, Math.PI * 1.5]} />
              <meshStandardMaterial {...MAT_DANGER_RED} />
            </mesh>

            {/* Indicator Needle */}
            <group position={[0, 0.024, 0]} rotation={[0, isBurst ? 1.8 : 0.85, 0]}>
              <mesh position={[0.022, 0, 0]}>
                <boxGeometry args={[0.042, 0.004, 0.004]} />
                <meshStandardMaterial {...MAT_DANGER_RED} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.008, 12]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>

            {/* Brass Fitting Stem to Manifold */}
            <mesh position={[0, -0.045, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.05, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* 4. High-Pressure Braided Stainless Steel Hydraulic Conduits */}
        {/* Left Conduit running to Left Cylinder Head */}
        <group position={[-0.22, -0.04, 0]}>
          <mesh rotation={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.024, 0.024, 0.26, 20]} />
            <meshStandardMaterial {...MAT_BRAIDED_CONDUIT} />
          </mesh>
          <mesh position={[-0.10, -0.08, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.04, 6]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* Right Conduit (Blowout Site on Frame 265) */}
        <group position={[0.22, -0.04, 0]}>
          {!isBurst ? (
            <group>
              <mesh rotation={[0, 0, -0.65]}>
                <cylinderGeometry args={[0.024, 0.024, 0.26, 20]} />
                <meshStandardMaterial {...MAT_BRAIDED_CONDUIT} />
              </mesh>
              <mesh position={[0.10, -0.08, 0]}>
                <cylinderGeometry args={[0.034, 0.034, 0.04, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ) : (
            /* 600-Bar Catastrophic Rupture / Blowout Geometry */
            <group position={[0.08, -0.06, 0.05]}>
              {/* Ruptured Fitting Shell */}
              <mesh rotation={[0.4, 0.3, -0.9]}>
                <cylinderGeometry args={[0.034, 0.028, 0.12, 16]} />
                <meshStandardMaterial {...MAT_DANGER_RED} />
              </mesh>

              {/* Shredded Stainless Braid Wires */}
              <mesh position={[0.06, 0.04, 0]}>
                <dodecahedronGeometry args={[0.05, 0]} />
                <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* High-Velocity Atomized Oil Mist Spray Cloud */}
              {[
                [0.08, 0.06, 0.05, 0.07],
                [0.16, 0.12, 0.09, 0.11],
                [0.25, 0.19, 0.14, 0.16],
                [0.34, 0.26, 0.20, 0.22],
              ].map(([sx, sy, sz, srad], mi) => (
                <mesh key={`mist_${mi}`} position={[sx, sy, sz]}>
                  <sphereGeometry args={[srad, 12, 12]} />
                  <meshStandardMaterial
                    color="#FCD34D"
                    emissive="#F59E0B"
                    emissiveIntensity={0.6}
                    transparent={true}
                    opacity={0.45 - mi * 0.08}
                    roughness={0.9}
                  />
                </mesh>
              ))}

              {/* Liquid Hydraulic Oil Jet Sprays */}
              {[0, 1, 2, 3].map((ji) => (
                <mesh
                  key={`jet_${ji}`}
                  position={[0.10 + ji * 0.04, -0.05 - ji * 0.03, ji * 0.03]}
                  rotation={[0.3, 0.2, -1.1]}
                >
                  <cylinderGeometry args={[0.008, 0.016, 0.12, 8]} />
                  <meshStandardMaterial {...MAT_HYDRAULIC_OIL} />
                </mesh>
              ))}
            </group>
          )}
        </group>

        {/* 5. Nitrogen Bladder Hydraulic Accumulator Bottle */}
        <group position={[0.36, 0.08, -0.12]}>
          <mesh>
            <cylinderGeometry args={[0.064, 0.064, 0.28, 24]} />
            <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.064, 18, 18]} />
            <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.04, 12]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): TOOLHEAD (Alloy Drop Ram & Wedge Key Die)
// ============================================================================
const ModuleRamToolhead: ModularPartSpec = {
  id: "t3_ram_toolhead",
  name: "Massive Alloy Tool-Steel Drop Ram & Wedge Key Die",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "bottom",
  travelDistance: 2.4,
  targetSocket: [0, 1.15, 0],
  sparkColor: "#10B981",
  sparkCount: 24,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.014, 0.08, 0.008],
    rotationImpulse: [0.018, 0.008, 0.032],
    sparkOrigin: [0, 0.74, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { strokeY, impactShake } = getHydraulicStroke(localFrame, isRunning, isBroken);

    return (
      <group position={[0, strokeY + impactShake, 0]}>
        {/* 1. Heavy Alloy Tool-Steel Drop Ram Block (Tup) */}
        <RoundedBox args={[0.48, 0.44, 0.44]} radius={0.03} smoothness={4} position={[0, 0.04, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Ram Front Recessed Inspection Panel */}
        <mesh position={[0, 0.04, 0.222]}>
          <boxGeometry args={[0.34, 0.28, 0.01]} />
          <meshStandardMaterial {...MAT_GUNMETAL_BASE} />
        </mesh>

        {/* Polished Brass Grease Injection Fittings on Ram Face */}
        {[-0.12, 0.12].map((gx, idx) => (
          <mesh key={`grease_${idx}`} position={[gx, 0.14, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.010, 0.010, 0.02, 12]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        ))}

        {/* 2. Prismatic Lateral Guide Shoes Engaging Portal Column V-Ways */}
        {[-0.25, 0.25].map((sx, idx) => (
          <group key={`shoe_${idx}`} position={[sx, 0.04, 0]}>
            <mesh>
              <boxGeometry args={[0.03, 0.38, 0.24]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Bronze Low-Friction Wear Liners */}
            <mesh position={[sx > 0 ? 0.016 : -0.016, 0, 0]}>
              <boxGeometry args={[0.008, 0.34, 0.20]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* 3. Transverse Hardened Wedge Key & Taper Locking Pin */}
        <group position={[0, -0.08, 0]}>
          {/* Dovetail Wedge Key Slot */}
          <mesh>
            <boxGeometry args={[0.54, 0.065, 0.08]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          {/* Protruding Forged Taper Pin Head */}
          <mesh position={[0.28, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 6]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
          <mesh position={[-0.28, 0, 0]}>
            <boxGeometry args={[0.015, 0.045, 0.03]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* 4. Upper Hardened Alloy Tool-Steel Drop Die (Points Vertically DOWN into Specimen) */}
        <group position={[0, -0.25, 0]}>
          {/* Upper Die Mounting Bolster */}
          <RoundedBox args={[0.38, 0.08, 0.36]} radius={0.015} smoothness={4} position={[0, 0.02, 0]}>
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </RoundedBox>

          {/* Hardened Tool-Steel Drop Forging Die Nose */}
          <RoundedBox args={[0.28, 0.08, 0.28]} radius={0.012} smoothness={4} position={[0, -0.05, 0]}>
            <meshStandardMaterial {...MAT_HARDENED_DIE} />
          </RoundedBox>

          {/* Precision Machined Striking Face with Chamfered Edges */}
          <mesh position={[0, -0.092, 0]}>
            <boxGeometry args={[0.24, 0.008, 0.24]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// FULL MACHINE ASSEMBLY SPECIFICATION
// ============================================================================
export const HammerTier3Spec: MachineAssemblySpec = {
  id: "hammer_tier3_hydraulic",
  name: "Tier 3: $1,000 Industrial Hydraulic Power Hammer",
  tier: 3,
  modules: [
    ModuleBase,
    ModulePistonCore,
    ModulePortalFrame,
    ModuleHydraulicDrive,
    ModuleRamToolhead,
  ],
};

// Backward compatibility alias
export const HammerTier3AssemblySpec = HammerTier3Spec;
export default HammerTier3Spec;
