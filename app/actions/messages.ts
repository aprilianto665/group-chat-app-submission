"use server";

/**
 * Message Management Server Actions
 *
 * This module handles all message-related operations including:
 * - Listing messages for a space
 * - Sending new messages
 * - Sending activity messages (for note operations)
 * - Real-time message broadcasting via Pusher
 *
 * All actions include:
 * - Authentication checks
 * - Input validation with Zod schemas
 * - Database operations with Prisma
 * - Real-time updates via Pusher
 * - Proper error handling
 */

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/actionsAuth";
import { ACTIVITY_PREFIX } from "@/utils/activity";
import {
  sendMessageSchema,
  sendActivitySchema,
} from "@/utils/validation/actions";
import { pusherServer } from "@/lib/pusher";

/**
 * Retrieves all messages for a specific space
 *
 * @param spaceId - The ID of the space to retrieve messages for
 * @returns Array of formatted message objects with user information
 * @throws Error if user is not authenticated
 */
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

/**
 * Sends a new message to a space and broadcasts it in real-time
 *
 * @param spaceId - The ID of the space to send the message to
 * @param content - The message content to send
 * @returns Formatted message object that was created
 * @throws Error if validation fails or user is not authenticated
 */
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

/**
 * Sends an activity message (for note operations) to a space
 * Activity messages are prefixed and used to notify users about note changes
 *
 * @param spaceId - The ID of the space to send the activity message to
 * @param htmlContent - The HTML content of the activity message
 * @returns Formatted activity message object that was created
 * @throws Error if validation fails or user is not authenticated
 */
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
