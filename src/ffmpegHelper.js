import { execFile } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;

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

  const filterComplex = `${filterParts.join(";")};${concatInputs.join("")}concat=n=${scenes.length}:v=0:a=1[outa]`;

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
