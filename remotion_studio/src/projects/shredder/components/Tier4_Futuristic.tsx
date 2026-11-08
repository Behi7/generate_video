import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  ModularPartRenderProps,
} from "@shared/contracts/AssemblyContract";
import { ProceduralAssemblyRig } from "@shared/components/ProceduralAssemblyRig";

/**
 * ============================================================================
 * TIER 4: QUANTUM SINGULARITY & IONIZED PLASMA SHREDDER ($100 000+ Level)
 * ============================================================================
 * Operating under 3D Modeler Layer & AssemblyContract.
 * Enforces Inside-Out Golden Assembly Sequence:
 * Order 0 (0f):  Monolithic Maglev Pedestal & Contact Shadow Grounding
 * Order 1 (20f): Levitating Superconducting Magnetic Spindle Cores (arrives BEFORE housing)
 * Order 2 (40f): Toroidal Superconducting Accelerator Chamber & Quartz Viewport
 * Order 3 (60f): Quad Magnetic Pinch Coils, Cryo Conduits & High-Voltage Busbars
 * Order 4 (75f): High-Frequency Interleaved Plasma Cutter Rings & Singularity Vortex
 *
 * Material Triad:
 * - Matte obsidian/graphite (#0F172A)
 * - Iridescent bismuth/titanium (#38BDF8)
 * - Glowing emissive accents (#06B6D4, emissiveIntensity: 2.5)
 * ============================================================================
 */

const COLOR_OBSIDIAN = "#0F172A";
const COLOR_TITANIUM = "#38BDF8";
const COLOR_EMISSIVE = "#06B6D4";
const COLOR_WHITE = "#FFFFFF";
const COLOR_GOLD = "#D97706";

// ----------------------------------------------------------------------------
// MODULE 0: MONOLITHIC MAGLEV PEDESTAL (Order 0, frame 0f)
// ----------------------------------------------------------------------------
export const ModulePedestal: ModularPartSpec = {
  id: "tier4_pedestal",
  name: "Monolithic Maglev Obsidian Pedestal",
  assemblyOrder: 0,
  snapFrame: 0,
  targetSocket: [0, 0, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 16,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* Heavy Monolithic Obsidian Ground Foundation Plinth */}
      <RoundedBox
        args={[1.86, 0.22, 1.48]}
        radius={0.035}
        smoothness={4}
        position={[0, 0.11, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.7}
          metalness={0.4}
        />
      </RoundedBox>

      {/* Recessed Blue LED Perimeter Illumination Channels */}
      {/* Front & Back Recessed LED Glow Strips */}
      <mesh position={[0, 0.215, 0.69]}>
        <boxGeometry args={[1.68, 0.02, 0.03]} />
        <meshStandardMaterial
          color={COLOR_EMISSIVE}
          emissive={COLOR_EMISSIVE}
          emissiveIntensity={2.5}
        />
      </mesh>
      <mesh position={[0, 0.215, -0.69]}>
        <boxGeometry args={[1.68, 0.02, 0.03]} />
        <meshStandardMaterial
          color={COLOR_EMISSIVE}
          emissive={COLOR_EMISSIVE}
          emissiveIntensity={2.5}
        />
      </mesh>
      {/* Left & Right Recessed LED Glow Strips */}
      <mesh position={[-0.88, 0.215, 0]}>
        <boxGeometry args={[0.03, 0.02, 1.34]} />
        <meshStandardMaterial
          color={COLOR_EMISSIVE}
          emissive={COLOR_EMISSIVE}
          emissiveIntensity={2.5}
        />
      </mesh>
      <mesh position={[0.88, 0.215, 0]}>
        <boxGeometry args={[0.03, 0.02, 1.34]} />
        <meshStandardMaterial
          color={COLOR_EMISSIVE}
          emissive={COLOR_EMISSIVE}
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Stepped Maglev Recess Bed Platform */}
      <RoundedBox
        args={[1.56, 0.12, 1.24]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.28, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.65}
          metalness={0.5}
        />
      </RoundedBox>

      {/* Dual Maglev Magnetic Levitation Guide Tracks */}
      {[-0.46, 0.46].map((tx, idx) => (
        <group key={idx} position={[tx, 0.345, 0]}>
          <mesh>
            <boxGeometry args={[0.07, 0.015, 1.08]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.15}
              metalness={0.96}
            />
          </mesh>
          {/* Recessed Blue LED Channel under rail */}
          <mesh position={[0, -0.008, 0]}>
            <boxGeometry args={[0.09, 0.008, 1.04]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>
      ))}

      {/* Upright Monolithic Support Pylons (Left and Right Stanchions) */}
      {[-0.64, 0.64].map((px, idx) => (
        <group key={idx} position={[px, 0.88, 0]}>
          {/* Main Obsidian Stanchion Column */}
          <RoundedBox
            args={[0.26, 1.08, 0.46]}
            radius={0.03}
            smoothness={4}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={COLOR_OBSIDIAN}
              roughness={0.65}
              metalness={0.45}
            />
          </RoundedBox>

          {/* Chamfered Bismuth/Titanium Stiffening Flange */}
          <RoundedBox
            args={[0.04, 0.96, 0.49]}
            radius={0.018}
            smoothness={4}
            position={[px > 0 ? 0.14 : -0.14, 0, 0]}
          >
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.12}
              metalness={0.96}
            />
          </RoundedBox>

          {/* Vertical Recessed LED Telemetry Strips on Exterior Face */}
          {[-0.14, 0, 0.14].map((sz, j) => (
            <mesh
              key={j}
              position={[px > 0 ? 0.165 : -0.165, 0.06, sz]}
            >
              <boxGeometry args={[0.01, 0.42, 0.022]} />
              <meshStandardMaterial
                color={COLOR_EMISSIVE}
                emissive={COLOR_EMISSIVE}
                emissiveIntensity={2.5}
              />
            </mesh>
          ))}

          {/* Heavy Chrome Bearing Saddle Rings */}
          <mesh
            position={[px > 0 ? -0.14 : 0.14, 0.57, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.13, 0.13, 0.36, 24]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.1}
              metalness={0.98}
            />
          </mesh>
          {/* Hex Securing Studs on Bearing Flange */}
          {[0, 60, 120, 180, 240, 300].map((deg, k) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh
                key={k}
                position={[
                  (px > 0 ? -0.14 : 0.14) + Math.cos(rad) * 0.105,
                  0.57 + Math.sin(rad) * 0.105,
                  0.19,
                ]}
              >
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshStandardMaterial
                  color={COLOR_TITANIUM}
                  roughness={0.1}
                  metalness={0.95}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  ),
};

// ----------------------------------------------------------------------------
// MODULE 1: LEVITATING VORTEX CORES (Order 1, frame 20f)
// Arrives BEFORE containment housing!
// ----------------------------------------------------------------------------
export const ModuleVortexCores: ModularPartSpec = {
  id: "tier4_vortex_cores",
  name: "Counter-Rotating Magnetic Spindle Cores",
  assemblyOrder: 1,
  snapFrame: 20,
  entryDirection: "top",
  travelDistance: 3.5,
  travelDurationFrames: 5,
  targetSocket: [0, 1.45, 0],
  sparkColor: COLOR_TITANIUM,
  sparkCount: 20,
  render: ({ localFrame, isRunning, rpm }: ModularPartRenderProps) => {
    // Spindle rotation: Clockwise for Left, Counter-Clockwise for Right
    const rotSpeed = rpm || 3600;
    const rot = isRunning
      ? (localFrame * rotSpeed * Math.PI) / 1800
      : localFrame * 0.15;

    const leftX = -0.24;
    const rightX = 0.24;
    const ringCount = 6;
    const ringSpacing = 0.13;

    return (
      <group position={[0, 0, 0]}>
        {/* Left Spindle Shaft (Clockwise: -rot) */}
        <group position={[leftX, 0, 0]} rotation={[0, 0, -rot]}>
          {/* Primary High-Vacuum Titanium Shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.076, 0.076, 1.04, 32]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.08}
              metalness={0.98}
            />
          </mesh>

          {/* Superconducting Journal Bearing Bushings */}
          {[-0.48, 0.48].map((bz, idx) => (
            <group key={idx} position={[0, 0, bz]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.096, 0.096, 0.08, 24]} />
                <meshStandardMaterial
                  color={COLOR_OBSIDIAN}
                  roughness={0.5}
                  metalness={0.8}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.098, 0.098, 0.02, 24]} />
                <meshStandardMaterial
                  color={COLOR_GOLD}
                  roughness={0.15}
                  metalness={0.96}
                />
              </mesh>
            </group>
          ))}

          {/* Counter-Rotating Magnetic Spindle Rings with Plasma Channels */}
          {Array.from({ length: ringCount }).map((_, i) => {
            const z = (i - (ringCount - 1) / 2) * ringSpacing;
            return (
              <group key={`l_core_ring_${i}`} position={[0, 0, z]}>
                {/* Magnetic Core Hub */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.095, 0.095, 0.038, 24]} />
                  <meshStandardMaterial
                    color={COLOR_TITANIUM}
                    roughness={0.12}
                    metalness={0.95}
                  />
                </mesh>
                {/* Glowing Plasma Containment Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.098, 0.016, 16, 32]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE}
                    emissive={COLOR_EMISSIVE}
                    emissiveIntensity={2.5}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Right Spindle Shaft (Counter-Clockwise: +rot) */}
        <group position={[rightX, 0, 0]} rotation={[0, 0, rot]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.076, 0.076, 1.04, 32]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.08}
              metalness={0.98}
            />
          </mesh>

          {/* Superconducting Journal Bearing Bushings */}
          {[-0.48, 0.48].map((bz, idx) => (
            <group key={idx} position={[0, 0, bz]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.096, 0.096, 0.08, 24]} />
                <meshStandardMaterial
                  color={COLOR_OBSIDIAN}
                  roughness={0.5}
                  metalness={0.8}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.098, 0.098, 0.02, 24]} />
                <meshStandardMaterial
                  color={COLOR_GOLD}
                  roughness={0.15}
                  metalness={0.96}
                />
              </mesh>
            </group>
          ))}

          {/* Counter-Rotating Magnetic Spindle Rings (Z-staggered slightly) */}
          {Array.from({ length: ringCount }).map((_, i) => {
            const z = (i - (ringCount - 1) / 2) * ringSpacing;
            return (
              <group key={`r_core_ring_${i}`} position={[0, 0, z]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.095, 0.095, 0.038, 24]} />
                  <meshStandardMaterial
                    color={COLOR_TITANIUM}
                    roughness={0.12}
                    metalness={0.95}
                  />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.098, 0.016, 16, 32]} />
                  <meshStandardMaterial
                    color={COLOR_EMISSIVE}
                    emissive={COLOR_EMISSIVE}
                    emissiveIntensity={2.5}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 2: CONTAINMENT CHAMBER (Order 2, frame 40f)
// Arrives AFTER vortex cores, enclosing them cleanly.
// ----------------------------------------------------------------------------
export const ModuleContainmentChamber: ModularPartSpec = {
  id: "tier4_containment_chamber",
  name: "Toroidal Accelerator Containment Chamber & Quartz Viewport",
  assemblyOrder: 2,
  snapFrame: 40,
  entryDirection: "top",
  travelDistance: 3.8,
  travelDurationFrames: 5,
  targetSocket: [0, 1.45, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 22,
  render: () => (
    <group position={[0, 0, 0]}>
      {/* Lateral Monolithic Obsidian Clamshell Casings */}
      <RoundedBox
        args={[0.18, 0.74, 1.12]}
        radius={0.03}
        smoothness={4}
        position={[-0.48, 0, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.65}
          metalness={0.45}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.18, 0.74, 1.12]}
        radius={0.03}
        smoothness={4}
        position={[0.48, 0, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.65}
          metalness={0.45}
        />
      </RoundedBox>

      {/* Top Accelerator Manifold Collar */}
      <RoundedBox
        args={[1.12, 0.14, 1.16]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.42, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.7}
          metalness={0.4}
        />
      </RoundedBox>

      {/* Bottom Discharge Funnel Collar */}
      <RoundedBox
        args={[1.12, 0.14, 1.16]}
        radius={0.03}
        smoothness={4}
        position={[0, -0.42, 0]}
      >
        <meshStandardMaterial
          color={COLOR_OBSIDIAN}
          roughness={0.7}
          metalness={0.4}
        />
      </RoundedBox>

      {/* Quad Toroidal Superconducting Accelerator Rings on Outer Flanks */}
      {[
        [-0.56, 0, -0.32],
        [-0.56, 0, 0.32],
        [0.56, 0, -0.32],
        [0.56, 0, 0.32],
      ].map(([tx, ty, tz], idx) => (
        <group key={idx} position={[tx, ty, tz]}>
          {/* Polished Bismuth/Titanium Outer Magnetic Accelerator Torus */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.2, 0.046, 20, 36]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.12}
              metalness={0.96}
            />
          </mesh>
          {/* Glowing Emissive Superconducting Core Ring */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.2, 0.016, 16, 32]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={2.5}
            />
          </mesh>
          {/* Gold Superconducting Coupling Nodes */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color={COLOR_GOLD}
              roughness={0.15}
              metalness={0.95}
            />
          </mesh>
        </group>
      ))}

      {/* Central Superconducting Accelerator Ring (Encircling Upper Throat) */}
      <group position={[0, 0.36, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.038, 20, 48]} />
          <meshStandardMaterial
            color={COLOR_TITANIUM}
            roughness={0.12}
            metalness={0.96}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.014, 16, 32]} />
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </mesh>
      </group>

      {/* Crystalline Quartz Viewport (Front Face exposing cutting throat) */}
      {/* Front Viewport Quartz Window (<RoundedBox radius={0.03}>) */}
      <RoundedBox
        args={[0.74, 0.46, 0.035]}
        radius={0.03}
        smoothness={4}
        position={[0, 0, 0.58]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.02}
          metalness={0.08}
          transparent
          opacity={0.35}
        />
      </RoundedBox>
      {/* Titanium Beveled Frame Clamping Front Viewport (4-piece hollow perimeter) */}
      <RoundedBox
        args={[0.82, 0.05, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0, 0.245, 0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.82, 0.05, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0, -0.245, 0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.05, 0.44, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[-0.385, 0, 0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.05, 0.44, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0.385, 0, 0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>

      {/* Rear Viewport Quartz Window (<RoundedBox radius={0.03}>) */}
      <RoundedBox
        args={[0.74, 0.46, 0.035]}
        radius={0.03}
        smoothness={4}
        position={[0, 0, -0.58]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.02}
          metalness={0.08}
          transparent
          opacity={0.35}
        />
      </RoundedBox>
      {/* Titanium Beveled Frame Clamping Rear Viewport (4-piece hollow perimeter) */}
      <RoundedBox
        args={[0.82, 0.05, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0, 0.245, -0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.82, 0.05, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0, -0.245, -0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.05, 0.44, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[-0.385, 0, -0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.05, 0.44, 0.025]}
        radius={0.008}
        smoothness={4}
        position={[0.385, 0, -0.595]}
      >
        <meshStandardMaterial
          color={COLOR_TITANIUM}
          roughness={0.15}
          metalness={0.95}
        />
      </RoundedBox>

      {/* Hex Fasteners on Viewport Clamps */}
      {[-0.38, 0.38].map((fx, i) =>
        [-0.24, 0.24].map((fy, j) => (
          <mesh
            key={`bolt_${i}_${j}`}
            position={[fx, fy, 0.61]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.014, 0.014, 0.02, 6]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.1}
              metalness={0.95}
            />
          </mesh>
        ))
      )}

      {/* Hyperbolic Infeed Hopper Throat with Recessed Blue LED Trim */}
      <group position={[0, 0.48, 0]}>
        {/* Sloped Guide Plates */}
        <mesh position={[0, 0.08, 0.44]} rotation={[0.38, 0, 0]}>
          <boxGeometry args={[1.04, 0.22, 0.025]} />
          <meshStandardMaterial
            color={COLOR_OBSIDIAN}
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.08, -0.44]} rotation={[-0.38, 0, 0]}>
          <boxGeometry args={[1.04, 0.22, 0.025]} />
          <meshStandardMaterial
            color={COLOR_OBSIDIAN}
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>
        {/* Recessed Glowing Cyan Throat Lip (4-Piece Hollow Perimeter Collar) */}
        {/* Front rim */}
        <RoundedBox
          args={[1.16, 0.04, 0.08]}
          radius={0.012}
          smoothness={4}
          position={[0, 0.18, 0.48]}
        >
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </RoundedBox>
        {/* Rear rim */}
        <RoundedBox
          args={[1.16, 0.04, 0.08]}
          radius={0.012}
          smoothness={4}
          position={[0, 0.18, -0.48]}
        >
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </RoundedBox>
        {/* Left rim */}
        <RoundedBox
          args={[0.08, 0.04, 0.88]}
          radius={0.012}
          smoothness={4}
          position={[-0.54, 0.18, 0]}
        >
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </RoundedBox>
        {/* Right rim */}
        <RoundedBox
          args={[0.08, 0.04, 0.88]}
          radius={0.012}
          smoothness={4}
          position={[0.54, 0.18, 0]}
        >
          <meshStandardMaterial
            color={COLOR_EMISSIVE}
            emissive={COLOR_EMISSIVE}
            emissiveIntensity={2.5}
          />
        </RoundedBox>
      </group>
    </group>
  ),
};

// ----------------------------------------------------------------------------
// MODULE 3: EMITTER ARRAY (Order 3, frame 60f)
// Quad magnetic pinch coils with glowing cryo conduits and high-voltage busbars.
// ----------------------------------------------------------------------------
export const ModuleEmitterArray: ModularPartSpec = {
  id: "tier4_emitter_array",
  name: "Quad Magnetic Pinch Coils & Cryo Busbar Array",
  assemblyOrder: 3,
  snapFrame: 60,
  entryDirection: "back",
  travelDistance: 3.4,
  travelDurationFrames: 5,
  targetSocket: [0, 1.45, -0.58],
  sparkColor: COLOR_TITANIUM,
  sparkCount: 18,
  fracture: {
    breakFrame: 265,
    mode: "fling_parabolic",
    impulse: [0.34, -0.22, 0.26],
    rotationImpulse: [1.8, 0.6, 2.2],
    sparkOrigin: [0.22, 1.45, -0.58],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isBroken }: ModularPartRenderProps) => {
    // Pulse animation for cryogenic energy conduits
    const pulse = 1.0 + Math.sin(localFrame * 0.3) * 0.25;

    return (
      <group position={[0, 0, 0]}>
        {/* Rear Mounting Sub-Chassis Block */}
        <RoundedBox
          args={[0.84, 0.64, 0.2]}
          radius={0.03}
          smoothness={4}
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial
            color={COLOR_OBSIDIAN}
            roughness={0.7}
            metalness={0.4}
          />
        </RoundedBox>

        {/* Quad Magnetic Pinch Coils (2x2 Matrix) */}
        {[
          [-0.24, 0.18],
          [0.24, 0.18],
          [-0.24, -0.18],
          [0.24, -0.18],
        ].map(([cx, cy], idx) => (
          <group key={idx} position={[cx, cy, 0.04]}>
            {/* Magnetic Coil Bobbin Flange */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.16, 24]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM}
                roughness={0.12}
                metalness={0.96}
              />
            </mesh>
            {/* Concentric Pinch Coil Windings (Gold/Brass) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.118, 0.118, 0.08, 24]} />
              <meshStandardMaterial
                color={COLOR_GOLD}
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>
            {/* Glowing Emissive Pinch Aperture Ring */}
            <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.075, 0.014, 16, 24]} />
              <meshStandardMaterial
                color={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                emissiveIntensity={2.5 * pulse}
              />
            </mesh>
            {/* High-Flux Magnetic Core Nozzle */}
            <mesh position={[0, 0, 0.09]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.045, 0.08, 16]} />
              <meshStandardMaterial
                color={COLOR_OBSIDIAN}
                roughness={0.4}
                metalness={0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Cryogenic Coolant Distribution Manifold */}
        <RoundedBox
          args={[0.52, 0.12, 0.14]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.28, -0.04]}
        >
          <meshStandardMaterial
            color={COLOR_OBSIDIAN}
            roughness={0.65}
            metalness={0.45}
          />
        </RoundedBox>

        {/* Pulsing Glowing Cryo Conduits feeding all 4 coils */}
        {[-0.18, 0, 0.18].map((px, i) => (
          <group key={i} position={[px, 0.06, 0.02]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.38, 16]} />
              <meshStandardMaterial
                color={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                emissiveIntensity={2.5 * pulse}
              />
            </mesh>
            {/* Conduit Union Nut */}
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.03, 6]} />
              <meshStandardMaterial
                color={COLOR_TITANIUM}
                roughness={0.12}
                metalness={0.96}
              />
            </mesh>
          </group>
        ))}

        {/* High-Voltage Distribution Busbars */}
        {[-0.34, 0.34].map((bx, idx) => (
          <group key={idx} position={[bx, 0, -0.16]}>
            {/* Heavy Polished Titanium Busbar Rail */}
            <RoundedBox
              args={[0.038, 0.58, 0.025]}
              radius={0.01}
              smoothness={4}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial
                color={COLOR_TITANIUM}
                roughness={0.1}
                metalness={0.98}
              />
            </RoundedBox>
            {/* Ceramic Standoff Insulators */}
            {[-0.2, 0, 0.2].map((iy, j) => (
              <mesh key={j} position={[0, iy, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.04, 16]} />
                <meshStandardMaterial
                  color={COLOR_OBSIDIAN}
                  roughness={0.9}
                  metalness={0.1}
                />
              </mesh>
            ))}
            {/* Gold Terminal Lug Connections */}
            <mesh position={[0, 0.26, 0]}>
              <boxGeometry args={[0.05, 0.04, 0.04]} />
              <meshStandardMaterial
                color={COLOR_GOLD}
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>
          </group>
        ))}
      </group>
    );
  },
};

// ----------------------------------------------------------------------------
// MODULE 4: PLASMA TOOLHEAD (Order 4, frame 75f)
// High-frequency counter-rotating plasma cutter rings with ionized cyan laser teeth.
// ----------------------------------------------------------------------------
export const ModulePlasmaToolhead: ModularPartSpec = {
  id: "tier4_plasma_toolhead",
  name: "Ionized Plasma Cutter Rings & Singularity Toolhead",
  assemblyOrder: 4,
  snapFrame: 75,
  entryDirection: "front",
  travelDistance: 3.2,
  travelDurationFrames: 5,
  targetSocket: [0, 1.45, 0],
  sparkColor: COLOR_EMISSIVE,
  sparkCount: 26,
  fracture: {
    breakFrame: 265,
    mode: "shear_and_tilt",
    impulse: [0.16, 0.12, -0.18],
    rotationImpulse: [1.2, 0.9, 0.5],
    sparkOrigin: [0, 1.45, 0],
    sparkColor: COLOR_EMISSIVE,
  },
  render: ({ localFrame, isRunning, rpm, isBroken }: ModularPartRenderProps) => {
    // Hyper-frequency cutter rotation
    const rotSpeed = rpm || 3600;
    const rot = isRunning
      ? (localFrame * rotSpeed * Math.PI) / 1800
      : localFrame * 0.15;

    const leftX = -0.24;
    const rightX = 0.24;
    const rings = 7;
    const spacing = 0.088;
    const teethPerRing = 6;

    // Singularity glow pulse
    const singPulse = 1.0 + Math.sin(localFrame * 0.4) * 0.35;

    return (
      <group position={[0, 0, 0]}>
        {/* Left Spindle Plasma Blades (Clockwise: -rot) */}
        <group position={[leftX, 0, 0]} rotation={[0, 0, -rot]}>
          {Array.from({ length: rings }).map((_, rIdx) => {
            const z = (rIdx - (rings - 1) / 2) * spacing;
            const angularOffset = (rIdx * Math.PI) / 6;

            return (
              <group
                key={`left_blade_ring_${rIdx}`}
                position={[0, 0, z]}
                rotation={[0, 0, angularOffset]}
              >
                {/* Monolithic Graphite Hub Disk */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.108, 0.108, 0.026, 32]} />
                  <meshStandardMaterial
                    color={COLOR_OBSIDIAN}
                    roughness={0.65}
                    metalness={0.5}
                  />
                </mesh>
                {/* Iridescent Titanium Ring Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.108, 0.008, 16, 32]} />
                  <meshStandardMaterial
                    color={COLOR_TITANIUM}
                    roughness={0.1}
                    metalness={0.96}
                  />
                </mesh>

                {/* 6 Radial Ionized Laser Cutter Teeth */}
                {Array.from({ length: teethPerRing }).map((_, tIdx) => {
                  const angle = (tIdx * 2 * Math.PI) / teethPerRing;
                  return (
                    <group key={`l_tooth_${tIdx}`} rotation={[0, 0, angle]}>
                      {/* Hardened Titanium Tooth Shank */}
                      <mesh position={[0.13, 0.016, 0]}>
                        <boxGeometry args={[0.076, 0.026, 0.02]} />
                        <meshStandardMaterial
                          color={COLOR_TITANIUM}
                          roughness={0.15}
                          metalness={0.95}
                        />
                      </mesh>

                      {/* Ionized Cyan Laser Tooth Wedge */}
                      <mesh
                        position={[0.185, 0.038, 0]}
                        rotation={[0, 0, -0.6]}
                      >
                        <coneGeometry args={[0.022, 0.065, 8]} />
                        <meshStandardMaterial
                          color={isBroken ? "#EF4444" : COLOR_WHITE}
                          emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                          emissiveIntensity={2.5}
                        />
                      </mesh>

                      {/* Laser Arc Cutting Edge Filament */}
                      <mesh position={[0.13, 0.027, 0]}>
                        <boxGeometry args={[0.064, 0.006, 0.022]} />
                        <meshStandardMaterial
                          color={isBroken ? "#EF4444" : COLOR_WHITE}
                          emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                          emissiveIntensity={2.5}
                        />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>

        {/* Right Spindle Plasma Blades (Counter-Clockwise: +rot) */}
        {/* Interleaved with Left Spindle along Z with half-pitch offset */}
        <group position={[rightX, 0, 0]} rotation={[0, 0, rot]}>
          {Array.from({ length: rings }).map((_, rIdx) => {
            const z = (rIdx - (rings - 1) / 2) * spacing + spacing * 0.5;
            if (z > 0.32 || z < -0.32) return null;
            const angularOffset = (rIdx * Math.PI) / 6 + Math.PI / 12;

            return (
              <group
                key={`right_blade_ring_${rIdx}`}
                position={[0, 0, z]}
                rotation={[0, 0, angularOffset]}
              >
                {/* Monolithic Graphite Hub Disk */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.108, 0.108, 0.026, 32]} />
                  <meshStandardMaterial
                    color={COLOR_OBSIDIAN}
                    roughness={0.65}
                    metalness={0.5}
                  />
                </mesh>
                {/* Iridescent Titanium Ring Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.108, 0.008, 16, 32]} />
                  <meshStandardMaterial
                    color={COLOR_TITANIUM}
                    roughness={0.1}
                    metalness={0.96}
                  />
                </mesh>

                {/* 6 Radial Ionized Laser Cutter Teeth */}
                {Array.from({ length: teethPerRing }).map((_, tIdx) => {
                  const angle = (tIdx * 2 * Math.PI) / teethPerRing;
                  return (
                    <group key={`r_tooth_${tIdx}`} rotation={[0, 0, angle]}>
                      <mesh position={[0.13, -0.016, 0]}>
                        <boxGeometry args={[0.076, 0.026, 0.02]} />
                        <meshStandardMaterial
                          color={COLOR_TITANIUM}
                          roughness={0.15}
                          metalness={0.95}
                        />
                      </mesh>

                      <mesh
                        position={[0.185, -0.038, 0]}
                        rotation={[0, 0, 0.6]}
                      >
                        <coneGeometry args={[0.022, 0.065, 8]} />
                        <meshStandardMaterial
                          color={isBroken ? "#EF4444" : COLOR_WHITE}
                          emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                          emissiveIntensity={2.5}
                        />
                      </mesh>

                      <mesh position={[0.13, -0.027, 0]}>
                        <boxGeometry args={[0.064, 0.006, 0.022]} />
                        <meshStandardMaterial
                          color={isBroken ? "#EF4444" : COLOR_WHITE}
                          emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
                          emissiveIntensity={2.5}
                        />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>

        {/* Central Quantum Plasma Singularity Vortex */}
        <group position={[0, 0, 0]}>
          {/* Core Singularity Geodesic Energy Sphere */}
          <mesh>
            <sphereGeometry args={[0.12 * singPulse, 32, 32]} />
            <meshStandardMaterial
              color={isBroken ? "#EF4444" : COLOR_WHITE}
              emissive={isBroken ? "#EF4444" : COLOR_EMISSIVE}
              emissiveIntensity={2.5}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Inner High-Speed Magnetic Containment Orbital Rings */}
          <mesh rotation={[localFrame * 0.18, localFrame * 0.12, 0]}>
            <torusGeometry args={[0.16, 0.008, 16, 32]} />
            <meshStandardMaterial
              color={COLOR_EMISSIVE}
              emissive={COLOR_EMISSIVE}
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh rotation={[0, localFrame * 0.22, localFrame * 0.15]}>
            <torusGeometry args={[0.19, 0.007, 16, 32]} />
            <meshStandardMaterial
              color={COLOR_TITANIUM}
              roughness={0.1}
              metalness={0.96}
            />
          </mesh>
        </group>
      </group>
    );
  },
};

// ============================================================================
// EXPORT CONTRACT SPECIFICATIONS
// ============================================================================

/**
 * Array of 5 modular part specifications enforcing Golden Inside-Out sequence.
 */
export const Tier4Spec: ModularPartSpec[] = [
  ModulePedestal,
  ModuleVortexCores,
  ModuleContainmentChamber,
  ModuleEmitterArray,
  ModulePlasmaToolhead,
];

/**
 * Complete Machine Assembly Specification for Tier 4 Shredder.
 */
export const Tier4AssemblySpec: MachineAssemblySpec = {
  id: "tier4_futuristic",
  name: "$100,000+ Quantum Singularity & Ionized Plasma Shredder",
  tier: 4,
  modules: Tier4Spec,
};

/**
 * Tier4_Futuristic Component Wrapper
 */
export interface Tier4FuturisticProps {
  localFrame?: number;
  isRunning?: boolean;
  rpm?: number;
  isBroken?: boolean;
}

export const Tier4_Futuristic: React.FC<Tier4FuturisticProps> = ({
  localFrame = 150,
  isRunning = true,
  rpm = 3600,
  isBroken = false,
}) => {
  return (
    <ProceduralAssemblyRig
      spec={Tier4AssemblySpec}
      localFrame={localFrame}
      isRunning={isRunning}
      rpm={rpm}
      isBroken={isBroken}
    />
  );
};

export default Tier4_Futuristic;
