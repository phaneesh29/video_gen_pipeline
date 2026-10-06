import React from "react";
import { Series } from "remotion";
import { Header } from "./Header.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { VisualCanvas } from "./VisualCanvas.jsx";
import { Subtitles } from "./Subtitles.jsx";

export function ExplainerVideo({ storyboard }) {
  const { title, topic, category, badges, codeTitle, codeLanguage, codeLines, scenes } = storyboard;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#060608",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Header title={title} category={category} topic={topic} badges={badges} />

      <div style={{ flex: 1, position: "relative", width: "100%", overflow: "hidden" }}>
        <Series>
          {scenes.map((scene, idx) => {
            return (
              <Series.Sequence key={idx} durationInFrames={scene.durationInFrames}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    position: "relative"
                  }}
                >
                  <VisualCanvas
                    structures={scene.visual.structures}
                  />
                  <CodeEditor
                    codeLines={codeLines || []}
                    activeLine={scene.visual.activeLine}
                    codeTitle={codeTitle}
                    codeLanguage={codeLanguage}
                  />
                  <Subtitles text={scene.narration} />
                </div>
              </Series.Sequence>
            );
          })}
        </Series>
      </div>
    </div>
  );
}
