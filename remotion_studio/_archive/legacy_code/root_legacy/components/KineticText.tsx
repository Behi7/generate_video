import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface KineticTextProps {
  hook: string;
  subHook?: string;
  leftBadge?: string;
  rightBadge?: string;
  startFrame?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  hook,
  subHook,
  leftBadge = "ВРЕМЯ НА ДЕНЬГИ",
  rightBadge = "АВТОМАТИЗАЦИЯ",
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = Math.max(0, frame - startFrame);

  // Remotion Apple-style spring physics for hook
  const hookSpring = spring({
    frame: animFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 130,
    },
  });

  // Secondary spring for badges
  const badgeSpring = spring({
    frame: Math.max(0, animFrame - 12),
    fps,
    config: {
      damping: 15,
      mass: 0.7,
      stiffness: 140,
    },
  });

  const hookOpacity = interpolate(hookSpring, [0, 1], [0, 1]);
  const hookTranslateY = interpolate(hookSpring, [0, 1], [35, 0]);
  const hookScale = interpolate(hookSpring, [0, 1], [0.93, 1.0]);

  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.85, 1.0]);

  // Live counter simulation for viral retention
  const revenueCount = Math.floor(
    interpolate(frame, [20, 240], [1200, 48500], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const hoursWorked = Math.min(
    14,
    Math.floor(
      interpolate(frame, [20, 240], [8, 14], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {/* Top Hook Headlines */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: hookOpacity,
          transform: `translateY(${hookTranslateY}px) scale(${hookScale})`,
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.07)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 30,
            padding: "8px 24px",
            marginBottom: 18,
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 19,
              fontWeight: 800,
              color: "#38BDF8",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            ФИНАНСОВЫЙ ЗАКОН № 1
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 56,
            fontWeight: 900,
            color: "#F8FAFC",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            margin: 0,
            lineHeight: 1.15,
            padding: "0 40px",
            textAlign: "center",
            textShadow:
              "0 0 32px rgba(0, 210, 252, 0.5), 0 4px 16px rgba(0, 0, 0, 0.9)",
          }}
        >
          {hook}
        </h1>

        {subHook && (
          <p
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: "#00E5FF",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 18,
              textAlign: "center",
              textShadow: "0 0 24px rgba(0, 229, 255, 0.6)",
            }}
          >
            {subHook}
          </p>
        )}
      </div>

      {/* Floating Dynamic Badges above characters */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 50px",
          boxSizing: "border-box",
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
        }}
      >
        {/* Left Badge: Worker (Hard Labor / Time Cap) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 18,
            padding: "14px 22px",
            backdropFilter: "blur(14px)",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "0.08em",
            }}
          >
            {leftBadge}
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 26,
              fontWeight: 900,
              color: "#EF4444",
              marginTop: 4,
            }}
          >
            {hoursWorked} Ч/СУТКИ
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#64748B",
              marginTop: 2,
            }}
          >
            ПОТОЛОК ДОХОДА
          </span>
        </div>

        {/* Right Badge: Automator (Infinite Passive Scale) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(2, 44, 76, 0.85)",
            border: "1px solid rgba(0, 229, 255, 0.5)",
            borderRadius: 18,
            padding: "14px 22px",
            backdropFilter: "blur(14px)",
            boxShadow: "0 0 30px rgba(0, 210, 252, 0.35)",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#38BDF8",
              letterSpacing: "0.08em",
            }}
          >
            {rightBadge}
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 26,
              fontWeight: 900,
              color: "#22C55E",
              marginTop: 4,
              textShadow: "0 0 16px rgba(34, 197, 94, 0.6)",
            }}
          >
            +{revenueCount.toLocaleString("ru-RU")} ₽
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#38BDF8",
              marginTop: 2,
            }}
          >
            24 / 7 АВТОМАТ
          </span>
        </div>
      </div>
    </div>
  );
};
