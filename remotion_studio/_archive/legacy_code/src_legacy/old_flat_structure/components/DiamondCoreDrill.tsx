import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { getCurrentTier, getTierLocalFrame } from "./StageTimeline";
import { SparkBurst } from "./SparkBurst";

export const DiamondCoreDrill: React.FC = () => {
  const frame = useCurrentFrame();
  const tier = getCurrentTier(frame);
  const local = getTierLocalFrame(frame);

  if (tier !== 3) return null;

  // --- ACT 1: MAGNETIC SNAP-LOCK KINEMATICS (frames 0..70 / global 580..650) ---
  // 1. Blue vertical column lands from above at local 0..4 (global 580f)
  const columnDropY = interpolate(local, [0, 4], [3.5, 0], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Electric motor carrier docks from left (x = -3.5 to 0) at local 20f (global 600f)
  const carrierFlyX = interpolate(local, [15, 20], [-3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const carrierHasLanded = local >= 20;
  const carrierSnapActive = local >= 20 && local <= 24;
  const carrierSnapOffset = local - 20;

  // 3. Water manifold snaps from rear at local 40f (global 620f)
  const manifoldFlyZ = interpolate(local, [35, 40], [-3.5, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const manifoldHasLanded = local >= 40;
  const manifoldSnapActive = local >= 40 && local <= 44;
  const manifoldSnapOffset = local - 40;

  // 4. Diamond barrel bit docks on spindle from below at local 60f (global 640f)
  const barrelFlyY = interpolate(local, [55, 60], [-1.8, 0], {
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barrelHasLanded = local >= 60;
  const barrelSnapActive = local >= 60 && local <= 64;
  const barrelSnapOffset = local - 60;

  // --- ACT 2: STARTUP CHAIN REACTION (frames 71..150 / global 651..730) ---
  // Red industrial mushroom button depresses at local 80f (global 660f)
  const buttonPressY = interpolate(local, [78, 80], [0.045, 0.015], {
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonSnapActive = local >= 80 && local <= 84;
  const buttonSnapOffset = local - 80;

  // Water flow initiates at local 100f (global 680f)
  const waterFlowActive = local >= 100 && local < 265;

  // Spindle rotation (3000 RPM high-speed blur spool up at local 120f / global 700f)
  let spindleAngle = 0;
  const isSheared = local >= 265;

  if (local >= 120 && local < 150) {
    const ramp = interpolate(local, [120, 150], [0, 60], {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    spindleAngle = ramp;
  } else if (local >= 150 && !isSheared) {
    spindleAngle = 60 + (local - 150) * 2.2;
  }

  // Pressure gauge needle (slams past redline on water hammer at 255f)
  const gaugeAngle = interpolate(local, [100, 150, 255, 260], [0, 1.4, 1.4, 2.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- ACT 3: PRECISION CORE DRILLING (frames 151..250 / global 731..830) ---
  const feedDepth = interpolate(local, [151, 250], [0, 0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const feedY = -feedDepth;

  // Water spray foam ring at cutting face (Act 3: 151..250)
  const showWaterSpray = local >= 151 && local <= 250;

  // --- ACT 4: WATER HAMMER & 2.5m STEAM CONE BLOWOUT (frames 251..289 / global 831..869) ---
  // Water hammer shockwave at local 255f (global 835f)
  const hammerShudder =
    local >= 255 && local < 265
      ? Math.sin((local - 255) * 6.0) * 0.025 * Math.exp(-(local - 255) * 0.18)
      : 0;

  // Pressurized hose blowout at local 265f (global 845f)
  const hoseBlowoutActive = local >= 265 && local <= 289;
  const blowoutProgress = (local - 265) / 24;
  const steamConeHeight = 2.4 * Math.min(1.0, blowoutProgress * 2.2);
  const steamConeRadius = 0.08 + blowoutProgress * 0.55;
  const steamConeOpacity = Math.max(0, 0.95 - blowoutProgress * 0.85);

  const blowoutSparkActive = local >= 265 && local <= 269;
  const blowoutSparkOffset = local - 265;

  // Motor carrier shears off column rack
  const shearProgress = interpolate(local, [265, 278], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const motorShearX = isSheared ? shearProgress * 0.28 : 0;
  const motorShearY = isSheared ? -shearProgress * 0.38 : 0;
  const motorTiltZ = isSheared ? -shearProgress * 0.48 : 0;

  return (
    <group position={[hammerShudder, columnDropY, 0]}>
      {/* Docking Contact Spark Bursts */}
      <SparkBurst
        active={carrierSnapActive}
        frameOffset={carrierSnapOffset}
        position={[-0.15, 1.35, 0]}
        color="#38BDF8"
        scale={1.2}
        count={14}
      />
      <SparkBurst
        active={manifoldSnapActive}
        frameOffset={manifoldSnapOffset}
        position={[0, 1.48, -0.22]}
        color="#00E5FF"
        scale={1.1}
        count={12}
      />
      <SparkBurst
        active={barrelFlyY !== 0 && barrelSnapActive}
        frameOffset={barrelSnapOffset}
        position={[0, 0.77, 0]}
        color="#CBD5E1"
        scale={1.3}
        count={16}
      />
      <SparkBurst
        active={buttonSnapActive}
        frameOffset={buttonSnapOffset}
        position={[-0.22, 1.58, 0]}
        color="#EF4444"
        scale={0.9}
        count={10}
      />

      {/* Hose Blowout Spark Burst at coupling */}
      <SparkBurst
        active={blowoutSparkActive}
        frameOffset={blowoutSparkOffset}
        position={[0, 1.45 + feedY, -0.22]}
        color="#38BDF8"
        scale={1.8}
        count={20}
        spread={1.4}
      />

      {/* ============================================================= */}
      {/* 1. BLUE VERTICAL GUIDE COLUMN RIG (Lands at local 0f)         */}
      {/* ============================================================= */}
      <group position={[-0.38, 0, 0]}>
        {/* Base Anchor Footing Flange (Zero bolts, monolithic wedge clamp) */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.26, 0.14, 0.42]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.88} />
        </mesh>

        {/* Vertical Heavy Precision Mast in Industrial Cobalt Blue */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.14, 1.9, 0.16]} />
          <meshStandardMaterial color="#2563EB" roughness={0.25} metalness={0.75} />
        </mesh>

        {/* Machined Dove-tail Guide Spine & Rack Teeth along front face */}
        <mesh position={[0.075, 1.15, 0]}>
          <boxGeometry args={[0.02, 1.85, 0.12]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* Top Mast Cap & Hoist Ring */}
        <mesh position={[0, 2.12, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* ============================================================= */}
      {/* 2. ELECTRIC MOTOR CARRIER & WATER MANIFOLD (Docks at local 20f)*/}
      {/* ============================================================= */}
      {carrierHasLanded && (
        <group
          position={[
            carrierFlyX + motorShearX,
            feedY + motorShearY,
            0,
          ]}
          rotation={[0, 0, motorTiltZ]}
        >
          {/* Sliding Dove-Tail Carriage Bracket */}
          <mesh position={[-0.24, 1.35, 0]}>
            <boxGeometry args={[0.16, 0.48, 0.28]} />
            <meshStandardMaterial color="#334155" roughness={0.32} metalness={0.85} />
          </mesh>

          {/* Feed Star Handwheel on Carriage Side */}
          <group position={[-0.34, 1.35, 0.16]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.9} />
            </mesh>
            {[0, 1, 2].map((sIdx) => {
              const sAngle = (sIdx * (Math.PI * 2)) / 3 + local * 0.08;
              return (
                <mesh
                  key={sIdx}
                  position={[Math.cos(sAngle) * 0.09, Math.sin(sAngle) * 0.09, 0.04]}
                  rotation={[0, 0, sAngle]}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.18, 12]} />
                  <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.85} />
                </mesh>
              );
            })}
          </group>

          {/* Electric Motor Housing (High RPM, finned aluminum) */}
          <group position={[0, 1.35, 0]}>
            {/* Cylindrical Stator Housing */}
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.42, 24]} />
              <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.85} />
            </mesh>

            {/* Cyan LED Status Light Ring */}
            <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.125, 0.012, 12, 24]} />
              <meshStandardMaterial
                color="#00E5FF"
                emissive="#00E5FF"
                emissiveIntensity={local >= 120 ? 3.5 : 0.5}
                toneMapped={false}
              />
            </mesh>

            {/* Gearbox Reduction Cone below motor */}
            <mesh position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.12, 0.07, 0.12, 24]} />
              <meshStandardMaterial color="#334155" roughness={0.28} metalness={0.9} />
            </mesh>
          </group>

          {/* ON-MACHINE PHYSICAL TRIGGER: Red Industrial Mushroom Button */}
          <group position={[-0.14, 1.62, 0.08]}>
            {/* Yellow Warning Collar Ring */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.02, 16]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Depressible Red Domed Mushroom Button (snaps down at frame 660) */}
            <mesh position={[0, buttonPressY, 0]}>
              <cylinderGeometry args={[0.048, 0.042, 0.035, 20]} />
              <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.4} />
            </mesh>
          </group>

          {/* Water Manifold, Pressure Gauge & Hose Assembly */}
          {manifoldHasLanded && (
            <group position={[0, 1.48, manifoldFlyZ - 0.16]}>
              {/* Brass Manifold Valve Block */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.08, 0.08, 0.08]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.9} />
              </mesh>

              {/* Round Analog Pressure Gauge on Manifold */}
              <group position={[0.05, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.038, 0.038, 0.015, 20]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
                </mesh>
                {/* Gauge Needle */}
                <mesh
                  position={[0, 0.008, 0.01]}
                  rotation={[0, 0, -gaugeAngle]}
                >
                  <planeGeometry args={[0.006, 0.028]} />
                  <meshBasicMaterial color="#EF4444" />
                </mesh>
              </group>

              {/* Braided Stainless Steel Water Hose */}
              {!isSheared && (
                <mesh position={[0, 0.12, -0.08]} rotation={[0.6, 0, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.32, 12]} />
                  <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
                </mesh>
              )}

              {/* Hollow Rotary Swivel Union into Spindle */}
              <mesh position={[0, -0.06, 0.04]}>
                <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.95} />
              </mesh>
            </group>
          )}

          {/* 2.5m Vertical Steam / Water Blowout Cone (Act 4: frames 845..869) */}
          {hoseBlowoutActive && (
            <group position={[0, 1.5, -0.16]}>
              <mesh position={[0, steamConeHeight * 0.5, 0]}>
                <coneGeometry args={[steamConeRadius, steamConeHeight, 24, 1, true]} />
                <meshStandardMaterial
                  color="#F8FAFC"
                  roughness={0.1}
                  transparent={true}
                  opacity={steamConeOpacity}
                />
              </mesh>

              {/* Billowing Steam Droplets */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((bIdx) => {
                const sProg = ((local * 0.08 + bIdx * 0.125) % 1.0);
                const sY = sProg * steamConeHeight;
                const sR = (0.05 + sProg * steamConeRadius);
                const sAng = bIdx * 0.8 + local * 0.15;
                return (
                  <mesh
                    key={bIdx}
                    position={[
                      Math.cos(sAng) * sR,
                      sY,
                      Math.sin(sAng) * sR,
                    ]}
                  >
                    <sphereGeometry args={[0.04 + sProg * 0.08, 10, 10]} />
                    <meshStandardMaterial
                      color="#E2E8F0"
                      transparent={true}
                      opacity={Math.max(0, 0.7 - sProg * 0.7)}
                    />
                  </mesh>
                );
              })}
            </group>
          )}
        </group>
      )}

      {/* ============================================================= */}
      {/* 3. DIAMOND CORE BARREL BIT (Docks on spindle at local 60f)    */}
      {/* ============================================================= */}
      {barrelHasLanded && (
        <group
          position={[
            carrierFlyX + motorShearX,
            barrelFlyY + feedY + motorShearY,
            0,
          ]}
          rotation={[0, spindleAngle, motorTiltZ]}
        >
          {/* Threaded Drive Spindle Extension */}
          <mesh position={[0, 1.04, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.14, 16]} />
            <meshStandardMaterial color="#64748B" roughness={0.25} metalness={0.92} />
          </mesh>

          {/* Hollow Stainless Steel Core Barrel Body (Diameter 0.38) */}
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.26, 32, 1, true]} />
            <meshStandardMaterial color="#475569" roughness={0.22} metalness={0.95} />
          </mesh>

          {/* Diamond Cutting Crown Rim with Laser-Welded Segments */}
          <group position={[0, 0.765, 0]}>
            {/* Base Support Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.19, 0.014, 12, 32]} />
              <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
            </mesh>

            {/* 12 Sparkling Laser-Welded Diamond Segments */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((segIdx) => {
              const segAngle = (segIdx * Math.PI * 2) / 12;
              return (
                <mesh
                  key={segIdx}
                  position={[
                    Math.cos(segAngle) * 0.19,
                    -0.015,
                    Math.sin(segAngle) * 0.19,
                  ]}
                  rotation={[0, -segAngle, 0]}
                >
                  <boxGeometry args={[0.018, 0.024, 0.048]} />
                  <meshStandardMaterial
                    color="#CBD5E1"
                    roughness={0.15}
                    metalness={0.98}
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
