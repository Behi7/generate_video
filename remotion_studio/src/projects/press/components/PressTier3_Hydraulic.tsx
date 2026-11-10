import React from "react";
import { RoundedBox } from "@react-three/drei";
import { interpolate, Easing } from "remotion";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 3: $1,000 QUAD-PISTON HYDRAULIC FORGING PRESS (PressTier3_Hydraulic.tsx)
 * ============================================================================
 * Complies strictly with remotion_studio/crew/3d_modeler.md & AssemblyContract.ts
 *
 * Golden Modular Assembly Sequence (Inside-Out Law):
 * Order 0 (0f):  Base - Heavy monolithic steel bolster base with 4 threaded column
 *                mounts, perimeter fluid recovery trough, and hardened lower forging
 *                anvil die (Anvil top surface strictly at Y = 0.630, #1E293B, roughness 0.70).
 * Order 1 (20f): Tie Columns & Ram - 4 polished mirror-chrome tie columns and central
 *                hydraulic ram piston (#E2E8F0, roughness 0.08, metalness 0.98).
 *                Arrives BEFORE crown gantry closes around them!
 * Order 2 (40f): Top Crown Gantry - Armored cast steel upper crown gantry with integrated
 *                500-bar hydraulic main cylinder and reservoir (#334155 / #1E293B steel).
 * Order 3 (60f): Hydraulic Drive - Motorized hydraulic power unit (HPU), directional
 *                spool valve block, braided high-pressure steel lines, and dual analog
 *                pressure gauges with red needles.
 * Order 4 (75f): Toolhead - High-tonnage movable crosshead platen and upper forging press
 *                die pointing vertically DOWN along Y-axis into specimen.
 *                TDC resting bottom face at localFrame 150: Y = 1.050 (32 cm air gap above Y = 0.770).
 *
 * Strict Coaxial Centerline:
 * - Centerline: strictly X = 0, Z = 0 across ram piston, crown cylinder, upper die, specimen, and lower anvil.
 *
 * 4-Phase Kinematics & Overload Law:
 * - 0..69f:   Staggered inside-out snap assembly (0, 20, 40, 60, 75).
 * - 70..149f: Hydraulic pump spools up, pressure needle climbs (0 -> 250 bar), cylinder pre-fills.
 * - 150..224f: Slow, unstoppable hydraulic forging strokes (20-frame cycle: smooth descent from
 *             Y=1.050 down to Y=0.730, crushing workpiece, pause at bottom, smooth retraction).
 * - 225..244f: Deceleration: ram contacts uncrushable object, speed slows to crawl (Y -> 0.750).
 * - 245..264f: Stall & Shudder: 10,000 PSI pressure spike (700 bar), entire gantry undergoes
 *             high-frequency micro-vibration (1..2mm) from hydraulic cavitation, needle pegged at max.
 * - 265..289f: Fracture! Hydraulic cylinder seal blows out, high-pressure vapor jet, tie-rod shear,
 *             crosshead fractures, all parts stay at Y >= 0.630.
 */

// Shared PBR Material Presets
const MAT_CAST_STEEL = { color: "#1E293B", roughness: 0.70, metalness: 0.50 };
const MAT_MACHINED_STEEL = { color: "#334155", roughness: 0.45, metalness: 0.70 };
const MAT_DARK_FRAME = { color: "#0F172A", roughness: 0.65, metalness: 0.60 };
const MAT_MIRROR_CHROME = { color: "#E2E8F0", roughness: 0.08, metalness: 0.98 };
const MAT_POLISHED_BRASS = { color: "#D97706", roughness: 0.15, metalness: 0.95 };
const MAT_BRASS_ACCENT = { color: "#F59E0B", roughness: 0.18, metalness: 0.92 };
const MAT_HARDENED_DIE = { color: "#CBD5E1", roughness: 0.15, metalness: 0.92 };
const MAT_BRAIDED_HOSE = { color: "#94A3B8", roughness: 0.30, metalness: 0.85 };
const MAT_GAUGE_FACE = { color: "#FFFFFF", roughness: 0.30, metalness: 0.05 };
const MAT_DANGER_RED = { color: "#EF4444", roughness: 0.20, metalness: 0.80 };
const MAT_HYDRAULIC_OIL = { color: "#D97706", roughness: 0.10, metalness: 0.20, transparent: true, opacity: 0.75 };
const MAT_RUBBER_DAMPER = { color: "#0B0F19", roughness: 0.90, metalness: 0.10 };

export interface PressKinematics {
  dieY: number; // Absolute Y of die bottom face
  strokeY: number; // Offset relative to TDC resting height Y = 1.050
  shudder: number; // High-frequency ram vibration (m)
  gantryShudder: number; // Cavitation vibration transmitted to gantry (m)
  pressureBar: number; // Current pressure in bar
  needleAngle: number; // Gauge needle rotation (radians)
  isBlowout: boolean; // Overload catastrophe state
}

/**
 * Computes exact hydraulic kinematics across all 4 phases.
 */
export function getPressHydraulicStroke(
  localFrame: number,
  isRunning: boolean,
  isBroken: boolean
): PressKinematics {
  const isBlowout = isBroken;
  const isStall = (isRunning && localFrame >= 225 && localFrame < 234) || (localFrame >= 234 && !isBroken);
  const isDecel = isRunning && localFrame >= 213 && localFrame < 225;
  const isOperating = isRunning && localFrame >= 123 && localFrame < 213;
  const isSpooling = isRunning && localFrame >= 63 && localFrame < 123;

  let dieY = 1.050; // TDC resting position (Y = 1.050)
  let shudder = 0;
  let gantryShudder = 0;
  let pressureBar = 0;
  let needleAngle = -1.8; // Zero pressure resting angle

  if (isBlowout) {
    // Phase 4 Catastrophic Fracture: Seal blown out, ram settles at Y = 0.745 (>= 0.630)
    dieY = 0.745;
    pressureBar = 40; // Pressure collapsed
    needleAngle = -1.5;
  } else if (isStall) {
    // Stall & Shudder (225..233f): Stalled against uncrushable object at Y = 0.750
    const pStall = (localFrame - 225) / 8;
    const amp = 0.0010 + pStall * 0.0015; // 1.0mm to 2.5mm cavitation amplitude
    shudder = Math.sin(localFrame * 45) * amp;
    gantryShudder = Math.sin(localFrame * 45 + 1.2) * (amp * 0.65);
    dieY = 0.750 + shudder;
    pressureBar = 700; // 10,000 PSI max pressure spike
    needleAngle = 2.05 + Math.sin(localFrame * 55) * 0.06; // Pegged into redline with needle flutter
  } else if (isDecel) {
    // Deceleration (213..224f): Ram meets immense resistance, slows to crawl
    // Starts continuously at TDC Y = 1.050 at frame 213 (matching frame 212 TDC)
    const p = (localFrame - 213) / 11;
    const ease = 1 - Math.pow(1 - p, 3); // Slowing down to stall
    dieY = 1.050 - (1.050 - 0.750) * ease;
    pressureBar = 450 + p * 180; // Climbing rapidly from 450 to 630 bar
    needleAngle = interpolate(pressureBar, [0, 700], [-1.8, 2.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (isOperating) {
    // Operating Strokes (123..212f): 4 high-tonnage hydraulic forging cycles across 88 frames
    // Strokes at exact frames: [134, 156, 178, 200]
    // At frames 211..212: Rest strictly at TDC Y = 1.050 (0 discontinuity into frame 213 decel!)
    if (localFrame >= 211) {
      dieY = 1.050;
      pressureBar = 160;
    } else {
      const cycle = (localFrame - 123) % 22;
      if (cycle < 10) {
        // 0..9: Smooth hydraulic descent 1.050 -> 0.730
        const p = cycle / 9;
        const ease = p * p * (3 - 2 * p); // Smoothstep
        dieY = 1.050 - (1.050 - 0.730) * ease;
        pressureBar = 250 + ease * 150; // 250 -> 400 bar
      } else if (cycle < 13) {
        // 10..12: Full pressure dwell at bottom 0.730 (crushing workpiece, impact at 134, 156, 178, 200)
        dieY = 0.730;
        pressureBar = 420; // Full forging bite
      } else {
        // 13..21: Smooth retraction 0.730 -> 1.050 (at cycle=21, dieY = 1.050!)
        const p = (cycle - 13) / 8;
        const ease = p * p * (3 - 2 * p);
        dieY = 0.730 + (1.050 - 0.730) * ease;
        pressureBar = 160; // Retract pressure
      }
    }
    needleAngle = interpolate(pressureBar, [0, 700], [-1.8, 2.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (isSpooling) {
    // Spool-up (63..122f): Pump spools up, pre-fills cylinder, needle climbs to 250 bar
    // Toolhead parked strictly at TDC Y = 1.050 (ZERO collision with uncompressed specimen!)
    const p = (localFrame - 63) / 59;
    pressureBar = p * 250;
    needleAngle = interpolate(pressureBar, [0, 700], [-1.8, 2.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    dieY = 1.050;
  }

  // strokeY is displacement from TDC resting position (1.050)
  const strokeY = dieY - 1.050;

  return {
    dieY,
    strokeY,
    shudder,
    gantryShudder,
    pressureBar,
    needleAngle,
    isBlowout,
  };
}

// ============================================================================
// MODULE 0 (Order 0, Frame 0f): HEAVY MONOLITHIC STEEL BOLSTER BASE & ANVIL DIE
// ============================================================================
const ModuleBolsterBase: ModularPartSpec = {
  id: "press_t3_bolster_base",
  name: "Heavy Monolithic Steel Bolster Base with Fluid Recovery Trough & Anvil Die",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: "#F59E0B",
  sparkCount: 18,
  render: () => {
    return (
      <group position={[0, 0, 0]}>
        {/* 1. Heavy Monolithic Foundation Bed Plinth */}
        <RoundedBox args={[1.56, 0.22, 1.28]} radius={0.03} smoothness={4} position={[0, 0.11, 0]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>

        {/* 2. Recessed Fluid Recovery Trough (Catches hydraulic oil & forging scale) */}
        {/* Outer raised lip for fluid containment */}
        <mesh position={[0, 0.222, 0.60]}>
          <boxGeometry args={[1.50, 0.024, 0.05]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>
        <mesh position={[0, 0.222, -0.60]}>
          <boxGeometry args={[1.50, 0.024, 0.05]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>
        <mesh position={[0.74, 0.222, 0]}>
          <boxGeometry args={[0.05, 0.024, 1.20]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>
        <mesh position={[-0.74, 0.222, 0]}>
          <boxGeometry args={[0.05, 0.024, 1.20]} />
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </mesh>

        {/* Perimeter fluid gutter channel floor */}
        <mesh position={[0, 0.221, 0.49]}>
          <boxGeometry args={[1.42, 0.004, 0.14]} />
          <meshStandardMaterial {...MAT_DARK_FRAME} />
        </mesh>
        <mesh position={[0, 0.221, -0.49]}>
          <boxGeometry args={[1.42, 0.004, 0.14]} />
          <meshStandardMaterial {...MAT_DARK_FRAME} />
        </mesh>

        {/* Trough Corner Drain Sump Strainers & Brass Filter Plugs */}
        {[
          [-0.64, 0.49],
          [0.64, 0.49],
          [-0.64, -0.49],
          [0.64, -0.49],
        ].map(([sx, sz], idx) => (
          <group key={`sump_${idx}`} position={[sx, 0.224, sz]}>
            <mesh>
              <cylinderGeometry args={[0.032, 0.032, 0.008, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.004, 12]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Brass Trough Drainage Shut-Off Valve (Front Right) */}
        <group position={[0.76, 0.14, 0.45]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.07, 16]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.025, 6]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0.04, 0.04, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.012, 0.08, 0.02]} />
            <meshStandardMaterial {...MAT_DANGER_RED} />
          </mesh>
        </group>

        {/* 3. Four Threaded Column Corner Mount Bosses (At X=±0.42, Z=±0.36) */}
        {[
          [-0.42, -0.36],
          [0.42, -0.36],
          [-0.42, 0.36],
          [0.42, 0.36],
        ].map(([cx, cz], i) => (
          <group key={`column_mount_${i}`} position={[cx, 0.22, cz]}>
            {/* Heavy Cast Steel Column Riser Collar */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.085, 0.098, 0.10, 28]} />
              <meshStandardMaterial {...MAT_CAST_STEEL} />
            </mesh>
            {/* Hardened Machined Ground Seat */}
            <mesh position={[0, 0.105, 0]}>
              <cylinderGeometry args={[0.076, 0.076, 0.015, 28]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Threaded Collar Acme Female Threads */}
            <mesh position={[0, 0.115, 0]}>
              <cylinderGeometry args={[0.046, 0.046, 0.02, 28, 1, true]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Hex Retention Ring Flats */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.03, 6]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* 4. Heavy Monolithic Center Pedestal Riser Block */}
        <RoundedBox args={[0.76, 0.24, 0.68]} radius={0.025} smoothness={4} position={[0, 0.34, 0]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>

        {/* Reinforcing Cast Buttress Gussets (Left & Right) */}
        {[-0.45, 0.45].map((gx, idx) => (
          <group key={`gusset_${idx}`} position={[gx, 0.24, 0]}>
            <mesh rotation={[0, 0, (gx > 0 ? 1 : -1) * 0.52]}>
              <boxGeometry args={[0.12, 0.22, 0.54]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* 5. Hardened Alloy Steel Bolster Bed Plate */}
        <RoundedBox args={[0.62, 0.08, 0.54]} radius={0.015} smoothness={4} position={[0, 0.50, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Cross T-Slots for Tooling Clamps */}
        <mesh position={[0, 0.541, 0]}>
          <boxGeometry args={[0.038, 0.005, 0.52]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.541, 0]}>
          <boxGeometry args={[0.60, 0.005, 0.038]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.8} />
        </mesh>

        {/* Polished Brass Die Clamping Gib Wedges */}
        {[-0.26, 0.26].map((kx, idx) => (
          <group key={`gib_${idx}`} position={[kx, 0.52, 0]}>
            <mesh>
              <boxGeometry args={[0.028, 0.045, 0.40]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {[-0.14, 0, 0.14].map((gz, j) => (
              <mesh key={`bolt_${j}`} position={[kx > 0 ? 0.016 : -0.016, 0, gz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.009, 0.009, 0.02, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 6. Precision Replaceable Lower Forging Anvil Die */}
        {/* Strictly guarantees: Die Top Face is at EXACTLY Y = 0.630 */}
        {/* Die Body: Height = 0.07, Position Y = 0.595 -> Top = 0.595 + 0.035 = 0.630 */}
        <group position={[0, 0.595, 0]}>
          <RoundedBox args={[0.44, 0.07, 0.44]} radius={0.012} smoothness={4}>
            <meshStandardMaterial {...MAT_HARDENED_DIE} />
          </RoundedBox>

          {/* Precision Machined Mirror Striking Face on Anvil Die (Y = 0.630) */}
          <mesh position={[0, 0.0351, 0]}>
            <boxGeometry args={[0.40, 0.001, 0.40]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>

          {/* Precision Alignment Scribe Centerlines (X=0, Z=0) */}
          <mesh position={[0, 0.0355, 0]}>
            <boxGeometry args={[0.003, 0.001, 0.36]} />
            <meshStandardMaterial color="#64748B" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.0355, 0]}>
            <boxGeometry args={[0.36, 0.001, 0.003]} />
            <meshStandardMaterial color="#64748B" roughness={0.2} />
          </mesh>
        </group>

        {/* 7. Foundation Seismic Elastomer Vibration Dampers (4 Corners) */}
        {[
          [-0.68, -0.54],
          [0.68, -0.54],
          [-0.68, 0.54],
          [0.68, 0.54],
        ].map(([ax, az], idx) => (
          <group key={`anchor_${idx}`} position={[ax, 0.025, az]}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 20]} />
              <meshStandardMaterial {...MAT_RUBBER_DAMPER} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.015, 20]} />
              <meshStandardMaterial {...MAT_BRASS_ACCENT} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.07, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        ))}

        {/* 8. Industrial Stamped Brass Specification Tag */}
        <group position={[0, 0.11, 0.642]}>
          <mesh>
            <boxGeometry args={[0.44, 0.09, 0.006]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0, 0.015, 0.004]}>
            <boxGeometry args={[0.38, 0.022, 0.002]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.018, 0.004]}>
            <boxGeometry args={[0.32, 0.018, 0.002]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          {[-0.20, 0.20].map((rx, idx) => (
            <mesh key={`tag_rivet_${idx}`} position={[rx, 0, 0.004]}>
              <cylinderGeometry args={[0.005, 0.005, 0.004, 10]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 1 (Order 1, Frame 20f): 4 CHROME TIE COLUMNS & CENTRAL HYDRAULIC RAM PISTON
// ============================================================================
const ModuleColumnsAndPiston: ModularPartSpec = {
  id: "press_t3_columns_piston",
  name: "Quad Mirror-Chrome Tie Columns & Central Hydraulic Ram Piston",
  assemblyOrder: 1,
  snapFrame: 15,
  entryDirection: "top",
  travelDistance: 3.5,
  targetSocket: [0, 0, 0],
  sparkColor: "#38BDF8",
  sparkCount: 24,
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { strokeY, shudder } = getPressHydraulicStroke(localFrame, isRunning, isBroken);

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Four Polished Mirror-Chrome Pre-Stressed Tie Columns (X=±0.42, Z=±0.36) */}
        {[
          [-0.42, -0.36],
          [0.42, -0.36],
          [-0.42, 0.36],
          [0.42, 0.36],
        ].map(([cx, cz], idx) => (
          <group key={`tie_column_${idx}`} position={[cx, 0, cz]}>
            {/* Solid Mirror Chrome Tie Column (Spanning Y=0.28 to Y=2.12, Length=1.84m) */}
            <mesh position={[0, 1.20, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 1.84, 32]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>

            {/* Bottom Threaded Shoulder in Base Collar (Y=0.28..0.34) */}
            <mesh position={[0, 0.31, 0]}>
              <cylinderGeometry args={[0.046, 0.046, 0.06, 24]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>

            {/* Precision Micro-Ground Micrometer Finish Rings */}
            {[0.70, 1.10, 1.50].map((ringY, ri) => (
              <mesh key={`ring_${ri}`} position={[0, ringY, 0]}>
                <cylinderGeometry args={[0.0426, 0.0426, 0.005, 32]} />
                <meshStandardMaterial {...MAT_BRASS_ACCENT} />
              </mesh>
            ))}

            {/* Top Acme Tensioning Threads for Crown Nuts (Y=2.02..2.12) */}
            <mesh position={[0, 2.07, 0]}>
              <cylinderGeometry args={[0.040, 0.040, 0.10, 24]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        ))}

        {/* 2. Central Hydraulic Ram Piston Rod (Centered strictly at X=0, Z=0) */}
        {/* Reciprocates along Y axis with hydraulic stroke & cavitation micro-shudder */}
        <group position={[0, strokeY + shudder, 0]}>
          {/* Heavy Mirror-Chrome Central Hydraulic Piston Rod */}
          {/* Length: 0.72m, Radius: 0.082m (Solid 164mm Chrome Rod) */}
          <mesh position={[0, 1.74, 0]}>
            <cylinderGeometry args={[0.082, 0.082, 0.72, 36]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>

          {/* Upper Internal High-Pressure Piston Head (Strokes inside Main Cylinder) */}
          <group position={[0, 2.06, 0]}>
            {/* Solid Piston Head Disk */}
            <mesh>
              <cylinderGeometry args={[0.138, 0.138, 0.10, 32]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>

            {/* Dual Stepped Cast-Bronze Piston Compression & Seal Rings */}
            <mesh position={[0, 0.024, 0]}>
              <cylinderGeometry args={[0.141, 0.141, 0.016, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, -0.024, 0]}>
              <cylinderGeometry args={[0.141, 0.141, 0.016, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Internal Pressure Equalizer Channel Ports */}
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((ang, pi) => (
              <mesh key={`p_port_${pi}`} position={[Math.cos(ang) * 0.09, 0, Math.sin(ang) * 0.09]}>
                <cylinderGeometry args={[0.012, 0.012, 0.11, 12]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
            ))}
          </group>

          {/* Lower Heavy Connecting Flange (Couples rigidly to Movable Crosshead at Y=1.40) */}
          <group position={[0, 1.39, 0]}>
            <mesh>
              <cylinderGeometry args={[0.145, 0.145, 0.06, 32]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Hex Bolt Circle Coupling Flange to Crosshead */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, bi) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <mesh
                  key={`flange_bolt_${bi}`}
                  position={[Math.cos(rad) * 0.115, -0.025, Math.sin(rad) * 0.115]}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
                  <meshStandardMaterial {...MAT_MIRROR_CHROME} />
                </mesh>
              );
            })}
          </group>
        </group>

        {/* 3. Stationary Cylinder Throat Wiper Gland & Bronze Bushing Ring */}
        {/* Sits at bottom of cylinder barrel (Y = 1.58), seals the reciprocating chrome rod */}
        <group position={[0, 1.58, 0]}>
          <mesh>
            <cylinderGeometry args={[0.125, 0.125, 0.045, 32]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0, -0.025, 0]}>
            <cylinderGeometry args={[0.132, 0.132, 0.02, 8]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
          {/* U-Cup Rod Seal Lip Collar */}
          <mesh position={[0, -0.038, 0]}>
            <cylinderGeometry args={[0.092, 0.092, 0.015, 32, 1, true]} />
            <meshStandardMaterial {...MAT_DARK_FRAME} />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 2 (Order 2, Frame 40f): TOP CROWN GANTRY WITH 500-BAR CYLINDER & RESERVOIR
// ============================================================================
const ModuleCrownGantry: ModularPartSpec = {
  id: "press_t3_crown_gantry",
  name: "Top Crown Gantry with Integrated 500-Bar Hydraulic Cylinder & Reservoir",
  assemblyOrder: 2,
  snapFrame: 30,
  entryDirection: "top",
  travelDistance: 3.6,
  targetSocket: [0, 1.90, 0],
  sparkColor: "#F59E0B",
  sparkCount: 20,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [0.8, 4.2, -1.5],
    rotationImpulse: [1.2, 0.6, -1.8],
    sparkOrigin: [0, 1.90, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { gantryShudder, isBlowout } = getPressHydraulicStroke(localFrame, isRunning, isBroken);

    return (
      <group position={[0, gantryShudder, 0]}>
        {/* 1. Heavy Armored Cast Steel Upper Crown Gantry Beam */}
        <RoundedBox args={[1.36, 0.38, 1.16]} radius={0.035} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial {...MAT_CAST_STEEL} />
        </RoundedBox>

        {/* Cast Crown Structural Stiffener Pockets (Front & Rear Recesses) */}
        <mesh position={[0, 0, 0.582]}>
          <boxGeometry args={[0.72, 0.26, 0.015]} />
          <meshStandardMaterial {...MAT_DARK_FRAME} />
        </mesh>
        <mesh position={[0, 0, -0.582]}>
          <boxGeometry args={[0.72, 0.26, 0.015]} />
          <meshStandardMaterial {...MAT_DARK_FRAME} />
        </mesh>

        {/* 2. Four Tie-Column Tensioner Anchor Nut Assemblies (X=±0.42, Z=±0.36) */}
        {[
          [-0.42, -0.36],
          [0.42, -0.36],
          [-0.42, 0.36],
          [0.42, 0.36],
        ].map(([cx, cz], idx) => (
          <group key={`crown_nut_${idx}`} position={[cx, 0.19, cz]}>
            {/* Spherical Self-Aligning Brass Washer Seat */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.068, 0.068, 0.024, 28]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Heavy High-Tensile Mirror-Chrome Tensioner Hex Nut */}
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.056, 0.056, 0.08, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
            {/* Tie-Rod Safety Cotter Pin */}
            <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.09, 12]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        ))}

        {/* 3. Integrated 500-Bar Hydraulic Main Cylinder Barrel (Centered X=0, Z=0) */}
        <group position={[0, 0, 0]}>
          {/* Heavy Jacketed Cylinder Barrel extending through Crown (Y=-0.32 to Y=0.28) */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.165, 0.165, 0.60, 36]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>

          {/* Circumferential Structural Reinforcement & Cooling Ribs */}
          {[-0.24, -0.16, -0.08, 0, 0.08, 0.16].map((fy, fi) => (
            <mesh key={`fin_${fi}`} position={[0, fy, 0]}>
              <cylinderGeometry args={[0.178, 0.178, 0.016, 36]} />
              <meshStandardMaterial {...MAT_CAST_STEEL} />
            </mesh>
          ))}

          {/* Cylinder Top Cylinder Head End-Cap Flange (At Y=0.28) */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.192, 0.192, 0.055, 32]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>

          {/* Flange High-Strength Hex Bolt Circle (12 Bolts) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, bi) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={`cap_bolt_${bi}`}
                position={[Math.cos(rad) * 0.165, 0.315, Math.sin(rad) * 0.165]}
              >
                <cylinderGeometry args={[0.012, 0.012, 0.028, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            );
          })}

          {/* Top High-Pressure Main Fluid Inlet Port (SAE 4-Bolt Flange) */}
          <group position={[0, 0.32, 0]}>
            <mesh>
              <cylinderGeometry args={[0.048, 0.048, 0.05, 24]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[0.08, 0.016, 0.08]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          </group>
        </group>

        {/* 4. Top Hydraulic Fluid Reservoir Tank (Mounted on Rear Crown) */}
        <group position={[0, 0.28, -0.36]}>
          <RoundedBox args={[0.78, 0.26, 0.36]} radius={0.02} smoothness={4}>
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </RoundedBox>

          {/* Reservoir Front Level Sight Glass Tube */}
          <group position={[0.24, 0, 0.182]}>
            <mesh>
              <boxGeometry args={[0.05, 0.18, 0.015]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Amber Hydraulic Oil Column visible in glass */}
            <mesh position={[0, -0.01, 0.008]}>
              <planeGeometry args={[0.024, 0.13]} />
              <meshStandardMaterial {...MAT_HYDRAULIC_OIL} />
            </mesh>
          </group>

          {/* Polished Brass Reservoir Breather / Filter Cap */}
          <group position={[-0.22, 0.16, 0]}>
            <mesh>
              <cylinderGeometry args={[0.036, 0.036, 0.06, 20]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.044, 0.044, 0.015, 20]} />
              <meshStandardMaterial {...MAT_BRASS_ACCENT} />
            </mesh>
          </group>
        </group>

        {/* 5. Four Heavy Forged Shop Rigging Eye Shackles (Crown Corners) */}
        {[
          [-0.56, -0.46],
          [0.56, -0.46],
          [-0.56, 0.46],
          [0.56, 0.46],
        ].map(([lx, lz], idx) => (
          <group key={`lug_${idx}`} position={[lx, 0.20, lz]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.035, 0.012, 16, 24]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          </group>
        ))}

        {/* 6. Front Spec Plaque */}
        <group position={[0, 0, 0.585]}>
          <mesh>
            <boxGeometry args={[0.54, 0.14, 0.008]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
          <mesh position={[0, 0.03, 0.005]}>
            <boxGeometry args={[0.48, 0.03, 0.002]} />
            <meshStandardMaterial {...MAT_DARK_FRAME} />
          </mesh>
          <mesh position={[0, -0.025, 0.005]}>
            <boxGeometry args={[0.40, 0.024, 0.002]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>
        </group>

        {/* 7. Phase 4 Blowout: High-Pressure Vapor Jet Plume (frames >= 275) */}
        {isBlowout && (
          <group position={[0, 0.32, 0]}>
            {/* Catastrophic high-pressure vapor jet erupting from blown cylinder seal */}
            {[
              [0, 0.08, 0, 0.09],
              [-0.04, 0.18, 0.03, 0.14],
              [0.05, 0.30, -0.04, 0.20],
              [-0.02, 0.44, 0.06, 0.26],
              [0.06, 0.58, -0.02, 0.32],
            ].map(([vx, vy, vz, vrad], vi) => (
              <mesh key={`vapor_${vi}`} position={[vx, vy, vz]}>
                <sphereGeometry args={[vrad, 16, 16]} />
                <meshStandardMaterial
                  color="#E0F2FE"
                  emissive="#38BDF8"
                  emissiveIntensity={0.8}
                  transparent={true}
                  opacity={0.65 - vi * 0.1}
                  roughness={0.9}
                />
              </mesh>
            ))}

            {/* High-velocity atomized jet needles */}
            {[0, 1, 2, 3, 4, 5].map((ji) => {
              const jAng = (ji * Math.PI) / 3;
              return (
                <mesh
                  key={`jet_line_${ji}`}
                  position={[Math.cos(jAng) * 0.08, 0.20, Math.sin(jAng) * 0.08]}
                  rotation={[Math.cos(jAng) * 0.4, 0, Math.sin(jAng) * 0.4]}
                >
                  <cylinderGeometry args={[0.006, 0.016, 0.32, 8]} />
                  <meshStandardMaterial
                    color="#BAE6FD"
                    emissive="#0284C7"
                    emissiveIntensity={1.2}
                    transparent={true}
                    opacity={0.7}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    );
  },
};

// ============================================================================
// MODULE 3 (Order 3, Frame 60f): HYDRAULIC POWER UNIT, VALVE BLOCK & GAUGES
// ============================================================================
const ModuleHydraulicDrive: ModularPartSpec = {
  id: "press_t3_hydraulic_power_unit",
  name: "Hydraulic Power Unit, Directional Spool Valve Block, Braided Lines & Dual Gauges",
  assemblyOrder: 3,
  snapFrame: 45,
  entryDirection: "right",
  travelDistance: 3.4,
  targetSocket: [0, 1.90, 0],
  sparkColor: "#F59E0B",
  sparkCount: 22,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [3.5, 4.0, 2.5],
    rotationImpulse: [2.5, 1.8, 3.2],
    sparkOrigin: [0.38, 1.95, 0.25],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { needleAngle, isBlowout } = getPressHydraulicStroke(localFrame, isRunning, isBroken);

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Hydraulic Power Unit Motor & Pump (Mounted on Right Side of Crown) */}
        <group position={[0.62, 0.06, -0.28]}>
          {/* TEFC Electric Motor Casing */}
          <RoundedBox args={[0.28, 0.26, 0.34]} radius={0.02} smoothness={4}>
            <meshStandardMaterial {...MAT_DARK_FRAME} />
          </RoundedBox>

          {/* Motor Heat Dissipation Fins */}
          {[-0.09, -0.045, 0, 0.045, 0.09].map((fz, fi) => (
            <mesh key={`mfin_${fi}`} position={[0, 0, fz]}>
              <boxGeometry args={[0.30, 0.28, 0.012]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
          ))}

          {/* Rear Cooling Fan Cowl & Shroud */}
          <mesh position={[0, 0, -0.19]}>
            <cylinderGeometry args={[0.11, 0.11, 0.04, 20]} />
            <meshStandardMaterial {...MAT_MACHINED_STEEL} />
          </mesh>

          {/* Variable-Displacement Axial Piston Pump Housing (Forward of Motor) */}
          <group position={[0, 0, 0.23]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.12, 24]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Pump Swashplate Control Angle Servo */}
            <mesh position={[0.06, 0.04, 0]}>
              <boxGeometry args={[0.04, 0.06, 0.06]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        </group>

        {/* 2. CNC Directional Spool Valve Block (Solid Polished Brass Manifold) */}
        <group position={[0.42, 0.10, 0.22]}>
          <RoundedBox args={[0.34, 0.18, 0.24]} radius={0.02} smoothness={4}>
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </RoundedBox>

          {/* Solenoid Directional Spool Actuators (Top of Manifold) */}
          {[-0.08, 0.08].map((sx, si) => (
            <group key={`solenoid_${si}`} position={[sx, 0.13, 0]}>
              <mesh>
                <cylinderGeometry args={[0.034, 0.034, 0.09, 20]} />
                <meshStandardMaterial {...MAT_DARK_FRAME} />
              </mesh>
              {/* DIN Electrical Connector Box with Indicator Light */}
              <mesh position={[0, 0.05, 0.02]}>
                <boxGeometry args={[0.035, 0.025, 0.025]} />
                <meshStandardMaterial {...MAT_MACHINED_STEEL} />
              </mesh>
              <mesh position={[0, 0.05, 0.034]}>
                <sphereGeometry args={[0.005, 8, 8]} />
                <meshStandardMaterial
                  color="#10B981"
                  emissive="#10B981"
                  emissiveIntensity={isRunning ? 2.5 : 0}
                />
              </mesh>
            </group>
          ))}

          {/* Adjustable Cartridge Pressure Relief Valve */}
          <group position={[0.18, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.08, 16]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.028, 0.028, 0.025, 20]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        </group>

        {/* 3. Dual Analog Dial Pressure Gauges with Red Needles (Front-Facing Z=+0.60) */}
        {/* Facing strictly forward into the camera for crystal-clear readability */}
        {[
          { gx: 0.16, label: "MAIN RAM (500 BAR)" },
          { gx: 0.32, label: "PILOT SYSTEM (350 BAR)" },
        ].map(({ gx }, idx) => (
          <group key={`press_gauge_${idx}`} position={[gx, 0.25, 0.59]} rotation={[-0.1, 0, 0]}>
            {/* Polished Brass Gauge Bezel Housing */}
            <mesh>
              <cylinderGeometry args={[0.064, 0.064, 0.03, 32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>

            {/* Pure White Gauge Faceplate */}
            <mesh position={[0, 0.016, 0]}>
              <cylinderGeometry args={[0.056, 0.056, 0.004, 32]} />
              <meshStandardMaterial {...MAT_GAUGE_FACE} />
            </mesh>

            {/* 500-Bar Danger Arc Sector (Red Zone) */}
            <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.036, 0.048, 24, 1, 0, Math.PI * 1.3]} />
              <meshStandardMaterial {...MAT_DANGER_RED} />
            </mesh>

            {/* Dynamic Red Pressure Indicator Needle */}
            <group position={[0, 0.021, 0]} rotation={[0, needleAngle * (idx === 0 ? 1.0 : 0.85), 0]}>
              <mesh position={[0.024, 0, 0]}>
                <boxGeometry args={[0.038, 0.003, 0.003]} />
                <meshStandardMaterial {...MAT_DANGER_RED} />
              </mesh>
              {/* Chrome Center Needle Pin */}
              <mesh>
                <cylinderGeometry args={[0.007, 0.007, 0.006, 12]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            </group>

            {/* Brass Fitting Stem to Manifold */}
            <mesh position={[0, -0.04, -0.02]} rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 16]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* 4. High-Pressure Braided Stainless Steel Hydraulic Lines */}
        {/* Main Feed Line running from Valve Block to Upper Cylinder Cap */}
        <group position={[0.24, 0.22, 0.12]}>
          <mesh rotation={[0.2, -0.3, 0.8]}>
            <cylinderGeometry args={[0.022, 0.022, 0.38, 20]} />
            <meshStandardMaterial {...MAT_BRAIDED_HOSE} />
          </mesh>
          <mesh position={[-0.14, 0.08, -0.05]}>
            <cylinderGeometry args={[0.032, 0.032, 0.04, 6]} />
            <meshStandardMaterial {...MAT_POLISHED_BRASS} />
          </mesh>
        </group>

        {/* Retract Return Line to Bottom Cylinder Throat Port */}
        <group position={[0.28, -0.06, 0.16]}>
          {!isBlowout ? (
            <group>
              <mesh rotation={[-0.3, 0.4, 0.6]}>
                <cylinderGeometry args={[0.020, 0.020, 0.32, 20]} />
                <meshStandardMaterial {...MAT_BRAIDED_HOSE} />
              </mesh>
              <mesh position={[-0.12, -0.06, -0.08]}>
                <cylinderGeometry args={[0.030, 0.030, 0.035, 6]} />
                <meshStandardMaterial {...MAT_POLISHED_BRASS} />
              </mesh>
            </group>
          ) : (
            /* Ruptured Hose Fitting at Blowout (localFrame >= 275) */
            <group position={[-0.05, -0.04, 0]}>
              <mesh rotation={[0.5, 0.2, -0.8]}>
                <cylinderGeometry args={[0.028, 0.024, 0.14, 16]} />
                <meshStandardMaterial {...MAT_DANGER_RED} />
              </mesh>
              {/* Shredded Steel Braid Wires */}
              <mesh position={[0.08, 0.05, 0]}>
                <dodecahedronGeometry args={[0.045, 0]} />
                <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Liquid Hydraulic Oil Jet Spray Spurt */}
              {[0, 1, 2].map((sp) => (
                <mesh
                  key={`oil_spurt_${sp}`}
                  position={[0.10 + sp * 0.05, -0.04 - sp * 0.03, sp * 0.02]}
                  rotation={[0.3, 0.2, -1.2]}
                >
                  <cylinderGeometry args={[0.008, 0.018, 0.14, 8]} />
                  <meshStandardMaterial {...MAT_HYDRAULIC_OIL} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      </group>
    );
  },
};

// ============================================================================
// MODULE 4 (Order 4, Frame 75f): MOVABLE CROSSHEAD PLATEN & FORGING DIE
// ============================================================================
const ModuleCrossheadDie: ModularPartSpec = {
  id: "press_t3_crosshead_die",
  name: "High-Tonnage Movable Crosshead Platen & Upper Forging Die",
  assemblyOrder: 4,
  snapFrame: 60,
  entryDirection: "bottom",
  travelDistance: 2.6,
  targetSocket: [0, 1.050, 0], // Sits with bottom die face resting at EXACTLY Y = 1.050
  sparkColor: "#10B981",
  sparkCount: 26,
  fracture: {
    breakFrame: 234,
    mode: "shear_and_tilt",
    impulse: [-0.6, 1.2, 0.5],
    rotationImpulse: [0.4, 0.15, 0.5],
    sparkOrigin: [0, 0.75, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { strokeY, shudder } = getPressHydraulicStroke(localFrame, isRunning, isBroken);

    // Geometry is authored so that when strokeY = 0, the bottom striking face is at local Y = 0.
    // TargetSocket is [0, 1.050, 0].
    // Therefore, world Y of striking face at TDC = 1.050 + 0 = 1.050! (32 cm air gap above Y = 0.770)
    // During forging stroke, strokeY goes from 0 down to -0.320 -> bottom face goes to Y = 0.730.
    // Anvil die top is Y = 0.630 -> clearance above anvil is strictly 0.730 - 0.630 = 0.100m (10 cm)!
    return (
      <group position={[0, strokeY + shudder, 0]}>
        {/* 1. Upper Forging Die Assembly (Pointing Vertically DOWN along Y-axis into specimen) */}
        {/* Mirror-Finished Striking Face Plate (Local Y = 0.001..0.002, bottom at local Y = 0) */}
        <mesh position={[0, 0.001, 0]}>
          <boxGeometry args={[0.38, 0.002, 0.38]} />
          <meshStandardMaterial {...MAT_MIRROR_CHROME} />
        </mesh>

        {/* Hardened Tool-Steel Upper Forging Die Nose (Local Y = 0.002..0.08) */}
        <RoundedBox args={[0.42, 0.078, 0.42]} radius={0.012} smoothness={4} position={[0, 0.041, 0]}>
          <meshStandardMaterial {...MAT_HARDENED_DIE} />
        </RoundedBox>

        {/* Die Dovetail Tenon Guide & Wedge Locking Keys */}
        <group position={[0, 0.085, 0]}>
          <mesh>
            <boxGeometry args={[0.34, 0.02, 0.34]} />
            <meshStandardMaterial {...MAT_MIRROR_CHROME} />
          </mesh>
          {[-0.20, 0.20].map((wx, wi) => (
            <mesh key={`wedge_${wi}`} position={[wx, 0, 0]}>
              <boxGeometry args={[0.024, 0.028, 0.32]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          ))}
        </group>

        {/* 2. Upper Die Bolster Block (Local Y = 0.095..0.185) */}
        <RoundedBox args={[0.58, 0.09, 0.54]} radius={0.016} smoothness={4} position={[0, 0.14, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Bolster Clamping T-Bolts */}
        {[-0.24, 0.24].map((tx, ti) =>
          [-0.20, 0.20].map((tz, tj) => (
            <mesh key={`tbolt_${ti}_${tj}`} position={[tx, 0.186, tz]}>
              <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
              <meshStandardMaterial {...MAT_MIRROR_CHROME} />
            </mesh>
          ))
        )}

        {/* 3. Massive Movable Crosshead Platen (Local Y = 0.185..0.395, height = 0.21m) */}
        <RoundedBox args={[1.24, 0.21, 1.04]} radius={0.03} smoothness={4} position={[0, 0.29, 0]}>
          <meshStandardMaterial {...MAT_MACHINED_STEEL} />
        </RoundedBox>

        {/* Crosshead Lateral Ribs & Weight Reduction Pockets */}
        {[-0.32, 0.32].map((px, pi) => (
          <mesh key={`pocket_${pi}`} position={[px, 0.29, 0.522]}>
            <boxGeometry args={[0.18, 0.14, 0.01]} />
            <meshStandardMaterial {...MAT_DARK_FRAME} />
          </mesh>
        ))}

        {/* 4. Four Precision Bronze Guide Bushings (Sliding along Tie Columns at X=±0.42, Z=±0.36) */}
        {[
          [-0.42, -0.36],
          [0.42, -0.36],
          [-0.42, 0.36],
          [0.42, 0.36],
        ].map(([gx, gz], idx) => (
          <group key={`guide_bushing_${idx}`} position={[gx, 0.29, gz]}>
            {/* Guide Sleeve Boss */}
            <mesh>
              <cylinderGeometry args={[0.072, 0.072, 0.23, 28]} />
              <meshStandardMaterial {...MAT_MACHINED_STEEL} />
            </mesh>
            {/* Solid Low-Friction Aluminum-Bronze Split Bushing Liner */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.046, 0.046, 0.235, 28, 1, true]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
            {/* Upper and Lower Grease Retainer Wiper Seals */}
            <mesh position={[0, 0.118, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.012, 24]} />
              <meshStandardMaterial {...MAT_BRASS_ACCENT} />
            </mesh>
            <mesh position={[0, -0.118, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.012, 24]} />
              <meshStandardMaterial {...MAT_BRASS_ACCENT} />
            </mesh>
            {/* Grease Injection Zerk Fitting (Front-facing) */}
            <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.016, 10]} />
              <meshStandardMaterial {...MAT_POLISHED_BRASS} />
            </mesh>
          </group>
        ))}

        {/* 5. Center Ram Coupling Hub (Bolted to Central Piston Rod from Module 1) */}
        <group position={[0, 0.40, 0]}>
          <mesh>
            <cylinderGeometry args={[0.155, 0.155, 0.03, 32]} />
            <meshStandardMaterial {...MAT_CAST_STEEL} />
          </mesh>
          {/* Threaded Coupling Studs */}
          {[0, 60, 120, 180, 240, 300].map((deg, si) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={`hub_stud_${si}`}
                position={[Math.cos(rad) * 0.125, 0.02, Math.sin(rad) * 0.125]}
              >
                <cylinderGeometry args={[0.011, 0.011, 0.025, 6]} />
                <meshStandardMaterial {...MAT_MIRROR_CHROME} />
              </mesh>
            );
          })}
        </group>
      </group>
    );
  },
};

// ============================================================================
// FULL MACHINE ASSEMBLY SPECIFICATION
// ============================================================================
export const PressTier3Spec: MachineAssemblySpec = {
  id: "press_tier3_hydraulic",
  name: "Tier 3: $1,000 Quad-Piston Hydraulic Forging Press",
  tier: 3,
  strikeFrames: [134, 156, 178, 200],
  strikeIntensity: 0.055,
  modules: [
    ModuleBolsterBase,
    ModuleColumnsAndPiston,
    ModuleCrownGantry,
    ModuleHydraulicDrive,
    ModuleCrossheadDie,
  ],
};

// Backward compatibility alias
export const PressTier3AssemblySpec = PressTier3Spec;
export default PressTier3Spec;
