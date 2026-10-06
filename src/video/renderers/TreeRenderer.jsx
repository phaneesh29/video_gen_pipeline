import React from "react";

export function TreeRenderer({ name, nodes, edges }) {
  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const root = nodes.find((n) => !nodes.some((other) => other.leftId === n.id || other.rightId === n.id)) || nodes[0];

  const positions = new Map();
  const width = 640;
  const height = 300;

  function assignPositions(node, depth, leftBound, rightBound) {
    if (!node) return;
    const x = (leftBound + rightBound) / 2;
    const y = 50 + depth * 75;
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
      positions.set(n.id, { x: 80 + idx * 90, y: 150 });
    }
  });

  const statusColors = {
    normal: { bg: "#21262d", border: "#30363d", text: "#c9d1d9", glow: "none" },
    active: { bg: "#1f6feb", border: "#58a6ff", text: "#ffffff", glow: "0 0 16px rgba(88, 166, 255, 0.6)" },
    visited: { bg: "#238636", border: "#3fb950", text: "#ffffff", glow: "0 0 12px rgba(63, 185, 80, 0.4)" },
    highlighted: { bg: "#9e6a03", border: "#d29922", text: "#ffffff", glow: "0 0 16px rgba(210, 153, 34, 0.6)" }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "rgba(22, 27, 34, 0.6)",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "16px 20px"
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#8b949e", textTransform: "uppercase" }}>
        {name} (tree)
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
                  stroke="#484f58"
                  strokeWidth="3"
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
                left: `${pos.x - 24}px`,
                top: `${pos.y - 24}px`,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: colors.glow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text,
                fontSize: "18px",
                fontWeight: 700,
                transition: "all 0.3s ease"
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
