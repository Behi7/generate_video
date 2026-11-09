import React from "react";
import { DestructibleHandPump } from "./DestructibleHandPump";
import { ModularPistonPump } from "./ModularPistonPump";
import { ModularTurboPump } from "./ModularTurboPump";
import { ModularQuantumReactor } from "./ModularQuantumReactor";

export const EpicTransformingStage: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Destructible $10 Hand Pump (Snaps & breaks apart at frame 115) */}
      <DestructibleHandPump />

      {/* 2. Modular $100 Piston Pump (Snaps at 133, on-machine brass lever at 180, blows out at 300) */}
      <ModularPistonPump />

      {/* 3. Modular $1 000 Turbo-Pump (Snaps at 316, on-motor red button at 360, ruptures at 495) */}
      <ModularTurboPump />

      {/* 4. Modular $100 000+ Quantum Reactor (Snaps at 514, armored cable slams at 560, plasma climax) */}
      <ModularQuantumReactor />
    </group>
  );
};
