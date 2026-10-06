import React from "react";
import { ArrayRenderer } from "./renderers/ArrayRenderer.jsx";
import { TreeRenderer } from "./renderers/TreeRenderer.jsx";
import { HashMapRenderer } from "./renderers/HashMapRenderer.jsx";
import { ArchitectureRenderer } from "./renderers/ArchitectureRenderer.jsx";
import { TableRenderer } from "./renderers/TableRenderer.jsx";

export function VisualCanvas({ structures }) {
  const visibleStructures = structures.filter((s) => {
    if (s.type === "system_flow" || s.type === "network" || s.type === "graph") {
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
        flex: "0 0 58%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 40px 120px 40px",
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
          maxWidth: "1000px"
        }}
      >
        {visibleStructures.map((s, idx) => {
          if (s.type === "system_flow" || s.type === "network" || s.type === "graph") {
            return <ArchitectureRenderer key={idx} name={s.name} nodes={s.nodes} edges={s.edges} />;
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
