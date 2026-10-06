import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

export async function renderExplainerVideo(enrichedStoryboard, outputFilePath) {
  const entryPoint = path.resolve("./src/video/index.jsx");

  const bundleLocation = await bundle({
    entryPoint
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ExplainerVideo",
    inputProps: {
      storyboard: enrichedStoryboard
    }
  });

  const outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const totalFrames = composition.durationInFrames;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    imageFormat: "jpeg",
    outputLocation: outputFilePath,
    inputProps: {
      storyboard: enrichedStoryboard
    },
    onProgress: ({ renderedFrames, progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r      Rendering frames: ${renderedFrames} / ${totalFrames} (${pct}%)`);
    }
  });

  process.stdout.write("\n");
  return outputFilePath;
}
