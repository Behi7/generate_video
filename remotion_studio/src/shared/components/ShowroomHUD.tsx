import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import {
  TIER_DURATION_FRAMES,
  TOTAL_DURATION_FRAMES,
  getCurrentTier,
  getTierLocalFrame,
} from "../contracts/StageTimeline";

export interface ShowroomHUDProps {
  seed?: string | number;
  contactFrames?: [number, number, number, number]; // [Tier1, Tier2, Tier3, Tier4] local contact start frames
  tierTargets?: [number, number, number, number];   // Custom targets per tier
}

// Deterministic fast PRNG for procedural non-repeating HUD values
function createPrng(seedVal: string | number) {
  let s = typeof seedVal === "number" ? seedVal : 0;
  if (typeof seedVal === "string") {
    for (let i = 0; i < seedVal.length; i++) {
      s = (s << 5) - s + seedVal.charCodeAt(i);
      s |= 0;
    }
  }
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const ShowroomHUD: React.FC<ShowroomHUDProps> = ({
  seed = "hydraulic_press_v2",
  contactFrames = [160, 156, 168, 160],
  tierTargets,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tier = getCurrentTier(frame);
  const localFrame = getTierLocalFrame(frame);

  // Generate procedural, organic final targets so each video is unique
  const targets = useMemo<[number, number, number, number]>(() => {
    if (tierTargets) return tierTargets;
    const rng = createPrng(seed);
    const t1 = 10 + Math.floor(rng() * 5); // 10..14
    const t2 = 95 + Math.floor(rng() * 45); // 95..139
    const t3 = 1050 + Math.floor(rng() * 350); // 1050..1399
    // Organic, realistic high number (e.g. 1 245 900 or 980 500)
    const t4BaseThousands = 850 + Math.floor(rng() * 700); // 850..1549 k
    const t4Hundreds = Math.floor(rng() * 9) * 100;
    const t4 = t4BaseThousands * 1000 + t4Hundreds;
    return [t1, t2, t3, t4];
  }, [seed, tierTargets]);

  const [t1Target, t2Target, t3Target, t4Target] = targets;

  // Tier metadata: strictly numbers, currency, and universal symbols (zero words)
  const tierConfig = [
    {
      tierNum: 1,
      badge: "$10",
      multiplier: "1x",
      color: "#94A3B8",
      glow: "rgba(148, 163, 184, 0.4)",
      borderColor: "rgba(148, 163, 184, 0.35)",
    },
    {
      tierNum: 2,
      badge: "$100",
      multiplier: "10x",
      color: "#F59E0B",
      glow: "rgba(245, 158, 11, 0.5)",
      borderColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      tierNum: 3,
      badge: "$1 000",
      multiplier: "100x",
      color: "#38BDF8",
      glow: "rgba(56, 189, 248, 0.6)",
      borderColor: "rgba(56, 189, 248, 0.55)",
    },
    {
      tierNum: 4,
      badge: "$100 000+",
      multiplier: "10 000x",
      color: "#00E5FF",
      glow: "rgba(0, 229, 255, 0.8)",
      borderColor: "rgba(0, 229, 255, 0.7)",
    },
  ];

  const current = tierConfig[tier - 1];

  // Dynamic spring scale on tier changes
  const cardEntrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, mass: 0.4, stiffness: 140 },
  });

  // Helper to format currency numbers cleanly with universal space separators
  const formatNumberWithSpaces = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Live coin counter computation: strictly tied to contact frames (Anti-Desync Law)
  let liveCoins = 0;
  // Break frame where machine ruptures and stops generating revenue (canonical: 234f)
  const breakFrame = 234;

  if (frame < TIER_DURATION_FRAMES) {
    // Tier 1: strictly holds 0 until physical contact, then climbs to t1Target
    const contact = contactFrames[0];
    if (localFrame < contact) {
      liveCoins = 0;
    } else {
      liveCoins = Math.floor(
        interpolate(localFrame, [contact, breakFrame], [0, t1Target], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      );
    }
  } else if (frame < TIER_DURATION_FRAMES * 2) {
    // Tier 2: holds previous tier balance until physical contact at contactFrames[1]
    const contact = contactFrames[1];
    if (localFrame < contact) {
      liveCoins = t1Target;
    } else {
      liveCoins = Math.floor(
        interpolate(localFrame, [contact, breakFrame], [t1Target, t2Target], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      );
    }
  } else if (frame < TIER_DURATION_FRAMES * 3) {
    // Tier 3: holds previous tier balance until hydraulic contact at contactFrames[2]
    const contact = contactFrames[2];
    if (localFrame < contact) {
      liveCoins = t2Target;
    } else {
      liveCoins = Math.floor(
        interpolate(localFrame, [contact, breakFrame], [t2Target, t3Target], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      );
    }
  } else {
    // Tier 4 Climax: holds previous tier balance until relativistic contact at contactFrames[3]
    const contact = contactFrames[3];
    if (localFrame < contact) {
      liveCoins = t3Target;
    } else {
      liveCoins = Math.floor(
        interpolate(localFrame, [contact, breakFrame], [t3Target, t4Target], {
          easing: Easing.bezier(0.2, 0, 0.1, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      );
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 54,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. Universal Top Dynamic Island Badge (Single Island Law) */}
      <div
        style={{
          transform: `scale(${cardEntrance})`,
          transformOrigin: "top center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Glowing Tier Progress Dots (Universal Indicator) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            background: "rgba(15, 23, 42, 0.65)",
            padding: "6px 14px",
            borderRadius: 16,
            border: `1px solid ${current.borderColor}`,
            boxShadow: `0 0 12px ${current.glow}`,
          }}
        >
          {[1, 2, 3, 4].map((t) => {
            const isActive = t <= tier;
            return (
              <div
                key={t}
                style={{
                  width: t === tier ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? current.color : "rgba(255, 255, 255, 0.2)",
                  boxShadow: isActive ? `0 0 8px ${current.color}` : "none",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Dynamic Frosted Glass Card: Badge & Multiplier */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.82)",
            border: `2px solid ${current.borderColor}`,
            borderRadius: 28,
            padding: "20px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 32px ${current.glow}`,
            backdropFilter: "blur(20px)",
            position: "relative",
          }}
        >
          {/* Multiplier Pill Top Floating Accent */}
          <div
            style={{
              position: "absolute",
              top: -14,
              background: "rgba(15, 23, 42, 0.95)",
              border: `1.5px solid ${current.borderColor}`,
              borderRadius: 12,
              padding: "2px 14px",
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.5), 0 0 14px ${current.glow}`,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: current.color,
              }}
            >
              {current.multiplier}
            </span>
          </div>

          {/* Top Badge: '$10' -> '$100' -> '$1 000' -> '$100 000+' (Crisp, zero ghost shadow) */}
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)",
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
          >
            {current.badge}
          </span>

          {/* Live Coin Counter */}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: tier === 4 ? "#00E5FF" : current.color,
                textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)",
                letterSpacing: "0.02em",
              }}
            >
              +${formatNumberWithSpaces(liveCoins)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
