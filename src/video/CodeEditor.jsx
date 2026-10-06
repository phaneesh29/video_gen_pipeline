import React from "react";

export function CodeEditor({ codeLines, activeLine, codeTitle, codeLanguage, isVertical = false }) {
  const displayTitle = codeTitle || "spec.yaml";
  const displayLang = codeLanguage || "ARCHITECTURE";

  return (
    <div
      style={{
        flex: isVertical ? "0 0 46%" : "0 0 42%",
        display: "flex",
        flexDirection: "column",
        background: "#08080b",
        borderLeft: isVertical ? "none" : "1px solid rgba(255, 107, 0, 0.15)",
        borderTop: isVertical ? "1px solid rgba(255, 107, 0, 0.15)" : "none",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "#0e0e13",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#27c93f" }} />
          <span style={{ marginLeft: "14px", fontSize: "14px", color: "#e6edf3", fontWeight: 700, letterSpacing: "0.5px" }}>
            {displayTitle}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#ff8533", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
          {displayLang}
        </div>
      </div>

      <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
        {codeLines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "5px 24px",
                background: isActive
                  ? "linear-gradient(90deg, rgba(255, 107, 0, 0.22) 0%, rgba(255, 107, 0, 0.04) 100%)"
                  : "transparent",
                borderLeft: isActive ? "5px solid #ff6b00" : "5px solid transparent",
                boxShadow: isActive ? "inset 0 0 20px rgba(255, 107, 0, 0.12)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <div
                style={{
                  width: "36px",
                  fontSize: "15px",
                  color: isActive ? "#ff9d42" : "#4a4a58",
                  textAlign: "right",
                  marginRight: "20px",
                  userSelect: "none",
                  fontWeight: isActive ? 800 : 500
                }}
              >
                {lineNumber}
              </div>

              <div
                style={{
                  fontSize: isVertical ? "15px" : "18px",
                  color: isActive ? "#ffffff" : "#abb2bf",
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: "pre",
                  textShadow: isActive ? "0 0 12px rgba(255, 107, 0, 0.5)" : "none",
                  lineHeight: 1.4
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
