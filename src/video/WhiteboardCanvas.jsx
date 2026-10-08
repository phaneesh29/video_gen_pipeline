import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoughBoxNode, RoughArrow, RoughContainer } from "./RoughShapes.jsx";
import { DynamicIcon } from "./DynamicIcon.jsx";
import { primaryFont, displayFont, monoFont } from "./fonts.js";

/**
 * Universal, generic layout engine that computes spacious, collision-free
 * coordinates and proportional card sizes for ANY graph or system architecture.
 */
function computeGenericLayout(nodes, edges, isVertical, width, height, hasTopGallery = false) {
  const positions = new Map();
  const nodeSizes = new Map();
  const total = nodes.length;

  if (total === 0) return { positions, nodeSizes };

  const cx = width / 2;
  const cy = isVertical ? (hasTopGallery ? 1220 : 900) : height / 2;

  const isHubNode = (n) => {
    const s = (n.id + " " + n.label).toLowerCase();
    return s.includes("server") || s.includes("hub") || s.includes("gateway") || s.includes("broker") || s.includes("origin") || s.includes("router");
  };

  // 1. First, check if directed graph edges can establish topological layers
  let tiers = [];
  const hasEdges = Array.isArray(edges) && edges.length > 0;

  if (hasEdges) {
    const adj = new Map();
    const inDegree = new Map();
    nodes.forEach((n) => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    edges.forEach((e) => {
      if (adj.has(e.from) && adj.has(e.to)) {
        adj.get(e.from).push(e.to);
        inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
      }
    });

    const depths = new Map();
    nodes.forEach((n) => depths.set(n.id, 0));

    // Start with roots (inDegree === 0)
    const queue = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
    const visited = new Set();

    while (queue.length > 0) {
      const u = queue.shift();
      visited.add(u);
      const uDepth = depths.get(u) || 0;
      const neighbors = adj.get(u) || [];
      for (const v of neighbors) {
        if ((depths.get(v) || 0) < uDepth + 1) {
          depths.set(v, uDepth + 1);
        }
        if (!visited.has(v) && !queue.includes(v)) {
          queue.push(v);
        }
      }
    }

    const maxDepth = Math.max(...Array.from(depths.values()), 0);
    if (maxDepth > 0) {
      const depthGroups = Array.from({ length: maxDepth + 1 }, () => []);
      nodes.forEach((n) => {
        const d = depths.get(n.id) || 0;
        depthGroups[d].push(n);
      });
      tiers = depthGroups.filter((g) => g.length > 0);
    }
  }

  // 2. If no edge-based layers found, fallback to semantic role matching
  if (tiers.length <= 1) {
    const isSource = (n) => {
      const s = (n.id + " " + n.label).toLowerCase();
      return s.includes("client") || s.includes("publisher") || s.includes("browser") || s.includes("sender") || s.includes("user") || s.includes("host") || s.includes("broadcaster") || s.includes("ingest");
    };
    const isHub = (n) => {
      const s = (n.id + " " + n.label).toLowerCase();
      return s.includes("server") || s.includes("hub") || s.includes("gateway") || s.includes("broker") || s.includes("origin") || s.includes("router") || s.includes("switch");
    };
    const isIntermediary = (n) => {
      const s = (n.id + " " + n.label).toLowerCase();
      return s.includes("cdn") || s.includes("edge") || s.includes("cache") || s.includes("proxy") || s.includes("relay") || s.includes("worker") || s.includes("transcoder") || s.includes("mesh") || s.includes("cluster");
    };
    const isTarget = (n) => {
      const s = (n.id + " " + n.label).toLowerCase();
      return s.includes("viewer") || s.includes("sub") || s.includes("consumer") || s.includes("db") || s.includes("database") || s.includes("sink") || s.includes("storage") || s.includes("checkpoint");
    };

    const sources = [];
    const hubs = [];
    const intermediaries = [];
    const targets = [];
    const others = [];

    nodes.forEach((n) => {
      if (isHub(n)) hubs.push(n);
      else if (isSource(n)) sources.push(n);
      else if (isIntermediary(n)) intermediaries.push(n);
      else if (isTarget(n)) targets.push(n);
      else others.push(n);
    });

    const roleTiers = [];
    if (sources.length > 0) roleTiers.push(sources);
    if (hubs.length > 0) roleTiers.push(hubs);
    if (intermediaries.length > 0) roleTiers.push(intermediaries);
    if (targets.length > 0) roleTiers.push(targets);
    if (others.length > 0) roleTiers.push(others);

    if (roleTiers.length > 1) {
      tiers = roleTiers;
    } else {
      // Balanced fallback by node count (e.g. 2x2 grid for 4 nodes)
      if (total === 1) tiers = [[nodes[0]]];
      else if (total === 2) tiers = [[nodes[0]], [nodes[1]]];
      else if (total === 3) tiers = [[nodes[0]], [nodes[1]], [nodes[2]]];
      else if (total === 4) tiers = [[nodes[0], nodes[1]], [nodes[2], nodes[3]]];
      else if (total === 6) tiers = [[nodes[0], nodes[1], nodes[2]], [nodes[3], nodes[4], nodes[5]]];
      else tiers = [nodes]; // Circular mesh
    }
  }

  // Remove empty tiers
  tiers = tiers.filter((t) => t.length > 0);

  if (isVertical) {
    // 9:16 Vertical Screen (1080 x 1920)
    // Generous vertical range: 360px (top) to 1480px (bottom)
    if (tiers.length === 1 && total > 4) {
      // Circular ring / mesh
      const rx = 360;
      const ry = 460;
      nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        positions.set(node.id, { x, y });
        nodeSizes.set(node.id, { width: 280, height: 110, isHub: isHubNode(node) });
      });
      return { positions, nodeSizes };
    }

    // Determine Y coordinates for each tier with balanced vertical distribution
    let tierYs = [];
    if (hasTopGallery) {
      if (tiers.length === 1) {
        tierYs = [1180];
      } else if (tiers.length === 2) {
        tierYs = [960, 1380];
      } else if (tiers.length === 3) {
        tierYs = [880, 1180, 1480];
      } else {
        const startY = 840;
        const endY = 1520;
        const step = (endY - startY) / (tiers.length - 1);
        tierYs = tiers.map((_, i) => startY + i * step);
      }
    } else {
      if (tiers.length === 1) {
        tierYs = [cy];
      } else if (tiers.length === 2) {
        // 2 tiers (e.g. Client & Server): Balanced ~680px vertical space
        tierYs = [560, 1260];
      } else if (tiers.length === 3) {
        // 3 tiers: Balanced spacing
        tierYs = [420, 920, 1420];
      } else {
        // 4+ tiers
        const startY = 320;
        const endY = 1500;
        const step = (endY - startY) / (tiers.length - 1);
        tierYs = tiers.map((_, i) => startY + i * step);
      }
    }

    tiers.forEach((tierNodes, tierIdx) => {
      const ty = tierYs[tierIdx];
      const count = tierNodes.length;

      tierNodes.forEach((node, nodeIdx) => {
        let tx = cx;
        let nodeY = ty;
        let cardW = 380;
        let cardH = 140;

        if (count === 1) {
          tx = cx;
          cardW = isHubNode(node) ? 460 : 420;
          cardH = isHubNode(node) ? 165 : 150;
        } else if (count === 2) {
          tx = nodeIdx === 0 ? cx - 260 : cx + 260;
          cardW = 360;
          cardH = 145;
        } else if (count === 3) {
          tx = nodeIdx === 0 ? cx - 340 : nodeIdx === 1 ? cx : cx + 340;
          cardW = 300;
          cardH = 135;
        } else {
          // Wrap into 2 sub-rows of at most 3 cards so they never collide or squash
          const perRow = Math.ceil(count / 2);
          const rowIdx = Math.floor(nodeIdx / perRow);
          const colIdx = nodeIdx % perRow;
          const itemsInThisRow = rowIdx === 0 ? perRow : count - perRow;
          nodeY = ty + (rowIdx === 0 ? -65 : 65);

          if (itemsInThisRow === 1) {
            tx = cx;
            cardW = 280;
          } else if (itemsInThisRow === 2) {
            tx = colIdx === 0 ? cx - 240 : cx + 240;
            cardW = 280;
          } else {
            tx = colIdx === 0 ? cx - 330 : colIdx === 1 ? cx : cx + 330;
            cardW = 260;
          }
          cardH = 105;
        }

        const hasNodeImage = Boolean(node.imageSrc);
        if (hasNodeImage) {
          cardH = Math.max(cardH, count <= 2 ? 230 : 200);
          cardW = Math.max(cardW, count === 1 ? 480 : count === 2 ? 410 : 340);
        }

        if (node.shape === "cylinder") {
          cardH = Math.max(cardH, 160);
          cardW = Math.max(cardW, 400);
        } else if (node.shape === "cloud") {
          cardH = Math.max(cardH, 155);
          cardW = Math.max(cardW, 420);
        } else if (node.shape === "diamond") {
          cardH = Math.max(cardH, 155);
          cardW = Math.max(cardW, 440);
        }

        positions.set(node.id, { x: tx, y: nodeY });
        nodeSizes.set(node.id, { width: cardW, height: cardH, isHub: isHubNode(node) });
      });
    });
  } else {
    // 16:9 Landscape Screen (1920 x 1080)
    if (tiers.length === 1 && total > 4) {
      const rx = 560;
      const ry = 260;
      nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        positions.set(node.id, { x, y });
        nodeSizes.set(node.id, { width: 280, height: 110, isHub: isHub(node) });
      });
      return { positions, nodeSizes };
    }

    let tierXs = [];
    if (tiers.length === 1) {
      tierXs = [cx];
    } else if (tiers.length === 2) {
      // 2 tiers (Client & Server): 960px horizontal breathing space!
      tierXs = [460, 1460];
    } else if (tiers.length === 3) {
      tierXs = [340, 960, 1580];
    } else {
      const startX = 280;
      const endX = 1640;
      const step = (endX - startX) / (tiers.length - 1);
      tierXs = tiers.map((_, i) => startX + i * step);
    }

    tiers.forEach((tierNodes, tierIdx) => {
      const tx = tierXs[tierIdx];
      const count = tierNodes.length;

      tierNodes.forEach((node, nodeIdx) => {
        let ty = cy;
        let cardW = 360;
        let cardH = 140;

        if (count === 1) {
          ty = cy;
          cardW = isHubNode(node) ? 420 : 360;
          cardH = isHubNode(node) ? 150 : 140;
        } else if (count === 2) {
          ty = nodeIdx === 0 ? cy - 180 : cy + 180;
          cardW = 320;
          cardH = 125;
        } else if (count === 3) {
          ty = nodeIdx === 0 ? cy - 230 : nodeIdx === 1 ? cy : cy + 230;
          cardW = 280;
          cardH = 115;
        } else {
          const spread = height - 260;
          ty = 130 + (nodeIdx * spread) / (count - 1);
          cardW = 260;
          cardH = 110;
        }

        const hasNodeImage = Boolean(node.imageSrc);
        if (hasNodeImage) {
          cardH = Math.max(cardH, count <= 2 ? 185 : 160);
          cardW = Math.max(cardW, count === 1 ? 440 : 350);
        }

        if (node.shape === "cylinder") {
          cardH = Math.max(cardH, 145);
          cardW = Math.max(cardW, 360);
        } else if (node.shape === "cloud") {
          cardH = Math.max(cardH, 140);
          cardW = Math.max(cardW, 380);
        } else if (node.shape === "diamond") {
          cardH = Math.max(cardH, 145);
          cardW = Math.max(cardW, 400);
        }

        positions.set(node.id, { x: tx, y: ty });
        nodeSizes.set(node.id, { width: cardW, height: cardH, isHub: isHubNode(node) });
      });
    });
  }

  return { positions, nodeSizes };
}

/**
 * Mathematically computes the exact distance from node center to outer rectangle boundary
 * along direction angle to ensure arrows terminate cleanly outside cards.
 */
function getBoundaryOffset(w, h, dx, dy, shape = "rectangle") {
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cos = Math.abs(dx / len);
  const sin = Math.abs(dy / len);

  const halfW = w / 2;
  const halfH = h / 2;

  if (shape === "diamond") {
    const denom = (cos / halfW) + (sin / halfH) || 1;
    return (1 / denom) + 14;
  }

  let offset = halfH + 16;
  if (cos > 0.001 && sin > 0.001) {
    offset = Math.min(halfW / cos, halfH / sin) + 16;
  } else if (cos > 0.001) {
    offset = halfW + 16;
  }
  return offset;
}

function ImageGalleryOverlay({ items = [], isVertical = false, isCompact = false }) {
  const frame = useCurrentFrame();
  if (!items || items.length === 0) return null;

  const count = items.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical && !isCompact ? (count <= 2 ? "column" : "row") : "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? (isCompact ? "18px" : "28px") : "28px",
        width: "100%",
        maxWidth: isVertical ? (isCompact ? "1020px" : "960px") : "1600px",
        margin: "0 auto",
        padding: "10px",
        boxSizing: "border-box"
      }}
    >
      {items.map((item, idx) => {
        const startFrame = idx * 22;
        const enterProgress = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        });

        const isActive = frame >= startFrame && frame < startFrame + 60;
        const bounce = Math.sin(frame * 0.15 + idx) * 3;

        let cardWidth = isVertical
          ? isCompact
            ? (count === 1 ? "680px" : count === 2 ? "480px" : "320px")
            : (count === 1 ? "820px" : count === 2 ? "780px" : "440px")
          : (count === 1 ? "700px" : count === 2 ? "520px" : "380px");

        let imgHeight = isVertical
          ? isCompact
            ? (count <= 2 ? "210px" : "165px")
            : (count <= 2 ? "290px" : "230px")
          : (count <= 2 ? "250px" : "200px");

        return (
          <div
            key={idx}
            style={{
              width: cardWidth,
              padding: isCompact ? "16px 18px" : "24px 28px",
              background: isActive ? "rgba(28, 20, 18, 0.95)" : "rgba(18, 18, 28, 0.92)",
              border: isActive ? "3px solid #ff7700" : "2px solid rgba(255, 119, 0, 0.4)",
              borderRadius: "24px",
              boxShadow: isActive
                ? "0 16px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 119, 0, 0.45)"
                : "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(255, 119, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${0.88 + 0.12 * enterProgress}) translateY(${(1 - enterProgress) * 25 + bounce}px)`,
              opacity: enterProgress,
              boxSizing: "border-box"
            }}
          >
            {/* Tag Badge */}
            <div
              style={{
                alignSelf: "flex-start",
                fontSize: isCompact ? "12px" : "14px",
                fontFamily: monoFont.fontFamily,
                fontWeight: 800,
                color: isActive ? "#ffedd5" : "#38bdf8",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                marginBottom: "8px"
              }}
            >
              ★ {item.isTech ? "TECH COMPONENT" : "HARDWARE UNIT"} #{idx + 1}
            </div>

            {/* Big Web Image */}
            <div
              style={{
                width: "100%",
                height: imgHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: item.imageSrc
                  ? "transparent"
                  : "rgba(10, 10, 18, 0.85)",
                borderRadius: "18px",
                padding: "6px",
                boxSizing: "border-box",
                overflow: "visible"
              }}
            >
              {item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  style={{
                    maxWidth: "96%",
                    maxHeight: "96%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 16px rgba(255, 119, 0, 0.25))"
                  }}
                />
              ) : (
                <DynamicIcon
                  name={item.title}
                  label={item.title}
                  size={isCompact ? 54 : 76}
                  color="#fbbf24"
                />
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: isCompact ? "24px" : "32px",
                fontWeight: 900,
                fontFamily: displayFont.fontFamily,
                color: "#ffffff",
                marginTop: "12px",
                textAlign: "center",
                textShadow: "0 2px 12px rgba(0,0,0,0.9)",
                lineHeight: 1.2
              }}
            >
              {item.title}
            </div>

            {/* Subtitle / Specs */}
            {item.subtitle && (
              <div
                style={{
                  fontSize: isCompact ? "16px" : "20px",
                  fontWeight: 700,
                  fontFamily: primaryFont.fontFamily,
                  color: "#fbbf24",
                  marginTop: "5px",
                  textAlign: "center"
                }}
              >
                {item.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WhiteboardCanvas({ structures = [], gallery = [], isVertical = false, fullWidth = false }) {
  const frame = useCurrentFrame();

  const width = isVertical ? 1080 : fullWidth ? 1920 : 1100;
  const height = isVertical ? 1920 : fullWidth ? 1080 : 700;

  const structure = structures[0] || { name: "Whiteboard Diagram", nodes: [], edges: [], elements: [], entries: [] };
  const nodes = structure.nodes || [];
  const edges = structure.edges || [];
  const elements = structure.elements || [];
  const entries = structure.entries || [];

  // Extract gallery items
  const galleryItems = Array.isArray(gallery) && gallery.length > 0 ? [...gallery] : [];
  if (structure.type === "image_gallery" && galleryItems.length === 0 && nodes.length > 0) {
    nodes.forEach((n) => {
      galleryItems.push({
        title: n.label,
        subtitle: n.subLabel,
        imagePrompt: n.imagePrompt || n.label,
        isTech: Boolean(n.isTech),
        imageSrc: n.imageSrc
      });
    });
  }

  const hasGallery = galleryItems.length > 0;
  const hasNodesOrEdges = (nodes.length > 0 || edges.length > 0) && structure.type !== "image_gallery";
  const isCombinedMode = hasGallery && hasNodesOrEdges;

  const { positions, nodeSizes } = computeGenericLayout(
    nodes,
    edges,
    isVertical,
    width,
    height,
    isCombinedMode
  );

  const findPos = (id) => {
    if (!id) return null;
    if (positions.has(id)) return positions.get(id);
    const target = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of positions.entries()) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === target) return v;
    }
    return null;
  };

  const findSize = (id) => {
    if (!id) return { width: 340, height: 130, isHub: false };
    if (nodeSizes.has(id)) return nodeSizes.get(id);
    const target = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of nodeSizes.entries()) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === target) return v;
    }
    return { width: 340, height: 130, isHub: false };
  };

  const hasElements = elements.length > 0;
  const hasEntries = entries.length > 0;
  const isDataMode = hasElements || hasEntries;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        zIndex: 2
      }}
    >
      {/* Floating Whiteboard Canvas Badge */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "90px" : "36px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: isVertical ? "12px 36px" : "8px 24px",
          background: "rgba(18, 18, 24, 0.92)",
          border: "2px solid rgba(251, 191, 36, 0.45)",
          borderRadius: "16px",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.85)",
          zIndex: 15
        }}
      >
        <span style={{ fontSize: isVertical ? "26px" : "20px" }}>✎</span>
        <div
          style={{
            fontSize: isVertical ? "26px" : "18px",
            fontWeight: 800,
            color: "#fbbf24",
            letterSpacing: "1px",
            fontFamily: displayFont.fontFamily,
            textTransform: "uppercase"
          }}
        >
          {structure.name || "Whiteboard Architecture"}
        </div>
      </div>

      {/* 0. Image Gallery View (Array of Big Images) */}
      {hasGallery && (
        <div
          style={{
            position: "absolute",
            top: isCombinedMode ? (isVertical ? "160px" : "60px") : "50%",
            left: "50%",
            transform: isCombinedMode ? "translateX(-50%)" : "translate(-50%, -50%)",
            width: "100%",
            zIndex: 14
          }}
        >
          <ImageGalleryOverlay
            items={galleryItems}
            isVertical={isVertical}
            isCompact={isCombinedMode}
          />
        </div>
      )}

      {/* 1. Full-Screen Architecture SVG Board */}
      {!isDataMode && hasNodesOrEdges && (
        <svg
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "visible"
          }}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Bounding Cluster Container (if containerLabel is specified) */}
          {structure.containerLabel && nodes.length > 1 && (() => {
            const allXs = nodes.map((n) => (positions.get(n.id) || { x: width / 2 }).x);
            const allYs = nodes.map((n) => (positions.get(n.id) || { y: height / 2 }).y);
            const allWs = nodes.map((n) => (nodeSizes.get(n.id) || { width: 360 }).width);
            const allHs = nodes.map((n) => (nodeSizes.get(n.id) || { height: 140 }).height);

            const minX = Math.min(...allXs.map((x, i) => x - allWs[i] / 2)) - 32;
            const maxX = Math.max(...allXs.map((x, i) => x + allWs[i] / 2)) + 32;
            const minY = Math.min(...allYs.map((y, i) => y - allHs[i] / 2)) - 42;
            const maxY = Math.max(...allYs.map((y, i) => y + allHs[i] / 2)) + 32;

            return (
              <RoughContainer
                key="cluster-container"
                x={minX}
                y={minY}
                width={maxX - minX}
                height={maxY - minY}
                label={structure.containerLabel}
                startFrame={2}
              />
            );
          })()}

          {edges.map((edge, idx) => {
            const p1 = findPos(edge.from);
            const p2 = findPos(edge.to);
            if (!p1 || !p2) return null;

            const size1 = findSize(edge.from);
            const size2 = findSize(edge.to);

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;

            // Group all edges connecting this node pair (unordered)
            const pairKey = [edge.from, edge.to].sort().join("___");
            const samePairEdges = edges.filter(
              (other) => [other.from, other.to].sort().join("___") === pairKey
            );
            const sameDirEdges = samePairEdges.filter(
              (other) => other.from === edge.from && other.to === edge.to
            );
            const oppDirEdges = samePairEdges.filter(
              (other) => other.from === edge.to && other.to === edge.from
            );

            const hasOpposite = oppDirEdges.length > 0;
            const dirIndex = sameDirEdges.indexOf(edge);

            // Compute maximum safe lateral corridor so arrows stay cleanly rooted in cards
            const extent1 = Math.abs(nx) * (size1.width / 2) + Math.abs(ny) * (size1.height / 2);
            const extent2 = Math.abs(nx) * (size2.width / 2) + Math.abs(ny) * (size2.height / 2);
            const maxCardExtent = Math.min(extent1, extent2);
            const maxSafeOffset = maxCardExtent * 0.58;

            let laneOffset = 0;
            let labelT = 0.5;

            if (hasOpposite) {
              // Bidirectional highway: separate directions by a generous corridor (170px+ apart)
              const desiredOffset = isVertical ? 86 : 56;
              const baseLane = Math.max(48, Math.min(desiredOffset, maxSafeOffset));
              laneOffset = baseLane + dirIndex * 26;

              if (sameDirEdges.length === 1) {
                labelT = 0.28;
              } else {
                labelT = 0.22 + dirIndex * 0.18;
              }
            } else if (sameDirEdges.length > 1) {
              const count = sameDirEdges.length;
              const spread = Math.min(maxSafeOffset * 1.4, (count - 1) * (isVertical ? 60 : 44));
              const startOffset = -spread / 2;
              laneOffset = count > 1 ? startOffset + (dirIndex * spread) / (count - 1) : 0;
              labelT = 0.30 + (dirIndex / (count - 1 || 1)) * 0.40;
            } else {
              const fanOutEdges = edges.filter((e) => e.from === edge.from);
              if (fanOutEdges.length > 1) {
                const fanIndex = fanOutEdges.indexOf(edge);
                const fanPattern = [0.36, 0.64, 0.48, 0.72, 0.30];
                labelT = fanPattern[fanIndex % fanPattern.length];
              } else {
                labelT = 0.5;
              }
              laneOffset = 0;
            }

            const node1 = nodes.find((n) => n.id === edge.from);
            const node2 = nodes.find((n) => n.id === edge.to);
            const pad1 = getBoundaryOffset(size1.width, size1.height, dx, dy, node1?.shape || "rectangle");
            const pad2 = getBoundaryOffset(size2.width, size2.height, dx, dy, node2?.shape || "rectangle");

            const startX = p1.x + (dx / len) * pad1 + nx * laneOffset;
            const startY = p1.y + (dy / len) * pad1 + ny * laneOffset;
            const endX = p2.x - (dx / len) * pad2 + nx * laneOffset;
            const endY = p2.y - (dy / len) * pad2 + ny * laneOffset;

            const isActive = edge.status === "active" || edge.status === "traversed";
            const arrowColor = isActive ? "#ff7700" : "#64748b";
            const archiBaseDelay = isCombinedMode ? 38 : 0;
            const startFrame = archiBaseDelay + nodes.length * 5 + idx * 6;

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
                labelT={labelT}
              />
            );
          })}

          {nodes.map((node, i) => {
            const pos = positions.get(node.id) || { x: width / 2, y: height / 2 };
            const size = nodeSizes.get(node.id) || { width: 360, height: 140, isHub: false };
            const archiBaseDelay = isCombinedMode ? 38 : 0;
            const startFrame = archiBaseDelay + i * 5;

            return (
              <RoughBoxNode
                key={node.id}
                id={node.id}
                label={node.label}
                subLabel={node.subLabel}
                icon={node.icon}
                imageSrc={node.imageSrc}
                isTech={Boolean(node.isTech)}
                x={pos.x}
                y={pos.y}
                width={size.width}
                height={size.height}
                shape={node.shape || "rectangle"}
                status={node.status}
                startFrame={startFrame}
                isHub={size.isHub}
              />
            );
          })}
        </svg>
      )}

      {/* 2. Array / Elements Sketch View */}
      {hasElements && (
        <div
          style={{
            position: "absolute",
            top: hasElements && hasEntries ? (isVertical ? "33%" : "30%") : "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: isVertical ? "32px" : "28px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: isVertical ? "940px" : "90%",
            maxWidth: "1400px"
          }}
        >
          {elements.map((el, idx) => {
            const isHigh = !!el.highlight;
            const bounce = Math.sin(frame * 0.25) * 6;
            const cardWidth = isVertical ? (elements.length <= 2 ? "860px" : "420px") : "280px";
            const cardHeight = isVertical ? "220px" : "190px";

            return (
              <div
                key={idx}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  border: isHigh ? "4px solid #ff7700" : "3px dashed rgba(255, 255, 255, 0.4)",
                  borderRadius: "24px",
                  background: isHigh ? "rgba(255, 119, 0, 0.25)" : "#181824",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 24px",
                  boxSizing: "border-box",
                  position: "relative",
                  boxShadow: isHigh ? "0 0 35px rgba(255, 107, 0, 0.65)" : "0 8px 30px rgba(0, 0, 0, 0.5)"
                }}
              >
                {/* Index badge at top */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "20px",
                    fontSize: isVertical ? "20px" : "16px",
                    color: isHigh ? "#ffedd5" : "#94a3b8",
                    fontFamily: monoFont.fontFamily,
                    fontWeight: 700
                  }}
                >
                  [{idx}]
                </div>

                {/* Big bold value text */}
                <div
                  style={{
                    fontSize: isVertical ? "46px" : "38px",
                    fontWeight: 900,
                    color: isHigh ? "#ffffff" : "#f1f5f9",
                    fontFamily: displayFont.fontFamily,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    marginTop: el.pointerLabel ? "8px" : "0px",
                    textShadow: isHigh ? "0 0 16px rgba(255, 119, 0, 0.7)" : "none"
                  }}
                >
                  {el.value}
                </div>

                {/* Active pointer label badge */}
                {el.pointerLabel && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "12px",
                      transform: `translateY(${bounce}px)`
                    }}
                  >
                    <span style={{ color: "#ff7700", fontSize: isVertical ? "22px" : "18px" }}>▲</span>
                    <span
                      style={{
                        fontSize: isVertical ? "22px" : "17px",
                        fontWeight: 800,
                        color: "#ffaa55",
                        fontFamily: primaryFont.fontFamily,
                        letterSpacing: "0.5px"
                      }}
                    >
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
        <div
          style={{
            position: "absolute",
            top: hasElements && hasEntries ? (isVertical ? "65%" : "66%") : "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            flexWrap: "wrap",
            gap: isVertical ? "24px" : "20px",
            justifyContent: "center",
            alignItems: "center",
            width: isVertical ? "920px" : "90%",
            maxWidth: "1400px"
          }}
        >
          {entries.map((entry, idx) => {
            const isHigh = !!entry.highlight;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isVertical ? "space-between" : "center",
                  width: isVertical ? "860px" : "auto",
                  gap: isVertical ? "24px" : "16px",
                  padding: isVertical ? "24px 44px" : "16px 32px",
                  background: isHigh ? "rgba(255, 119, 0, 0.25)" : "#181824",
                  border: isHigh ? "4px solid #ff7700" : "2.5px dashed rgba(255, 255, 255, 0.35)",
                  borderRadius: "22px",
                  fontFamily: primaryFont.fontFamily,
                  color: "#ffffff",
                  boxShadow: isHigh ? "0 0 35px rgba(255, 119, 0, 0.6)" : "0 8px 30px rgba(0, 0, 0, 0.5)"
                }}
              >
                <span
                  style={{
                    color: "#fbbf24",
                    fontWeight: 900,
                    fontSize: isVertical ? "36px" : "26px",
                    fontFamily: displayFont.fontFamily
                  }}
                >
                  {entry.key}
                </span>
                <span style={{ color: "#ff7700", fontSize: isVertical ? "32px" : "22px" }}>➔</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: isVertical ? "30px" : "22px",
                    textAlign: isVertical ? "right" : "left"
                  }}
                >
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
