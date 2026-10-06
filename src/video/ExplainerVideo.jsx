import React from "react";
import { Series, Audio, staticFile } from "remotion";
import { Header } from "./Header.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { VisualCanvas } from "./VisualCanvas.jsx";
import { Subtitles } from "./Subtitles.jsx";

export function ExplainerVideo({ storyboard }) {
  const { title, topic, complexity, pythonCode, scenes } = storyboard;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0d1117",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Header title={title} topic={topic} complexity={complexity} />

      <Series>
        {scenes.map((scene, idx) => {
          return (
            <Series.Sequence key={idx} durationInFrames={scene.durationInFrames}>
              {scene.audioUrl ? <Audio src={scene.audioUrl} /> : null}

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  width: "100%",
                  height: "calc(100% - 85px)",
                  position: "relative"
                }}
              >
                <VisualCanvas
                  structures={scene.visual.structures}
                  actionDescription={scene.visual.actionDescription}
                />
                <CodeEditor
                  codeLines={pythonCode}
                  activeLine={scene.visual.activeLine}
                />
                <Subtitles text={scene.narration} />
              </div>
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
}
