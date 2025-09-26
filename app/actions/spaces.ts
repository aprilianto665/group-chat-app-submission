"use server";

/**
 * Space Management Server Actions
 *
 * This module contains all server-side actions for space management including:
 * - Creating and deleting spaces
 * - Managing space members and roles
 * - Updating space information
 * - Handling space icons and file uploads
 * - Real-time notifications via Pusher
 *
 * All actions include:
 * - Authentication checks
 * - Input validation with Zod schemas
 * - Database operations with Prisma
 * - Real-time updates via Pusher
 * - Error handling and logging
 */

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import type { Prisma } from "@prisma/client";
import { isActivityContent, stripActivityPrefix } from "@/utils/activity";
import {
  createSpaceSchema,
  spaceIdSchema,
  spaceNameSchema,
  spaceDescriptionSchema,
} from "@/utils/validation/actions";
import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";
import type { SpaceWithNotes } from "@/types";
import { sendActivityMessage } from "./messages";
import { pusherServer } from "@/lib/pusher";
import {
  mapMemberData,
  getUserDisplayName,
  checkAdminPermission,
  sendActivityMessageSafe,
  createMemberActivityMessage,
} from "@/utils/spaceUtils";

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

type SpaceForList = Prisma.SpaceGetPayload<{
  include: {
    members: {
      select: {
        spaceId: true;
        userId: true;
        role: true;
        joinedAt: true;
        updatedAt: true;
        user: true;
      };
    };
    messages: true;
  };
}>;

type MessageWithUser = Prisma.MessageGetPayload<{ include: { user: true } }>;

type SpaceDetail = Prisma.SpaceGetPayload<{
  include: {
    members: {
      select: {
        spaceId: true;
        userId: true;
        role: true;
        joinedAt: true;
        updatedAt: true;
        user: true;
      };
    };
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
  items: NoteItemDB[];
};
type NoteFull = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  blocks: NoteBlockDB[];
};

/**
 * Retrieves all spaces that the authenticated user is a member of
 *
 * @returns Array of spaces with messages, members, and last message info
 */
export async function listUserSpaces() {
  const { id: userId } = await requireAuth();

  const spaces = (await prisma.space.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        select: {
          spaceId: true,
          userId: true,
          role: true,
          joinedAt: true,
          updatedAt: true,
          user: true,
        },
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
        id: Number(msg.id),
        content: isAct ? stripActivityPrefix(msg.content) : msg.content,
        timestamp: msg.createdAt.toISOString(),
        senderName: msg.user?.name,
        username: msg.user?.username,
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
      members: s.members.map(mapMemberData),
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

/**
 * Creates a new space with the authenticated user as admin
 *
 * @param name - Space name
 * @param description - Optional space description
 * @param iconUrl - Optional space icon URL
 * @returns Created space data
 */
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
      members: {
        select: {
          spaceId: true,
          userId: true,
          role: true,
          joinedAt: true,
          updatedAt: true,
          user: true,
        },
      },
    },
  })) as Prisma.SpaceGetPayload<{
    include: {
      members: {
        select: {
          spaceId: true;
          userId: true;
          role: true;
          joinedAt: true;
          updatedAt: true;
          user: true;
        };
      };
    };
  }>;

  const spaceData = {
    id: space.id,
    name: space.name,
    icon: space.icon ?? undefined,
    description: space.description ?? undefined,
    createdAt: space.createdAt.toISOString(),
    members: space.members.map(mapMemberData),
    messages: [],
    notes: [],
  };

  if (pusherServer) {
    await pusherServer.trigger("global", "space:created", {
      space: spaceData,
    });
  }

  return spaceData;
}

export type CreateSpaceFormState = {
  error?: string;
  success?: string;
  created?: SpaceWithNotes;
};

/**
 * Creates a space from form data with file upload support
 *
 * @param _prevState - Previous form state (unused)
 * @param formData - Form data containing name, description, and optional icon file
 * @returns Form state with success/error information
 */
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
      if (blobFile.size > 0) {
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
        const nodeBuffer =
          typeof Buffer !== "undefined"
            ? Buffer.from(arrayBuffer)
            : new Uint8Array(arrayBuffer);
        await blockBlob.uploadData(nodeBuffer as unknown as Buffer, {
          blobHTTPHeaders: { blobContentType: contentType },
        });
        iconUrl = blockBlob.url;
      }
    }

    const created = await createSpace(name, description, iconUrl);
    return { success: "Space created", created };
  } catch (err) {
    console.error("createSpaceFromForm error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return { error: message };
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
  if (existing) return `${spaceId}:${userId}`;

  const member = await prisma.spaceMember.create({
    data: { spaceId, userId, role: "MEMBER" },
    include: { user: true },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "member:joined", {
      spaceId,
      member: {
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
        user: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          avatar: user?.avatar,
        },
      },
    });
  }

  return `${member.spaceId}:${member.userId}`;
}

/**
 * Gets detailed information about a specific space including messages and notes
 *
 * @param spaceId - The ID of the space to retrieve
 * @returns Complete space data with messages, notes, and members
 */
export async function getSpaceDetail(spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  await requireAuth();

  const spaceBase = (await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      members: {
        select: {
          spaceId: true,
          userId: true,
          role: true,
          joinedAt: true,
          updatedAt: true,
          user: true,
        },
      },
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
    members: spaceBase.members.map((m) => mapMemberData(m)),
    messages: messages.map((msg) => {
      const isAct = isActivityContent(msg.content);
      const mapped = {
        id: Number(msg.id),
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

/**
 * Removes the authenticated user from a space
 *
 * @param spaceId - The ID of the space to leave
 * @returns Success message
 */
export async function leaveSpace(spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  const { id: userId } = await requireAuth();

  let remainingAfter = 0;
  await prisma.$transaction(async (tx) => {
    await tx.spaceMember.deleteMany({ where: { spaceId, userId } });

    const remaining = await tx.spaceMember.count({ where: { spaceId } });
    remainingAfter = remaining;

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

  try {
    if (remainingAfter > 0) {
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      const displayName = me?.name || me?.email || "Someone";
      await sendActivityMessage(
        spaceId,
        `<strong>${displayName}</strong> left the space`
      );

      if (pusherServer) {
        await pusherServer.trigger(`space-${spaceId}`, "member:left", {
          spaceId,
          userId,
          displayName,
        });
      }
    } else {
      if (pusherServer) {
        await pusherServer.trigger("global", "space:deleted", {
          spaceId,
        });
      }
    }
  } catch {}

  return { success: true } as const;
}

/**
 * Creates a secure invite link for a space (admin only)
 *
 * @param spaceId - The ID of the space to create invite for
 * @param expiresInMinutes - Link expiration time in minutes (default: 60)
 * @returns Invite link URL
 */
export async function createInviteLink(spaceId: string, expiresInMinutes = 60) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) throw new Error("Invalid space id");
  const { id: userId } = await requireAuth();

  const membership = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { role: true },
  });
  if (!membership || membership.role !== "ADMIN") {
    throw new Error("Forbidden: only admin can generate invite link");
  }

  const expSec = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const payload = `${spaceId}.${expSec}`;
  const secret = process.env.INVITE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Missing INVITE_SECRET/NEXTAUTH_SECRET");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const url = `/join?space=${encodeURIComponent(
    spaceId
  )}&exp=${expSec}&sig=${encodeURIComponent(sig)}`;
  return { url } as const;
}

export async function setMemberRole(
  spaceId: string,
  targetUserId: string,
  role: "ADMIN" | "MEMBER"
) {
  const parsedId = spaceIdSchema.safeParse(spaceId);
  if (!parsedId.success) throw new Error("Invalid space id");
  const { id: actorId } = await requireAuth();

  const isAdmin = await checkAdminPermission(spaceId, actorId);
  if (!isAdmin) throw new Error("Forbidden: only admin can change roles");

  await prisma.spaceMember.update({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
    data: { role },
  });

  const updatedMembers = await prisma.spaceMember.findMany({
    where: { spaceId },
    select: {
      spaceId: true,
      userId: true,
      role: true,
      joinedAt: true,
      updatedAt: true,
      user: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true, email: true },
  });
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { name: true, email: true },
  });
  const actorName = getUserDisplayName(actor);
  const targetName = getUserDisplayName(target);

  const message =
    role === "ADMIN"
      ? createMemberActivityMessage("made_admin", actorName, targetName)
      : createMemberActivityMessage("role_changed", actorName, targetName);

  await sendActivityMessageSafe(spaceId, message);

  // Broadcast member role change via Pusher
  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "member:role-changed", {
      spaceId,
      targetUserId,
      role,
      members: updatedMembers.map(mapMemberData),
    });
  }

  return updatedMembers.map(mapMemberData);
}

/**
 * Removes a member from a space (admin only)
 *
 * @param spaceId - The ID of the space
 * @param targetUserId - The ID of the user to remove
 * @returns Updated member list
 */
export async function removeMember(spaceId: string, targetUserId: string) {
  const parsedId = spaceIdSchema.safeParse(spaceId);
  if (!parsedId.success) throw new Error("Invalid space id");
  const { id: actorId } = await requireAuth();

  const isAdmin = await checkAdminPermission(spaceId, actorId);
  if (!isAdmin) throw new Error("Forbidden: only admin can remove members");

  await prisma.spaceMember.delete({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
  });

  const updatedMembers = await prisma.spaceMember.findMany({
    where: { spaceId },
    select: {
      spaceId: true,
      userId: true,
      role: true,
      joinedAt: true,
      updatedAt: true,
      user: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true, email: true },
  });
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { name: true, email: true },
  });
  const actorName = getUserDisplayName(actor);
  const targetName = getUserDisplayName(target);

  const message = createMemberActivityMessage("removed", actorName, targetName);
  await sendActivityMessageSafe(spaceId, message);

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "member:removed", {
      spaceId,
      targetUserId,
      members: updatedMembers.map(mapMemberData),
    });
  }

  return updatedMembers.map(mapMemberData);
}

/**
 * Updates space information (admin only)
 *
 * @param spaceId - The ID of the space to update
 * @param payload - Object containing new name and optional description
 * @returns Updated space information
 */
export async function updateSpaceInfo(
  spaceId: string,
  payload: { name: string; description?: string }
) {
  const parsedId = spaceIdSchema.safeParse(spaceId);
  if (!parsedId.success) throw new Error("Invalid space id");
  const nameParsed = spaceNameSchema.safeParse(payload.name);
  if (!nameParsed.success) throw new Error("Invalid space name");
  const descParsed = spaceDescriptionSchema.safeParse(payload.description);
  if (!descParsed.success) throw new Error("Invalid description");

  const { id: userId } = await requireAuth();

  const membership = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { role: true },
  });
  if (!membership || membership.role !== "ADMIN") {
    throw new Error("Forbidden: only admin can update space");
  }

  const updated = await prisma.space.update({
    where: { id: spaceId },
    data: {
      name: nameParsed.data,
      description: descParsed.data,
    },
    select: { id: true, name: true, description: true },
  });

  try {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const displayName = me?.name || me?.email || "Someone";
    await sendActivityMessage(
      spaceId,
      `<strong>${displayName}</strong> just updated the space info`
    );
  } catch {}

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "space:info-updated", {
      spaceId,
      name: updated.name,
      description: updated.description,
    });
  }

  return updated;
}

async function uploadIconToAzureIfAny(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string") return undefined as string | undefined;
  const blobFile = file as File;
  if (blobFile.size <= 0) return undefined;
  if (blobFile.size > 5 * 1024 * 1024) throw new Error("Max file size is 5MB");
  const contentType = blobFile.type || "application/octet-stream";
  if (!/^image\//.test(contentType))
    throw new Error("Only image files are allowed");

  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  if (!containerName) throw new Error("Missing AZURE_STORAGE_CONTAINER env");

  let blobService: BlobServiceLike | null = null;
  if (conn && conn.length > 0) {
    blobService = BlobServiceClient.fromConnectionString(
      conn
    ) as unknown as BlobServiceLike;
  } else if (accountName && accountKey) {
    const { StorageSharedKeyCredential } = await import("@azure/storage-blob");
    const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);
    blobService = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKey
    ) as unknown as BlobServiceLike;
  } else {
    throw new Error("Missing Azure Storage credentials");
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
  return blockBlob.url as string;
}

export type UpdateSpaceFormState = {
  error?: string;
  success?: string;
  updated?: { name: string; description?: string; icon?: string };
};

export async function updateSpaceFromForm(
  _prev: UpdateSpaceFormState,
  formData: FormData
): Promise<UpdateSpaceFormState> {
  try {
    const rawSpaceId = (formData.get("spaceId") as string | null) ?? "";
    const parsedId = spaceIdSchema.safeParse(rawSpaceId);
    if (!parsedId.success) return { error: "Invalid space id" };
    const name = ((formData.get("name") as string | null) ?? "").trim();
    const description = (
      (formData.get("description") as string | null) ?? ""
    ).trim();
    const nameOk = spaceNameSchema.safeParse(name);
    if (!nameOk.success) return { error: "Invalid name" };
    const descOk = spaceDescriptionSchema.safeParse(description || undefined);
    if (!descOk.success) return { error: "Invalid description" };

    const { id: userId } = await requireAuth();
    const membership = await prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId: parsedId.data, userId } },
      select: { role: true },
    });
    if (!membership || membership.role !== "ADMIN")
      return { error: "Forbidden" };

    const iconUrl = await uploadIconToAzureIfAny(formData.get("icon"));

    const updated = await prisma.space.update({
      where: { id: parsedId.data },
      data: {
        name,
        description: description || undefined,
        ...(iconUrl !== undefined ? { icon: iconUrl } : {}),
      },
      select: { name: true, description: true, icon: true },
    });

    try {
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      const displayName = me?.name || me?.email || "Someone";
      await sendActivityMessage(
        parsedId.data,
        `<strong>${displayName}</strong> just updated the space info`
      );
    } catch {}

    if (pusherServer) {
      await pusherServer.trigger(
        `space-${parsedId.data}`,
        "space:info-updated",
        {
          spaceId: parsedId.data,
          name: updated.name,
          description: updated.description,
          icon: updated.icon,
        }
      );
    }

    return {
      success: "Space updated",
      updated: {
        name: updated.name,
        description: updated.description ?? undefined,
        icon: updated.icon ?? undefined,
      },
    };
  } catch (err) {
    console.error("updateSpaceFromForm error:", err);
    return { error: "Internal server error" };
  }
}
