import { z } from "zod";

export const sceneVisualSchema = z.object({
  array: z.array(z.union([z.number(), z.string()])).default([]),
  pointers: z.record(z.string(), z.number()).default({}),
  highlightedIndices: z.array(z.number()).default([]),
  activeLine: z.number().int().positive().default(1),
  actionDescription: z.string().default("")
});

export const sceneSchema = z.object({
  id: z.string(),
  type: z.enum(["intro", "step", "outro"]).default("step"),
  expression: z.enum([
    "confident",
    "excited",
    "cheerful",
    "happy",
    "neutral",
    "frustrated",
    "sad",
    "angry"
  ]).default("confident"),
  narration: z.string().min(1),
  visual: sceneVisualSchema
});

export const storyboardSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  complexity: z.object({
    time: z.string(),
    space: z.string()
  }),
  pythonCode: z.array(z.string()).min(1),
  scenes: z.array(sceneSchema).min(1)
});
