/**
 * TransitionRegistry: Master registry and deterministic sequencing for Tier Cleanser Transitions.
 * Defines the 4 modular transition effect types that seamlessly scrub destroyed mechanisms
 * off the stage, leaving a pristine platform for the next machine tier.
 *
 * In the 320-frame framework:
 * - 213..224 (12f): Organic strain & RPM deceleration with exponential torque bog-down and heat/shudder build-up.
 * - 225..233 (9f): Resonant pre-fracture shudder wave (increasing frequency & amplitude).
 * - 234..307 (74f): Fracture rupture at frame 234 & active Cleanser Transition Effect.
 * - 308..319 (12f): Stage settled, clean table, calm anticipation before next tier assembly.
 */

export type TransitionEffectType =
  | "ash_disintegration"
  | "laser_scan_cleanser"
  | "pneumatic_air_blast"
  | "black_hole_singularity";

// Backwards-compatible alias for any legacy imports
export type LegacyTransitionEffectType = TransitionEffectType | "stage_drop_trap" | "laser_scan" | "none";

export const ALL_TRANSITION_EFFECTS: readonly TransitionEffectType[] = [
  "ash_disintegration",
  "laser_scan_cleanser",
  "pneumatic_air_blast",
  "black_hole_singularity",
] as const;

export interface TransitionMetadata {
  id: TransitionEffectType;
  title: string;
  description: string;
  durationFrames: number;
  breakFrameDefault: number;
  endFrameDefault: number;
  primaryColor: string;
  secondaryColor: string;
}

export const TRANSITION_REGISTRY: Record<TransitionEffectType, TransitionMetadata> = {
  ash_disintegration: {
    id: "ash_disintegration",
    title: "Thermal Ash Disintegration",
    description:
      "Superheats the machine core into blinding molten incandescence, dissolves the frame into floating ember ash, and blows it away in a fluid wind stream.",
    durationFrames: 74,
    breakFrameDefault: 234,
    endFrameDefault: 308,
    primaryColor: "#F59E0B",
    secondaryColor: "#EF4444",
  },
  laser_scan_cleanser: {
    id: "laser_scan_cleanser",
    title: "Cryo-Neon Laser Scan Cleanser",
    description:
      "A razor-sharp planar neon cyan laser sweeps across the stage, vaporizing metal on contact with plasma spark cascades and leaving a sterile mirror surface.",
    durationFrames: 74,
    breakFrameDefault: 234,
    endFrameDefault: 308,
    primaryColor: "#00F5FF",
    secondaryColor: "#38BDF8",
  },
  pneumatic_air_blast: {
    id: "pneumatic_air_blast",
    title: "Pneumatic Radial Air Blast",
    description:
      "High-pressure industrial pneumatic ring discharge that ejects fragmented parts off-screen with atmospheric vapor shock rings.",
    durationFrames: 74,
    breakFrameDefault: 234,
    endFrameDefault: 308,
    primaryColor: "#E2E8F0",
    secondaryColor: "#94A3B8",
  },
  black_hole_singularity: {
    id: "black_hole_singularity",
    title: "Gravitational Black Hole Singularity",
    description:
      "A localized gravitational singularity forms in mid-air, ripping broken machine parts into an incandescent spinning accretion vortex and collapsing into a silent quantum flash.",
    durationFrames: 74,
    breakFrameDefault: 234,
    endFrameDefault: 308,
    primaryColor: "#A855F7",
    secondaryColor: "#06B6D4",
  },
};

/**
 * Deterministic PRNG seeded by string (FNV-1a hash + Mulberry32).
 */
function createDeterministicPrng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Implement deterministic seeded shuffle without repeats:
 * Returns 3 distinct transition effects for Tiers 1->2, 2->3, 3->4.
 * (Tier 4 has its own ultimate boss collapse/singularity).
 */
export function getProjectTransitions(seed: string): TransitionEffectType[] {
  const prng = createDeterministicPrng(seed);
  const pool = [...ALL_TRANSITION_EFFECTS];

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  // Return the first 3 distinct effects (guaranteed no repeats across tiers 1..3)
  return pool.slice(0, 3);
}

/**
 * Returns the deterministic transition effect for a specific tier.
 * Tiers 1, 2, 3 receive distinct effects from the seeded shuffle.
 * Tier 4 defaults to the 4th effect or fallback if invoked directly.
 */
export function getTierTransition(seed: string, tier: number): TransitionEffectType {
  const transitions = getProjectTransitions(seed);
  const clampedTier = Math.max(1, Math.min(tier, 4));

  if (clampedTier <= 3) {
    return transitions[clampedTier - 1];
  }

  // Tier 4: return the remaining 4th effect from the pool
  const allPool = [...ALL_TRANSITION_EFFECTS];
  const used = new Set(transitions);
  const remaining = allPool.find((eff) => !used.has(eff));
  return remaining ?? transitions[0];
}

/**
 * Backward compatibility alias for earlier code.
 */
export function getTierTransitionType(tier: 1 | 2 | 3 | 4, seed = "canonical_stage_seed"): TransitionEffectType {
  return getTierTransition(seed, tier);
}
