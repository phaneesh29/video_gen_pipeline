import fs from "fs";
import path from "path";
import { Mistral } from "@mistralai/mistralai";
import { config } from "./config.js";

const client = new Mistral({ apiKey: config.MISTRAL_API_KEY });

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

  const response = await client.audio.speech.complete({
    model: config.VOXTRAL_MODEL,
    voiceId,
    input: text,
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
