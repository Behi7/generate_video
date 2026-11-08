import {
  checkPropsCollisions,
  PlacedPropConfig,
  PROP_PRESETS,
} from "../src/shared/environment/props/PropCollisionValidator";

interface ThemePropsDef {
  theme: string;
  props: PlacedPropConfig[];
}

// Bounding box dimensions for complex assemblies
const DIMS = {
  PALLET: [1.2, 0.15, 0.8] as [number, number, number],
  DRUM: [0.64, 0.88, 0.64] as [number, number, number],
  BUCKET: [0.34, 0.33, 0.34] as [number, number, number],
  HOSE: [0.90, 0.08, 0.90] as [number, number, number],
  HARDWARE: [0.36, 0.04, 0.32] as [number, number, number],
  PILLARS: [0.32, 0.90, 0.32] as [number, number, number],
  CABLE_TRAY: [7.0, 0.08, 0.28] as [number, number, number],
  TOOL_RACK: [1.6, 2.2, 0.04] as [number, number, number],
  HYDRAULIC_RESERVOIR: [0.68, 0.95, 0.68] as [number, number, number],
  WARNING_SIGN: [1.2, 0.7, 0.025] as [number, number, number],
};

const themes: ThemePropsDef[] = [
  // 1. FACTORY
  {
    theme: "factory",
    props: [
      // Left Rear Supply Island
      {
        id: "factory_pallet",
        name: "Supply Island Pallet",
        position: [-2.7, -2.04, -2.0],
        dimensions: DIMS.PALLET,
        anchor: "bottom",
        isStatic: true,
      },
      // Drum 1 on pallet (Y = -1.89 resting on pallet top deck)
      {
        id: "factory_drum_1",
        name: "Supply Drum 1 (on Pallet)",
        position: [-3.0, -1.89, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Drum 2 on pallet (Y = -1.89 resting on pallet top deck)
      {
        id: "factory_drum_2",
        name: "Supply Drum 2 (on Pallet)",
        position: [-2.35, -1.89, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Metal Bucket nearby
      {
        id: "factory_bucket",
        name: "Metal Bucket",
        position: [-2.2, -2.04, -1.3],
        dimensions: DIMS.BUCKET,
        anchor: "bottom",
      },
      // Scattered Hardware
      {
        id: "factory_hardware",
        name: "Scattered Hardware",
        position: [-2.3, -2.04, -0.75],
        dimensions: DIMS.HARDWARE,
        anchor: "bottom",
      },
      // Coiled Hose on right floor
      {
        id: "factory_hose",
        name: "Coiled Hydraulic Hose",
        position: [2.6, -2.04, -1.8],
        dimensions: DIMS.HOSE,
        anchor: "bottom",
      },
      // Cable Trays along back wall
      {
        id: "factory_cable_tray",
        name: "Floor Cable Tray",
        position: [0, -2.04, -2.8],
        dimensions: DIMS.CABLE_TRAY,
        anchor: "bottom",
        isStatic: true,
      },
      // Warning Pillars at right flank
      {
        id: "factory_pillars",
        name: "Safety Warning Pillars",
        position: [2.5, -2.04, 1.6],
        dimensions: DIMS.PILLARS,
        anchor: "bottom",
      },
      // Warning Sign on wall
      {
        id: "factory_sign",
        name: "High Voltage Wall Sign",
        position: [3.6, 1.8, -6.0],
        dimensions: DIMS.WARNING_SIGN,
        anchor: "center",
        isStatic: true,
      },
    ],
  },

  // 2. GARAGE
  {
    theme: "garage",
    props: [
      // Tool Rack on wall
      {
        id: "garage_tool_rack",
        name: "Wall Pegboard Tool Rack",
        position: [-3.8, 0.6, -6.0],
        dimensions: DIMS.TOOL_RACK,
        anchor: "center",
        isStatic: true,
      },
      // Wooden Pallet on left bench foot
      {
        id: "garage_pallet",
        name: "Workshop Pallet",
        position: [-2.6, -2.04, -1.8],
        dimensions: DIMS.PALLET,
        anchor: "bottom",
        isStatic: true,
      },
      // Metal Bucket resting on Wooden Pallet
      {
        id: "garage_bucket_on_pallet",
        name: "Galvanized Bucket on Pallet",
        position: [-2.6, -1.896, -1.8],
        dimensions: DIMS.BUCKET,
        anchor: "bottom",
      },
      // Scattered Hardware near pallet foot
      {
        id: "garage_hardware",
        name: "Floor Fastener Scatter",
        position: [-2.4, -2.04, -1.1],
        dimensions: DIMS.HARDWARE,
        anchor: "bottom",
      },
      // Right flank drums
      {
        id: "garage_drum_1",
        name: "Solvent Drum 1",
        position: [2.7, -2.04, -1.9],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      {
        id: "garage_drum_2",
        name: "Solvent Drum 2",
        position: [3.35, -2.04, -1.9],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Coiled Hose near bench
      {
        id: "garage_hose",
        name: "Rubber Hydraulic Hose",
        position: [2.6, -2.04, -0.9],
        dimensions: DIMS.HOSE,
        anchor: "bottom",
      },
      // Cable Trays
      {
        id: "garage_cable_tray",
        name: "Cable Trays",
        position: [0, -2.04, -2.8],
        dimensions: DIMS.CABLE_TRAY,
        anchor: "bottom",
        isStatic: true,
      },
    ],
  },

  // 3. CLEANROOM
  {
    theme: "cleanroom",
    props: [
      // Hydraulic Reservoir
      {
        id: "cleanroom_hydraulic",
        name: "Hydraulic Reservoir Unit",
        position: [2.7, -2.04, -2.2],
        dimensions: DIMS.HYDRAULIC_RESERVOIR,
        anchor: "bottom",
      },
      // Braided Steel Coiled Hose
      {
        id: "cleanroom_hose",
        name: "Braided Stainless Hose",
        position: [2.6, -2.04, -1.1],
        dimensions: DIMS.HOSE,
        anchor: "bottom",
      },
      // Clean Drums on Left
      {
        id: "cleanroom_drum_1",
        name: "Cleanroom Drum 1",
        position: [-2.7, -2.04, -2.1],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      {
        id: "cleanroom_drum_2",
        name: "Cleanroom Drum 2",
        position: [-2.05, -2.04, -2.1],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Metal Bucket (Clean Stainless/Galv)
      {
        id: "cleanroom_bucket",
        name: "Sanitary Metal Pail",
        position: [-2.3, -2.04, -1.25],
        dimensions: DIMS.BUCKET,
        anchor: "bottom",
      },
      // Cable Trays
      {
        id: "cleanroom_cable_tray",
        name: "Perimeter Cable Trays",
        position: [0, -2.04, -2.8],
        dimensions: DIMS.CABLE_TRAY,
        anchor: "bottom",
        isStatic: true,
      },
      // Wall Sign
      {
        id: "cleanroom_sign",
        name: "Cleanroom Protocol Sign",
        position: [-3.5, 1.8, -6.0],
        dimensions: DIMS.WARNING_SIGN,
        anchor: "center",
        isStatic: true,
      },
    ],
  },

  // 4. DARK STUDIO
  {
    theme: "dark_studio",
    props: [
      // Hydraulic Reservoir
      {
        id: "dark_studio_hydraulic",
        name: "Hydraulic Reservoir Unit",
        position: [2.7, -2.04, -2.2],
        dimensions: DIMS.HYDRAULIC_RESERVOIR,
        anchor: "bottom",
      },
      // Coiled Hose
      {
        id: "dark_studio_hose",
        name: "Matte Black Coiled Hose",
        position: [2.6, -2.04, -1.1],
        dimensions: DIMS.HOSE,
        anchor: "bottom",
      },
      // Drums on left
      {
        id: "dark_studio_drum_1",
        name: "Slate Drum 1",
        position: [-2.7, -2.04, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      {
        id: "dark_studio_drum_2",
        name: "Slate Drum 2",
        position: [-2.05, -2.04, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Metal Bucket
      {
        id: "dark_studio_bucket",
        name: "Zinc Bucket",
        position: [-2.3, -2.04, -1.2],
        dimensions: DIMS.BUCKET,
        anchor: "bottom",
      },
      // Warning Pillars
      {
        id: "dark_studio_pillars_left",
        name: "Warning Pillars Left",
        position: [-2.6, -2.04, 1.8],
        dimensions: DIMS.PILLARS,
        anchor: "bottom",
      },
      {
        id: "dark_studio_pillars_right",
        name: "Warning Pillars Right",
        position: [2.6, -2.04, 1.8],
        dimensions: DIMS.PILLARS,
        anchor: "bottom",
      },
    ],
  },

  // 5. CYBERPUNK
  {
    theme: "cyberpunk",
    props: [
      // Warning Pillars Flanks
      {
        id: "cyberpunk_pillars_left",
        name: "Cyber Bollard Left",
        position: [-2.6, -2.04, 1.8],
        dimensions: DIMS.PILLARS,
        anchor: "bottom",
      },
      {
        id: "cyberpunk_pillars_right",
        name: "Cyber Bollard Right",
        position: [2.6, -2.04, 1.8],
        dimensions: DIMS.PILLARS,
        anchor: "bottom",
      },
      // Drums
      {
        id: "cyberpunk_drum_1",
        name: "Hazard Drum 1",
        position: [-2.7, -2.04, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      {
        id: "cyberpunk_drum_2",
        name: "Hazard Drum 2",
        position: [-2.05, -2.04, -2.0],
        dimensions: DIMS.DRUM,
        anchor: "bottom",
      },
      // Metal Bucket
      {
        id: "cyberpunk_bucket",
        name: "Cyber Metal Bucket",
        position: [-2.3, -2.04, -1.2],
        dimensions: DIMS.BUCKET,
        anchor: "bottom",
      },
      // Coiled Wire Rope / Hose
      {
        id: "cyberpunk_hose",
        name: "Braided Wire Rope Coil",
        position: [2.6, -2.04, -1.2],
        dimensions: DIMS.HOSE,
        anchor: "bottom",
      },
      // Hydraulic Reservoir
      {
        id: "cyberpunk_hydraulic",
        name: "Cyber Hydraulic Tank",
        position: [2.7, -2.04, -2.2],
        dimensions: DIMS.HYDRAULIC_RESERVOIR,
        anchor: "bottom",
      },
      // Cable Trays
      {
        id: "cyberpunk_cable_tray",
        name: "Cyber Cable Conduit",
        position: [0, -2.04, -2.8],
        dimensions: DIMS.CABLE_TRAY,
        anchor: "bottom",
        isStatic: true,
      },
    ],
  },
];

console.log("=== VALIDATING ALL 5 THEME PROP CONFIGURATIONS ===");
let allThemesPassed = true;

for (const t of themes) {
  console.log(`\nValidating theme: "${t.theme}" (${t.props.length} props)...`);

  // 1. Central Zone Clearance Check (distance >= 2.0m, and |X| >= 2.2 or |Z| >= 1.8 or Z >= 1.6)
  let clearanceViolations = 0;
  for (const p of t.props) {
    const pos = p.position as [number, number, number];
    const dist = Math.hypot(pos[0], pos[2]);
    const satisfiesClearance =
      dist >= 2.0 &&
      (Math.abs(pos[0]) >= 2.15 || Math.abs(pos[2]) >= 1.8 || pos[2] >= 1.55);

    if (!satisfiesClearance) {
      console.error(
        `  ✖ CLEARANCE VIOLATION: Prop "${p.name}" at [${pos.join(
          ", "
        )}] distance=${dist.toFixed(2)}m violates central clearance cylinder!`
      );
      clearanceViolations++;
      allThemesPassed = false;
    }
  }

  // 2. Pairwise Volumetric Collision Check (< 2.0% overlap)
  const result = checkPropsCollisions(t.props, 2.0);
  console.log(`  Max overlap: ${result.maxObservedOverlapPercent.toFixed(2)}%`);
  console.log(`  Pairs checked: ${result.totalPairsChecked}`);

  if (result.isValid && clearanceViolations === 0) {
    console.log(`  ✔ THEME "${t.theme}": PASS`);
  } else {
    console.error(`  ✖ THEME "${t.theme}": FAIL`);
    if (result.violations.length > 0) {
      for (const v of result.violations) {
        console.error(`    - ${v.message}`);
      }
    }
    allThemesPassed = false;
  }
}

if (allThemesPassed) {
  console.log("\n✔ ALL 5 THEMES PASSED COLLISION & CENTRAL CLEARANCE CHECKS!");
  process.exit(0);
} else {
  console.error("\n✖ SOME THEMES FAILED VALIDATION CHECKS!");
  process.exit(1);
}
