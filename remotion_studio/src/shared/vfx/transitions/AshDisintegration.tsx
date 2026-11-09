import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, Easing } from "remotion";

export interface AshDisintegrationProps {
  localFrame: number;
  breakFrame?: number; // default: 234
  endFrame?: number;   // default: 308
  position?: [number, number, number];
  bedY?: number; // Platform floor level (canonical: -2.04)
  children?: React.ReactNode;
  particleCount?: number;
  windDirection?: [number, number, number];
  intensity?: number;
}

interface EmberSeed {
  // Birth coordinate in mechanism volume
  ox: number;
  oy: number;
  oz: number;
  birthOffset: number; // 0..14 frames relative to dissolve start
  upwardBuoyancy: number; // Initial thermal updraft impulse
  turbulenceFreq: number;
  phaseOffset: number;
  terminalY: number; // Ground contact height (clamped >= bedY)
  windResistance: number; // Mass/aerodynamic drag variation
  baseSize: number;
  emberTier: number; // 0: Superheated core, 1: Flame fragment, 2: Heavy charcoal slag
}

interface ThermalCrack {
  mid: [number, number, number];
  rot: [number, number, number];
  ignitionOffset: number; // Frame offset when crack ignites
  length: number;
}

// Canonical 4-stage thermal colors
const COLOR_AMBER = new THREE.Color("#F59E0B");
const COLOR_CRIMSON = new THREE.Color("#EF4444");
const COLOR_WHITE_HEAT = new THREE.Color("#FFF5EE");
const COLOR_ASH_GRAY = new THREE.Color("#4B5563");
const COLOR_CARBON_DARK = new THREE.Color("#1F2937");

// Evaluates the canonical 4-stage lifecycle:
// #F59E0B (Amber) -> #EF4444 (Crimson) -> #FFF5EE (Incandescent White) -> #4B5563 (Ash Gray) -> #1F2937
function getThermalState(
  frame: number,
  breakFrame: number,
  phase1End: number,
  phase2End: number
): { color: THREE.Color; emissiveIntensity: number } {
  if (frame < breakFrame) {
    return { color: COLOR_AMBER.clone(), emissiveIntensity: 0 };
  }

  const heatMid = breakFrame + Math.floor((phase1End - breakFrame) * 0.45); // e.g. 282

  if (frame <= heatMid) {
    // Stage 1: #F59E0B (Amber) -> #EF4444 (Crimson)
    const t = (frame - breakFrame) / Math.max(1, heatMid - breakFrame);
    const c = COLOR_AMBER.clone().lerp(COLOR_CRIMSON, t);
    return { color: c, emissiveIntensity: 2.0 + t * 4.5 };
  } else if (frame <= phase1End) {
    // Stage 2: #EF4444 (Crimson) -> #FFF5EE (Incandescent White)
    const t = (frame - heatMid) / Math.max(1, phase1End - heatMid);
    const c = COLOR_CRIMSON.clone().lerp(COLOR_WHITE_HEAT, t);
    return { color: c, emissiveIntensity: 6.5 + t * 6.5 };
  } else {
    // Stage 3 & 4: Cooling down during dissolution into brittle carbon slag
    // #FFF5EE -> #EF4444 -> #4B5563 (Ash Gray) -> #1F2937 (Carbon Dark)
    const coolDuration = Math.max(1, phase2End - phase1End);
    const coolT = Math.min(1, (frame - phase1End) / coolDuration);

    if (coolT < 0.35) {
      const subT = coolT / 0.35;
      const c = COLOR_WHITE_HEAT.clone().lerp(COLOR_CRIMSON, subT);
      return { color: c, emissiveIntensity: 13.0 * (1 - subT * 0.5) };
    } else if (coolT < 0.75) {
      const subT = (coolT - 0.35) / 0.4;
      const c = COLOR_CRIMSON.clone().lerp(COLOR_ASH_GRAY, subT);
      return { color: c, emissiveIntensity: 6.5 * (1 - subT * 0.7) };
    } else {
      const subT = (coolT - 0.75) / 0.25;
      const c = COLOR_ASH_GRAY.clone().lerp(COLOR_CARBON_DARK, subT);
      return { color: c, emissiveIntensity: 1.95 * (1 - subT) };
    }
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
  const f1 = 1.4;
  const f2 = 2.8;

  const vx1 = Math.sin(f1 * y + t * 0.16 + phase) * 0.024;
  const vx2 = Math.cos(f2 * z + t * 0.28) * 0.012;

  const vy1 = Math.sin(f1 * z + t * 0.18 + phase * 0.7) * 0.018;
  const vy2 = Math.cos(f2 * x + t * 0.24) * 0.01;

  const vz1 = Math.cos(f1 * y + t * 0.15 + phase * 1.3) * 0.024;
  const vz2 = Math.sin(f2 * x + t * 0.26) * 0.012;

  return [vx1 + vx2, vy1 + vy2, vz1 + vz2];
}

export const AshDisintegration: React.FC<AshDisintegrationProps> = ({
  localFrame,
  breakFrame = 234,
  endFrame = 308,
  position = [0, 0, 0],
  bedY = -2.04, // Default set to platform floor level
  children,
  particleCount = 520,
  windDirection = [2.6, 0.16, 0.35],
  intensity = 1.0,
}) => {
  // Beyond endFrame: platform is completely sterile and immaculate (308..319+)
  if (localFrame >= endFrame) {
    return null;
  }

  // Pre-break: pristine machine operating normally
  if (localFrame < breakFrame) {
    return <group position={position}>{children}</group>;
  }

  // Master phase timing landmarks (74 frames total: 234..308)
  const totalFrames = Math.max(1, endFrame - breakFrame);
  // Phase 1 (Thermal Superheat & Veins): 234..255 (22f / 0.73s)
  const phase1End = breakFrame + Math.round(totalFrames * 0.30);
  // Phase 2 (Dissolution & Fluid Ember Stream): 256..292 (37f / 1.23s)
  const phase2End = breakFrame + Math.round(totalFrames * 0.79);
  // Phase 3 (Atmospheric Wind Dispersal): 293..307 (15f / 0.50s)
  const windStart = phase2End;

  // =========================================================================
  // 1. PHASE 1: THERMAL BLOOM & CRACK SPREAD (275..290)
  // =========================================================================
  const heatBloomProgress = interpolate(localFrame, [breakFrame, phase1End], [0, 1], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Evaluate 4-stage thermal color lifecycle
  const thermalState = useMemo(() => {
    return getThermalState(localFrame, breakFrame, phase1End, phase2End);
  }, [localFrame, breakFrame, phase1End, phase2End]);

  // High-frequency thermal stress micro-shudder
  const shudderProgress =
    heatBloomProgress *
    (1 -
      interpolate(localFrame, [phase1End, phase2End], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));
  const shudderX = Math.sin(localFrame * 48.0) * 0.016 * shudderProgress * intensity;
  const shudderZ = Math.sin(localFrame * 42.0 + 1.5) * 0.015 * shudderProgress * intensity;

  // Precompute 38 thermal stress cracks with exact 3D orientation vector
  const cracks: ThermalCrack[] = useMemo(() => {
    const list: ThermalCrack[] = [];
    const count = 38;
    const xAxis = new THREE.Vector3(1, 0, 0);

    for (let i = 0; i < count; i++) {
      const r1 = seededRand(i * 4 + 1);
      const r2 = seededRand(i * 4 + 2);
      const r3 = seededRand(i * 4 + 3);
      const r4 = seededRand(i * 4 + 4);

      // Distribute cracks over machine body (Y relative to bedY)
      const theta = r1 * Math.PI * 2;
      const radius = 0.18 + r2 * 0.36;
      const x1 = Math.cos(theta) * radius;
      const y1 = bedY + 0.25 + r3 * 1.45;
      const z1 = Math.sin(theta) * radius;

      // Crack segment runs along structural stress vectors
      const branchAngle = theta + (r4 - 0.5) * 1.6;
      const branchLen = 0.12 + r2 * 0.22;
      const x2 = x1 + Math.cos(branchAngle) * branchLen;
      const y2 = y1 + (r1 - 0.45) * 0.24;
      const z2 = z1 + Math.sin(branchAngle) * branchLen;

      const midX = (x1 + x2) * 0.5;
      const midY = (y1 + y2) * 0.5;
      const midZ = (z1 + z2) * 0.5;

      // Calculate rotation quaternion from (1,0,0) to crack direction vector (p2 - p1)
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(xAxis, dir);
      const euler = new THREE.Euler().setFromQuaternion(quat);

      const ignitionOffset = Math.floor(r4 * 10);
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
  // 2. PHASE 2: GEOMETRIC DISSOLUTION & STREAMING ASH EMBERS (290..305)
  // =========================================================================
  const dissolveProgress = interpolate(localFrame, [phase1End, phase2End], [0, 1], {
    easing: Easing.bezier(0.35, 0.0, 0.15, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Solid machine slumps and melts down towards bedY without EVER penetrating below bedY
  const meltScaleY = Math.max(0.001, Math.pow(1 - dissolveProgress, 1.4));
  const meltScaleXZ = Math.max(
    0.001,
    1 - dissolveProgress * 0.88 + Math.sin(dissolveProgress * Math.PI) * 0.12
  );
  const showSolidMesh = dissolveProgress < 0.99;

  // Pre-seeded ember particles
  const emberSeeds: EmberSeed[] = useMemo(() => {
    const list: EmberSeed[] = [];
    for (let i = 0; i < particleCount; i++) {
      const r1 = seededRand(i * 5 + 1);
      const r2 = seededRand(i * 5 + 2);
      const r3 = seededRand(i * 5 + 3);
      const r4 = seededRand(i * 5 + 4);
      const r5 = seededRand(i * 5 + 5);

      const theta = r1 * Math.PI * 2;
      const radius = Math.sqrt(r2) * 0.58;
      const ox = Math.cos(theta) * radius;
      const oy = bedY + 0.1 + r3 * 1.75;
      const oz = Math.sin(theta) * radius;

      const birthOffset = Math.floor(r4 * (phase2End - phase1End) + (1.8 - (oy - bedY)) * 1.2);
      const upwardBuoyancy = 0.032 + r5 * 0.055;
      const turbulenceFreq = 1.2 + r2 * 2.4;
      const phaseOffset = r1 * Math.PI * 2;
      // Clamped strictly >= bedY
      const terminalY = bedY + 0.006 + r4 * 0.035;
      const windResistance = 0.65 + r5 * 0.9;
      const baseSize = 0.038 + r3 * 0.048;
      const emberTier = r4 < 0.25 ? 0 : r4 < 0.72 ? 1 : 2;

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
  // 3. PHASE 3: HORIZONTAL WIND DISPERSAL ACROSS FLOOR BED (305..315)
  // =========================================================================
  const windProgress = interpolate(localFrame, [windStart, endFrame], [0, 1], {
    easing: Easing.bezier(0.18, 0.85, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const windAlphaFade = Math.max(0, 1 - windProgress * 1.12);

  // Compute all 520+ particle positions, colors, and sizes deterministically
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

      // 1. Convection updraft (exponential decay over time)
      const updraft = s.upwardBuoyancy * Math.exp(-age * 0.16) * 7.5;

      // 2. Damped gravity settling towards platform bed
      const gravity = 0.0024 * Math.pow(age, 1.42);

      // 3. 3D fluid stream vector field ("разливающимся как поток")
      const [curlX, curlY, curlZ] = calculateCurlStream(
        s.ox,
        s.oy,
        s.oz,
        age,
        s.phaseOffset
      );
      const swirlFactor = (1 + age * 0.04) * (1 - windProgress * 0.75);

      // 4. Vertical settling with strict floor bed clamp (Y >= bedY)
      let curY = s.oy + updraft - gravity + curlY * swirlFactor;
      let restingOnBed = false;
      if (curY <= s.terminalY) {
        curY = s.terminalY;
        restingOnBed = true;
      }

      // 5. Horizontal fluid pooling ripple when contacting the platform bed
      const rippleSpread = restingOnBed ? Math.min(0.35, age * 0.012) : 0;
      let curX = s.ox + curlX * swirlFactor + Math.cos(s.phaseOffset) * rippleSpread;
      let curZ = s.oz + curlZ * swirlFactor + Math.sin(s.phaseOffset) * rippleSpread;

      // 6. Atmospheric wind draft across the floor bed ($Y >= bedY)
      if (localFrame >= windStart) {
        const gustForce = Math.pow(windProgress, 1.55) * s.windResistance;
        curX += windDirection[0] * gustForce * 3.6;
        // Aerodynamic vortex lift peeling embers up from the floor (always upward >= 0)
        curY += Math.sin(windProgress * Math.PI) * 0.18 * s.windResistance;
        curZ += windDirection[2] * gustForce * 3.6 + Math.sin(s.phaseOffset + windProgress * 4.0) * 0.28 * windProgress;
      }

      posArr[i * 3] = curX;
      posArr[i * 3 + 1] = curY;
      posArr[i * 3 + 2] = curZ;

      // =====================================================================
      // 4-Stage Particle Color Evolution:
      // #FFF5EE (White-Hot) -> #EF4444 (Crimson) -> #4B5563 (Ash Gray) -> #1F2937 (Carbon)
      // =====================================================================
      const emberLife = Math.min(1, age / Math.max(1, totalFrames * 0.65));
      let r = 1;
      let g = 1;
      let b = 1;

      if (emberLife < 0.2) {
        // Incandescent superheat core (#FFF5EE)
        r = 1.0;
        g = 0.96 - emberLife * 1.5;
        b = 0.93 - emberLife * 3.8;
      } else if (emberLife < 0.55) {
        // Molten crimson ember (#EF4444)
        const t = (emberLife - 0.2) / 0.35;
        r = 1.0 - t * 0.06;
        g = 0.66 - t * 0.39;
        b = 0.02 + t * 0.24;
      } else if (emberLife < 0.85) {
        // Cooling charcoal ash draft (#4B5563)
        const t = (emberLife - 0.55) / 0.3;
        r = 0.94 - t * 0.65;
        g = 0.27 + t * 0.06;
        b = 0.26 + t * 0.13;
      } else {
        // Dark carbon slag (#1F2937)
        const t = (emberLife - 0.85) / 0.15;
        r = 0.29 - t * 0.17;
        g = 0.33 - t * 0.17;
        b = 0.39 - t * 0.17;
      }

      colArr[i * 3] = r * windAlphaFade;
      colArr[i * 3 + 1] = g * windAlphaFade;
      colArr[i * 3 + 2] = b * windAlphaFade;

      const scaleFade = (1 - emberLife * 0.45) * windAlphaFade;
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
    endFrame,
    totalFrames,
    windProgress,
    windAlphaFade,
    windDirection,
    intensity,
  ]);

  // Dynamic Radiant Thermal Light
  const dynamicLightIntensity = useMemo(() => {
    if (localFrame < breakFrame) return 0;
    if (localFrame <= phase1End) {
      return interpolate(localFrame, [breakFrame, phase1End], [0, 14.0], {
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      });
    }
    if (localFrame <= phase2End) {
      return interpolate(localFrame, [phase1End, phase2End], [14.0, 3.5], {
        easing: Easing.linear,
      });
    }
    return interpolate(localFrame, [phase2End, endFrame], [3.5, 0], {
      easing: Easing.out(Easing.quad),
    });
  }, [localFrame, breakFrame, phase1End, phase2End, endFrame]);

  // Molten Slag Core scale on the floor
  const moltenCoreScale = interpolate(
    localFrame,
    [breakFrame + 5, phase1End, phase2End],
    [0, 1.35, 0],
    {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Heat convection ripple wave
  const waveProgress = interpolate(localFrame, [breakFrame + 4, breakFrame + 28], [0, 1], {
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
          position={[0, bedY + 0.8, 0]}
          color={thermalState.color}
          intensity={dynamicLightIntensity * intensity}
          distance={8.0}
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
                opacity={heatBloomProgress * 0.45 * (1 - dissolveProgress)}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Glowing Thermal Stress Fracture Veins with 3D Orientation */}
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

      {/* 5. 520+ DETERMINISTIC STREAMING ASH & GLOWING EMBER PARTICLES */}
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
