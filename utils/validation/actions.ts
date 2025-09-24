import { z } from "zod";

export const spaceIdSchema = z.string().min(1);
export const messageContentSchema = z.string().trim().min(1);
export const spaceNameSchema = z.string().trim().min(1).max(100);
export const spaceDescriptionSchema = z.string().trim().max(300).optional();

export const noteBlockItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1),
  done: z.boolean().optional(),
  description: z.string().trim().max(500).optional(),
});

export const noteBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["text", "heading", "todo"]),
  content: z.string().default(""),
  todoTitle: z.string().optional(),
  collapsed: z.boolean().optional(),
  items: z.array(noteBlockItemSchema).optional(),
});

export const createNoteSchema = z.object({
  spaceId: spaceIdSchema,
  title: z.string().trim().min(1).max(200),
  blocks: z.array(noteBlockSchema).default([]),
});

export const updateNoteSchema = z.object({
  noteId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  blocks: z.array(noteBlockSchema).default([]),
});

export const reorderNotesSchema = z.object({
  spaceId: spaceIdSchema,
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const sendMessageSchema = z.object({
  spaceId: spaceIdSchema,
  content: messageContentSchema,
});

export const sendActivitySchema = z.object({
  spaceId: spaceIdSchema,
  htmlContent: z.string().trim().min(1),
});

export const createSpaceSchema = z.object({
  name: spaceNameSchema,
  description: spaceDescriptionSchema,
});
