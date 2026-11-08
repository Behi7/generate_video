import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

const DEFAULT_PARTICLE_COUNT = 140;

interface MoteConfig {
  baseX: number;
  baseY: number;
  baseZ: number;
  freqX: number;
  freqZ: number;
  phaseX: number;
  phaseZ: number;
  ampX: number;
  ampZ: number;
  updraft: number;
}

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 * Ensures 100% reproducible particle parameters across all renders.
 */
function createSeededRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pre-generate the 140 atmospheric dust motes inside the light cone bounds:
 * X: [-1.4, 1.4], Y: [0.1, 2.8], Z: [-1.4, 1.4]
 */
function generateMotes(count: number): MoteConfig[] {
  const rng = createSeededRNG(20261108);
  const motes: MoteConfig[] = [];

  for (let i = 0; i < count; i++) {
    // Keep base positions inside [-1.3, 1.3] so oscillation stays strictly in [-1.4, 1.4]
    const baseX = -1.3 + rng() * 2.6;
    const baseY = 0.1 + rng() * 2.7;
    const baseZ = -1.3 + rng() * 2.6;

    motes.push({
      baseX,
      baseY,
      baseZ,
      freqX: 0.012 + rng() * 0.016,
      freqZ: 0.014 + rng() * 0.016,
      phaseX: rng() * Math.PI * 2,
      phaseZ: rng() * Math.PI * 2,
      ampX: 0.04 + rng() * 0.06,
      ampZ: 0.04 + rng() * 0.06,
      updraft: 0.0012 + rng() * 0.0022,
    });
  }

  return motes;
}

export interface AtmosphericDustProps {
  /**
   * Number of drifting dust motes.
   * Default: 140 (as specified for the industrial studio light cone).
   */
  count?: number;
  /**
   * Subtle opacity catching the warehouse softbox lighting.
   * Range: 0.25 - 0.55. Default: 0.38.
   */
  opacity?: number;
  /**
   * Point particle size. Default: 0.045.
   */
  size?: number;
  /**
   * Dust reflection tint. Default: "#E2E8F0" (soft titanium/white).
   */
  color?: string;
}

/**
 * AtmosphericDust:
 * 140 Three.js Points drifting softly in the industrial studio light cone
 * (X: [-1.4, 1.4], Y: [0.1, 2.8], Z: [-1.4, 1.4]).
 *
 * Smooth periodic floating motion (sine/cosine oscillation based on useCurrentFrame()).
 * Uses a soft circular alpha point texture and catches warehouse softbox lighting
 * with subtle opacity (0.25 - 0.55).
 */
export const AtmosphericDust: React.FC<AtmosphericDustProps> = ({
  count = DEFAULT_PARTICLE_COUNT,
  opacity = 0.38,
  size = 0.045,
  color = "#E2E8F0",
}) => {
  const frame = useCurrentFrame();
  const geomRef = useRef<THREE.BufferGeometry>(null);

  // Generate deterministic motes once
  const motes = useMemo(() => generateMotes(count), [count]);

  // Create soft circular alpha point texture
  const dustTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.25, "rgba(255, 255, 255, 0.75)");
    grad.addColorStop(0.65, "rgba(255, 255, 255, 0.2)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Float32Array holding active positions
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  // Synchronously compute particle positions for the current frame
  for (let i = 0; i < count; i++) {
    const m = motes[i];
    // Gentle upward drift wrapping smoothly within Y: [0.1, 2.8]
    const ySpan = 2.7;
    const yRel = (m.baseY - 0.1 + frame * m.updraft) % ySpan;
    const y = 0.1 + (yRel < 0 ? yRel + ySpan : yRel);

    // Smooth periodic sine/cosine floating oscillation
    const x = m.baseX + Math.sin(frame * m.freqX + m.phaseX) * m.ampX;
    const z = m.baseZ + Math.cos(frame * m.freqZ + m.phaseZ) * m.ampZ;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  // Mark buffer attribute for WebGL upload if already mounted
  if (geomRef.current && geomRef.current.attributes.position) {
    geomRef.current.attributes.position.needsUpdate = true;
  }

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={dustTexture ?? undefined}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </points>
  );
};
