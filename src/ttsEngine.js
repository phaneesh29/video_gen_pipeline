import fs from "fs";
import path from "path";
import { SarvamAIClient } from "sarvamai";
import { config } from "./config.js";

const client = new SarvamAIClient({
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

  const response = await client.textToSpeech.convert({
    text: cleanInput,
    model: config.SARVAM_MODEL,
    speaker: config.SARVAM_SPEAKER,
    language_code: config.SARVAM_LANGUAGE_CODE
  });

  const audio = Buffer.from(response.audios.join(""), "base64");
  fs.writeFileSync(outputPath, audio);

  return outputPath;
}
