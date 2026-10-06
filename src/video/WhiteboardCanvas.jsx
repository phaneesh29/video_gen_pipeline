import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { RoughBoxNode, RoughArrow } from "./RoughShapes.jsx";
import { sketchFont, caveatFont, monoFont } from "./fonts.js";

export function WhiteboardCanvas({ structures = [], isVertical = false, fullWidth = false }) {
  const frame = useCurrentFrame();

  const width = isVertical ? 1000 : fullWidth ? 1440 : 940;
  const height = isVertical ? 1160 : fullWidth ? 620 : 440;
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
      positions.set(publisher.id, { x: cx, y: 170 });
      positions.set(hubNode.id, { x: cx, y: 580 });
      const pCount = peripherals.length;
      peripherals.forEach((sub, i) => {
        let sx = cx;
        const sy = 990;
        if (pCount === 1) sx = cx;
        else if (pCount === 2) sx = i === 0 ? cx - 260 : cx + 260;
        else if (pCount === 3) sx = i === 0 ? cx - 320 : i === 1 ? cx : cx + 320;
        else {
          const spacing = (width - 240) / Math.max(1, pCount - 1);
          sx = 120 + i * spacing;
        }
        positions.set(sub.id, { x: sx, y: sy });
      });
    } else {
      if (total <= 4) {
        nodes.forEach((node, i) => {
          let y = cy;
          if (total === 1) y = cy;
          else if (total === 2) y = i === 0 ? 260 : 880;
          else if (total === 3) y = i === 0 ? 200 : i === 1 ? 580 : 960;
          else if (total === 4) y = 160 + i * 270;
          positions.set(node.id, { x: cx, y });
        });
      } else {
        const rx = 360;
        const ry = 340;
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
      positions.set(publisher.id, { x: fullWidth ? 220 : 160, y: cy });
      positions.set(hubNode.id, { x: cx, y: cy });
      const rightX = width - (fullWidth ? 220 : 160);
      const pCount = peripherals.length;
      peripherals.forEach((sub, i) => {
        let sy = cy;
        if (pCount === 1) sy = cy;
        else if (pCount === 2) sy = i === 0 ? cy - 120 : cy + 120;
        else if (pCount === 3) sy = i === 0 ? cy - 140 : i === 1 ? cy : cy + 140;
        else {
          const spread = height - 140;
          sy = 70 + (i * spread) / (pCount - 1);
        }
        positions.set(sub.id, { x: rightX, y: sy });
      });
    } else {
      if (total <= 4) {
        const spacing = total > 1 ? (width - 340) / (total - 1) : 0;
        nodes.forEach((node, i) => {
          const x = total === 1 ? cx : 170 + i * spacing;
          const y = cy;
          positions.set(node.id, { x, y });
        });
      } else {
        const rx = fullWidth ? 460 : 300;
        const ry = fullWidth ? 200 : 140;
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
        flex: fullWidth ? "1 1 100%" : isVertical ? "0 0 58%" : "0 0 58%",
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "20px 20px 170px 20px" : "18px 36px 120px 36px",
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
          <span style={{ fontSize: isVertical ? "22px" : "18px" }}>✎</span>
          <div
            style={{
              fontSize: isVertical ? "22px" : "18px",
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

                const pad = isVertical ? 72 : 54;
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
                    width={isHub ? (isVertical ? 360 : 280) : isVertical ? 320 : 250}
                    height={isHub ? (isVertical ? 130 : 108) : isVertical ? 118 : 96}
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
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", padding: "24px 10px" }}>
            {elements.map((el, idx) => {
              const isHigh = !!el.highlight;
              const bounce = Math.sin(frame * 0.25) * 4;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: isVertical ? "16px" : "14px", color: "#94a3b8", fontFamily: monoFont.fontFamily, marginBottom: "5px" }}>
                    [{idx}]
                  </div>
                  <div
                    style={{
                      width: isVertical ? "86px" : "72px",
                      height: isVertical ? "86px" : "72px",
                      border: isHigh ? "3px solid #ff7700" : "2px dashed rgba(255, 255, 255, 0.4)",
                      borderRadius: "12px",
                      background: isHigh ? "rgba(255, 119, 0, 0.25)" : "#181824",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isVertical ? "34px" : "28px",
                      fontWeight: 700,
                      color: isHigh ? "#ffedd5" : "#ffffff",
                      fontFamily: sketchFont.fontFamily,
                      boxShadow: isHigh ? "0 0 20px rgba(255, 107, 0, 0.5)" : "none"
                    }}
                  >
                    {el.value}
                  </div>
                  {el.pointerLabel && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "8px", transform: `translateY(${bounce}px)` }}>
                      <span style={{ color: "#ff7700", fontSize: isVertical ? "16px" : "14px" }}>▲</span>
                      <span style={{ fontSize: isVertical ? "17px" : "14px", fontWeight: 700, color: "#ffaa55", fontFamily: caveatFont.fontFamily }}>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", padding: "18px 12px", width: "100%" }}>
            {entries.map((entry, idx) => {
              const isHigh = !!entry.highlight;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: isVertical ? "12px 24px" : "10px 18px",
                    background: isHigh ? "rgba(255, 119, 0, 0.25)" : "#181824",
                    border: isHigh ? "2.5px solid #ff7700" : "1.5px dashed rgba(255, 255, 255, 0.3)",
                    borderRadius: "12px",
                    fontFamily: sketchFont.fontFamily,
                    fontSize: isVertical ? "24px" : "20px",
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
