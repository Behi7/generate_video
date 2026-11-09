/**
 * StageTimeline: Mathematical backbone for the 42.67s (1280 frames @ 30 FPS) Conveyor.
 * Every tier receives exactly 320 frames (~10.67s) divided into 4 distinct human-readable acts,
 * with a fluid, organic transition from operation (Act 3) to destruction & cleansing (Act 4).
 * Transitions flow smoothly like a stream ("разливающимся как поток").
 */

export const TIER_DURATION_FRAMES = 320;
export const TOTAL_DURATION_FRAMES = 1280; // 42.6667s @ 30 FPS

// Canonical 4-Act frame offsets inside each 320-frame tier (Zero overlapping or off-by-one gaps)
// Local frames: [0..319] (Total = 320 frames)
export const ACT_RANGES = {
  assembly: { start: 0, end: 62, duration: 63 }, // 2.10s (0..62): Staggered 4-module assembly
  startup: { start: 63, end: 122, duration: 60 }, // 2.00s (63..122): Individual startup chain reaction
  operating: { start: 123, end: 212, duration: 90 }, // 3.00s (123..212): Hypnotic steady-state ASMR strikes
  destruction: { start: 213, end: 319, duration: 107 }, // 3.57s (213..319): Fluid 4-stage escalation & cleansing
} as const;

/**
 * Fluid 4-stage escalation breakdown during destruction (Frames 213..319, 107 frames total):
 * 1. strain: 213..224 (12f) - Organic strain & RPM deceleration with exponential torque bog-down and heat/shudder build-up.
 * 2. resonance: 225..233 (9f) - Resonant pre-fracture shudder wave (increasing frequency & amplitude).
 * 3. ruptureAndCleanser: 234..307 (74f, 2.47s) - Fracture rupture at 234 & active Cleanser Transition Effect.
 * 4. settled: 308..319 (12f, 0.40s) - Stage settled, clean table, calm anticipation before next tier assembly.
 */
export const DESTRUCTION_PHASES = {
  strain: { start: 213, end: 224, duration: 12 },
  resonance: { start: 225, end: 233, duration: 9 },
  ruptureAndCleanser: { start: 234, end: 307, duration: 74 },
  settled: { start: 308, end: 319, duration: 12 },
} as const;

export type TierAct = "assembly" | "startup" | "operating" | "destruction";
export type DestructionSubPhase = "strain" | "resonance" | "ruptureAndCleanser" | "settled";

/**
 * Returns current global tier (1..4) for a given frame.
 */
export function getCurrentTier(frame: number): 1 | 2 | 3 | 4 {
  if (frame < TIER_DURATION_FRAMES) return 1;
  if (frame < TIER_DURATION_FRAMES * 2) return 2;
  if (frame < TIER_DURATION_FRAMES * 3) return 3;
  return 4;
}

/**
 * Returns the local frame (0..319) within the current tier.
 */
export function getTierLocalFrame(frame: number): number {
  return Math.min(Math.max(0, frame % TIER_DURATION_FRAMES), TIER_DURATION_FRAMES - 1);
}

/**
 * Returns which of the 4 acts the current tier is currently executing.
 */
export function getTierAct(frame: number): TierAct {
  const local = getTierLocalFrame(frame);
  if (local <= ACT_RANGES.assembly.end) return "assembly";
  if (local <= ACT_RANGES.startup.end) return "startup";
  if (local <= ACT_RANGES.operating.end) return "operating";
  return "destruction";
}

/**
 * Returns normalized progress (0..1) within the current act.
 */
export function getActProgress(frame: number): { act: TierAct; progress: number } {
  const local = getTierLocalFrame(frame);
  const act = getTierAct(frame);
  const range = ACT_RANGES[act];
  const progress = Math.min(Math.max(0, (local - range.start) / (range.end - range.start)), 1);
  return { act, progress };
}

/**
 * Returns the active destruction sub-phase or null if before frame 213.
 */
export function getDestructionSubPhase(localFrame: number): DestructionSubPhase | null {
  if (localFrame < DESTRUCTION_PHASES.strain.start) return null;
  if (localFrame <= DESTRUCTION_PHASES.strain.end) return "strain";
  if (localFrame <= DESTRUCTION_PHASES.resonance.end) return "resonance";
  if (localFrame <= DESTRUCTION_PHASES.ruptureAndCleanser.end) return "ruptureAndCleanser";
  return "settled";
}

/**
 * Calculates organic strain progress (0..1) during frames 213..224.
 * Models exponential mechanical torque bog-down and heat/shudder build-up.
 */
export function getFluidStrainProgress(localFrame: number): number {
  const { start, end } = DESTRUCTION_PHASES.strain;
  if (localFrame < start) return 0;
  if (localFrame > end) return 1;
  const t = (localFrame - start) / (end - start);
  // Exponential torque bog-down curve
  return Math.pow(t, 1.8);
}

/**
 * Calculates resonant pre-fracture shudder wave during frames 225..233.
 * Generates an organic vibration wave with increasing frequency and amplitude right before rupture.
 */
export function getResonanceShudder(localFrame: number): {
  progress: number;
  amplitude: number;
  frequency: number;
  shudderX: number;
  shudderZ: number;
} {
  const { start, end } = DESTRUCTION_PHASES.resonance;
  if (localFrame < start) {
    return { progress: 0, amplitude: 0, frequency: 0, shudderX: 0, shudderZ: 0 };
  }
  if (localFrame > end) {
    return { progress: 1, amplitude: 0, frequency: 0, shudderX: 0, shudderZ: 0 };
  }

  const progress = (localFrame - start) / (end - start);
  // Frequency accelerates from 16 to 36 rad/frame
  const frequency = 16 + progress * 20;
  // Amplitude escalates non-linearly from 1.5mm to 18mm
  const amplitude = 0.0015 + Math.pow(progress, 2) * 0.0165;
  const angle = (localFrame - start) * frequency;
  const shudderX = Math.sin(angle) * amplitude;
  const shudderZ = Math.cos(angle * 0.82) * (amplitude * 0.65);

  return { progress, amplitude, frequency, shudderX, shudderZ };
}

/**
 * Calculates active cleanser transition effect progress (0..1) during frames 234..307 (74 frames).
 * By frame 308, progress is strictly 1.0 (settled, clean table).
 */
export function getCleanserProgress(localFrame: number): number {
  const { start, end } = DESTRUCTION_PHASES.ruptureAndCleanser;
  if (localFrame < start) return 0;
  if (localFrame >= DESTRUCTION_PHASES.settled.start) return 1;
  return Math.min(1, Math.max(0, (localFrame - start) / (end - start)));
}

/**
 * Returns true if the current tier's stage has been completely cleansed (frames 308..319).
 * Guarantees zero ghost meshes on the working bed.
 */
export function isStageCleansed(localFrame: number): boolean {
  return localFrame >= DESTRUCTION_PHASES.settled.start;
}

/**
 * Fluid RPM deceleration curve with exponential torque bog-down:
 * - 0..212: full steady-state RPM (baseRpm)
 * - 213..224: exponential torque bog-down (smoothly decelerates from baseRpm to 0)
 * - 225..319: stalled at 0 RPM
 */
export function getFluidRpm(baseRpm: number, localFrame: number): number {
  if (localFrame < DESTRUCTION_PHASES.strain.start) {
    return baseRpm;
  }
  if (localFrame > DESTRUCTION_PHASES.strain.end) {
    return 0;
  }
  const t = (localFrame - DESTRUCTION_PHASES.strain.start) / DESTRUCTION_PHASES.strain.duration;
  // Smooth exponential glide to complete halt
  return baseRpm * Math.pow(Math.max(0, 1 - t), 2.2);
}
