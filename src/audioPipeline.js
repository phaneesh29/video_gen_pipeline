import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import { generateSpeech } from "./ttsEngine.js";
import { config } from "./config.js";

export async function processStoryboardAudio(storyboard, outputDir = path.resolve("./public/audio")) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const enrichedScenes = [];
  let totalFrames = 0;
  let totalSeconds = 0;

  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i];
    const fileName = `scene_${i + 1}_${scene.id}.mp3`;
    const audioPath = path.resolve(outputDir, fileName);

    await generateSpeech(scene.narration, audioPath, scene.expression);

    const meta = await parseFile(audioPath, { duration: true });
    const durationInSeconds = meta.format.duration || 2;
    const holdBufferFrames = 20;
    const durationInFrames = Math.ceil(durationInSeconds * config.VIDEO_FPS) + holdBufferFrames;

    totalSeconds += durationInSeconds + (holdBufferFrames / config.VIDEO_FPS);
    totalFrames += durationInFrames;

    enrichedScenes.push({
      ...scene,
      audioPath,
      audioStaticPath: `audio/${fileName}`,
      durationInSeconds,
      durationInFrames
    });
  }

  return {
    ...storyboard,
    scenes: enrichedScenes,
    totalDurationInSeconds: totalSeconds,
    totalDurationInFrames: totalFrames
  };
}
