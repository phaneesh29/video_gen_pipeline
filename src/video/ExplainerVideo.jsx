import React from "react";
import { Series, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
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

export function ExplainerVideo({ storyboard, branding }) {
  const { fps } = useVideoConfig();

  if (!storyboard || !storyboard.scenes) {
    return <div style={{ background: "#121217", width: "100%", height: "100%" }} />;
  }

  const { codeTitle, codeLanguage, codeLines, scenes, aspectRatio } = storyboard;
  const isVertical = aspectRatio === "9:16";
  const hasCode = Array.isArray(codeLines) && codeLines.length > 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#121217",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <AmbientBackground isVertical={isVertical} />

      {/* Persistent Top-Left Logo Watermark */}
      {branding?.logoSrc && (
        <div
          style={{
            position: "absolute",
            top: isVertical ? "48px" : "32px",
            left: isVertical ? "48px" : "40px",
            zIndex: 40,
            display: "flex",
            alignItems: "center"
          }}
        >
          <img
            src={branding.logoSrc}
            alt="Logo"
            style={{
              width: isVertical ? "74px" : "64px",
              height: isVertical ? "74px" : "64px",
              borderRadius: "16px",
              border: "2px solid rgba(255, 119, 0, 0.45)",
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.7), 0 0 12px rgba(255, 119, 0, 0.3)",
              objectFit: "cover"
            }}
          />
        </div>
      )}

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
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
