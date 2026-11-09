import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SparkBurst } from "./SparkBurst";

export const ModularPistonPump: React.FC = () => {
  const frame = useCurrentFrame();

  // Active lifespan: frames 125 to 309 (cleared before Tier 3 starts at 310)
  if (frame < 125 || frame >= 310) return null;

  // 1. Magnetic Snap-Lock Kinematics (frames 125 - 134)
  // Bed lands between frames 125 and 128 (3 frames)
  const bedDropY = interpolate(frame, [125, 128], [3.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });

  // Left & right modules fly in from offscreen (x=-3.8 and x=+3.8) and snap together at frame 133
  const moduleFlyProgress = interpolate(frame, [128, 133], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  const leftModuleX = (1 - moduleFlyProgress) * -3.8;
  const rightModuleX = (1 - moduleFlyProgress) * 3.8;

  // Crank drops in and snaps at frame 133
  const topCrankY = interpolate(frame, [129, 133], [3.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.05, 0.9, 0.1, 1),
  });

  // Docking Contact Spark Burst (frames 133 - 136, 4 frames)
  const snapSparkActive = frame >= 133 && frame <= 136;
  const snapSparkFrameOffset = frame - 133;

  // 2. Physical Trigger 1: Brass Throw-Lever on Machine Bed (snaps down at frame 180)
  const isStarted = frame >= 180;
  const leverAngle = interpolate(frame, [179, 181], [0.72, -0.48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });
  const leverClickSpark = frame >= 180 && frame <= 183;

  // 3. Operational Kinematics (frames 180 - 299)
  const activeFrame = isStarted ? frame - 180 : 0;
  const flywheelAngle = isStarted ? activeFrame * 0.28 : 0;
  const crankR = 0.18;
  const crankX = Math.cos(flywheelAngle) * crankR;
  const crankY = Math.sin(flywheelAngle) * crankR;
  const pistonStrokeY = crankY * 0.7;
  const showWaterStream = frame >= 184 && frame < 300;

  // 4. Overload Physical Destruction (frames 300 - 309)
  const isDestroyed = frame >= 300;
  const destroyProgress = interpolate(frame, [300, 309], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Flywheel shears off the spindle, tilts, drops onto bed with sparks (frames 300 - 309)
  const flywheelDestructX = isDestroyed ? -destroyProgress * 0.42 : 0;
  const flywheelDestructY = isDestroyed ? -destroyProgress * 0.52 : 0;
  const flywheelDestructRot = isDestroyed ? destroyProgress * 1.5 : 0;
  const flywheelTiltZ = isDestroyed ? destroyProgress * 0.48 : 0;

  // Cylinder fractures and tilts right on bed
  const cylDestructX = isDestroyed ? destroyProgress * 0.32 : 0;
  const cylDestructRot = isDestroyed ? -destroyProgress * 0.38 : 0;
  const cylCapY = isDestroyed ? destroyProgress * 1.2 : 0;

  // Lever arm snaps and flies off bed
  const leverSnapY = isDestroyed
    ? destroyProgress * 1.2 - destroyProgress * destroyProgress * 1.8
    : 0;
  const leverSnapRot = isDestroyed ? destroyProgress * 4.5 : 0;

  // Destruction spark burst at shearing spindle
  const shearSparkActive = frame >= 300 && frame <= 305;

  // Steam blowout cone on destruction (frames 300 - 308)
  const steamActive = frame >= 300 && frame <= 308;
  const steamProgress = (frame - 300) / 8;
  const steamConeScale = 0.4 + steamProgress * 1.8;
  const steamOpacity = Math.max(0, 0.9 - steamProgress * 0.9);

  return (
    <group position={[0, -2.1, 0.1]} scale={[1.25, 1.25, 1.25]}>
      {/* --- CENTRAL FOUNDATION BED & INDUSTRIAL DOCKING GUIDE RAILS --- */}
      <group position={[0, bedDropY, 0]}>
        {/* Monolithic Cast-Iron Bed Base (No bolts) */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.56, 0.16, 0.84]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Precision Machined Titanium Docking Guide Rails */}
        <mesh position={[0, 0.17, -0.28]}>
          <boxGeometry args={[1.58, 0.03, 0.06]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.95} />
        </mesh>
        <mesh position={[0, 0.17, 0.28]}>
          <boxGeometry args={[1.58, 0.03, 0.06]} />
          <meshStandardMaterial color="#64748B" roughness={0.2} metalness={0.95} />
        </mesh>
        {/* Heavy Flanged Bed Mounting Plates */}
        <mesh position={[-0.72, 0.05, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.86]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.88} />
        </mesh>
        <mesh position={[0.72, 0.05, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.86]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.88} />
        </mesh>
      </group>

      {/* --- LEFT MODULE: Monolithic Bearing Pedestals & Shearing Flywheel --- */}
      <group position={[leftModuleX, bedDropY, 0]}>
        {/* Left Cast-Iron Slider Base with Docking Dovetail */}
        <mesh position={[-0.38, 0.18, 0]}>
          <boxGeometry args={[0.72, 0.12, 0.78]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Docking Interlock Block at Seam */}
        <mesh position={[-0.02, 0.2, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.45]} />
          <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Monolithic Machined Bearing Pedestals (Zero bolts) */}
        <mesh position={[-0.42, 0.58, 0]}>
          <boxGeometry args={[0.16, 0.68, 0.28]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[0.14, 0.58, 0]}>
          <boxGeometry args={[0.16, 0.68, 0.28]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Heavy Spoked Flywheel (Shears off spindle at frame 300) */}
        <group
          position={[-0.42 + flywheelDestructX, 0.84 + flywheelDestructY, 0.12 * destroyProgress]}
          rotation={[0.35 * destroyProgress, flywheelTiltZ, flywheelAngle + flywheelDestructRot]}
        >
          {/* Monolithic Bronze Rim */}
          <mesh>
            <torusGeometry args={[0.5, 0.055, 20, 36]} />
            <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Monolithic Hub Collar */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 24]} />
            <meshStandardMaterial color="#92400E" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* 6 Heavy Machined Spokes */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const spokeAngle = (i * Math.PI) / 3;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(spokeAngle) * 0.25,
                  Math.sin(spokeAngle) * 0.25,
                  0,
                ]}
                rotation={[0, 0, spokeAngle + Math.PI / 2]}
              >
                <cylinderGeometry args={[0.024, 0.024, 0.44, 16]} />
                <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
              </mesh>
            );
          })}
        </group>

        {/* Shearing Spindle Spark Burst */}
        {shearSparkActive && (
          <SparkBurst
            active={true}
            frameOffset={frame - 300}
            position={[-0.42, 0.84, 0.1]}
            count={14}
            spread={0.7}
            color="#F59E0B"
          />
        )}
      </group>

      {/* --- TOP CRANKSHAFT & PIN MODULE (Snaps from top) --- */}
      <group position={[0, topCrankY + bedDropY, 0]}>
        {!isDestroyed && (
          <>
            {/* Machined Titanium Axle Shaft */}
            <mesh position={[-0.14, 0.84, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.8, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* Monolithic Counterweight Crank Web */}
            <group position={[0.14, 0.84, 0.08]}>
              <mesh rotation={[Math.PI / 2, 0, flywheelAngle]}>
                <cylinderGeometry args={[0.22, 0.22, 0.065, 24]} />
                <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
              </mesh>
              {/* Crank Pin */}
              <mesh position={[crankX, crankY, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.065, 16]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.12} metalness={0.95} />
              </mesh>
            </group>
          </>
        )}
      </group>

      {/* --- RIGHT MODULE: Monolithic Bronze Cylinder, Spout & Basin --- */}
      <group
        position={[rightModuleX + cylDestructX, bedDropY, 0]}
        rotation={[0, 0, cylDestructRot]}
      >
        {/* Right Cast Slider Base with Docking Interlock */}
        <mesh position={[0.42, 0.18, 0]}>
          <boxGeometry args={[0.72, 0.12, 0.78]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.06, 0.2, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.45]} />
          <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Monolithic Upright Support Columns (Zero bolts) */}
        <mesh position={[0.38, 0.68, -0.1]}>
          <boxGeometry args={[0.1, 0.88, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
        </mesh>
        <mesh position={[0.38, 0.68, 0.1]}>
          <boxGeometry args={[0.1, 0.88, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.88} />
        </mesh>

        {/* Monolithic Cast Bronze Cylinder */}
        <group position={[0.38, 1.38, 0]}>
          {/* Heavy Flanged Docking Collar */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
            <meshStandardMaterial color="#92400E" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Main Cylinder Sleeve */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.52, 32]} />
            <meshStandardMaterial color="#B45309" roughness={0.2} metalness={0.88} />
          </mesh>
          {/* Top Cylinder Head (Blown off on destruction!) */}
          <mesh position={[0, 0.3 + cylCapY, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
            <meshStandardMaterial color="#92400E" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Reciprocating Chrome Piston Rod */}
          <mesh position={[0, -0.22 + pistonStrokeY, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.46, 20]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.1} metalness={0.95} />
          </mesh>
        </group>

        {/* Monolithic Gooseneck Spout */}
        <group position={[0.38, 1.6, 0]}>
          <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.24, 20]} />
            <meshStandardMaterial color="#EA580C" roughness={0.2} metalness={0.88} />
          </mesh>
          <mesh position={[0.28, -0.07, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.14, 20]} />
            <meshStandardMaterial color="#EA580C" roughness={0.2} metalness={0.88} />
          </mesh>
        </group>

        {/* Steady Flowing Water Stream */}
        {showWaterStream && (
          <mesh position={[0.66, 0.88, 0]}>
            <cylinderGeometry args={[0.026, 0.03, 1.18, 16]} />
            <meshStandardMaterial
              color="#38BDF8"
              roughness={0.08}
              metalness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}

        {/* Cast Bronze Basin */}
        <mesh position={[0.66, 0.34, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.38, 24]} />
          <meshStandardMaterial color="#B45309" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      {/* --- OVERLOAD STEAM BLOWOUT CONE (frames 300 - 308) --- */}
      {steamActive && (
        <group position={[0.38 + cylDestructX, 1.7 + cylDestructRot * 0.5, 0]}>
          <mesh position={[0, steamConeScale * 0.4, 0]}>
            <coneGeometry args={[0.35 * steamConeScale, 0.8 * steamConeScale, 16, 1, true]} />
            <meshStandardMaterial
              color="#F8FAFC"
              emissive="#FFFFFF"
              emissiveIntensity={1.2}
              transparent
              opacity={steamOpacity}
              roughness={0.9}
            />
          </mesh>
        </group>
      )}

      {/* --- ON-MACHINE TRIGGER 1: Polished Brass Throw-Lever on Machine Bed --- */}
      <group position={[0.16, 0.28 + bedDropY, 0.4]}>
        {/* Heavy Brass Mount Block (Monolithic) */}
        <mesh>
          <boxGeometry args={[0.14, 0.08, 0.1]} />
          <meshStandardMaterial color="#92400E" roughness={0.25} metalness={0.92} />
        </mesh>
        {/* Pivoting Brass Lever Arm (Snaps down at frame 180, shears off at 300) */}
        <group
          position={[0, leverSnapY, 0]}
          rotation={[0, 0, leverAngle + leverSnapRot]}
        >
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.018, 0.02, 0.22, 16]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.92} />
          </mesh>
        </group>

        {/* Trigger Contact Spark at Throw */}
        {leverClickSpark && (
          <SparkBurst
            active={true}
            frameOffset={frame - 180}
            position={[0, 0.05, 0]}
            color="#F59E0B"
            scale={0.6}
          />
        )}
      </group>

      {/* --- DOCKING CONTACT SPARK BURSTS (frame 133, 4 frames) --- */}
      {snapSparkActive && (
        <>
          {/* Seam Spark at Center Bed */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.2, 0.2]}
            color="#FBBF24"
            scale={1.2}
          />
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.2, -0.2]}
            color="#F59E0B"
            scale={1.0}
          />
          {/* Seam Spark at Crank Collar */}
          <SparkBurst
            active={true}
            frameOffset={snapSparkFrameOffset}
            position={[0, 0.84, 0]}
            color="#FFFFFF"
            scale={0.8}
          />
        </>
      )}
    </group>
  );
};
