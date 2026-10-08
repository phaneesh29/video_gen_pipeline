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

  const parsed = response.choices[0].message.parsed;

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
