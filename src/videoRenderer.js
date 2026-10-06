import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

export async function renderExplainerVideo(enrichedStoryboard, outputFilePath) {
  const entryPoint = path.resolve("./src/video/index.jsx");
  const publicDir = path.resolve("./public");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const bundleLocation = await bundle({
    entryPoint,
    publicDir
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

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputFilePath,
    inputProps: {
      storyboard: enrichedStoryboard
    },
    onProgress: ({ renderedFrames, totalFrames }) => {
      const pct = Math.round((renderedFrames / totalFrames) * 100);
      process.stdout.write(`\r      Rendering frames: ${renderedFrames} / ${totalFrames} (${pct}%)`);
    }
  });

  process.stdout.write("\n");
  return outputFilePath;
}
