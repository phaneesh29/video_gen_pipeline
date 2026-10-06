import { z } from "zod";

export const elementItemSchema = z.object({
  value: z.string(),
  highlight: z.boolean(),
  pointerLabel: z.string().nullable()
});

export const entryItemSchema = z.object({
  key: z.string(),
  value: z.string(),
  highlight: z.boolean()
});

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  leftId: z.string().nullable(),
  rightId: z.string().nullable(),
  status: z.enum(["normal", "active", "visited", "highlighted"])
});

export const graphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().nullable(),
  status: z.enum(["normal", "active", "traversed"])
});

export const dataStructureSchema = z.object({
  name: z.string(),
  type: z.enum([
    "array",
    "string",
    "hashmap",
    "stack",
    "queue",
    "tree",
    "graph",
    "matrix",
    "variables"
  ]),
  elements: z.array(elementItemSchema),
  entries: z.array(entryItemSchema),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema)
});

export const sceneVisualSchema = z.object({
  activeLine: z.number(),
  actionDescription: z.string(),
  structures: z.array(dataStructureSchema)
});

export const sceneSchema = z.object({
  id: z.string(),
  type: z.enum(["intro", "step", "outro"]),
  expression: z.enum([
    "confident",
    "excited",
    "cheerful",
    "happy",
    "neutral",
    "frustrated",
    "sad",
    "angry"
  ]),
  narration: z.string(),
  visual: sceneVisualSchema
});

export const storyboardSchema = z.object({
  title: z.string(),
  topic: z.string(),
  algorithm: z.string(),
  complexity: z.object({
    time: z.string(),
    space: z.string()
  }),
  structuresUsed: z.array(z.string()),
  pythonCode: z.array(z.string()),
  scenes: z.array(sceneSchema)
});
