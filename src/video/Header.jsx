import React from "react";

export function Header({ title, category, topic, badges, isVertical }) {
  const badgeList = badges && badges.length > 0 ? badges : [{ label: "Topic", value: topic || "CS" }];
  const categoryTag = category || topic || "COMPUTER SCIENCE";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        justifyContent: isVertical ? "flex-start" : "space-between",
        alignItems: isVertical ? "flex-start" : "center",
        padding: isVertical ? "24px 36px" : "20px 48px",
        gap: isVertical ? "14px" : "18px",
        background: "#070709",
        borderBottom: "1px solid rgba(255, 107, 0, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: isVertical ? "wrap" : "nowrap" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ff7700 0%, #ff4800 100%)",
            color: "#ffffff",
            fontSize: isVertical ? "13px" : "14px",
            fontWeight: 800,
            padding: "6px 14px",
            borderRadius: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            boxShadow: "0 0 25px rgba(255, 107, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            flexShrink: 0
          }}
        >
          {categoryTag}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: isVertical ? "26px" : "30px",
            fontWeight: 800,
            letterSpacing: "-0.6px",
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            lineHeight: 1.2
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {badgeList.map((b, idx) => (
          <div
            key={idx}
            style={{
              background: "#101015",
              border: "1px solid rgba(255, 107, 0, 0.35)",
              boxShadow: "0 0 15px rgba(255, 107, 0, 0.15)",
              padding: isVertical ? "5px 12px" : "7px 18px",
              borderRadius: "8px",
              fontSize: isVertical ? "13px" : "15px",
              fontWeight: 700,
              color: "#ff9d42"
            }}
          >
            {b.label}: <span style={{ color: "#ffffff" }}>{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
