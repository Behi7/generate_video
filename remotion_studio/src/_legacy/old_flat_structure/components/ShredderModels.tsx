import React from "react";
import { MachineAssemblySpec } from "./AssemblyContract";
import { ManualDeskShredder } from "./ManualDeskShredder";
import { ElectricTwinShredder } from "./ElectricTwinShredder";
import { HeavyIndustrialShredder } from "./HeavyIndustrialShredder";
import { QuantumSingularityShredder } from "./QuantumSingularityShredder";
import {
  Tier4_Futuristic,
  Tier4Spec,
  Tier4AssemblySpec,
} from "./Tier4_Futuristic";
import { ShredderSpecimen } from "./ShredderSpecimen";

export {
  ManualDeskShredder,
  ElectricTwinShredder,
  HeavyIndustrialShredder,
  QuantumSingularityShredder,
  Tier4_Futuristic,
  Tier4Spec,
  Tier4AssemblySpec,
  ShredderSpecimen,
};

/**
 * AssemblyContract Specification for Tier 3 Heavy Industrial Dual-Shaft Shredder
 * Enforces Inside-Out Modular Assembly Law:
 * Order 0: Heavy Cast Iron Bed & Anchor Pedestals
 * Order 1: Internal Rotor Core (Hexagonal Shafts + 5-Hook Claw Blades Array)
 * Order 2: Ribbed Cutting Chamber, Beveled Hopper & Discharge Funnel
 * Order 3: Dual Planetary Gearboxes & Hydraulic Valve Manifold
 */
export const HeavyIndustrialShredderAssemblySpec: MachineAssemblySpec = {
  id: "heavy_industrial_shredder",
  name: "50-Ton Heavy Industrial Dual-Shaft Shredder",
  tier: 3,
  modules: [
    {
      id: "shredder_base_bed",
      name: "Cast-Iron Foundation Bed & H-Frame Columns",
      assemblyOrder: 0,
      snapFrame: 0,
      targetSocket: [0, 0, 0],
      render: () => <HeavyIndustrialShredder localFrame={10} />,
    },
    {
      id: "shredder_twin_rotor_core",
      name: "Dual Hexagonal Shafts & 5-Hook Claw Blades Rotor Core",
      assemblyOrder: 1,
      snapFrame: 20,
      entryDirection: "top",
      travelDistance: 3.8,
      targetSocket: [0, 1.65, 0],
      sparkColor: "#38BDF8",
      render: () => <HeavyIndustrialShredder localFrame={30} />,
    },
    {
      id: "shredder_casing_hopper",
      name: "Ribbed Cutting Chamber, Beveled Hopper & Discharge Funnel",
      assemblyOrder: 2,
      snapFrame: 40,
      entryDirection: "top",
      travelDistance: 3.8,
      targetSocket: [0, 1.65, 0],
      sparkColor: "#F59E0B",
      render: () => <HeavyIndustrialShredder localFrame={50} />,
    },
    {
      id: "shredder_gearboxes_hydraulics",
      name: "Dual Planetary Gearboxes & Hydraulic Valve Manifold",
      assemblyOrder: 3,
      snapFrame: 60,
      entryDirection: "back",
      travelDistance: 3.4,
      targetSocket: [0, 1.65, -0.56],
      sparkColor: "#D97706",
      fracture: {
        breakFrame: 265,
        mode: "fling_parabolic",
        impulse: [0.32, -0.25, 0.15],
        rotationImpulse: [1.8, 0.5, 2.2],
        sparkOrigin: [0.22, 1.65, 0],
        sparkColor: "#EF4444",
      },
      render: ({ localFrame }) => (
        <HeavyIndustrialShredder localFrame={localFrame} />
      ),
    },
  ],
};
