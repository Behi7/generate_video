import React from "react";
import { DestructibleDynamo } from "./DestructibleDynamo";
import { ModularPistonGenerator } from "./ModularPistonGenerator";
import { ModularTurboGenerator } from "./ModularTurboGenerator";
import { ModularTokamakReactor } from "./ModularTokamakReactor";

export const GeneratorStage: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Destructible $10 Hand Dynamo (Active 0-114, Destructs 115-124) */}
      <DestructibleDynamo />

      {/* 2. Modular $100 Piston Generator (Snaps 133, Lever 180, Destructs 300-309) */}
      <ModularPistonGenerator />

      {/* 3. Modular $1 000 Turbo Generator (Snaps 316, Red Button 360, Blowout 495-504) */}
      <ModularTurboGenerator />

      {/* 4. Modular $100 000+ Tokamak Reactor (Snaps 514, Cable Slam 560, Plasma Climax 560-720) */}
      <ModularTokamakReactor />
    </group>
  );
};
