import React from "react";

export function TableRenderer({ name, entries }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "rgba(14, 14, 18, 0.7)",
        border: "1px solid rgba(255, 107, 0, 0.18)",
        borderRadius: "14px",
        padding: "16px 20px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 10px #ff6b00" }} />
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ff9d42", textTransform: "uppercase", letterSpacing: "1px" }}>
          {name} <span style={{ color: "#6e7681", fontSize: "13px", fontWeight: 600 }}>(Database Table)</span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "740px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "4px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            padding: "8px 16px",
            background: "#181822",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "13px",
            fontWeight: 800,
            color: "#ff9d42",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          <div>Partition / Shard Key</div>
          <div>Stored Record / State</div>
        </div>

        {entries.map((entry, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                padding: "10px 16px",
                borderRadius: "8px",
                background: entry.highlight
                  ? "linear-gradient(90deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 107, 0, 0.08) 100%)"
                  : "#111116",
                border: entry.highlight ? "1.5px solid #ff7700" : "1px solid rgba(255, 255, 255, 0.06)",
                boxShadow: entry.highlight ? "0 0 20px rgba(255, 107, 0, 0.35)" : "none",
                fontSize: "15px",
                fontWeight: 700,
                color: "#ffffff",
                transition: "all 0.2s ease",
                alignItems: "center"
              }}
            >
              <div style={{ color: entry.highlight ? "#ffa34d" : "#c9d1d9", fontFamily: "monospace" }}>
                {entry.key}
              </div>
              <div style={{ color: "#ffffff", fontFamily: "monospace" }}>
                {entry.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
