import React from "react";
import * as THREE from "three";

/**
 * Standard industrial color presets for 55-gallon oil drums.
 * Strict Rule: Zero saturated primary reds or blues; only realistic, weathered, subdued tones.
 */
export const DRUM_COLOR_PRESETS = {
  WEATHERED_OLIVE: "#2F3E30", // Dark weathered olive-drab
  CHARCOAL_ANTHRACITE: "#22272F", // Charcoal anthracite
  OXIDIZED_STEEL: "#374151", // Oxidized industrial steel
  SLATE_GUNMETAL: "#1E293B", // Deep slate gunmetal
} as const;

export interface IndustrialOilDrumProps {
  /** Ground-level pivot position [X, Y, Z] */
  position?: [number, number, number];
  /** Euler rotation [X, Y, Z] in radians */
  rotation?: [number, number, number];
  /** Uniform or axis scale */
  scale?: [number, number, number] | number;
  /** Primary body paint color */
  color?: string;
  /** PBR Metalness (0.65 - 0.85 recommended) */
  metalness?: number;
  /** PBR Roughness (0.40 - 0.60 recommended) */
  roughness?: number;
  /** Optional custom chime rim accent color */
  chimeColor?: string;
  /** Bung caps orientation angle around Y axis */
  bungRotation?: number;
}

/**
 * AAA High-Detail 55-Gallon (208L) Industrial Oil Drum.
 *
 * Anatomical Fidelity:
 * - Height: 0.88m, Radius: 0.30m (outer chime ~0.306m).
 * - Recessed top lid: Sunken drum head 0.03m below top chime rim with concentric stiffener ribs.
 * - Chime rims: Curled/triple-seam rolled steel lips at top and bottom.
 * - Rolling hoops: 2 embossed structural circumferential ribs with smooth rounded torus geometry.
 * - Secondary swages: 2 subtle corrugation bands above and below rolling hoops.
 * - Longitudinal resistance-welded seam along shell body.
 * - 2 Threaded bung caps on top lid:
 *   * 2-inch main fill bung (octagonal flange collar + threaded cap + dual wrench lugs).
 *   * 3/4-inch breather vent bung (hexagonal flange collar + threaded cap + drive slot).
 * - Recessed bottom plate with bottom curled chime.
 */
export const IndustrialOilDrum: React.FC<IndustrialOilDrumProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = DRUM_COLOR_PRESETS.WEATHERED_OLIVE,
  metalness = 0.74,
  roughness = 0.48,
  chimeColor,
  bungRotation = 0,
}) => {
  const normScale: [number, number, number] =
    typeof scale === "number" ? [scale, scale, scale] : scale;

  // Material specifications
  const bodyMaterial = (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      envMapIntensity={1.2}
    />
  );

  const chimeMaterial = (
    <meshStandardMaterial
      color={chimeColor || color}
      metalness={Math.min(0.88, metalness + 0.06)}
      roughness={Math.max(0.38, roughness - 0.06)}
      envMapIntensity={1.4}
    />
  );

  const bungZincMaterial = (
    <meshStandardMaterial
      color="#94A3B8"
      metalness={0.92}
      roughness={0.24}
      envMapIntensity={1.8}
    />
  );

  const bungFlangeMaterial = (
    <meshStandardMaterial
      color="#475569"
      metalness={0.82}
      roughness={0.38}
      envMapIntensity={1.2}
    />
  );

  const socketRecessMaterial = (
    <meshStandardMaterial
      color="#0F172A"
      metalness={0.7}
      roughness={0.8}
    />
  );

  const gasketMaterial = (
    <meshStandardMaterial
      color="#18181B"
      metalness={0.08}
      roughness={0.92}
    />
  );

  return (
    <group position={position} rotation={rotation} scale={normScale}>
      {/* ====================================================================
          1. MAIN CYLINDER BODY & LONGITUDINAL WELD SEAM
          ==================================================================== */}
      {/* Cylindrical main shell: radius 0.298m, height 0.84m (base at y=0.02, top at y=0.86, open-ended to reveal recessed heads) */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.298, 0.298, 0.84, 64, 1, true]} />
        {bodyMaterial}
      </mesh>

      {/* Longitudinal resistance-welded seam */}
      <mesh position={[0.2985, 0.44, 0]} castShadow>
        <boxGeometry args={[0.005, 0.838, 0.004]} />
        {chimeMaterial}
      </mesh>

      {/* ====================================================================
          2. ROLLING HOOPS (2 EMBOSSED STRUCTURAL CIRCUMFERENTIAL RIBS)
          ==================================================================== */}
      {/* Upper rolling hoop: y = 0.59m */}
      <mesh position={[0, 0.59, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.295, 0.014, 20, 64]} />
        {bodyMaterial}
      </mesh>

      {/* Lower rolling hoop: y = 0.29m */}
      <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.295, 0.014, 20, 64]} />
        {bodyMaterial}
      </mesh>

      {/* Secondary stiffening swages (corrugation ribs) */}
      {/* Upper swage: y = 0.74m */}
      <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.297, 0.0045, 14, 64]} />
        {bodyMaterial}
      </mesh>
      {/* Lower swage: y = 0.14m */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.297, 0.0045, 14, 64]} />
        {bodyMaterial}
      </mesh>

      {/* ====================================================================
          3. CHIME RIMS (WELDED/CURLED OUTER TOP AND BOTTOM LIP RINGS)
          ==================================================================== */}
      {/* --- TOP CHIME (y = 0.868 to 0.880m) --- */}
      {/* Outer curled lip ring (highest point at y = 0.880m) */}
      <mesh position={[0, 0.874, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.301, 0.0085, 16, 64]} />
        {chimeMaterial}
      </mesh>
      {/* Top collar reinforcement band (open-ended to not cover recessed lid) */}
      <mesh position={[0, 0.868, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.024, 64, 1, true]} />
        {chimeMaterial}
      </mesh>

      {/* --- BOTTOM CHIME (y = 0.000 to 0.022m) --- */}
      {/* Outer bottom curled lip ring (rests on ground at y = 0.006m) */}
      <mesh position={[0, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.301, 0.0085, 16, 64]} />
        {chimeMaterial}
      </mesh>
      {/* Bottom collar reinforcement band (open-ended) */}
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.024, 64, 1, true]} />
        {chimeMaterial}
      </mesh>
      {/* Recessed bottom plate: y = 0.022m, radius 0.293m */}
      <mesh position={[0, 0.022, 0]}>
        <cylinderGeometry args={[0.293, 0.293, 0.004, 48]} />
        {bodyMaterial}
      </mesh>

      {/* ====================================================================
          4. RECESSED TOP LID (SUNKEN DRUM HEAD ~0.03m BELOW TOP RIM)
          ==================================================================== */}
      {/* Sunken lid plate: positioned at y = 0.850m */}
      <mesh position={[0, 0.850, 0]} receiveShadow>
        <cylinderGeometry args={[0.293, 0.293, 0.004, 64]} />
        {bodyMaterial}
      </mesh>

      {/* Recess counter-sink wall connecting y = 0.850 to 0.880 */}
      <mesh position={[0, 0.865, 0]}>
        <cylinderGeometry args={[0.2935, 0.2935, 0.030, 64, 1, true]} />
        {chimeMaterial}
      </mesh>

      {/* Concentric reinforcing stiffening rings on top lid */}
      <mesh position={[0, 0.8515, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.21, 0.003, 12, 48]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[0, 0.8515, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.003, 12, 48]} />
        {bodyMaterial}
      </mesh>

      {/* Embossed UN specification mark stamp plate */}
      <mesh position={[0, 0.8518, 0.155]}>
        <boxGeometry args={[0.075, 0.0018, 0.036]} />
        {chimeMaterial}
      </mesh>

      {/* ====================================================================
          5. TWO THREADED BUNG CAPS ON TOP LID (Rotatable around Y)
          ==================================================================== */}
      <group rotation={[0, bungRotation, 0]}>
        {/* ------------------------------------------------------------------
            A. 2-INCH MAIN FILL BUNG (Position: X = +0.165m, Z = 0)
            ------------------------------------------------------------------ */}
        <group position={[0.165, 0.850, 0]}>
          {/* Base EPDM rubber sealing gasket */}
          <mesh position={[0, 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.035, 0.002, 8, 32]} />
            {gasketMaterial}
          </mesh>

          {/* Octagonal raised flange collar */}
          <mesh position={[0, 0.007, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.012, 8]} />
            {bungFlangeMaterial}
          </mesh>

          {/* Bung plug cap body */}
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.029, 0.029, 0.006, 32]} />
            {bungZincMaterial}
          </mesh>

          {/* Center recessed drive socket */}
          <mesh position={[0, 0.0185, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.002, 6]} />
            {socketRecessMaterial}
          </mesh>

          {/* Dual drive wrench lugs (raised cross tabs) */}
          <mesh position={[0, 0.0185, 0]} castShadow>
            <boxGeometry args={[0.024, 0.003, 0.004]} />
            {bungZincMaterial}
          </mesh>
          <mesh position={[0, 0.0185, 0]} castShadow>
            <boxGeometry args={[0.004, 0.003, 0.024]} />
            {bungZincMaterial}
          </mesh>
        </group>

        {/* ------------------------------------------------------------------
            B. 3/4-INCH BREATHER VENT BUNG (Position: X = -0.165m, Z = 0)
            ------------------------------------------------------------------ */}
        <group position={[-0.165, 0.850, 0]}>
          {/* Base sealing gasket */}
          <mesh position={[0, 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.0016, 8, 24]} />
            {gasketMaterial}
          </mesh>

          {/* Hexagonal raised flange collar */}
          <mesh position={[0, 0.006, 0]} castShadow>
            <cylinderGeometry args={[0.021, 0.021, 0.010, 6]} />
            {bungFlangeMaterial}
          </mesh>

          {/* Breather plug cap */}
          <mesh position={[0, 0.013, 0]} castShadow>
            <cylinderGeometry args={[0.017, 0.017, 0.005, 24]} />
            {bungZincMaterial}
          </mesh>

          {/* Slotted drive recess */}
          <mesh position={[0, 0.0158, 0]}>
            <boxGeometry args={[0.012, 0.002, 0.003]} />
            {socketRecessMaterial}
          </mesh>
        </group>
      </group>
    </group>
  );
};

export interface DrumClusterProps {
  /** Base ground-level pivot position */
  position?: [number, number, number];
  /** Euler rotation in radians */
  rotation?: [number, number, number];
  /** Uniform scale or [x, y, z] */
  scale?: [number, number, number] | number;
  /** Number of drums in grouping (2 or 3) */
  count?: 2 | 3;
  /** Primary drum color */
  primaryColor?: string;
  /** Secondary drum color */
  secondaryColor?: string;
  /** Tertiary drum color (if count == 3) */
  tertiaryColor?: string;
}

/**
 * Realistic workshop oil drum cluster grouping.
 * Arranged with organic angles, subtle rotational differences, and authentic tonal contrast.
 * Calculated center-to-center distances strictly prevent mesh interpenetration.
 */
export const DrumCluster: React.FC<DrumClusterProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  count = 2,
  primaryColor = DRUM_COLOR_PRESETS.WEATHERED_OLIVE,
  secondaryColor = DRUM_COLOR_PRESETS.CHARCOAL_ANTHRACITE,
  tertiaryColor = DRUM_COLOR_PRESETS.OXIDIZED_STEEL,
}) => {
  const normScale: [number, number, number] =
    typeof scale === "number" ? [scale, scale, scale] : scale;

  return (
    <group position={position} rotation={rotation} scale={normScale}>
      {/* Drum 1: Primary drum standing upright */}
      <IndustrialOilDrum
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        color={primaryColor}
        bungRotation={0.2}
      />

      {/* Drum 2: Secondary drum slightly offset with subtle angle & contrast tone.
          Center distance = sqrt(0.65^2 + 0.08^2) = 0.6549m > 0.612m chime diameter, AABB overlap = 0.00%. */}
      <IndustrialOilDrum
        position={[0.65, 0, 0.08]}
        rotation={[0, 1.25, 0]}
        color={secondaryColor}
        bungRotation={1.6}
      />

      {/* Drum 3: Optional third drum completing a natural workshop triangle */}
      {count === 3 && (
        <IndustrialOilDrum
          position={[-0.08, 0, 0.66]}
          rotation={[0, -2.1, 0]}
          color={tertiaryColor}
          bungRotation={-0.8}
        />
      )}
    </group>
  );
};

export default IndustrialOilDrum;
