import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export interface IndustrialBlastDoorWallProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  beaconActive?: boolean;
  beaconColor?: string;
  doorColor?: string;
  frameColor?: string;
  wallColor?: string;
}

// ============================================================================
// Procedural Canvas Textures (SSR safe, generated in-memory)
// ============================================================================

/** Generate crisp alternating 45° yellow and black industrial hazard chevrons */
function createHazardChevronTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Safety Amber background
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(0, 0, 1024, 128);

  // High-contrast midnight black/slate stripes at 45 degrees
  ctx.fillStyle = "#0F172A";
  const stripeWidth = 64;
  for (let x = -160; x < 1024 + 160; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + 128, 128);
    ctx.lineTo(x + 128, 128);
    ctx.closePath();
    ctx.fill();
  }

  // Heavy top and bottom black border framing
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, 1024, 8);
  ctx.fillRect(0, 120, 1024, 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  texture.needsUpdate = true;
  return texture;
}

/** Generate ultra-sharp industrial warning and bay designation stencil */
function createDoorStencilTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 1024, 512);

  // Outer safety bracket border
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, 952, 440);

  // Danger Header Banner
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(44, 44, 936, 68);

  // Header Text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 32px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("▲ RESTRICTED AIRLOCK // DANGER ▲", 512, 78);

  // Large Stencil Bay Designation
  ctx.fillStyle = "#F59E0B";
  ctx.font = "900 114px 'Arial Black', sans-serif";
  ctx.fillText("BAY 04", 512, 205);

  // Secondary Warning Text
  ctx.fillStyle = "#F1F5F9";
  ctx.font = "800 40px 'Arial Black', sans-serif";
  ctx.fillText("AUTHORIZED PERSONNEL ONLY", 512, 305);

  // Dividing Divider Bar
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(944, 360);
  ctx.stroke();

  // Engineering & Testing Zone Specifications
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "700 24px monospace";
  ctx.fillText("HIGH PRESSURE TESTING ZONE • 125 PSI", 512, 400);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "600 20px monospace";
  ctx.fillText("SPEC: MIL-STD-902B • DOG WHEEL ENGAGED", 512, 436);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Left Bay Secondary technical specification stencil */
function createLeftBayStencilTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 1024, 512);

  // Outer border
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, 952, 440);

  // Safety Amber Header
  ctx.fillStyle = "#EAB308";
  ctx.fillRect(44, 44, 936, 68);

  ctx.fillStyle = "#0F172A";
  ctx.font = "900 32px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BLAST ISOLATION BARRIER", 512, 78);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "900 76px 'Arial Black', sans-serif";
  ctx.fillText("CLASS IV", 512, 195);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "800 36px 'Arial Black', sans-serif";
  ctx.fillText("OVERPRESSURE CONTAINMENT", 512, 280);

  // Divider
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 340);
  ctx.lineTo(944, 340);
  ctx.stroke();

  ctx.fillStyle = "#DC2626";
  ctx.font = "700 28px monospace";
  ctx.fillText("ROTARY DOGGING WHEEL MANDATORY", 512, 390);

  ctx.fillStyle = "#E2E8F0";
  ctx.font = "600 22px monospace";
  ctx.fillText("INTERLOCK ID: BLST-8840-X // ZONE 04", 512, 432);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Header Lintel Red Danger Plaque Texture */
function createHeaderPlaqueTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#DC2626";
  ctx.fillRect(0, 0, 1024, 128);

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 1004, 108);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 48px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚠ HIGH PRESSURE TESTING ZONE ⚠", 512, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Secondary caution warning plate */
function createCautionPlateTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = "#EAB308";
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, 492, 108);

  ctx.fillStyle = "#DC2626";
  ctx.fillRect(18, 18, 140, 92);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 24px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DANGER", 88, 64);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "800 22px 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("KEEP CLEAR OF", 175, 50);
  ctx.fillStyle = "#F59E0B";
  ctx.fillText("DOGGING MECHANISM", 175, 78);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Hex bolt head with washer */
const HexBolt: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1.0 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* Washer */}
    <mesh position={[0, 0, 0.005]}>
      <cylinderGeometry args={[0.028, 0.028, 0.008, 16]} />
      <meshStandardMaterial color="#64748B" roughness={0.35} metalness={0.9} />
    </mesh>
    {/* Hex Bolt Head */}
    <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.021, 0.021, 0.018, 6]} />
      <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
    </mesh>
  </group>
);

/** Heavy 3-part welded cylindrical barrel hinge */
const WeldedBarrelHinge: React.FC<{
  position: [number, number, number];
}> = ({ position }) => (
  <group position={position}>
    {/* Wall/Frame Mounting Bracket with 4 heavy mounting bolts */}
    <group position={[-0.10, 0, -0.06]}>
      <RoundedBox args={[0.18, 0.26, 0.12]} radius={0.015} smoothness={4}>
        <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.75} />
      </RoundedBox>
      {/* 4 Bracket anchor bolts */}
      {[-0.05, 0.05].map((bx, i) =>
        [-0.08, 0.08].map((by, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[bx, by, 0.065]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.016, 0.016, 0.016, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.9} />
          </mesh>
        ))
      )}
    </group>

    {/* Door Leaf Mounting Bracket with reinforcement gusset */}
    <group position={[0.09, 0, -0.04]}>
      <RoundedBox args={[0.16, 0.22, 0.10]} radius={0.015} smoothness={4}>
        <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.75} />
      </RoundedBox>
      {/* Gusset web */}
      <mesh position={[-0.03, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.18, 0.06]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
      </mesh>
    </group>

    {/* Heavy 3-Part Cylindrical Barrel */}
    {/* Upper Fixed Barrel Sleeve */}
    <mesh position={[0, 0.11, 0]}>
      <cylinderGeometry args={[0.068, 0.068, 0.10, 24]} />
      <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
    </mesh>
    {/* Central Rotating Barrel Sleeve with machined oil groove */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.072, 0.072, 0.115, 24]} />
      <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.9} />
    </mesh>
    {/* Lower Fixed Barrel Sleeve */}
    <mesh position={[0, -0.11, 0]}>
      <cylinderGeometry args={[0.068, 0.068, 0.10, 24]} />
      <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
    </mesh>

    {/* Hardened Steel Central Pivot Pin with domed crown cap */}
    <mesh position={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.04, 24]} />
      <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.95} />
    </mesh>
    <mesh position={[0, 0.205, 0]}>
      <sphereGeometry args={[0.045, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.95} />
    </mesh>
    {/* Bottom retention plug */}
    <mesh position={[0, -0.18, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
      <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
    </mesh>

    {/* Grease Zerk Nipple (Lubrication Port at 45°) */}
    <group position={[0.05, 0, 0.05]} rotation={[0, -Math.PI / 4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.012, 0.03, 8]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
      </mesh>
    </group>
  </group>
);

/** Rotating Central Locking Handwheel (Dogging Wheel) & Multipoint Latch Bars */
const CentralDoggingMechanism: React.FC<{
  position: [number, number, number];
}> = ({ position }) => (
  <group position={position}>
    {/* Central Geared Gearbox Housing */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.20, 0.20, 0.08, 32]} />
      <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.8} />
    </mesh>
    {/* Gearbox Bolt Flange Ring */}
    <mesh position={[0, 0, 0.042]}>
      <cylinderGeometry args={[0.22, 0.22, 0.015, 32]} />
      <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
    </mesh>
    {/* 8 Flange bolts around gearbox */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0.054]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
        </mesh>
      );
    })}

    {/* Center Bearing Hub Spindle */}
    <mesh position={[0, 0, 0.07]}>
      <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Chrome Center Retaining Nut */}
    <mesh position={[0, 0, 0.105]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.025, 6]} />
      <meshStandardMaterial color="#F1F5F9" roughness={0.15} metalness={0.98} />
    </mesh>

    {/* Handwheel Dogging Wheel (Safety Amber / Yellow) */}
    <group position={[0, 0, 0.09]}>
      {/* Outer Torus Rim */}
      <mesh>
        <torusGeometry args={[0.34, 0.028, 16, 48]} />
        <meshStandardMaterial
          color="#EAB308"
          roughness={0.35}
          metalness={0.45}
        />
      </mesh>

      {/* 6 Cylindrical Radial Spokes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.28, 16]} />
              <meshStandardMaterial
                color="#CA8A04"
                roughness={0.35}
                metalness={0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* Revolving Grip Spinner Handle on Rim */}
      <group position={[0.26, 0.21, 0]}>
        {/* Handle mounting stud */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Revolving Handle Grip Sleeve */}
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.10, 16]} />
          <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Chrome end cap */}
        <mesh position={[0, 0, 0.135]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.022, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>
    </group>

    {/* 4 Heavy Multipoint Latch Bars extending from center gearbox */}
    {/* Left Latch Bar (toward hinge jamb) */}
    <group position={[-0.72, 0, 0.02]}>
      <mesh>
        <boxGeometry args={[1.18, 0.055, 0.035]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
      </mesh>
      {/* 2 Heavy Pillow Block Guides */}
      {[-0.32, 0.28].map((gx, i) => (
        <group key={i} position={[gx, 0, 0]}>
          <RoundedBox args={[0.10, 0.12, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.04, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.04, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>

    {/* Right Latch Bar (toward right frame strike box) */}
    <group position={[0.78, 0, 0.02]}>
      <mesh>
        <boxGeometry args={[1.30, 0.055, 0.035]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
      </mesh>
      {/* 2 Heavy Pillow Block Guides */}
      {[-0.28, 0.35].map((gx, i) => (
        <group key={i} position={[gx, 0, 0]}>
          <RoundedBox args={[0.10, 0.12, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.04, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.04, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>

    {/* Top Vertical Latch Bar (extending into header casing) */}
    <group position={[0, 0.95, 0.02]}>
      <mesh>
        <boxGeometry args={[0.055, 1.70, 0.035]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
      </mesh>
      {/* Pillow Block Guides */}
      {[-0.45, 0.45].map((gy, i) => (
        <group key={i} position={[0, gy, 0]}>
          <RoundedBox args={[0.12, 0.10, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.7} />
          </RoundedBox>
        </group>
      ))}
    </group>

    {/* Bottom Vertical Latch Bar (extending into threshold socket) */}
    <group position={[0, -0.95, 0.02]}>
      <mesh>
        <boxGeometry args={[0.055, 1.70, 0.035]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
      </mesh>
      {/* Pillow Block Guides */}
      {[-0.45, 0.45].map((gy, i) => (
        <group key={i} position={[0, gy, 0]}>
          <RoundedBox args={[0.12, 0.10, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.7} />
          </RoundedBox>
        </group>
      ))}
    </group>
  </group>
);

/** Armored Glass Vision Port with Protective Steel Security Grating */
const ArmoredVisionPort: React.FC<{
  position: [number, number, number];
}> = ({ position }) => (
  <group position={position}>
    {/* Outer Heavy Beveled Steel Retaining Bezel */}
    <RoundedBox args={[0.56, 0.78, 0.05]} radius={0.025} smoothness={4} position={[0, 0, 0.025]}>
      <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.8} />
    </RoundedBox>

    {/* 16 Perimeter Socket Head Cap Screws around bezel */}
    {[-0.24, 0.24].map((bx, i) =>
      [-0.34, -0.20, -0.07, 0.07, 0.20, 0.34].map((by, j) => (
        <mesh key={`vbolt-${i}-${j}`} position={[bx, by, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.012, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
        </mesh>
      ))
    )}
    {[-0.12, 0, 0.12].map((bx, i) =>
      [-0.34, 0.34].map((by, j) => (
        <mesh key={`hbolt-${i}-${j}`} position={[bx, by, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.012, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
        </mesh>
      ))
    )}

    {/* Multi-ply Ballistic Tinted Armored Glass */}
    <mesh position={[0, 0, 0.022]}>
      <boxGeometry args={[0.40, 0.62, 0.035]} />
      <meshStandardMaterial
        color="#0284C7"
        roughness={0.05}
        metalness={0.92}
        transparent
        opacity={0.68}
      />
    </mesh>

    {/* Interior Depth Cavity Backing (Dark void inside facility) */}
    <mesh position={[0, 0, -0.02]}>
      <planeGeometry args={[0.42, 0.64]} />
      <meshStandardMaterial color="#030712" roughness={0.9} />
    </mesh>

    {/* Heavy Steel Security Grating (Welded wire lattice over glass) */}
    <group position={[0, 0, 0.045]}>
      {/* 5 Vertical Steel Bars */}
      {[-0.14, -0.07, 0, 0.07, 0.14].map((gx, i) => (
        <mesh key={`vbar-${i}`} position={[gx, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.62, 12]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.95} />
        </mesh>
      ))}

      {/* 7 Horizontal Steel Bars */}
      {[-0.24, -0.16, -0.08, 0, 0.08, 0.16, 0.24].map((gy, i) => (
        <mesh key={`hbar-${i}`} position={[0, gy, 0.006]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, 0.40, 12]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.95} />
        </mesh>
      ))}

      {/* Standoff Mounting Lugs on Frame */}
      {[-0.18, 0.18].map((lx, i) =>
        [-0.28, 0.28].map((ly, j) => (
          <mesh key={`lug-${i}-${j}`} position={[lx, ly, 0.008]}>
            <boxGeometry args={[0.025, 0.025, 0.02]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
          </mesh>
        ))
      )}
    </group>
  </group>
);

/** Industrial Dome Beacon Light with Emissive Core & Protective Wire Cage */
const DomeBeaconLight: React.FC<{
  position: [number, number, number];
  active?: boolean;
  color?: string;
}> = ({ position, active = true, color = "#F59E0B" }) => (
  <group position={position}>
    {/* Cast Aluminum Base Mounting Flange */}
    <mesh position={[0, -0.06, 0]}>
      <cylinderGeometry args={[0.13, 0.15, 0.06, 16]} />
      <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
    </mesh>
    {/* 4 Base Anchor Screws */}
    {Array.from({ length: 4 }).map((_, i) => {
      const angle = (i / 4) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.12, -0.03, Math.sin(angle) * 0.12]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.012, 6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
        </mesh>
      );
    })}

    {/* Upper Collar & Gasket */}
    <mesh position={[0, -0.015, 0]}>
      <cylinderGeometry args={[0.115, 0.115, 0.03, 24]} />
      <meshStandardMaterial color="#0F172A" roughness={0.8} />
    </mesh>

    {/* Fresnel Ribbed Amber Glass Dome Lens */}
    <mesh position={[0, 0.09, 0]}>
      <cylinderGeometry args={[0.095, 0.10, 0.18, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={active ? color : "#000000"}
        emissiveIntensity={active ? 3.2 : 0}
        roughness={0.12}
        metalness={0.1}
        transparent
        opacity={0.88}
      />
    </mesh>
    {/* Domed Crown on Top of Lens */}
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.095, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial
        color={color}
        emissive={active ? color : "#000000"}
        emissiveIntensity={active ? 3.5 : 0}
        roughness={0.1}
        metalness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>

    {/* High-Intensity Inner Glowing Bulb Filament */}
    {active && (
      <>
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={color}
            emissiveIntensity={5.0}
            roughness={0.0}
          />
        </mesh>
        {/* Dynamic Point Light illuminating frame and wall */}
        <pointLight
          position={[0, 0.12, 0.15]}
          color={color}
          intensity={2.2}
          distance={5.0}
          decay={2.0}
        />
      </>
    )}

    {/* Protective Steel Wire Basket Cage */}
    <group position={[0, 0.09, 0]}>
      {/* 6 Vertical Wire Ribs */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={`cage-rib-${i}`} rotation={[0, angle, 0]}>
            {/* Lower vertical straight segment */}
            <mesh position={[0.112, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.20, 8]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Curved top arch segment */}
            <mesh position={[0.065, 0.13, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.005, 0.005, 0.11, 8]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* 2 Horizontal Guard Hoops */}
      <mesh position={[0, -0.03, 0]}>
        <torusGeometry args={[0.115, 0.006, 8, 32]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[0.115, 0.006, 8, 32]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Top Center Guard Ring */}
      <mesh position={[0, 0.17, 0]}>
        <torusGeometry args={[0.03, 0.006, 8, 16]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
      </mesh>
    </group>

    {/* Electrical Conduit Entry Tube */}
    <group position={[-0.10, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.16, 12]} />
        <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Hex compression fitting union */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.03, 6]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.95} />
      </mesh>
    </group>
  </group>
);

/** Auxiliary Wall-Mounted Electrical Control & Interlock Cabinet */
const ElectricalInterlockCabinet: React.FC<{
  position: [number, number, number];
}> = ({ position }) => (
  <group position={position}>
    {/* NEMA Enclosure Box */}
    <RoundedBox args={[0.42, 0.65, 0.22]} radius={0.02} smoothness={4}>
      <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
    </RoundedBox>
    {/* Cabinet Front Door Flange */}
    <RoundedBox args={[0.40, 0.63, 0.02]} radius={0.015} smoothness={4} position={[0, 0, 0.115]}>
      <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.7} />
    </RoundedBox>
    {/* Quarter-Turn Key Latch */}
    <mesh position={[0.14, 0, 0.13]}>
      <cylinderGeometry args={[0.016, 0.016, 0.015, 12]} />
      <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
    </mesh>
    <mesh position={[0.14, 0, 0.14]}>
      <boxGeometry args={[0.012, 0.045, 0.01]} />
      <meshStandardMaterial color="#0F172A" roughness={0.8} />
    </mesh>

    {/* Status Indicator Lights (Red = Sealed, Amber = In Cycle, Green = Unlocked) */}
    {[-0.08, 0, 0.08].map((y, i) => {
      const colors = ["#DC2626", "#F59E0B", "#10B981"];
      const activeIdx = 0; // Red sealed active by default
      const isActive = i === activeIdx;
      return (
        <group key={i} position={[-0.10, 0.18 - i * 0.07, 0.13]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.018, 0.015, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.012, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={colors[i]}
              emissive={isActive ? colors[i] : "#000000"}
              emissiveIntensity={isActive ? 2.5 : 0}
              roughness={0.1}
            />
          </mesh>
        </group>
      );
    })}

    {/* Emergency Blast Lock-Out Rotary Switch */}
    <group position={[0.06, -0.12, 0.13]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.012, 16]} />
        <meshStandardMaterial color="#EAB308" roughness={0.4} />
      </mesh>
      {/* Red Mushroom Push-Stop Button */}
      <mesh position={[0, 0, 0.018]}>
        <cylinderGeometry args={[0.024, 0.02, 0.025, 16]} />
        <meshStandardMaterial color="#DC2626" roughness={0.3} />
      </mesh>
    </group>

    {/* Interlock High-Voltage Warning Decal */}
    <mesh position={[-0.04, -0.12, 0.128]}>
      <planeGeometry args={[0.12, 0.07]} />
      <meshStandardMaterial color="#EAB308" roughness={0.4} />
    </mesh>

    {/* Overhead Conduit Connection from top into wall */}
    <mesh position={[0, 0.40, 0]}>
      <cylinderGeometry args={[0.018, 0.018, 0.20, 12]} />
      <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.8} />
    </mesh>
  </group>
);

// ============================================================================
// MAIN COMPONENT: IndustrialBlastDoorWall
// ============================================================================

export const IndustrialBlastDoorWall: React.FC<IndustrialBlastDoorWallProps> = ({
  position = [0, 1.5, -6.5],
  rotation = [0, 0, 0],
  scale = 1.0,
  beaconActive = true,
  beaconColor = "#F59E0B",
  doorColor = "#1E242C",
  frameColor = "#18202A",
  wallColor = "#262C36",
}) => {
  // Memoize procedural textures
  const chevronTexture = useMemo(() => createHazardChevronTexture(), []);
  const doorStencilTexture = useMemo(() => createDoorStencilTexture(), []);
  const leftBayStencilTexture = useMemo(() => createLeftBayStencilTexture(), []);
  const headerPlaqueTexture = useMemo(() => createHeaderPlaqueTexture(), []);
  const cautionPlateTexture = useMemo(() => createCautionPlateTexture(), []);

  // Structural portal dimensions (opening: ~3.0m width, ~4.5m height)
  // Floor line is at local y = -3.54 (matching world y = -2.04 when placed at [0, 1.5, -6.5])
  const floorY = -3.54;
  const portalWidth = 3.00;
  const portalHeight = 4.50;
  const portalCenterY = floorY + portalHeight / 2; // -1.29m

  // Frame outer casing geometry
  const frameWidth = portalWidth + 0.68; // 3.68m
  const casingDepth = 0.44; // 0.44m deep structural casing

  // Door slab dimensions
  const slabWidth = 2.92;
  const slabHeight = 4.38;
  const slabThickness = 0.18;
  const slabRecessZ = 0.02; // Recessed ~0.18m back from front frame face (which is at z = +0.20)

  // Hinge Y positions (4 heavy hinges on left pivot side)
  const hingeYPositions = [0.65, -0.40, -1.85, -3.05];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ==================================================================== */}
      {/* 1. REINFORCED CONCRETE & STEEL BACKDROP WALL                         */}
      {/* ==================================================================== */}
      {/* Primary concrete wall mass */}
      <mesh position={[0, 0.46, -0.15]}>
        <boxGeometry args={[18, 10.0, 0.30]} />
        <meshStandardMaterial color={wallColor} roughness={0.92} metalness={0.12} />
      </mesh>

      {/* Concrete Panel Seam Grooves (Horizontal formwork lines) */}
      {[-2.5, -0.5, 1.5, 3.5].map((gy, i) => (
        <mesh key={`hgroove-${i}`} position={[0, gy, 0.002]}>
          <planeGeometry args={[18, 0.02]} />
          <meshStandardMaterial color="#0B0F17" roughness={1.0} />
        </mesh>
      ))}

      {/* Concrete Panel Seam Grooves (Vertical formwork lines) */}
      {[-6.0, -3.2, 3.2, 6.0].map((gx, i) => (
        <mesh key={`vgroove-${i}`} position={[gx, 0.46, 0.002]}>
          <planeGeometry args={[0.02, 10.0]} />
          <meshStandardMaterial color="#0B0F17" roughness={1.0} />
        </mesh>
      ))}

      {/* Formwork Tie-Rod Anchor Plates across wall grid */}
      {[-7.2, -4.5, -2.8, 2.8, 4.5, 7.2].map((tx, i) =>
        [-2.0, 0.2, 2.4, 4.2].map((ty, j) => (
          <group key={`tie-${i}-${j}`} position={[tx, ty, 0.005]}>
            {/* Indented washer cup */}
            <mesh>
              <cylinderGeometry args={[0.038, 0.045, 0.015, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>
            {/* Center tie bolt */}
            <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.012, 6]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* Heavy Structural Steel Columns (Pilasters) flanking the portal */}
      {[-2.35, 2.35].map((colX, i) => (
        <group key={`column-${i}`} position={[colX, 0.46, 0.12]}>
          {/* Main H-Beam Column Body */}
          <RoundedBox args={[0.34, 10.0, 0.38]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.7} />
          </RoundedBox>
          {/* Floor Foundation Mounting Base Plate */}
          <mesh position={[0, -4.95, 0.02]}>
            <boxGeometry args={[0.54, 0.10, 0.52]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.8} />
          </mesh>
          {/* 4 Heavy M36 Foundation Anchor Studs */}
          {[-0.20, 0.20].map((bx, j) =>
            [-0.18, 0.18].map((bz, k) => (
              <mesh key={`cbolt-${j}-${k}`} position={[bx, -4.88, bz]}>
                <cylinderGeometry args={[0.02, 0.02, 0.05, 6]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.9} />
              </mesh>
            ))
          )}
          {/* Column Gusset Stiffener Brackets */}
          {[-2.2, 0.5, 3.2].map((gy, m) => (
            <mesh key={`col-gusset-${m}`} position={[0, gy, 0.20]}>
              <boxGeometry args={[0.26, 0.12, 0.03]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Overhead High-Capacity Cable Tray */}
      <group position={[0, 4.4, 0.22]}>
        <RoundedBox args={[16.0, 0.14, 0.42]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.85} />
        </RoundedBox>
        {/* Multicolored Heavy Conduit Cables inside tray */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((cz, i) => {
          const cableColors = ["#0F172A", "#F59E0B", "#DC2626", "#0284C7", "#0F172A"];
          return (
            <mesh key={`tray-cable-${i}`} rotation={[0, 0, Math.PI / 2]} position={[0, 0.08, cz]}>
              <cylinderGeometry args={[0.022, 0.022, 15.8, 12]} />
              <meshStandardMaterial color={cableColors[i]} roughness={0.75} />
            </mesh>
          );
        })}
      </group>

      {/* Electrical Interlock Control Cabinet on Right Flank */}
      <ElectricalInterlockCabinet position={[3.2, -1.10, 0.32]} />

      {/* Secondary Caution Plate on Left Pilaster */}
      <group position={[-2.35, -0.60, 0.32]}>
        <RoundedBox args={[0.82, 0.32, 0.025]} radius={0.01} smoothness={4}>
          <meshStandardMaterial color="#0F172A" roughness={0.7} />
        </RoundedBox>
        {cautionPlateTexture && (
          <mesh position={[0, 0, 0.014]}>
            <planeGeometry args={[0.80, 0.30]} />
            <meshStandardMaterial map={cautionPlateTexture} roughness={0.3} />
          </mesh>
        )}
      </group>

      {/* ==================================================================== */}
      {/* 2. STRUCTURAL PORTAL FRAME CASING (Opening ~3.0m x ~4.5m)            */}
      {/* ==================================================================== */}
      <group position={[0, 0, 0]}>
        {/* Left Jamb Casing (Box Channel with beveled interior reveal) */}
        <group position={[-1.68, portalCenterY, 0.10]}>
          <RoundedBox args={[0.38, portalHeight + 0.36, casingDepth]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.75} />
          </RoundedBox>
          {/* Chamfered inner reveal face */}
          <mesh position={[0.18, 0, 0.05]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.08, portalHeight + 0.32, 0.08]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.8} />
          </mesh>
        </group>

        {/* Right Jamb Casing (with striker latch receiver pocket) */}
        <group position={[1.68, portalCenterY, 0.10]}>
          <RoundedBox args={[0.38, portalHeight + 0.36, casingDepth]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.75} />
          </RoundedBox>
          {/* Chamfered inner reveal face */}
          <mesh position={[-0.18, 0, 0.05]} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.08, portalHeight + 0.32, 0.08]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.8} />
          </mesh>

          {/* Heavy Cast Steel Striker Box (Latch Bolt Receiver Pocket) */}
          <group position={[-0.18, 0, 0.02]}>
            <RoundedBox args={[0.12, 0.28, 0.14]} radius={0.015} smoothness={4}>
              <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.9} />
            </RoundedBox>
            {/* Lead-in chamfer ramp */}
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.09]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        </group>

        {/* Top Header Lintel Casing (Massive cross-girder header) */}
        <group position={[0, floorY + portalHeight + 0.20, 0.10]}>
          <RoundedBox args={[frameWidth, 0.46, casingDepth]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.75} />
          </RoundedBox>
          {/* Beveled lower header edge chamfer */}
          <mesh position={[0, -0.22, 0.08]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[portalWidth, 0.08, 0.08]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.8} />
          </mesh>
        </group>

        {/* Bottom Threshold Sill Curb (Heavy floor transition plate) */}
        <group position={[0, floorY + 0.08, 0.14]}>
          {/* Main threshold curb block */}
          <RoundedBox args={[frameWidth, 0.18, 0.52]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.7} />
          </RoundedBox>
          {/* Chamfered front approach ramp */}
          <mesh position={[0, -0.04, 0.28]} rotation={[-0.32, 0, 0]}>
            <boxGeometry args={[frameWidth, 0.08, 0.16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.6} />
          </mesh>
          {/* Anti-slip diamond plate / ribbed tread plates */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((tx, i) => (
            <mesh key={`tread-${i}`} position={[tx, 0.092, 0.04]}>
              <boxGeometry args={[0.54, 0.006, 0.36]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.88} />
            </mesh>
          ))}
        </group>

        {/* 8 Heavy Structural Wall Reinforcing Gussets */}
        {[-1.85, 1.85].map((gx, i) =>
          [0.6, -0.6, -1.8, -3.0].map((gy, j) => (
            <mesh key={`gusset-${i}-${j}`} position={[gx, gy, 0.02]} rotation={[0, 0, i === 0 ? 0.3 : -0.3]}>
              <boxGeometry args={[0.16, 0.28, 0.03]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
            </mesh>
          ))
        )}

        {/* Frame Interior Door Stop Flange & Compression Neoprene Gasket */}
        <group position={[0, portalCenterY, -0.04]}>
          <mesh position={[-1.48, 0, 0]}>
            <boxGeometry args={[0.08, portalHeight, 0.06]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[1.48, 0, 0]}>
            <boxGeometry args={[0.08, portalHeight, 0.06]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[0, portalHeight / 2 - 0.04, 0]}>
            <boxGeometry args={[portalWidth, 0.08, 0.06]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 3. HEAVY RECESSED BLAST DOOR SLAB                                    */}
      {/* ==================================================================== */}
      <group position={[0, portalCenterY, slabRecessZ]}>
        {/* Primary Multilayer Blast Armor Slab */}
        <RoundedBox args={[slabWidth, slabHeight, slabThickness]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color={doorColor}
            roughness={0.42}
            metalness={0.84}
          />
        </RoundedBox>

        {/* Perimeter Bolt Flange (Raised outer margin border) */}
        {/* Left flange bar */}
        <mesh position={[-slabWidth / 2 + 0.06, 0, slabThickness / 2 + 0.01]}>
          <boxGeometry args={[0.12, slabHeight, 0.02]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Right flange bar */}
        <mesh position={[slabWidth / 2 - 0.06, 0, slabThickness / 2 + 0.01]}>
          <boxGeometry args={[0.12, slabHeight, 0.02]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Top flange bar */}
        <mesh position={[0, slabHeight / 2 - 0.06, slabThickness / 2 + 0.01]}>
          <boxGeometry args={[slabWidth - 0.24, 0.12, 0.02]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Bottom flange bar */}
        <mesh position={[0, -slabHeight / 2 + 0.06, slabThickness / 2 + 0.01]}>
          <boxGeometry args={[slabWidth - 0.24, 0.12, 0.02]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Perimeter Heavy Hex Bolts (48 Perimeter Hex Bolts) */}
        {/* Left & Right vertical flange bolts (16 bolts per side) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const by = -slabHeight / 2 + 0.15 + i * ((slabHeight - 0.30) / 15);
          return (
            <React.Fragment key={`vbolts-${i}`}>
              <HexBolt
                position={[-slabWidth / 2 + 0.06, by, slabThickness / 2 + 0.02]}
                rotation={[0, 0, 0]}
              />
              <HexBolt
                position={[slabWidth / 2 - 0.06, by, slabThickness / 2 + 0.02]}
                rotation={[0, 0, 0]}
              />
            </React.Fragment>
          );
        })}
        {/* Top & Bottom horizontal flange bolts (8 bolts per side) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const bx = -slabWidth / 2 + 0.26 + i * ((slabWidth - 0.52) / 7);
          return (
            <React.Fragment key={`hbolts-${i}`}>
              <HexBolt
                position={[bx, slabHeight / 2 - 0.06, slabThickness / 2 + 0.02]}
                rotation={[0, 0, 0]}
              />
              <HexBolt
                position={[bx, -slabHeight / 2 + 0.06, slabThickness / 2 + 0.02]}
                rotation={[0, 0, 0]}
              />
            </React.Fragment>
          );
        })}

        {/* Heavy Central Horizontal Stiffener Belt Beam */}
        <RoundedBox
          args={[slabWidth - 0.24, 0.16, 0.07]}
          radius={0.015}
          smoothness={4}
          position={[0, 0, slabThickness / 2 + 0.035]}
        >
          <meshStandardMaterial color="#2B3442" roughness={0.5} metalness={0.8} />
        </RoundedBox>

        {/* Central Diamond Structural Gusset Plate at waist intersection */}
        <mesh position={[0, 0, slabThickness / 2 + 0.065]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.54, 0.54, 0.05]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Center Gusset Perimeter Studs */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={`gusset-bolt-${i}`}
              position={[
                Math.cos(angle) * 0.28,
                Math.sin(angle) * 0.28,
                slabThickness / 2 + 0.095,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
            </mesh>
          );
        })}

        {/* Diagonal Embossed X-Brace Stiffener Box Beams */}
        {/* Upper Bay Diagonal X-Braces (from upper corners to center) */}
        <group position={[0, slabHeight / 4, slabThickness / 2 + 0.03]}>
          <mesh rotation={[0, 0, 0.62]}>
            <boxGeometry args={[0.13, 2.30, 0.05]} />
            <meshStandardMaterial color="#2B3442" roughness={0.45} metalness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, -0.62]}>
            <boxGeometry args={[0.13, 2.30, 0.05]} />
            <meshStandardMaterial color="#2B3442" roughness={0.45} metalness={0.8} />
          </mesh>
        </group>

        {/* Lower Bay Diagonal X-Braces (from lower corners to center) */}
        <group position={[0, -slabHeight / 4, slabThickness / 2 + 0.03]}>
          <mesh rotation={[0, 0, 0.62]}>
            <boxGeometry args={[0.13, 2.30, 0.05]} />
            <meshStandardMaterial color="#2B3442" roughness={0.45} metalness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, -0.62]}>
            <boxGeometry args={[0.13, 2.30, 0.05]} />
            <meshStandardMaterial color="#2B3442" roughness={0.45} metalness={0.8} />
          </mesh>
        </group>

        {/* Upper Bay Intermediate Horizontal Reinforcing Rib */}
        <RoundedBox
          args={[slabWidth - 0.28, 0.08, 0.04]}
          radius={0.01}
          smoothness={4}
          position={[0, 1.60, slabThickness / 2 + 0.02]}
        >
          <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.75} />
        </RoundedBox>

        {/* Lower Bay Intermediate Horizontal Reinforcing Rib */}
        <RoundedBox
          args={[slabWidth - 0.28, 0.08, 0.04]}
          radius={0.01}
          smoothness={4}
          position={[0, -1.60, slabThickness / 2 + 0.02]}
        >
          <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.75} />
        </RoundedBox>

        {/* Armored Glass Vision Port with Steel Grating (Eye level, y = +1.05m above center) */}
        <ArmoredVisionPort position={[0, 1.05, slabThickness / 2]} />

        {/* Central Rotating Dogging Wheel & Latch Bars (Waist level, y = 0) */}
        <CentralDoggingMechanism position={[0, 0, slabThickness / 2 + 0.06]} />

        {/* Primary Warning Stencil Decal on Door Upper-Right Stiffener Bay */}
        {doorStencilTexture && (
          <mesh position={[0.68, 0.52, slabThickness / 2 + 0.045]}>
            <planeGeometry args={[1.15, 0.75]} />
            <meshStandardMaterial
              map={doorStencilTexture}
              transparent
              roughness={0.35}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Secondary Technical Spec Stencil Decal on Door Upper-Left Stiffener Bay */}
        {leftBayStencilTexture && (
          <mesh position={[-0.68, 0.52, slabThickness / 2 + 0.045]}>
            <planeGeometry args={[1.15, 0.75]} />
            <meshStandardMaterial
              map={leftBayStencilTexture}
              transparent
              roughness={0.35}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* ==================================================================== */}
      {/* 4. HEAVY WELDED BARREL HINGES (4 Hinges on Left Pivot Side)          */}
      {/* ==================================================================== */}
      {hingeYPositions.map((hy, i) => (
        <WeldedBarrelHinge
          key={`hinge-${i}`}
          position={[-portalWidth / 2 + 0.02, hy, slabRecessZ + 0.12]}
        />
      ))}

      {/* ==================================================================== */}
      {/* 5. INDUSTRIAL MARKINGS & HAZARD CHEVRONS                             */}
      {/* ==================================================================== */}
      {/* Overhead Header Lintel Hazard Chevron Warning Paint Strip */}
      <group position={[0, floorY + portalHeight + 0.20, 0.325]}>
        <mesh>
          <planeGeometry args={[3.60, 0.18]} />
          {chevronTexture ? (
            <meshStandardMaterial map={chevronTexture} roughness={0.4} />
          ) : (
            <meshStandardMaterial color="#F59E0B" roughness={0.4} />
          )}
        </mesh>
        {/* Steel protective border trim */}
        <mesh position={[0, 0.095, 0.005]}>
          <boxGeometry args={[3.62, 0.015, 0.01]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.095, 0.005]}>
          <boxGeometry args={[3.62, 0.015, 0.01]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>
      </group>

      {/* Floor Threshold Curb Hazard Chevron Warning Paint Strip */}
      <group position={[0, floorY + 0.22, 0.38]}>
        <mesh rotation={[-0.42, 0, 0]}>
          <planeGeometry args={[3.60, 0.18]} />
          {chevronTexture ? (
            <meshStandardMaterial map={chevronTexture} roughness={0.5} />
          ) : (
            <meshStandardMaterial color="#F59E0B" roughness={0.5} />
          )}
        </mesh>
      </group>

      {/* Overhead Lintel Identification Plaque: "HIGH PRESSURE TESTING ZONE" */}
      <group position={[0, floorY + portalHeight + 0.38, 0.325]}>
        <RoundedBox args={[1.72, 0.15, 0.02]} radius={0.01} smoothness={4}>
          <meshStandardMaterial color="#0F172A" roughness={0.7} />
        </RoundedBox>
        {headerPlaqueTexture ? (
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[1.68, 0.13]} />
            <meshStandardMaterial map={headerPlaqueTexture} roughness={0.3} />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.68, 0.13]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>
        )}
        {/* Corner mounting screws */}
        {[-0.82, 0.82].map((px, i) =>
          [-0.05, 0.05].map((py, j) => (
            <mesh key={`plaque-screw-${i}-${j}`} position={[px, py, 0.014]}>
              <cylinderGeometry args={[0.006, 0.006, 0.008, 6]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.9} />
            </mesh>
          ))
        )}
      </group>

      {/* ==================================================================== */}
      {/* 6. INDUSTRIAL DOME BEACON LIGHT WITH WIRE CAGE                       */}
      {/* ==================================================================== */}
      <DomeBeaconLight
        position={[0, floorY + portalHeight + 0.58, 0.24]}
        active={beaconActive}
        color={beaconColor}
      />
    </group>
  );
};

export default IndustrialBlastDoorWall;
