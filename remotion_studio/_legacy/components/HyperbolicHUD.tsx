import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const HyperbolicHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy Spring Entrance (appears at frame 0 with no lag)
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 140 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [25, 0]);

  // Live exponential counter for Quantum System (+14,000 to +1,480,000 ₽/sec)
  const revenueSpeed = Math.floor(
    interpolate(frame, [0, 240], [14000, 1480000], {
      extrapolateRight: "clamp",
    })
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
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* 1. Ultra-Minimal Main Headline */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: 30,
            padding: "6px 20px",
            marginBottom: 12,
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "#38BDF8",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            МАСШТАБ: 100 000X
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 60,
            fontWeight: 900,
            color: "#F8FAFC",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            margin: 0,
            textAlign: "center",
            textShadow:
              "0 0 35px rgba(0, 229, 255, 0.6), 0 4px 16px rgba(0, 0, 0, 0.9)",
          }}
        >
          РУЧНОЙ ТРУД VS СИСТЕМА
        </h1>
      </div>

      {/* 2. Two Clean Comparative Visual Cards (Minimalist & Punchy) */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 45px",
          boxSizing: "border-box",
        }}
      >
        {/* Left Card: Manual Strained Labor */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: 20,
            padding: "16px 24px",
            backdropFilter: "blur(14px)",
            boxShadow: "0 0 25px rgba(239, 68, 68, 0.2)",
            width: 440,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: "#EF4444",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            РУЧНОЙ ТРУД
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 42,
              fontWeight: 900,
              color: "#F8FAFC",
              margin: "6px 0",
            }}
          >
            500 ₽
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "0.06em",
            }}
          >
            1 КАПЛЯ • ЛИМИТ 24 ЧАСА
          </span>
        </div>

        {/* Right Card: Quantum Leveraged System */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(2, 44, 76, 0.9)",
            border: "1px solid rgba(0, 229, 255, 0.6)",
            borderRadius: 20,
            padding: "16px 24px",
            backdropFilter: "blur(14px)",
            boxShadow: "0 0 35px rgba(0, 210, 252, 0.35)",
            width: 440,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: "#00E5FF",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            СИСТЕМА (ЛЕВЕРЕДЖ)
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: 42,
              fontWeight: 900,
              color: "#22C55E",
              margin: "6px 0",
              textShadow: "0 0 20px rgba(34, 197, 94, 0.7)",
            }}
          >
            +{revenueSpeed.toLocaleString("ru-RU")} ₽
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#38BDF8",
              letterSpacing: "0.06em",
            }}
          >
            СВЕРХПОТОК • 24/7 АВТОМАТ
          </span>
        </div>
      </div>
    </div>
  );
};
