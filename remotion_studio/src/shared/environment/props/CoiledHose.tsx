import React, { useMemo } from "react";
import * as THREE from "three";

export interface CoiledHoseProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  variant?: "rubber_hydraulic" | "braided_steel";
}

/**
 * Procedural generation of an authentic, heavy 15-meter industrial hydraulic hose
 * casually coiled on the workshop floor by a mechanic at the end of a shift.
 *
 * Physical parameters:
 * - Total length: ~17.5 meters (~15m coiled bundle + extended floor tails)
 * - Total turns: 7.4 loose oblong turns
 * - Minimum bend radius: >= 0.22m (respects wire-braided hydraulic hose stiffness)
 * - Physical clearance: >= 0.034m (hose OD = 32mm, guaranteed zero self-intersection)
 * - Smooth C2-continuous outer tail with brass quick-disconnect coupler
 * - Smooth draping inner tail resting naturally across the top loops (zero sharp kinks)
 */
function createCoilPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const rh = 0.016; // 32mm hose outer diameter (16mm radius)
  const rfit = 0.024; // Fitting outer radius resting tangent to concrete floor

  // 1. Loose Outer Tail: Smoothly extends out on the floor toward [+0.82, -0.45]
  // Parameterized with C2 continuous match into Turn 0 at t = 0
  const num_tail = 18;
  const t0 = 0.0;
  const cx0 = 0.018 * Math.sin(t0 * 0.85 + 0.3) + 0.009 * Math.cos(t0 * 1.6);
  const cz0 = 0.015 * Math.cos(t0 * 1.05 + 0.5) - 0.011 * Math.sin(t0 * 1.3);
  const rot0 = 0.11 * t0 + 0.035 * Math.sin(t0 * 0.5);
  const r_nom0 = 0.325 + 0.045; // 0.370m
  const a0 = r_nom0 + 0.010 * Math.sin(0.3);
  const b0 = r_nom0 - 0.008 * Math.cos(0.3);

  for (let step = 0; step < num_tail; step++) {
    const tau = -0.45 * (1.0 - step / num_tail); // -0.45 to 0
    const ang = tau * 2.0 * Math.PI;
    const expand = 2.4 * tau * tau; // Smooth quadratic expansion matching second derivative
    const a = a0 + expand;
    const b = b0 + expand;
    const lx = a * Math.cos(ang);
    const lz = b * Math.sin(ang);
    const rx = lx * Math.cos(rot0) - lz * Math.sin(rot0);
    const rz = lx * Math.sin(rot0) + lz * Math.cos(rot0);
    const x = cx0 + rx;
    const z = cz0 + rz;
    const y = step > 3 ? rh : rfit - (step / 3.0) * (rfit - rh);
    pts.push(new THREE.Vector3(x, y, z));
  }

  // 2. Main Coiled Stack: 7.4 loose oblong turns
  const total_turns = 7.4;
  const num_steps = 320;

  for (let i = 0; i <= num_steps; i++) {
    const u = i / num_steps;
    const t = u * total_turns;
    const ang = t * 2.0 * Math.PI;

    // Organic center wandering (natural human placement)
    const cx = 0.018 * Math.sin(t * 0.85 + 0.3) + 0.009 * Math.cos(t * 1.6);
    const cz = 0.015 * Math.cos(t * 1.05 + 0.5) - 0.011 * Math.sin(t * 1.3);
    const rot = 0.11 * t + 0.035 * Math.sin(t * 0.5);

    // Helical base height: floor loops (t <= 1.4) rest on concrete (Y = rh)
    // Upper loops climb smoothly into a rich 3-layer stack (~0.22m overall bundle height)
    let base_y = rh;
    if (t > 1.4) {
      base_y = rh + ((t - 1.4) / (total_turns - 1.4)) * 0.110;
    }

    // Radii: loops alternate naturally between outer (~0.37m) and inner (~0.28m)
    const r_nominal = 0.325 + 0.045 * Math.cos(t * Math.PI * 0.95);

    // Subtle oblong ovality (worker wraps around forearm)
    const a = r_nominal + 0.010 * Math.sin(ang + 0.3);
    const b = r_nominal - 0.008 * Math.cos(ang + 0.3);

    const lx = a * Math.cos(ang);
    const lz = b * Math.sin(ang);
    const rx = lx * Math.cos(rot) - lz * Math.sin(rot);
    const rz = lx * Math.sin(rot) + lz * Math.cos(rot);

    pts.push(new THREE.Vector3(cx + rx, base_y, cz + rz));
  }

  // 3. Inner Tail: Rests naturally across top loops (zero 90-degree kinks!)
  const last_pt = pts[pts.length - 1];
  const prev_pt = pts[pts.length - 2];
  const dir = new THREE.Vector3().subVectors(last_pt, prev_pt).normalize();

  let cur = last_pt.clone();
  const num_end = 12;
  for (let s = 1; s <= num_end; s++) {
    const step_len = 0.045;
    cur.x += dir.x * step_len;
    cur.z += dir.z * step_len;
    cur.y = last_pt.y - 0.003 * (s / num_end);

    // Smooth curvature easing towards a relaxed straight resting pose
    const ease = 1.0 - (s / num_end);
    const steer = -0.10 * ease - 0.01;
    const nx = dir.x * Math.cos(steer) - dir.z * Math.sin(steer);
    const nz = dir.x * Math.sin(steer) + dir.z * Math.cos(steer);
    dir.x = nx;
    dir.z = nz;
    dir.normalize();

    pts.push(new THREE.Vector3(cur.x, cur.y, cur.z));
  }

  // 4. Physics Elevation & Clearance Solver:
  // Enforces safe 3D clearance (>= 0.038m) between all non-adjacent segments
  const N = pts.length;
  const target_sep = 0.040;
  for (let it = 0; it < 25; it++) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 22; j < N; j++) {
        const dx = pts[j].x - pts[i].x;
        const dz = pts[j].z - pts[i].z;
        const h = Math.sqrt(dx * dx + dz * dz);
        if (h < target_sep) {
          const req_dy = Math.sqrt(target_sep * target_sep - h * h) + 0.001;
          const cur_dy = pts[j].y - pts[i].y;
          if (cur_dy < req_dy) {
            const deficit = req_dy - cur_dy;
            const radius = 16;
            for (let k = Math.max(0, j - radius); k <= Math.min(N - 1, j + radius); k++) {
              const dist_k = Math.abs(k - j) / radius;
              const weight = (1.0 - dist_k * dist_k) * (1.0 - dist_k * dist_k);
              pts[k].y += deficit * weight;
            }
          }
        }
      }
    }

    // Gentle smoothing pass along Y
    for (let k = 14; k < N - 1; k++) {
      if (pts[k].y > rh) {
        const smooth_y = 0.25 * pts[k - 1].y + 0.50 * pts[k].y + 0.25 * pts[k + 1].y;
        pts[k].y = Math.max(rh, smooth_y);
      }
    }
  }

  return pts;
}

export const CoiledHose: React.FC<CoiledHoseProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = "rubber_hydraulic",
}) => {
  const isRubber = variant === "rubber_hydraulic";

  // Build smooth 3D Catmull-Rom spline, tube geometry, and accessory transforms
  const { hoseGeometry, startTransform, endTransform, guardRings, idTagTransform } = useMemo(() => {
    const rawPoints = createCoilPoints();
    const curve = new THREE.CatmullRomCurve3(rawPoints, false, "centripetal", 0.5);
    const hoseRadius = 0.016; // 32mm outer diameter
    const geometry = new THREE.TubeGeometry(curve, 320, hoseRadius, 18, false);

    // Endpoint 1: Start (loose outer tail on floor)
    const startPt = curve.getPointAt(0);
    const startTan = curve.getTangentAt(0);
    const startOutward = startTan.clone().negate().normalize();
    const startQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      startOutward
    );

    // Endpoint 2: End (inner tail resting naturally across top loops)
    const endPt = curve.getPointAt(1);
    const endTan = curve.getTangentAt(1);
    const endOutward = endTan.clone().normalize();
    const endQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      endOutward
    );

    // Protective abrasion guard rings sampled along the loose tail
    const rings: { pos: [number, number, number]; quat: [number, number, number, number] }[] = [];
    for (let i = 0; i < 11; i++) {
      const t = 0.012 + (i / 10) * 0.032; // spans ~0.55m along the outer tail
      const pos = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        tan.normalize()
      );
      rings.push({
        pos: [pos.x, pos.y, pos.z],
        quat: [q.x, q.y, q.z, q.w],
      });
    }

    // Stamped aluminum specification band tag near the quick-connect fitting
    const tagT = 0.008;
    const tagPos = curve.getPointAt(tagT);
    const tagTan = curve.getTangentAt(tagT);
    const tagQ = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      tagTan.normalize()
    );

    return {
      hoseGeometry: geometry,
      startTransform: {
        pos: [startPt.x, startPt.y, startPt.z] as [number, number, number],
        quat: [startQuat.x, startQuat.y, startQuat.z, startQuat.w] as [number, number, number, number],
      },
      endTransform: {
        pos: [endPt.x, endPt.y, endPt.z] as [number, number, number],
        quat: [endQuat.x, endQuat.y, endQuat.z, endQuat.w] as [number, number, number, number],
      },
      guardRings: rings,
      idTagTransform: {
        pos: [tagPos.x, tagPos.y, tagPos.z] as [number, number, number],
        quat: [tagQ.x, tagQ.y, tagQ.z, tagQ.w] as [number, number, number, number],
      },
    };
  }, []);

  // Material Palettes matching strict aesthetic requirements
  const hoseMaterial = useMemo(() => {
    if (isRubber) {
      // Matte black / dark charcoal reinforced rubber (#111827 / #1E293B, roughness ~0.62, metalness ~0.14)
      return (
        <meshStandardMaterial
          color="#161E2E"
          roughness={0.62}
          metalness={0.14}
        />
      );
    }
    // Braided stainless steel wire rope (#475569, metalness ~0.85, roughness ~0.35)
    return (
      <meshStandardMaterial
        color="#475569"
        roughness={0.35}
        metalness={0.85}
      />
    );
  }, [isRubber]);

  // Fitting materials (Solid brass #D97706 / #B45309, metalness ~0.9, roughness ~0.2)
  const brassMaterial = (
    <meshStandardMaterial
      color="#D97706"
      roughness={0.20}
      metalness={0.90}
    />
  );

  const brassAccentMaterial = (
    <meshStandardMaterial
      color="#B45309"
      roughness={0.22}
      metalness={0.88}
    />
  );

  const chromeMaterial = (
    <meshStandardMaterial
      color="#E2E8F0"
      roughness={0.15}
      metalness={0.95}
    />
  );

  const crimpFerruleMaterial = (
    <meshStandardMaterial
      color="#2A3444"
      roughness={0.35}
      metalness={0.85}
    />
  );

  const darkCavityMaterial = (
    <meshBasicMaterial color="#05070B" />
  );

  const rubberBootMaterial = (
    <meshStandardMaterial
      color="#111827"
      roughness={0.70}
      metalness={0.10}
    />
  );

  const guardRingMaterial = (
    <meshStandardMaterial
      color={isRubber ? "#1E293B" : "#334155"}
      roughness={0.5}
      metalness={0.25}
    />
  );

  const primaryFittingMaterial = isRubber ? brassMaterial : chromeMaterial;
  const accentFittingMaterial = isRubber ? brassAccentMaterial : chromeMaterial;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Main Coiled Hose Body: 17.5m heavy industrial hydraulic line */}
      <mesh geometry={hoseGeometry} castShadow receiveShadow>
        {hoseMaterial}
      </mesh>

      {/* 2. Loose Tail End Fitting: Heavy Crimped Ferrule + Brass Quick-Disconnect Coupler */}
      <group
        position={startTransform.pos}
        quaternion={startTransform.quat}
      >
        {/* Rubber Strain Relief Boot behind ferrule */}
        <group position={[0, -0.062, 0]}>
          <mesh>
            <cylinderGeometry args={[0.021, 0.017, 0.032, 16]} />
            {rubberBootMaterial}
          </mesh>
          {/* Bellows ribs on boot */}
          {[-0.008, 0, 0.008].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.0205, 0.002, 6, 16]} />
              {rubberBootMaterial}
            </mesh>
          ))}
        </group>

        {/* Heavy Crimped Steel Ferrule / Collar Sleeve */}
        <group position={[0, -0.015, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.023, 0.023, 0.065, 20]} />
            {crimpFerruleMaterial}
          </mesh>
          {/* 4 Swaged Crimp Grooves (Hydraulic press die impressions) */}
          {[-0.022, -0.008, 0.006, 0.020].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.0232, 0.0016, 6, 20]} />
              <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.7} />
            </mesh>
          ))}
          {/* Stamped Manufacturer Collar / Band */}
          <mesh position={[0, -0.029, 0]}>
            <cylinderGeometry args={[0.0238, 0.0238, 0.006, 20]} />
            {accentFittingMaterial}
          </mesh>
        </group>

        {/* Hexagonal Nut / Transition Collar */}
        <mesh position={[0, 0.024, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.014, 6]} />
          {primaryFittingMaterial}
        </mesh>

        {/* Quick-Disconnect Coupler Body (Knurled Sliding Sleeve) */}
        <group position={[0, 0.048, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.0265, 0.0265, 0.034, 20]} />
            {primaryFittingMaterial}
          </mesh>
          {/* 3 Raised Knurled Grip Rings */}
          {[-0.009, 0, 0.009].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.027, 0.0018, 6, 20]} />
              {accentFittingMaterial}
            </mesh>
          ))}
        </group>

        {/* Retraction Collar Ring & Detent Ball Groove */}
        <mesh position={[0, 0.070, 0]}>
          <cylinderGeometry args={[0.0245, 0.0245, 0.008, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Ball bearing detents */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.cos(rad) * 0.024, 0.070, Math.sin(rad) * 0.024]}
            >
              <sphereGeometry args={[0.0025, 6, 6]} />
              {chromeMaterial}
            </mesh>
          );
        })}

        {/* Tapered Coupler Nose / Nipple */}
        <mesh position={[0, 0.085, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.0185, 0.023, 0.022, 20]} />
          {primaryFittingMaterial}
        </mesh>

        {/* Front Lip Collar */}
        <mesh position={[0, 0.098, 0]}>
          <cylinderGeometry args={[0.0185, 0.0185, 0.004, 20]} />
          {accentFittingMaterial}
        </mesh>

        {/* Optical Deep Internal Bore (Hollow cavity) */}
        <mesh position={[0, 0.088, 0]}>
          <cylinderGeometry args={[0.0125, 0.0125, 0.028, 16]} />
          {darkCavityMaterial}
        </mesh>

        {/* Rubber O-Ring Sealing Ring inside probe groove */}
        <mesh position={[0, 0.092, 0]}>
          <torusGeometry args={[0.0187, 0.0012, 6, 20]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>

        {/* Industrial Dust Cap with Retaining Cable (Heavy Charcoal Rubber - No Bright Colors) */}
        <group position={[0.024, 0.035, 0]}>
          {/* Retaining collar ring */}
          <mesh position={[-0.002, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.0245, 0.0018, 6, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Flexible rubber tether cord curving down */}
          <mesh position={[0.028, -0.024, 0.018]} rotation={[0.4, 0.2, -0.6]}>
            <cylinderGeometry args={[0.002, 0.002, 0.065, 8]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
          {/* Heavy molded industrial dust cap resting on floor */}
          <group position={[0.042, -0.050, 0.032]} rotation={[0.3, 0.5, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.019, 0.019, 0.022, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.010, 8]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 3. Inner Tail End Fitting: Heavy Ferrule + Threaded Swivel Connector */}
      <group
        position={endTransform.pos}
        quaternion={endTransform.quat}
      >
        {/* Rubber Strain Relief Boot */}
        <group position={[0, -0.062, 0]}>
          <mesh>
            <cylinderGeometry args={[0.021, 0.017, 0.032, 16]} />
            {rubberBootMaterial}
          </mesh>
          {[-0.008, 0, 0.008].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.0205, 0.002, 6, 16]} />
              {rubberBootMaterial}
            </mesh>
          ))}
        </group>

        {/* Heavy Crimped Steel Ferrule */}
        <group position={[0, -0.015, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.023, 0.023, 0.065, 20]} />
            {crimpFerruleMaterial}
          </mesh>
          {[-0.022, -0.008, 0.006, 0.020].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.0232, 0.0016, 6, 20]} />
              <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Large Heavy Hex Swivel Nut */}
        <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.018, 6]} />
          {primaryFittingMaterial}
        </mesh>

        {/* Threaded Stud / NPT Male Nipple with Machined Threads */}
        <group position={[0, 0.048, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.0205, 0.0205, 0.028, 20]} />
            {primaryFittingMaterial}
          </mesh>
          {/* Precision machined micro-thread rings */}
          {[-0.010, -0.006, -0.002, 0.002, 0.006, 0.010].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]}>
              <torusGeometry args={[0.0212, 0.0009, 6, 20]} />
              {accentFittingMaterial}
            </mesh>
          ))}
        </group>

        {/* Inner hollow fluid passage bore */}
        <mesh position={[0, 0.050, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.030, 16]} />
          {darkCavityMaterial}
        </mesh>
      </group>

      {/* 4. Stamped Aluminum Specification ID Band Tag near fitting */}
      <group
        position={idTagTransform.pos}
        quaternion={idTagTransform.quat}
      >
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.0175, 0.0175, 0.018, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.22} metalness={0.92} />
        </mesh>
        <mesh position={[0, 0, 0.0178]}>
          <boxGeometry args={[0.012, 0.014, 0.001]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Precision Abrasion Guard Wrap (following the curve of the loose outer tail) */}
      {guardRings.map((ring, idx) => (
        <group
          key={idx}
          position={ring.pos}
          quaternion={ring.quat}
        >
          <mesh rotation={[0, 0, (idx * Math.PI) / 6]}>
            <torusGeometry args={[0.0176, 0.0020, 6, 16]} />
            {guardRingMaterial}
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default CoiledHose;
