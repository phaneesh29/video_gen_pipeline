import React from "react";

export function HashMapRenderer({ name, entries, type }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "rgba(14, 14, 18, 0.7)",
        border: "1px solid rgba(255, 107, 0, 0.18)",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 10px #ff6b00" }} />
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#ff9d42", textTransform: "uppercase", letterSpacing: "1px" }}>
          {name} <span style={{ color: "#6e7681", fontSize: "14px", fontWeight: 600 }}>({type})</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "4px", width: "100%" }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: "15px", color: "#6e7681", fontStyle: "italic" }}>
            {"{ empty }"}
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 18px",
                borderRadius: "10px",
                background: entry.highlight ? "rgba(255, 107, 0, 0.2)" : "#13131a",
                border: entry.highlight ? "1.5px solid #ff7700" : "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: entry.highlight ? "0 0 20px rgba(255, 107, 0, 0.4)" : "0 4px 10px rgba(0,0,0,0.3)",
                fontSize: "17px",
                fontWeight: 700,
                color: "#ffffff",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ color: "#ff9d42" }}>{entry.key}</span>
              <span style={{ color: "#6e7681" }}>→</span>
              <span style={{ color: "#ffffff" }}>{entry.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
