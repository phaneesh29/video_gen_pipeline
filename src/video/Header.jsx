import React from "react";
import { interFont } from "./fonts.js";

export function Header({
  title,
  category,
  topic,
  badges,
  isVertical,
  currentSceneIndex = 0,
  totalScenes = 1,
  progress = 0
}) {
  const badgeList = badges && badges.length > 0 ? badges : [{ label: "Topic", value: topic || "CS" }];
  const categoryTag = category || topic || "SYSTEM ARCHITECTURE";

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        background: "rgba(7, 7, 11, 0.92)",
        borderBottom: "1px solid rgba(255, 107, 0, 0.22)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
        position: "relative",
        zIndex: 30,
        backdropFilter: "blur(16px)",
        fontFamily: interFont.fontFamily
      }}
    >
      {/* Global animated video progress bar */}
      <div
        style={{
          width: "100%",
          height: isVertical ? "5px" : "4px",
          background: "rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            height: "100%",
            background: "linear-gradient(90deg, #ff4500 0%, #ff7700 70%, #ffb300 100%)",
            boxShadow: "0 0 14px #ff7700, 0 0 4px #ffb300"
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          justifyContent: isVertical ? "flex-start" : "space-between",
          alignItems: isVertical ? "flex-start" : "center",
          padding: isVertical ? "22px 32px 18px 32px" : "18px 48px",
          gap: isVertical ? "14px" : "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: isVertical ? "wrap" : "nowrap" }}>
          {/* Category Pill with pulsing live beacon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, rgba(255, 119, 0, 0.9) 0%, rgba(255, 60, 0, 0.9) 100%)",
              color: "#ffffff",
              fontSize: isVertical ? "12px" : "13px",
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: "0 0 20px rgba(255, 107, 0, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              flexShrink: 0
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 0 6px #ffffff"
              }}
            />
            {categoryTag}
          </div>

          {/* Scene sequence counter */}
          {totalScenes > 1 && (
            <div
              style={{
                background: "rgba(255, 107, 0, 0.12)",
                border: "1px solid rgba(255, 107, 0, 0.35)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: isVertical ? "11px" : "12px",
                fontWeight: 800,
                color: "#ff9d42",
                letterSpacing: "0.8px",
                textTransform: "uppercase"
              }}
            >
              Scene {currentSceneIndex + 1}/{totalScenes}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontSize: isVertical ? "25px" : "28px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.6)",
              lineHeight: 1.2
            }}
          >
            {title}
          </h1>
        </div>

        {/* Dynamic spec metric badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {badgeList.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: "#0f0f15",
                border: "1px solid rgba(255, 107, 0, 0.3)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 107, 0, 0.12)",
                padding: isVertical ? "5px 12px" : "6px 16px",
                borderRadius: "8px",
                fontSize: isVertical ? "12px" : "13px",
                fontWeight: 700,
                color: "#ff9d42",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span style={{ color: "#8b949e", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
                {b.label}:
              </span>
              <span style={{ color: "#ffffff", fontWeight: 800 }}>{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
