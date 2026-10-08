import path from "path";
import fs from "fs";
import { Command } from "commander";
import { generateStoryboard } from "./llmEngine.js";
import { processStoryboardAudio } from "./audioPipeline.js";
import { renderExplainerVideo } from "./videoRenderer.js";
import { enrichStoryboardWithImages } from "./imageFetcher.js";
import { buildMasterAudio, stitchBumperCardsAndMux } from "./ffmpegHelper.js";
import { config } from "./config.js";

const program = new Command();

program
  .name("video-gen")
  .description("Excalidraw-style technical explainer video generator using Remotion, Codestral & Voxtral")
  .version("1.0.0")
  .argument("[input]", "Path to text file (e.g. problem.txt) or inline topic string", "problem.txt")
  .option("-v, --vertical", "Render in 9:16 vertical format (1080x1920) for Shorts/Reels")
  .addHelpText(
    "after",
    `
Examples:
  $ node src/cli.js problem.txt
  $ node src/cli.js problem.txt --vertical
  $ node src/cli.js "How WebSockets Work" -v
`
  )
  .action(async (input, options) => {
    let problemInput = "";
    let inputSource = "";

    if (fs.existsSync(input)) {
      problemInput = fs.readFileSync(input, "utf-8").trim();
      inputSource = `file: ${input}`;
    } else if (input && input !== "problem.txt") {
      problemInput = input.trim();
      inputSource = "inline prompt";
    } else if (fs.existsSync("problem.txt")) {
      problemInput = fs.readFileSync("problem.txt", "utf-8").trim();
      inputSource = "problem.txt";
    } else {
      console.error("❌ Error: No input specified and problem.txt was not found.\n");
      program.help();
      return;
    }

    const targetAspectRatio = options.vertical || /9:16|vertical/i.test(problemInput) ? "9:16" : "16:9";
    const resolution = targetAspectRatio === "9:16" ? "1080x1920 (Vertical)" : "1920x1080 (Landscape)";

    console.log(`\n========================================`);
    console.log(`🎬 Technical Explainer Video Pipeline`);
    console.log(`Source:      ${inputSource}`);
    console.log(`Target:      ${targetAspectRatio} | ${resolution}`);
    console.log(`Visuals:     Excalidraw Whiteboard (RoughJS)`);
    console.log(`========================================\n`);

    const tempDir = path.resolve("./temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Stage 1: Storyboard generation
      console.log(`[1/4] Generating Storyboard with Codestral...`);
      const storyboard = await generateStoryboard(problemInput);

      storyboard.aspectRatio = targetAspectRatio;

      const hasCode = Array.isArray(storyboard.codeLines) && storyboard.codeLines.length > 0;

      console.log(`      ✓ Storyboard: "${storyboard.title}"`);
      console.log(`      ✓ Topic:      ${storyboard.category} / ${storyboard.topic}`);
      console.log(`      ✓ Canvas:     ${hasCode ? `Split View (${storyboard.codeLanguage})` : "Full-Width Whiteboard"}`);
      console.log(`      ✓ Scenes:     ${storyboard.scenes.length} scenes`);

      const cleanSlug = (storyboard.title || "explainer_video")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 45);

      const suffix = targetAspectRatio === "9:16" ? "_vertical" : "";
      fs.mkdirSync(config.OUTPUT_DIR, { recursive: true });
      const outputFilePath = path.resolve(config.OUTPUT_DIR, `${cleanSlug}${suffix}.mp4`);
      const tempVideoPath = path.resolve(tempDir, `video_${cleanSlug}.mp4`);
      const masterAudioPath = path.resolve(tempDir, `audio_${cleanSlug}.m4a`);

      // Stage 2: Audio synthesis
      console.log(`\n[2/4] Synthesizing Voiceovers with Mistral Voxtral...`);
      const enrichedStoryboard = await processStoryboardAudio(storyboard, tempDir);
      console.log(`      ✓ Speech synthesized for all ${enrichedStoryboard.scenes.length} scenes`);
      console.log(`      ✓ Duration: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s (${enrichedStoryboard.totalDurationInFrames} frames at 30fps)`);

      // Image resolution for diagram nodes
      console.log(`\n      Resolving brand logos & web imagery for nodes...`);
      await enrichStoryboardWithImages(enrichedStoryboard);
      let logoCount = 0;
      enrichedStoryboard.scenes.forEach(s => s.visual?.structures?.forEach(st => st.nodes?.forEach(n => { if (n.imageSrc) logoCount++; })));
      console.log(`      ✓ Embedded ${logoCount} brand logos and visuals into diagram nodes`);

      // Stage 3: Video rendering
      console.log(`\n[3/4] Rendering ${targetAspectRatio} Whiteboard Canvas with Remotion...`);
      await renderExplainerVideo(enrichedStoryboard, tempVideoPath);

      // Stage 4: FFmpeg audio muxing & bumper stitching
      console.log(`\n[4/4] Stitching Audio & Vidling Bumper Screens with FFmpeg...`);
      await buildMasterAudio(enrichedStoryboard.scenes, config.VIDEO_FPS, masterAudioPath);

      const startImg = targetAspectRatio === "9:16" ? "assets/start_9_16.png" : "assets/start_16_9.png";
      const endImg = targetAspectRatio === "9:16" ? "assets/end_9_16.png" : "assets/end_16_9.png";

      const introSec = 0.8;
      const outroSec = 3.0;

      await stitchBumperCardsAndMux({
        mainVideoPath: tempVideoPath,
        masterAudioPath,
        startImgPath: path.resolve(startImg),
        endImgPath: path.resolve(endImg),
        width: targetAspectRatio === "9:16" ? 1080 : 1920,
        height: targetAspectRatio === "9:16" ? 1920 : 1080,
        fps: config.VIDEO_FPS,
        outputPath: outputFilePath,
        introSec,
        outroSec
      });
      console.log(`      ✓ Vidling Intro (${introSec}s), Main Video, and Outro (${outroSec}s) stitched`);

      const totalVideoDurationSec = enrichedStoryboard.totalDurationInSeconds + introSec + outroSec;
      console.log(`\n========================================`);
      console.log(`🎉 Video Render Complete!`);
      console.log(`📁 File:     ${outputFilePath}`);
      console.log(`⏱️ Duration: ${totalVideoDurationSec.toFixed(1)}s (Content: ${enrichedStoryboard.totalDurationInSeconds.toFixed(1)}s + ${(introSec + outroSec).toFixed(1)}s Vidling Branding)`);
      console.log(`📐 Format:   ${targetAspectRatio} (${resolution})`);
      console.log(`========================================\n`);
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });

program.parseAsync(process.argv).catch((err) => {
  console.error("\n❌ Pipeline failed:", err.message);
  process.exit(1);
});
