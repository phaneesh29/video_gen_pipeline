import path from "path";
import fs from "fs";
import { generateStoryboard } from "./llmEngine.js";
import { processStoryboardAudio } from "./audioPipeline.js";
import { renderExplainerVideo } from "./videoRenderer.js";
import { buildMasterAudio, muxVideoAndAudio } from "./ffmpegHelper.js";
import { config } from "./config.js";

async function main() {
  const args = process.argv.slice(2);
  const isVerticalArg = args.some((a) =>
    ["--vertical", "-v", "--9:16", "--shorts", "--reels"].includes(a.toLowerCase())
  );
  const cleanArgs = args.filter(
    (a) => !["--vertical", "-v", "--9:16", "--shorts", "--reels"].includes(a.toLowerCase())
  );
  const rawArg = cleanArgs.join(" ").trim();

  let problemInput = "";

  if (rawArg && fs.existsSync(rawArg)) {
    problemInput = fs.readFileSync(rawArg, "utf-8").trim();
  } else if (rawArg) {
    problemInput = rawArg;
  } else if (fs.existsSync("problem.txt")) {
    problemInput = fs.readFileSync("problem.txt", "utf-8").trim();
  } else {
    problemInput = "Reverse a String";
  }

  const isVerticalInput =
    isVerticalArg ||
    /9:16|vertical|shorts|reels/i.test(problemInput);

  console.log(`\n========================================`);
  console.log(`🎬 CS & System Design Explainer Pipeline`);
  console.log(`Input Length: ${problemInput.length} chars | Target: ${isVerticalInput ? "9:16 Vertical" : "16:9 Landscape"}`);
  console.log(`========================================\n`);

  const tempDir = path.resolve("./temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log(`[1/4] Generating Storyboard with Codestral...`);
  const storyboard = await generateStoryboard(problemInput);

  if (isVerticalInput) {
    storyboard.aspectRatio = "9:16";
  }

  const hasCode = Array.isArray(storyboard.codeLines) && storyboard.codeLines.length > 0;

  console.log(`      ✓ Storyboard created: "${storyboard.title}"`);
  console.log(`      ✓ Category: ${storyboard.category} | Topic: ${storyboard.topic}`);
  console.log(`      ✓ Format: ${storyboard.aspectRatio} (${storyboard.aspectRatio === "9:16" ? "Vertical Shorts/Reels" : "Landscape 16:9"})`);
  console.log(`      ✓ Code: ${hasCode ? `${storyboard.codeTitle} (${storyboard.codeLanguage})` : "None (Full-Width Visual Canvas)"}`);
  console.log(`      ✓ Total Scenes: ${storyboard.scenes.length}`);

  const cleanSlug = (storyboard.title || "explainer_video")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 45);

  const suffix = storyboard.aspectRatio === "9:16" ? "_vertical" : "";
  const outputFilePath = path.resolve(config.OUTPUT_DIR, `${cleanSlug}${suffix}.mp4`);
  const tempVideoPath = path.resolve(tempDir, `video_${cleanSlug}.mp4`);
  const masterAudioPath = path.resolve(tempDir, `audio_${cleanSlug}.m4a`);

  console.log(`\n[2/4] Synthesizing Voiceovers with Mistral Voxtral...`);
  const enrichedStoryboard = await processStoryboardAudio(storyboard, tempDir);
  console.log(`      ✓ All scene audios synthesized`);
  console.log(`      ✓ Runtime: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s (${enrichedStoryboard.totalDurationInFrames} frames at 30fps)`);

  console.log(`\n[3/4] Rendering ${storyboard.aspectRatio} Video Canvas with Remotion...`);
  await renderExplainerVideo(enrichedStoryboard, tempVideoPath);

  console.log(`\n[4/4] Stitching Audio & Muxing with FFmpeg...`);
  await buildMasterAudio(enrichedStoryboard.scenes, config.VIDEO_FPS, masterAudioPath);
  await muxVideoAndAudio(tempVideoPath, masterAudioPath, outputFilePath);
  console.log(`      ✓ Master audio stitched and final video muxed`);

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`\n========================================`);
  console.log(`🎉 Video Render Complete!`);
  console.log(`📁 File: ${outputFilePath}`);
  console.log(`⏱️ Duration: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s`);
  console.log(`📐 Aspect: ${storyboard.aspectRatio}`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("\n❌ Pipeline failed:", err.message);
  process.exit(1);
});
