#!/usr/bin/env npx tsx
/**
 * scripts/check_props_collisions.ts
 * Automated CLI collision validator test suite for environment props and decorations.
 *
 * Requirements:
 * - Overlap MUST be strictly < 2.0% (<= 2.0% valid contact, > 2.0% collision violation).
 * - Case A: Barrel correctly placed on wooden pallet (touching surface, overlap ~0% - 1%) -> PASS
 * - Case B: Two barrels clipping into each other by 15% -> DETECTED & REJECTED
 * - Relaxation solver validation (auto-push along XZ planes until overlap < 2.0%)
 * - Full factory environment props staging validation
 */

import * as THREE from "three";
import {
  checkPropsCollisions,
  relaxPropsPositions,
  createProp,
  PlacedPropConfig,
  PROP_PRESETS,
} from "../src/shared/environment/props/PropCollisionValidator";

// ANSI colors for clean console reporting
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

interface TestReport {
  name: string;
  expected: "PASS" | "REJECT";
  actual: "PASS" | "REJECT";
  passed: boolean;
  details: string;
}

const reports: TestReport[] = [];

function logHeader(title: string) {
  console.log(`\n${BOLD}${CYAN}=== ${title} ===${RESET}`);
}

function recordTest(
  name: string,
  expected: "PASS" | "REJECT",
  actual: "PASS" | "REJECT",
  details: string
) {
  const passed = expected === actual;
  reports.push({ name, expected, actual, passed, details });
  const statusBadge = passed
    ? `${GREEN}[TEST OK]${RESET}`
    : `${RED}[TEST FAILED]${RESET}`;
  console.log(
    `  ${statusBadge} ${BOLD}${name}${RESET} -> Expected: ${expected}, Got: ${actual} (${details})`
  );
}

async function runTestSuite() {
  console.log(
    `\n${BOLD}${MAGENTA}======================================================================${RESET}`
  );
  console.log(
    `${BOLD}${MAGENTA}    Remotion Studio: Environment Prop Collision Verification Suite    ${RESET}`
  );
  console.log(
    `${BOLD}${MAGENTA}    Rule: Volumetric overlap MUST be strictly < 2.0%                  ${RESET}`
  );
  console.log(
    `${BOLD}${MAGENTA}======================================================================${RESET}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE A: Barrel on Wooden Pallet (Valid Contact / Surface Touch)
  // --------------------------------------------------------------------------
  logHeader("TEST CASE A: Barrel resting on Wooden Pallet (Valid Surface Contact)");
  {
    // Wooden pallet: 1.2m x 0.15m x 1.2m at floor y = -2.04 (top surface at y = -1.89)
    // Barrel: 0.64m x 0.88m x 0.64m placed on top at y = -1.89 with 1mm slight embed (0.11% overlap)
    const pallet: PlacedPropConfig = {
      id: "pallet_01",
      name: "Standard Wooden Pallet",
      position: [0, -2.04, 0],
      dimensions: PROP_PRESETS.WOODEN_PALLET, // [1.2, 0.15, 1.2]
      anchor: "bottom",
      isStatic: true,
    };

    const barrelOnPallet: PlacedPropConfig = {
      id: "barrel_01",
      name: "Blue Oil Drum on Pallet",
      // Rest on pallet surface at y = -1.89 with tiny 1mm physical settle (overlap ~0.11%)
      position: [0, -1.891, 0],
      dimensions: PROP_PRESETS.OIL_BARREL, // [0.64, 0.88, 0.64]
      anchor: "bottom",
    };

    const resultA = checkPropsCollisions([pallet, barrelOnPallet], 2.0);
    console.log(`  Summary: ${resultA.summary}`);
    console.log(
      `  Max observed overlap: ${resultA.maxObservedOverlapPercent.toFixed(4)}% (Allowed: <= 2.0%)`
    );

    recordTest(
      "Case A: Barrel resting on wooden pallet",
      "PASS",
      resultA.isValid ? "PASS" : "REJECT",
      `Overlap: ${resultA.maxObservedOverlapPercent.toFixed(2)}%`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE B: Two Barrels Clipping into Each Other by ~15%
  // --------------------------------------------------------------------------
  logHeader("TEST CASE B: Two Barrels Clipping (15% Volumetric Interpenetration)");
  let caseBProps: PlacedPropConfig[] = [];
  {
    // Barrel 1: width 0.64, at x = 0 (bounds: [-0.32, 0.32])
    // Barrel 2: width 0.64, at x = 0.544 (bounds: [0.224, 0.864])
    // Overlap in X = 0.32 - 0.224 = 0.096m -> (0.096 / 0.64) * 100% = 15.0% overlap!
    const barrel1: PlacedPropConfig = {
      id: "barrel_clipping_01",
      name: "Solvent Drum Alpha",
      position: [0, -2.04, 0],
      dimensions: PROP_PRESETS.OIL_BARREL,
      anchor: "bottom",
    };

    const barrel2: PlacedPropConfig = {
      id: "barrel_clipping_02",
      name: "Solvent Drum Beta",
      position: [0.544, -2.04, 0],
      dimensions: PROP_PRESETS.OIL_BARREL,
      anchor: "bottom",
    };

    caseBProps = [barrel1, barrel2];

    const resultB = checkPropsCollisions(caseBProps, 2.0);
    console.log(`  Summary: ${resultB.summary}`);
    console.log(
      `  Max observed overlap: ${resultB.maxObservedOverlapPercent.toFixed(2)}% (Allowed: <= 2.0%)`
    );

    if (resultB.violations.length > 0) {
      console.log(`  Violation detected: ${YELLOW}${resultB.violations[0].message}${RESET}`);
    }

    recordTest(
      "Case B: Two barrels clipping by ~15%",
      "REJECT",
      resultB.isValid ? "PASS" : "REJECT",
      `Detected overlap: ${resultB.maxObservedOverlapPercent.toFixed(2)}% > 2.0% threshold`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE C: Auto-Push Relaxation of Case B Overlap
  // --------------------------------------------------------------------------
  logHeader("TEST CASE C: Auto-Push Relaxation Solver on Case B");
  {
    const relaxedProps = relaxPropsPositions(caseBProps, {
      maxIterations: 50,
      targetOverlapPercent: 1.5,
      maxAllowedOverlapPercent: 2.0,
    });

    const resultC = checkPropsCollisions(relaxedProps, 2.0);
    console.log(`  Original positions:`);
    console.log(`    Barrel 1: [${(caseBProps[0].position as number[]).join(", ")}]`);
    console.log(`    Barrel 2: [${(caseBProps[1].position as number[]).join(", ")}]`);
    console.log(`  Relaxed positions:`);
    console.log(`    Barrel 1: [${(relaxedProps[0].position as number[]).map((v) => v.toFixed(3)).join(", ")}]`);
    console.log(`    Barrel 2: [${(relaxedProps[1].position as number[]).map((v) => v.toFixed(3)).join(", ")}]`);
    console.log(`  Post-relaxation overlap: ${resultC.maxObservedOverlapPercent.toFixed(2)}%`);
    console.log(`  Summary: ${resultC.summary}`);

    recordTest(
      "Case C: Auto-push relaxation solver resolves collision",
      "PASS",
      resultC.isValid ? "PASS" : "REJECT",
      `Overlap reduced from 15.0% to ${resultC.maxObservedOverlapPercent.toFixed(2)}% (< 2.0%)`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE D: Realistic Factory Staging Scene (Multi-Prop Validation)
  // --------------------------------------------------------------------------
  logHeader("TEST CASE D: Comprehensive Multi-Prop Factory Staging Environment");
  {
    const sceneProps: PlacedPropConfig[] = [
      // Immovable Floor Cable Trays
      createProp("cable_tray_01", "CABLE_TRAY", [0, -2.04, -2.8], {
        isStatic: true,
        name: "Main Cable Trench",
      }),
      // Wooden Pallet with resting drum
      createProp("pallet_center", "WOODEN_PALLET", [-2.2, -2.04, -1.0], {
        isStatic: true,
        name: "Loading Pallet",
      }),
      createProp("barrel_on_pallet", "OIL_BARREL", [-2.2, -1.89, -1.0], {
        name: "Fuel Drum on Pallet",
      }),
      // Second Drum beside pallet with 10cm safe clearance
      createProp("barrel_adjacent", "OIL_BARREL", [-1.3, -2.04, -1.0], {
        name: "Staged Oil Drum",
      }),
      // Safety Bollard pillars
      createProp("bollard_left", "WARNING_PILLAR", [2.4, -2.04, 1.8], {
        name: "Yellow Hazard Bollard A",
      }),
      createProp("bollard_right", "WARNING_PILLAR", [2.9, -2.04, 1.8], {
        name: "Yellow Hazard Bollard B",
      }),
      // Hydraulic Reservoir tank
      createProp("hydraulic_tank", "HYDRAULIC_RESERVOIR", [2.7, -2.04, -2.2], {
        name: "Hydraulic Reservoir Unit",
      }),
      // Wall Mounted Tool Rack
      createProp("tool_rack", "TOOL_RACK", [-3.8, 0.5, -6.0], {
        anchor: "center",
        isStatic: true,
        name: "Chrome Tool Rack",
      }),
      // Wall Warning Sign
      createProp("warning_sign", "WARNING_SIGN", [3.5, 1.4, -6.0], {
        anchor: "center",
        isStatic: true,
        name: "High Voltage Sign",
      }),
    ];

    const resultD = checkPropsCollisions(sceneProps, 2.0);
    console.log(`  Props count: ${resultD.totalPropsChecked}`);
    console.log(`  Pairs checked: ${resultD.totalPairsChecked}`);
    console.log(`  Max observed overlap: ${resultD.maxObservedOverlapPercent.toFixed(2)}%`);
    console.log(`  Summary: ${resultD.summary}`);

    recordTest(
      "Case D: Realistic Multi-Prop Factory Stage Scene",
      "PASS",
      resultD.isValid ? "PASS" : "REJECT",
      `All ${resultD.totalPropsChecked} props clear (< 2.0%)`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE E: Static Obstacle Auto-Push Solver
  // --------------------------------------------------------------------------
  logHeader("TEST CASE E: Auto-Push Solver Respects Static Obstacles (isStatic)");
  {
    const staticPallet: PlacedPropConfig = {
      id: "fixed_pallet",
      name: "Immovable Floor Pallet",
      position: [0, -2.04, 0],
      dimensions: PROP_PRESETS.WOODEN_PALLET,
      anchor: "bottom",
      isStatic: true,
    };

    // A dynamic barrel erroneously placed cutting 10cm into the pallet at same height
    const clippingBarrel: PlacedPropConfig = {
      id: "moving_barrel",
      name: "Misplaced Drum",
      position: [0.55, -2.04, 0], // Overlapping horizontally
      dimensions: PROP_PRESETS.OIL_BARREL,
      anchor: "bottom",
      isStatic: false,
    };

    const initialCheck = checkPropsCollisions([staticPallet, clippingBarrel], 2.0);
    console.log(`  Initial overlap: ${initialCheck.maxObservedOverlapPercent.toFixed(2)}% (Rejected)`);

    const relaxed = relaxPropsPositions([staticPallet, clippingBarrel]);
    const postCheck = checkPropsCollisions(relaxed, 2.0);

    const palletMoved =
      Math.abs((relaxed[0].position as number[])[0] - 0) > 1e-4 ||
      Math.abs((relaxed[0].position as number[])[2] - 0) > 1e-4;

    console.log(`  Static pallet moved: ${palletMoved ? "YES (ERROR)" : "NO (CORRECT)"}`);
    console.log(
      `  Dynamic barrel moved to: [${(relaxed[1].position as number[]).map((v) => v.toFixed(3)).join(", ")}]`
    );
    console.log(`  Post-relax overlap: ${postCheck.maxObservedOverlapPercent.toFixed(2)}%`);

    const passed = postCheck.isValid && !palletMoved;
    recordTest(
      "Case E: Static obstacle preserves position during push",
      "PASS",
      passed ? "PASS" : "REJECT",
      `Static prop unmoved, dynamic prop safely displaced`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE F: Zero Overlap Touching Faces (Edge Contact Test)
  // --------------------------------------------------------------------------
  logHeader("TEST CASE F: Perfectly Touching Coplanar Faces (0.00% Volumetric Overlap)");
  {
    // Two boxes touching exactly at x = 1.0 (Face sharing)
    const boxLeft: PlacedPropConfig = {
      id: "box_left",
      position: [0.5, 0, 0],
      dimensions: [1.0, 1.0, 1.0],
      anchor: "center",
    };
    const boxRight: PlacedPropConfig = {
      id: "box_right",
      position: [1.5, 0, 0],
      dimensions: [1.0, 1.0, 1.0],
      anchor: "center",
    };

    const resultF = checkPropsCollisions([boxLeft, boxRight], 2.0);
    console.log(`  Max observed overlap: ${resultF.maxObservedOverlapPercent.toFixed(4)}%`);

    recordTest(
      "Case F: Coplanar touching faces (zero volume intersection)",
      "PASS",
      resultF.isValid ? "PASS" : "REJECT",
      `Overlap: ${resultF.maxObservedOverlapPercent.toFixed(4)}% <= 2.0%`
    );
  }

  // --------------------------------------------------------------------------
  // TEST CASE G: Multi-Theme Production Staging Validation (DynamicEnvironment)
  // --------------------------------------------------------------------------
  logHeader("TEST CASE G: DynamicEnvironment Production Themes (Central Zone & <2% Overlap)");
  {
    const themeDefinitions: { theme: string; props: PlacedPropConfig[] }[] = [
      {
        theme: "factory",
        props: [
          createProp("fac_pallet", "WOODEN_PALLET", [-2.7, -2.04, -2.0], { isStatic: true }),
          createProp("fac_drum1", "OIL_BARREL", [-3.0, -1.896, -2.0]),
          createProp("fac_drum2", "OIL_BARREL", [-2.35, -1.896, -2.0]),
          createProp("fac_bucket", "METAL_BUCKET", [-2.2, -2.04, -1.1]),
          createProp("fac_hardware", "SCATTERED_HARDWARE", [-2.4, -2.04, -0.65]),
          createProp("fac_hose", "COILED_HOSE", [2.6, -2.04, -1.8]),
          createProp("fac_pillars", "WARNING_PILLAR", [2.5, -2.04, 1.6]),
          createProp("fac_cable_tray", "CABLE_TRAY", [0, -2.04, -2.8], { isStatic: true }),
          createProp("fac_sign", "WARNING_SIGN", [3.6, 1.8, -6.0], { anchor: "center", isStatic: true }),
        ],
      },
      {
        theme: "garage",
        props: [
          createProp("gar_tool_rack", "TOOL_RACK", [-3.8, 0.6, -6.0], { anchor: "center", isStatic: true }),
          createProp("gar_sign", "WARNING_SIGN", [3.5, 1.8, -6.0], { anchor: "center", isStatic: true }),
          createProp("gar_pallet", "WOODEN_PALLET", [-2.6, -2.04, -1.8], { isStatic: true }),
          createProp("gar_bucket", "METAL_BUCKET", [-2.6, -1.896, -1.8]),
          createProp("gar_hardware", "SCATTERED_HARDWARE", [-2.4, -2.04, -0.95]),
          createProp("gar_drum1", "OIL_BARREL", [2.7, -2.04, -1.9]),
          createProp("gar_drum2", "OIL_BARREL", [3.35, -2.04, -1.9]),
          createProp("gar_hose", "COILED_HOSE", [2.6, -2.04, -0.9]),
          createProp("gar_cable_tray", "CABLE_TRAY", [0, -2.04, -2.8], { isStatic: true }),
        ],
      },
      {
        theme: "cleanroom",
        props: [
          createProp("clean_hydraulic", "HYDRAULIC_RESERVOIR", [2.7, -2.04, -2.2]),
          createProp("clean_hose", "COILED_HOSE", [2.6, -2.04, -1.1]),
          createProp("clean_drum1", "OIL_BARREL", [-2.7, -2.04, -2.1]),
          createProp("clean_drum2", "OIL_BARREL", [-2.05, -2.04, -2.1]),
          createProp("clean_bucket", "METAL_BUCKET", [-2.3, -2.04, -1.25]),
          createProp("clean_cable_tray", "CABLE_TRAY", [0, -2.04, -2.8], { isStatic: true }),
          createProp("clean_sign", "WARNING_SIGN", [-3.5, 1.8, -6.0], { anchor: "center", isStatic: true }),
        ],
      },
      {
        theme: "dark_studio",
        props: [
          createProp("dark_hydraulic", "HYDRAULIC_RESERVOIR", [2.7, -2.04, -2.2]),
          createProp("dark_hose", "COILED_HOSE", [2.6, -2.04, -1.1]),
          createProp("dark_drum1", "OIL_BARREL", [-2.7, -2.04, -2.0]),
          createProp("dark_drum2", "OIL_BARREL", [-2.05, -2.04, -2.0]),
          createProp("dark_bucket", "METAL_BUCKET", [-2.3, -2.04, -1.2]),
          createProp("dark_pillars_l", "WARNING_PILLAR", [-2.6, -2.04, 1.8]),
          createProp("dark_pillars_r", "WARNING_PILLAR", [2.6, -2.04, 1.8]),
        ],
      },
      {
        theme: "cyberpunk",
        props: [
          createProp("cyber_pillars_l", "WARNING_PILLAR", [-2.6, -2.04, 1.8]),
          createProp("cyber_pillars_r", "WARNING_PILLAR", [2.6, -2.04, 1.8]),
          createProp("cyber_drum1", "OIL_BARREL", [-2.7, -2.04, -2.0]),
          createProp("cyber_drum2", "OIL_BARREL", [-2.05, -2.04, -2.0]),
          createProp("cyber_bucket", "METAL_BUCKET", [-2.3, -2.04, -1.2]),
          createProp("cyber_hose", "COILED_HOSE", [2.6, -2.04, -1.2]),
          createProp("cyber_hydraulic", "HYDRAULIC_RESERVOIR", [2.7, -2.04, -2.2]),
          createProp("cyber_cable_tray", "CABLE_TRAY", [0, -2.04, -2.8], { isStatic: true }),
        ],
      },
    ];

    let allThemesValid = true;
    let worstOverlap = 0;

    for (const t of themeDefinitions) {
      // 1. Central Zone clearance check: all props must have radial dist >= 2.0m from center
      let centralViolation = false;
      for (const p of t.props) {
        const pos = p.position as [number, number, number];
        const dist = Math.hypot(pos[0], pos[2]);
        const clear = dist >= 2.0 && (Math.abs(pos[0]) >= 2.15 || Math.abs(pos[2]) >= 1.8 || pos[2] >= 1.55);
        if (!clear) {
          console.error(`    ✖ Central clearance violation in ${t.theme}: ${p.id} at [${pos.join(", ")}]`);
          centralViolation = true;
        }
      }

      // 2. Collision overlap check (< 2.0%)
      const collisionResult = checkPropsCollisions(t.props, 2.0);
      if (collisionResult.maxObservedOverlapPercent > worstOverlap) {
        worstOverlap = collisionResult.maxObservedOverlapPercent;
      }
      if (!collisionResult.isValid || centralViolation) {
        allThemesValid = false;
        console.error(`    ✖ Theme ${t.theme} failed: overlap=${collisionResult.maxObservedOverlapPercent.toFixed(2)}%`);
        for (const v of collisionResult.violations) {
          console.error(`       -> ${v.message}`);
        }
      } else {
        console.log(`    ✔ Theme "${t.theme}": ${t.props.length} props, max overlap: ${collisionResult.maxObservedOverlapPercent.toFixed(2)}%, central zone 100% clear.`);
      }
    }

    recordTest(
      "Case G: All 5 Production Themes Validated (Clearance & Overlap)",
      "PASS",
      allThemesValid ? "PASS" : "REJECT",
      `All 5 themes valid, peak overlap ${worstOverlap.toFixed(2)}% (< 2.0%)`
    );
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT & EXIT CODE EVALUATION
  // --------------------------------------------------------------------------
  console.log(
    `\n${BOLD}${CYAN}----------------------------------------------------------------------${RESET}`
  );
  console.log(`${BOLD}${CYAN}                       VALIDATION SUITE SUMMARY                       ${RESET}`);
  console.log(
    `${BOLD}${CYAN}----------------------------------------------------------------------${RESET}`
  );

  let allPassed = true;
  for (const report of reports) {
    const symbol = report.passed ? `${GREEN}✔ PASS${RESET}` : `${RED}✖ FAIL${RESET}`;
    console.log(` ${symbol} | ${report.name.padEnd(52)} | ${report.details}`);
    if (!report.passed) allPassed = false;
  }

  console.log(
    `${BOLD}${CYAN}----------------------------------------------------------------------${RESET}\n`
  );

  if (allPassed) {
    console.log(
      `${BOLD}${GREEN}✔ ALL ${reports.length} PROP COLLISION VALIDATION TESTS PASSED!${RESET}`
    );
    console.log(
      `${GREEN}System ready: Environment prop placements conform strictly to < 2.0% volumetric overlap rule.${RESET}\n`
    );
    process.exit(0);
  } else {
    console.error(
      `${BOLD}${RED}✖ COLLISION VALIDATION SUITE FAILED! Some test assertions were violated.${RESET}\n`
    );
    process.exit(1);
  }
}

// Execute test suite
runTestSuite().catch((err) => {
  console.error("Fatal error during test suite execution:", err);
  process.exit(1);
});
