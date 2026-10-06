import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { monoFont } from "./fonts.js";

// Light syntax tokenizer to give lines rich code colors
function formatSyntaxLine(line) {
  if (!line) return "";
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
    return <span style={{ color: "#6a737d", fontStyle: "italic" }}>{line}</span>;
  }

  const keywords = ["const", "let", "var", "function", "return", "class", "import", "export", "for", "while", "if", "else", "async", "await", "def", "new", "type", "interface"];
  const parts = line.split(/(\s+|[(),.:;{}[\]])/);

  return parts.map((part, i) => {
    if (keywords.includes(part.trim())) {
      return <span key={i} style={{ color: "#ff7b72", fontWeight: 700 }}>{part}</span>;
    }
    if (/^\d+$/.test(part.trim())) {
      return <span key={i} style={{ color: "#79c0ff" }}>{part}</span>;
    }
    if (/^["'].*["']$/.test(part.trim())) {
      return <span key={i} style={{ color: "#7ee787" }}>{part}</span>;
    }
    if (part.includes("(") || part.includes(")")) {
      return <span key={i} style={{ color: "#d2a8ff" }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function CodeEditor({ codeLines, activeLine, codeTitle, codeLanguage, isVertical = false }) {
  const frame = useCurrentFrame();
  const displayTitle = codeTitle || "solution.ts";
  const displayLang = codeLanguage || "TYPESCRIPT";

  // Active line breathing neon glow
  const activeGlowAlpha = 0.18 + 0.08 * Math.sin(frame * 0.2);

  return (
    <div
      style={{
        flex: isVertical ? "0 0 46%" : "0 0 42%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(11, 11, 16, 0.95)",
        borderLeft: isVertical ? "none" : "1px solid rgba(255, 107, 0, 0.18)",
        borderTop: isVertical ? "1px solid rgba(255, 107, 0, 0.18)" : "none",
        overflow: "hidden",
        fontFamily: monoFont.fontFamily,
        boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.5)"
      }}
    >
      {/* Code window title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          background: "#13131b",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56", boxShadow: "0 0 6px rgba(255,95,86,0.6)" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e", boxShadow: "0 0 6px rgba(255,189,46,0.6)" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f", boxShadow: "0 0 6px rgba(39,201,63,0.6)" }} />
          <span style={{ marginLeft: "12px", fontSize: "13px", color: "#e6edf3", fontWeight: 700, letterSpacing: "0.4px" }}>
            {displayTitle}
          </span>
        </div>
        <div style={{ fontSize: "11px", color: "#ff9d42", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>
          {displayLang}
        </div>
      </div>

      {/* Code lines container */}
      <div style={{ padding: "18px 0", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
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
                background: isActive
                  ? `linear-gradient(90deg, rgba(255, 107, 0, ${activeGlowAlpha * 1.5}) 0%, rgba(255, 107, 0, 0.04) 100%)`
                  : "transparent",
                borderLeft: isActive ? "4px solid #ff7700" : "4px solid transparent",
                boxShadow: isActive ? `inset 0 0 16px rgba(255, 107, 0, ${activeGlowAlpha})` : "none"
              }}
            >
              <div
                style={{
                  width: "32px",
                  fontSize: "14px",
                  color: isActive ? "#ffaa55" : "#4a4a5a",
                  textAlign: "right",
                  marginRight: "18px",
                  userSelect: "none",
                  fontWeight: isActive ? 800 : 500
                }}
              >
                {lineNumber}
              </div>

              {isActive && (
                <span
                  style={{
                    color: "#ff7700",
                    fontSize: "11px",
                    marginRight: "8px",
                    textShadow: "0 0 6px #ff7700"
                  }}
                >
                  ▶
                </span>
              )}

              <div
                style={{
                  fontSize: isVertical ? "16px" : "17px",
                  color: isActive ? "#ffffff" : "#c9d1d9",
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: "pre",
                  textShadow: isActive ? "0 0 10px rgba(255, 107, 0, 0.45)" : "none",
                  lineHeight: 1.5
                }}
              >
                {formatSyntaxLine(line)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
