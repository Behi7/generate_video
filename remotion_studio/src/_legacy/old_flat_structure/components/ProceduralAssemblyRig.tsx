import React, { useMemo } from "react";
import { interpolate, Easing } from "remotion";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  validateAssemblySequence,
} from "./AssemblyContract";
import { SparkBurst } from "./SparkBurst";

export interface ProceduralAssemblyRigProps {
  spec: MachineAssemblySpec;
  localFrame: number; // 0..289 local tier frame
  isRunning?: boolean;
  rpm?: number;
  isBroken?: boolean;
}

export const ProceduralAssemblyRig: React.FC<ProceduralAssemblyRigProps> = ({
  spec,
  localFrame,
  isRunning = false,
  rpm = 0,
  isBroken = false,
}) => {
  // 1. Sort modules strictly by assemblyOrder
  const sortedModules = useMemo(() => {
    const val = validateAssemblySequence(spec.modules);
    if (!val.valid) {
      console.warn(`[ProceduralAssemblyRig] Assembly validation warnings for ${spec.name}:`, val.errors);
    }
    return [...spec.modules].sort((a, b) => a.assemblyOrder - b.assemblyOrder);
  }, [spec]);

  return (
    <group name={`assembly_${spec.id}`} userData={{ specId: spec.id, specName: spec.name, tier: spec.tier }}>
      {sortedModules.map((part) => {
        return (
          <ModularPartInstance
            key={part.id}
            part={part}
            localFrame={localFrame}
            isRunning={isRunning}
            rpm={rpm}
            isBroken={isBroken}
          />
        );
      })}
    </group>
  );
};

interface ModularPartInstanceProps {
  part: ModularPartSpec;
  localFrame: number;
  isRunning: boolean;
  rpm: number;
  isBroken: boolean;
}

const ModularPartInstance: React.FC<ModularPartInstanceProps> = ({
  part,
  localFrame,
  isRunning,
  rpm,
  isBroken,
}) => {
  const duration = part.travelDurationFrames || 5;
  const startFrame = part.snapFrame - duration;

  // Rule: Do not render module until its entry frame window opens
  if (localFrame < startFrame) {
    return null;
  }

  // Calculate starting trajectory position
  let startX = part.targetSocket[0];
  let startY = part.targetSocket[1];
  let startZ = part.targetSocket[2];
  const dist = part.travelDistance || 3.5;

  if (part.customEntryFrom) {
    [startX, startY, startZ] = part.customEntryFrom;
  } else {
    const dir = part.entryDirection || "top";
    switch (dir) {
      case "top":
        startY += dist;
        break;
      case "bottom":
        startY -= dist;
        break;
      case "left":
        startX -= dist;
        break;
      case "right":
        startX += dist;
        break;
      case "front":
        startZ += dist;
        break;
      case "back":
        startZ -= dist;
        break;
    }
  }

  // Position & Scale calculations
  let curX = part.targetSocket[0];
  let curY = part.targetSocket[1];
  let curZ = part.targetSocket[2];
  let curRx = 0;
  let curRy = 0;
  let curRz = 0;
  let scale = 1;

  if (localFrame < part.snapFrame) {
    // Magnetic approach trajectory
    const progress = interpolate(localFrame, [startFrame, part.snapFrame], [0, 1], {
      easing: Easing.bezier(0.05, 0.9, 0.1, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    curX = startX + (part.targetSocket[0] - startX) * progress;
    curY = startY + (part.targetSocket[1] - startY) * progress;
    curZ = startZ + (part.targetSocket[2] - startZ) * progress;
  } else if (localFrame < part.snapFrame + 6) {
    // 6-frame elastic micro-bounce ring upon locking into socket
    const bounceOffset = localFrame - part.snapFrame;
    const bounceAmp = 0.035 * Math.exp(-bounceOffset * 0.5) * Math.sin(bounceOffset * Math.PI);
    scale = 1 + bounceAmp;
  }

  // Fracture displacement during overload catastrophe (Act 4: 250..289f)
  if (isBroken && part.fracture && localFrame >= part.fracture.breakFrame) {
    const f = part.fracture;
    const fProgress = interpolate(localFrame, [f.breakFrame, f.breakFrame + 14], [0, 1], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (f.mode === "fling_parabolic") {
      curX += f.impulse[0] * fProgress;
      curY += f.impulse[1] * fProgress * 2.2 - 2.6 * fProgress * fProgress;
      curZ += f.impulse[2] * fProgress;
      curRx += f.rotationImpulse[0] * fProgress * 2.2;
      curRy += f.rotationImpulse[1] * fProgress * 2.2;
      curRz += f.rotationImpulse[2] * fProgress * 2.2;
    } else if (f.mode === "shear_and_tilt") {
      curX += f.impulse[0] * fProgress;
      curY += f.impulse[1] * fProgress;
      curZ += f.impulse[2] * fProgress;
      curRx += f.rotationImpulse[0] * fProgress;
      curRy += f.rotationImpulse[1] * fProgress;
      curRz += f.rotationImpulse[2] * fProgress;
    } else if (f.mode === "shudder_and_crack") {
      const shudder = Math.sin((localFrame - f.breakFrame) * 6) * 0.03 * Math.exp(-(localFrame - f.breakFrame) * 0.2);
      curX += shudder;
      curRz += shudder * 0.6;
    }
  }

  // Spark burst on locking snap impact
  const isImpactActive = localFrame >= part.snapFrame && localFrame <= part.snapFrame + 4;
  const impactOffset = localFrame - part.snapFrame;

  // Fracture shear spark burst
  const isFractureActive =
    Boolean(part.fracture &&
    localFrame >= part.fracture.breakFrame &&
    localFrame <= part.fracture.breakFrame + 4);
  const fractureOffset = part.fracture ? localFrame - part.fracture.breakFrame : 0;

  return (
    <group
      name={`module_${part.id}`}
      userData={{
        isAssemblyModule: true,
        order: part.assemblyOrder,
        id: part.id,
        name: part.name,
      }}
    >
      <group
        name={`part_geometry_${part.id}`}
        position={[curX, curY, curZ]}
        rotation={[curRx, curRy, curRz]}
        scale={[scale, scale, scale]}
        userData={{
          isMechanicalPart: true,
          order: part.assemblyOrder,
          id: part.id,
          name: part.name,
        }}
      >
        {part.render({ localFrame, isRunning, rpm, isBroken })}
      </group>

      {/* Assembly lock contact sparks */}
      <SparkBurst
        active={isImpactActive}
        frameOffset={impactOffset}
        position={part.targetSocket}
        color={part.sparkColor || "#FBBF24"}
        scale={1.2}
        count={part.sparkCount || 14}
      />

      {/* Catastrophic fracture sparks */}
      {part.fracture && (
        <SparkBurst
          active={isFractureActive}
          frameOffset={fractureOffset}
          position={part.fracture.sparkOrigin}
          color={part.fracture.sparkColor || "#EF4444"}
          scale={1.6}
          count={20}
        />
      )}
    </group>
  );
};
