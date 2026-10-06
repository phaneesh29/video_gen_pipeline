import React from "react";

export function ArrayRenderer({ name, elements, type }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "rgba(22, 27, 34, 0.6)",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "20px 24px"
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#8b949e", textTransform: "uppercase" }}>
        {name} ({type})
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "8px", flexWrap: "wrap" }}>
        {elements.map((el, idx) => {
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "56px" }}>
              <div style={{ fontSize: "12px", color: "#6e7681", marginBottom: "4px", fontWeight: 600 }}>
                {idx}
              </div>

              <div
                style={{
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#ffffff",
                  background: el.highlight
                    ? "linear-gradient(135deg, #1f6feb, #238636)"
                    : "#21262d",
                  border: el.highlight ? "2px solid #58a6ff" : "1px solid #30363d",
                  boxShadow: el.highlight ? "0 0 16px rgba(88, 166, 255, 0.4)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {el.value}
              </div>

              {el.pointerLabel ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "6px"
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#58a6ff" }}>▲</div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#58a6ff",
                      background: "rgba(56, 139, 253, 0.15)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    {el.pointerLabel}
                  </div>
                </div>
              ) : (
                <div style={{ height: "24px" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
