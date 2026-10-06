import React from "react";
import rough from "roughjs";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { sketchFont, caveatFont, monoFont } from "./fonts.js";

const generator = rough.generator();

/**
 * Animated sketchy rough path that draws itself progressively
 */
export function AnimatedRoughPath({ pathData, strokeColor, strokeWidth = 2.5, startFrame = 0, duration = 18, fillStyle = "none", fillColor = "none" }) {
  const frame = useCurrentFrame();

  const estLength = 1200;

  const strokeOffset = interpolate(frame, [startFrame, startFrame + duration], [estLength, 0], {
    easing: Easing.bezier(0.25, 1, 0.5, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const fillOpacity = interpolate(frame, [startFrame + duration * 0.5, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <g>
      {pathData.map((p, idx) => {
        const isFill = p.stroke === "none" || (p.fill && p.fill !== "none");
        if (isFill) {
          return (
            <path
              key={`fill-${idx}`}
              d={p.d}
              fill={fillColor !== "none" ? fillColor : p.fill || strokeColor}
              opacity={fillOpacity * 0.3}
              stroke="none"
            />
          );
        }

        return (
          <path
            key={`stroke-${idx}`}
            d={p.d}
            fill="none"
            stroke={strokeColor || p.stroke || "#ffffff"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={estLength}
            strokeDashoffset={strokeOffset}
          />
        );
      })}
    </g>
  );
}

function getSeed(str) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

/**
 * Hand-drawn Excalidraw-style sketchy box with handwritten text
 */
export function RoughBoxNode({
  id,
  label,
  subLabel,
  x,
  y,
  width = 210,
  height = 88,
  status = "normal",
  startFrame = 0,
  isHub = false
}) {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  const colorMap = {
    normal: { stroke: "#e2e8f0", fill: "rgba(255, 255, 255, 0.12)", text: "#f8fafc", sub: "#cbd5e1" },
    active: { stroke: "#ff7700", fill: "rgba(255, 119, 0, 0.25)", text: "#ffffff", sub: "#ffedd5" },
    visited: { stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.2)", text: "#86efac", sub: "#bbf7d0" },
    highlighted: { stroke: "#fbbf24", fill: "rgba(251, 191, 36, 0.22)", text: "#fef08a", sub: "#fef9c3" }
  };

  const scheme = colorMap[status] || colorMap.normal;
  const strokeColor = isHub && status === "normal" ? "#38bdf8" : scheme.stroke;
  const hachureFill = isHub && status === "normal" ? "rgba(56, 189, 248, 0.2)" : scheme.fill;

  const left = x - width / 2;
  const top = y - height / 2;
  const nodeSeed = getSeed(id || label);

  // 1. Solid blackboard backdrop so text is crystal clear (deterministic seed)
  const solidBgShape = generator.rectangle(left, top, width, height, {
    seed: nodeSeed,
    roughness: 0.8,
    fill: "#181822",
    fillStyle: "solid",
    stroke: "none"
  });

  // 2. Sketchy rough border + hachure shading (deterministic seed)
  const rectShape = generator.rectangle(left, top, width, height, {
    seed: nodeSeed + 10,
    roughness: isHub ? 1.8 : 1.4,
    bowing: 1.2,
    stroke: strokeColor,
    strokeWidth: isHub ? 3.2 : 2.6,
    fill: hachureFill,
    fillStyle: "hachure",
    hachureAngle: -45,
    hachureGap: 10
  });

  const bgPaths = generator.toPaths(solidBgShape);
  const borderPaths = generator.toPaths(rectShape);

  // Handwritten text fade-in as box completes drawing
  const textOpacity = interpolate(frame, [startFrame + 8, startFrame + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const wiggleOffset = Math.sin(frame * 0.2) * 2;

  return (
    <g>
      {/* Dark chalk card backing */}
      {bgPaths.map((p, idx) => (
        <path key={`bg-${idx}`} d={p.d} fill="#181824" opacity={textOpacity} stroke="none" />
      ))}

      {/* Hand-drawn sketchy borders & hachure shading */}
      <AnimatedRoughPath
        pathData={borderPaths}
        strokeColor={strokeColor}
        strokeWidth={isHub ? 3.2 : 2.6}
        startFrame={startFrame}
        duration={18}
        fillColor={hachureFill}
      />

      {/* Hand-drawn active highlight loop */}
      {status === "active" && (
        <circle
          cx={x}
          cy={y}
          r={Math.max(width, height) / 2 + 18 + wiggleOffset}
          fill="none"
          stroke="#ff7700"
          strokeWidth="2.5"
          strokeDasharray="14,8"
          opacity="0.85"
        />
      )}

      {/* Handwritten text */}
      <foreignObject
        x={left}
        y={top}
        width={width}
        height={height}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "8px 12px",
            opacity: textOpacity,
            fontFamily: sketchFont.fontFamily,
            boxSizing: "border-box"
          }}
        >
          {isHub && (
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#38bdf8",
                letterSpacing: "0.8px",
                fontFamily: monoFont.fontFamily,
                marginBottom: "3px"
              }}
            >
              ★ CENTRAL SFU HUB
            </div>
          )}
          <div
            style={{
              fontSize: isHub ? "20px" : "19px",
              fontWeight: 700,
              color: scheme.text,
              lineHeight: 1.22,
              letterSpacing: "0.2px",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)"
            }}
          >
            {label}
          </div>
          {subLabel && (
            <div
              style={{
                fontSize: "14px",
                color: scheme.sub,
                marginTop: "3px",
                fontFamily: caveatFont.fontFamily,
                fontWeight: 600,
                letterSpacing: "0.2px"
              }}
            >
              {subLabel}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

/**
 * Hand-drawn sketchy arrow with animated progressive stroke
 */
export function RoughArrow({
  x1,
  y1,
  x2,
  y2,
  label,
  color = "#ff7700",
  startFrame = 0,
  duration = 20
}) {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  // Clip endpoints to prevent arrow lines running deep inside boxes (deterministic seed)
  const arrowSeed = getSeed(`arrow-${x1.toFixed(0)}-${y1.toFixed(0)}-${x2.toFixed(0)}-${y2.toFixed(0)}`);
  const lineShape = generator.line(x1, y1, x2, y2, {
    seed: arrowSeed,
    roughness: 1.3,
    stroke: color,
    strokeWidth: 2.8
  });

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 18;
  const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

  const headShape1 = generator.line(x2, y2, hx1, hy1, { seed: arrowSeed + 1, roughness: 1.2, stroke: color, strokeWidth: 3 });
  const headShape2 = generator.line(x2, y2, hx2, hy2, { seed: arrowSeed + 2, roughness: 1.2, stroke: color, strokeWidth: 3 });

  const allPaths = [
    ...generator.toPaths(lineShape),
    ...generator.toPaths(headShape1),
    ...generator.toPaths(headShape2)
  ];

  const labelOpacity = interpolate(frame, [startFrame + duration * 0.65, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const penX = x1 + (x2 - x1) * progress;
  const penY = y1 + (y2 - y1) * progress;
  const showPen = frame >= startFrame && frame <= startFrame + duration + 4;

  return (
    <g>
      <AnimatedRoughPath
        pathData={allPaths}
        strokeColor={color}
        strokeWidth={3}
        startFrame={startFrame}
        duration={duration}
      />

      {/* Floating animated pencil tip */}
      {showPen && (
        <foreignObject x={penX - 8} y={penY - 24} width={36} height={36}>
          <div style={{ fontSize: "20px", transform: "rotate(-40deg)" }}>
            ✏️
          </div>
        </foreignObject>
      )}

      {/* Handwritten sticky label on arrow */}
      {label && (
        <foreignObject
          x={mx - 110}
          y={my - 18}
          width={220}
          height={40}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: labelOpacity
            }}
          >
            <div
              style={{
                background: "#181822",
                border: `1.5px dashed ${color}`,
                borderRadius: "8px",
                padding: "2px 10px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: caveatFont.fontFamily,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.7)"
              }}
            >
              {label}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}
