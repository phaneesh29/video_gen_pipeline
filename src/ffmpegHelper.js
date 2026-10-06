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
