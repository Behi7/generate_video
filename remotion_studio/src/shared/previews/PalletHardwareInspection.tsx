import React from "react";
import { ModelInspector } from "../components/ModelInspector";
import { WoodenPallet } from "../environment/props/WoodenPallet";
import { ScatteredHardware } from "../environment/props/ScatteredHardware";
import { ContactShadows } from "@react-three/drei";

/**
 * PalletHardwareInspection:
 * Forensic 4-View Inspection Composition (Front, Side, Top, Iso)
 * Auditing:
 * 1. Standard Euro-Pallet (EPAL 1.2m x 0.8m x 0.144m)
 * 2. High-detail Scattered Fastener Hardware (M16/M20 hex bolts, hex nuts, flat & lock washers)
 */
export const PalletHardwareInspection: React.FC = () => {
  return (
    <ModelInspector
      title="Industrial Props • Euro Wooden Pallet & Scattered Workshop Hardware"
      subtitle="EPAL Standard Timber (1.2m x 0.8m x 0.14m) + Heavy Bolts, Hex Nuts & Split Washers"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, 0.08, 0]}
      cameraDistanceMultiplier={0.54}
      gridY={0}
      shadowY={-0.002}
    >
      {/* 1. Realistic Soft Ambient Contact Shadow under pallet base and floor cluster */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.88}
        scale={2.8}
        blur={1.6}
        far={1.4}
      />

      {/* 2. Standard Industrial Euro-Pallet (1.2m x 0.8m x 0.144m) */}
      <WoodenPallet position={[0, 0, 0]} rotation={[0, 0, 0]} />

      {/* 3. Primary Fastener Cluster: On Top Deck Planks of the Pallet */}
      <ScatteredHardware
        position={[0.2, 0.144, -0.04]}
        rotation={[0, 0.35, 0]}
        count={12}
      />

      {/* 4. Secondary Floor Scatter: Natural Workshop Spill on Ground in Front */}
      <ScatteredHardware
        position={[-0.38, 0, 0.46]}
        rotation={[0, -0.65, 0]}
        count={10}
      />

      {/* 5. Precision Accent Fastener Pair on the Side Runner Footing */}
      <ScatteredHardware
        position={[0.54, 0, 0.44]}
        rotation={[0, 1.2, 0]}
        count={4}
      />
    </ModelInspector>
  );
};

export default PalletHardwareInspection;
