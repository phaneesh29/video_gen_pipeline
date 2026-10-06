import { client } from "./client.js";
import { config } from "./config.js";
import { storyboardSchema } from "./schema.js";
import { DSA_SYSTEM_PROMPT, getStoryPrompt } from "./instructions.js";

export async function generateStoryboard(topic) {
  const response = await client.chat.parse({
    model: config.MISTRAL_MODEL,
    responseFormat: storyboardSchema,
    temperature: 0,
    messages: [
      { role: "system", content: DSA_SYSTEM_PROMPT },
      { role: "user", content: getStoryPrompt(topic) }
    ]
  });

  return response.choices[0].message.parsed;
}
