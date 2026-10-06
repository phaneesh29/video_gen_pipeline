import React from "react";

export function Header({ title, topic, complexity }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 48px",
        background: "rgba(13, 17, 23, 0.95)",
        borderBottom: "1px solid #30363d",
        color: "#f0f6fc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #388bfd, #1f6feb)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          {topic}
        </div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px" }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <div
          style={{
            background: "#21262d",
            border: "1px solid #30363d",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#58a6ff"
          }}
        >
          Time: {complexity.time}
        </div>
        <div
          style={{
            background: "#21262d",
            border: "1px solid #30363d",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#3fb950"
          }}
        >
          Space: {complexity.space}
        </div>
      </div>
    </div>
  );
}
