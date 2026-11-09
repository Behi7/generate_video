import React from "react";
import { ModelInspector } from "@shared/components/ModelInspector";
import { FactoryHeavyConcreteFloor } from "../environment/floors/FactoryHeavyConcreteFloor";

export const ConcreteFloorInspection: React.FC = () => {
  return (
    <ModelInspector
      title="AAA Heavy Factory Concrete Slab Floor (16m x 16m) • Forensic 4-View Audit"
      subtitle="4x4 Segmented Pours + Bitumen Expansion Joints (0.025m x 0.015m) + 3D Slotted Trench Drain + M24 Anchor Plates + Hazard Stripes"
      modelCenter={[0, 0, 0]}
      cameraTarget={[0, -2.04, 0]}
      gridY={-2.06}
      shadowY={-2.05}
      viewConfigs={{
        1: {
          name: "01 • FRONT VIEW",
          badge: "XY ELEVATED",
          badgeColor: "#F59E0B",
          position: [0, -0.85, 5.4],
          target: [0, -2.04, 0.2],
          fov: 38,
        },
        2: {
          name: "02 • SIDE RIGHT",
          badge: "ZY ELEVATED",
          badgeColor: "#06B6D4",
          position: [5.4, -0.85, 0],
          target: [0, -2.04, 0],
          fov: 38,
        },
        3: {
          name: "03 • TOP VIEW",
          badge: "XZ DIRECT DOWN",
          badgeColor: "#8B5CF6",
          position: [0, 5.6, 0.001],
          target: [0, -2.04, 0.1],
          fov: 42,
        },
        4: {
          name: "04 • HEROIC 3/4 ISO",
          badge: "STUDIO 3D",
          badgeColor: "#10B981",
          position: [3.6, 1.4, 4.8],
          target: [0, -2.04, 0],
          fov: 38,
        },
      }}
    >
      <FactoryHeavyConcreteFloor
        position={[0, -2.04, 0]}
        showMarkings={true}
        showTrenchDrain={true}
        showAnchorPlates={true}
        enableSpecularHighlights={true}
      />
    </ModelInspector>
  );
};

export default ConcreteFloorInspection;
