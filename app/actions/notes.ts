"use server";

/**
 * Note Management Server Actions
 *
 * This module handles all note-related operations including:
 * - Creating new notes with blocks and todo items
 * - Updating existing notes with new content
 * - Deleting notes and their associated data
 * - Reordering notes within a space
 * - Real-time note broadcasting via Pusher
 *
 * All actions include:
 * - Authentication checks
 * - Input validation with Zod schemas
 * - Database operations with Prisma transactions
 * - Real-time updates via Pusher
 * - Proper error handling and logging
 */

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import {
  createNoteSchema,
  updateNoteSchema,
  reorderNotesSchema,
} from "@/utils/validation/actions";
import { pusherServer } from "@/lib/pusher";

/**
 * Creates a new note with blocks and todo items in a space
 *
 * @param spaceId - The ID of the space to create the note in
 * @param title - The title of the note
 * @param blocks - Array of note blocks (text, heading, or todo blocks)
 * @returns Created note data with formatted blocks and items
 * @throws Error if validation fails or user is not authenticated
 */
export async function createNote(
  spaceId: string,
  title: string,
  blocks: Array<{
    id?: string;
    type: "text" | "heading" | "todo";
    content: string;
    todoTitle?: string;
    items?: Array<{
      id?: string;
      text: string;
      done?: boolean;
      description?: string;
    }>;
  }>
) {
  const parsed = createNoteSchema.safeParse({ spaceId, title, blocks });
  if (!parsed.success) throw new Error("Invalid note payload");
  const user = await requireAuth();
  const authorId = user.id as string;

  const created = await (
    prisma as unknown as {
      note: {
        create: (args: unknown) => Promise<{
          id: string | number;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          blocks: {
            id: string | number;
            type: "TEXT" | "HEADING" | "TODO";
            content: string;
            todoTitle: string | null;
            items: {
              id: string | number;
              text: string;
              done: boolean;
              description: string | null;
            }[];
          }[];
        }>;
      };
    }
  ).note.create({
    data: {
      title,
      spaceId,
      authorId,
      blocks: {
        create: blocks.map(
          (
            b: {
              type: "text" | "heading" | "todo";
              content: string;
              todoTitle?: string;
              items?: { text: string; done?: boolean; description?: string }[];
            },
            idx: number
          ) => ({
            type:
              b.type === "text"
                ? "TEXT"
                : b.type === "heading"
                ? "HEADING"
                : "TODO",
            content: b.content ?? "",
            todoTitle: b.todoTitle,
            sortOrder: idx,
            items:
              b.items && b.items.length
                ? {
                    create: (b.items || []).map(
                      (
                        it: {
                          text: string;
                          done?: boolean;
                          description?: string;
                        },
                        i: number
                      ) => ({
                        text: it.text,
                        done: it.done ?? false,
                        description: it.description,
                        sortOrder: i,
                      })
                    ),
                  }
                : undefined,
          })
        ),
      },
    },
    include: {
      blocks: { include: { items: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const noteData = {
    id: String(created.id),
    title: created.title,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    blocks: created.blocks.map(
      (b: {
        id: string | number;
        type: "TEXT" | "HEADING" | "TODO";
        content: string;
        todoTitle?: string | null;
        items: {
          id: string | number;
          text: string;
          done: boolean;
          description: string | null;
        }[];
      }) => ({
        id: String(b.id),
        type:
          b.type === "TEXT"
            ? "text"
            : b.type === "HEADING"
            ? "heading"
            : "todo",
        content: b.content,
        todoTitle: b.todoTitle ?? undefined,
        items: b.items.map(
          (it: {
            id: string | number;
            text: string;
            done: boolean;
            description: string | null;
          }) => ({
            id: String(it.id),
            text: it.text,
            done: it.done,
            description: it.description ?? undefined,
          })
        ),
      })
    ),
  };

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "note:created", {
      note: noteData,
      spaceId,
    });
  }

  return noteData;
}

/**
 * Updates an existing note by replacing all blocks and todo items
 * This function deletes existing blocks and creates new ones to ensure consistency
 *
 * @param noteId - The ID of the note to update
 * @param title - The new title of the note
 * @param blocks - Array of new note blocks to replace existing ones
 * @returns Updated note data with formatted blocks and items
 * @throws Error if validation fails, note not found, or user is not authenticated
 */
export async function updateNote(
  noteId: string,
  title: string,
  blocks: Array<{
    id?: string;
    type: "text" | "heading" | "todo";
    content: string;
    todoTitle?: string;
    items?: Array<{
      id?: string;
      text: string;
      done?: boolean;
      description?: string;
    }>;
  }>
) {
  const normalizedBlocks = blocks.map((block) => ({
    ...block,
    id: block.id ? String(block.id) : undefined,
    items: block.items?.map((item) => ({
      ...item,
      id: item.id ? String(item.id) : undefined,
    })),
  }));

  const parsed = updateNoteSchema.safeParse({
    noteId: String(noteId),
    title,
    blocks: normalizedBlocks,
  });
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.errors);
    console.error("Data:", {
      noteId: String(noteId),
      title,
      blocks: normalizedBlocks,
    });
    throw new Error("Invalid note payload");
  }
  await requireAuth();

  const note = await prisma.note.findUnique({
    where: { id: BigInt(noteId) },
    select: { spaceId: true },
  });

  if (!note) throw new Error("Note not found");

  const blockIds = await (
    prisma as unknown as {
      noteBlock: { findMany: (args: unknown) => Promise<{ id: string }[]> };
    }
  ).noteBlock.findMany({ where: { noteId }, select: { id: true } });
  if (blockIds.length > 0) {
    const ids = blockIds.map((b) => b.id);
    await (
      prisma as unknown as {
        noteTodoItem: { deleteMany: (args: unknown) => Promise<void> };
      }
    ).noteTodoItem.deleteMany({ where: { blockId: { in: ids } } });
    await (
      prisma as unknown as {
        noteBlock: { deleteMany: (args: unknown) => Promise<void> };
      }
    ).noteBlock.deleteMany({ where: { id: { in: ids } } });
  }

  const updated = await (
    prisma as unknown as {
      note: {
        update: (args: unknown) => Promise<{
          id: string;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          blocks: {
            id: string;
            type: "TEXT" | "HEADING" | "TODO";
            content: string;
            todoTitle: string | null;
            items: {
              id: string | number;
              text: string;
              done: boolean;
              description: string | null;
            }[];
          }[];
        }>;
      };
    }
  ).note.update({
    where: { id: BigInt(noteId) },
    data: {
      title,
      blocks: {
        create: blocks.map(
          (
            b: {
              type: "text" | "heading" | "todo";
              content: string;
              todoTitle?: string;
              items?: { text: string; done?: boolean; description?: string }[];
            },
            idx: number
          ) => ({
            type:
              b.type === "text"
                ? "TEXT"
                : b.type === "heading"
                ? "HEADING"
                : "TODO",
            content: b.content ?? "",
            todoTitle: b.todoTitle,
            sortOrder: idx,
            items:
              b.items && b.items.length
                ? {
                    create: (b.items || []).map(
                      (
                        it: {
                          text: string;
                          done?: boolean;
                          description?: string;
                        },
                        i: number
                      ) => ({
                        text: it.text,
                        done: it.done ?? false,
                        description: it.description,
                        sortOrder: i,
                      })
                    ),
                  }
                : undefined,
          })
        ),
      },
    },
    include: {
      blocks: { include: { items: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const noteData = {
    id: String(updated.id),
    title: updated.title,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    blocks: updated.blocks.map(
      (b: {
        id: string | number;
        type: "TEXT" | "HEADING" | "TODO";
        content: string;
        todoTitle?: string | null;
        items: {
          id: string | number;
          text: string;
          done: boolean;
          description: string | null;
        }[];
      }) => ({
        id: String(b.id),
        type:
          b.type === "TEXT"
            ? "text"
            : b.type === "HEADING"
            ? "heading"
            : "todo",
        content: b.content,
        todoTitle: b.todoTitle ?? undefined,
        items: b.items.map(
          (it: {
            id: string | number;
            text: string;
            done: boolean;
            description: string | null;
          }) => ({
            id: String(it.id),
            text: it.text,
            done: it.done,
            description: it.description ?? undefined,
          })
        ),
      })
    ),
  };

  if (pusherServer) {
    await pusherServer.trigger(`space-${note.spaceId}`, "note:updated", {
      note: noteData,
      spaceId: note.spaceId,
    });
  }

  return noteData;
}

/**
 * Deletes a note and all its associated blocks and todo items
 * Uses database transaction to ensure data consistency
 *
 * @param noteId - The ID of the note to delete
 * @returns true if deletion was successful
 * @throws Error if note not found or user is not authenticated
 */
export async function deleteNote(noteId: string) {
  await requireAuth();

  const note = await prisma.note.findUnique({
    where: { id: BigInt(noteId) },
    select: { spaceId: true },
  });

  if (!note) throw new Error("Note not found");

  await prisma.$transaction(async (tx) => {
    const blocks = await (
      tx as unknown as {
        noteBlock: { findMany: (args: unknown) => Promise<{ id: string }[]> };
      }
    ).noteBlock.findMany({
      where: { noteId },
      select: { id: true },
    });
    const blockIds = blocks.map((b) => b.id);
    if (blockIds.length > 0) {
      await (
        tx as unknown as {
          noteTodoItem: { deleteMany: (args: unknown) => Promise<void> };
        }
      ).noteTodoItem.deleteMany({
        where: { blockId: { in: blockIds } },
      });
      await (
        tx as unknown as {
          noteBlock: { deleteMany: (args: unknown) => Promise<void> };
        }
      ).noteBlock.deleteMany({
        where: { id: { in: blockIds } },
      });
    }
    await (
      tx as unknown as { note: { delete: (args: unknown) => Promise<void> } }
    ).note.delete({ where: { id: BigInt(noteId) } });
  });

  // Broadcast note deletion to all users in the space
  if (pusherServer) {
    await pusherServer.trigger(`space-${note.spaceId}`, "note:deleted", {
      noteId,
      spaceId: note.spaceId,
    });
  }

  return true;
}

/**
 * Reorders notes within a space based on the provided order
 * Updates the sortOrder field for each note to match the new order
 *
 * @param spaceId - The ID of the space containing the notes
 * @param orderedIds - Array of note IDs in the desired order
 * @returns Array of note IDs in the new order
 * @throws Error if validation fails or user is not authenticated
 */
export async function reorderNotes(spaceId: string, orderedIds: string[]) {
  const parsed = reorderNotesSchema.safeParse({ spaceId, orderedIds });
  if (!parsed.success) throw new Error("Invalid reorder payload");
  await requireAuth();

  await prisma.$transaction(async (tx) => {
    const client = tx as unknown as {
      note: { update: (args: unknown) => Promise<unknown> };
    };
    for (let idx = 0; idx < orderedIds.length; idx++) {
      const id = orderedIds[idx];
      await client.note.update({
        where: { id: BigInt(id) },
        data: { sortOrder: idx },
      });
    }
  });

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "notes:reordered", {
      spaceId,
      orderedIds,
    });
  }

  return orderedIds;
}
