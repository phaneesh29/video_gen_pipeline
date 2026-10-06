import React from "react";

export function TreeRenderer({ name, nodes, edges }) {
  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const root = nodes.find((n) => !nodes.some((other) => other.leftId === n.id || other.rightId === n.id)) || nodes[0];

  const positions = new Map();
  const width = 640;
  const height = 310;

  function assignPositions(node, depth, leftBound, rightBound) {
    if (!node) return;
    const x = (leftBound + rightBound) / 2;
    const y = 55 + depth * 80;
    positions.set(node.id, { x, y });

    const leftNode = node.leftId ? nodeMap.get(node.leftId) : null;
    const rightNode = node.rightId ? nodeMap.get(node.rightId) : null;

    if (leftNode) assignPositions(leftNode, depth + 1, leftBound, x);
    if (rightNode) assignPositions(rightNode, depth + 1, x, rightBound);
  }

  if (root) {
    assignPositions(root, 0, 0, width);
  }

  nodes.forEach((n, idx) => {
    if (!positions.has(n.id)) {
      positions.set(n.id, { x: 80 + idx * 95, y: 155 });
    }
  });

  const statusColors = {
    normal: {
      bg: "#13131a",
      border: "rgba(255, 255, 255, 0.12)",
      text: "#c9d1d9",
      glow: "0 4px 12px rgba(0,0,0,0.5)"
    },
    active: {
      bg: "linear-gradient(135deg, #ff7700 0%, #ff3b00 100%)",
      border: "#ffa34d",
      text: "#ffffff",
      glow: "0 0 32px rgba(255, 107, 0, 0.85)"
    },
    visited: {
      bg: "#102316",
      border: "#2ea043",
      text: "#56d364",
      glow: "0 0 16px rgba(46, 160, 67, 0.4)"
    },
    highlighted: {
      bg: "linear-gradient(135deg, #e3b341 0%, #bb8009 100%)",
      border: "#f2cc60",
      text: "#ffffff",
      glow: "0 0 24px rgba(227, 179, 65, 0.6)"
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "rgba(14, 14, 18, 0.7)",
        border: "1px solid rgba(255, 107, 0, 0.18)",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 10px #ff6b00" }} />
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#ff9d42", textTransform: "uppercase", letterSpacing: "1px" }}>
          {name} <span style={{ color: "#6e7681", fontSize: "14px", fontWeight: 600 }}>(tree)</span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", height: `${height}px`, overflow: "hidden" }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {nodes.map((parent) => {
            const pPos = positions.get(parent.id);
            if (!pPos) return null;

            return [parent.leftId, parent.rightId].map((childId) => {
              if (!childId) return null;
              const cPos = positions.get(childId);
              if (!cPos) return null;

              return (
                <line
                  key={`${parent.id}-${childId}`}
                  x1={pPos.x}
                  y1={pPos.y}
                  x2={cPos.x}
                  y2={cPos.y}
                  stroke="#383848"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              );
            });
          })}
        </svg>

        {nodes.map((node) => {
          const pos = positions.get(node.id) || { x: 50, y: 50 };
          const colors = statusColors[node.status] || statusColors.normal;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: `${pos.x - 27}px`,
                top: `${pos.y - 27}px`,
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: colors.glow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text,
                fontSize: "22px",
                fontWeight: 800,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
