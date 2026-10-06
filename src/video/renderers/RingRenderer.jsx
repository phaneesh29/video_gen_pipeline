import React from "react";

export function RingRenderer({ name, nodes, edges }) {
  const width = 800;
  const height = 330;

  const positions = new Map();
  const total = nodes.length;

  const cx = 400;
  const cy = 165;
  const r = 115;

  nodes.forEach((node, i) => {
    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    positions.set(node.id, { x, y });
  });

  const findPos = (id) => {
    if (!id) return null;
    if (positions.has(id)) return positions.get(id);
    const target = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of positions.entries()) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === target) return v;
    }
    return null;
  };

  const statusStyles = {
    normal: {
      bg: "#13131a",
      border: "rgba(255, 255, 255, 0.12)",
      text: "#c9d1d9",
      subText: "#8b949e",
      glow: "0 4px 12px rgba(0,0,0,0.5)"
    },
    active: {
      bg: "linear-gradient(135deg, #ff7700 0%, #ff3b00 100%)",
      border: "#ffa34d",
      text: "#ffffff",
      subText: "#ffe0cc",
      glow: "0 0 35px rgba(255, 107, 0, 0.85)"
    },
    visited: {
      bg: "#102316",
      border: "#2ea043",
      text: "#56d364",
      subText: "#85e89d",
      glow: "0 0 18px rgba(46, 160, 67, 0.4)"
    },
    highlighted: {
      bg: "linear-gradient(135deg, #e3b341 0%, #bb8009 100%)",
      border: "#f2cc60",
      text: "#ffffff",
      subText: "#fff3cc",
      glow: "0 0 25px rgba(227, 179, 65, 0.6)"
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
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
          {name} <span style={{ color: "#6e7681", fontSize: "13px", fontWeight: 600 }}>(Consistent Hash Ring)</span>
        </div>
      </div>

      <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255, 107, 0, 0.3)"
            strokeWidth="2.5"
            strokeDasharray="6,6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r - 18}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />

          {edges.map((edge, idx) => {
            const p1 = findPos(edge.from);
            const p2 = findPos(edge.to);
            if (!p1 || !p2) return null;

            const isActive = edge.status === "active" || edge.status === "traversed";

            return (
              <g key={idx}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isActive ? "#ff6b00" : "#383848"}
                  strokeWidth={isActive ? "3" : "1.5"}
                  strokeDasharray={isActive ? "5,3" : "none"}
                />
              </g>
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            left: `${cx}px`,
            top: `${cy}px`,
            transform: "translate(-50%, -50%)",
            background: "rgba(19, 19, 26, 0.9)",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            borderRadius: "50%",
            width: "90px",
            height: "90px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.8)",
            zIndex: 1
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#ff9d42", letterSpacing: "0.5px" }}>HASH RING</div>
          <div style={{ fontSize: "9px", color: "#8b949e", marginTop: "2px" }}>2^32 - 1</div>
        </div>

        {edges.map((edge, idx) => {
          if (!edge.label) return null;
          const p1 = findPos(edge.from);
          const p2 = findPos(edge.to);
          if (!p1 || !p2) return null;

          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const isActive = edge.status === "active" || edge.status === "traversed";

          return (
            <div
              key={`lbl-${idx}`}
              style={{
                position: "absolute",
                left: `${mx}px`,
                top: `${my}px`,
                transform: "translate(-50%, -50%)",
                background: isActive ? "rgba(255, 107, 0, 0.95)" : "#13131a",
                color: "#ffffff",
                border: isActive ? "1px solid #ffa34d" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.4px",
                boxShadow: isActive ? "0 0 15px rgba(255, 107, 0, 0.7)" : "none",
                whiteSpace: "nowrap",
                zIndex: 2
              }}
            >
              {edge.label}
            </div>
          );
        })}

        {nodes.map((node) => {
          const pos = positions.get(node.id) || { x: cx, y: cy };
          const style = statusStyles[node.status] || statusStyles.normal;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
                width: "125px",
                minHeight: "50px",
                borderRadius: "12px",
                background: style.bg,
                border: `2px solid ${style.border}`,
                boxShadow: style.glow,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                textAlign: "center",
                zIndex: 3
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: style.text,
                  letterSpacing: "-0.2px",
                  lineHeight: 1.2
                }}
              >
                {node.label}
              </div>
              {node.subLabel ? (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: style.subText,
                    marginTop: "2px"
                  }}
                >
                  {node.subLabel}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
