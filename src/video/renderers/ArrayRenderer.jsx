import React from "react";

export function ArrayRenderer({ name, elements, type }) {
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
        padding: "14px 22px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 10px #ff6b00" }} />
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ff9d42", textTransform: "uppercase", letterSpacing: "1px" }}>
          {name} <span style={{ color: "#6e7681", fontSize: "13px", fontWeight: 600 }}>({type})</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", justifyContent: "center", marginTop: "6px", flexWrap: "wrap", width: "100%" }}>
        {elements.map((el, idx) => {
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px" }}>
              <div style={{ fontSize: "13px", color: "#8b949e", marginBottom: "6px", fontWeight: 700 }}>
                {idx}
              </div>

              <div
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#ffffff",
                  background: el.highlight
                    ? "linear-gradient(135deg, #ff7700 0%, #ff3b00 100%)"
                    : "#13131a",
                  border: el.highlight
                    ? "2px solid #ffa34d"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: el.highlight
                    ? "0 0 35px rgba(255, 107, 0, 0.75)"
                    : "0 4px 12px rgba(0, 0, 0, 0.4)",
                  textShadow: el.highlight ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
                  transform: el.highlight ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
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
                    marginTop: "8px"
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#ff8533", textShadow: "0 0 8px #ff6b00" }}>▲</div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#ffffff",
                      background: "linear-gradient(135deg, #ff7700, #ff4400)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      boxShadow: "0 0 16px rgba(255, 107, 0, 0.5)",
                      marginTop: "2px",
                      letterSpacing: "0.5px"
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
