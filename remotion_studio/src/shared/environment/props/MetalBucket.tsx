import React, { useMemo } from "react";
import * as THREE from "three";

export interface MetalBucketProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  handleAngle?: number; // radians; 0 = straight upright, ~0.72 = naturally resting to one side
  gripType?: "wood" | "metal";
}

/**
 * AAA High-Detail Industrial Galvanized Metal Bucket (Pail)
 *
 * Real-world Calibrated Dimensions:
 * - Top Radius: 0.16m (Diameter 0.32m / ~12.6")
 * - Bottom Radius: 0.12m (Diameter 0.24m / ~9.4")
 * - Height: 0.32m (~12.6")
 *
 * Features:
 * - Conical tapered double-walled body with zinc spangle passivation
 * - Rolled chime rim / curled steel top edge
 * - Recessed floor plate with dual concentric reinforcing stamp rings
 * - Heavy reinforcing bottom foot rim chime band
 * - 3 horizontal pressed swaged beading ribs for hoop stiffness
 * - Longitudinal lock-seam weld ridge detail
 * - Two heavy gauge stamped ear brackets with dual button-head rivets and eyelet loops
 * - Formed spring-steel wire bail handle with hooked terminals
 * - Ergonomic contoured grip cylinder with pressed galvanized steel retaining ferrules
 */
export const MetalBucket: React.FC<MetalBucketProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  handleAngle = 0.72, // ~41 degrees natural resting tilt
  gripType = "wood",
}) => {
  // --- Calibrated PBR Materials (Industrial Weathered Galvanized Zinc) ---
  const materials = useMemo(() => {
    return {
      // Main galvanized sheet metal exterior (Zinc #64748B)
      galvanizedBody: new THREE.MeshStandardMaterial({
        color: "#64748B",
        roughness: 0.32,
        metalness: 0.86,
        side: THREE.DoubleSide,
      }),
      // Weathered passivated interior wall (#475569)
      interiorWall: new THREE.MeshStandardMaterial({
        color: "#475569",
        roughness: 0.42,
        metalness: 0.78,
        side: THREE.DoubleSide,
      }),
      // Rolled chime top rim lip - brighter polished drawn edge (#94A3B8)
      chimeRim: new THREE.MeshStandardMaterial({
        color: "#94A3B8",
        roughness: 0.26,
        metalness: 0.88,
      }),
      // Pressed horizontal reinforcing beading ribs
      beadRib: new THREE.MeshStandardMaterial({
        color: "#64748B",
        roughness: 0.28,
        metalness: 0.88,
      }),
      // Bottom foot rim chime band & recessed floor
      footRim: new THREE.MeshStandardMaterial({
        color: "#475569",
        roughness: 0.40,
        metalness: 0.82,
      }),
      // Stamped steel ear mounting brackets
      earBracket: new THREE.MeshStandardMaterial({
        color: "#475569",
        roughness: 0.36,
        metalness: 0.84,
      }),
      // Oxidized button-head rivets
      rivet: new THREE.MeshStandardMaterial({
        color: "#334155",
        roughness: 0.48,
        metalness: 0.75,
      }),
      // Drawn spring-steel wire bail handle
      wireBail: new THREE.MeshStandardMaterial({
        color: "#94A3B8",
        roughness: 0.24,
        metalness: 0.92,
      }),
      // Contoured hardwood grip (Weathered dark ash / walnut)
      woodGrip: new THREE.MeshStandardMaterial({
        color: "#5A3825",
        roughness: 0.68,
        metalness: 0.08,
      }),
      // Alternative all-metal grip
      metalGrip: new THREE.MeshStandardMaterial({
        color: "#64748B",
        roughness: 0.30,
        metalness: 0.88,
      }),
      // Retaining steel ferrule collars
      ferrule: new THREE.MeshStandardMaterial({
        color: "#94A3B8",
        roughness: 0.25,
        metalness: 0.90,
      }),
    };
  }, []);

  // --- Wire Bail Handle Smooth Catmull-Rom Spline Curve ---
  const wireGeometry = useMemo(() => {
    // Left eyelet pivot is at [-0.165, 0, 0] relative to handle group
    // Right eyelet pivot is at [+0.165, 0, 0] relative to handle group
    const points = [
      new THREE.Vector3(-0.168, -0.012, -0.010), // Hook tip curled through left eyelet
      new THREE.Vector3(-0.165, 0.0, 0.0),       // Pivot eyelet entry
      new THREE.Vector3(-0.163, 0.05, 0.0),      // Lower straight leg
      new THREE.Vector3(-0.158, 0.12, 0.0),      // Tapered expansion matching bucket flare
      new THREE.Vector3(-0.140, 0.18, 0.0),      // Upper shoulder curve
      new THREE.Vector3(-0.065, 0.222, 0.0),     // Apex horizontal approach
      new THREE.Vector3(0.0, 0.224, 0.0),        // Top center apex
      new THREE.Vector3(0.065, 0.222, 0.0),      // Apex horizontal exit
      new THREE.Vector3(0.140, 0.18, 0.0),       // Right shoulder curve
      new THREE.Vector3(0.158, 0.12, 0.0),       // Tapered leg
      new THREE.Vector3(0.163, 0.05, 0.0),       // Lower straight leg
      new THREE.Vector3(0.165, 0.0, 0.0),        // Pivot eyelet entry
      new THREE.Vector3(0.168, -0.012, -0.010),  // Hook tip curled through right eyelet
    ];
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    return new THREE.TubeGeometry(curve, 72, 0.0028, 12, false);
  }, []);

  // Dimensions
  const height = 0.32;
  const radiusTop = 0.16;
  const radiusBottom = 0.12;

  // Swaged Rib Heights & Computed Conical Radii
  const ribs = useMemo(() => {
    const calcR = (y: number) => radiusBottom + (radiusTop - radiusBottom) * (y / height);
    return [
      { y: 0.09, r: calcR(0.09) + 0.001 },
      { y: 0.17, r: calcR(0.17) + 0.001 },
      { y: 0.25, r: calcR(0.25) + 0.001 },
    ];
  }, []);

  const pivotHeight = 0.288;
  const pivotX = 0.165;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. MAIN CONICAL BODY (Outer & Inner Shell) */}
      <group position={[0, height / 2, 0]}>
        {/* Exterior Tapered Wall */}
        <mesh material={materials.galvanizedBody}>
          <cylinderGeometry args={[radiusTop, radiusBottom, height, 64, 1, true]} />
        </mesh>

        {/* Interior Tapered Wall (Slightly recessed bottom floor) */}
        <mesh position={[0, 0.01, 0]} material={materials.interiorWall}>
          <cylinderGeometry
            args={[radiusTop - 0.003, radiusBottom - 0.003, height - 0.02, 64, 1, true]}
          />
        </mesh>
      </group>

      {/* 2. ROLLED TOP RIM CHIME LIP (Curled Sheet Metal Edge) */}
      <mesh
        position={[0, height, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.chimeRim}
      >
        <torusGeometry args={[radiusTop - 0.0015, 0.0058, 16, 64]} />
      </mesh>

      {/* 3. 3x HORIZONTAL PRESSED BEADING RINGS (Structural Reinforcing Ribs) */}
      {ribs.map((rib, i) => (
        <mesh
          key={`rib-${i}`}
          position={[0, rib.y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.beadRib}
        >
          <torusGeometry args={[rib.r, 0.0042, 16, 64]} />
        </mesh>
      ))}

      {/* 4. RECESSED BOTTOM & REINFORCING FLOOR CHIME BAND */}
      {/* Recessed Floor Plate (18mm above ground line) */}
      <mesh position={[0, 0.018, 0]} material={materials.footRim}>
        <cylinderGeometry args={[radiusBottom - 0.003, radiusBottom - 0.003, 0.003, 64]} />
      </mesh>

      {/* Concentric Floor Stiffening Ribs */}
      <mesh position={[0, 0.020, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.footRim}>
        <torusGeometry args={[0.042, 0.002, 12, 48]} />
      </mesh>
      <mesh position={[0, 0.020, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.footRim}>
        <torusGeometry args={[0.080, 0.002, 12, 48]} />
      </mesh>

      {/* Bottom Reinforcing Floor Skirt Band (Chime Collar) */}
      <mesh position={[0, 0.012, 0]} material={materials.footRim}>
        <cylinderGeometry args={[radiusBottom + 0.002, radiusBottom + 0.001, 0.024, 64, 1, true]} />
      </mesh>

      {/* Bottom Rolled Rim Foot Lip (Resting Ground Contact Bead) */}
      <mesh
        position={[0, 0.003, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.footRim}
      >
        <torusGeometry args={[radiusBottom + 0.0005, 0.004, 16, 64]} />
      </mesh>

      {/* 5. VERTICAL LOCK-SEAM RIDGE (Sheet Metal Joinery Detail on +Z Side) */}
      <mesh
        position={[0, height / 2, radiusBottom + 0.02]}
        rotation={[0.124, 0, 0]}
        material={materials.footRim}
      >
        <boxGeometry args={[0.005, height - 0.03, 0.003]} />
      </mesh>

      {/* 6. TWO SIDE EAR BRACKETS (Riveted Mounting Plates for Wire Bail) */}
      {[-1, 1].map((side) => {
        const xPos = side * 0.1565;
        const tiltAngle = side * -0.124; // Conical flare tilt angle (~7.1 degrees)

        return (
          <group key={`ear-${side}`} position={[xPos, 0.272, 0]} rotation={[0, 0, tiltAngle]}>
            {/* Stamped Heavy Plate Body */}
            <mesh position={[0, 0, 0]} material={materials.earBracket}>
              <boxGeometry args={[0.003, 0.052, 0.028]} />
            </mesh>

            {/* Chamfered Stamped Top Lug */}
            <mesh
              position={[0, 0.024, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.earBracket}
            >
              <cylinderGeometry args={[0.0135, 0.0135, 0.003, 16]} />
            </mesh>

            {/* Pivot Eyelet Ring (Wire hook receptor hole) */}
            <mesh
              position={[side * 0.004, 0.022, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.earBracket}
            >
              <torusGeometry args={[0.0068, 0.0026, 12, 24]} />
            </mesh>

            {/* Rivet 1 (Upper Button-Head Fastener) */}
            <group position={[side * 0.0025, 0.004, 0]}>
              <mesh material={materials.rivet} scale={[0.5, 1, 1]}>
                <sphereGeometry args={[0.0036, 12, 12]} />
              </mesh>
            </group>

            {/* Rivet 2 (Lower Button-Head Fastener) */}
            <group position={[side * 0.0025, -0.016, 0]}>
              <mesh material={materials.rivet} scale={[0.5, 1, 1]}>
                <sphereGeometry args={[0.0036, 12, 12]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* 7. WIRE BAIL HANDLE & CONTOURED GRIP (Pivoting Sub-Assembly) */}
      <group position={[0, pivotHeight, 0]} rotation={[handleAngle, 0, 0]}>
        {/* Drawn Steel Wire Bail Path */}
        <mesh geometry={wireGeometry} material={materials.wireBail} />

        {/* Retaining Eyelet Collars (Pivot Stops) */}
        {[-pivotX, pivotX].map((px, i) => (
          <mesh
            key={`collar-${i}`}
            position={[px, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.wireBail}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.004, 16]} />
          </mesh>
        ))}

        {/* Center Grip Cylinder Assembly (Mounted at wire apex: Y = 0.223m) */}
        <group position={[0, 0.223, 0]}>
          {/* Main Grip Body (Turned Wood or Heavy Galvanized Cylinder) */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={gripType === "wood" ? materials.woodGrip : materials.metalGrip}
          >
            <cylinderGeometry args={[0.0135, 0.0135, 0.078, 32]} />
          </mesh>

          {/* Ergonomic Finger Palm Swells */}
          <mesh
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={gripType === "wood" ? materials.woodGrip : materials.metalGrip}
          >
            <cylinderGeometry args={[0.0145, 0.0145, 0.038, 32]} />
          </mesh>

          {/* Left Pressed Steel Retaining Ferrule */}
          <mesh
            position={[-0.041, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.ferrule}
          >
            <cylinderGeometry args={[0.0148, 0.0148, 0.008, 24]} />
          </mesh>

          {/* Right Pressed Steel Retaining Ferrule */}
          <mesh
            position={[0.041, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.ferrule}
          >
            <cylinderGeometry args={[0.0148, 0.0148, 0.008, 24]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default MetalBucket;
