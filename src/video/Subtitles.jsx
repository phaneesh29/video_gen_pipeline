import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { interFont } from "./fonts.js";

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
        bottom: isVertical ? "160px" : "32px",
        left: "50%",
        transform: `translateX(-50%) scale(${enterScale})`,
        opacity: enterOpacity,
        width: isVertical ? "92%" : "86%",
        maxWidth: isVertical ? "980px" : "1400px",
        padding: isVertical ? "18px 24px" : "16px 32px",
        background: "rgba(10, 10, 15, 0.94)",
        border: "1.5px solid rgba(255, 107, 0, 0.38)",
        borderRadius: "16px",
        backdropFilter: "blur(24px)",
        textAlign: "center",
        boxShadow: "0 12px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 107, 0, 0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? "14px" : "18px",
        zIndex: 50,
        fontFamily: interFont.fontFamily
      }}
    >
      {/* Live Audio Equalizer Waveform Bars (simulates real-time speech cadence) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          height: "24px",
          flexShrink: 0
        }}
      >
        {[0, 1, 2, 3].map((barIdx) => {
          const barHeight = Math.max(
            6,
            Math.round(
              16 +
                Math.sin(frame * 0.35 + barIdx * 1.3) * 8 +
                Math.cos(frame * 0.2 + barIdx * 0.7) * 4
            )
          );

          return (
            <div
              key={barIdx}
              style={{
                width: "4px",
                height: `${barHeight}px`,
                background: "linear-gradient(180deg, #ffaa00 0%, #ff5500 100%)",
                borderRadius: "3px",
                boxShadow: "0 0 8px rgba(255, 107, 0, 0.6)"
              }}
            />
          );
        })}
      </div>

      <p
        style={{
          margin: 0,
          color: "#ffffff",
          fontSize: isVertical ? "26px" : "24px",
          fontWeight: 700,
          lineHeight: 1.38,
          letterSpacing: "-0.2px",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)"
        }}
      >
        {text}
      </p>
    </div>
  );
}
