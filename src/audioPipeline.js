import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import { generateSpeech } from "./ttsEngine.js";
import { config } from "./config.js";

export async function processStoryboardAudio(storyboard, outputDir = path.join(config.TEMP_DIR, "audio")) {
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
    const durationInSeconds = meta.format.duration || 1;
    const holdBufferFrames = Math.round(config.VIDEO_FPS * 0.5);
    const durationInFrames = Math.ceil(durationInSeconds * config.VIDEO_FPS) + holdBufferFrames;

    const audioBase64 = fs.readFileSync(audioPath).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    totalSeconds += durationInSeconds;
    totalFrames += durationInFrames;

    enrichedScenes.push({
      ...scene,
      audioPath,
      audioUrl,
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
