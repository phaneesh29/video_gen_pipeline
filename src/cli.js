import path from "path";
import fs from "fs";
import { generateStoryboard } from "./llmEngine.js";
import { processStoryboardAudio } from "./audioPipeline.js";
import { renderExplainerVideo } from "./videoRenderer.js";
import { config } from "./config.js";

async function main() {
  const topicArg = process.argv.slice(2).join(" ").trim();
  const topic = topicArg || "Reverse a String";

  console.log(`\n========================================`);
  console.log(`🎬 DSA Explainer Video Generation Pipeline`);
  console.log(`Topic: "${topic}"`);
  console.log(`========================================\n`);

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const outputFilePath = path.resolve(config.OUTPUT_DIR, `${slug}.mp4`);

  console.log(`[1/3] Generating Storyboard with Codestral...`);
  const storyboard = await generateStoryboard(topic);
  console.log(`      ✓ Storyboard created: "${storyboard.title}"`);
  console.log(`      ✓ Algorithm: ${storyboard.algorithm}`);
  console.log(`      ✓ Structures: ${storyboard.structuresUsed.join(", ")}`);
  console.log(`      ✓ Total Scenes: ${storyboard.scenes.length}`);

  console.log(`\n[2/3] Synthesizing Voiceovers with Mistral Voxtral...`);
  const enrichedStoryboard = await processStoryboardAudio(storyboard);
  console.log(`      ✓ All scene audios synthesized`);
  console.log(`      ✓ Runtime: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s (${enrichedStoryboard.totalDurationInFrames} frames at 30fps)`);

  console.log(`\n[3/3] Rendering 16:9 Video Canvas with Remotion...`);
  await renderExplainerVideo(enrichedStoryboard, outputFilePath);

  console.log(`\n========================================`);
  console.log(`🎉 Video Render Complete!`);
  console.log(`📁 File: ${outputFilePath}`);
  console.log(`⏱️ Duration: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("\n❌ Pipeline failed:", err.message);
  process.exit(1);
});
