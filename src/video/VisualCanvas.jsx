import React from "react";
import { ArrayRenderer } from "./renderers/ArrayRenderer.jsx";
import { TreeRenderer } from "./renderers/TreeRenderer.jsx";
import { HashMapRenderer } from "./renderers/HashMapRenderer.jsx";

export function VisualCanvas({ structures, actionDescription }) {
  return (
    <div
      style={{
        flex: "0 0 58%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "28px 36px",
        background: "#0d1117",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
        {structures.map((s, idx) => {
          if (s.type === "tree") {
            return <TreeRenderer key={idx} name={s.name} nodes={s.nodes} edges={s.edges} />;
          }

          if (s.type === "hashmap" || s.type === "variables") {
            return <HashMapRenderer key={idx} name={s.name} entries={s.entries} type={s.type} />;
          }

          return <ArrayRenderer key={idx} name={s.name} elements={s.elements} type={s.type} />;
        })}
      </div>

      {actionDescription ? (
        <div
          style={{
            marginTop: "16px",
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(56, 139, 253, 0.1)",
            border: "1px solid rgba(88, 166, 255, 0.3)",
            padding: "8px 16px",
            borderRadius: "8px",
            color: "#58a6ff",
            fontSize: "15px",
            fontWeight: 600
          }}
        >
          <span style={{ fontSize: "16px" }}>⚡</span>
          <span>{actionDescription}</span>
        </div>
      ) : null}
    </div>
  );
}
