/**
 * Server Action Validation Schemas
 *
 * This module contains Zod validation schemas for all server actions.
 * These schemas ensure data integrity and provide type safety for server-side operations.
 */

import { z } from "zod";

// ===== BASIC FIELD SCHEMAS =====

/**
 * Schema for validating space IDs
 * Ensures space ID is a non-empty string
 */
export const spaceIdSchema = z.string().min(1);

/**
 * Schema for validating message content
 * Ensures message content is trimmed and non-empty
 */
export const messageContentSchema = z.string().trim().min(1);

/**
 * Schema for validating space names
 * Ensures space name is trimmed, non-empty, and within length limits
 */
export const spaceNameSchema = z.string().trim().min(1).max(100);

/**
 * Schema for validating space descriptions
 * Ensures description is trimmed and within length limits (optional)
 */
export const spaceDescriptionSchema = z.string().trim().max(300).optional();

// ===== NOTE BLOCK SCHEMAS =====

/**
 * Schema for validating todo items within note blocks
 * Validates todo item structure with optional fields
 */
export const noteBlockItemSchema = z.object({
  /** Optional ID for existing todo items */
  id: z.string().optional(),
  /** Todo item text content (required, trimmed, non-empty) */
  text: z.string().trim().min(1),
  /** Completion status (optional boolean) */
  done: z.boolean().optional(),
  /** Optional description with length limit */
  description: z.string().trim().max(500).optional(),
});

/**
 * Schema for validating note blocks
 * Supports text, heading, and todo block types
 */
export const noteBlockSchema = z.object({
  /** Optional ID for existing blocks */
  id: z.string().optional(),
  /** Block type: text, heading, or todo */
  type: z.enum(["text", "heading", "todo"]),
  /** Block content (defaults to empty string) */
  content: z.string().default(""),
  /** Optional title for todo blocks */
  todoTitle: z.string().optional(),
  /** Optional array of todo items for todo blocks */
  items: z.array(noteBlockItemSchema).optional(),
});

// ===== ACTION SCHEMAS =====

/**
 * Schema for creating new notes
 * Validates note creation data including space ID, title, and blocks
 */
export const createNoteSchema = z.object({
  /** Space ID where the note will be created */
  spaceId: spaceIdSchema,
  /** Note title (trimmed, non-empty, max 200 characters) */
  title: z.string().trim().min(1).max(200),
  /** Array of note blocks (defaults to empty array) */
  blocks: z.array(noteBlockSchema).default([]),
});

/**
 * Schema for updating existing notes
 * Validates note update data including note ID, title, and blocks
 */
export const updateNoteSchema = z.object({
  /** ID of the note to update */
  noteId: z.string().min(1),
  /** Updated note title (trimmed, non-empty, max 200 characters) */
  title: z.string().trim().min(1).max(200),
  /** Updated array of note blocks (defaults to empty array) */
  blocks: z.array(noteBlockSchema).default([]),
});

/**
 * Schema for reordering notes within a space
 * Validates space ID and ordered note IDs array
 */
export const reorderNotesSchema = z.object({
  /** Space ID containing the notes */
  spaceId: spaceIdSchema,
  /** Array of note IDs in the desired order (minimum 1 item) */
  orderedIds: z.array(z.string().min(1)).min(1),
});

/**
 * Schema for sending messages to spaces
 * Validates space ID and message content
 */
export const sendMessageSchema = z.object({
  /** Space ID where the message will be sent */
  spaceId: spaceIdSchema,
  /** Message content (trimmed, non-empty) */
  content: messageContentSchema,
});

/**
 * Schema for sending activity messages
 * Validates space ID and HTML content for activity notifications
 */
export const sendActivitySchema = z.object({
  /** Space ID where the activity message will be sent */
  spaceId: spaceIdSchema,
  /** HTML content for the activity message (trimmed, non-empty) */
  htmlContent: z.string().trim().min(1),
});

/**
 * Schema for creating new spaces
 * Validates space name and optional description
 */
export const createSpaceSchema = z.object({
  /** Space name (trimmed, non-empty, max 100 characters) */
  name: spaceNameSchema,
  /** Optional space description (trimmed, max 300 characters) */
  description: spaceDescriptionSchema,
});
