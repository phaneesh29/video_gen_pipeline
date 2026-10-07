import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function executeFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`FFmpeg failed: ${error.message}\n${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function buildMasterAudio(scenes, fps, outputPath) {
  ensureDir(outputPath);
  const inputs = [];
  const filterParts = [];
  const concatInputs = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    inputs.push("-i", scene.audioPath);

    const targetDuration = scene.durationInFrames / fps;
    filterParts.push(`[${i}:a]apad,atrim=0:${targetDuration.toFixed(4)},asetpts=PTS-STARTPTS[a${i}]`);
    concatInputs.push(`[a${i}]`);
  }

  const filterComplex = `${filterParts.join(";")};${concatInputs.join("")}concat=n=${scenes.length}:v=0:a=1[concata];[concata]dynaudnorm=f=120:g=15:m=10.0,loudnorm=I=-11:TP=-0.5:LRA=6[outa]`;

  const args = [
    ...inputs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[outa]",
    "-ar",
    "48000",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-y",
    outputPath
  ];

  await executeFfmpeg(args);
  return outputPath;
}

export async function muxVideoAndAudio(videoPath, audioPath, outputPath) {
  ensureDir(outputPath);
  const args = [
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-y",
    outputPath
  ];

  await executeFfmpeg(args);
  return outputPath;
}

export async function stitchBumperCardsAndMux({
  mainVideoPath,
  masterAudioPath,
  startImgPath,
  endImgPath,
  width = 1080,
  height = 1920,
  fps = 30,
  outputPath,
  introSec = 2.0,
  outroSec = 3.0
}) {
  ensureDir(outputPath);

  const hasStart = startImgPath && fs.existsSync(startImgPath);
  const hasEnd = endImgPath && fs.existsSync(endImgPath);

  if (!hasStart && !hasEnd) {
    return muxVideoAndAudio(mainVideoPath, masterAudioPath, outputPath);
  }

  const inputs = [];
  const filterParts = [];
  const concatStreamPairs = [];

  let inputIndex = 0;

  if (hasStart) {
    inputs.push("-loop", "1", "-t", `${introSec.toFixed(2)}`, "-i", startImgPath);
    filterParts.push(
      `[${inputIndex}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fps=${fps},setsar=1[v_start]`
    );
    filterParts.push(`aevalsrc=0:d=${introSec.toFixed(2)}:s=48000:c=stereo[a_start]`);
    concatStreamPairs.push("[v_start][a_start]");
    inputIndex++;
  }

  // 2. Main content video + master narration audio
  const mainVIdx = inputIndex;
  inputs.push("-i", mainVideoPath);
  inputIndex++;

  const mainAIdx = inputIndex;
  inputs.push("-i", masterAudioPath);
  inputIndex++;

  filterParts.push(`[${mainVIdx}:v]scale=${width}:${height},format=yuv420p,fps=${fps},setsar=1[v_main]`);
  filterParts.push(`[${mainAIdx}:a]aformat=sample_rates=48000:channel_layouts=stereo[a_main]`);
  concatStreamPairs.push("[v_main][a_main]");

  // 3. End bumper card
  if (hasEnd) {
    inputs.push("-loop", "1", "-t", `${outroSec.toFixed(2)}`, "-i", endImgPath);
    filterParts.push(
      `[${inputIndex}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fps=${fps},setsar=1[v_end]`
    );
    filterParts.push(`aevalsrc=0:d=${outroSec.toFixed(2)}:s=48000:c=stereo[a_end]`);
    concatStreamPairs.push("[v_end][a_end]");
    inputIndex++;
  }

  const totalSegments = concatStreamPairs.length;
  filterParts.push(`${concatStreamPairs.join("")}concat=n=${totalSegments}:v=1:a=1[outv][outa]`);

  const args = [
    ...inputs,
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[outv]",
    "-map",
    "[outa]",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "18",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-y",
    outputPath
  ];

  await executeFfmpeg(args);
  return outputPath;
}
