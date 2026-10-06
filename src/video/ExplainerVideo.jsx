import React from "react";
import { Series, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Header } from "./Header.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { WhiteboardCanvas } from "./WhiteboardCanvas.jsx";
import { Subtitles } from "./Subtitles.jsx";
import { AmbientBackground } from "./AmbientBackground.jsx";

function SceneWrapper({ scene, isVertical, hasCode, codeLines, codeTitle, codeLanguage }) {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 8], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const sceneScale = interpolate(frame, [0, 10], [0.985, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    output: "perceptual-scale",
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        width: "100%",
        height: "100%",
        position: "relative",
        opacity: sceneOpacity,
        transform: `scale(${sceneScale})`
      }}
    >
      <WhiteboardCanvas
        structures={scene.visual.structures}
        fullWidth={!hasCode}
        isVertical={isVertical}
      />
      {hasCode ? (
        <CodeEditor
          codeLines={codeLines || []}
          activeLine={scene.visual.activeLine}
          codeTitle={codeTitle}
          codeLanguage={codeLanguage}
          isVertical={isVertical}
        />
      ) : null}
      <Subtitles text={scene.narration} isVertical={isVertical} />
    </div>
  );
}

export function ExplainerVideo({ storyboard }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!storyboard || !storyboard.scenes) {
    return <div style={{ background: "#121217", width: "100%", height: "100%" }} />;
  }

  const { title, topic, category, badges, codeTitle, codeLanguage, codeLines, scenes, aspectRatio } = storyboard;
  const isVertical = aspectRatio === "9:16";
  const hasCode = Array.isArray(codeLines) && codeLines.length > 0;

  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  let accumulated = 0;
  let currentSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= accumulated && frame < accumulated + scenes[i].durationInFrames) {
      currentSceneIndex = i;
      break;
    }
    accumulated += scenes[i].durationInFrames;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#121217",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <AmbientBackground isVertical={isVertical} isWhiteboard={true} />

      <Header
        title={title}
        category={category}
        topic={topic}
        badges={badges}
        isVertical={isVertical}
        currentSceneIndex={currentSceneIndex}
        totalScenes={scenes.length}
        progress={progress}
      />

      <div style={{ flex: 1, position: "relative", width: "100%", overflow: "hidden", zIndex: 1 }}>
        <Series>
          {scenes.map((scene, idx) => (
            <Series.Sequence
              key={idx}
              durationInFrames={scene.durationInFrames}
              premountFor={fps}
            >
              <SceneWrapper
                scene={scene}
                isVertical={isVertical}
                hasCode={hasCode}
                codeLines={codeLines}
                codeTitle={codeTitle}
                codeLanguage={codeLanguage}
              />
            </Series.Sequence>
          ))}
        </Series>
      </div>
    </div>
  );
}
