import { Mistral } from "@mistralai/mistralai";
import { config } from "./config.js";

export const client = new Mistral({ apiKey: config.MISTRAL_API_KEY });
