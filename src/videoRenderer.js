import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

function loadAssetBase64(fileName) {
  const filePath = path.resolve("./assets", fileName);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(fileName).slice(1) || "png";
    const data = fs.readFileSync(filePath).toString("base64");
    return `data:image/${ext};base64,${data}`;
  }
  return null;
}

export async function renderExplainerVideo(enrichedStoryboard, outputFilePath) {
  const entryPoint = path.resolve("./src/video/index.jsx");

  const bundleLocation = await bundle({
    entryPoint
  });

  const branding = {
    logoSrc: loadAssetBase64("logo.png")
  };

  const inputProps = {
    storyboard: enrichedStoryboard,
    branding
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ExplainerVideo",
    inputProps
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
    inputProps,
    onProgress: ({ renderedFrames, progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r      Rendering frames: ${renderedFrames} / ${totalFrames} (${pct}%)`);
    }
  });

  process.stdout.write("\n");
  return outputFilePath;
}
