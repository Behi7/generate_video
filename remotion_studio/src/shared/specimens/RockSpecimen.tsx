import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "../contracts/StageTimeline";
import { SparkBurst } from "../vfx/SparkBurst";

export const RockSpecimen: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  // Vise Clamping Kinematics (Tier 1, Act 1: frames 0..15)
  const isViseClamping = tier === 1 && local < 15;
  const viseJawSpread = isViseClamping
    ? interpolate(local, [0, 15], [0.14, 0], {
        easing: Easing.bezier(0.1, 0.9, 0.2, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const viseClampImpact = tier === 1 && local >= 15 && local <= 19;
  const viseClampOffset = tier === 1 ? local - 15 : -1;

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. HEAVY MONOLITHIC STEEL VISE (Zero bolts, Dove-tail ways) */}
      {/* ========================================================= */}
      {/* Vise Base Bed Plate */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.34, 0.16, 0.82]} />
        <meshStandardMaterial color="#1E293B" roughness={0.32} metalness={0.88} />
      </mesh>

      {/* Guide Slide Bed Center Channel */}
      <mesh position={[0, 0.165, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.36]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Heavy Chrome ACME Lead Screw */}
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, 1.28, 20]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
      </mesh>

      {/* Lead Screw Knurled Turnstile Handle (Right side) */}
      <group position={[0.7, 0.18, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 24]} />
          <meshStandardMaterial color="#64748B" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.38, 16]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.95} />
        </mesh>
      </group>

      {/* Left Clamping Jaw Body */}
      <group position={[-0.43 - viseJawSpread, 0.38, 0]}>
        {/* Jaw Base Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.44, 0.74]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Hardened Steel Serrated Gripper Plate */}
        <mesh position={[0.085, 0, 0]}>
          <boxGeometry args={[0.02, 0.4, 0.7]} />
          <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.92} />
        </mesh>
      </group>

      {/* Right Clamping Jaw Body */}
      <group position={[0.43 + viseJawSpread, 0.38, 0]}>
        {/* Jaw Base Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.44, 0.74]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Hardened Steel Serrated Gripper Plate */}
        <mesh position={[-0.085, 0, 0]}>
          <boxGeometry args={[0.02, 0.4, 0.7]} />
          <meshStandardMaterial color="#64748B" roughness={0.22} metalness={0.92} />
        </mesh>
      </group>

      {/* Vise Clamp Spark Burst on initial clamp impact */}
      <SparkBurst
        active={viseClampImpact}
        frameOffset={viseClampOffset}
        position={[-0.34, 0.38, 0]}
        color="#FDE047"
        scale={0.8}
        count={8}
      />
      <SparkBurst
        active={viseClampImpact}
        frameOffset={viseClampOffset}
        position={[0.34, 0.38, 0]}
        color="#FDE047"
        scale={0.8}
        count={8}
      />

      {/* ========================================================= */}
      {/* 2. GEOLOGICAL SPECIMEN ROCKS PER TIER                      */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* TIER 1: Sandstone / Clay Geological Block ($10)           */}
      {/* --------------------------------------------------------- */}
      {tier === 1 && (
        <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, 0.44, 0]}>
          {/* Main Sedimentary Block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial
              color="#D97706"
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>

          {/* Sedimentary Clay Bands / Strata */}
          <mesh position={[0, -0.12, 0.355]}>
            <planeGeometry args={[0.66, 0.12]} />
            <meshStandardMaterial color="#B45309" roughness={0.96} />
          </mesh>
          <mesh position={[0, 0.15, 0.355]}>
            <planeGeometry args={[0.66, 0.08]} />
            <meshStandardMaterial color="#78350F" roughness={0.98} />
          </mesh>

          {/* Drilled Crater at Top Face (y=0.325 relative to rock center) */}
          {local >= 100 && (
            <group position={[0, 0.326, 0]}>
              {/* Crater Cavity Depression */}
              <mesh rotation={[Math.PI, 0, 0]}>
                <coneGeometry
                  args={[
                    interpolate(local, [100, 250], [0.06, 0.18], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    interpolate(local, [100, 250], [0.04, 0.28], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    20,
                  ]}
                />
                <meshStandardMaterial color="#78350F" roughness={0.95} />
              </mesh>

              {/* Crumbly Debris Rim */}
              {local >= 105 && (
                <group>
                  {[-0.12, -0.06, 0.08, 0.13, 0.02, -0.09, 0.1, -0.04].map((dx, i) => {
                    const dz = [0.09, -0.11, 0.08, -0.07, 0.14, -0.13, -0.02, 0.12][i];
                    const crumbScale = interpolate(local, [105, 200], [0.4, 1.0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    return (
                      <mesh
                        key={i}
                        position={[dx, 0.015, dz]}
                        scale={[crumbScale, crumbScale, crumbScale]}
                      >
                        <boxGeometry args={[0.025, 0.02, 0.028]} />
                        <meshStandardMaterial color="#B45309" roughness={0.94} />
                      </mesh>
                    );
                  })}
                </group>
              )}

              {/* Act 4 Stone Jam Crack (local >= 255) */}
              {local >= 255 && (
                <mesh position={[0.02, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0.3]}>
                  <planeGeometry args={[0.34, 0.018]} />
                  <meshStandardMaterial color="#451A03" roughness={0.9} />
                </mesh>
              )}
            </group>
          )}
        </group>
      )}

      {/* --------------------------------------------------------- */}
      {/* TIER 2: Rough Dark Basalt Geological Block ($100)         */}
      {/* --------------------------------------------------------- */}
      {tier === 2 && (
        <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, 0.44, 0]}>
          {/* Main Dark Volcanic Basalt Block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial
              color="#1E222A"
              roughness={0.88}
              metalness={0.2}
            />
          </mesh>

          {/* Faceted Volcanic Crystalline Inclusions */}
          <mesh position={[-0.15, 0.12, 0.355]}>
            <planeGeometry args={[0.18, 0.16]} />
            <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0.2, -0.1, 0.355]}>
            <planeGeometry args={[0.16, 0.22]} />
            <meshStandardMaterial color="#2D3748" roughness={0.75} metalness={0.35} />
          </mesh>

          {/* Carbide Drilled Borehole at Top Face */}
          {local >= 151 && (
            <group position={[0, 0.326, 0]}>
              {/* Deep Cylindrical Borehole */}
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry
                  args={[
                    0.095,
                    0.09,
                    interpolate(local, [151, 250], [0.08, 0.32], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    24,
                  ]}
                />
                <meshStandardMaterial color="#0B0D12" roughness={0.85} />
              </mesh>

              {/* Basalt Rock Chips Scattering */}
              {[-0.16, -0.11, 0.12, 0.18, -0.05, 0.08, 0.14, -0.15].map((cx, i) => {
                const cz = [0.12, -0.15, 0.14, -0.09, -0.18, 0.17, -0.16, 0.05][i];
                return (
                  <mesh key={i} position={[cx, 0.015, cz]} rotation={[0.4 * i, 0.6 * i, 0]}>
                    <boxGeometry args={[0.032, 0.022, 0.038]} />
                    <meshStandardMaterial color="#334155" roughness={0.82} metalness={0.3} />
                  </mesh>
                );
              })}

              {/* Spark Bursts at Carbide Teeth Contact (Operating Act 151..250) */}
              {local >= 151 && local <= 248 && local % 8 < 4 && (
                <SparkBurst
                  active={true}
                  frameOffset={local % 4}
                  position={[0, 0.02, 0]}
                  color="#F59E0B"
                  scale={1.1}
                  count={12}
                />
              )}

              {/* Act 4 Jammed Carbide Shear Crack (local >= 255) */}
              {local >= 255 && (
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0.8]}>
                  <planeGeometry args={[0.38, 0.025]} />
                  <meshStandardMaterial color="#0B0D12" roughness={0.9} />
                </mesh>
              )}
            </group>
          )}
        </group>
      )}

      {/* --------------------------------------------------------- */}
      {/* TIER 3: Granite / Concrete with Cylindrical Core Hole     */}
      {/* --------------------------------------------------------- */}
      {tier === 3 && (
        <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, 0.44, 0]}>
          {/* Main Granite / Structural Concrete Block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial
              color="#94A3B8"
              roughness={0.62}
              metalness={0.15}
            />
          </mesh>

          {/* Speckled Quartz & Aggregate Inclusions */}
          <mesh position={[0.1, 0.08, 0.355]}>
            <planeGeometry args={[0.24, 0.18]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[-0.18, -0.09, 0.355]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshStandardMaterial color="#64748B" roughness={0.55} metalness={0.25} />
          </mesh>

          {/* Precision Cylindrical Annular Core Hole */}
          {local >= 151 && (
            <group position={[0, 0.326, 0]}>
              {/* Annular Kerf Trench (Ring Cut into Granite) */}
              <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry
                  args={[
                    0.19,
                    0.19,
                    interpolate(local, [151, 250], [0.06, 0.36], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    32,
                    1,
                    true,
                  ]}
                />
                <meshStandardMaterial color="#334155" roughness={0.7} />
              </mesh>

              {/* Central Cylindrical Core Pin Remaining */}
              <mesh position={[0, -0.06, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.28, 32]} />
                <meshStandardMaterial color="#94A3B8" roughness={0.58} />
              </mesh>

              {/* Water Spray Foam Ring around Annulus (Act 3: 151..250) */}
              {local >= 151 && local <= 250 && (
                <group position={[0, 0.02, 0]}>
                  {/* Rotating Spray Mist Ring */}
                  <mesh rotation={[-Math.PI / 2, 0, local * 0.25]}>
                    <ringGeometry args={[0.18, 0.28, 32]} />
                    <meshStandardMaterial
                      color="#38BDF8"
                      transparent={true}
                      opacity={0.65}
                      roughness={0.1}
                    />
                  </mesh>

                  {/* Frothy White Slurry Bubbles */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const ang = (i * Math.PI) / 4 + local * 0.08;
                    const rad = 0.22;
                    return (
                      <mesh
                        key={i}
                        position={[Math.cos(ang) * rad, 0.015, Math.sin(ang) * rad]}
                      >
                        <sphereGeometry args={[0.028, 12, 12]} />
                        <meshStandardMaterial
                          color="#F8FAFC"
                          roughness={0.3}
                          transparent={true}
                          opacity={0.85}
                        />
                      </mesh>
                    );
                  })}
                </group>
              )}

              {/* Slurry Pool Puddle on top surface */}
              <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.31, 32]} />
                <meshStandardMaterial
                  color="#E2E8F0"
                  roughness={0.15}
                  metalness={0.1}
                  transparent={true}
                  opacity={0.55}
                />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* --------------------------------------------------------- */}
      {/* TIER 4: Meteorite Obsidian Core with Glowing Plasma Cuts  */}
      {/* --------------------------------------------------------- */}
      {tier === 4 && (
        <group name="specimen_workpiece" userData={{ isWorkpiece: true }} position={[0, 0.44, 0]}>
          {/* Main Deep Mirror-Gloss Meteorite Obsidian Block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.68, 0.65, 0.7]} />
            <meshStandardMaterial
              color="#050814"
              roughness={0.08}
              metalness={0.92}
            />
          </mesh>

          {/* Iridescent Extraterrestrial Mineral Crystalline Facets */}
          <mesh position={[-0.14, 0.15, 0.355]}>
            <planeGeometry args={[0.22, 0.16]} />
            <meshStandardMaterial
              color="#1E1B4B"
              roughness={0.05}
              metalness={0.95}
              emissive="#312E81"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0.16, -0.12, 0.355]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshStandardMaterial
              color="#0C4A6E"
              roughness={0.06}
              metalness={0.95}
              emissive="#0369A1"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Glowing Plasma Cut Trenches (Act 2..4: frames 120..289) */}
          {local >= 120 && (
            <group position={[0, 0.326, 0]}>
              {/* Concentric Glowing Orbital Plasma Kerf Rings */}
              <mesh rotation={[-Math.PI / 2, 0, local * 0.1]}>
                <ringGeometry args={[0.08, 0.22, 40]} />
                <meshStandardMaterial
                  color="#8B5CF6"
                  emissive="#00E5FF"
                  emissiveIntensity={local >= 250 ? 12.0 : 6.0}
                  toneMapped={false}
                />
              </mesh>

              {/* 4 Cross Trenches from 4 Converging Beams */}
              {[0, 1, 2, 3].map((idx) => {
                const rot = (idx * Math.PI) / 4 + local * 0.35;
                return (
                  <mesh
                    key={idx}
                    position={[0, 0.002, 0]}
                    rotation={[-Math.PI / 2, 0, rot]}
                  >
                    <planeGeometry args={[0.44, 0.035]} />
                    <meshStandardMaterial
                      color="#00E5FF"
                      emissive="#A855F7"
                      emissiveIntensity={8.5}
                      toneMapped={false}
                    />
                  </mesh>
                );
              })}

              {/* Glowing Plasma Vapor Particles Drifting Upward (Act 3..4: 151..289) */}
              {local >= 151 && (
                <group position={[0, 0.05, 0]}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((pIdx) => {
                    const seed = pIdx * 1.618;
                    const vAngle = seed * 3.14 + local * 0.12;
                    const vRadius = 0.08 + (pIdx % 4) * 0.035;
                    const vY = ((local * 0.02 + pIdx * 0.08) % 0.55);
                    const vAlpha = Math.max(0, 1.0 - vY / 0.55);
                    const isCyan = pIdx % 2 === 0;

                    return (
                      <mesh
                        key={pIdx}
                        position={[
                          Math.cos(vAngle) * vRadius,
                          vY,
                          Math.sin(vAngle) * vRadius,
                        ]}
                      >
                        <sphereGeometry args={[0.018, 10, 10]} />
                        <meshStandardMaterial
                          color={isCyan ? "#00E5FF" : "#A855F7"}
                          emissive={isCyan ? "#00E5FF" : "#C084FC"}
                          emissiveIntensity={6.0}
                          transparent={true}
                          opacity={vAlpha * 0.85}
                          toneMapped={false}
                        />
                      </mesh>
                    );
                  })}
                </group>
              )}

              {/* Core Illumination Light onto Obsidian Specimen */}
              <pointLight
                position={[0, 0.2, 0]}
                intensity={local >= 250 ? 45.0 : 25.0}
                color="#00E5FF"
                distance={3.0}
              />
            </group>
          )}
        </group>
      )}
    </group>
  );
};
