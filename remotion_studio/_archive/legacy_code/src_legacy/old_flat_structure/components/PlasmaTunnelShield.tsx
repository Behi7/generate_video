import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export const PlasmaTunnelShield: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 4) return null;

  // --- ACT 1: MAGNETIC SNAP-LOCK KINEMATICS (frames 0..70 / global 870..940) ---
  // 1. Titanium shield housing drops and docks at local 0..4 (global 870f)
  const housingDropY = interpolate(local, [0, 4], [3.5, 0], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Rotary plasma cutter head docks into hub at local 25f (global 895f)
  const cutterDropY = interpolate(local, [20, 25], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cutterHasLanded = local >= 25;
  const cutterSnapActive = local >= 25 && local <= 29;
  const cutterSnapOffset = local - 25;

  // 3. Cryogenic cooling manifolds clamp from sides at local 50f (global 920f)
  const cryoClampX = interpolate(local, [45, 50], [3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cryoHasLanded = local >= 50;
  const cryoSnapActive = local >= 50 && local <= 54;
  const cryoSnapOffset = local - 50;

  // --- ACT 2: ON-MACHINE TRIGGER: ARMORED CABLE PLUG SLAM (frames 71..150 / global 941..1020) ---
  // Armored cable shoots in from x=-2.8 and slams into side socket at local 80f (global 950f)
  const cablePlugX = interpolate(local, [75, 80], [-2.8, -0.58], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cableConnected = local >= 80;

  // Electric arc discharge spark flash at plug contact (frames 80..86)
  const electricArcActive = local >= 80 && local <= 86;
  const electricArcOffset = local - 80;

  // Magnetic field coils pulse neon cyan
  const coilPulse = cableConnected
    ? Math.sin((local - 80) * 0.42) * 1.8 + 4.5
    : 0.8;

  // 4 Plasma laser emitter nozzles ignite at local 120f (global 990f)
  const lasersIgnited = local >= 120;
  const laserBeamAlpha = interpolate(local, [120, 130], [0, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- ACT 3: FULL ROTARY PLASMA TUNNELING (frames 151..250 / global 1021..1120) ---
  const isTunneling = local >= 151;
  const cutterRotation = isTunneling ? (local - 150) * 0.45 : 0;

  // --- ACT 4: BLINDING CENTRAL PLASMA FLARE & COIN FOUNTAIN (frames 251..289 / global 1121..1159) ---
  const isClimax = local >= 251;
  const climaxProgress = interpolate(local, [251, 289], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flareScale = isClimax ? 1.0 + climaxProgress * 2.2 : 0;
  const flareBrightness = isClimax ? 25.0 + climaxProgress * 55.0 : 0;

  return (
    <group position={[0, housingDropY, 0]}>
      {/* Docking Contact Spark Bursts */}
      <SparkBurst
        active={cutterSnapActive}
        frameOffset={cutterSnapOffset}
        position={[0, 1.35, 0]}
        color="#00E5FF"
        scale={1.3}
        count={16}
      />
      <SparkBurst
        active={cryoSnapActive}
        frameOffset={cryoSnapOffset}
        position={[0.32, 1.45, 0]}
        color="#38BDF8"
        scale={1.1}
        count={12}
      />

      {/* Electric Arc Discharge at Armored Cable Plug Slam (Global Frame 950) */}
      <SparkBurst
        active={electricArcActive}
        frameOffset={electricArcOffset}
        position={[-0.58, 1.25, 0.12]}
        color="#A855F7"
        scale={2.2}
        count={18}
        spread={1.4}
      />
      <SparkBurst
        active={electricArcActive}
        frameOffset={electricArcOffset}
        position={[-0.58, 1.25, 0.12]}
        color="#00E5FF"
        scale={1.8}
        count={14}
        spread={1.2}
      />

      {/* ============================================================= */}
      {/* 1. TITANIUM SHIELD HOUSING & A-FRAME ARCHES (Zero bolts)      */}
      {/* ============================================================= */}
      <group position={[0, 0, 0]}>
        {/* Left Heavy Aerospace Titanium Mast Stanchion */}
        <mesh position={[-0.52, 0.85, 0]}>
          <boxGeometry args={[0.12, 1.5, 0.32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.95} />
        </mesh>
        {/* Right Heavy Aerospace Titanium Mast Stanchion */}
        <mesh position={[0.52, 0.85, 0]}>
          <boxGeometry args={[0.12, 1.5, 0.32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.95} />
        </mesh>

        {/* Top Transverse Gantry Bridge */}
        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[1.16, 0.16, 0.38]} />
          <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.92} />
        </mesh>

        {/* Outer Transparent Aerospace Quartz Tunneling Mantle & Open Viewport */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.42, 0.46, 0.52, 24, 1, true]} />
          <meshPhysicalMaterial
            color="#F8FAFC"
            transmission={0.94}
            opacity={1}
            transparent
            roughness={0.06}
            ior={1.5}
            thickness={0.15}
          />
        </mesh>

        {/* 6 Titanium Reinforcing Perimeter Ribs (Open cage architecture) */}
        {[0, 1, 2, 3, 4, 5].map((rIdx) => {
          const ribAngle = (rIdx * Math.PI) / 3;
          const ribR = 0.44;
          return (
            <mesh
              key={rIdx}
              position={[Math.cos(ribAngle) * ribR, 1.25, Math.sin(ribAngle) * ribR]}
              rotation={[0, -ribAngle, 0]}
            >
              <boxGeometry args={[0.035, 0.52, 0.045]} />
              <meshStandardMaterial color="#334155" roughness={0.18} metalness={0.96} />
            </mesh>
          );
        })}

        {/* 4 Superconducting Magnetic Field Containment Coils (Pulse neon cyan) */}
        {[0, 1, 2, 3].map((cIdx) => (
          <mesh key={cIdx} position={[0, 1.05 + cIdx * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.435, 0.016, 12, 36]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={coilPulse}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Hazard High-Voltage Power Receptacle Socket (Left flank) */}
        <group position={[-0.58, 1.25, 0.12]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.09, 0.06, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.88} />
          </mesh>
          <mesh position={[-0.035, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 16]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ============================================================= */}
      {/* 2. ON-MACHINE PHYSICAL TRIGGER: ARMORED POWER CABLE PLUG      */}
      {/* ============================================================= */}
      <group position={[cablePlugX, 1.25, 0.12]}>
        {/* Corrugated Armored Power Conduit */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.85, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Heavy Armored Plug Housing */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.07, 0.14, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.92} />
        </mesh>

        {/* Heavy Flanged Collar with Hazard Color */}
        <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.085, 0.025, 16]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Plug Insulator Contact Pins */}
        <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.98} />
        </mesh>
      </group>

      {/* ============================================================= */}
      {/* 3. CRYOGENIC COOLING MANIFOLDS (Clamps from sides at local 50f)*/}
      {/* ============================================================= */}
      {cryoHasLanded && (
        <group position={[0, 1.45, 0]}>
          {/* Left Cryogenic Delivery Line */}
          <mesh position={[-0.28 - cryoClampX, 0, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.36, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Right Cryogenic Delivery Line */}
          <mesh position={[0.28 + cryoClampX, 0, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.36, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>
      )}

      {/* ============================================================= */}
      {/* 4. ROTARY PLASMA CUTTER HEAD (Docks into hub at local 25f)    */}
      {/* ============================================================= */}
      {cutterHasLanded && (
        <group
          position={[0, cutterDropY + 1.25, 0]}
          rotation={[0, cutterRotation, 0]}
        >
          {/* Central Titanium Hub Rotor */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.18, 24]} />
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.95} />
          </mesh>

          {/* Glowing Superconducting Core Ring */}
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.23, 0.012, 12, 24]} />
            <meshStandardMaterial
              color="#A855F7"
              emissive="#C084FC"
              emissiveIntensity={cableConnected ? 4.5 : 0.8}
              toneMapped={false}
            />
          </mesh>

          {/* 4 Plasma Laser Emitter Torches Arrayed at 90° intervals */}
          {[0, 1, 2, 3].map((tIdx) => {
            const torchAngle = (tIdx * Math.PI) / 2;
            const torchRadius = 0.22;
            const torchX = Math.cos(torchAngle) * torchRadius;
            const torchZ = Math.sin(torchAngle) * torchRadius;

            return (
              <group
                key={tIdx}
                position={[torchX, -0.06, torchZ]}
                rotation={[0, -torchAngle, 0.38]} // Angled down toward rock center
              >
                {/* Torch Body Barrel */}
                <mesh position={[0, -0.06, 0]}>
                  <cylinderGeometry args={[0.032, 0.038, 0.14, 16]} />
                  <meshStandardMaterial
                    color="#334155"
                    roughness={0.2}
                    metalness={0.95}
                  />
                </mesh>

                {/* Tungsten Emitter Nozzle Tip */}
                <mesh position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.018, 0.028, 0.05, 16]} />
                  <meshStandardMaterial
                    color="#475569"
                    roughness={0.15}
                    metalness={0.98}
                  />
                </mesh>

                {/* Violet Plasma Nozzle Glow Ring */}
                <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.022, 0.005, 8, 16]} />
                  <meshStandardMaterial
                    color="#A855F7"
                    emissive="#C084FC"
                    emissiveIntensity={lasersIgnited ? 8.0 : 0}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* ============================================================= */}
      {/* 5. 4 CONVERGING HIGH-ENERGY PLASMA LASER BEAMS (Ignite 990f)  */}
      {/* ============================================================= */}
      {lasersIgnited && cutterHasLanded && (
        <group position={[0, 1.25, 0]} rotation={[0, cutterRotation, 0]}>
          {[0, 1, 2, 3].map((bIdx) => {
            const bAngle = (bIdx * Math.PI) / 2;
            const startR = 0.22;
            const startX = Math.cos(bAngle) * startR;
            const startZ = Math.sin(bAngle) * startR;
            const startY = -0.2; // Nozzle exit

            // Beams converge from nozzle exit [startX, startY, startZ] to rock face [0, -0.485, 0]
            // Vector: [-startX, -0.285, -startZ]
            const midX = startX * 0.5;
            const midZ = startZ * 0.5;
            const midY = startY - 0.145;
            const beamLength = Math.sqrt(startX * startX + startZ * startZ + 0.285 * 0.285);

            return (
              <group key={bIdx}>
                {/* Outer Cyan Plasma Sheath */}
                <mesh
                  position={[midX, midY, midZ]}
                  rotation={[0, -bAngle, 0.62]}
                >
                  <cylinderGeometry args={[0.012, 0.024, beamLength, 12, 1, true]} />
                  <meshStandardMaterial
                    color="#00E5FF"
                    emissive="#00E5FF"
                    emissiveIntensity={10.0}
                    transparent={true}
                    opacity={laserBeamAlpha * 0.85}
                    toneMapped={false}
                  />
                </mesh>

                {/* Inner Violet Singularity Beam Core */}
                <mesh
                  position={[midX, midY, midZ]}
                  rotation={[0, -bAngle, 0.62]}
                >
                  <cylinderGeometry args={[0.005, 0.008, beamLength, 8]} />
                  <meshStandardMaterial
                    color="#FFFFFF"
                    emissive="#A855F7"
                    emissiveIntensity={14.0}
                    transparent={true}
                    opacity={laserBeamAlpha}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* ============================================================= */}
      {/* 6. ACT 4: BLINDING CENTRAL PLASMA FLARE & CELEBRATORY COINS   */}
      {/* ============================================================= */}
      {isClimax && (
        <group position={[0, 0.765, 0]}>
          {/* Central Blinding Plasma Singularity Flare Sphere */}
          <mesh scale={[flareScale, flareScale, flareScale]}>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#00E5FF"
              emissiveIntensity={flareBrightness}
              toneMapped={false}
            />
          </mesh>

          {/* Massive Omnidirectional Light Burst */}
          <pointLight
            position={[0, 0.2, 0]}
            intensity={flareBrightness * 1.5}
            color="#00E5FF"
            distance={6.0}
          />

          {/* Celebratory Golden Coin Fountain (20+ flying gold coins) */}
          <group>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((coinIdx) => {
              const cAngle = (coinIdx * Math.PI * 2) / 16;
              const cSpeed = 0.6 + (coinIdx % 4) * 0.2;
              const cRadius = climaxProgress * cSpeed * 1.6;
              const cY =
                climaxProgress * 1.8 - climaxProgress * climaxProgress * 1.2;
              const cRotX = climaxProgress * (coinIdx + 2) * 4.0;
              const cRotZ = climaxProgress * (coinIdx + 1) * 3.0;

              return (
                <mesh
                  key={coinIdx}
                  position={[
                    Math.cos(cAngle) * cRadius,
                    cY,
                    Math.sin(cAngle) * cRadius,
                  ]}
                  rotation={[cRotX, 0, cRotZ]}
                >
                  <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
                  <meshStandardMaterial
                    color="#FBBF24"
                    roughness={0.18}
                    metalness={0.96}
                    emissive="#F59E0B"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
    </group>
  );
};
