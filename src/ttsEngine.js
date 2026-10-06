import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Mistral } from "@mistralai/mistralai";

dotenv.config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function generateSpeech(text, outputPath) {
  const response = await client.audio.speech.complete({
    model: "voxtral-mini-tts-2603",
    voiceId: "en_paul_neutral",
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
