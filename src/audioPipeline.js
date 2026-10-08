import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import { generateSpeech } from "./ttsEngine.js";
import { config } from "./config.js";

export async function processStoryboardAudio(storyboard, outputDir = path.resolve("./temp")) {
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

    await generateSpeech(scene.narration, audioPath);
    console.log(`      🎙️ Scene ${i + 1} [${config.SARVAM_SPEAKER}]: "${scene.narration.slice(0, 42)}..."`);

    const meta = await parseFile(audioPath, { duration: true });
    const durationInSeconds = meta.format.duration || 2;
    const holdBufferFrames = 12;
    const durationInFrames = Math.ceil(durationInSeconds * config.VIDEO_FPS) + holdBufferFrames;

    totalSeconds += durationInFrames / config.VIDEO_FPS;
    totalFrames += durationInFrames;

    enrichedScenes.push({
      ...scene,
      audioPath,
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
