import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";

/**
 * ============================================================================
 * TIER 4: SUPERCONDUCTING QUANTUM PINCH PRESS ($100,000+ Level)
 * ============================================================================
 * Operating strictly under remotion_studio/crew/3d_modeler.md and AssemblyContract.ts.
 *
 * Enforces the Inside-Out Golden Assembly Sequence:
 * Order 0 (Frame 0f):  Monolithic Carbon-Nanotube Base Plinth with Cryo-Stabilizers
 *                      & Lower Anvil Bolster (Anvil top surface strictly Y = 0.630).
 * Order 1 (Frame 20f): Dual Superconducting Toroidal Magnetic Accelerator Coils
 *                      with Pulsing Cyan/Magenta Filaments (#06B6D4 / #D946EF).
 *                      MUST arrive BEFORE outer field containment shield!
 * Order 2 (Frame 40f): Aerogel & Dark Titanium Outer Field Containment Armor Pylons
 *                      (#1E293B / #0F172A). Encloses Order 1 cleanly.
 * Order 3 (Frame 60f): Quantum Pinch Flux Coils, Cryo-Cooling Manifolds with Frost Rings,
 *                      and Photonic Waveguide Conduits.
 * Order 4 (Frame 75f): Magnetic Levitation Compression Anvil & Emitter Die
 *                      (levitating at Y = 1.050 at TDC at localFrame 150, exactly
 *                      32 cm air gap above specimen top Y = 0.770, strokes down to Y = 0.730).
 *
 * Material Triad & Palette:
 * - Monolithic Carbon-Nanotube: #09090B (roughness: 0.3, metalness: 0.8)
 * - Dark Titanium / Aerogel:    #1E293B / #0F172A (roughness: 0.35, metalness: 0.85)
 * - Mirror Chrome Steel:        #E2E8F0 / #F8FAFC (roughness: 0.05, metalness: 0.98)
 * - Warm Polished Brass:        #D97706 (roughness: 0.15, metalness: 0.95)
 * - Emissive Cyan Filaments:    #06B6D4 (emissiveIntensity: 2.5..4.5)
 * - Emissive Magenta Filaments: #D946EF (emissiveIntensity: 2.0..3.5)
 * - Iridescent Sky Titanium:    #38BDF8 (roughness: 0.08, metalness: 0.95)
 * ============================================================================
 */

// Color Palette Constants
const COLOR_CARBON_BASE = "#09090B";
const COLOR_TITANIUM_DARK = "#0F172A";
const COLOR_AEROGEL_ARMOR = "#1E293B";
const COLOR_CHROME = "#E2E8F0";
const COLOR_CHROME_BRIGHT = "#F8FAFC";
const COLOR_BRASS_VALVE = "#D97706";
const COLOR_EMISSIVE_CYAN = "#06B6D4";
const COLOR_EMISSIVE_MAGENTA = "#D946EF";
const COLOR_TITANIUM_SKY = "#38BDF8";
const COLOR_CRYSTAL_MIST = "#E0F2FE";

// ----------------------------------------------------------------------------
// MODULE 0: MONOLITHIC CARBON-NANOTUBE BASE PLINTH & ANVIL BOLSTER (Order 0, frame 0f)
// ----------------------------------------------------------------------------
export const ModuleBase: ModularPartSpec = {
  id: "press_t4_base",
  name: "Monolithic Carbon-Nanotube Base Plinth & Cryo-Stabilizers",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: COLOR_EMISSIVE_CYAN,
  sparkCount: 22,
  fracture: {
    breakFrame: 234,
    mode: "shudder_and_crack",
    impulse: [0, 0, 0],
    rotationImpulse: [0.012, 0, -0.012],
    sparkOrigin: [0, 0.63, 0],
    sparkColor: COLOR_EMISSIVE_CYAN,
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    // 4 Cryogenic Outrigger Stabilizer Pods
    const stabilizers = [
      { x: -0.78, z: -0.56, idx: 0 },
      { x: 0.78, z: -0.56, idx: 1 },
      { x: -0.78, z: 0.56, idx: 2 },
      { x: 0.78, z: 0.56, idx: 3 },
    ];

    const isTremor = localFrame >= 225 && localFrame < 234;
    const shudderOffset = isTremor ? Math.sin(localFrame * 42) * 0.001 : 0;

    return (
      <group position={[shudderOffset, 0, 0]}>
        {/* 1. Ground Contact Foundation Bed Plate (rests flush on floor Y = 0) */}
        <RoundedBox
          args={[1.86, 0.06, 1.42]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.03, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON_BASE}
            roughness={0.4}
            metalness={0.75}
          />
        </RoundedBox>

        {/* 2. Main Monolithic Carbon-Nanotube Base Plinth */}
        <RoundedBox
          args={[1.60, 0.24, 1.20]}
          radius={0.035}
          smoothness={4}
          position={[0, 0.18, 0]}
        >
          <meshStandardMaterial
            color={COLOR_CARBON_BASE}
            roughness={0.3}
            metalness={0.8}
          />
        </RoundedBox>

        {/* 3. Perimeter Recessed Cyan Illumination LED Channels */}
        {/* Front & Rear Channels */}
        {[-0.59, 0.59].map((pz, idx) => (
          <mesh key={`led_z_${idx}`} position={[0, 0.285, pz]}>
            <boxGeometry args={[1.52, 0.015, 0.02]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE_CYAN}
              emissive={COLOR_EMISSIVE_CYAN}
              emissiveIntensity={2.8}
            />
          </mesh>
        ))}
        {/* Left & Right Channels */}
        {[-0.79, 0.79].map((px, idx) => (
          <mesh key={`led_x_${idx}`} position={[px, 0.285, 0]}>
            <boxGeometry args={[0.02, 0.015, 1.12]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE_CYAN}
              emissive={COLOR_EMISSIVE_CYAN}
              emissiveIntensity={2.8}
            />
          </mesh>
        ))}

        {/* 4. 4 Heavy Cryo-Stabilizer Outrigger Pods */}
        {stabilizers.map(({ x, z, idx }) => (
          <group key={`stabilizer_${idx}`} position={[x, 0, z]}>
            {/* Stabilizer Outrigger Foot (flush on floor Y = 0) */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.13, 0.15, 0.08, 24]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM_DARK}
                roughness={0.4}
                metalness={0.85}
              />
            </mesh>
            {/* Main Cryo Cylinder Reservoir */}
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.095, 0.095, 0.22, 24]} />
              <meshStandardMaterial
                color={COLOR_AEROGEL_ARMOR}
                roughness={0.3}
                metalness={0.88}
              />
            </mesh>
            {/* Polished Chrome Cryo Reservoir Jacket Sleeve */}
            <mesh position={[0, 0.19, 0]}>
              <cylinderGeometry args={[0.102, 0.102, 0.09, 24]} />
              <meshStandardMaterial
                color={COLOR_CHROME}
                roughness={0.08}
                metalness={0.98}
              />
            </mesh>
            {/* Liquid Nitrogen Level Sight Gauge Tube */}
            <mesh position={[0, 0.18, 0.095]}>
              <boxGeometry args={[0.02, 0.16, 0.015]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={3.2}
              />
            </mesh>
            {/* Top Brass Pressure Relief Valve */}
            <mesh position={[0, 0.31, 0]}>
              <cylinderGeometry args={[0.035, 0.045, 0.04, 16]} />
              <meshStandardMaterial
                color={COLOR_BRASS_VALVE}
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>
            {/* Hex Flange Fasteners */}
            {[-0.08, 0.08].map((fx, fIdx) => (
              <mesh key={fIdx} position={[fx, 0.085, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.02, 6]} />
                <meshStandardMaterial
                  color={COLOR_CHROME}
                  roughness={0.1}
                  metalness={0.95}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* 5. Stepped Upper Dark Titanium Pedestal Riser Collar */}
        <RoundedBox
          args={[1.16, 0.12, 0.94]}
          radius={0.025}
          smoothness={4}
          position={[0, 0.36, 0]}
        >
          <meshStandardMaterial
            color={COLOR_TITANIUM_DARK}
            roughness={0.28}
            metalness={0.88}
          />
        </RoundedBox>

        {/* 6. LOWER ANVIL BOLSTER ASSEMBLY & MAGNETIC CONTAINMENT RING */}
        {/* Strictly Coaxial Centerline: X = 0, Z = 0 */}
        <group position={[0, 0, 0]}>
          {/* Bolster Base Column Riser (Y = 0.42 to Y = 0.55) */}
          <mesh position={[0, 0.485, 0]}>
            <cylinderGeometry args={[0.34, 0.38, 0.13, 36]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM_DARK}
              roughness={0.25}
              metalness={0.9}
            />
          </mesh>

          {/* Magnetic Containment Ring Encircling Lower Bolster Base */}
          <group position={[0, 0.495, 0]}>
            {/* Containment Ring Armor Torus */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.39, 0.035, 16, 40]} />
              <meshStandardMaterial
                color={COLOR_AEROGEL_ARMOR}
                roughness={0.22}
                metalness={0.88}
              />
            </mesh>
            {/* Glowing Magnetic Flux Channel Groove */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.39, 0.012, 12, 40]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={3.2}
              />
            </mesh>
            {/* 6 Radial Titanium Clamping Blocks */}
            {[0, 60, 120, 180, 240, 300].map((deg, rIdx) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <group
                  key={rIdx}
                  position={[Math.cos(rad) * 0.39, 0, Math.sin(rad) * 0.39]}
                  rotation={[0, -rad, 0]}
                >
                  <mesh>
                    <boxGeometry args={[0.07, 0.06, 0.04]} />
                    <meshStandardMaterial
                      color={COLOR_TITANIUM_SKY}
                      roughness={0.12}
                      metalness={0.92}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>

          {/* Stepped Bolster Mounting Collar (Y = 0.55 to Y = 0.595) */}
          <mesh position={[0, 0.5725, 0]}>
            <cylinderGeometry args={[0.30, 0.32, 0.045, 36]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.06}
              metalness={0.98}
            />
          </mesh>

          {/* Hardened Nanodiamond Bolster Wear Disk (Y = 0.595 to Y = 0.630) */}
          {/* Height = 0.035, Center = 0.6125 -> Top Surface strictly at Y = 0.630 */}
          <mesh position={[0, 0.6125, 0]}>
            <cylinderGeometry args={[0.265, 0.285, 0.035, 40]} />
            <meshStandardMaterial
              color={COLOR_CARBON_BASE}
              roughness={0.08}
              metalness={0.95}
            />
          </mesh>

          {/* Polished Mirror-Chrome Beveled Retention Ring around Anvil Face */}
          <mesh position={[0, 0.615, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.27, 0.012, 16, 40]} />
            <meshStandardMaterial
              color={COLOR_CHROME_BRIGHT}
              roughness={0.04}
              metalness={0.99}
            />
          </mesh>

          {/* Anvil Center Target Alignment Grid Surface (strictly Y = 0.630) */}
          <mesh position={[0, 0.6302, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.02, 0.09, 32]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE_CYAN}
              emissive={COLOR_EMISSIVE_CYAN}
              emissiveIntensity={isBroken ? 0.8 : 2.5}
            />
          </mesh>
        </group>

        {/* 7. Rear High-Voltage Cryo Power Conduit Feeders */}
        <group position={[0, 0.25, -0.62]}>
          {[-0.22, 0, 0.22].map((cx, idx) => (
            <group key={idx} position={[cx, 0, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.038, 0.038, 0.16, 20]} />
                <meshStandardMaterial
                  color={COLOR_AEROGEL_ARMOR}
                  roughness={0.4}
                  metalness={0.8}
                />
              </mesh>
              <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.048, 0.048, 0.03, 20]} />
                <meshStandardMaterial
                  color={COLOR_BRASS_VALVE}
                  roughness={0.15}
                  metalness={0.95}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 1: DUAL SUPERCONDUCTING TOROIDAL ACCELERATOR COILS (Order 1, frame 20f)
// Arrives BEFORE outer field containment shield!
// ----------------------------------------------------------------------------
export const ModuleToroidalCoils: ModularPartSpec = {
  id: "press_t4_toroidal_coils",
  name: "Dual Superconducting Toroidal Magnetic Accelerator Coils",
  assemblyOrder: 1,
  snapFrame: 15,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 1.15, 0],
  sparkColor: COLOR_EMISSIVE_CYAN,
  sparkCount: 24,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [2.2, 3.8, -1.8],
    rotationImpulse: [2.4, 1.5, -1.8],
    sparkOrigin: [0, 1.15, 0],
    sparkColor: COLOR_EMISSIVE_CYAN,
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    // Kinematic light pulse and filament rotation
    const isSpooling = isRunning && localFrame >= 63 && localFrame < 123;
    const isOperating = isRunning && localFrame >= 123 && localFrame < 213;
    const isDecel = localFrame >= 213 && localFrame < 225;
    const isStall = localFrame >= 225 && localFrame < 234;

    let rotAngle = 0;
    let cyanIntensity = 1.6;
    let magIntensity = 1.4;

    if (isBroken || localFrame >= 234) {
      cyanIntensity = 0.4;
      magIntensity = 0.2;
      rotAngle = 234 * 0.04;
    } else if (isStall) {
      cyanIntensity = 3.8 + Math.sin(localFrame * 35) * 1.5;
      magIntensity = 3.2 + Math.cos(localFrame * 35) * 1.2;
      rotAngle = 225 * 0.04 + Math.sin(localFrame * 40) * 0.01;
    } else if (isDecel) {
      const p = (localFrame - 213) / 11;
      cyanIntensity = 3.2 - p * 1.0 + Math.sin(localFrame * 0.5) * 0.8;
      magIntensity = 2.8 - p * 1.0;
      rotAngle = (213 + (localFrame - 213) * (1 - p * 0.5)) * 0.04;
    } else if (isOperating) {
      cyanIntensity = 3.5 + Math.sin(localFrame * 0.35) * 1.2;
      magIntensity = 3.0 + Math.cos(localFrame * 0.35) * 1.0;
      rotAngle = localFrame * 0.05;
    } else if (isSpooling) {
      const p = (localFrame - 63) / 59;
      cyanIntensity = 1.6 + p * 1.8;
      magIntensity = 1.4 + p * 1.4;
      rotAngle = p * p * localFrame * 0.04;
    }

    return (
      <group position={[0, 0, 0]}>
        {/* Coaxial Central Magnetic Core Guide Columns (X = 0, Z = 0) */}
        {/* 4 Internal Superconducting Magnetic Guide Rails */}
        {[-0.34, 0.34].map((rx, xi) =>
          [-0.24, 0.24].map((rz, zi) => (
            <mesh key={`guide_${xi}_${zi}`} position={[rx, 0, rz]}>
              <cylinderGeometry args={[0.016, 0.016, 0.72, 16]} />
              <meshStandardMaterial
                color={COLOR_CHROME}
                roughness={0.06}
                metalness={0.98}
              />
            </mesh>
          ))
        )}

        {/* DUAL TOROIDAL ACCELERATOR RINGS (Upper at Y = +0.16, Lower at Y = -0.16) */}
        {[-0.16, 0.16].map((ty, tIdx) => {
          const spinDir = tIdx === 0 ? 1 : -1;
          return (
            <group key={`toroid_${tIdx}`} position={[0, ty, 0]}>
              {/* Outer Toroidal Superconductor Casing */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.43, 0.065, 24, 48]} />
                <meshStandardMaterial
                  color={COLOR_TITANIUM_DARK}
                  roughness={0.25}
                  metalness={0.88}
                />
              </mesh>

              {/* Polished Bismuth/Titanium Armor Clamp Bands */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.43, 0.072, 12, 16]} />
                <meshStandardMaterial
                  color={COLOR_TITANIUM_SKY}
                  roughness={0.12}
                  metalness={0.94}
                />
              </mesh>

              {/* Pulsing Cyan Emissive Superconducting Filaments */}
              <group rotation={[0, rotAngle * spinDir, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.43, 0.016, 16, 48]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE_CYAN}
                    emissive={COLOR_EMISSIVE_CYAN}
                    emissiveIntensity={cyanIntensity}
                  />
                </mesh>
                {/* 12 Interleaved Radial Cyan Magnetic Node Dots */}
                {Array.from({ length: 12 }).map((_, nIdx) => {
                  const nRad = (nIdx * Math.PI * 2) / 12;
                  return (
                    <mesh
                      key={nIdx}
                      position={[
                        Math.cos(nRad) * 0.43,
                        0.05,
                        Math.sin(nRad) * 0.43,
                      ]}
                    >
                      <sphereGeometry args={[0.012, 12, 12]} />
                      <meshStandardMaterial
                        color={COLOR_EMISSIVE_CYAN}
                        emissive={COLOR_EMISSIVE_CYAN}
                        emissiveIntensity={cyanIntensity * 1.3}
                      />
                    </mesh>
                  );
                })}
              </group>

              {/* Pulsing Magenta Emissive Filaments (Counter-Rotating Vector) */}
              <group rotation={[0, -rotAngle * spinDir, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.448, 0.011, 14, 48]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE_MAGENTA}
                    emissive={COLOR_EMISSIVE_MAGENTA}
                    emissiveIntensity={magIntensity}
                  />
                </mesh>
              </group>

              {/* 4 Heavy Titanium Stator Bracket Lugs */}
              {[0, 90, 180, 270].map((deg, bIdx) => {
                const bRad = (deg * Math.PI) / 180;
                return (
                  <group
                    key={bIdx}
                    position={[
                      Math.cos(bRad) * 0.51,
                      0,
                      Math.sin(bRad) * 0.51,
                    ]}
                    rotation={[0, -bRad, 0]}
                  >
                    <mesh>
                      <boxGeometry args={[0.08, 0.08, 0.05]} />
                      <meshStandardMaterial
                        color={COLOR_AEROGEL_ARMOR}
                        roughness={0.2}
                        metalness={0.9}
                      />
                    </mesh>
                    <mesh position={[0.03, 0, 0]}>
                      <cylinderGeometry args={[0.014, 0.014, 0.09, 12]} />
                      <meshStandardMaterial
                        color={COLOR_CHROME}
                        roughness={0.08}
                        metalness={0.98}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {/* Central Relativistic Quantum Pinch Throat Ring (Y = 0) */}
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.022, 16, 40]} />
            <meshStandardMaterial
              color={COLOR_CHROME_BRIGHT}
              roughness={0.04}
              metalness={0.99}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.008, 12, 40]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE_CYAN}
              emissive={COLOR_EMISSIVE_CYAN}
              emissiveIntensity={cyanIntensity * 1.4}
            />
          </mesh>
        </group>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 2: AEROGEL & DARK TITANIUM OUTER FIELD CONTAINMENT ARMOR PYLONS (Order 2, frame 40f)
// Encloses Order 1 cleanly!
// ----------------------------------------------------------------------------
export const ModuleArmorPylons: ModularPartSpec = {
  id: "press_t4_armor_pylons",
  name: "Aerogel & Dark Titanium Field Containment Armor Pylons",
  assemblyOrder: 2,
  snapFrame: 30,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 0.95, 0],
  sparkColor: COLOR_TITANIUM_SKY,
  sparkCount: 28,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [-3.2, 5.0, 2.8],
    rotationImpulse: [-1.8, 3.2, 2.5],
    sparkOrigin: [0, 1.45, 0],
    sparkColor: "#EF4444",
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    // 4 Monolithic Structural Armor Pylons (corner arrangement)
    const pylonCorners = [
      { x: -0.66, z: -0.46, rotY: 0 },
      { x: 0.66, z: -0.46, rotY: Math.PI / 2 },
      { x: 0.66, z: 0.46, rotY: Math.PI },
      { x: -0.66, z: 0.46, rotY: -Math.PI / 2 },
    ];

    const isStall = localFrame >= 225 && localFrame < 234;
    const warningFlash = isStall
      ? (Math.sin(localFrame * 25) > 0 ? 3.5 : 0.5)
      : localFrame >= 63 && !isBroken
      ? 1.5
      : 0.8;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. 4 Monolithic Armor Pylons spanning Y = -0.85 to Y = +0.85 (world 0.10 to 1.80) */}
        {pylonCorners.map(({ x, z, rotY }, idx) => (
          <group key={`pylon_${idx}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            {/* Main Aerogel/Dark Titanium Column (<RoundedBox radius={0.035}>) */}
            <RoundedBox
              args={[0.18, 1.70, 0.18]}
              radius={0.035}
              smoothness={4}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial
                color={COLOR_AEROGEL_ARMOR}
                roughness={0.35}
                metalness={0.85}
              />
            </RoundedBox>

            {/* Inner Dark Titanium Reinforcement Core Plate */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.19, 1.62, 0.08]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM_DARK}
                roughness={0.28}
                metalness={0.9}
              />
            </mesh>

            {/* Recessed Vertical Status Telemetry Strip */}
            <mesh position={[0, 0, 0.092]}>
              <boxGeometry args={[0.04, 1.48, 0.01]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={isBroken ? 0.3 : 2.0}
              />
            </mesh>

            {/* Heavy Bolted Foundation Anchor Flange (at bottom Y = -0.82) */}
            <mesh position={[0, -0.81, 0]}>
              <boxGeometry args={[0.26, 0.08, 0.26]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM_DARK}
                roughness={0.4}
                metalness={0.8}
              />
            </mesh>
            {/* Chrome Anchor Studs */}
            {[-0.09, 0.09].map((bx, bi) =>
              [-0.09, 0.09].map((bz, bzi) => (
                <mesh
                  key={`bolt_${bi}_${bzi}`}
                  position={[bx, -0.76, bz]}
                >
                  <cylinderGeometry args={[0.015, 0.015, 0.03, 6]} />
                  <meshStandardMaterial
                    color={COLOR_CHROME}
                    roughness={0.1}
                    metalness={0.95}
                  />
                </mesh>
              ))
            )}
          </group>
        ))}

        {/* 2. Top Containment Crown Arch Bridge (tying the 4 pylons at Y = +0.82) */}
        <group position={[0, 0.82, 0]}>
          {/* Main Monolithic Crown Block */}
          <RoundedBox
            args={[1.56, 0.22, 1.16]}
            radius={0.038}
            smoothness={4}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={COLOR_TITANIUM_DARK}
              roughness={0.3}
              metalness={0.88}
            />
          </RoundedBox>

          {/* Stepped Upper Cap Plate */}
          <RoundedBox
            args={[1.34, 0.05, 0.94]}
            radius={0.02}
            smoothness={3}
            position={[0, 0.13, 0]}
          >
            <meshStandardMaterial
              color={COLOR_AEROGEL_ARMOR}
              roughness={0.32}
              metalness={0.85}
            />
          </RoundedBox>

          {/* Central Magnetic Flux Bore Collar (Centerline X = 0, Z = 0) */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.42, 0.24, 32]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.06}
              metalness={0.98}
            />
          </mesh>

          {/* Front Warning Stencil Panel ("DANGER: 100 TESLA QUANTUM PINCH") */}
          <mesh position={[0, 0, 0.585]}>
            <boxGeometry args={[0.82, 0.12, 0.01]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#F59E0B"
              emissiveIntensity={warningFlash}
            />
          </mesh>
        </group>

        {/* 3. Lateral Field Containment Blast Shield Panels (Left & Right) */}
        {[-0.67, 0.67].map((sx, idx) => (
          <group key={`shield_${idx}`} position={[sx, 0, 0]}>
            {/* Outer Armor Frame */}
            <RoundedBox
              args={[0.045, 1.12, 0.76]}
              radius={0.02}
              smoothness={3}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial
                color={COLOR_AEROGEL_ARMOR}
                roughness={0.38}
                metalness={0.82}
              />
            </RoundedBox>

            {/* Iridescent Titanium Quartz Viewport Slats */}
            {[-0.32, -0.16, 0, 0.16, 0.32].map((sy, sIdx) => (
              <mesh key={sIdx} position={[0, sy, 0]}>
                <boxGeometry args={[0.052, 0.065, 0.64]} />
                <meshStandardMaterial
                  color={COLOR_TITANIUM_SKY}
                  roughness={0.08}
                  metalness={0.95}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 3: QUANTUM PINCH FLUX COILS, CRYO MANIFOLDS & WAVEGUIDES (Order 3, frame 60f)
// ----------------------------------------------------------------------------
export const ModuleFluxManifolds: ModularPartSpec = {
  id: "press_t4_flux_manifolds",
  name: "Quantum Pinch Flux Coils, Cryo Manifolds & Photonic Waveguides",
  assemblyOrder: 3,
  snapFrame: 45,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 1.45, 0],
  sparkColor: COLOR_EMISSIVE_CYAN,
  sparkCount: 22,
  fracture: {
    breakFrame: 234,
    mode: "fling_parabolic",
    impulse: [1.8, 5.8, -2.5],
    rotationImpulse: [3.5, -2.8, 2.2],
    sparkOrigin: [0, 1.45, 0],
    sparkColor: COLOR_TITANIUM_SKY,
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    // 4 Quad Quantum Pinch Flux Concentrator Coils (aimed inward/downward toward pinch axis)
    const fluxCoils = [
      { x: -0.36, z: -0.28, rotY: Math.PI / 4, rotX: 0.28 },
      { x: 0.36, z: -0.28, rotY: -Math.PI / 4, rotX: 0.28 },
      { x: -0.36, z: 0.28, rotY: (3 * Math.PI) / 4, rotX: -0.28 },
      { x: 0.36, z: 0.28, rotY: (-3 * Math.PI) / 4, rotX: -0.28 },
    ];

    const isOperating = isRunning && localFrame >= 63 && !isBroken;
    const vaporPulse = isOperating ? 0.35 + Math.sin(localFrame * 0.2) * 0.12 : 0.15;
    const laserGlow = isOperating ? 3.2 + Math.sin(localFrame * 0.4) * 1.2 : 1.0;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. Quad Pinch Flux Concentrator Coils */}
        {fluxCoils.map(({ x, z, rotY, rotX }, idx) => (
          <group
            key={`flux_coil_${idx}`}
            position={[x, -0.06, z]}
            rotation={[rotX, rotY, 0]}
          >
            {/* Stepped Conical Magnetic Focus Horn */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.12, 0.20, 24]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM_DARK}
                roughness={0.25}
                metalness={0.9}
              />
            </mesh>

            {/* Polished Superconducting Copper/Gold Coil Windings */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.09, 24]} />
              <meshStandardMaterial
                color={COLOR_BRASS_VALVE}
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>

            {/* Sky Titanium Magnetic Focus Tip Nozzle */}
            <mesh position={[0, -0.105, 0]}>
              <cylinderGeometry args={[0.06, 0.075, 0.03, 24]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM_SKY}
                roughness={0.08}
                metalness={0.96}
              />
            </mesh>

            {/* Glowing Magnetic Emitter Core */}
            <mesh position={[0, -0.12, 0]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={laserGlow}
              />
            </mesh>
          </group>
        ))}

        {/* 2. Stainless Steel Cryo-Cooling Manifold Distributor Pipes */}
        <group position={[0, 0.12, 0]}>
          {/* Central Cryo Manifold Hub */}
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.12}
              metalness={0.96}
            />
          </mesh>

          {/* 4 Radial Cryo Supply Pipes routing to outer columns */}
          {[0, 90, 180, 270].map((deg, pIdx) => {
            const pRad = (deg * Math.PI) / 180;
            return (
              <group
                key={`pipe_${pIdx}`}
                rotation={[0, pRad, 0]}
              >
                <mesh position={[0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.32, 16]} />
                  <meshStandardMaterial
                    color={COLOR_CHROME}
                    roughness={0.1}
                    metalness={0.97}
                  />
                </mesh>
                {/* Brass Knurled Pressure Couplers */}
                <mesh position={[0.20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
                  <meshStandardMaterial
                    color={COLOR_BRASS_VALVE}
                    roughness={0.15}
                    metalness={0.95}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 3. Frost / Sub-Zero Vapor Particle Rings */}
        <group position={[0, 0.08, 0]}>
          {[-0.22, 0.22].map((vx, vi) => (
            <mesh key={`vapor_${vi}`} position={[vx, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.09, 0.022, 12, 28]} />
              <meshStandardMaterial
                color={COLOR_CRYSTAL_MIST}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={vaporPulse * 1.5}
                transparent
                opacity={vaporPulse}
              />
            </mesh>
          ))}
        </group>

        {/* 4. Photonic Waveguide Conduits (Routing Coherent Quantum Laser Pulses) */}
        <group position={[0, -0.04, 0]}>
          {/* Coaxial Downward Waveguide Fiber Tubes */}
          {[-0.14, 0.14].map((wx, wi) =>
            [-0.14, 0.14].map((wz, wzi) => (
              <group key={`wave_${wi}_${wzi}`} position={[wx, 0, wz]}>
                {/* Transparent Quartz Outer Conduit */}
                <mesh position={[0, -0.16, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.34, 16]} />
                  <meshStandardMaterial
                    color={COLOR_CHROME_BRIGHT}
                    roughness={0.05}
                    metalness={0.9}
                    transparent
                    opacity={0.65}
                  />
                </mesh>
                {/* Coherent Laser Light Core */}
                <mesh position={[0, -0.16, 0]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.35, 12]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE_CYAN}
                    emissive={COLOR_EMISSIVE_CYAN}
                    emissiveIntensity={laserGlow * 1.3}
                  />
                </mesh>
              </group>
            ))
          )}
        </group>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 4: MAGNETIC LEVITATION COMPRESSION ANVIL & EMITTER DIE (Order 4, frame 75f)
// Coaxial alignment: Centerline strictly X = 0, Z = 0!
// Levitating at Y = 1.050 at TDC at frame 150 (32 cm air gap above specimen top Y = 0.770).
// ----------------------------------------------------------------------------
export interface PressTier4Kinematics {
  dieY: number;
  strokeY: number;
  isImpacting: boolean;
  flashIntensity: number;
}

export function getPressTier4Kinematics(
  localFrame: number,
  isRunning: boolean,
  isBroken: boolean
): PressTier4Kinematics {
  let dieY = 1.050; // Canonical TDC resting coordinate
  let isImpacting = false;
  let flashIntensity = 2.5;

  if (isBroken || localFrame >= 234) {
    // Overload fracture: rests securely on crushed specimen atop bolster (Y = 0.735 >= 0.630)
    dieY = 0.735;
    flashIntensity = 1.0;
  } else if (localFrame >= 225) {
    // Phase 4B: Resonant Stall & Shudder (225..233f)
    // Magnetic pinch locks on dense anomaly at Y = 0.730 with 2mm intense jitter
    const tremor = Math.sin(localFrame * 42) * 0.002; // exactly 2mm tremor
    dieY = 0.730 + tremor;
    flashIntensity = 4.2 + Math.sin(localFrame * 30) * 1.8;
    isImpacting = true;
  } else if (localFrame >= 213) {
    // Phase 4A: Deceleration & Field Destabilization (213..224f)
    // Starts smoothly at TDC Y = 1.050 at frame 213 (matching frame 212 TDC)
    const pDecel = (localFrame - 213) / 11;
    // Smooth descent into contact
    dieY = 1.050 - (1.050 - 0.730) * Math.min(1, Math.pow(pDecel, 0.85));
    flashIntensity = 2.8 + Math.sin(localFrame * 0.6) * 1.0;
  } else if (localFrame >= 123) {
    // Phase 3: Hyper-Frequency Relativistic Magnetic Pinch Strokes (123..212f)
    // 7 complete 12-frame strike cycles (123..206), resting safely at TDC on 207..212!
    // Strikes at exact frames: [133, 145, 157, 169, 181, 193, 205]
    const strikeTDC = 1.050;
    const strikeBDC = 0.730;

    if (localFrame >= 207) {
      dieY = strikeTDC;
      flashIntensity = 3.0;
    } else {
      const cycleLen = 12; // 12-frame strike cycle
      const cyclePhase = (localFrame - 123) % cycleLen;

      if (cyclePhase < 8) {
        // 65% of cycle (frames 0..7): Die holds high at TDC Y = 1.050 (32 cm air gap!)
        dieY = strikeTDC;
        flashIntensity = 2.8;
      } else if (cyclePhase < 10) {
        // Relativistic magnetic plunge downward
        const t = (cyclePhase - 8) / 2;
        dieY = strikeTDC - (strikeTDC - strikeBDC) * (t * t * t);
        flashIntensity = 3.6;
      } else if (cyclePhase === 10) {
        // Peak magnetic compression impact slam at Y = 0.730 (impact frames: 133, 145, 157, 169, 181, 193, 205)
        dieY = strikeBDC;
        isImpacting = true;
        flashIntensity = 6.0; // Spatial distortion flash!
      } else {
        // Instant magnetic recoil back to TDC
        dieY = strikeTDC;
        flashIntensity = 3.2;
      }
    }
  } else if (localFrame >= 63) {
    // Phase 2: Superconducting spool-up (63..122f)
    // Maglev fields lock with subtle micro-float breathing (0.5mm amplitude)
    // Die holds strictly at TDC Y = 1.050 (ZERO collision with specimen!)
    const breath = Math.sin(localFrame * 0.16) * 0.0008;
    dieY = 1.050 + breath;
    flashIntensity = 2.2 + ((localFrame - 63) / 59) * 1.2;
  }

  const strokeY = dieY - 1.050;
  return { dieY, strokeY, isImpacting, flashIntensity };
}

export const ModulePinchDie: ModularPartSpec = {
  id: "press_t4_pinch_die",
  name: "Magnetic Levitation Compression Anvil & Emitter Die",
  assemblyOrder: 4,
  snapFrame: 60,
  entryDirection: "bottom",
  travelDistance: 2.8,
  travelDurationFrames: 5,
  targetSocket: [0, 1.050, 0],
  sparkColor: COLOR_EMISSIVE_CYAN,
  sparkCount: 30,
  fracture: {
    breakFrame: 234,
    mode: "shear_and_tilt",
    impulse: [0.5, 1.0, -0.4],
    rotationImpulse: [0.5, 0.2, -0.4],
    sparkOrigin: [0, 0.73, 0],
    sparkColor: COLOR_EMISSIVE_CYAN,
  },
  render: ({ localFrame, isRunning, isBroken }: ModularPartRenderProps) => {
    const { dieY, isImpacting, flashIntensity } = getPressTier4Kinematics(
      localFrame,
      isRunning,
      isBroken
    );

    // Displacement relative to targetSocket [0, 1.050, 0]
    // When dieY == 1.050, displacement is 0.000.
    // When dieY == 0.730, displacement is -0.320.
    const verticalDisplacement = dieY - 1.050;

    return (
      <group position={[0, verticalDisplacement, 0]}>
        {/* 1. UPPER MAGNETIC LEVITATION ARMATURE & CHROME GUIDE COLLAR */}
        {/* Extends upward from Y = +0.14 to Y = +0.36 */}
        <group position={[0, 0.25, 0]}>
          {/* Main Chrome Maglev Armature Cylinder */}
          <mesh>
            <cylinderGeometry args={[0.18, 0.22, 0.18, 36]} />
            <meshStandardMaterial
              color={COLOR_CHROME}
              roughness={0.05}
              metalness={0.98}
            />
          </mesh>

          {/* 4 Titanium Stabilization Guidance Fins */}
          {[0, 90, 180, 270].map((deg, fIdx) => {
            const fRad = (deg * Math.PI) / 180;
            return (
              <group
                key={`fin_${fIdx}`}
                rotation={[0, fRad, 0]}
              >
                <mesh position={[0.22, 0, 0]}>
                  <boxGeometry args={[0.10, 0.14, 0.024]} />
                  <meshStandardMaterial
                    color={COLOR_TITANIUM_SKY}
                    roughness={0.1}
                    metalness={0.94}
                  />
                </mesh>
                {/* Cyan Levitation Sensor Node */}
                <mesh position={[0.26, 0, 0]}>
                  <sphereGeometry args={[0.012, 12, 12]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE_CYAN}
                    emissive={COLOR_EMISSIVE_CYAN}
                    emissiveIntensity={flashIntensity}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 2. MIDDLE QUANTUM PINCH FLUX MATRIX (Octagonal Armor Block) */}
        {/* Extends Y = +0.06 to Y = +0.16 */}
        <group position={[0, 0.11, 0]}>
          <mesh>
            <cylinderGeometry args={[0.27, 0.25, 0.10, 8]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM_DARK}
              roughness={0.22}
              metalness={0.9}
            />
          </mesh>

          {/* Recessed Cyan Corona Grooves around Octagonal Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26, 0.012, 12, 32]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE_CYAN}
              emissive={COLOR_EMISSIVE_CYAN}
              emissiveIntensity={flashIntensity * 1.2}
            />
          </mesh>
        </group>

        {/* 3. LOWER COMPRESSION DIE & QUANTUM EMITTER PUNCH HEAD */}
        {/* Modeled so its bottom contact face is strictly at local Y = 0 */}
        <group position={[0, 0, 0]}>
          {/* Main Nanodiamond Punch Core (Y = 0.00 to Y = 0.06) */}
          {/* Cylinder height = 0.06, center = 0.03 -> bottom face strictly at local Y = 0.000 */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.06, 36]} />
            <meshStandardMaterial
              color={COLOR_CARBON_BASE}
              roughness={0.06}
              metalness={0.95}
            />
          </mesh>

          {/* Polished Mirror-Chrome Beveled Outer Ring */}
          <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.235, 0.014, 16, 40]} />
            <meshStandardMaterial
              color={COLOR_CHROME_BRIGHT}
              roughness={0.04}
              metalness={0.99}
            />
          </mesh>

          {/* Center Relativistic Quantum Pinch Nozzle Aperture (Centerline X=0, Z=0) */}
          <group position={[0, 0.005, 0]}>
            {/* Recessed Dark Matter Nozzle Core */}
            <mesh position={[0, 0.010, 0]}>
              <cylinderGeometry args={[0.045, 0.075, 0.02, 24]} />
              <meshStandardMaterial
                color="#000000"
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
            {/* Pulsing Plasma Singularity Emitter Lens (recessed inside nozzle cavity) */}
            <mesh position={[0, 0.012, 0]}>
              <sphereGeometry args={[0.008, 16, 16]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={flashIntensity * 1.5}
              />
            </mesh>
            {/* Concentric Magnetic Pinch Ring */}
            <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.025, 0.05, 24]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_MAGENTA}
                emissive={COLOR_EMISSIVE_MAGENTA}
                emissiveIntensity={flashIntensity * 1.2}
              />
            </mesh>
          </group>
        </group>

        {/* 4. VISUAL EFFECTS: SPATIAL DISTORTION FLASH & RELATIVISTIC SHOCKWAVE */}
        {isImpacting && !isBroken && (
          <group position={[0, 0, 0]}>
            {/* Radial Spatial Distortion Flash Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.48, 36]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={5.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        )}

        {/* 5. CATASTROPHIC FRACTURE: SINGULARITY RUPTURE & DEBRIS (Frame 234..319) */}
        {/* All debris settles safely at Y >= 0.630 atop anvil bolster */}
        {(isBroken || localFrame >= 234) && (
          <group position={[0, 0.02, 0]}>
            {/* Expanding Rupture Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  0.05,
                  0.32 + Math.min(1.4, (localFrame - 234) * 0.04),
                  40,
                ]}
              />
              <meshStandardMaterial
                color={COLOR_EMISSIVE_CYAN}
                emissive={COLOR_EMISSIVE_CYAN}
                emissiveIntensity={Math.max(0.4, 4.5 - (localFrame - 234) * 0.16)}
                transparent
                opacity={0.75}
              />
            </mesh>

            {/* Plasma Arc Discharge Flashes */}
            {[-0.12, 0.14, -0.06, 0.18].map((px, idx) => (
              <mesh
                key={`plasma_arc_${idx}`}
                position={[
                  px,
                  0.015 + idx * 0.008,
                  (idx - 1.5) * 0.08,
                ]}
                rotation={[0.2 * idx, 0.4 * idx, 0.1 * idx]}
              >
                <octahedronGeometry args={[0.022 + idx * 0.005]} />
                <meshStandardMaterial
                  color={COLOR_TITANIUM_SKY}
                  emissive={COLOR_EMISSIVE_CYAN}
                  emissiveIntensity={2.5}
                  roughness={0.08}
                  metalness={0.95}
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
// MACHINE ASSEMBLY SPEC: TIER 4 QUANTUM PINCH PRESS ($100,000+)
// ----------------------------------------------------------------------------
export const PressTier4Spec: MachineAssemblySpec = {
  id: "press_tier4_futuristic",
  name: "Tier 4: $100,000+ Superconducting Quantum Pinch Press",
  tier: 4,
  strikeFrames: [133, 145, 157, 169, 181, 193, 205],
  strikeIntensity: 0.065,
  modules: [
    ModuleBase, // Order 0 (0f): Monolithic Carbon Base & Lower Anvil Bolster
    ModuleToroidalCoils, // Order 1 (20f): Toroidal Accelerator Coils (arrives BEFORE shield!)
    ModuleArmorPylons, // Order 2 (40f): Aerogel/Titanium Armor Pylons (<RoundedBox radius={0.035}>)
    ModuleFluxManifolds, // Order 3 (60f): Quantum Pinch Flux Coils & Cryo Manifolds
    ModulePinchDie, // Order 4 (75f): Magnetic Levitation Compression Anvil & Emitter Die
  ],
};

export const PressTier4AssemblySpec = PressTier4Spec;
