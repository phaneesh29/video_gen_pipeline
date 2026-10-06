import fs from "fs";
import path from "path";
import { client } from "./client.js";
import { config } from "./config.js";

export const PAUL_EXPRESSIONS = {
  confident: "en_paul_confident",
  excited: "en_paul_excited",
  cheerful: "en_paul_cheerful",
  happy: "en_paul_happy",
  neutral: "en_paul_neutral",
  frustrated: "en_paul_frustrated",
  sad: "en_paul_sad",
  angry: "en_paul_angry"
};

export async function generateSpeech(text, outputPath, expression = "confident") {
  const voiceId = PAUL_EXPRESSIONS[expression] || expression || PAUL_EXPRESSIONS.confident;

  const trimmed = text.trim();
  const cleanInput = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;

  const response = await client.audio.speech.complete({
    model: config.VOXTRAL_MODEL,
    voiceId,
    input: cleanInput,
    responseFormat: "mp3"
  });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const audioBuffer = Buffer.from(response.audioData, "base64");
  fs.writeFileSync(outputPath, audioBuffer);

  return outputPath;
}
