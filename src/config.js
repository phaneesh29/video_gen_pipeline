import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required").refine(
    (key) => key !== "your_mistral_api_key_here",
    "MISTRAL_API_KEY must be a valid key, not the placeholder"
  ),
  MISTRAL_MODEL: z.string().default("codestral-latest"),
  SARVAM_API_KEY: z.string().min(1, "SARVAM_API_KEY is required in .env"),
  SARVAM_SPEAKER: z.string().default("aditya"),
  SARVAM_LANGUAGE_CODE: z.string().default("en-IN"),
  SARVAM_MODEL: z.string().default("bulbul:v3"),
  VIDEO_FPS: z.coerce.number().default(30),
  VIDEO_WIDTH: z.coerce.number().default(1920),
  VIDEO_HEIGHT: z.coerce.number().default(1080),
  OUTPUT_DIR: z.string().default("./output")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment configuration error:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
