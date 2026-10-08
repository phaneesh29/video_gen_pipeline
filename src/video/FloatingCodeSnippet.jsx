import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { monoFont, primaryFont } from "./fonts.js";
import { Terminal, Code2 } from "lucide-react";

// Light syntax tokenizer for code lines
function formatSyntaxLine(line) {
  if (!line) return "";
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("--")) {
    return <span style={{ color: "#6a737d", fontStyle: "italic" }}>{line}</span>;
  }

  const keywords = [
    "const", "let", "var", "function", "return", "class", "import", "export",
    "for", "while", "if", "else", "async", "await", "def", "new", "type",
    "interface", "SELECT", "FROM", "WHERE", "JOIN", "INSERT", "UPDATE",
    "DELETE", "GROUP", "BY", "ORDER", "LIMIT", "SET", "GET", "POST",
    "curl", "docker", "kubectl", "SETEX", "redis-cli", "ffmpeg", "func"
  ];
  const parts = line.split(/(\s+|[(),.:;{}[\]])/);

  return parts.map((part, i) => {
    const trimmedPart = part.trim();
    if (keywords.includes(trimmedPart)) {
      return <span key={i} style={{ color: "#ff7b72", fontWeight: 700 }}>{part}</span>;
    }
    if (/^\d+$/.test(trimmedPart)) {
      return <span key={i} style={{ color: "#79c0ff" }}>{part}</span>;
    }
    if (/^["'].*["']$/.test(trimmedPart) || /^`.*`$/.test(trimmedPart)) {
      return <span key={i} style={{ color: "#7ee787" }}>{part}</span>;
    }
    if (part.includes("(") || part.includes(")")) {
      return <span key={i} style={{ color: "#d2a8ff" }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Resolves snippet whether given as { title, language, code } or raw string.
 */
export function getActiveSnippet(visual) {
  if (!visual) return null;
  if (visual.codeSnippet && visual.codeSnippet.code && visual.codeSnippet.code.trim()) {
    return visual.codeSnippet;
  }
  const raw = visual.activeCodeSnippet?.trim();
  if (raw && raw !== "none" && raw !== "null" && raw !== '""' && raw.length > 5) {
    const isCodeLike = raw.includes(" ") || raw.includes("(") || raw.includes("=") || raw.includes(";") || raw.includes("/");
    if (isCodeLike) {
      return {
        title: "snippet",
        language: "CODE",
        code: raw
      };
    }
  }
  return null;
}

export function FloatingCodeSnippet({ snippet, isVertical }) {
  const frame = useCurrentFrame();

  if (!snippet || !snippet.code) return null;

  const title = snippet.title || "snippet.ts";
  const language = (snippet.language || "CODE").toUpperCase();
  const rawLines = typeof snippet.code === "string" ? snippet.code.split("\n") : Array.isArray(snippet.code) ? snippet.code : [String(snippet.code)];
  const lines = rawLines.slice(0, 9); // Keep at most 9 lines for clean overlay fit

  // Snappy spring-like entrance
  const progress = interpolate(frame, [0, 9], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const translateY = (1 - progress) * (isVertical ? 24 : 20);
  const scale = 0.94 + progress * 0.06;
  const cursorOpacity = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.18));

  // Determine language badge glow color
  const isSQL = language.includes("SQL");
  const isBash = language.includes("BASH") || language.includes("SH");
  const badgeColor = isSQL ? "#00c3ff" : isBash ? "#27c93f" : "#ff9d42";
  const badgeBg = isSQL ? "rgba(0, 195, 255, 0.14)" : isBash ? "rgba(39, 201, 63, 0.14)" : "rgba(255, 157, 66, 0.14)";

  return (
    <div
      style={{
        position: "absolute",
        ...(isVertical
          ? {
              left: "50%",
              transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
              bottom: "220px",
              width: "90%",
              maxWidth: "960px"
            }
          : {
              right: "44px",
              bottom: "124px",
              maxWidth: "640px",
              minWidth: "360px",
              transform: `translateY(${translateY}px) scale(${scale})`
            }),
        background: "rgba(11, 12, 19, 0.94)",
        backdropFilter: "blur(24px)",
        border: "1.5px solid rgba(255, 119, 0, 0.5)",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.88), 0 0 24px rgba(255, 119, 0, 0.2)",
        zIndex: 45,
        overflow: "hidden",
        opacity: progress,
        fontFamily: monoFont.fontFamily
      }}
    >
      {/* Chrome Window Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isVertical ? "12px 20px" : "10px 16px",
          background: "rgba(18, 19, 28, 0.98)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56", boxShadow: "0 0 5px rgba(255,95,86,0.6)" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e", boxShadow: "0 0 5px rgba(255,189,46,0.6)" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f", boxShadow: "0 0 5px rgba(39,201,63,0.6)" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "10px" }}>
            {isBash ? (
              <Terminal size={14} color="#a0a0b8" />
            ) : (
              <Code2 size={14} color="#ff9d42" />
            )}
            <span
              style={{
                fontSize: isVertical ? "14px" : "13px",
                color: "#e6edf3",
                fontWeight: 700,
                letterSpacing: "0.3px"
              }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Language Badge */}
        <div
          style={{
            fontSize: isVertical ? "11px" : "10px",
            color: badgeColor,
            background: badgeBg,
            border: `1px solid ${badgeColor}40`,
            borderRadius: "6px",
            padding: "2px 8px",
            fontWeight: 800,
            letterSpacing: "1px",
            fontFamily: primaryFont.fontFamily
          }}
        >
          {language}
        </div>
      </div>

      {/* Code Lines Body */}
      <div
        style={{
          padding: isVertical ? "14px 18px" : "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        {lines.map((line, idx) => {
          const lineNumber = idx + 1;
          const isLastLine = idx === lines.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                lineHeight: 1.5,
                fontSize: isVertical ? "15px" : "14px"
              }}
            >
              <span
                style={{
                  width: "28px",
                  marginRight: "14px",
                  textAlign: "right",
                  color: "#4f5366",
                  fontSize: isVertical ? "12px" : "11px",
                  userSelect: "none"
                }}
              >
                {lineNumber}
              </span>
              <span
                style={{
                  color: "#d8dee9",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}
              >
                {formatSyntaxLine(line)}
                {isLastLine && (
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: "4px",
                      color: "#ff7700",
                      opacity: cursorOpacity,
                      fontWeight: 800
                    }}
                  >
                    ▌
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
