import React from "react";

export function CodeEditor({ codeLines, activeLine }) {
  return (
    <div
      style={{
        flex: "0 0 42%",
        display: "flex",
        flexDirection: "column",
        background: "#0d1117",
        borderLeft: "1px solid #30363d",
        overflow: "hidden",
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 20px",
          background: "#161b22",
          borderBottom: "1px solid #30363d"
        }}
      >
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }} />
        <span style={{ marginLeft: "12px", fontSize: "13px", color: "#8b949e", fontWeight: 600 }}>
          solution.py
        </span>
      </div>

      <div style={{ padding: "24px 0", display: "flex", flexDirection: "column" }}>
        {codeLines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 20px",
                background: isActive ? "rgba(56, 139, 253, 0.15)" : "transparent",
                borderLeft: isActive ? "4px solid #58a6ff" : "4px solid transparent",
                transition: "all 0.2s ease"
              }}
            >
              <div
                style={{
                  width: "36px",
                  fontSize: "15px",
                  color: isActive ? "#58a6ff" : "#484f58",
                  textAlign: "right",
                  marginRight: "20px",
                  userSelect: "none",
                  fontWeight: isActive ? 700 : 400
                }}
              >
                {lineNumber}
              </div>

              <div
                style={{
                  fontSize: "16px",
                  color: isActive ? "#ffffff" : "#c9d1d9",
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "pre"
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
