import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoughBoxNode, RoughArrow } from "./RoughShapes.jsx";
import { sketchFont, caveatFont, monoFont } from "./fonts.js";

export function WhiteboardCanvas({ structures = [], isVertical = false, fullWidth = false }) {
  const frame = useCurrentFrame();

  const width = isVertical ? 980 : fullWidth ? 1360 : 900;
  const height = isVertical ? 980 : fullWidth ? 540 : 400;
  const cx = width / 2;
  const cy = height / 2;

  const structure = structures[0] || { name: "Whiteboard Diagram", nodes: [], edges: [], elements: [], entries: [] };
  const nodes = structure.nodes || [];
  const edges = structure.edges || [];
  const elements = structure.elements || [];
  const entries = structure.entries || [];
  const total = nodes.length;

  const positions = new Map();

  const hubKeywords = ["sfu", "hub", "server", "switch", "router", "gateway", "coordinator", "broker", "central"];
  let hubNode = nodes.find((n) =>
    hubKeywords.some((kw) => (n.id + " " + n.label).toLowerCase().includes(kw))
  );

  const isPublisher = (n) => {
    const text = (n.id + " " + n.label).toLowerCase();
    return text.includes("publish") || text.includes("host") || text.includes("cam") || text.includes("sender") || text.includes("client");
  };

  const publisher = nodes.find((n) => n !== hubNode && isPublisher(n));
  const peripherals = nodes.filter((n) => (!hubNode || n.id !== hubNode.id) && (!publisher || n.id !== publisher.id));

  // Adaptive chalkboard layout positioning
  if (isVertical) {
    if (hubNode && publisher) {
      positions.set(publisher.id, { x: cx, y: 130 });
      positions.set(hubNode.id, { x: cx, y: 480 });
      const pCount = peripherals.length;
      peripherals.forEach((sub, i) => {
        let sx = cx;
        const sy = 850;
        if (pCount === 1) sx = cx;
        else if (pCount === 2) sx = i === 0 ? cx - 240 : cx + 240;
        else if (pCount === 3) sx = i === 0 ? cx - 280 : i === 1 ? cx : cx + 280;
        else {
          const spacing = (width - 200) / Math.max(1, pCount - 1);
          sx = 100 + i * spacing;
        }
        positions.set(sub.id, { x: sx, y: sy });
      });
    } else {
      if (total <= 4) {
        nodes.forEach((node, i) => {
          let y = cy;
          if (total === 1) y = cy;
          else if (total === 2) y = i === 0 ? 200 : 760;
          else if (total === 3) y = i === 0 ? 170 : i === 1 ? 480 : 800;
          else if (total === 4) y = 140 + i * 220;
          positions.set(node.id, { x: cx, y });
        });
      } else {
        const rx = 340;
        const ry = 300;
        nodes.forEach((node, i) => {
          const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          positions.set(node.id, { x, y });
        });
      }
    }
  } else {
    if (hubNode && publisher) {
      positions.set(publisher.id, { x: fullWidth ? 200 : 150, y: cy });
      positions.set(hubNode.id, { x: cx, y: cy });
      const rightX = width - (fullWidth ? 200 : 150);
      const pCount = peripherals.length;
      peripherals.forEach((sub, i) => {
        let sy = cy;
        if (pCount === 1) sy = cy;
        else if (pCount === 2) sy = i === 0 ? cy - 110 : cy + 110;
        else if (pCount === 3) sy = i === 0 ? cy - 130 : i === 1 ? cy : cy + 130;
        else {
          const spread = height - 130;
          sy = 65 + (i * spread) / (pCount - 1);
        }
        positions.set(sub.id, { x: rightX, y: sy });
      });
    } else {
      if (total <= 4) {
        const spacing = total > 1 ? (width - 320) / (total - 1) : 0;
        nodes.forEach((node, i) => {
          const x = total === 1 ? cx : 160 + i * spacing;
          const y = cy;
          positions.set(node.id, { x, y });
        });
      } else {
        const rx = fullWidth ? 440 : 290;
        const ry = fullWidth ? 190 : 130;
        nodes.forEach((node, i) => {
          const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          positions.set(node.id, { x, y });
        });
      }
    }
  }

  const findPos = (id) => {
    if (!id) return null;
    if (positions.has(id)) return positions.get(id);
    const target = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of positions.entries()) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === target) return v;
    }
    return null;
  };

  const hasNodesOrEdges = nodes.length > 0 || edges.length > 0;
  const hasElements = elements.length > 0;
  const hasEntries = entries.length > 0;

  return (
    <div
      style={{
        flex: fullWidth ? "1 1 100%" : isVertical ? "0 0 54%" : "0 0 58%",
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "16px 16px 230px 16px" : "18px 36px 120px 36px",
        background: "transparent",
        position: "relative",
        zIndex: 2,
        overflow: "hidden"
      }}
    >
      {/* Blackboard Card Container with Chalk Border */}
      <div
        style={{
          width: "100%",
          maxWidth: `${width + 30}px`,
          background: "rgba(18, 18, 24, 0.9)",
          border: "2px dashed rgba(255, 255, 255, 0.22)",
          borderRadius: "22px",
          padding: isVertical ? "20px 14px" : "18px 24px",
          boxShadow: "0 16px 50px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}
      >
        {/* Sketch Whiteboard Title Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>✎</span>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#fbbf24",
              letterSpacing: "0.5px",
              fontFamily: sketchFont.fontFamily,
              textTransform: "uppercase"
            }}
          >
            {structure.name || "Whiteboard Diagram"}
          </div>
        </div>

        {/* 1. Network / Architecture Diagram View */}
        {hasNodesOrEdges && (
          <div
            style={{
              position: "relative",
              width: `${width}px`,
              height: `${height}px`,
              overflow: "visible"
            }}
          >
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                overflow: "visible"
              }}
            >
              {edges.map((edge, idx) => {
                const p1 = findPos(edge.from);
                const p2 = findPos(edge.to);
                if (!p1 || !p2) return null;

                const hasOpposite = edges.some((other) => other.from === edge.to && other.to === edge.from);
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = -dy / len;
                const ny = dx / len;
                const offsetDist = hasOpposite ? 30 : 0;

                const pad = 48;
                const startX = p1.x + (dx / len) * pad + nx * offsetDist;
                const startY = p1.y + (dy / len) * pad + ny * offsetDist;
                const endX = p2.x - (dx / len) * pad + nx * offsetDist;
                const endY = p2.y - (dy / len) * pad + ny * offsetDist;

                const isActive = edge.status === "active" || edge.status === "traversed";
                const arrowColor = isActive ? "#ff7700" : "#64748b";

                const startFrame = 8 + idx * 6;

                return (
                  <RoughArrow
                    key={`edge-${idx}`}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    label={edge.label}
                    color={arrowColor}
                    startFrame={startFrame}
                    duration={16}
                  />
                );
              })}

              {nodes.map((node, i) => {
                const pos = positions.get(node.id) || { x: cx, y: cy };
                const isHub = hubNode && node.id === hubNode.id;
                const startFrame = i * 4;

                return (
                  <RoughBoxNode
                    key={node.id}
                    id={node.id}
                    label={node.label}
                    subLabel={node.subLabel}
                    x={pos.x}
                    y={pos.y}
                    width={isHub ? (isVertical ? 220 : 200) : isVertical ? 180 : 160}
                    height={isHub ? 90 : 76}
                    status={node.status}
                    startFrame={startFrame}
                    isHub={isHub}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* 2. Array / Elements Sketch View */}
        {hasElements && (
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", padding: "20px 10px" }}>
            {elements.map((el, idx) => {
              const isHigh = !!el.highlight;
              const bounce = Math.sin(frame * 0.25) * 4;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: "13px", color: "#94a3b8", fontFamily: monoFont.fontFamily, marginBottom: "4px" }}>
                    [{idx}]
                  </div>
                  <div
                    style={{
                      width: "66px",
                      height: "66px",
                      border: isHigh ? "2.5px solid #ff7700" : "2px dashed rgba(255, 255, 255, 0.4)",
                      borderRadius: "10px",
                      background: isHigh ? "rgba(255, 119, 0, 0.2)" : "#181824",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: 700,
                      color: isHigh ? "#ffedd5" : "#ffffff",
                      fontFamily: sketchFont.fontFamily,
                      boxShadow: isHigh ? "0 0 20px rgba(255, 107, 0, 0.5)" : "none"
                    }}
                  >
                    {el.value}
                  </div>
                  {el.pointerLabel && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "6px", transform: `translateY(${bounce}px)` }}>
                      <span style={{ color: "#ff7700", fontSize: "14px" }}>▲</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffaa55", fontFamily: caveatFont.fontFamily }}>
                        {el.pointerLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Entries / Key-Value / Table Sketch View */}
        {hasEntries && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", padding: "14px 10px", width: "100%" }}>
            {entries.map((entry, idx) => {
              const isHigh = !!entry.highlight;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    background: isHigh ? "rgba(255, 119, 0, 0.25)" : "#181824",
                    border: isHigh ? "2px solid #ff7700" : "1.5px dashed rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    fontFamily: sketchFont.fontFamily,
                    fontSize: "18px",
                    color: "#ffffff"
                  }}
                >
                  <span style={{ color: "#fbbf24", fontWeight: 700 }}>{entry.key}</span>
                  <span style={{ color: "#94a3b8" }}>→</span>
                  <span>{entry.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
