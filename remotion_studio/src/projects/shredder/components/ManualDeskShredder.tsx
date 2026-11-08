import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export interface ManualDeskShredderProps {
  localFrame?: number;
}

export const ManualDeskShredder: React.FC<ManualDeskShredderProps> = ({ localFrame: overrideLocal }) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  if (overrideLocal === undefined && tier !== 1) return null;

  // --- ACT 1: INSIDE-OUT MODULAR ASSEMBLY (0..69f) ---
  // Order 0 (0f): Base bench clamp & upright frame
  const baseLandP = interpolate(local, [0, 8], [0, 1], {
    easing: Easing.out(Easing.back(1.4)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const baseSnapSpark = local >= 6 && local <= 10;

  // Order 1 (20f): Internal Twin Cylindrical Shafts drop in
  const shaftDropY = interpolate(local, [15, 20], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shaftLanded = local >= 20;
  const shaftSnapSpark = local >= 20 && local <= 24;

  // Order 2 (40f): Outer Acrylic / Sheet Metal Housing & Hopper snaps
  const housingDropY = interpolate(local, [35, 40], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const housingLanded = local >= 40;
  const housingSnapSpark = local >= 40 && local <= 44;

  // Order 3 (60f): Brass Spur Gears & Hand Crank Arm dock from front
  const crankDropZ = interpolate(local, [55, 60], [2.8, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crankLanded = local >= 60;
  const crankSnapSpark = local >= 60 && local <= 64;

  // Order 4 (75f): Slitter Disks Array locks onto shafts
  const disksLanded = local >= 68;

  // --- ACT 2 & 3: MANUAL CRANK KINEMATICS (70..249f) ---
  let crankAngle = 0;
  if (local >= 75 && local < 120) {
    // Act 2: Slow manual start (intermittent cranking clicks)
    crankAngle = interpolate(local, [75, 120], [0, Math.PI * 2.5], {
      easing: Easing.in(Easing.quad),
    });
  } else if (local >= 120 && local < 150) {
    // Ramping up to steady speed
    const baseRot = Math.PI * 2.5;
    const addRot = interpolate(local, [120, 150], [0, Math.PI * 4.0], {
      easing: Easing.linear,
    });
    crankAngle = baseRot + addRot;
  } else if (local >= 150 && local < 255) {
    // Act 3: Steady 90 RPM manual shredding
    const baseRot = Math.PI * 6.5;
    const opRot = (local - 150) * 0.28;
    crankAngle = baseRot + opRot;
  } else if (local >= 255) {
    // Jammed at frame 255
    crankAngle = Math.PI * 6.5 + (255 - 150) * 0.28;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 276], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Fracture kinematics: Arm shears/bends down, machine shudders on vise
  const bentCrankAngle = isBroken ? breakP * 0.85 : 0;
  const chippedToothOffset = isBroken ? breakP * 0.15 : 0;
  const viseVibrate = isBroken && local < 278 ? Math.sin((local - 265) * 5) * 0.02 * (1 - breakP) : 0;

  // Dual Shaft Offsets
  const leftShaftX = -0.11;
  const rightShaftX = 0.11;
  const shaftCenterY = 1.62;

  // Number of slitter cutter disks per shaft
  const diskCount = 9;
  const diskSpacing = 0.048;

  return (
    <group position={[viseVibrate, 0, 0]}>
      {/* =========================================================================
          MODULE 0: BASE BENCH VISE & STAND (Order 0, frame 0)
          ========================================================================= */}
      <group position={[0, (1 - baseLandP) * 1.5, 0]}>
        {/* Lower Mounting Table Plinth (Solid Dark Cast Iron) */}
        <RoundedBox args={[1.3, 0.16, 1.1]} radius={0.025} smoothness={4} position={[0, 0.08, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* Upright Cast Stanchion Column */}
        <RoundedBox args={[0.26, 1.25, 0.32]} radius={0.025} smoothness={4} position={[0, 0.76, 0]}>
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </RoundedBox>

        {/* Benchtop C-Clamp Throat & Brass Clamping Screw Knob */}
        <group position={[0, 0.52, 0.28]}>
          {/* Cast Iron C-Clamp Jaw */}
          <RoundedBox args={[0.32, 0.38, 0.16]} radius={0.02} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.5} />
          </RoundedBox>
          {/* Polished Warm Brass Clamp Screw & T-Bar */}
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.22, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0, -0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.16, 12]} />
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>

        {/* Lower Collection Bin (Frosted Gray Polypropylene) */}
        <RoundedBox args={[0.72, 0.42, 0.52]} radius={0.02} smoothness={4} position={[0, 0.36, 0]}>
          <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.2} transparent opacity={0.85} />
        </RoundedBox>
      </group>

      {/* =========================================================================
          MODULE 1: INTERNAL TWIN SHAFTS & BUSHINGS (Order 1, frame 20)
          ========================================================================= */}
      {shaftLanded && (
        <group position={[0, shaftDropY, 0]}>
          {/* Front & Rear Cast Bearing Flange Plates */}
          <RoundedBox args={[0.54, 0.26, 0.04]} radius={0.015} smoothness={4} position={[0, shaftCenterY, 0.26]}>
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.54, 0.26, 0.04]} radius={0.015} smoothness={4} position={[0, shaftCenterY, -0.26]}>
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </RoundedBox>

          {/* Left Shaft Assembly (Clockwise rotation: -crankAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0]} rotation={[0, 0, -crankAngle]}>
            {/* Mirror Chrome Steel Center Shaft */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.62, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>

            {/* Brass Sleeve Bushings */}
            <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.05, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
            <mesh position={[0, 0, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.05, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>

          {/* Right Shaft Assembly (Counter-Clockwise rotation: +crankAngle) */}
          <group position={[rightShaftX, shaftCenterY, 0]} rotation={[0, 0, crankAngle]}>
            {/* Mirror Chrome Steel Center Shaft */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.62, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
            </mesh>

            {/* Brass Sleeve Bushings */}
            <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.05, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
            <mesh position={[0, 0, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.05, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 2: HOUSING & HOPPER ENCLOSURE (Order 2, frame 40)
          ========================================================================= */}
      {housingLanded && (
        <group position={[0, housingDropY, 0]}>
          {/* Frosted Acrylic Left & Right Cheeks */}
          <RoundedBox args={[0.025, 0.44, 0.54]} radius={0.015} smoothness={4} position={[-0.26, shaftCenterY + 0.08, 0]}>
            <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.1} transparent opacity={0.65} />
          </RoundedBox>
          <RoundedBox args={[0.025, 0.44, 0.54]} radius={0.015} smoothness={4} position={[0.26, shaftCenterY + 0.08, 0]}>
            <meshStandardMaterial color="#94A3B8" roughness={0.15} metalness={0.1} transparent opacity={0.65} />
          </RoundedBox>

          {/* Stamped Sheet Steel Flared Top Entry Chute / Hopper */}
          <group position={[0, shaftCenterY + 0.32, 0]}>
            {/* Front Chute Slope */}
            <mesh position={[0, 0, 0.24]} rotation={[0.42, 0, 0]}>
              <boxGeometry args={[0.54, 0.24, 0.016]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Rear Chute Slope */}
            <mesh position={[0, 0, -0.24]} rotation={[-0.42, 0, 0]}>
              <boxGeometry args={[0.54, 0.24, 0.016]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Top Rim Bevel Frame */}
            <RoundedBox args={[0.58, 0.03, 0.54]} radius={0.01} smoothness={4} position={[0, 0.1, 0]}>
              <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
            </RoundedBox>
          </group>

          {/* Steel Comb Strippers Underneath (Prevents paper wrapping) */}
          <mesh position={[0, shaftCenterY - 0.14, 0]}>
            <boxGeometry args={[0.48, 0.02, 0.46]} />
            <meshStandardMaterial color="#0F172A" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          MODULE 3: INTERLOCKING SPUR GEARS & MANUAL HAND CRANK (Order 3, frame 60)
          ========================================================================= */}
      {crankLanded && (
        <group position={[0, 0, crankDropZ]}>
          {/* Front Intermeshing Brass Spur Gears */}
          {/* Left Spur Gear (Clockwise: -crankAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0.32]} rotation={[0, 0, -crankAngle]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.032, 32]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* 16 Radial Gear Teeth */}
            {Array.from({ length: 16 }).map((_, i) => {
              const ang = (i * 2 * Math.PI) / 16;
              return (
                <mesh key={i} position={[Math.cos(ang) * 0.108, Math.sin(ang) * 0.108, 0]} rotation={[0, 0, ang]}>
                  <boxGeometry args={[0.024, 0.016, 0.032]} />
                  <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
                </mesh>
              );
            })}
          </group>

          {/* Right Spur Gear (Counter-Clockwise: +crankAngle + tooth mesh offset) */}
          <group position={[rightShaftX, shaftCenterY, 0.32]} rotation={[0, 0, crankAngle + Math.PI / 16]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.032, 32]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* 16 Radial Gear Teeth */}
            {Array.from({ length: 16 }).map((_, i) => {
              const ang = (i * 2 * Math.PI) / 16;
              return (
                <mesh key={i} position={[Math.cos(ang) * 0.108, Math.sin(ang) * 0.108, 0]} rotation={[0, 0, ang]}>
                  <boxGeometry args={[0.024, 0.016, 0.032]} />
                  <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
                </mesh>
              );
            })}
          </group>

          {/* S-Shaped Manual Hand Crank Arm (Mounted to Left Shaft, projects forward) */}
          <group
            position={[leftShaftX, shaftCenterY, 0.36]}
            rotation={[0, 0, -crankAngle + (isBroken ? -bentCrankAngle : 0)]}
          >
            {/* Crank Hub Collar */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.036, 0.036, 0.045, 20]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Brass Crank Lever Arm */}
            <mesh position={[0, 0.14, 0.025]} rotation={[0, 0, isBroken ? bentCrankAngle * 0.8 : 0]}>
              <boxGeometry args={[0.034, 0.28, 0.02]} />
              <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Turned Hardwood / Brass Rotating Grip Handle */}
            <group position={[0, 0.26, 0.07]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.024, 0.11, 16]} />
                <meshStandardMaterial color="#78350F" roughness={0.7} metalness={0.1} />
              </mesh>
              {/* Brass End Cap */}
              <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.015, 16]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 4: ROTARY SLITTER CUTTER DISKS ARRAY (Order 4, frame 75)
          ========================================================================= */}
      {disksLanded && (
        <group>
          {/* Left Shaft Cutter Disks Array (Clockwise: -crankAngle) */}
          <group position={[leftShaftX, shaftCenterY, 0]} rotation={[0, 0, -crankAngle]}>
            {Array.from({ length: diskCount }).map((_, i) => {
              const z = (i - (diskCount - 1) / 2) * diskSpacing;
              return (
                <group key={`left_disk_${i}`} position={[0, 0, z]}>
                  {/* Razor Sharp Hardened Steel Slitter Disk */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.092, 0.092, 0.018, 36]} />
                    <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                  </mesh>
                  {/* Micro Shearing Teeth on Disk Perimeter */}
                  {Array.from({ length: 8 }).map((_, t) => {
                    const ang = (t * 2 * Math.PI) / 8;
                    return (
                      <mesh key={t} position={[Math.cos(ang) * 0.094, Math.sin(ang) * 0.094, 0]} rotation={[0, 0, ang]}>
                        <boxGeometry args={[0.014, 0.008, 0.018]} />
                        <meshStandardMaterial color="#CBD5E1" roughness={0.1} metalness={0.95} />
                      </mesh>
                    );
                  })}
                </group>
              );
            })}
          </group>

          {/* Right Shaft Cutter Disks Array (Counter-Clockwise: +crankAngle) */}
          {/* Interleaved with Left Disks by diskSpacing / 2 */}
          <group position={[rightShaftX, shaftCenterY, 0]} rotation={[0, 0, crankAngle]}>
            {Array.from({ length: diskCount }).map((_, i) => {
              const z = (i - (diskCount - 1) / 2) * diskSpacing + diskSpacing * 0.5;
              if (z > 0.22 || z < -0.22) return null;
              return (
                <group key={`right_disk_${i}`} position={[0, 0, z]}>
                  {/* Razor Sharp Hardened Steel Slitter Disk */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.092, 0.092, 0.018, 36]} />
                    <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
                  </mesh>
                  {/* Micro Shearing Teeth on Disk Perimeter */}
                  {Array.from({ length: 8 }).map((_, t) => {
                    const ang = (t * 2 * Math.PI) / 8 + Math.PI / 8;
                    const isShearedTooth = isBroken && i === 4 && t === 0;
                    return (
                      <mesh
                        key={t}
                        position={[
                          Math.cos(ang) * (0.094 + (isShearedTooth ? chippedToothOffset : 0)),
                          Math.sin(ang) * (0.094 - (isShearedTooth ? chippedToothOffset : 0)),
                          0,
                        ]}
                        rotation={[0, 0, ang + (isShearedTooth ? 0.6 : 0)]}
                      >
                        <boxGeometry args={[0.014, 0.008, 0.018]} />
                        <meshStandardMaterial color={isShearedTooth ? "#EF4444" : "#CBD5E1"} roughness={0.1} metalness={0.95} />
                      </mesh>
                    );
                  })}
                </group>
              );
            })}
          </group>
        </group>
      )}

      {/* Assembly & Fracture Spark FX */}
      <SparkBurst
        active={baseSnapSpark}
        frameOffset={local - 6}
        position={[0, 0.12, 0]}
        color="#F59E0B"
        scale={0.7}
      />
      <SparkBurst
        active={shaftSnapSpark}
        frameOffset={local - 20}
        position={[0, shaftCenterY, 0]}
        color="#38BDF8"
        scale={0.8}
      />
      <SparkBurst
        active={housingSnapSpark}
        frameOffset={local - 40}
        position={[0, shaftCenterY + 0.3, 0]}
        color="#F59E0B"
        scale={0.8}
      />
      <SparkBurst
        active={crankSnapSpark}
        frameOffset={local - 60}
        position={[leftShaftX, shaftCenterY, 0.35]}
        color="#D97706"
        scale={0.75}
      />
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[leftShaftX, shaftCenterY, 0.36]}
        color="#EF4444"
        scale={1.1}
      />
    </group>
  );
};
