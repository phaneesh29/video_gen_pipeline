import fs from "fs";
import path from "path";
import { SarvamAIClient } from "sarvamai";
import { config } from "./config.js";

const sarvamClient = new SarvamAIClient({
  apiSubscriptionKey: config.SARVAM_API_KEY
});

/**
 * Generate speech using Sarvam AI Bulbul v3 TTS
 */
export async function generateSpeech(text, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const trimmed = text.trim();
  const cleanInput = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;

  const response = await sarvamClient.textToSpeech.convertStream({
    text: cleanInput,
    target_language_code: config.SARVAM_LANGUAGE_CODE,
    speaker: config.SARVAM_SPEAKER,
    model: config.SARVAM_MODEL,
    pace: 1,
    speech_sample_rate: 24000
  });

  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(outputPath);
    response.pipe(fileStream);
    fileStream.on("finish", () => resolve(outputPath));
    fileStream.on("error", reject);
    response.on("error", reject);
  });

  return outputPath;
}
