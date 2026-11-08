import React, { useMemo } from "react";
import { interpolate, Easing } from "remotion";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  validateAssemblySequence,
} from "../contracts/AssemblyContract";
import { SparkBurst } from "../vfx/SparkBurst";

/**
 * Newtonian Ballistic Flight & Damped Floor Bounce Simulation
 * Solves real ballistic trajectory: y(t) = y0 + v0y*t - 0.5*g*t^2
 * with multi-bounce elastic restitution (e = 0.35) and ground friction.
 */
function computeBallisticTrajectory(
  origin: [number, number, number],
  impulse: [number, number, number],
  rotationImpulse: [number, number, number],
  dt: number, // seconds
  floorY: number = 0.0,
  restitution: number = 0.35,
  friction: number = 0.65
): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const g = 9.81;
  const [x0, y0, z0] = origin;

  // Velocity scaling: if legacy small magnitude (< 1.0 m/s), scale to realistic m/s
  const mag = Math.hypot(impulse[0], impulse[1], impulse[2]);
  const velScale = mag > 0 && mag < 1.0 ? Math.max(1.0, 3.5 / mag) : 1.0;
  const v0x = impulse[0] * velScale;
  const v0y = impulse[1] * velScale;
  const v0z = impulse[2] * velScale;

  // Tumbling rotation: angular momentum damped over time
  const rotFactor = (1 - Math.exp(-1.4 * dt)) * 3.5;
  const rx = rotationImpulse[0] * rotFactor;
  const ry = rotationImpulse[1] * rotFactor;
  const rz = rotationImpulse[2] * rotFactor;

  // If already at or below floor level and moving downward, clamp
  if (y0 <= floorY && v0y <= 0) {
    return {
      position: [x0, floorY, z0],
      rotation: [rx, ry, rz],
    };
  }

  // 1. First arc: from t=0 to t1 (first impact with floorY)
  // 0.5 * g * t^2 - v0y * t + (floorY - y0) = 0
  const disc1 = v0y * v0y + 2 * g * (y0 - floorY);
  const sqrtDisc1 = disc1 > 0 ? Math.sqrt(disc1) : 0;
  const t1 = (v0y + sqrtDisc1) / g;

  if (dt <= t1) {
    // In free flight before first floor bounce
    const curY = y0 + v0y * dt - 0.5 * g * dt * dt;
    const curX = x0 + v0x * dt;
    const curZ = z0 + v0z * dt;
    return {
      position: [curX, Math.max(floorY, curY), curZ],
      rotation: [rx, ry, rz],
    };
  }

  // First bounce coordinates and rebounded velocities
  const x1 = x0 + v0x * t1;
  const z1 = z0 + v0z * t1;
  const v1y = sqrtDisc1 * restitution; // upward rebound
  const v1x = v0x * friction;
  const v1z = v0z * friction;

  // 2. Second arc: duration dt2 = 2 * v1y / g
  const dt2 = (2 * v1y) / g;
  const t2 = t1 + dt2;

  if (dt <= t2) {
    const tau = dt - t1;
    const curY = floorY + v1y * tau - 0.5 * g * tau * tau;
    const curX = x1 + v1x * tau;
    const curZ = z1 + v1z * tau;
    return {
      position: [curX, Math.max(floorY, curY), curZ],
      rotation: [rx, ry, rz],
    };
  }

  // Second bounce coordinates and rebounded velocities
  const x2 = x1 + v1x * dt2;
  const z2 = z1 + v1z * dt2;
  const v2y = v1y * restitution;
  const v2x = v1x * friction;
  const v2z = v1z * friction;

  // 3. Third arc: duration dt3 = 2 * v2y / g
  const dt3 = (2 * v2y) / g;
  const t3 = t2 + dt3;

  if (dt <= t3) {
    const tau = dt - t2;
    const curY = floorY + v2y * tau - 0.5 * g * tau * tau;
    const curX = x2 + v2x * tau;
    const curZ = z2 + v2z * tau;
    return {
      position: [curX, Math.max(floorY, curY), curZ],
      rotation: [rx, ry, rz],
    };
  }

  // After 3rd bounce: settled firmly on floor bed
  const finalX = x2 + v2x * dt3;
  const finalZ = z2 + v2z * dt3;
  return {
    position: [finalX, floorY, finalZ],
    rotation: [rx, ry, rz],
  };
}

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

  // True Newtonian Ballistic Physics during overload catastrophe (Act 4: 265..289f)
  if (isBroken && part.fracture && localFrame >= part.fracture.breakFrame) {
    const f = part.fracture;
    const dt = (localFrame - f.breakFrame) / 30.0;

    if (f.mode === "fling_parabolic" || f.mode === "shear_and_tilt") {
      const ballistic = computeBallisticTrajectory(
        part.targetSocket,
        f.impulse,
        f.rotationImpulse,
        dt,
        0.0,  // floor bed local Y
        0.35, // elastic restitution
        0.65  // ground friction
      );
      curX = ballistic.position[0];
      curY = ballistic.position[1];
      curZ = ballistic.position[2];
      curRx = ballistic.rotation[0];
      curRy = ballistic.rotation[1];
      curRz = ballistic.rotation[2];
    } else if (f.mode === "shudder_and_crack") {
      const shudder =
        Math.sin((localFrame - f.breakFrame) * 6) *
        0.03 *
        Math.exp(-(localFrame - f.breakFrame) * 0.2);
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
