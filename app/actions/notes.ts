"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import {
  createNoteSchema,
  updateNoteSchema,
  reorderNotesSchema,
} from "@/utils/validation/actions";

export async function createNote(
  spaceId: string,
  title: string,
  blocks: Array<{
    id?: string;
    type: "text" | "heading" | "todo";
    content: string;
    todoTitle?: string;
    collapsed?: boolean;
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
          id: string;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          blocks: {
            id: string;
            type: "TEXT" | "HEADING" | "TODO";
            content: string;
            todoTitle: string | null;
            collapsed: boolean;
            items: {
              id: string;
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
              collapsed?: boolean;
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
            collapsed: b.collapsed ?? false,
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

  return {
    id: created.id,
    title: created.title,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    blocks: created.blocks.map(
      (b: {
        id: string;
        type: "TEXT" | "HEADING" | "TODO";
        content: string;
        todoTitle?: string | null;
        collapsed: boolean;
        items: {
          id: string;
          text: string;
          done: boolean;
          description: string | null;
        }[];
      }) => ({
        id: b.id,
        type:
          b.type === "TEXT"
            ? "text"
            : b.type === "HEADING"
            ? "heading"
            : "todo",
        content: b.content,
        todoTitle: b.todoTitle ?? undefined,
        collapsed: b.collapsed,
        items: b.items.map(
          (it: {
            id: string;
            text: string;
            done: boolean;
            description: string | null;
          }) => ({
            id: it.id,
            text: it.text,
            done: it.done,
            description: it.description ?? undefined,
          })
        ),
      })
    ),
  };
}

export async function updateNote(
  noteId: string,
  title: string,
  blocks: Array<{
    id?: string;
    type: "text" | "heading" | "todo";
    content: string;
    todoTitle?: string;
    collapsed?: boolean;
    items?: Array<{
      id?: string;
      text: string;
      done?: boolean;
      description?: string;
    }>;
  }>
) {
  const parsed = updateNoteSchema.safeParse({ noteId, title, blocks });
  if (!parsed.success) throw new Error("Invalid note payload");
  await requireAuth();

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
            collapsed: boolean;
            items: {
              id: string;
              text: string;
              done: boolean;
              description: string | null;
            }[];
          }[];
        }>;
      };
    }
  ).note.update({
    where: { id: noteId },
    data: {
      title,
      blocks: {
        create: blocks.map(
          (
            b: {
              type: "text" | "heading" | "todo";
              content: string;
              todoTitle?: string;
              collapsed?: boolean;
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
            collapsed: b.collapsed ?? false,
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

  return {
    id: updated.id,
    title: updated.title,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    blocks: updated.blocks.map(
      (b: {
        id: string;
        type: "TEXT" | "HEADING" | "TODO";
        content: string;
        todoTitle?: string | null;
        collapsed: boolean;
        items: {
          id: string;
          text: string;
          done: boolean;
          description: string | null;
        }[];
      }) => ({
        id: b.id,
        type:
          b.type === "TEXT"
            ? "text"
            : b.type === "HEADING"
            ? "heading"
            : "todo",
        content: b.content,
        todoTitle: b.todoTitle ?? undefined,
        collapsed: b.collapsed,
        items: b.items.map(
          (it: {
            id: string;
            text: string;
            done: boolean;
            description: string | null;
          }) => ({
            id: it.id,
            text: it.text,
            done: it.done,
            description: it.description ?? undefined,
          })
        ),
      })
    ),
  };
}

export async function deleteNote(noteId: string) {
  await requireAuth();

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
    ).note.delete({ where: { id: noteId } });
  });
  return true;
}

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
      await client.note.update({ where: { id }, data: { sortOrder: idx } });
    }
  });
  return orderedIds;
}
