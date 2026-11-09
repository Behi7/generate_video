import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export interface QuantumSingularityShredderProps {
  localFrame?: number;
}

export const QuantumSingularityShredder: React.FC<QuantumSingularityShredderProps> = ({
  localFrame: overrideLocal,
}) => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = overrideLocal !== undefined ? overrideLocal : getTierLocalFrame(frame);

  if (overrideLocal === undefined && tier !== 4) return null;

  // --- ACT 1: INSIDE-OUT MODULAR ASSEMBLY (0..69f) ---
  // Order 0 (0f): Monolithic Obsidian Anti-Vibration Damping Plinth
  const plinthLandP = interpolate(local, [0, 8], [0, 1], {
    easing: Easing.out(Easing.back(1.4)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const plinthSnapSpark = local >= 6 && local <= 10;

  // Order 1 (20f): Levitating Superconducting Magnetic Spindle Cores
  const coreDropY = interpolate(local, [15, 20], [4.0, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coreLanded = local >= 20;
  const coreSnapSpark = local >= 20 && local <= 24;

  // Order 2 (40f): Monolithic Magnetic Containment Housing & Toroids
  const housingDropY = interpolate(local, [35, 40], [4.0, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const housingLanded = local >= 40;
  const housingSnapSpark = local >= 40 && local <= 44;

  // Order 3 (60f): Cryogenic Coolant Conduits & High-Voltage Field Inverters
  const conduitDropX = interpolate(local, [55, 60], [-3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const conduitLanded = local >= 60;
  const conduitSnapSpark = local >= 60 && local <= 64;

  // Order 4 (75f): Ionized Plasma Cutter Rings & Singularity Field Ignition
  const plasmaLanded = local >= 68;

  // --- ACT 2 & 3: QUANTUM FIELD & PLASMA KINEMATICS (70..249f) ---
  let fieldRot = 0;
  let plasmaIntensity = 0;
  let fieldPulse = 0;

  if (local >= 75 && local < 115) {
    // Act 2: Field charging & spin-up
    plasmaIntensity = interpolate(local, [75, 115], [0, 1.5], {
      easing: Easing.in(Easing.quad),
    });
    fieldRot = interpolate(local, [75, 115], [0, Math.PI * 4.0], {
      easing: Easing.in(Easing.quad),
    });
    fieldPulse = Math.sin(local * 0.4) * 0.3;
  } else if (local >= 115 && local < 150) {
    // Ramping to hyper-frequency vortex
    const baseRot = Math.PI * 4.0;
    const addRot = interpolate(local, [115, 150], [0, Math.PI * 14.0], {
      easing: Easing.linear,
    });
    fieldRot = baseRot + addRot;
    plasmaIntensity = 1.5 + Math.sin(local * 0.6) * 0.4;
    fieldPulse = Math.sin(local * 0.8) * 0.4;
  } else if (local >= 150 && local < 255) {
    // Act 3: Steady 300 RPM hypersonic plasma disintegration
    const baseRot = Math.PI * 18.0;
    const opRot = (local - 150) * 0.75;
    fieldRot = baseRot + opRot;
    plasmaIntensity = 2.2 + Math.sin(local * 0.9) * 0.6;
    fieldPulse = Math.sin(local * 1.2) * 0.5;
  } else if (local >= 255) {
    // Overload pulse
    fieldRot = Math.PI * 18.0 + (255 - 150) * 0.75;
    plasmaIntensity = 3.5;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 276], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Rupture displacements
  const arcVentOffset = isBroken ? breakP * 0.4 : 0;
  const ringTilt = isBroken ? breakP * 0.25 : 0;
  const chassisShudder = isBroken && local < 284 ? Math.sin((local - 265) * 8) * 0.015 * (1 - breakP) : 0;

  // Dimensions
  const leftSpindleX = -0.22;
  const rightSpindleX = 0.22;
  const spindleCenterY = 1.65;

  const plasmaRings = 7;
  const ringSpacing = 0.085;

  return (
    <group position={[chassisShudder, 0, 0]}>
      {/* =========================================================================
          MODULE 0: MONOLITHIC OBSIDIAN DAMPING PLINTH (Order 0, frame 0)
          ========================================================================= */}
      <group position={[0, (1 - plinthLandP) * 1.8, 0]}>
        {/* Monolithic Obsidian Pedestal Base */}
        <RoundedBox args={[1.75, 0.2, 1.4]} radius={0.035} smoothness={4} position={[0, 0.1, 0]}>
          <meshStandardMaterial color="#050814" roughness={0.1} metalness={0.95} />
        </RoundedBox>

        {/* Cyan Ambient Magnetic Levitation Track Recess */}
        <mesh position={[0, 0.205, 0]}>
          <planeGeometry args={[1.5, 1.15]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.6} />
        </mesh>

        {/* Upright Monolithic Support Pylons */}
        <RoundedBox args={[0.28, 1.1, 0.42]} radius={0.03} smoothness={4} position={[-0.62, 0.78, 0]}>
          <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.85} />
        </RoundedBox>
        <RoundedBox args={[0.28, 1.1, 0.42]} radius={0.03} smoothness={4} position={[0.62, 0.78, 0]}>
          <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.85} />
        </RoundedBox>

        {/* Glowing Status Indicator Grid on Pylon Faces */}
        {[-0.62, 0.62].map((px, idx) => (
          <group key={idx} position={[px, 0.85, 0.22]}>
            {[-0.08, 0, 0.08].map((sy, j) => (
              <mesh key={j} position={[0, sy, 0]}>
                <planeGeometry args={[0.18, 0.025]} />
                <meshStandardMaterial
                  color="#00E5FF"
                  emissive={isBroken ? "#EF4444" : "#00E5FF"}
                  emissiveIntensity={isBroken ? 2.5 : 1.2}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* =========================================================================
          MODULE 1: SUPERCONDUCTING MAGNETIC SPINDLE CORES (Order 1, frame 20)
          ========================================================================= */}
      {coreLanded && (
        <group position={[0, coreDropY, 0]}>
          {/* Left Levitating Core (Clockwise rotation: -fieldRot) */}
          <group position={[leftSpindleX, spindleCenterY, 0]} rotation={[0, 0, -fieldRot]}>
            {/* Mirror Chrome High-Vacuum Spindle Core */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.95, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.06} metalness={0.98} />
            </mesh>
            {/* Superconducting Niobium-Tin Magnetic Rings */}
            {[-0.38, 0.38].map((cz, i) => (
              <mesh key={i} position={[0, 0, cz]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.095, 0.095, 0.06, 24]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} />
              </mesh>
            ))}
          </group>

          {/* Right Levitating Core (Counter-Clockwise rotation: +fieldRot) */}
          <group position={[rightSpindleX, spindleCenterY, 0]} rotation={[0, 0, fieldRot]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.95, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.06} metalness={0.98} />
            </mesh>
            {[-0.38, 0.38].map((cz, i) => (
              <mesh key={i} position={[0, 0, cz]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.095, 0.095, 0.06, 24]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 2: MONOLITHIC HOUSING & SUPERCONDUCTING TOROIDS (Order 2, frame 40)
          ========================================================================= */}
      {housingLanded && (
        <group position={[0, housingDropY, 0]}>
          {/* Monolithic Aerodynamic Vacuum Chamber Housing */}
          <group position={[0, spindleCenterY, 0]}>
            {/* Left Containment Shell with Gold Shielding */}
            <RoundedBox args={[0.08, 0.62, 0.92]} radius={0.035} smoothness={4} position={[-0.46, 0, 0]}>
              <meshStandardMaterial color="#0B1120" roughness={0.18} metalness={0.88} />
            </RoundedBox>
            {/* Right Containment Shell */}
            <RoundedBox args={[0.08, 0.62, 0.92]} radius={0.035} smoothness={4} position={[0.46, 0, 0]}>
              <meshStandardMaterial color="#0B1120" roughness={0.18} metalness={0.88} />
            </RoundedBox>

            {/* 4 Superconducting Magnetic Toroids Wrapped in Gold / Polished Brass */}
            {[
              [-0.48, -0.28],
              [-0.48, 0.28],
              [0.48, -0.28],
              [0.48, 0.28],
            ].map(([tx, tz], i) => (
              <group
                key={i}
                position={[tx, 0, tz]}
                rotation={[0, 0, isBroken && i === 3 ? ringTilt : 0]}
              >
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.16, 0.045, 16, 32]} />
                  <meshStandardMaterial color="#D97706" roughness={0.12} metalness={0.96} />
                </mesh>
                {/* Glowing Core Coil Glow */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.16, 0.015, 12, 24]} />
                  <meshStandardMaterial
                    color="#00E5FF"
                    emissive={isBroken ? "#EF4444" : "#00E5FF"}
                    emissiveIntensity={1.5 + fieldPulse}
                  />
                </mesh>
              </group>
            ))}

            {/* Armored Crystalline Quartz Viewport (Exposing cutting throat) */}
            <mesh position={[0, 0, 0.47]}>
              <boxGeometry args={[0.72, 0.38, 0.02]} />
              <meshStandardMaterial
                color="#38BDF8"
                roughness={0.05}
                metalness={0.1}
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>

          {/* Hyperbolic Magnetic Influx Funnel / Hopper */}
          <group position={[0, spindleCenterY + 0.48, 0]}>
            {/* Influx Throat Walls */}
            <mesh position={[0, 0, 0.42]} rotation={[0.42, 0, 0]}>
              <boxGeometry args={[0.98, 0.42, 0.025]} />
              <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.88} />
            </mesh>
            <mesh position={[0, 0, -0.42]} rotation={[-0.42, 0, 0]}>
              <boxGeometry args={[0.98, 0.42, 0.025]} />
              <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.88} />
            </mesh>
            <mesh position={[-0.48, 0, 0]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[0.025, 0.42, 0.84]} />
              <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.88} />
            </mesh>
            <mesh position={[0.48, 0, 0]} rotation={[0, 0, 0.35]}>
              <boxGeometry args={[0.025, 0.42, 0.84]} />
              <meshStandardMaterial color="#0B1120" roughness={0.2} metalness={0.88} />
            </mesh>

            {/* Neon Cyan Superconducting Throat Trim */}
            <RoundedBox args={[1.12, 0.04, 1.0]} radius={0.02} smoothness={4} position={[0, 0.2, 0]}>
              <meshStandardMaterial
                color="#00E5FF"
                emissive={isBroken ? "#EF4444" : "#00E5FF"}
                emissiveIntensity={1.8 + fieldPulse}
              />
            </RoundedBox>
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 3: CRYOGENIC CONDUITS & ENERGY FIELD EMITTERS (Order 3, frame 60)
          ========================================================================= */}
      {conduitLanded && (
        <group position={[conduitDropX, 0, 0]}>
          {/* Rear Cryogenic Distribution Manifold */}
          <group position={[0, spindleCenterY + 0.15, -0.58]}>
            <RoundedBox args={[0.54, 0.28, 0.22]} radius={0.025} smoothness={4}>
              <meshStandardMaterial color="#0B1120" roughness={0.25} metalness={0.85} />
            </RoundedBox>

            {/* Pulsing Cryo-Liquid Conduit Tubes */}
            {[-0.18, 0, 0.18].map((cx, i) => (
              <group key={i} position={[cx, 0, 0.12]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.26, 16]} />
                  <meshStandardMaterial
                    color="#00E5FF"
                    emissive={isBroken ? "#EF4444" : "#00E5FF"}
                    emissiveIntensity={1.2 + fieldPulse}
                  />
                </mesh>
              </group>
            ))}

            {/* Superconducting Power Couplings (Polished Brass / Gold) */}
            {[-0.22, 0.22].map((gx, i) => (
              <mesh key={i} position={[gx, 0.16, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
                <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
              </mesh>
            ))}

            {/* Ruptured Cryo Vent in Act 4 Overload */}
            {isBroken && (
              <mesh position={[0.22 + arcVentOffset, 0.16, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            )}
          </group>
        </group>
      )}

      {/* =========================================================================
          MODULE 4: COUNTER-ROTATING PLASMA CUTTER RINGS (Order 4, frame 75)
          ========================================================================= */}
      {plasmaLanded && (
        <group>
          {/* Left Spindle Plasma Blades (Clockwise: -fieldRot) */}
          <group position={[leftSpindleX, spindleCenterY, 0]} rotation={[0, 0, -fieldRot]}>
            {Array.from({ length: plasmaRings }).map((_, i) => {
              const z = (i - (plasmaRings - 1) / 2) * ringSpacing;
              const ringOffset = (i * Math.PI) / 6;
              return (
                <group key={`l_plasma_${i}`} position={[0, 0, z]} rotation={[0, 0, ringOffset]}>
                  {/* Concentric Magnetic Ring Core */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.105, 0.105, 0.028, 32]} />
                    <meshStandardMaterial color="#050814" roughness={0.1} metalness={0.95} />
                  </mesh>

                  {/* 6 Ionized White/Cyan Plasma Cutter Teeth */}
                  {[0, 1, 2, 3, 4, 5].map((t) => {
                    const ang = (t * 2 * Math.PI) / 6;
                    return (
                      <group key={t} rotation={[0, 0, ang]}>
                        {/* Plasma Arc Blade */}
                        <mesh position={[0.14, 0.02, 0]}>
                          <boxGeometry args={[0.085, 0.035, 0.022]} />
                          <meshStandardMaterial
                            color="#FFFFFF"
                            emissive={isBroken ? "#EF4444" : "#00E5FF"}
                            emissiveIntensity={plasmaIntensity * 1.5}
                          />
                        </mesh>
                        {/* Singularity Tip */}
                        <mesh position={[0.185, 0.045, 0]} rotation={[0, 0, -0.6]}>
                          <coneGeometry args={[0.02, 0.06, 6]} />
                          <meshStandardMaterial
                            color="#FFFFFF"
                            emissive={isBroken ? "#EF4444" : "#00E5FF"}
                            emissiveIntensity={plasmaIntensity * 2.0}
                          />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>

          {/* Right Spindle Plasma Blades (Counter-Clockwise: +fieldRot) */}
          {/* Interleaved with Left Spindle along Z */}
          <group position={[rightSpindleX, spindleCenterY, 0]} rotation={[0, 0, fieldRot]}>
            {Array.from({ length: plasmaRings }).map((_, i) => {
              const z = (i - (plasmaRings - 1) / 2) * ringSpacing + ringSpacing * 0.5;
              if (z > 0.32 || z < -0.32) return null;
              const ringOffset = (i * Math.PI) / 6 + Math.PI / 12;
              return (
                <group key={`r_plasma_${i}`} position={[0, 0, z]} rotation={[0, 0, ringOffset]}>
                  {/* Magnetic Core */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.105, 0.105, 0.028, 32]} />
                    <meshStandardMaterial color="#050814" roughness={0.1} metalness={0.95} />
                  </mesh>

                  {/* 6 Ionized Plasma Cutter Teeth */}
                  {[0, 1, 2, 3, 4, 5].map((t) => {
                    const ang = (t * 2 * Math.PI) / 6;
                    return (
                      <group key={t} rotation={[0, 0, ang]}>
                        <mesh position={[0.14, -0.02, 0]}>
                          <boxGeometry args={[0.085, 0.035, 0.022]} />
                          <meshStandardMaterial
                            color="#FFFFFF"
                            emissive={isBroken ? "#EF4444" : "#00E5FF"}
                            emissiveIntensity={plasmaIntensity * 1.5}
                          />
                        </mesh>
                        <mesh position={[0.185, -0.045, 0]} rotation={[0, 0, 0.6]}>
                          <coneGeometry args={[0.02, 0.06, 6]} />
                          <meshStandardMaterial
                            color="#FFFFFF"
                            emissive={isBroken ? "#EF4444" : "#00E5FF"}
                            emissiveIntensity={plasmaIntensity * 2.0}
                          />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>

          {/* Central Singularity Vortex Glow between the two shafts */}
          <mesh position={[0, spindleCenterY, 0]}>
            <sphereGeometry args={[0.12 + fieldPulse * 0.04, 24, 24]} />
            <meshBasicMaterial
              color={isBroken ? "#EF4444" : "#FFFFFF"}
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      )}

      {/* Assembly & Catastrophic Overload Sparks */}
      <SparkBurst
        active={plinthSnapSpark}
        frameOffset={local - 6}
        position={[0, 0.15, 0]}
        color="#00E5FF"
        scale={1.0}
      />
      <SparkBurst
        active={coreSnapSpark}
        frameOffset={local - 20}
        position={[0, spindleCenterY, 0]}
        color="#38BDF8"
        scale={1.2}
      />
      <SparkBurst
        active={housingSnapSpark}
        frameOffset={local - 40}
        position={[0, spindleCenterY + 0.4, 0]}
        color="#00E5FF"
        scale={1.3}
      />
      <SparkBurst
        active={conduitSnapSpark}
        frameOffset={local - 60}
        position={[0, spindleCenterY + 0.15, -0.58]}
        color="#D97706"
        scale={1.1}
      />
      {/* Blinding Singularity Shockwave / Arc Rupture */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0, spindleCenterY, 0]}
        color="#00E5FF"
        scale={1.8}
        count={16}
      />
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0.22, spindleCenterY + 0.15, -0.58]}
        color="#EF4444"
        scale={1.5}
        count={16}
      />
    </group>
  );
};
