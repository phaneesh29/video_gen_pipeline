import React from "react";
import { Composition } from "remotion";
import { ExplainerVideo } from "./ExplainerVideo.jsx";

export function Root() {
  return (
    <Composition
      id="ExplainerVideo"
      component={ExplainerVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={({ props }) => {
        const total = props?.storyboard?.totalDurationInFrames || 300;
        const isVertical = props?.storyboard?.aspectRatio === "9:16";
        return {
          durationInFrames: total,
          width: isVertical ? 1080 : 1920,
          height: isVertical ? 1920 : 1080
        };
      }}
      defaultProps={{
        storyboard: null,
        branding: null
      }}
    />
  );
}
