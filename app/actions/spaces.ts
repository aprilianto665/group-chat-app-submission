"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import type { Prisma } from "@prisma/client";
import { isActivityContent, stripActivityPrefix } from "@/utils/activity";
import { createSpaceSchema, spaceIdSchema } from "@/utils/validation/actions";
import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";
import type { SpaceWithNotes } from "@/types";

interface BlockBlobClientLike {
  uploadData: (data: Buffer, options?: unknown) => Promise<void>;
  url: string;
}
interface ContainerClientLike {
  createIfNotExists: () => Promise<void>;
  getBlockBlobClient: (blobName: string) => BlockBlobClientLike;
}
interface BlobServiceLike {
  getContainerClient: (name: string) => ContainerClientLike;
}

type MemberWithUser = Prisma.SpaceMemberGetPayload<{ include: { user: true } }>;
type SpaceForList = Prisma.SpaceGetPayload<{
  include: {
    members: { include: { user: true } };
    messages: true;
  };
}>;

type MessageWithUser = Prisma.MessageGetPayload<{ include: { user: true } }>;

type SpaceDetail = Prisma.SpaceGetPayload<{
  include: {
    members: { include: { user: true } };
  };
}> & { messages: MessageWithUser[] };

type NoteItemDB = {
  id: string;
  text: string;
  done: boolean;
  description: string | null;
};
type NoteBlockDB = {
  id: string;
  type: "TEXT" | "HEADING" | "TODO";
  content: string;
  todoTitle: string | null;
  collapsed: boolean;
  items: NoteItemDB[];
};
type NoteFull = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  blocks: NoteBlockDB[];
};

export async function listUserSpaces() {
  const { id: userId } = await requireAuth();

  await prisma.spaceMember.findMany({
    where: { userId },
    include: {
      space: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const spaces = (await prisma.space.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })) as SpaceForList[];

  const mapped = spaces.map((s) => {
    const allMessages = (s.messages as MessageWithUser[]).map((msg) => {
      const isAct = isActivityContent(msg.content);
      return {
        id: msg.id,
        content: isAct ? stripActivityPrefix(msg.content) : msg.content,
        timestamp: msg.createdAt.toISOString(),
        senderName: msg.user?.name,
        username: msg.user?.username,
        isRead: true,
        type: isAct ? ("activity" as const) : ("text" as const),
      };
    });

    const lastNonActivity = [...allMessages]
      .reverse()
      .find((m) => m.type !== "activity");

    return {
      id: s.id,
      name: s.name,
      icon: s.icon ?? undefined,
      description: s.description ?? undefined,
      createdAt: s.createdAt.toISOString(),
      members: s.members.map((m: MemberWithUser) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          name: m.user.name,
          username: m.user.username,
          email: m.user.email,
          avatar: m.user.avatar ?? undefined,
        },
      })),
      lastMessage: lastNonActivity?.content,
      lastMessageSender: lastNonActivity?.senderName,
      messages: allMessages,
      notes: [],
    } as unknown as ReturnType<typeof Object.assign> & { createdAt: string } & {
      messages: { timestamp: string }[];
    };
  });

  mapped.sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.timestamp;
    const bLast = b.messages[b.messages.length - 1]?.timestamp;
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    const aTs = Math.max(aLast ? new Date(aLast).getTime() : 0, aCreated);
    const bTs = Math.max(bLast ? new Date(bLast).getTime() : 0, bCreated);
    return bTs - aTs;
  });

  return mapped;
}

export async function createSpace(
  name: string,
  description?: string,
  iconUrl?: string
) {
  const parsed = createSpaceSchema.safeParse({ name, description });
  if (!parsed.success) throw new Error("Invalid space payload");
  const { id: userId } = await requireAuth();

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error(
      "User not found in database. Please log out and register/login again."
    );
  }

  const space = (await prisma.space.create({
    data: {
      name,
      description,
      icon: iconUrl ?? undefined,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: { include: { user: true } },
    },
  })) as Prisma.SpaceGetPayload<{
    include: { members: { include: { user: true } } };
  }>;

  return {
    id: space.id,
    name: space.name,
    icon: space.icon ?? undefined,
    description: space.description ?? undefined,
    createdAt: space.createdAt.toISOString(),
    members: space.members.map((m: MemberWithUser) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
      user: {
        id: m.user.id,
        name: m.user.name,
        username: m.user.username,
        email: m.user.email,
        avatar: m.user.avatar ?? undefined,
      },
    })),
    messages: [],
    notes: [],
  };
}

export type CreateSpaceFormState = {
  error?: string;
  success?: string;
  created?: SpaceWithNotes;
};

export async function createSpaceFromForm(
  _prevState: CreateSpaceFormState,
  formData: FormData
): Promise<CreateSpaceFormState> {
  try {
    const name = ((formData.get("name") as string | null) ?? "").trim();
    const description =
      ((formData.get("description") as string | null) ?? "").trim() ||
      undefined;
    const file = formData.get("icon");

    const parsed = createSpaceSchema.safeParse({ name, description });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return { error: firstError };
    }

    let iconUrl: string | undefined;
    if (file && typeof file !== "string") {
      const blobFile = file as File;
      if (blobFile.size > 5 * 1024 * 1024) {
        return { error: "Max file size is 5MB" };
      }
      const contentType = blobFile.type || "application/octet-stream";
      if (!/^image\//.test(contentType)) {
        return { error: "Only image files are allowed" };
      }

      const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      const containerName = process.env.AZURE_STORAGE_CONTAINER;
      if (!containerName) {
        return { error: "Missing AZURE_STORAGE_CONTAINER env" };
      }

      let blobService: BlobServiceLike | null = null;
      if (conn && conn.length > 0) {
        blobService = BlobServiceClient.fromConnectionString(
          conn
        ) as unknown as BlobServiceLike;
      } else if (accountName && accountKey) {
        const { StorageSharedKeyCredential } = await import(
          "@azure/storage-blob"
        );
        const sharedKey = new StorageSharedKeyCredential(
          accountName,
          accountKey
        );
        blobService = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          sharedKey
        ) as unknown as BlobServiceLike;
      } else {
        return { error: "Missing Azure Storage credentials" };
      }

      const container = blobService.getContainerClient(containerName);
      await container.createIfNotExists();

      const ext = (blobFile.name.split(".").pop() || "png").toLowerCase();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const blockBlob = container.getBlockBlobClient(uniqueName);

      const arrayBuffer = await blobFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await blockBlob.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      iconUrl = blockBlob.url;
    }

    const created = await createSpace(name, description, iconUrl);
    return { success: "Space created", created };
  } catch (err) {
    console.error("createSpaceFromForm error:", err);
    return { error: "Internal server error" };
  }
}

export async function joinSpace(spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  const { id: userId } = await requireAuth();

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error(
      "User not found in database. Please log out and register/login again."
    );
  }

  const existing = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
  });
  if (existing) return existing.id;

  const member = await prisma.spaceMember.create({
    data: { spaceId, userId, role: "MEMBER" },
  });
  return member.id;
}

export async function getSpaceDetail(spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  await requireAuth();

  const spaceBase = (await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      members: { include: { user: true } },
    },
  })) as SpaceDetail | null;
  if (!spaceBase) throw new Error("Space not found");

  const messages = (await prisma.message.findMany({
    where: { spaceId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  })) as MessageWithUser[];

  let notes: NoteFull[] = [];
  try {
    notes = await (
      prisma as unknown as {
        note: { findMany: (args: unknown) => Promise<NoteFull[]> };
      }
    ).note.findMany({
      where: { spaceId },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
  } catch {
    notes = await (
      prisma as unknown as {
        note: { findMany: (args: unknown) => Promise<NoteFull[]> };
      }
    ).note.findMany({
      where: { spaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    notes.sort((a: NoteFull, b: NoteFull) => {
      const sa =
        (a as unknown as { sortOrder?: number }).sortOrder ??
        Number.MAX_SAFE_INTEGER;
      const sb =
        (b as unknown as { sortOrder?: number }).sortOrder ??
        Number.MAX_SAFE_INTEGER;
      if (sa !== sb) return sa - sb;
      return (
        new Date(b.updatedAt as unknown as string).getTime() -
        new Date(a.updatedAt as unknown as string).getTime()
      );
    });
  }

  return {
    id: spaceBase.id,
    name: spaceBase.name,
    icon: spaceBase.icon ?? undefined,
    description: spaceBase.description ?? undefined,
    createdAt: spaceBase.createdAt.toISOString(),
    members: spaceBase.members.map((m: MemberWithUser) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
      user: {
        id: m.user.id,
        name: m.user.name,
        username: m.user.username,
        email: m.user.email,
        avatar: m.user.avatar ?? undefined,
      },
    })),
    messages: messages.map((msg) => {
      const isAct = isActivityContent(msg.content);
      const mapped = {
        id: msg.id,
        content: isAct ? stripActivityPrefix(msg.content) : msg.content,
        timestamp: msg.createdAt.toISOString(),
        senderName: msg.user?.name,
        username: msg.user?.username,
        isRead: true,
        type: isAct ? ("activity" as const) : ("text" as const),
      };
      return mapped;
    }),
    notes: (notes as NoteFull[]).map((n) => ({
      id: n.id,
      title: n.title,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      blocks: (n.blocks as NoteBlockDB[]).map((b) => ({
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
        items: (b.items as NoteItemDB[]).map((it) => ({
          id: it.id,
          text: it.text,
          done: it.done,
          description: it.description ?? undefined,
        })),
      })),
    })),
  };
}

export async function leaveSpace(spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  const { id: userId } = await requireAuth();

  await prisma.$transaction(async (tx) => {
    await tx.spaceMember.deleteMany({ where: { spaceId, userId } });

    const remaining = await tx.spaceMember.count({ where: { spaceId } });

    if (remaining === 0) {
      await tx.message.deleteMany({ where: { spaceId } });

      const noteIds = (
        await (
          tx as unknown as {
            note: { findMany: (args: unknown) => Promise<{ id: string }[]> };
          }
        ).note.findMany({ where: { spaceId }, select: { id: true } })
      ).map((n) => n.id);

      if (noteIds.length > 0) {
        const blocks = await (
          tx as unknown as {
            noteBlock: {
              findMany: (args: unknown) => Promise<{ id: string }[]>;
            };
          }
        ).noteBlock.findMany({
          where: { noteId: { in: noteIds } },
          select: { id: true },
        });
        const blockIds = blocks.map((b) => b.id);
        if (blockIds.length > 0) {
          await (
            tx as unknown as {
              noteTodoItem: { deleteMany: (args: unknown) => Promise<void> };
            }
          ).noteTodoItem.deleteMany({ where: { blockId: { in: blockIds } } });
          await (
            tx as unknown as {
              noteBlock: { deleteMany: (args: unknown) => Promise<void> };
            }
          ).noteBlock.deleteMany({ where: { id: { in: blockIds } } });
        }
        await (
          tx as unknown as {
            note: { deleteMany: (args: unknown) => Promise<void> };
          }
        ).note.deleteMany({ where: { id: { in: noteIds } } });
      }

      await tx.space.delete({ where: { id: spaceId } });
    }
  });

  return { success: true } as const;
}
