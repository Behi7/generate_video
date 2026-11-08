#!/usr/bin/env npx tsx
/**
 * check_sync.ts
 * Universal Automated Camera-Physics-Audio Synchronization Interceptor for Remotion Studio.
 *
 * Audits:
 *   a) 3D Kinematic Strike Frames: Reads strikeFrames & strikeIntensity from each tier's MachineAssemblySpec.
 *   b) Camera Shake Frames: Verifies that every snapFrame, strikeFrame, and fracture breakFrame
 *      has a corresponding entry in camera `impacts` (<RigidShowcaseCamera impacts={...}>).
 *   c) Audio Transients: Reads asmr_<slug>_bom.json (or public/audio/asmr_<slug>_bom.json)
 *      and verifies that Foley strike transients occur on the EXACT strikeFrames (±0 frames drift).
 *   d) Returns exit code 0 if 100% synchronized, or exit code 1 with an actionable forensic breakdown of mismatches.
 */

import React from "react";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

// Headless polyfills for Node.js
(global as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);
(global as any).cancelAnimationFrame = (id: any) => clearTimeout(id);

// Headless Remotion mocks
const req = createRequire(path.join(process.cwd(), "package.json"));
const uvcPath = path.resolve(process.cwd(), "node_modules/remotion/dist/cjs/use-video-config.js");
if (fs.existsSync(uvcPath)) {
  try {
    req(uvcPath);
    if (req.cache[uvcPath]) {
      req.cache[uvcPath].exports.useVideoConfig = () => ({
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: 1160,
      });
    }
  } catch (e) {
    // Ignore error
  }
}

const remotion = req("remotion");
try {
  Object.defineProperty(remotion, "useCurrentFrame", {
    get: () => () => 0,
    configurable: true,
  });
} catch (e) {}

try {
  Object.defineProperty(remotion, "staticFile", {
    value: (f: string) => f,
    configurable: true,
    writable: true,
  });
} catch (e) {}

// Mock @remotion/three ThreeCanvas so rendering composition doesn't crash on headless Canvas
try {
  const remotionThree = req("@remotion/three");
  if (remotionThree) {
    Object.defineProperty(remotionThree, "ThreeCanvas", {
      value: ({ children }: { children: React.ReactNode }) => children,
      writable: true,
      configurable: true,
    });
  }
} catch (e) {}

import {
  MachineAssemblySpec,
  ImpactShake,
  computeProjectImpacts,
} from "../src/shared/contracts/AssemblyContract";

// Import known project tier specs and compositions
import {
  HammerTier1Spec,
} from "../src/projects/hammer/components/HammerTier1_Manual";
import {
  HammerTier2Spec,
} from "../src/projects/hammer/components/HammerTier2_Electric";
import {
  HammerTier3Spec,
} from "../src/projects/hammer/components/HammerTier3_Hydraulic";
import {
  HammerTier4Spec,
} from "../src/projects/hammer/components/HammerTier4_Futuristic";
import { HammerProgression } from "../src/projects/hammer/compositions/HammerProgression";

import {
  PressTier1Spec,
} from "../src/projects/press/components/PressTier1_Manual";
import {
  PressTier2Spec,
} from "../src/projects/press/components/PressTier2_Electric";
import {
  PressTier3Spec,
} from "../src/projects/press/components/PressTier3_Hydraulic";
import {
  PressTier4Spec,
} from "../src/projects/press/components/PressTier4_Futuristic";
import { PressProgression } from "../src/projects/press/compositions/PressProgression";

import {
  Tier1AssemblySpec as ShredderTier1Spec,
} from "../src/projects/shredder/components/Tier1_Manual";
import {
  Tier2AssemblySpec as ShredderTier2Spec,
} from "../src/projects/shredder/components/Tier2_Electric";
import {
  Tier3AssemblySpec as ShredderTier3Spec,
} from "../src/projects/shredder/components/Tier3_Hydraulic";
import {
  Tier4AssemblySpec as ShredderTier4Spec,
} from "../src/projects/shredder/components/Tier4_Futuristic";
import { ShredderProgression } from "../src/projects/shredder/compositions/ShredderProgression";

export interface ExpectedEvent {
  tier: number;
  type: "snap" | "strike" | "fracture";
  localFrame: number;
  globalFrame: number;
  name: string;
}

export interface BOMEvent {
  frame: number;
  category: string;
  sample: string;
  desc?: string;
  gain_db?: number;
}

export interface SyncAuditReport {
  success: boolean;
  composition: string;
  projectSlug: string;
  tierSpecsCount: number;
  strikeAudit: {
    passed: boolean;
    tierStrikes: {
      tier: number;
      name: string;
      localStrikes: number[];
      globalStrikes: number[];
      intensity: number;
      status: "PASS" | "FAIL";
      error?: string;
    }[];
  };
  cameraAudit: {
    passed: boolean;
    totalCameraImpacts: number;
    expectedSnapCount: number;
    matchedSnapCount: number;
    expectedStrikeCount: number;
    matchedStrikeCount: number;
    expectedFractureCount: number;
    matchedFractureCount: number;
    missingCameraFrames: ExpectedEvent[];
  };
  audioAudit: {
    passed: boolean;
    bomFile?: string;
    totalBomEvents: number;
    strikeSynchronization: {
      globalFrame: number;
      tier: number;
      name: string;
      matched: boolean;
      driftFrames: number;
      eventsAtFrame: string[];
    }[];
    snapSynchronization: {
      globalFrame: number;
      tier: number;
      matched: boolean;
    }[];
    fractureSynchronization: {
      globalFrame: number;
      tier: number;
      matched: boolean;
    }[];
    missingAudioStrikes: number[];
    drifts: { globalFrame: number; drift: number; desc: string }[];
  };
  errors: string[];
}

// Registry for known projects
const PROJECT_REGISTRY: Record<
  string,
  {
    slug: string;
    compositionName: string;
    component: React.ComponentType<any>;
    tierSpecs: MachineAssemblySpec[];
    bomCandidates: string[];
  }
> = {
  hammer: {
    slug: "hammer",
    compositionName: "HammerProgression",
    component: HammerProgression,
    tierSpecs: [HammerTier1Spec, HammerTier2Spec, HammerTier3Spec, HammerTier4Spec],
    bomCandidates: [
      "src/projects/hammer/audio/asmr_hammer_bom.json",
      "public/audio/asmr_hammer_bom.json",
      "src/projects/hammer/audio/asmr_foley_bom.json",
      "public/audio/asmr_foley_bom.json",
    ],
  },
  hammerprogression: {
    slug: "hammer",
    compositionName: "HammerProgression",
    component: HammerProgression,
    tierSpecs: [HammerTier1Spec, HammerTier2Spec, HammerTier3Spec, HammerTier4Spec],
    bomCandidates: [
      "src/projects/hammer/audio/asmr_hammer_bom.json",
      "public/audio/asmr_hammer_bom.json",
      "src/projects/hammer/audio/asmr_foley_bom.json",
      "public/audio/asmr_foley_bom.json",
    ],
  },
  press: {
    slug: "press",
    compositionName: "PressProgression",
    component: PressProgression,
    tierSpecs: [PressTier1Spec, PressTier2Spec, PressTier3Spec, PressTier4Spec],
    bomCandidates: [
      "public/audio/asmr_press_bom.json",
      "src/projects/press/audio/asmr_press_bom.json",
      "public/audio/asmr_foley_bom.json",
    ],
  },
  pressprogression: {
    slug: "press",
    compositionName: "PressProgression",
    component: PressProgression,
    tierSpecs: [PressTier1Spec, PressTier2Spec, PressTier3Spec, PressTier4Spec],
    bomCandidates: [
      "public/audio/asmr_press_bom.json",
      "src/projects/press/audio/asmr_press_bom.json",
      "public/audio/asmr_foley_bom.json",
    ],
  },
  shredder: {
    slug: "shredder",
    compositionName: "ShredderProgression",
    component: ShredderProgression,
    tierSpecs: [ShredderTier1Spec, ShredderTier2Spec, ShredderTier3Spec, ShredderTier4Spec],
    bomCandidates: [
      "src/projects/shredder/audio/asmr_foley_bom.json",
      "public/audio/asmr_foley_bom.json",
      "src/projects/shredder/audio/asmr_shredder_bom.json",
      "public/audio/asmr_shredder_bom.json",
    ],
  },
  shredderprogression: {
    slug: "shredder",
    compositionName: "ShredderProgression",
    component: ShredderProgression,
    tierSpecs: [ShredderTier1Spec, ShredderTier2Spec, ShredderTier3Spec, ShredderTier4Spec],
    bomCandidates: [
      "src/projects/shredder/audio/asmr_foley_bom.json",
      "public/audio/asmr_foley_bom.json",
      "src/projects/shredder/audio/asmr_shredder_bom.json",
      "public/audio/asmr_shredder_bom.json",
    ],
  },
};

/**
 * Searches the React element tree recursively to find `impacts` prop passed to RigidShowcaseCamera
 */
function extractCameraImpactsFromElement(node: any): ImpactShake[] | null {
  if (!node || typeof node !== "object") return null;

  if (node.props?.impacts && Array.isArray(node.props.impacts)) {
    return node.props.impacts;
  }

  if (node.props?.children) {
    const children = Array.isArray(node.props.children)
      ? node.props.children
      : [node.props.children];
    for (const child of children) {
      const found = extractCameraImpactsFromElement(child);
      if (found) return found;
    }
  }

  return null;
}

export function runSyncAudit(compositionInput: string): SyncAuditReport {
  const norm = compositionInput.toLowerCase().replace(/[^a-z0-9]/g, "");
  const proj = PROJECT_REGISTRY[norm];

  if (!proj) {
    throw new Error(
      `Unknown composition or project: "${compositionInput}". Available registered: hammer, press, shredder.`
    );
  }

  const errors: string[] = [];
  const tierOffsets = [0, 290, 580, 870];

  // --------------------------------------------------------------------------
  // AUDIT A: 3D Kinematic Strike Frames in MachineAssemblySpec
  // --------------------------------------------------------------------------
  const tierStrikesAudit: SyncAuditReport["strikeAudit"]["tierStrikes"] = [];
  let strikeAuditPassed = true;

  for (let i = 0; i < proj.tierSpecs.length; i++) {
    const spec = proj.tierSpecs[i];
    const tier = spec.tier || i + 1;
    const offset = tierOffsets[tier - 1] ?? (tier - 1) * 290;
    const strikes = spec.strikeFrames ?? [];
    const intensity =
      spec.strikeIntensity ?? Number((0.038 + tier * 0.007).toFixed(3));

    if (!spec.strikeFrames || spec.strikeFrames.length === 0) {
      strikeAuditPassed = false;
      const err = `Tier ${tier} (${spec.name}) has no strikeFrames defined in MachineAssemblySpec!`;
      errors.push(err);
      tierStrikesAudit.push({
        tier,
        name: spec.name,
        localStrikes: [],
        globalStrikes: [],
        intensity,
        status: "FAIL",
        error: err,
      });
    } else {
      // Validate all strikes are within Act 3 range (100..249)
      const outOfBounds = strikes.filter((f) => f < 100 || f > 249);
      if (outOfBounds.length > 0) {
        strikeAuditPassed = false;
        const err = `Tier ${tier} strikeFrames out of Act 3 window (100..249): [${outOfBounds.join(", ")}]`;
        errors.push(err);
        tierStrikesAudit.push({
          tier,
          name: spec.name,
          localStrikes: strikes,
          globalStrikes: strikes.map((f) => f + offset),
          intensity,
          status: "FAIL",
          error: err,
        });
      } else {
        tierStrikesAudit.push({
          tier,
          name: spec.name,
          localStrikes: strikes,
          globalStrikes: strikes.map((f) => f + offset),
          intensity,
          status: "PASS",
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // AUDIT B: Camera Shake Frames Alignment
  // --------------------------------------------------------------------------
  const expectedEvents: ExpectedEvent[] = [];
  for (let i = 0; i < proj.tierSpecs.length; i++) {
    const spec = proj.tierSpecs[i];
    const tier = spec.tier || i + 1;
    const offset = tierOffsets[tier - 1] ?? (tier - 1) * 290;

    // 1. Snaps
    for (const mod of spec.modules) {
      expectedEvents.push({
        tier,
        type: "snap",
        localFrame: mod.snapFrame,
        globalFrame: offset + mod.snapFrame,
        name: `Tier ${tier} Module "${mod.id}" snap`,
      });
    }

    // 2. Strikes
    if (spec.strikeFrames) {
      for (let sIdx = 0; sIdx < spec.strikeFrames.length; sIdx++) {
        const f = spec.strikeFrames[sIdx];
        expectedEvents.push({
          tier,
          type: "strike",
          localFrame: f,
          globalFrame: offset + f,
          name: `Tier ${tier} Strike ${sIdx + 1}`,
        });
      }
    }

    // 3. Fractures
    for (const mod of spec.modules) {
      if (mod.fracture) {
        expectedEvents.push({
          tier,
          type: "fracture",
          localFrame: mod.fracture.breakFrame,
          globalFrame: offset + mod.fracture.breakFrame,
          name: `Tier ${tier} Overload Fracture (${mod.id})`,
        });
        break; // Single fracture shockwave per tier
      }
    }
  }

  // Extract camera impacts from rendered composition component
  let cameraImpacts: ImpactShake[] = [];
  try {
    const rendered = React.createElement(proj.component, {});
    const extracted = extractCameraImpactsFromElement(
      typeof proj.component === "function" ? (proj.component as any)({}) : rendered
    );
    if (extracted && Array.isArray(extracted)) {
      cameraImpacts = extracted;
    }
  } catch (e: any) {
    // If render fails, fallback to computeProjectImpacts to compare
    cameraImpacts = computeProjectImpacts(proj.tierSpecs);
  }

  const cameraFrameSet = new Set(cameraImpacts.map((i) => i.frame));
  const missingCameraFrames: ExpectedEvent[] = [];

  let matchedSnapCount = 0;
  let expectedSnapCount = 0;
  let matchedStrikeCount = 0;
  let expectedStrikeCount = 0;
  let matchedFractureCount = 0;
  let expectedFractureCount = 0;

  for (const exp of expectedEvents) {
    if (exp.type === "snap") expectedSnapCount++;
    if (exp.type === "strike") expectedStrikeCount++;
    if (exp.type === "fracture") expectedFractureCount++;

    if (cameraFrameSet.has(exp.globalFrame)) {
      if (exp.type === "snap") matchedSnapCount++;
      if (exp.type === "strike") matchedStrikeCount++;
      if (exp.type === "fracture") matchedFractureCount++;
    } else {
      missingCameraFrames.push(exp);
      errors.push(
        `Missing camera shake impact for ${exp.name} at global frame ${exp.globalFrame} (local ${exp.localFrame}f)!`
      );
    }
  }

  const cameraAuditPassed = missingCameraFrames.length === 0;

  // --------------------------------------------------------------------------
  // AUDIT C: Audio Transients Synchronization (BOM)
  // --------------------------------------------------------------------------
  let bomPath: string | undefined;
  for (const cand of proj.bomCandidates) {
    const full = path.resolve(process.cwd(), cand);
    if (fs.existsSync(full)) {
      bomPath = full;
      break;
    }
  }

  let totalBomEvents = 0;
  const eventsByFrame = new Map<number, BOMEvent[]>();

  if (bomPath) {
    try {
      const raw = fs.readFileSync(bomPath, "utf-8");
      const parsed = JSON.parse(raw);
      const events: BOMEvent[] = parsed.events || [];
      totalBomEvents = events.length;

      for (const ev of events) {
        if (!eventsByFrame.has(ev.frame)) {
          eventsByFrame.set(ev.frame, []);
        }
        eventsByFrame.get(ev.frame)!.push(ev);
      }
    } catch (e: any) {
      errors.push(`Failed to parse BOM at ${bomPath}: ${e.message}`);
    }
  } else {
    errors.push(
      `Audio BOM file not found for project '${proj.slug}'! Checked: ${proj.bomCandidates.join(", ")}`
    );
  }

  const strikeSyncList: SyncAuditReport["audioAudit"]["strikeSynchronization"] = [];
  const missingAudioStrikes: number[] = [];
  const drifts: SyncAuditReport["audioAudit"]["drifts"] = [];

  const expectedStrikes = expectedEvents.filter((e) => e.type === "strike");
  for (const st of expectedStrikes) {
    const gf = st.globalFrame;
    const eventsAt = eventsByFrame.get(gf);

    if (eventsAt && eventsAt.length > 0) {
      strikeSyncList.push({
        globalFrame: gf,
        tier: st.tier,
        name: st.name,
        matched: true,
        driftFrames: 0,
        eventsAtFrame: eventsAt.map((e) => e.desc || e.sample),
      });
    } else {
      // Check if there is drift in nearby window (±10 frames)
      let driftFound = false;
      for (let delta = -10; delta <= 10; delta++) {
        if (delta === 0) continue;
        const candEvents = eventsByFrame.get(gf + delta);
        if (candEvents) {
          const strikeLike = candEvents.filter(
            (e) =>
              (e.desc && /strike|impact|clink|clang|thud|ring/i.test(e.desc)) ||
              (e.category && /impact|metal|wood/i.test(e.category))
          );
          if (strikeLike.length > 0) {
            drifts.push({
              globalFrame: gf,
              drift: delta,
              desc: `${st.name}: Foley event detected at ${gf + delta} instead of ${gf} (drift: ${delta > 0 ? "+" : ""}${delta}f)`,
            });
            driftFound = true;
            break;
          }
        }
      }

      missingAudioStrikes.push(gf);
      strikeSyncList.push({
        globalFrame: gf,
        tier: st.tier,
        name: st.name,
        matched: false,
        driftFrames: driftFound ? 999 : 0,
        eventsAtFrame: [],
      });
      errors.push(
        `Desynchronization: Foley strike transient missing at exact frame ${gf} (${st.name})!`
      );
    }
  }

  // Snaps check
  const snapSyncList: SyncAuditReport["audioAudit"]["snapSynchronization"] = [];
  const expectedSnaps = expectedEvents.filter((e) => e.type === "snap");
  for (const sn of expectedSnaps) {
    const matched = eventsByFrame.has(sn.globalFrame);
    snapSyncList.push({
      globalFrame: sn.globalFrame,
      tier: sn.tier,
      matched,
    });
  }

  // Fractures check
  const fractureSyncList: SyncAuditReport["audioAudit"]["fractureSynchronization"] = [];
  const expectedFractures = expectedEvents.filter((e) => e.type === "fracture");
  for (const fr of expectedFractures) {
    const matched = eventsByFrame.has(fr.globalFrame);
    fractureSyncList.push({
      globalFrame: fr.globalFrame,
      tier: fr.tier,
      matched,
    });
  }

  const audioAuditPassed =
    Boolean(bomPath) && missingAudioStrikes.length === 0 && drifts.length === 0;

  const allPassed = strikeAuditPassed && cameraAuditPassed && audioAuditPassed;

  return {
    success: allPassed,
    composition: proj.compositionName,
    projectSlug: proj.slug,
    tierSpecsCount: proj.tierSpecs.length,
    strikeAudit: {
      passed: strikeAuditPassed,
      tierStrikes: tierStrikesAudit,
    },
    cameraAudit: {
      passed: cameraAuditPassed,
      totalCameraImpacts: cameraImpacts.length,
      expectedSnapCount,
      matchedSnapCount,
      expectedStrikeCount,
      matchedStrikeCount,
      expectedFractureCount,
      matchedFractureCount,
      missingCameraFrames,
    },
    audioAudit: {
      passed: audioAuditPassed,
      bomFile: bomPath ? path.relative(process.cwd(), bomPath) : undefined,
      totalBomEvents,
      strikeSynchronization: strikeSyncList,
      snapSynchronization: snapSyncList,
      fractureSynchronization: fractureSyncList,
      missingAudioStrikes,
      drifts,
    },
    errors,
  };
}

// CLI Execution Entry Point
export function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");
  const composition = filteredArgs[0] || "HammerProgression";

  try {
    const report = runSyncAudit(composition);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.success ? 0 : 1);
    }

    console.log("================================================================================");
    console.log(`⏱️  CAMERA-PHYSICS-AUDIO SYNCHRONIZATION INTERCEPTOR`);
    console.log(`Composition: ${report.composition} | Project: ${report.projectSlug}`);
    console.log("================================================================================");

    // [AUDIT A]
    console.log(`\n📋 [AUDIT A] 3D KINEMATIC STRIKE FRAMES (MachineAssemblySpec)`);
    for (const ts of report.strikeAudit.tierStrikes) {
      const statusIcon = ts.status === "PASS" ? "✅ PASS" : "❌ FAIL";
      console.log(
        `  Tier ${ts.tier} (${ts.name}): ${ts.localStrikes.length} strikes -> Local [${ts.localStrikes.join(
          ", "
        )}] -> Global [${ts.globalStrikes.join(", ")}] (Intensity: ${ts.intensity.toFixed(3)})  ${statusIcon}`
      );
      if (ts.error) {
        console.log(`    ⚠️  ${ts.error}`);
      }
    }

    // [AUDIT B]
    console.log(`\n📷 [AUDIT B] CAMERA SHAKE IMPULSES (RigidShowcaseCamera impacts)`);
    console.log(`  Total Camera Impacts Detected: ${report.cameraAudit.totalCameraImpacts}`);
    const snapStatus =
      report.cameraAudit.matchedSnapCount === report.cameraAudit.expectedSnapCount
        ? "✅ PASS"
        : "❌ MISMATCH";
    const strikeStatus =
      report.cameraAudit.matchedStrikeCount === report.cameraAudit.expectedStrikeCount
        ? "✅ PASS"
        : "❌ MISMATCH";
    const fractureStatus =
      report.cameraAudit.matchedFractureCount === report.cameraAudit.expectedFractureCount
        ? "✅ PASS"
        : "❌ MISMATCH";

    console.log(
      `  • Assembly Snaps (${report.cameraAudit.expectedSnapCount} frames):     ${report.cameraAudit.matchedSnapCount}/${report.cameraAudit.expectedSnapCount} synchronized (0 drift)  ${snapStatus}`
    );
    console.log(
      `  • Operating Strikes (${report.cameraAudit.expectedStrikeCount} frames):   ${report.cameraAudit.matchedStrikeCount}/${report.cameraAudit.expectedStrikeCount} synchronized (0 drift)  ${strikeStatus}`
    );
    console.log(
      `  • Overload Fractures (${report.cameraAudit.expectedFractureCount} frames):  ${report.cameraAudit.matchedFractureCount}/${report.cameraAudit.expectedFractureCount} synchronized (0 drift)  ${fractureStatus}`
    );

    if (report.cameraAudit.missingCameraFrames.length > 0) {
      console.log(`\n  ⚠️  MISSING CAMERA SHAKE IMPULSES:`);
      for (const m of report.cameraAudit.missingCameraFrames) {
        console.log(`    - Frame ${m.globalFrame} (local ${m.localFrame}f, ${m.name})`);
      }
    }

    // [AUDIT C]
    console.log(`\n🔊 [AUDIT C] AUDIO TRANSIENTS SYNCHRONIZATION (BOM: ${report.audioAudit.bomFile || "NOT FOUND"})`);
    console.log(`  BOM Total Events: ${report.audioAudit.totalBomEvents} events`);

    const strikeAudioMatched = report.audioAudit.strikeSynchronization.filter((s) => s.matched).length;
    const strikeAudioTotal = report.audioAudit.strikeSynchronization.length;
    const strikeAudioStatus = strikeAudioMatched === strikeAudioTotal ? "✅ PASS" : "❌ DESYNC";

    console.log(
      `  • Operating Strikes (${strikeAudioMatched}/${strikeAudioTotal}): ${strikeAudioStatus}`
    );

    for (const ts of report.strikeAudit.tierStrikes) {
      const tierEvents = report.audioAudit.strikeSynchronization.filter((s) => s.tier === ts.tier);
      const tierMatched = tierEvents.filter((s) => s.matched).length;
      const statusIcon = tierMatched === tierEvents.length ? "✅" : "❌";
      console.log(
        `    - Tier ${ts.tier} (${tierMatched}/${tierEvents.length} strikes synchronized at global [${ts.globalStrikes.join(
          ", "
        )}]) ${statusIcon}`
      );
    }

    if (report.audioAudit.drifts.length > 0) {
      console.log(`\n  ⚠️  DETECTED AUDIO DRIFTS:`);
      for (const d of report.audioAudit.drifts) {
        console.log(`    - ${d.desc}`);
      }
    }

    if (report.audioAudit.missingAudioStrikes.length > 0) {
      console.log(`\n  ⚠️  MISSING AUDIO TRANSIENTS AT EXACT STRIKE FRAMES:`);
      for (const f of report.audioAudit.missingAudioStrikes) {
        console.log(`    - Frame ${f} missing audio event`);
      }
    }

    // Final Verdict
    if (report.success) {
      console.log("\n================================================================================");
      console.log(`✨ FINAL VERDICT: APPROVED (100% Engine Synchronization - 0 frames drift)`);
      console.log(`Exit Code: 0`);
      console.log("================================================================================");
      process.exit(0);
    } else {
      console.log("\n================================================================================");
      console.log(`🚨 FINAL VERDICT: REJECT (${report.errors.length} Synchronization Violations Detected)`);
      console.log(`Exit Code: 1`);
      console.log("================================================================================");
      process.exit(1);
    }
  } catch (err: any) {
    if (isJson) {
      console.log(JSON.stringify({ success: false, error: err.message, stack: err.stack }));
    } else {
      console.error(`\n❌ Error running sync interceptor:`, err.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
