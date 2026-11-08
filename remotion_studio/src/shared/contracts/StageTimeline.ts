/**
 * StageTimeline: Mathematical backbone for the 38-40s (1160 frames @ 30 FPS) Conveyor.
 * Every tier receives exactly 290 frames (~9.67s) divided into 4 distinct human-readable acts.
 */

export const TIER_DURATION_FRAMES = 290;
export const TOTAL_DURATION_FRAMES = 1160; // 38.6667s @ 30 FPS

// Canonical 4-Act frame offsets inside each 290-frame tier (Zero overlapping or off-by-one gaps)
// Local frames: [0..289] (Total = 290 frames)
export const ACT_RANGES = {
  assembly: { start: 0, end: 69, duration: 70 }, // 2.33s (0..69): Staggered 4-module assembly
  startup: { start: 70, end: 149, duration: 80 }, // 2.67s (70..149): Individual startup chain reaction
  operating: { start: 150, end: 249, duration: 100 }, // 3.33s (150..249): Hypnotic steady-state ASMR run
  destruction: { start: 250, end: 289, duration: 40 }, // 1.33s (250..289): Overload fracture on bed
} as const;

export type TierAct = "assembly" | "startup" | "operating" | "destruction";

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
 * Returns the local frame (0..289) within the current tier.
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
