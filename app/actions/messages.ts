"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import { ACTIVITY_PREFIX } from "@/utils/activity";
import {
  sendMessageSchema,
  sendActivitySchema,
} from "@/utils/validation/actions";
import { pusherServer } from "@/lib/pusher";

export async function listMessages(spaceId: string) {
  await requireAuth();

  const msgs = await prisma.message.findMany({
    where: { spaceId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  return msgs.map((m) => ({
    id: Number(m.id),
    content: m.content,
    timestamp: m.createdAt.toISOString(),
    senderName: m.user?.name,
    username: m.user?.username,
    type: "text" as const,
  }));
}

export async function sendMessage(spaceId: string, content: string) {
  const parsed = sendMessageSchema.safeParse({ spaceId, content });
  if (!parsed.success) throw new Error("Invalid message payload");
  const user = await requireAuth();
  const userId = user.id as string;

  const created = await prisma.message.create({
    data: { spaceId, userId, content },
    include: { user: true },
  });

  const payload = {
    id: Number(created.id),
    content: created.content,
    timestamp: created.createdAt.toISOString(),
    senderName: created.user?.name,
    username: created.user?.username,
    type: "text" as const,
  };

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "message:new", payload);
  }

  return payload;
}

export async function sendActivityMessage(
  spaceId: string,
  htmlContent: string
) {
  const parsed = sendActivitySchema.safeParse({ spaceId, htmlContent });
  if (!parsed.success) throw new Error("Invalid activity payload");
  const user = await requireAuth();
  const userId = user.id as string;

  const created = await prisma.message.create({
    data: { spaceId, userId, content: `${ACTIVITY_PREFIX}${htmlContent}` },
    include: { user: true },
  });

  const payload = {
    id: Number(created.id),
    content: htmlContent,
    timestamp: created.createdAt.toISOString(),
    senderName: created.user?.name,
    username: created.user?.username,
    type: "activity" as const,
  };

  if (pusherServer) {
    await pusherServer.trigger(`space-${spaceId}`, "activity:new", payload);
  }

  return payload;
}
