import React from "react";
import { ArrayRenderer } from "./renderers/ArrayRenderer.jsx";
import { TreeRenderer } from "./renderers/TreeRenderer.jsx";
import { HashMapRenderer } from "./renderers/HashMapRenderer.jsx";
import { ArchitectureRenderer } from "./renderers/ArchitectureRenderer.jsx";
import { StarNetworkRenderer } from "./renderers/StarNetworkRenderer.jsx";
import { MeshNetworkRenderer } from "./renderers/MeshNetworkRenderer.jsx";
import { RingRenderer } from "./renderers/RingRenderer.jsx";
import { TableRenderer } from "./renderers/TableRenderer.jsx";

function resolveArchitectureComponent(s) {
  if (s.type === "star_network") return StarNetworkRenderer;
  if (s.type === "mesh_network") return MeshNetworkRenderer;
  if (s.type === "ring") return RingRenderer;

  const combinedText = (s.name + " " + (s.nodes || []).map((n) => n.id + " " + n.label).join(" ")).toLowerCase();

  if (
    combinedText.includes("star") ||
    combinedText.includes("sfu") ||
    combinedText.includes("hub") ||
    combinedText.includes("selective forward")
  ) {
    return StarNetworkRenderer;
  }

  if (combinedText.includes("mesh") || combinedText.includes("p2p")) {
    return MeshNetworkRenderer;
  }

  if (combinedText.includes("ring") || combinedText.includes("consistent hash")) {
    return RingRenderer;
  }

  const nodes = s.nodes || [];
  const edges = s.edges || [];
  if (nodes.length >= 3) {
    const degreeMap = new Map();
    nodes.forEach((n) => degreeMap.set(n.id, 0));
    edges.forEach((e) => {
      degreeMap.set(e.from, (degreeMap.get(e.from) || 0) + 1);
      degreeMap.set(e.to, (degreeMap.get(e.to) || 0) + 1);
    });
    const maxDegree = Math.max(...Array.from(degreeMap.values()), 0);
    if (maxDegree >= 3 && maxDegree >= nodes.length - 2) {
      return StarNetworkRenderer;
    }
  }

  return ArchitectureRenderer;
}

export function VisualCanvas({ structures, fullWidth = false, isVertical = false }) {
  const visibleStructures = structures.filter((s) => {
    if (
      s.type === "system_flow" ||
      s.type === "network" ||
      s.type === "graph" ||
      s.type === "star_network" ||
      s.type === "mesh_network" ||
      s.type === "ring"
    ) {
      return s.nodes && s.nodes.length > 0;
    }
    if (s.type === "table") {
      return s.entries && s.entries.length > 0;
    }
    if (s.type === "tree") {
      return s.nodes && s.nodes.length > 0;
    }
    if (s.type === "hashmap" || s.type === "variables") {
      return s.entries && s.entries.length > 0;
    }
    if (s.elements && s.elements.length === 0 && s.type !== "stack" && s.type !== "queue") {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        flex: fullWidth ? "1 1 100%" : isVertical ? "0 0 50%" : "0 0 58%",
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "30px 24px 220px 24px" : "20px 40px 120px 40px",
        background: "#060608",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          width: "100%",
          maxWidth: fullWidth && !isVertical ? "1500px" : "1000px"
        }}
      >
        {visibleStructures.map((s, idx) => {
          if (
            s.type === "system_flow" ||
            s.type === "network" ||
            s.type === "graph" ||
            s.type === "star_network" ||
            s.type === "mesh_network" ||
            s.type === "ring"
          ) {
            const Component = resolveArchitectureComponent(s);
            return <Component key={idx} name={s.name} nodes={s.nodes} edges={s.edges} />;
          }

          if (s.type === "table") {
            return <TableRenderer key={idx} name={s.name} entries={s.entries} />;
          }

          if (s.type === "tree") {
            return <TreeRenderer key={idx} name={s.name} nodes={s.nodes} edges={s.edges} />;
          }

          if (s.type === "hashmap" || s.type === "variables") {
            return <HashMapRenderer key={idx} name={s.name} entries={s.entries} type={s.type} />;
          }

          return <ArrayRenderer key={idx} name={s.name} elements={s.elements} type={s.type} />;
        })}
      </div>
    </div>
  );
}
