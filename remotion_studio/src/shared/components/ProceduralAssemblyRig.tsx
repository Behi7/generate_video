import React, { useMemo } from "react";
import { interpolate, Easing } from "remotion";
import {
  MachineAssemblySpec,
  ModularPartSpec,
  validateAssemblySequence,
} from "../contracts/AssemblyContract";
import {
  getFluidStrainProgress,
  getResonanceShudder,
  getCleanserProgress,
  isStageCleansed,
} from "../contracts/StageTimeline";
import {
  TransitionEffectType,
  getTierTransition,
} from "../vfx/transitions/TransitionRegistry";
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

/**
 * Zero-G Anti-Gravity Hover & Gravitational Vortex Trajectory Simulation
 * For Black Hole Singularity Cleanser Transition (frames 234..308):
 * - 234..244 (10f): Explosive outward fracture impulse (stays strictly within camera FOV).
 * - 245..258 (14f): Anti-gravity zero-g hover in mid-air (weightless harmonic bobbing, no floor drop!).
 * - 259..296 (38f): Inward orbital spiral suction into black hole singularity with spaghettification.
 * - 297..308: 100% swallowed (scale = 0).
 */
function computeZeroGBlackHolePartTrajectory(
  targetSocket: [number, number, number],
  impulse: [number, number, number],
  rotationImpulse: [number, number, number],
  localFrame: number,
  breakFrame: number,
  partOrder: number
): {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
} {
  const [sx, sy, sz] = targetSocket;
  const elapsed = localFrame - breakFrame;

  // Fallback angle from order if impulse horizontal is 0
  const angle0 = Math.atan2(
    impulse[2] !== 0 ? impulse[2] : Math.sin(partOrder * 1.5 + 0.4),
    impulse[0] !== 0 ? impulse[0] : Math.cos(partOrder * 1.5 + 0.4)
  );
  // Keep outward radius strictly within camera frame (0.35m .. 0.65m)
  const targetDist = 0.35 + (partOrder % 4) * 0.09;
  // Lift into mid-air: maintain elevation >= 0.75m above table (NO dropping to floor!)
  const targetElev = Math.max(0.75, sy + (impulse[1] > 0 ? impulse[1] * 0.12 : 0.22));

  // Singularity centroid in stage coordinates (1.35m above stage)
  const singY = 1.35;

  if (elapsed < 10) {
    // 1. Explosive Outward Burst (frames 234..244, 10f)
    const burstT = interpolate(elapsed, [0, 10], [0, 1], {
      easing: Easing.bezier(0.12, 0.9, 0.15, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const dist = burstT * targetDist;
    const curX = sx + Math.cos(angle0) * dist;
    const curZ = sz + Math.sin(angle0) * dist;
    const curY = sy + (targetElev - sy) * burstT + Math.sin(burstT * Math.PI) * 0.12;

    const curRx = rotationImpulse[0] * burstT * 1.6;
    const curRy = rotationImpulse[1] * burstT * 1.8;
    const curRz = rotationImpulse[2] * burstT * 1.6;

    return {
      position: [curX, curY, curZ],
      rotation: [curRx, curRy, curRz],
      scale: 1,
    };
  }

  // Pre-calculate hover end state at frame 244 (elapsed = 10)
  const hoverBaseX = sx + Math.cos(angle0) * targetDist;
  const hoverBaseZ = sz + Math.sin(angle0) * targetDist;
  const hoverBaseY = targetElev;
  const hoverBaseRx = rotationImpulse[0] * 1.6;
  const hoverBaseRy = rotationImpulse[1] * 1.8;
  const hoverBaseRz = rotationImpulse[2] * 1.6;

  if (elapsed < 24) {
    // 2. Anti-Gravity Zero-G Hover (frames 245..258, 14f)
    const hoverAge = elapsed - 10;
    const bobY = Math.sin(hoverAge * 0.22 + partOrder * 1.2) * 0.025;
    const driftX = Math.sin(hoverAge * 0.18 + partOrder) * 0.012;
    const driftZ = Math.cos(hoverAge * 0.18 + partOrder) * 0.012;

    const curX = hoverBaseX + driftX;
    const curY = hoverBaseY + bobY;
    const curZ = hoverBaseZ + driftZ;

    const curRx = hoverBaseRx + hoverAge * 0.012;
    const curRy = hoverBaseRy + hoverAge * 0.018;
    const curRz = hoverBaseRz + hoverAge * 0.010;

    return {
      position: [curX, curY, curZ],
      rotation: [curRx, curRy, curRz],
      scale: 1,
    };
  }

  // 3. Gravitational Vortex Spiral Suction (frames 259..296, 38f)
  const stagger = (partOrder % 4) * 2; // 0, 2, 4, 6
  const suctionStart = 24 + stagger;
  const suctionEnd = 62; // elapsed = 62 -> frame 296

  if (elapsed < suctionStart) {
    // Still hovering before suction staggered start
    const hoverAge = elapsed - 10;
    const bobY = Math.sin(hoverAge * 0.22 + partOrder * 1.2) * 0.025;
    const driftX = Math.sin(hoverAge * 0.18 + partOrder) * 0.012;
    const driftZ = Math.cos(hoverAge * 0.18 + partOrder) * 0.012;

    return {
      position: [hoverBaseX + driftX, hoverBaseY + bobY, hoverBaseZ + driftZ],
      rotation: [hoverBaseRx + hoverAge * 0.012, hoverBaseRy + hoverAge * 0.018, hoverBaseRz + hoverAge * 0.010],
      scale: 1,
    };
  }

  if (elapsed >= suctionStart && elapsed < suctionEnd) {
    const suctionT = interpolate(elapsed, [suctionStart, suctionEnd], [0, 1], {
      easing: Easing.bezier(0.35, 0.0, 0.15, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const r = targetDist * Math.pow(1 - suctionT, 1.6);
    const spiralAngle = angle0 + Math.pow(suctionT, 2.2) * (Math.PI * 10 + partOrder * 0.8);

    const curX = Math.cos(spiralAngle) * r;
    const curZ = Math.sin(spiralAngle) * r;
    const curY = interpolate(suctionT, [0, 1], [hoverBaseY, singY]);

    const curRx = hoverBaseRx + suctionT * 4.5;
    const curRy = hoverBaseRy + Math.pow(suctionT, 2) * Math.PI * 12;
    const curRz = hoverBaseRz + suctionT * 3.8;

    const scale = Math.max(0, 1 - Math.pow(suctionT, 1.5));

    return {
      position: [curX, curY, curZ],
      rotation: [curRx, curRy, curRz],
      scale,
    };
  }

  // 4. Swallowed completely by frame 296..319
  return {
    position: [0, singY, 0],
    rotation: [0, 0, 0],
    scale: 0,
  };
}

export interface ProceduralAssemblyRigProps {
  spec: MachineAssemblySpec;
  localFrame: number; // 0..319 local tier frame
  isRunning?: boolean;
  rpm?: number;
  isBroken?: boolean;
  seed?: string;
  transitionEffect?: TransitionEffectType;
}

export const ProceduralAssemblyRig: React.FC<ProceduralAssemblyRigProps> = ({
  spec,
  localFrame,
  isRunning = false,
  rpm = 0,
  isBroken = false,
  seed,
  transitionEffect,
}) => {
  // 1. Clean stage guarantee: at frame 310..319, everything is clean, zero ghost meshes remain
  if (isStageCleansed(localFrame)) {
    return null;
  }

  // 2. Determine active transition effect for this tier
  const activeEffect = useMemo<TransitionEffectType>(() => {
    if (transitionEffect) return transitionEffect;
    return getTierTransition(seed || spec.id || `tier_${spec.tier}`, spec.tier);
  }, [transitionEffect, seed, spec.id, spec.tier]);

  // 3. Sort modules strictly by assemblyOrder
  const sortedModules = useMemo(() => {
    const val = validateAssemblySequence(spec.modules);
    if (!val.valid) {
      console.warn(`[ProceduralAssemblyRig] Assembly validation warnings for ${spec.name}:`, val.errors);
    }
    return [...spec.modules].sort((a, b) => a.assemblyOrder - b.assemblyOrder);
  }, [spec]);

  const cleanserProgress = getCleanserProgress(localFrame);

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
            cleanserEffect={activeEffect}
            cleanserProgress={cleanserProgress}
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
  cleanserEffect: TransitionEffectType;
  cleanserProgress: number;
}

const ModularPartInstance: React.FC<ModularPartInstanceProps> = ({
  part,
  localFrame,
  isRunning,
  rpm,
  isBroken,
  cleanserEffect,
  cleanserProgress,
}) => {
  const duration = part.travelDurationFrames || 5;
  const startFrame = part.snapFrame - duration;

  // Rule 1: Do not render module until its entry frame window opens
  if (localFrame < startFrame) {
    return null;
  }

  // Rule 2: Clean stage guarantee by frame 308
  if (localFrame >= 308) {
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

  // ---------------------------------------------------------------------------
  // FLUID 4-STAGE ESCALATION (Act 4: 213..319f)
  // ---------------------------------------------------------------------------

  // Stage 1 (213..224f): Organic strain & RPM deceleration with torque bog-down and heat/shudder build-up
  if (localFrame >= 213 && localFrame < 225) {
    const strainProgress = getFluidStrainProgress(localFrame);
    const strainJitter = Math.sin(localFrame * 14.0) * 0.002 * strainProgress;
    curX += strainJitter;
    curZ += strainJitter * 0.6;
  }

  // Stage 2 (225..233f): Resonant pre-fracture shudder wave (increasing frequency & amplitude)
  if (localFrame >= 225 && localFrame < 234) {
    const { shudderX, shudderZ } = getResonanceShudder(localFrame);
    curX += shudderX;
    curZ += shudderZ;
  }

  // Stage 3 (234..307f): Fracture rupture & active Cleanser Transition Effect
  // Fracture occurs at part breakFrame if defined, defaulting to canonical 234
  const breakFrame = (part.fracture as any)?.breakFrame ?? 234;
  const isLaserCleanser = cleanserEffect === "laser_scan_cleanser";

  if (isLaserCleanser) {
    // In laser scan cleanser, the machine MUST remain intact and rigidly seated on the bed
    // so the Three.js planar clipping plane can descend and slice through intact geometry!
    if (localFrame >= breakFrame) {
      const laserJitter =
        localFrame < 244
          ? Math.sin(localFrame * 35.0) * 0.0015
          : localFrame <= 300
          ? Math.sin(localFrame * 48.0) * 0.0010
          : 0;
      curX = part.targetSocket[0] + laserJitter;
      curY = Math.max(0.0, part.targetSocket[1]);
      curZ = part.targetSocket[2] + laserJitter * 0.5;
      curRx = 0;
      curRy = 0;
      curRz = 0;
    }
  } else if (isBroken && localFrame >= breakFrame) {
    if (cleanserEffect === "black_hole_singularity") {
      const impulse = part.fracture?.impulse ?? [
        Math.cos(part.assemblyOrder * 1.5) * 1.8,
        1.4,
        Math.sin(part.assemblyOrder * 1.5) * 1.8,
      ];
      const rotImpulse = part.fracture?.rotationImpulse ?? [1.5, 2.0, 1.2];
      const bh = computeZeroGBlackHolePartTrajectory(
        part.targetSocket,
        impulse,
        rotImpulse,
        localFrame,
        breakFrame,
        part.assemblyOrder
      );
      curX = bh.position[0];
      curY = bh.position[1];
      curZ = bh.position[2];
      curRx = bh.rotation[0];
      curRy = bh.rotation[1];
      curRz = bh.rotation[2];
      scale = bh.scale;
    } else if (cleanserEffect === "pneumatic_air_blast") {
      // In pneumatic air blast, the machine is shattered into 32 mechanical fragments inside PneumaticAirBlast
      // Hide the monolithic modules immediately at breakFrame so only detailed fragments fly
      scale = 0;
      return null;
    } else if (cleanserEffect === "ash_disintegration") {
      // In ash disintegration, parts remain strictly locked on the bed in their assembled sockets,
      // undergoing thermal micro-shudder rather than flinging into walls/floor
      const shudder =
        Math.sin((localFrame - breakFrame) * 14) *
        0.008 *
        Math.exp(-(localFrame - breakFrame) * 0.08);
      curX = part.targetSocket[0] + shudder;
      curY = Math.max(0.0, part.targetSocket[1]);
      curZ = part.targetSocket[2];
      curRx = 0;
      curRy = 0;
      curRz = 0;
    } else if (part.fracture) {
      const f = part.fracture;
      const dt = Math.max(0, (localFrame - breakFrame) / 30.0);

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
          Math.sin((localFrame - breakFrame) * 6) *
          0.03 *
          Math.exp(-(localFrame - breakFrame) * 0.2);
        curX += shudder;
        curRz += shudder * 0.6;
      }
    }
  }

  // Spark burst on locking snap impact
  const isImpactActive = localFrame >= part.snapFrame && localFrame <= part.snapFrame + 4;
  const impactOffset = localFrame - part.snapFrame;

  // Fracture shear spark burst at rupture (suppressed for ash disintegration and laser scan cleanser)
  const isFractureActive = Boolean(
    !isLaserCleanser &&
    cleanserEffect !== "ash_disintegration" &&
    part.fracture &&
    localFrame >= breakFrame &&
    localFrame <= breakFrame + 4
  );
  const fractureOffset = Math.max(0, localFrame - breakFrame);

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
        {part.render({
          localFrame,
          isRunning,
          rpm,
          isBroken,
          cleanserEffect,
          cleanserProgress,
        })}
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
