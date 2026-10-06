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
    normal: { stroke: "#cbd5e1", bg: "#161622", text: "#ffffff", sub: "#94a3b8" },
    active: { stroke: "#ff7700", bg: "#251712", text: "#ffffff", sub: "#fed7aa" },
    visited: { stroke: "#22c55e", bg: "#132318", text: "#ffffff", sub: "#bbf7d0" },
    highlighted: { stroke: "#fbbf24", bg: "#252112", text: "#ffffff", sub: "#fef08a" }
  };

  const scheme = colorMap[status] || colorMap.normal;
  const strokeColor = isHub && status === "normal" ? "#38bdf8" : scheme.stroke;
  const solidBg = isHub && status === "normal" ? "#121d28" : scheme.bg;

  const left = x - width / 2;
  const top = y - height / 2;
  const nodeSeed = getSeed(id || label);

  // Clean hand-drawn sketchy rough border - HOLLOW outline only (NO diagonal hachure shading)
  const rectShape = generator.rectangle(left, top, width, height, {
    seed: nodeSeed + 10,
    roughness: isHub ? 1.4 : 1.1,
    bowing: 1.0,
    stroke: strokeColor,
    strokeWidth: isHub ? 3.4 : 2.6,
    fill: "none"
  });

  const borderPaths = generator.toPaths(rectShape);

  // Handwritten text fade-in as box completes drawing
  const textOpacity = interpolate(frame, [startFrame + 6, startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const wiggleOffset = Math.sin(frame * 0.2) * 2;

  return (
    <g>
      {/* 1. Solid dark card backing for 100% text contrast and clean readability */}
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={14}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2 : 1}
        opacity={textOpacity}
      />

      {/* 2. Hand-drawn sketchy hollow border (outline only, no scribble shading) */}
      <AnimatedRoughPath
        pathData={borderPaths}
        strokeColor={strokeColor}
        strokeWidth={isHub ? 3.4 : 2.6}
        startFrame={startFrame}
        duration={18}
      />

      {/* 3. Hand-drawn active highlight loop */}
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

      {/* 4. Bold, crystal-clear readable text */}
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
            padding: "8px 14px",
            opacity: textOpacity,
            fontFamily: sketchFont.fontFamily,
            boxSizing: "border-box"
          }}
        >
          {isHub && (
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#38bdf8",
                letterSpacing: "1.2px",
                fontFamily: monoFont.fontFamily,
                marginBottom: "4px",
                textTransform: "uppercase"
              }}
            >
              ★ CENTRAL SERVER
            </div>
          )}
          <div
            style={{
              fontSize: isHub ? "28px" : "25px",
              fontWeight: 800,
              color: scheme.text,
              lineHeight: 1.25,
              letterSpacing: "0.2px",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)"
            }}
          >
            {label}
          </div>
          {subLabel && (
            <div
              style={{
                fontSize: "18px",
                color: scheme.sub,
                marginTop: "4px",
                fontFamily: caveatFont.fontFamily,
                fontWeight: 700,
                letterSpacing: "0.3px"
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
    strokeWidth: 3.5
  });

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 22;
  const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

  const headShape1 = generator.line(x2, y2, hx1, hy1, { seed: arrowSeed + 1, roughness: 1.2, stroke: color, strokeWidth: 3.5 });
  const headShape2 = generator.line(x2, y2, hx2, hy2, { seed: arrowSeed + 2, roughness: 1.2, stroke: color, strokeWidth: 3.5 });

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
        strokeWidth={3.5}
        startFrame={startFrame}
        duration={duration}
      />

      {/* Floating animated pencil tip */}
      {showPen && (
        <foreignObject x={penX - 10} y={penY - 30} width={44} height={44}>
          <div style={{ fontSize: "26px", transform: "rotate(-40deg)" }}>
            ✏️
          </div>
        </foreignObject>
      )}

      {/* Handwritten sticky label on arrow */}
      {label && (
        <foreignObject
          x={mx - 150}
          y={my - 24}
          width={300}
          height={50}
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
                border: `2px dashed ${color}`,
                borderRadius: "10px",
                padding: "4px 14px",
                fontSize: "19px",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: caveatFont.fontFamily,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.85)"
              }}
            >
              {label}
            </div>
          </div>
    </g>
  );
}
