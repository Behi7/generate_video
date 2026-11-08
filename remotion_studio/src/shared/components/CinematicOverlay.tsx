import React from "react";
import { useCurrentFrame } from "remotion";

export interface CinematicOverlayProps {
  /**
   * Opacity of the 35mm procedural film grain layer.
   * Default: 0.055 (optimal for eliminating 8-bit dark banding while preserving pitch black levels).
   */
  grainOpacity?: number;
  /**
   * Peak opacity of the peripheral cinematic vignette.
   * Default: 0.42 (smooth radial falloff focusing viewer gaze on the center working zone).
   */
  vignetteOpacity?: number;
  /**
   * Whether film grain is active. Default: true.
   */
  enableGrain?: boolean;
  /**
   * Whether peripheral vignette is active. Default: true.
   */
  enableVignette?: boolean;
  /**
   * Whether chromatic edge softness / micro lens aberration is active. Default: true.
   */
  enableAberration?: boolean;
}

/**
 * CinematicOverlay:
 * Ultra-lightweight 2D post-processing layer rendered above <ThreeCanvas> and behind <ShowroomHUD>.
 *
 * 1. 35mm Film Grain: Procedural SVG filter turbulence with per-frame seed oscillation
 *    (mix-blend-mode: overlay, opacity: 0.055) that eliminates dark studio color banding.
 * 2. Cinematic Vignette: Smooth radial gradient (transparent 60% -> rgba(0, 0, 0, 0.42) 100%)
 *    focusing gaze on the center mechanical action.
 * 3. Chromatic Edge Softness: Micro optical dispersion and edge softness around outer borders.
 */
export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  grainOpacity = 0.055,
  vignetteOpacity = 0.42,
  enableGrain = true,
  enableVignette = true,
  enableAberration = true,
}) => {
  const frame = useCurrentFrame();

  // Shift turbulence seed pseudo-randomly per frame (35mm authentic gate jitter)
  const grainSeed = (frame * 17) % 1000;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      {/* 1. 35mm Procedural Film Grain (Anti-Banding Overlay) */}
      {enableGrain && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: grainOpacity,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              id={`cinematic-grain-${grainSeed}`}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves={3}
                seed={grainSeed}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            filter={`url(#cinematic-grain-${grainSeed})`}
            fill="#808080"
          />
        </svg>
      )}

      {/* 2. Cinematic Peripheral Vignette */}
      {enableVignette && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0, 0, 0, ${vignetteOpacity}) 100%)`,
          }}
        />
      )}

      {/* 3. Subtle Chromatic Edge Softness (Micro Lens Aberration & Dispersion) */}
      {enableAberration && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            boxShadow: "inset 0 0 120px rgba(0, 0, 0, 0.35)",
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 75%, rgba(255, 30, 80, 0.015) 92%, rgba(0, 180, 255, 0.025) 100%)",
          }}
        />
      )}
    </div>
  );
};
