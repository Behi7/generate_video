/**
 * AssemblyContract.ts
 * Unified specification for modular 3D machine parts, sockets, and collision-free assembly sequences.
 * 
 * Enforces the strict mechanical sequence:
 * Order 0: Base / Platform Bed
 * Order 1: Internal Core / Shaft / Crank / Rotor (internal mechanics MUST enter before casing)
 * Order 2: Outer Housing / Engine Casing / Enclosure
 * Order 3: Top Head / Chuck / Gearbox
 * Order 4: Working Tool / Drill Bit / Plasma Emitter
 */

import React from "react";

export type Vector3 = [number, number, number];

export type SnapEntryDirection = 
  | "top" 
  | "bottom" 
  | "left" 
  | "right" 
  | "front" 
  | "back";

export interface MountSocket {
  name: string;
  position: Vector3; // World or local offset where this socket connects
  rotation?: Vector3;
}

export interface FractureSpec {
  breakFrame: number; // Local frame in tier (e.g. 250..270)
  mode: "shear_and_tilt" | "fling_parabolic" | "shudder_and_crack" | "meltdown" | "boss_reverse_shatter";
  impulse: Vector3; // Physical displacement vector [dx, dy, dz]
  rotationImpulse: Vector3; // Rotational velocity [rx, ry, rz]
  sparkOrigin: Vector3; // Coordinates where shear sparks burst
  sparkColor?: string;
}

/**
 * Universal Kinematics & Specimen Synchronization Contract
 * Enforces that specimens never disappear prematurely and machines deform organically.
 */
export interface SpecimenSyncContract {
  id: string;
  name: string;
  materialType: "plastic" | "aluminum" | "steel" | "stone" | "glass" | "quantum" | "invulnerable_boss";
  contactThroatY: number; // Contact plane coordinate along Y axis
  startTouchFrame: number; // Canonical: 150f (Act 3 start)
  endDisintegrateFrame: number; // Canonical: 249f (Act 3 end)
  isInvulnerable?: boolean; // For Act 4 boss twists (e.g. Nokia 3310 causing machine destruction)
}

export interface KinematicChoreographySpec {
  motionType: "rotary" | "reciprocating_plunge" | "thermal_glow_pulse" | "laser_beam" | "stationary";
  axis?: "x" | "y" | "z";
  torqueHesitation?: boolean; // Micro-vibrations upon biting into material
  rpmCurve?: (localFrame: number) => number;
}

export interface ModularPartSpec {
  id: string;
  name: string;
  assemblyOrder: number; // Strict sequence: 0, 1, 2, 3, 4
  
  // Mounting coordinates
  targetSocket: Vector3; // Final resting position on the machine
  mountSockets?: MountSocket[]; // Child sockets exposed to later modules
  
  // Collision-free entry vector
  entryDirection?: SnapEntryDirection;
  customEntryFrom?: Vector3; // Exact starting coordinates if not using direction string
  travelDistance?: number; // Distance in meters (default: 3.5)
  travelDurationFrames?: number; // Duration of snap in frames (default: 5)
  
  // Acoustic & visual signature
  snapFrame: number; // Local frame in tier when module locks (e.g. 0, 20, 40, 60)
  sparkColor?: string;
  sparkCount?: number;
  
  // Overload fracture behavior
  fracture?: FractureSpec;
  
  // Pure 3D JSX Component (receives local frame, running state)
  render: (props: ModularPartRenderProps) => React.ReactNode;
}

export interface ModularPartRenderProps {
  localFrame: number; // Local tier frame (0..289)
  isRunning: boolean; // Whether machine has spooled up (Act 2 & 3: 70..249)
  rpm: number; // Current revolutions per minute for rotating parts
  isBroken: boolean; // Whether fracture has occurred (Act 4: 250..289)
}

export interface MachineAssemblySpec {
  id: string;
  name: string;
  tier: number; // 1 ($10), 2 ($100), 3 ($1 000), 4 ($100 000+)
  modules: ModularPartSpec[];
}

/**
 * Validates module sequence to guarantee collision-free assembly.
 * Throws an explicit error if outer casing is mounted before internal core.
 */
export function validateAssemblySequence(modules: ModularPartSpec[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const sorted = [...modules].sort((a, b) => a.assemblyOrder - b.assemblyOrder);

  // Check unique IDs
  const idSet = new Set<string>();
  for (const m of modules) {
    if (idSet.has(m.id)) {
      errors.push(`Duplicate module id detected: "${m.id}"`);
    }
    idSet.add(m.id);
  }

  // Check monotonic snapFrame progression
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];

    if (cur.assemblyOrder === next.assemblyOrder) {
      errors.push(`Modules "${cur.id}" and "${next.id}" share the same assemblyOrder (${cur.assemblyOrder})!`);
    }

    if (cur.snapFrame >= next.snapFrame) {
      errors.push(
        `Module "${next.id}" (snapFrame=${next.snapFrame}) attempts to snap before or at the same time as preceding "${cur.id}" (snapFrame=${cur.snapFrame})!`
      );
    }

    // Clearance rule: Module 2 (casing) cannot snap before Module 1 (rotor)
    if (cur.assemblyOrder > next.assemblyOrder) {
      errors.push(`Assembly order inversion: ${cur.id} (${cur.assemblyOrder}) > ${next.id} (${next.assemblyOrder})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
