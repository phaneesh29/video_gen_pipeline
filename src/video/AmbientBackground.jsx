import React from "react";
import { useCurrentFrame } from "remotion";

export function AmbientBackground({ isVertical, isWhiteboard = false }) {
  const frame = useCurrentFrame();

  const glowOpacity = isWhiteboard
    ? 0.12 + Math.sin(frame * 0.03) * 0.03
    : 0.18 + Math.sin(frame * 0.04) * 0.05;

  const glowColor = isWhiteboard ? "251, 191, 36" : "255, 107, 0";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        background: isWhiteboard ? "#121217" : "#050508"
      }}
    >
      {/* Radial spotlight behind content */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "38%" : "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isVertical ? "850px" : "1200px",
          height: isVertical ? "850px" : "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${glowColor}, ${glowOpacity}) 0%, rgba(${glowColor}, ${glowOpacity * 0.25}) 45%, transparent 70%)`,
          filter: "blur(60px)"
        }}
      />

      {/* Grid pattern (chalk grid or cyber tech grid) */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: isWhiteboard ? 0.08 : 0.12
        }}
      >
        <defs>
          <pattern
            id="ambient-grid"
            width={isVertical ? "48" : "40"}
            height={isVertical ? "48" : "40"}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill={isWhiteboard ? "#e2e8f0" : "#ff9d42"} opacity="0.6" />
            <path
              d={isVertical ? "M 48 0 L 0 0 0 48" : "M 40 0 L 0 0 0 40"}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ambient-grid)" />
      </svg>

      {/* Floating particles */}
      {[
        { x: 15, y: 22, size: 2.5, speed: 0.4 },
        { x: 78, y: 18, size: 3.0, speed: 0.6 },
        { x: 30, y: 70, size: 2.0, speed: 0.5 },
        { x: 85, y: 65, size: 3.5, speed: 0.3 },
        { x: 50, y: 85, size: 2.2, speed: 0.7 },
        { x: 10, y: 50, size: 2.8, speed: 0.45 },
        { x: 92, y: 35, size: 2.0, speed: 0.55 },
        { x: 65, y: 30, size: 3.2, speed: 0.35 }
      ].map((p, idx) => {
        const driftY = (p.y + (frame * p.speed * 0.1)) % 100;
        const driftX = p.x + Math.sin((frame * 0.02) + idx) * 1.5;
        const pOpacity = (isWhiteboard ? 0.18 : 0.25) + Math.sin(frame * 0.05 + idx * 2) * 0.12;

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${driftX}%`,
              top: `${driftY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: idx % 2 === 0 ? (isWhiteboard ? "#fbbf24" : "#ff9d42") : "#ffffff",
              boxShadow: `0 0 8px ${idx % 2 === 0 ? (isWhiteboard ? "#fbbf24" : "#ff6b00") : "#ffffff"}`,
              opacity: pOpacity
            }}
          />
        );
      })}

      {/* Cinematic vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isWhiteboard
            ? "radial-gradient(ellipse at center, transparent 60%, rgba(10, 10, 14, 0.8) 100%)"
            : "radial-gradient(ellipse at center, transparent 55%, rgba(3, 3, 5, 0.85) 100%)"
        }}
      />
    </div>
  );
}
