import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { primaryFont } from "./fonts.js";

export function Subtitles({ text, isVertical }) {
  const frame = useCurrentFrame();
  if (!text) return null;

  // Remotion spring-like pop-in entrance
  const enterScale = interpolate(frame, [0, 8], [0.94, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const enterOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: isVertical ? "120px" : "32px",
        left: "50%",
        transform: `translateX(-50%) scale(${enterScale})`,
        opacity: enterOpacity,
        width: isVertical ? "92%" : "86%",
        maxWidth: isVertical ? "1000px" : "1400px",
        padding: isVertical ? "20px 30px" : "16px 32px",
        background: "rgba(10, 10, 15, 0.95)",
        border: "2px solid rgba(255, 107, 0, 0.45)",
        borderRadius: "18px",
        backdropFilter: "blur(24px)",
        textAlign: "center",
        boxShadow: "0 12px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 107, 0, 0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? "16px" : "18px",
        zIndex: 50,
        fontFamily: primaryFont.fontFamily
      }}
    >
      {/* Live Audio Equalizer Waveform Bars (simulates real-time speech cadence) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          height: "28px",
          flexShrink: 0
        }}
      >
        {[0, 1, 2, 3].map((barIdx) => {
          const barHeight = Math.max(
            8,
            Math.round(
              18 +
                Math.sin(frame * 0.35 + barIdx * 1.3) * 10 +
                Math.cos(frame * 0.2 + barIdx * 0.7) * 5
            )
          );

          return (
            <div
              key={barIdx}
              style={{
                width: "5px",
                height: `${barHeight}px`,
                background: "linear-gradient(180deg, #ffaa00 0%, #ff5500 100%)",
                borderRadius: "3px",
                boxShadow: "0 0 8px rgba(255, 107, 0, 0.7)"
              }}
            />
          );
        })}
      </div>

      <p
        style={{
          margin: 0,
          color: "#ffffff",
          fontSize: isVertical ? "32px" : "26px",
          fontWeight: 800,
          lineHeight: 1.35,
          letterSpacing: "-0.3px",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.85)"
        }}
      >
        {text}
      </p>
    </div>
  );
}
