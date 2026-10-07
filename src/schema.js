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
  subLabel: z.string().nullable(),
  icon: z.string().nullable().default(null),
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
    "system_flow",
    "network",
    "star_network",
    "mesh_network",
    "ring",
    "table",
    "variables"
  ]),
  elements: z.array(elementItemSchema),
  entries: z.array(entryItemSchema),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema)
});

export const sceneVisualSchema = z.object({
  activeLine: z.number(),
  activeCodeSnippet: z.string(),
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
  category: z.string(),
  topic: z.string(),
  aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
  codeTitle: z.string().default(""),
  codeLanguage: z.string().default(""),
  codeLines: z.array(z.string()).default([]),
  scenes: z.array(sceneSchema)
});
