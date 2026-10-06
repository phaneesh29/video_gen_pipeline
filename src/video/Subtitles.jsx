import React from "react";

export function Subtitles({ text }) {
  if (!text) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "85%",
        maxWidth: "1400px",
        padding: "16px 28px",
        background: "rgba(13, 17, 23, 0.92)",
        border: "1px solid #30363d",
        borderRadius: "12px",
        backdropFilter: "blur(12px)",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)"
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#f0f6fc",
          fontSize: "22px",
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: "-0.2px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {text}
      </p>
    </div>
  );
}
