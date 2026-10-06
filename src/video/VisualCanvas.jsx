import React from "react";
import { ArrayRenderer } from "./renderers/ArrayRenderer.jsx";
import { TreeRenderer } from "./renderers/TreeRenderer.jsx";
import { HashMapRenderer } from "./renderers/HashMapRenderer.jsx";

export function VisualCanvas({ structures }) {
  const visibleStructures = structures.filter((s) => {
    if (s.type === "tree") return s.nodes && s.nodes.length > 0;
    if (s.type === "hashmap" || s.type === "variables") return s.entries && s.entries.length > 0;
    if (s.elements && s.elements.length === 0 && s.type !== "stack" && s.type !== "queue") return false;
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
        padding: "32px 48px",
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
          gap: "24px",
          width: "100%",
          maxWidth: "1000px"
        }}
      >
        {visibleStructures.map((s, idx) => {
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
