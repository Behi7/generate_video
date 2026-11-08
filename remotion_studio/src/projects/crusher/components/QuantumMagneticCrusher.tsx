import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { getCurrentTier, getTierLocalFrame } from "@shared/contracts/StageTimeline";
import { SparkBurst } from "@shared/vfx/SparkBurst";

export const QuantumMagneticCrusher: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 4) return null;

  // --- ACT 1: STAGGERED LEGO SNAP ASSEMBLY (0..69f) ---
  // Step 2 (+20f): 4 Superconducting Magnetic Toroids drop in
  const toroidDropY = interpolate(local, [15, 20], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const toroidLanded = local >= 20;
  const toroidSnap = local >= 20 && local <= 24;

  // Step 3 (+40f): Upper Laser Compression Head docks
  const emitterDropY = interpolate(local, [35, 40], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emitterLanded = local >= 40;
  const emitterSnap = local >= 40 && local <= 44;

  // Step 4 (+60f): Heavy Armored Cryo-Power Cable slams into socket
  const cableDropX = interpolate(local, [55, 60], [3.2, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cableLanded = local >= 60;
  const cableSnap = local >= 60 && local <= 64;

  // --- ACT 2 & 3: FIELD EXCITATION & SINGULARITY PINCH (70..249f) ---
  let fieldIntensity = 0;
  let plasmaPulse = 0;
  let emitterDescentY = 0;

  if (local >= 75 && local < 120) {
    // Act 2: Sequential coil charging
    fieldIntensity = interpolate(local, [75, 120], [0, 1], {
      easing: Easing.out(Easing.quad),
    });
  } else if (local >= 120 && local < 150) {
    // Laser alignment & plasma ignition
    fieldIntensity = 1.0;
    plasmaPulse = Math.sin((local - 120) * 0.8) * 0.3 + 0.7;
    emitterDescentY = interpolate(local, [130, 150], [0, -0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 150 && local < 255) {
    // Act 3: Full Hyperbolic Magnetic Pinch
    fieldIntensity = 2.2;
    plasmaPulse = Math.sin((local - 150) * 1.5) * 0.5 + 1.2;
    emitterDescentY = interpolate(local, [150, 250], [-0.15, -0.42], {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (local >= 255) {
    // Overload state
    fieldIntensity = 4.0;
    plasmaPulse = 2.5;
    emitterDescentY = -0.42;
  }

  // --- ACT 4: OVERLOAD CATASTROPHIC FRACTURE (250..289f) ---
  const isBroken = local >= 265;
  const breakP = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breakSpark = local >= 265 && local <= 269;

  // Breakdown displacements
  const emitterTiltZ = isBroken ? breakP * 0.25 : 0;
  const coilWarp = isBroken ? breakP * 0.15 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CARBON-TITANIUM CHASSIS FRAME */}
      <group position={[0, 0, 0]}>
        {/* Quad Dark Obsidian Corner Columns */}
        {[
          [-0.65, -0.45],
          [0.65, -0.45],
          [-0.65, 0.45],
          [0.65, 0.45],
        ].map(([xOff, zOff], idx) => (
          <RoundedBox
            key={idx}
            args={[0.18, 2.3, 0.18]}
            radius={0.03}
            smoothness={4}
            position={[xOff, 1.25, zOff]}
          >
            <meshStandardMaterial color="#0B0F19" roughness={0.3} metalness={0.88} />
          </RoundedBox>
        ))}

        {/* Monolithic Top Magnetic Containment Cap */}
        <RoundedBox args={[1.56, 0.36, 1.16]} radius={0.04} smoothness={4} position={[0, 2.3, 0]}>
          <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.92} />
        </RoundedBox>

        {/* Cyan Neon Accent Insets on Top Cap */}
        <mesh position={[0, 2.3, 0.59]}>
          <planeGeometry args={[1.3, 0.04]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={fieldIntensity * 1.5 + 0.5}
          />
        </mesh>
      </group>

      {/* 2. SUPERCONDUCTING MAGNETIC TOROID RINGS */}
      {toroidLanded && (
        <group position={[0, toroidDropY, 0]}>
          {[-0.45, 0.45].map((xOff, idx) => (
            <group
              key={idx}
              position={[xOff, 1.25, 0]}
              rotation={[0, 0, (idx === 0 ? coilWarp : -coilWarp)]}
            >
              {/* Outer Protective Cryo Housing */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.36, 0.065, 16, 32]} />
                <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
              </mesh>

              {/* Inner Glowing Superconducting Ring */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.36, 0.03, 16, 32]} />
                <meshStandardMaterial
                  color="#00E5FF"
                  emissive={isBroken ? "#EF4444" : "#00E5FF"}
                  emissiveIntensity={fieldIntensity * 2.5 + 0.4}
                  roughness={0.05}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 3. QUAD LASER COMPRESSION EMITTER & PLASMA CONVERGENCE HEAD */}
      {emitterLanded && (
        <group
          position={[
            0,
            1.75 + emitterDropY + emitterDescentY,
            0,
          ]}
          rotation={[0, 0, emitterTiltZ]}
        >
          {/* Main Octagonal Laser Carrier Block */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.38, 0.32, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.94} />
          </mesh>

          {/* Mirror-Chrome Focusing Ram Piston */}
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.38, 24]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.04} metalness={0.99} />
          </mesh>

          {/* Blinding Cyan Plasma Emitter Lens */}
          <group position={[0, -0.48, 0]}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial
                color="#00E5FF"
                emissive="#00E5FF"
                emissiveIntensity={plasmaPulse * 3.0}
              />
            </mesh>

            {/* Converging Vertical Laser Energy Beam onto Specimen */}
            {fieldIntensity > 0.5 && (
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.08, 0.14, 0.8, 16]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive="#00E5FF"
                  emissiveIntensity={plasmaPulse * 4.5}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            )}
          </group>
        </group>
      )}

      {/* 4. ARMORED HIGH-VOLTAGE CRYO CABLE & PLUG */}
      {cableLanded && (
        <group position={[0.68 + cableDropX, 1.85, -0.1]}>
          {/* Heavy Armored Plug Body */}
          <RoundedBox args={[0.26, 0.22, 0.22]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#D97706" roughness={0.15} metalness={0.95} />
          </RoundedBox>

          {/* Dual Chrome High-Current Busbars */}
          <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.24, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Heavy Corrugated Cable entering plug */}
          <mesh position={[-0.24, -0.15, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.05, 0.05, 0.45, 16]} />
            <meshStandardMaterial color="#0B0F19" roughness={0.7} metalness={0.3} />
          </mesh>
        </group>
      )}

      {/* Assembly Docking Snaps */}
      <SparkBurst active={toroidSnap} frameOffset={local - 20} position={[0, 1.25, 0]} color="#00E5FF" scale={1.0} />
      <SparkBurst active={emitterSnap} frameOffset={local - 40} position={[0, 1.75, 0]} color="#E2E8F0" scale={0.9} />
      <SparkBurst active={cableSnap} frameOffset={local - 60} position={[0.68, 1.85, -0.1]} color="#00E5FF" scale={1.2} />

      {/* Singularity Overload Core Flash */}
      <SparkBurst
        active={breakSpark}
        frameOffset={local - 265}
        position={[0, 0.8, 0]}
        color="#00E5FF"
        scale={2.2}
        count={16}
      />
    </group>
  );
};