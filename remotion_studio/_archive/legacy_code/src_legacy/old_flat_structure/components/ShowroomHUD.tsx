import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import {
  TIER_DURATION_FRAMES,
  TOTAL_DURATION_FRAMES,
  getCurrentTier,
  getTierLocalFrame,
} from "./StageTimeline";

export const ShowroomHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tier = getCurrentTier(frame);
  const localFrame = getTierLocalFrame(frame);

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

  // Live coin counter computation across the 1160-frame timeline
  let liveCoins = 10;
  if (frame < TIER_DURATION_FRAMES) {
    // Tier 1: climbs 0 to 10 during operating act (frames 150..250)
    liveCoins = Math.floor(
      interpolate(localFrame, [120, 240], [0, 10], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  } else if (frame < TIER_DURATION_FRAMES * 2) {
    // Tier 2: climbs 10 to 100 during operating act
    liveCoins = Math.floor(
      interpolate(localFrame, [120, 240], [10, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  } else if (frame < TIER_DURATION_FRAMES * 3) {
    // Tier 3: climbs 100 to 1 000 during operating act
    liveCoins = Math.floor(
      interpolate(localFrame, [120, 240], [100, 1000], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  } else {
    // Tier 4 Climax: exponential surge from 1 000 past 1 480 000
    liveCoins = Math.floor(
      interpolate(localFrame, [140, 280], [1000, 1480000], {
        easing: Easing.bezier(0.2, 0, 0.1, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
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
