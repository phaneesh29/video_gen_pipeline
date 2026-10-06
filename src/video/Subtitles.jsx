import React from "react";

export function Subtitles({ text, isVertical }) {
  if (!text) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: isVertical ? "160px" : "28px",
        left: "50%",
        transform: "translateX(-50%)",
        width: isVertical ? "90%" : "88%",
        maxWidth: isVertical ? "960px" : "1500px",
        padding: isVertical ? "20px 28px" : "18px 36px",
        background: "rgba(8, 8, 12, 0.95)",
        border: "1.5px solid rgba(255, 107, 0, 0.35)",
        borderRadius: "14px",
        backdropFilter: "blur(16px)",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 107, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        zIndex: 50
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#ff6b00",
          boxShadow: "0 0 14px #ff6b00",
          flexShrink: 0
        }}
      />
      <p
        style={{
          margin: 0,
          color: "#ffffff",
          fontSize: isVertical ? "27px" : "26px",
          fontWeight: 700,
          lineHeight: 1.4,
          letterSpacing: "-0.3px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.6)"
        }}
      >
        {text}
      </p>
    </div>
  );
}
