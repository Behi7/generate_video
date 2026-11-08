import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "./AssemblyContract";

/**
 * ============================================================================
 * TIER 4: QUANTUM KINETIC RAIL-HAMMER ($100 000+ Level)
 * ============================================================================
 * Operating under remotion_studio/crew/3d_modeler.md and AssemblyContract.ts.
 *
 * Enforces the Golden Inside-Out Assembly Sequence:
 * Order 0 (0f):  Anti-Gravity Maglev Pedestal Plinth with Floating Damper Rings
 * Order 1 (20f): Dual Electromagnetic Induction Rail Cores & Magnetic Tracks
 *                (MUST arrive BEFORE outer casing!)
 * Order 2 (40f): Superconducting Toroid Stator Housing & Cyan Energy Conduit Slots
 * Order 3 (60f): Cryogenic Liquid Nitrogen Conduits, Solenoid Pinch Rings & Accelerator Tube
 * Order 4 (75f): Tungsten-Osmium Hyper-Kinetic Ram & Downward Plasma Impactor
 *
 * Material Triad:
 * - Carbon fiber / dark titanium: #0A0E17 (roughness: 0.2, metalness: 0.85)
 * - Glowing cyan emissive: #06B6D4 (emissive: #06B6D4, intensity: 2.2..3.5)
 * - Mirror polished chrome: #E2E8F0 (roughness: 0.08, metalness: 0.98)
 * - Secondary accents: Bismuth sky #38BDF8, dense osmium #1E222D, superconductor gold #D97706
 *
 * Kinematics:
 * - High-frequency magnetic pulse levitation
 * - Hyper-velocity reciprocating downward strike along Y-axis into specimen (70..249f)
 * - Catastrophic fracture at frame 265: singularity pinch collapse shockwave,
 *   crystalline lattice shatter, remains firmly on platform bed (Y >= -2.04).
 * ============================================================================
 */

// Color Constants
const COLOR_CARBON = "#0A0E17";
const COLOR_CARBON_LIGHT = "#151B28";
const COLOR_CHROME = "#E2E8F0";
const COLOR_EMISSIVE = "#06B6D4";
const COLOR_CYAN_ACCENT = "#38BDF8";
const COLOR_OSMIUM = "#1E222D";
const COLOR_GOLD = "#D97706";
const COLOR_DARK_MATTER = "#020408";

// ----------------------------------------------------------------------------
// MODULE 0: ANTI-GRAVITY MAGLEV PEDESTAL PLINTH (Order 0, frame 0f)
// ----------------------------------------------------------------------------
export const ModuleMaglevBase: ModularPartSpec = {
  id: "t4_maglev_base",
  name: "Anti-Gravity Maglev Pedestal Plinth with Floating Damper Rings",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 22,
  fracture: {
    breakFrame: 265,
    mode: "shudder_and_crack",
    impulse: [0, 0, 0],
    rotationImpulse: [0.015, 0, -0.015],
    sparkOrigin: [0, 0.35, 0],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    // 4 Corner damper posts configuration
    const dampers = [
      { x: -0.58, z: -0.42, idx: 0 },
      { x: 0.58, z: -0.42, idx: 1 },
      { x: -0.58, z: 0.42, idx: 2 },
      { x: 0.58, z: 0.42, idx: 3 },
    ];

    return (
      <group position={[0, 0, 0]}>
        {/* Sub-Base Ground Foundation Plate (rests flush on platform bed Y = 0) */}
        <RoundedBox
          args={[1.62, 0.05, 1.32]}
          radius={0.018}
          smoothness={4}
          position={[0, 0.025, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.4}
            metalness={0.7}
          />
        </RoundedBox>

        {/* Main Monolithic Maglev Pedestal Plinth (Carbon-Fiber Dark Titanium) */}
        <RoundedBox
          args={[1.48, 0.18, 1.18]}
          radius={0.035}
          smoothness={4}
          position={[0, 0.14, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.2}
            metalness={0.85}
          />
        </RoundedBox>

        {/* Stepped Upper Chiseled Plinth */}
        <RoundedBox
          args={[1.24, 0.04, 0.96]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.25, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON_LIGHT}
            roughness={0.18}
            metalness={0.9}
          />
        </RoundedBox>

        {/* Perimeter Recessed Glowing Cyan LED Channels */}
        {/* Front & Rear Channels */}
        <mesh position={[0, 0.14, 0.592]}>
          <boxGeometry args={[1.36, 0.018, 0.02]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0, 0.14, -0.592]}>
          <boxGeometry args={[1.36, 0.018, 0.02]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>
        {/* Left & Right Channels */}
        <mesh position={[-0.742, 0.14, 0]}>
          <boxGeometry args={[0.02, 0.018, 1.06]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0.742, 0.14, 0]}>
          <boxGeometry args={[0.02, 0.018, 1.06]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* 4 Corner Anti-Gravity Damper Pylons with Floating Rings */}
        {dampers.map((d) => {
          // Floating levitation bobbing oscillation
          const bob = Math.sin(localFrame * 0.15 + d.idx * 1.5) * 0.014;
          return (
            <group key={d.idx} position={[d.x, 0.12, d.z]}>
              {/* Damper Base Socket Mount */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.065, 0.075, 0.04, 24]} />
                <meshStandardMaterial
                  color={COLOR_CARBON}
                  roughness={0.25}
                  metalness={0.8}
                />
              </mesh>
              {/* Chrome Vertical Pylon Guide Pin */}
              <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.22, 20]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.08}
                  metalness={0.98}
                />
              </mesh>
              {/* Top Damper Retainer Cap */}
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.038, 0.028, 0.025, 20]} />
                <meshStandardMaterial
                  color={COLOR_CARBON_LIGHT}
                  roughness={0.2}
                  metalness={0.9}
                />
              </mesh>
              {/* Floating Maglev Damper Torus (Levitating without physical contact) */}
              <group position={[0, 0.12 + bob, 0]}>
                {/* Outer Damper Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.055, 0.016, 16, 32]} />
                  <meshStandardMaterial
                    color={COLOR_CYAN_ACCENT}
                    roughness={0.12}
                    metalness={0.95}
                  />
                </mesh>
                {/* Inner Glowing Emissive Core Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.055, 0.006, 12, 24]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE}
                    emissive={COLOR_EMISSIVE}
                    emissiveIntensity={2.4}
                  />
                </mesh>
              </group>
            </group>
          );
        })}

        {/* Concentric Maglev Stator Emitter Rings (Embedded in Plinth Bed) */}
        <mesh position={[0, 0.271, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.44, 48]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.272, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 48]} />
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.08}
            metalness={0.98}
          />
        </mesh>
        <mesh position={[0, 0.273, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 36]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Central Anvil Specimen Reception Cradle */}
        <RoundedBox
          args={[0.42, 0.08, 0.42]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.31, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.08}
            metalness={0.98}
          />
        </RoundedBox>

        {/* Fracture Stress Cracks upon Frame 265 */}
        {isBroken && (
          <group position={[0, 0.355, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0.4]}>
              <ringGeometry args={[0.02, 0.38, 32]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE}
                emissive={COLOR_EMISSIVE}
                emissiveIntensity={3.5}
                wireframe
              />
            </mesh>
          </group>
        )}
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 1: DUAL ELECTROMAGNETIC INDUCTION RAIL CORES (Order 1, frame 20f)
// Arrives BEFORE casing!
// ----------------------------------------------------------------------------
export const ModuleRailCore: ModularPartSpec = {
  id: "t4_rail_core",
  name: "Dual Electromagnetic Induction Rail Cores & Magnetic Guide Tracks",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.2,
  travelDurationFrames: 5,
  targetSocket: [0, 0.74, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 20,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.07, -0.05, 0.04],
    rotationImpulse: [0.14, 0.08, -0.12],
    sparkOrigin: [0, 0.74, 0],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isRunning }: ModularPartRenderProps) => {
    // 6 Segmented electromagnetic induction coils per rail
    const coilCount = 6;
    const coilSpacing = 0.125;
    const railX = 0.155;

    return (
      <group position={[0, 0, 0]}>
        {/* Left & Right Electromagnetic Induction Rails */}
        {[-railX, railX].map((rx, rIdx) => {
          const isLeft = rIdx === 0;
          return (
            <group key={rIdx} position={[rx, 0, 0]}>
              {/* Primary High-Grade Carbon Titanium Rail Backbone */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.065, 0.88, 0.08]} />
                <meshStandardMaterial
                  color={COLOR_CARBON}
                  roughness={0.2}
                  metalness={0.88}
                />
              </mesh>

              {/* Polished Chrome Mirror Magnetic Sliding Guide Track */}
              <mesh position={[isLeft ? 0.034 : -0.034, 0, 0]}>
                <boxGeometry args={[0.016, 0.86, 0.052]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.06}
                  metalness={0.98}
                />
              </mesh>

              {/* Recessed Continuous Glowing Cyan Flux Line */}
              <mesh position={[isLeft ? 0.043 : -0.043, 0, 0]}>
                <boxGeometry args={[0.006, 0.84, 0.016]} />
                <meshStandardMaterial
                  color={COLOR_EMISSIVE}
                  emissive={COLOR_EMISSIVE}
                  emissiveIntensity={isRunning ? 3.0 : 1.8}
                />
              </mesh>

              {/* Segmented Electromagnetic Induction Coils */}
              {Array.from({ length: coilCount }).map((_, cIdx) => {
                const cy = (cIdx - (coilCount - 1) / 2) * coilSpacing;
                // Kinetic travelling magnetic wave animation
                const pulse = isRunning
                  ? Math.sin(localFrame * 0.45 - cIdx * 0.9) * 0.5 + 0.5
                  : 0.2;

                return (
                  <group key={cIdx} position={[0, cy, 0]}>
                    {/* Superconducting Coil Housing Block */}
                    <RoundedBox
                      args={[0.092, 0.055, 0.11]}
                      radius={0.012}
                      smoothness={3}
                      position={[0, 0, 0]}
                    >
                      <meshStandardMaterial
                        color={COLOR_CARBON_LIGHT}
                        roughness={0.18}
                        metalness={0.92}
                      />
                    </RoundedBox>
                    {/* Glowing Flux Interconnect Aperture */}
                    <mesh position={[isLeft ? -0.047 : 0.047, 0, 0]}>
                      <boxGeometry args={[0.008, 0.03, 0.06]} />
                      <meshStandardMaterial
                        color={COLOR_EMISSIVE}
                        emissive={COLOR_EMISSIVE}
                        emissiveIntensity={1.5 + pulse * 2.0}
                      />
                    </mesh>
                    {/* Brass Contact Terminals */}
                    <mesh position={[0, 0, 0.058]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.016, 12]} />
                      <meshStandardMaterial
                        color={COLOR_GOLD}
                        roughness={0.15}
                        metalness={0.95}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {/* Top Magnetic Guide Yoke Cross-Brace */}
        <RoundedBox
          args={[0.42, 0.065, 0.12]}
          radius={0.016}
          smoothness={3}
          position={[0, 0.42, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.2}
            metalness={0.9}
          />
        </RoundedBox>
        {/* Top Yoke Cyan LED Indicator */}
        <mesh position={[0, 0.42, 0.062]}>
          <boxGeometry args={[0.24, 0.015, 0.006]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Bottom Maglev Guide Shoe Collar */}
        <RoundedBox
          args={[0.38, 0.055, 0.11]}
          radius={0.014}
          smoothness={3}
          position={[0, -0.42, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.2}
            metalness={0.9}
          />
        </RoundedBox>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 2: SUPERCONDUCTING TOROID STATOR HOUSING (Order 2, frame 40f)
// Encloses Order 1 cleanly!
// ----------------------------------------------------------------------------
export const ModuleStatorHousing: ModularPartSpec = {
  id: "t4_stator_housing",
  name: "Superconducting Toroid Stator Housing & Energy Conduit Slots",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 0.76, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 24,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [-0.08, -0.06, -0.05],
    rotationImpulse: [-0.12, 0.06, 0.15],
    sparkOrigin: [0, 0.76, 0],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isRunning }: ModularPartRenderProps) => {
    const colX = 0.285;
    const pulseGlow = isRunning
      ? 2.2 + Math.sin(localFrame * 0.3) * 0.8
      : 2.0;

    return (
      <group position={[0, 0, 0]}>
        {/* Left & Right Heavy Reinforced Dark Titanium Gantry Columns */}
        {[-colX, colX].map((cx, idx) => {
          const isLeft = idx === 0;
          return (
            <group key={idx} position={[cx, 0, 0]}>
              {/* Main Structural Body with Beveled Chamfers (<RoundedBox radius={0.035}>) */}
              <RoundedBox
                args={[0.165, 0.92, 0.36]}
                radius={0.035}
                smoothness={4}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial
                  color={COLOR_CARBON}
                  roughness={0.2}
                  metalness={0.85}
                />
              </RoundedBox>

              {/* Lower Foundation Mounting Footing */}
              <RoundedBox
                args={[0.22, 0.07, 0.40]}
                radius={0.02}
                smoothness={4}
                position={[0, -0.46, 0]}
              >
                <meshStandardMaterial
                  color={COLOR_CARBON_LIGHT}
                  roughness={0.25}
                  metalness={0.88}
                />
              </RoundedBox>

              {/* Front Vertical Cyan Glowing Energy Conduit Slots */}
              <mesh position={[0, 0, 0.182]}>
                <boxGeometry args={[0.035, 0.78, 0.015]} />
                <meshStandardMaterial
                  color={COLOR_EMISSIVE}
                  emissive={COLOR_EMISSIVE}
                  emissiveIntensity={pulseGlow}
                />
              </mesh>
              {/* Rear Vertical Cyan Glowing Energy Conduit Slots */}
              <mesh position={[0, 0, -0.182]}>
                <boxGeometry args={[0.035, 0.78, 0.015]} />
                <meshStandardMaterial
                  color={COLOR_EMISSIVE}
                  emissive={COLOR_EMISSIVE}
                  emissiveIntensity={pulseGlow}
                />
              </mesh>

              {/* Lateral Chrome Reinforcement Trusses */}
              <mesh position={[isLeft ? -0.084 : 0.084, 0, 0]}>
                <boxGeometry args={[0.012, 0.82, 0.28]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.08}
                  metalness={0.98}
                />
              </mesh>

              {/* Hex Socket Precision Tension Bolts */}
              {[-0.35, -0.15, 0.15, 0.35].map((by, bIdx) => (
                <mesh
                  key={bIdx}
                  position={[0, by, 0.185]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.014, 0.014, 0.016, 6]} />
                  <meshStandardMaterial
                    color={COLOR_CHROME}
                    roughness={0.1}
                    metalness={0.96}
                  />
                </mesh>
              ))}
            </group>
          );
        })}

        {/* Upper Transverse Gantry Bridge Header (<RoundedBox radius={0.035}>) */}
        <RoundedBox
          args={[0.74, 0.16, 0.38]}
          radius={0.035}
          smoothness={4}
          position={[0, 0.46, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.2}
            metalness={0.85}
          />
        </RoundedBox>
        {/* Front Horizontal Energy Conduit Slot */}
        <mesh position={[0, 0.46, 0.192]}>
          <boxGeometry args={[0.62, 0.032, 0.015]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={pulseGlow}
          />
        </mesh>

        {/* Superconducting Toroid Housing Ring (Encircling Upper Throat) */}
        <group position={[0, 0.20, 0]}>
          {/* Outer Polished Chrome Toroid Casing */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.052, 16, 40]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.08}
              metalness={0.98}
            />
          </mesh>
          {/* Cyan Glowing Energy Core Flux Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.018, 16, 40]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={2.8}
            />
          </mesh>
          {/* Toroid Mounting Brackets */}
          {[-0.26, 0.26].map((tx, idx) => (
            <mesh key={idx} position={[tx, 0, 0]}>
              <boxGeometry args={[0.08, 0.045, 0.16]} />
              <meshStandardMaterial
                color={COLOR_CARBON_LIGHT}
                roughness={0.25}
                metalness={0.85}
              />
            </mesh>
          ))}
        </group>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 3: CRYOGENIC LN2 DRIVE & SOLENOID PINCH RINGS (Order 3, frame 60f)
// ----------------------------------------------------------------------------
export const ModuleCryoDrive: ModularPartSpec = {
  id: "t4_cryo_drive",
  name: "Cryogenic Liquid Nitrogen Conduits & Solenoid Pinch Rings",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 1.10, 0],
  sparkColor: COLOR_CYAN_ACCENT,
  sparkCount: 22,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.09, -0.06, 0.06],
    rotationImpulse: [0.16, -0.12, 0.09],
    sparkOrigin: [0, 1.10, 0],
    sparkColor: COLOR_CYAN_ACCENT,
  },
  render: ({ localFrame, isRunning }: ModularPartRenderProps) => {
    // 3 Stacked Magnetic Solenoid Pinch Rings
    const pinchY = [-0.10, 0.02, 0.14];

    return (
      <group position={[0, 0, 0]}>
        {/* Central High-Vacuum Accelerator Tube */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.098, 0.098, 0.44, 32]} />
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.18}
            metalness={0.92}
          />
        </mesh>
        {/* Accelerator Tube Longitudinal Cyan Plasma Glow Slits */}
        <mesh position={[0, 0.02, 0.099]}>
          <boxGeometry args={[0.022, 0.36, 0.008]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={isRunning ? 3.4 : 1.8}
          />
        </mesh>
        <mesh position={[0, 0.02, -0.099]}>
          <boxGeometry args={[0.022, 0.36, 0.008]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={isRunning ? 3.4 : 1.8}
          />
        </mesh>

        {/* 3 Superconducting Magnetic Solenoid Pinch Rings */}
        {pinchY.map((py, idx) => {
          const pinchPulse = isRunning
            ? Math.sin(localFrame * 0.6 + idx * 2.0) * 0.4 + 0.6
            : 0.3;

          return (
            <group key={idx} position={[0, py, 0]}>
              {/* Outer Polished Chrome Solenoid Casing */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.138, 0.026, 16, 32]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.06}
                  metalness={0.98}
                />
              </mesh>
              {/* Inner High-Field Magnetic Pinch Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.138, 0.010, 12, 24]} />
                <meshStandardMaterial
                  color={COLOR_EMISSIVE}
                  emissive={COLOR_EMISSIVE}
                  emissiveIntensity={1.8 + pinchPulse * 2.2}
                />
              </mesh>
              {/* Hex Solenoid Pinch Reinforcement Brackets */}
              {[-0.14, 0.14].map((bx, bIdx) => (
                <mesh key={bIdx} position={[bx, 0, 0]}>
                  <boxGeometry args={[0.035, 0.038, 0.06]} />
                  <meshStandardMaterial
                    color={COLOR_CARBON_LIGHT}
                    roughness={0.2}
                    metalness={0.9}
                  />
                </mesh>
              ))}
            </group>
          );
        })}

        {/* Cryogenic Liquid Nitrogen (LN2) Conduits (Left & Right Flanks) */}
        {[-0.22, 0.22].map((lx, idx) => {
          const isLeft = idx === 0;
          return (
            <group key={idx} position={[lx, 0, 0]}>
              {/* Vertical Braided Stainless Steel Coolant Manifold */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.36, 16]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.12}
                  metalness={0.95}
                />
              </mesh>
              {/* 90-Degree Infeed Elbow Tubes to Pinch Rings */}
              {pinchY.map((py, pIdx) => (
                <mesh
                  key={pIdx}
                  position={[isLeft ? 0.055 : -0.055, py, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.09, 16]} />
                  <meshStandardMaterial
                    color={COLOR_CHROME}
                    roughness={0.12}
                    metalness={0.95}
                  />
                </mesh>
              ))}
              {/* Cryogenic Frost Rings / Injector Couplings */}
              <mesh position={[0, -0.16, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.035, 16]} />
                <meshStandardMaterial
                  color={COLOR_CYAN_ACCENT}
                  roughness={0.2}
                  metalness={0.8}
                  emissive={COLOR_CYAN_ACCENT}
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>
          );
        })}

        {/* Pulse Capacitor Discharge Bank Header (Top) */}
        <RoundedBox
          args={[0.44, 0.08, 0.32]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.26, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON}
            roughness={0.2}
            metalness={0.9}
          />
        </RoundedBox>
        {/* High-Voltage Superconductor Gold Contact Studs */}
        {[-0.14, 0.14].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0.305, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.04, 16]} />
            <meshStandardMaterial
              color={COLOR_GOLD}
              roughness={0.15}
              metalness={0.96}
            />
          </mesh>
        ))}
        {/* Top Capacitor Status Cyan Indicator */}
        <mesh position={[0, 0.302, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 4: TUNGSTEN-OSMIUM HYPER-KINETIC RAM & PLASMA IMPACTOR (Order 4, frame 75f)
// Pointing vertically DOWN along Y-axis into specimen!
// ----------------------------------------------------------------------------
export const ModuleToolhead: ModularPartSpec = {
  id: "t4_toolhead",
  name: "Tungsten-Osmium Hyper-Kinetic Ram & Downward Plasma Impactor",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "bottom",
  travelDistance: 2.8,
  travelDurationFrames: 5,
  targetSocket: [0, 1.17, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 26,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.08, 0.12, -0.05],
    rotationImpulse: [0.22, 0.12, -0.18],
    sparkOrigin: [0, 0.42, 0],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const isBurst = isBroken || localFrame >= 265;
    const isOperating = isRunning && localFrame >= 150 && localFrame < 225;
    const isDecel = isRunning && localFrame >= 225 && localFrame < 245;
    const isStall = isRunning && localFrame >= 245 && localFrame < 265;

    // Tachyon sphere top = 0.590, cradle = 0.350
    // Resting tungsten ram tip = 0.900 (31 cm air gap above sphere)
    let tipY = 0.900;

    if (isBurst) {
      tipY = 0.422;
    } else if (isStall) {
      const pShudder = (localFrame - 245) / 19;
      const amp = 0.0005 + pShudder * 0.0025; // 0.5mm to 3mm
      const shudder = Math.sin(localFrame * 35) * amp;
      tipY = 0.420 + shudder;
    } else if (isDecel) {
      const pDecel = (localFrame - 225) / 20;
      tipY = 0.900 - (0.900 - 0.420) * Math.min(1, Math.pow(pDecel, 0.9));
    } else if (isOperating) {
      // 12-frame strike cycle
      const cycleLen = 12;
      const cyclePhase = (localFrame - 150) % cycleLen;
      const defProg = (localFrame - 150) / 74;
      const strikeBottomY = 0.450; // Dynamic strike compresses sphere down to 0.450

      if (cyclePhase < 8) {
        // 65% of cycle (frames 0..7): ram stays HIGH at Y=0.900 (31 cm air gap)
        tipY = 0.900;
      } else if (cyclePhase < 10) {
        // Hyper-velocity plunge downwards towards compressed sphere
        const t = (cyclePhase - 8) / 2;
        tipY = 0.900 - (0.900 - strikeBottomY) * (t * t);
      } else if (cyclePhase === 10) {
        // Bottom contact impact at top of compressed sphere (zero penetration)
        tipY = strikeBottomY;
      } else {
        // Immediate magnetic recoil back up to resting socket position
        tipY = 0.900;
      }
    } else if (isRunning && localFrame >= 70) {
      // Startup frames (70..149): ram stays at resting TDC 0.900
      tipY = 0.900;
    }

    // Tungsten tip is at -0.27 relative to group origin. TargetSocket is [0, 1.17, 0].
    // tipY = 1.17 - 0.27 + strikeDisplacement = 0.90 + strikeDisplacement
    // strikeDisplacement = tipY - 0.90
    const strikeDisplacement = tipY - 0.900;

    // Dynamic plasma glow intensity
    const plasmaIntensity = isRunning && !isBroken
      ? 3.2 + Math.sin(localFrame * 0.8) * 1.5
      : 1.8;

    return (
      <group position={[0, strikeDisplacement, 0]}>
        {/* Upper Magnetic Linear Slider Carriage */}
        <RoundedBox
          args={[0.34, 0.075, 0.085]}
          radius={0.015}
          smoothness={3}
          position={[0, 0.14, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.06}
            metalness={0.98}
          />
        </RoundedBox>
        {/* Dual Chrome Slider Guide Shoes engaging Rails */}
        {[-0.155, 0.155].map((sx, idx) => (
          <mesh key={idx} position={[sx, 0.14, 0]}>
            <boxGeometry args={[0.024, 0.085, 0.075]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.05}
              metalness={0.99}
            />
          </mesh>
        ))}

        {/* Heavy Faceted Tungsten-Osmium Ram Body */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.068, 0.056, 0.22, 8]} />
          <meshStandardMaterial
            color={COLOR_OSMIUM}
            roughness={0.12}
            metalness={0.96}
          />
        </mesh>
        {/* Polished Chrome Ram Compression Flanges */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.074, 0.074, 0.022, 16]} />
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.08}
            metalness={0.98}
          />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.064, 0.064, 0.022, 16]} />
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.08}
            metalness={0.98}
          />
        </mesh>

        {/* Plasma Impactor Focus Collar & Emitter Ring */}
        <group position={[0, -0.11, 0]}>
          {/* Carbon Titanium Emitter Shroud */}
          <mesh>
            <cylinderGeometry args={[0.056, 0.048, 0.045, 24]} />
            <meshStandardMaterial
              color={COLOR_CARBON}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
          {/* Intense Glowing Cyan Plasma Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.054, 0.014, 16, 32]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={plasmaIntensity}
            />
          </mesh>
        </group>

        {/* DARK MATTER / PLASMA IMPACTOR TIP (POINTING VERTICALLY DOWN) */}
        {/* Inverted Stepped Plasma Cone Tip: Apex pointing DOWN towards specimen */}
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.046, 0.014, 0.12, 24]} />
          <meshStandardMaterial
            color={COLOR_DARK_MATTER}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>
        {/* Ultra-Dense Tungsten-Carbide Micro-Chisel Impactor Point */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.014, 0.003, 0.04, 16]} />
          <meshStandardMaterial
            color={COLOR_CHROME}
            roughness={0.04}
            metalness={0.99}
          />
        </mesh>

        {/* Dark Matter Singularity Pinch Vortex Point */}
        <group position={[0, -0.260, 0]}>
          {/* Micro Singularity Black Core */}
          <mesh>
            <sphereGeometry args={[0.005, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Glowing Cyan Corona Halo */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.014, 0.003, 12, 24]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={plasmaIntensity * 1.4}
            />
          </mesh>
        </group>

        {/* CATASTROPHIC FRACTURE AT FRAME 265: Singularity Collapse Shockwave */}
        {isBroken && (
          <group position={[0, -0.20, 0]}>
            {/* Expanding Cyan Singularity Pinch Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  0.04,
                  0.28 + Math.min(1.2, (localFrame - 265) * 0.03),
                  36,
                ]}
              />
              <meshStandardMaterial
                color={COLOR_EMISSIVE}
                emissive={COLOR_EMISSIVE}
                emissiveIntensity={Math.max(0.5, 4.0 - (localFrame - 265) * 0.15)}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Shattered Crystalline Lattice Shards (Flaring upwards away from platform bed) */}
            {[-0.08, 0.06, -0.04, 0.07].map((sx, idx) => (
              <mesh
                key={idx}
                position={[sx, 0.03 + idx * 0.015, (idx - 1.5) * 0.04]}
                rotation={[0.3 * idx, 0.5 * idx, 0.2 * idx]}
              >
                <octahedronGeometry args={[0.018 + idx * 0.004]} />
                <meshStandardMaterial
                  color={COLOR_CYAN_ACCENT}
                  roughness={0.08}
                  metalness={0.95}
                  emissive={COLOR_EMISSIVE}
                  emissiveIntensity={1.2}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MACHINE ASSEMBLY SPEC: TIER 4 SCI-FI / QUANTUM RAIL-HAMMER
// ----------------------------------------------------------------------------
export const HammerTier4Spec: MachineAssemblySpec = {
  id: "hammer_tier4_futuristic",
  name: "Tier 4: $100,000+ Quantum Kinetic Rail-Hammer",
  tier: 4,
  modules: [
    ModuleMaglevBase, // Order 0 (0f): Base Plinth & Damper Rings
    ModuleRailCore, // Order 1 (20f): Rail Cores (arrives before casing)
    ModuleStatorHousing, // Order 2 (40f): Stator Housing (<RoundedBox radius={0.035}>)
    ModuleCryoDrive, // Order 3 (60f): Cryo Conduits & Solenoid Pinch Rings
    ModuleToolhead, // Order 4 (75f): Ram & Downward Plasma Impactor
  ],
};

export const HammerTier4AssemblySpec = HammerTier4Spec;
