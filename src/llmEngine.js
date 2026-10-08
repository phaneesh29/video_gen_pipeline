import { client } from "./client.js";
import { config } from "./config.js";
import { storyboardSchema } from "./schema.js";
import { DSA_SYSTEM_PROMPT, getStoryPrompt } from "./instructions.js";

export async function generateStoryboard(topic, isVertical = false) {
  const response = await client.chat.parse({
    model: config.MISTRAL_MODEL,
    responseFormat: storyboardSchema,
    temperature: 0.25,
    messages: [
      { role: "system", content: DSA_SYSTEM_PROMPT },
      { role: "user", content: getStoryPrompt(topic, isVertical) }
    ]
  });

  let parsed = response.choices[0].message.parsed;

  // Sanitize any accidental letter-spaced terms (e.g. "G P U" -> "GPU", "N V L i n k" -> "NVLink")
  parsed = sanitizeStoryboard(parsed);

  if (parsed && Array.isArray(parsed.codeLines) && Array.isArray(parsed.scenes)) {
    for (const scene of parsed.scenes) {
      const snippet = scene.visual?.activeCodeSnippet?.trim().toLowerCase();
      if (snippet && snippet !== "none" && snippet !== "" && snippet !== "null") {
        const foundIdx = parsed.codeLines.findIndex((line) =>
          line.toLowerCase().includes(snippet)
        );
        if (foundIdx !== -1) {
          scene.visual.activeLine = foundIdx + 1;
        }
      } else if (!snippet || snippet === "none" || snippet === "null") {
        scene.visual.activeLine = 0;
      }
    }
  }

  return parsed;
}

/**
 * Universally collapses any artificial sequence of single-letter tokens
 * (e.g. "G P U", "M C P", "A I", "N V L i n k", "L L M", "g R P C")
 * using a single universal regex without maintaining any word dictionaries.
 */
function cleanSpacedText(str) {
  if (typeof str !== "string") return str;
  return str.replace(/\b([a-zA-Z](?:\s+[a-zA-Z])+)\b/g, (match) => {
    return match.split(/\s+/).join("");
  });
}

export function sanitizeStoryboard(val) {
  if (typeof val === "string") {
    return cleanSpacedText(val);
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeStoryboard);
  }
  if (val && typeof val === "object") {
    const result = {};
    for (const key of Object.keys(val)) {
      result[key] = sanitizeStoryboard(val[key]);
    }
    return result;
  }
  return val;
}

