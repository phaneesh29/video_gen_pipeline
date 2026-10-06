import React from "react";

export function HashMapRenderer({ name, entries, type }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "rgba(22, 27, 34, 0.6)",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "16px 20px"
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#8b949e", textTransform: "uppercase" }}>
        {name} ({type})
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: "14px", color: "#6e7681", fontStyle: "italic" }}>
            {"{ empty }"}
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: entry.highlight ? "rgba(56, 139, 253, 0.15)" : "#21262d",
                border: entry.highlight ? "1px solid #58a6ff" : "1px solid #30363d",
                boxShadow: entry.highlight ? "0 0 12px rgba(88, 166, 255, 0.3)" : "none",
                fontSize: "15px",
                fontWeight: 600,
                color: "#f0f6fc",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ color: "#79c0ff" }}>{entry.key}</span>
              <span style={{ color: "#8b949e" }}>:</span>
              <span style={{ color: "#a5d6ff" }}>{entry.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
