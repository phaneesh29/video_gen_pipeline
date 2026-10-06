import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required").refine(
    (key) => key !== "your_mistral_api_key_here",
    "MISTRAL_API_KEY must be a valid key, not the placeholder"
  ),
  MISTRAL_MODEL: z.string().default("codestral-latest"),
  VOXTRAL_MODEL: z.string().default("voxtral-mini-tts-2603"),
  VIDEO_FPS: z.coerce.number().default(30),
  VIDEO_WIDTH: z.coerce.number().default(1920),
  VIDEO_HEIGHT: z.coerce.number().default(1080),
  OUTPUT_DIR: z.string().default("./output"),
  TEMP_DIR: z.string().default("./temp")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment configuration error:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
