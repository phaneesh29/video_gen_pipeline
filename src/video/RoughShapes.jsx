import React from "react";
import rough from "roughjs";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { primaryFont, displayFont, monoFont } from "./fonts.js";
import { DynamicIcon } from "./DynamicIcon.jsx";

const generator = rough.generator();

/**
 * Animated sketchy rough path that draws itself progressively
 */
export function AnimatedRoughPath({ pathData, strokeColor, strokeWidth = 2.5, startFrame = 0, duration = 18, fillColor = "none" }) {
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
  icon,
  x,
  y,
  width = 210,
  height = 88,
  shape = "rectangle",
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

  // Handwritten text fade-in as box completes drawing
  const textOpacity = interpolate(frame, [startFrame + 6, startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  let borderPaths = [];
  let backingElement = null;

  if (shape === "cylinder") {
    const ry = Math.min(24, height * 0.18);
    const topEllipse = generator.ellipse(x, top + ry, width, ry * 2, {
      seed: nodeSeed,
      roughness: isHub ? 1.4 : 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    const leftLine = generator.line(left, top + ry, left, top + height - ry, {
      seed: nodeSeed + 1,
      roughness: 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6
    });
    const rightLine = generator.line(left + width, top + ry, left + width, top + height - ry, {
      seed: nodeSeed + 2,
      roughness: 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6
    });
    const bottomArc = generator.arc(x, top + height - ry, width, ry * 2, 0, Math.PI, false, {
      seed: nodeSeed + 3,
      roughness: 1.2,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6
    });
    const midArc = generator.arc(x, top + height * 0.48, width, ry * 2, 0, Math.PI, false, {
      seed: nodeSeed + 4,
      roughness: 1.1,
      stroke: strokeColor,
      strokeWidth: 1.8
    });

    borderPaths = [
      ...generator.toPaths(topEllipse),
      ...generator.toPaths(leftLine),
      ...generator.toPaths(rightLine),
      ...generator.toPaths(bottomArc),
      ...generator.toPaths(midArc)
    ];

    const cylinderD = `M ${left} ${top + ry} A ${width / 2} ${ry} 0 0 1 ${left + width} ${top + ry} L ${left + width} ${top + height - ry} A ${width / 2} ${ry} 0 0 1 ${left} ${top + height - ry} Z`;
    backingElement = (
      <path
        d={cylinderD}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  } else if (shape === "diamond") {
    const pts = [
      [x, top],
      [left + width, y],
      [x, top + height],
      [left, y]
    ];
    const diamondShape = generator.polygon(pts, {
      seed: nodeSeed,
      roughness: isHub ? 1.4 : 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    borderPaths = generator.toPaths(diamondShape);
    backingElement = (
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  } else if (shape === "hexagon") {
    const inset = width * 0.15;
    const pts = [
      [left + inset, top],
      [left + width - inset, top],
      [left + width, y],
      [left + width - inset, top + height],
      [left + inset, top + height],
      [left, y]
    ];
    const hexShape = generator.polygon(pts, {
      seed: nodeSeed,
      roughness: isHub ? 1.4 : 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    borderPaths = generator.toPaths(hexShape);
    backingElement = (
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  } else if (shape === "funnel") {
    const inset = width * 0.20;
    const pts = [
      [left, top],
      [left + width, top],
      [left + width - inset, top + height],
      [left + inset, top + height]
    ];
    const funnelShape = generator.polygon(pts, {
      seed: nodeSeed,
      roughness: isHub ? 1.4 : 1.1,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    borderPaths = generator.toPaths(funnelShape);
    backingElement = (
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  } else if (shape === "cloud") {
    const b = top + height;
    const r = left + width;
    const cloudD = `M ${left + 40} ${b - 12}
      C ${left - 8} ${b - 12}, ${left - 8} ${top + height * 0.52}, ${left + 22} ${top + height * 0.44}
      C ${left + 10} ${top + 14}, ${left + width * 0.36} ${top + 4}, ${left + width * 0.48} ${top + 18}
      C ${left + width * 0.60} ${top + 2}, ${r - 20} ${top + 16}, ${r - 14} ${top + height * 0.44}
      C ${r + 14} ${top + height * 0.52}, ${r + 14} ${b - 12}, ${r - 35} ${b - 12}
      Z`;
    const cloudShape = generator.path(cloudD, {
      seed: nodeSeed,
      roughness: 1.4,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    borderPaths = generator.toPaths(cloudShape);
    backingElement = (
      <path
        d={cloudD}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  } else {
    // Default: rounded rectangle
    const rectShape = generator.rectangle(left, top, width, height, {
      seed: nodeSeed + 10,
      roughness: isHub ? 1.4 : 1.1,
      bowing: 1.0,
      stroke: strokeColor,
      strokeWidth: isHub ? 3.4 : 2.6,
      fill: "none"
    });
    borderPaths = generator.toPaths(rectShape);
    backingElement = (
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={16}
        fill={solidBg}
        stroke={status === "active" ? "#ff7700" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={status === "active" ? 2.5 : 1}
        opacity={textOpacity}
      />
    );
  }

  const wiggleOffset = Math.sin(frame * 0.2) * 2;

  const titleSize = width < 300 ? "23px" : width < 370 ? "27px" : isHub ? "33px" : "29px";
  const subSize = width < 300 ? "16px" : width < 370 ? "18px" : "21px";

  return (
    <g>
      {/* 1. Solid dark card backing for 100% text contrast and clean readability */}
      {backingElement}

      {/* 2. Hand-drawn sketchy hollow border */}
      <AnimatedRoughPath
        pathData={borderPaths}
        strokeColor={strokeColor}
        strokeWidth={isHub ? 3.6 : 2.8}
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
            padding: "8px 16px",
            opacity: textOpacity,
            fontFamily: primaryFont.fontFamily,
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
                marginBottom: "5px",
                textTransform: "uppercase"
              }}
            >
              ★ CENTRAL SERVER
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: subLabel ? "4px" : "0px"
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: width < 300 ? "32px" : "38px",
                height: width < 300 ? "32px" : "38px",
                borderRadius: "10px",
                background: status === "active" ? "rgba(255, 119, 0, 0.25)" : "rgba(255, 255, 255, 0.07)",
                border: status === "active" ? "1.5px solid #ff7700" : "1px solid rgba(255, 255, 255, 0.12)",
                flexShrink: 0,
                boxShadow: status === "active" ? "0 0 14px rgba(255, 119, 0, 0.5)" : "none"
              }}
            >
              <DynamicIcon
                name={icon}
                label={label}
                size={width < 300 ? 18 : 22}
                color={status === "active" ? "#ffedd5" : strokeColor}
              />
            </div>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 800,
                color: scheme.text,
                lineHeight: 1.25,
                letterSpacing: "-0.3px",
                fontFamily: displayFont.fontFamily,
                textShadow: "0 2px 10px rgba(0,0,0,0.9)"
              }}
            >
              {label}
            </div>
          </div>
          {subLabel && (
            <div
              style={{
                fontSize: subSize,
                color: scheme.sub,
                marginTop: "5px",
                fontFamily: primaryFont.fontFamily,
                fontWeight: 700,
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
  duration = 20,
  labelT = 0.5
}) {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  // Clip endpoints to prevent arrow lines running deep inside boxes (deterministic seed)
  const arrowSeed = getSeed(`arrow-${x1.toFixed(0)}-${y1.toFixed(0)}-${x2.toFixed(0)}-${y2.toFixed(0)}`);
  const lineShape = generator.line(x1, y1, x2, y2, {
    seed: arrowSeed,
    roughness: 1.3,
    stroke: color,
    strokeWidth: 4.5
  });

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 26;
  const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

  const headShape1 = generator.line(x2, y2, hx1, hy1, { seed: arrowSeed + 1, roughness: 1.2, stroke: color, strokeWidth: 4.5 });
  const headShape2 = generator.line(x2, y2, hx2, hy2, { seed: arrowSeed + 2, roughness: 1.2, stroke: color, strokeWidth: 4.5 });

  const allPaths = [
    ...generator.toPaths(lineShape),
    ...generator.toPaths(headShape1),
    ...generator.toPaths(headShape2)
  ];

  const labelOpacity = interpolate(frame, [startFrame + duration * 0.65, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const mx = x1 + (x2 - x1) * labelT;
  const my = y1 + (y2 - y1) * labelT;

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
        strokeWidth={4.5}
        startFrame={startFrame}
        duration={duration}
      />

      {/* Floating animated pencil tip */}
      {showPen && (
        <foreignObject x={penX - 12} y={penY - 34} width={52} height={52}>
          <div style={{ fontSize: "32px", transform: "rotate(-40deg)" }}>
            ✏️
          </div>
        </foreignObject>
      )}

      {/* Handwritten sticky label on arrow */}
      {Boolean(
        label &&
          label.trim() !== "" &&
          label.toLowerCase() !== "none" &&
          label.toLowerCase() !== "null"
      ) && (
        <foreignObject
          x={mx - 200}
          y={my - 30}
          width={400}
          height={60}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: labelOpacity
            }}
          >
            <div
              style={{
                background: "#161622",
                border: `2px dashed ${color}`,
                borderRadius: "12px",
                padding: "6px 18px",
                fontSize: "21px",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: primaryFont.fontFamily,
                whiteSpace: "nowrap",
                letterSpacing: "0.2px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.95)"
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

/**
 * Hand-drawn bounding container box enclosing a group of related cluster nodes
 */
export function RoughContainer({
  x,
  y,
  width,
  height,
  label,
  startFrame = 0
}) {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const left = x;
  const top = y;
  const boxSeed = getSeed(`container-${label}`);
  const rectShape = generator.rectangle(left, top, width, height, {
    seed: boxSeed,
    roughness: 1.2,
    stroke: "rgba(255, 119, 0, 0.4)",
    strokeWidth: 2,
    fill: "none"
  });
  const paths = generator.toPaths(rectShape);

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={24}
        fill="rgba(255, 119, 0, 0.03)"
        stroke="rgba(255, 119, 0, 0.35)"
        strokeWidth={1.5}
        strokeDasharray="10,8"
      />
      <AnimatedRoughPath
        pathData={paths}
        strokeColor="rgba(255, 119, 0, 0.4)"
        strokeWidth={2}
        startFrame={startFrame}
        duration={14}
      />
      {label && (
        <foreignObject x={left + 24} y={top - 18} width={Math.max(260, width - 48)} height={40}>
          <div
            style={{
              display: "inline-block",
              background: "#181824",
              border: "1.5px solid rgba(255, 119, 0, 0.5)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "14px",
              fontWeight: 800,
              color: "#ffaa55",
              fontFamily: monoFont.fontFamily,
              letterSpacing: "0.8px",
              textTransform: "uppercase"
            }}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

