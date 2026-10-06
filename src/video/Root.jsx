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
        return {
          durationInFrames: total
        };
      }}
      defaultProps={{
        storyboard: null
      }}
    />
  );
}
