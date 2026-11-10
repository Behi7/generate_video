import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, Easing } from "remotion";

export interface AshDisintegrationProps {
  localFrame: number;
  breakFrame?: number; // default: 234
  endFrame?: number; // default: 308
  position?: [number, number, number];
  bedY?: number; // Platform floor level (default: 0.0)
  children?: React.ReactNode;
  particleCount?: number; // default: 650
  windDirection?: [number, number, number]; // Ascending plume direction [dx, dy, dz]
  intensity?: number;
}

interface EmberSeed {
  ox: number;
  oy: number;
  oz: number;
  birthOffset: number; // Frame offset during dissolution phase (256..290)
  upwardBuoyancy: number; // Thermal convection updraft
  turbulenceFreq: number;
  phaseOffset: number;
  terminalY: number; // Platform contact boundary (strictly >= bedY)
  windResistance: number;
  baseSize: number;
  emberTier: number; // 0: Superheated core, 1: Flame fragment, 2: Heavy charcoal flake
}

interface ThermalCrack {
  mid: [number, number, number];
  rot: [number, number, number];
  ignitionOffset: number;
  length: number;
}

// Canonical thermodynamic color milestones
const COLOR_AMBER = new THREE.Color("#F59E0B");
const COLOR_CRIMSON = new THREE.Color("#EF4444");
const COLOR_WHITE_HEAT = new THREE.Color("#FFF5EE");
const COLOR_ASH_GRAY = new THREE.Color("#4B5563");
const COLOR_CARBON_DARK = new THREE.Color("#1F2937");

/**
 * Thermodynamic State Evaluator:
 * Phase 1 (234..255): Heating from Cherry Crimson (#EF4444) to Blinding White Heat (#FFF5EE).
 * Phase 2 (256..290): Dissolution into Molten Crimson and Carbonizing Ash.
 * Phase 3 (290..305): Cooling to Ash Gray (#4B5563) and Dark Carbon (#1F2937).
 */
function getThermalState(
  frame: number,
  breakFrame: number,
  phase1End: number,
  phase2End: number
): { color: THREE.Color; emissiveIntensity: number } {
  if (frame < breakFrame) {
    return { color: COLOR_CRIMSON.clone(), emissiveIntensity: 0 };
  }

  // Phase 1 (234..255): Superheating
  if (frame <= phase1End) {
    const heatMid = breakFrame + Math.floor((phase1End - breakFrame) * 0.45); // ~244f
    if (frame <= heatMid) {
      // 234..244: Deep cherry crimson builds up
      const t = (frame - breakFrame) / Math.max(1, heatMid - breakFrame);
      const c = COLOR_CRIMSON.clone().lerp(new THREE.Color("#FF3B30"), t);
      return { color: c, emissiveIntensity: 3.5 + t * 4.5 };
    } else {
      // 244..255: Transition to blinding incandescent white heat
      const t = (frame - heatMid) / Math.max(1, phase1End - heatMid);
      const c = COLOR_CRIMSON.clone().lerp(COLOR_WHITE_HEAT, t);
      return { color: c, emissiveIntensity: 8.0 + t * 8.0 };
    }
  }

  // Phase 2 & 3 (256..305): Dissolution, cooling, and carbon slag transition
  const coolDuration = Math.max(1, phase2End - phase1End);
  const coolT = Math.min(1, (frame - phase1End) / coolDuration);

  if (coolT < 0.35) {
    // 256..268: White heat softens back into molten fiery crimson
    const subT = coolT / 0.35;
    const c = COLOR_WHITE_HEAT.clone().lerp(COLOR_CRIMSON, subT);
    return { color: c, emissiveIntensity: 16.0 * (1 - subT * 0.45) };
  } else if (coolT < 0.75) {
    // 268..282: Fiery crimson carbonizes into brittle ash gray
    const subT = (coolT - 0.35) / 0.4;
    const c = COLOR_CRIMSON.clone().lerp(COLOR_ASH_GRAY, subT);
    return { color: c, emissiveIntensity: 8.8 * (1 - subT * 0.7) };
  } else {
    // 282..290: Dark brittle carbon cinder
    const subT = (coolT - 0.75) / 0.25;
    const c = COLOR_ASH_GRAY.clone().lerp(COLOR_CARBON_DARK, subT);
    return { color: c, emissiveIntensity: 2.6 * (1 - subT) };
  }
}

// Pseudo-random deterministic generator for repeatable frame-exact rendering
function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Multi-octave divergence-free curl turbulence field for silky fluid stream flow
function calculateCurlStream(
  x: number,
  y: number,
  z: number,
  t: number,
  phase: number
): [number, number, number] {
  const f1 = 1.35;
  const f2 = 2.7;

  const vx1 = Math.sin(f1 * y + t * 0.15 + phase) * 0.022;
  const vx2 = Math.cos(f2 * z + t * 0.26) * 0.011;

  const vy1 = Math.sin(f1 * z + t * 0.17 + phase * 0.7) * 0.016;
  const vy2 = Math.cos(f2 * x + t * 0.22) * 0.009;

  const vz1 = Math.cos(f1 * y + t * 0.14 + phase * 1.3) * 0.022;
  const vz2 = Math.sin(f2 * x + t * 0.24) * 0.011;

  return [vx1 + vx2, vy1 + vy2, vz1 + vz2];
}

export const AshDisintegration: React.FC<AshDisintegrationProps> = ({
  localFrame,
  breakFrame = 234,
  endFrame = 308,
  position = [0, 0, 0],
  bedY = 0.0, // Platform floor level (canonical: 0.0 in stage local space)
  children,
  particleCount = 650,
  windDirection = [1.8, 2.6, 0.75], // Ascending vortex plume (up and sideways)
  intensity = 1.0,
}) => {
  // Post-transition: table is 100% clean, settled, and sterile (frames 308..319+)
  if (localFrame >= endFrame) {
    return null;
  }

  // Pre-break: intact machine operating normally
  if (localFrame < breakFrame) {
    return <group position={position}>{children}</group>;
  }

  // =========================================================================
  // MASTER TIMELINE MILESTONES (Exact Match with Creative Directive):
  // Phase 1 (Thermal Superheat): 234..255 (22 frames)
  // Phase 2 (Dissolution on the Bed): 256..290 (35 frames)
  // Phase 3 (Ascending Vortex Wind Uplift): 290..305 (15 frames)
  // Phase 4 (Clean Table): 308..319 (Completely sterile)
  // =========================================================================
  const phase1End = breakFrame + 21; // 255f
  const phase2End = breakFrame + 56; // 290f
  const windStart = 290;
  const windEnd = 305;

  // =========================================================================
  // 1. PHASE 1: THERMAL BLOOM & CRACK SPREAD (234..255)
  // =========================================================================
  const heatBloomProgress = interpolate(localFrame, [breakFrame, phase1End], [0, 1], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const thermalState = useMemo(() => {
    return getThermalState(localFrame, breakFrame, phase1End, phase2End);
  }, [localFrame, breakFrame, phase1End, phase2End]);

  // High-frequency thermal stress micro-shudder (stays locked strictly on table)
  const shudderProgress =
    heatBloomProgress *
    (1 -
      interpolate(localFrame, [phase1End, phase2End], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));
  const shudderX = Math.sin(localFrame * 52.0) * 0.012 * shudderProgress * intensity;
  const shudderZ = Math.cos(localFrame * 46.0) * 0.012 * shudderProgress * intensity;

  // 80 branching structural thermal fracture cracks across the machine
  const cracks: ThermalCrack[] = useMemo(() => {
    const list: ThermalCrack[] = [];
    const count = 80;
    const xAxis = new THREE.Vector3(1, 0, 0);

    for (let i = 0; i < count; i++) {
      const r1 = seededRand(i * 4 + 1);
      const r2 = seededRand(i * 4 + 2);
      const r3 = seededRand(i * 4 + 3);
      const r4 = seededRand(i * 4 + 4);

      // Distribute along machine columns, ram, and cylinder
      const theta = r1 * Math.PI * 2;
      const radius = 0.16 + r2 * 0.38;
      const x1 = Math.cos(theta) * radius;
      const y1 = bedY + 0.15 + r3 * 1.65;
      const z1 = Math.sin(theta) * radius;

      const branchAngle = theta + (r4 - 0.5) * 1.5;
      const branchLen = 0.1 + r2 * 0.22;
      const x2 = x1 + Math.cos(branchAngle) * branchLen;
      const y2 = y1 + (r1 - 0.45) * 0.22;
      const z2 = z1 + Math.sin(branchAngle) * branchLen;

      const midX = (x1 + x2) * 0.5;
      const midY = (y1 + y2) * 0.5;
      const midZ = (z1 + z2) * 0.5;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(xAxis, dir);
      const euler = new THREE.Euler().setFromQuaternion(quat);

      const ignitionOffset = Math.floor(r4 * 16); // Staggered ignition across 234..250
      list.push({
        mid: [midX, midY, midZ],
        rot: [euler.x, euler.y, euler.z],
        ignitionOffset,
        length: branchLen,
      });
    }
    return list;
  }, [bedY]);

  // =========================================================================
  // 2. PHASE 2: GEOMETRIC DISSOLUTION & CRUMBLE ON THE BED (256..290)
  // =========================================================================
  const dissolveProgress = interpolate(localFrame, [phase1End, phase2End], [0, 1], {
    easing: Easing.bezier(0.35, 0.0, 0.15, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Solid machine slumps and compresses down into the table bed without penetrating below bedY
  const meltScaleY = Math.max(0.001, Math.pow(1 - dissolveProgress, 1.55));
  const meltScaleXZ = Math.max(
    0.001,
    1 - dissolveProgress * 0.82 + Math.sin(dissolveProgress * Math.PI) * 0.12
  );
  // Solid mesh completely transitions into molten slag and particle embers by frame 282
  const showSolidMesh = localFrame < 282 && dissolveProgress < 0.98;

  // 650 pre-seeded ember and ash particles
  const emberSeeds: EmberSeed[] = useMemo(() => {
    const list: EmberSeed[] = [];
    for (let i = 0; i < particleCount; i++) {
      const r1 = seededRand(i * 5 + 1);
      const r2 = seededRand(i * 5 + 2);
      const r3 = seededRand(i * 5 + 3);
      const r4 = seededRand(i * 5 + 4);
      const r5 = seededRand(i * 5 + 5);

      const theta = r1 * Math.PI * 2;
      const radius = Math.sqrt(r2) * 0.55;
      const ox = Math.cos(theta) * radius;
      const oy = bedY + 0.1 + r3 * 1.75;
      const oz = Math.sin(theta) * radius;

      // Staggered birth over frames 256..280
      const birthOffset = Math.floor(r4 * (phase2End - phase1End - 8) + (1.8 - (oy - bedY)) * 1.1);
      const upwardBuoyancy = 0.028 + r5 * 0.052;
      const turbulenceFreq = 1.3 + r2 * 2.2;
      const phaseOffset = r1 * Math.PI * 2;
      // Clamped strictly >= bedY
      const terminalY = bedY + 0.006 + r4 * 0.035;
      const windResistance = 0.7 + r5 * 0.85;
      const baseSize = 0.036 + r3 * 0.046;
      const emberTier = r4 < 0.28 ? 0 : r4 < 0.72 ? 1 : 2;

      list.push({
        ox,
        oy,
        oz,
        birthOffset,
        upwardBuoyancy,
        turbulenceFreq,
        phaseOffset,
        terminalY,
        windResistance,
        baseSize,
        emberTier,
      });
    }
    return list;
  }, [particleCount, phase1End, phase2End, bedY]);

  // =========================================================================
  // 3. PHASE 3: ASCENDING VORTEX WIND UPLIFT & DISPERSAL (290..305)
  // =========================================================================
  const windT = interpolate(localFrame, [windStart, windEnd], [0, 1], {
    easing: Easing.bezier(0.2, 0.8, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dissolves opacity completely to 0.0 by frame 306-307
  const windAlphaFade = Math.max(0, 1 - Math.pow(windT, 1.25));

  // Compute all 650 particle positions, colors, and sizes deterministically
  const { positions, colors, sizes, activeParticleCount } = useMemo(() => {
    const posArr = new Float32Array(particleCount * 3);
    const colArr = new Float32Array(particleCount * 3);
    const sizeArr = new Float32Array(particleCount);

    let active = 0;

    for (let i = 0; i < emberSeeds.length; i++) {
      const s = emberSeeds[i];
      const birthFrame = phase1End + s.birthOffset;

      if (localFrame < birthFrame) {
        // Particle unborn
        posArr[i * 3] = s.ox;
        posArr[i * 3 + 1] = s.oy;
        posArr[i * 3 + 2] = s.oz;
        colArr[i * 3] = 0;
        colArr[i * 3 + 1] = 0;
        colArr[i * 3 + 2] = 0;
        sizeArr[i] = 0;
        continue;
      }

      const age = localFrame - birthFrame;
      active++;

      // 1. Initial thermal convection updraft
      const updraft = s.upwardBuoyancy * Math.exp(-age * 0.15) * 6.8;

      // 2. Damped gravity settling towards platform bed
      const gravity = 0.0022 * Math.pow(age, 1.4);

      // 3. 3D fluid stream vector field ("разливающимся как поток")
      const [curlX, curlY, curlZ] = calculateCurlStream(
        s.ox,
        s.oy,
        s.oz,
        age,
        s.phaseOffset
      );
      const swirlFactor = (1 + age * 0.035) * (1 - windT * 0.7);

      // 4. Vertical settling with strict floor bed clamp (Y >= bedY)
      let curY = s.oy + updraft - gravity + curlY * swirlFactor;
      let restingOnBed = false;
      if (curY <= s.terminalY) {
        curY = s.terminalY;
        restingOnBed = true;
      }

      // 5. Horizontal fluid pooling ripple when contacting the table bed
      const rippleSpread = restingOnBed ? Math.min(0.32, age * 0.01) : 0;
      let curX = s.ox + curlX * swirlFactor + Math.cos(s.phaseOffset) * rippleSpread;
      let curZ = s.oz + curlZ * swirlFactor + Math.sin(s.phaseOffset) * rippleSpread;

      // 6. Ascending vortex plume wind dispersal (frames 290..305)
      // Sweeps the ash UPWARD in a beautiful spiral draft and dissolves in air!
      if (localFrame >= windStart) {
        // Upward ascending lift
        const plumeLift = Math.pow(windT, 1.35) * (2.4 + s.windResistance * 1.8);
        const plumeSpiral = windT * (3.0 + s.turbulenceFreq * 0.4);
        const plumeRadius = (0.25 + s.ox * 0.4) * (1 + windT * 2.0);

        curX += Math.cos(s.phaseOffset + plumeSpiral) * plumeRadius + windDirection[0] * Math.pow(windT, 1.5) * 1.8;
        curY += plumeLift; // ASCENDING UPWARD! Never plunges into floor or walls!
        curZ += Math.sin(s.phaseOffset + plumeSpiral) * plumeRadius + windDirection[2] * Math.pow(windT, 1.5) * 1.2;
      }

      posArr[i * 3] = curX;
      posArr[i * 3 + 1] = curY;
      posArr[i * 3 + 2] = curZ;

      // =====================================================================
      // 4-Stage Particle Thermodynamic Cooling:
      // #FFF5EE (White-Hot) -> #EF4444 (Crimson) -> #4B5563 (Ash Gray) -> #1F2937 (Carbon)
      // =====================================================================
      const totalLifespan = Math.max(1, windEnd - birthFrame);
      const emberLife = Math.min(1, age / totalLifespan);
      let r = 1;
      let g = 1;
      let b = 1;

      if (emberLife < 0.22) {
        // Incandescent superheat core (#FFF5EE)
        r = 1.0;
        g = 0.96 - emberLife * 1.5;
        b = 0.93 - emberLife * 3.8;
      } else if (emberLife < 0.55) {
        // Molten crimson ember (#EF4444 -> #F97316)
        const t = (emberLife - 0.22) / 0.33;
        r = 1.0 - t * 0.05;
        g = 0.65 - t * 0.38;
        b = 0.02 + t * 0.22;
      } else if (emberLife < 0.82) {
        // Cooling charcoal ash draft (#4B5563)
        const t = (emberLife - 0.55) / 0.27;
        r = 0.95 - t * 0.66;
        g = 0.27 + t * 0.07;
        b = 0.24 + t * 0.15;
      } else {
        // Dark carbon cinder (#1F2937)
        const t = (emberLife - 0.82) / 0.18;
        r = 0.29 - t * 0.17;
        g = 0.34 - t * 0.19;
        b = 0.39 - t * 0.16;
      }

      colArr[i * 3] = r * windAlphaFade;
      colArr[i * 3 + 1] = g * windAlphaFade;
      colArr[i * 3 + 2] = b * windAlphaFade;

      const scaleFade = (1 - emberLife * 0.42) * windAlphaFade;
      sizeArr[i] = s.baseSize * scaleFade * intensity;
    }

    return {
      positions: posArr,
      colors: colArr,
      sizes: sizeArr,
      activeParticleCount: active,
    };
  }, [
    emberSeeds,
    particleCount,
    phase1End,
    localFrame,
    windStart,
    windEnd,
    windT,
    windAlphaFade,
    windDirection,
    intensity,
  ]);

  // Dynamic Radiant Thermal Light
  const dynamicLightIntensity = useMemo(() => {
    if (localFrame < breakFrame) return 0;
    if (localFrame <= phase1End) {
      // Surges to blinding heat
      return interpolate(localFrame, [breakFrame, phase1End], [0, 16.0], {
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      });
    }
    if (localFrame <= phase2End) {
      // Warm lingering radiant heat
      return interpolate(localFrame, [phase1End, phase2End], [16.0, 3.8], {
        easing: Easing.linear,
      });
    }
    // Fades to 0 as wind sweeps ash upward and cools
    return interpolate(localFrame, [phase2End, windEnd], [3.8, 0], {
      easing: Easing.out(Easing.quad),
    });
  }, [localFrame, breakFrame, phase1End, phase2End, windEnd]);

  // Molten Slag Core scale on the floor
  const moltenCoreScale = interpolate(
    localFrame,
    [breakFrame + 8, phase1End, phase2End + 4],
    [0, 1.35, 0],
    {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Convection heat shimmer wave
  const waveProgress = interpolate(localFrame, [breakFrame + 3, breakFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waveY = bedY + waveProgress * 3.2;
  const waveScale = 0.35 + waveProgress * 2.2;
  const waveOpacity = Math.sin(waveProgress * Math.PI) * 0.65 * (1 - dissolveProgress);

  return (
    <group position={position}>
      {/* 1. DYNAMIC RADIANT THERMAL LIGHT */}
      {dynamicLightIntensity > 0.05 && (
        <pointLight
          position={[0, bedY + 0.85, 0]}
          color={thermalState.color}
          intensity={dynamicLightIntensity * intensity}
          distance={8.5}
          decay={1.8}
        />
      )}

      {/* 2. CONVECTION HEAT SHIMMER WAVE */}
      {waveOpacity > 0.01 && (
        <mesh
          position={[0, waveY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[waveScale, waveScale, 1]}
        >
          <ringGeometry args={[0.25, 0.38, 36]} />
          <meshBasicMaterial
            color="#FF8800"
            transparent
            opacity={waveOpacity}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. SOLID GEOMETRY WITH THERMAL JITTER & BASE-CLAMPED MELT */}
      {showSolidMesh && (
        <group position={[shudderX, bedY, shudderZ]}>
          {/* Melt scale anchored strictly at Y = bedY so geometry NEVER plunges below bedY */}
          <group scale={[meltScaleXZ, meltScaleY, meltScaleXZ]}>
            <group position={[0, -bedY, 0]}>{children}</group>
          </group>

          {/* Superheated Volumetric Corona Sheath */}
          {heatBloomProgress > 0.02 && (
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.65, 0.75, 1.9, 20]} />
              <meshBasicMaterial
                color={thermalState.color}
                transparent
                opacity={heatBloomProgress * 0.48 * (1 - dissolveProgress)}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* 80 Glowing Thermal Stress Fracture Veins with 3D Orientation */}
          {heatBloomProgress > 0.05 && (
            <group>
              {cracks.map((crack, idx) => {
                const crackIgnited = localFrame >= breakFrame + crack.ignitionOffset;
                if (!crackIgnited) return null;

                const crackT = interpolate(
                  localFrame,
                  [breakFrame + crack.ignitionOffset, breakFrame + crack.ignitionOffset + 8],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                );
                const crackOpacity = crackT * (1 - dissolveProgress);

                return (
                  <mesh
                    key={idx}
                    position={crack.mid}
                    rotation={crack.rot}
                    scale={[crackT, crackT, crackT]}
                  >
                    <boxGeometry args={[crack.length, 0.015, 0.015]} />
                    <meshBasicMaterial
                      color={thermalState.color}
                      transparent
                      opacity={crackOpacity * 0.95}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                    />
                  </mesh>
                );
              })}
            </group>
          )}
        </group>
      )}

      {/* 4. MOLTEN SLAG CORE & SCORCH MARK AT FLOOR BED (STRICTLY UPPER HEMISPHERE Y >= bedY) */}
      {moltenCoreScale > 0.01 && (
        <group position={[0, bedY + 0.002, 0]}>
          {/* Upper Hemisphere Dome Only: phiLength = PI/2, so ZERO volume below bedY */}
          <mesh
            scale={[moltenCoreScale * 0.72, moltenCoreScale * 0.28, moltenCoreScale * 0.72]}
          >
            <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#FF2200"
              emissive={thermalState.color}
              emissiveIntensity={thermalState.emissiveIntensity}
              roughness={0.2}
              metalness={0.08}
            />
          </mesh>

          {/* Incandescent Ground Heat Bloom Ring Flush on Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[moltenCoreScale * 0.85, 36]} />
            <meshBasicMaterial
              color="#FF5500"
              transparent
              opacity={moltenCoreScale * 0.65 * windAlphaFade}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* 5. 650+ DETERMINISTIC STREAMING ASH & GLOWING EMBER PARTICLES */}
      {activeParticleCount > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleCount}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
};
