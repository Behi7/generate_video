/**
 * PBRMaterials:
 * Centralized Physically Based Rendering (PBR) material presets with
 * calibrated specular roughness and metalness definitions for industrial dark-studio renders.
 */

export interface PBRMaterialSpec {
  readonly name: string;
  readonly color: string;
  readonly roughness: number;
  readonly metalness: number;
  readonly envMapIntensity?: number;
}

/**
 * Cast Iron: High roughness, moderate metalness, dark graphite appearance.
 * Used for anvils, heavy machine beds, and structural counterweights.
 */
export const PBR_CAST_IRON: PBRMaterialSpec = {
  name: "PBR_CAST_IRON",
  color: "#27272A",
  roughness: 0.72,
  metalness: 0.35,
};

/**
 * Brushed Steel: Low roughness, near-perfect metalness, sharp specular highlights.
 * Used for hydraulic piston shafts, trip hammer guides, and machined slides.
 */
export const PBR_BRUSHED_STEEL: PBRMaterialSpec = {
  name: "PBR_BRUSHED_STEEL",
  color: "#CBD5E1",
  roughness: 0.16,
  metalness: 0.96,
};

/**
 * Chrome Mirror: Ultra-low roughness, maximum metalness, intense reflection.
 * Used for precision bearing races, polished hydraulic cylinders, and optical bezels.
 */
export const PBR_CHROME_MIRROR: PBRMaterialSpec = {
  name: "PBR_CHROME_MIRROR",
  color: "#F8FAFC",
  roughness: 0.05,
  metalness: 0.99,
};

/**
 * Warm Brass: Polished warm amber alloy with crisp specular response.
 * Used for bushings, hydraulic fittings, pressure gauges, and accent bolts.
 */
export const PBR_WARM_BRASS: PBRMaterialSpec = {
  name: "PBR_WARM_BRASS",
  color: "#D97706",
  roughness: 0.14,
  metalness: 0.92,
};

/**
 * Gunmetal Housing: Balanced matte-specular finish for heavy industrial enclosures.
 * Used for motor shrouds, gearbox casings, and frame pillars.
 */
export const PBR_GUNMETAL_HOUSING: PBRMaterialSpec = {
  name: "PBR_GUNMETAL_HOUSING",
  color: "#334155",
  roughness: 0.45,
  metalness: 0.75,
};

/**
 * Anodized Dark Titanium: High hardness, deep slate reflection.
 */
export const PBR_DARK_TITANIUM: PBRMaterialSpec = {
  name: "PBR_DARK_TITANIUM",
  color: "#1E293B",
  roughness: 0.28,
  metalness: 0.88,
};

/**
 * Industrial Safety Hazard Yellow: Powder-coated steel warning accents.
 */
export const PBR_HAZARD_YELLOW: PBRMaterialSpec = {
  name: "PBR_HAZARD_YELLOW",
  color: "#EAB308",
  roughness: 0.38,
  metalness: 0.25,
};

/**
 * High-Density Industrial Polymer: Non-metallic, smooth matte finish.
 */
export const PBR_HDPE_POLYMER: PBRMaterialSpec = {
  name: "PBR_HDPE_POLYMER",
  color: "#0284C7",
  roughness: 0.52,
  metalness: 0.05,
};
