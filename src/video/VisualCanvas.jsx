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
        padding: "32px 48px",
        background: "#060608",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
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
            marginTop: "20px",
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255, 107, 0, 0.12)",
            border: "1.5px solid rgba(255, 107, 0, 0.45)",
            boxShadow: "0 0 25px rgba(255, 107, 0, 0.25)",
            padding: "10px 22px",
            borderRadius: "10px",
            color: "#ffffff",
            fontSize: "17px",
            fontWeight: 700,
            letterSpacing: "0.2px"
          }}
        >
          <span style={{ fontSize: "20px", color: "#ff8533" }}>⚡</span>
          <span>{actionDescription}</span>
        </div>
      ) : null}
    </div>
  );
}
