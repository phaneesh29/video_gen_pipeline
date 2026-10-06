import React from "react";

export function Header({ title, topic, complexity }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 56px",
        background: "#070709",
        borderBottom: "1px solid rgba(255, 107, 0, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ff7700 0%, #ff4800 100%)",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 800,
            padding: "8px 18px",
            borderRadius: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            boxShadow: "0 0 25px rgba(255, 107, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
          {topic}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: 800,
            letterSpacing: "-0.8px",
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div
          style={{
            background: "#101015",
            border: "1px solid rgba(255, 107, 0, 0.35)",
            boxShadow: "0 0 15px rgba(255, 107, 0, 0.15)",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 700,
            color: "#ff9d42"
          }}
        >
          Time: <span style={{ color: "#ffffff" }}>{complexity.time}</span>
        </div>
        <div
          style={{
            background: "#101015",
            border: "1px solid rgba(255, 166, 0, 0.35)",
            boxShadow: "0 0 15px rgba(255, 166, 0, 0.15)",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 700,
            color: "#ffc042"
          }}
        >
          Space: <span style={{ color: "#ffffff" }}>{complexity.space}</span>
        </div>
      </div>
    </div>
  );
}
