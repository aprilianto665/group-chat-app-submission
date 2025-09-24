import type { Message } from "@/types";

/**
 * Creates a unique ID for messages using timestamp
 */
export const createMessageId = (): string => String(Date.now());

/**
 * Creates an activity message for note operations
 */
export const createActivityMessage = (
  action: "edited" | "deleted" | "added",
  noteTitle: string,
  senderName?: string
): Message => {
  const safeTitle = noteTitle || "Untitled";
  const safeSender = senderName ?? "Someone";

  const actionText = {
    edited: "just edited a note",
    deleted: "deleted a note",
    added: "just added a new note",
  }[action];

  return {
    id: createMessageId(),
    content: `<strong>${safeSender}</strong> ${actionText}: <strong>${safeTitle}</strong>`,
    timestamp: new Date().toISOString(),
    senderName,
    username: undefined,
    type: "activity",
  };
};

/**
 * Creates a generic activity message
 */
export const createGenericActivityMessage = (
  content: string,
  senderName?: string
): Message => ({
  id: createMessageId(),
  content,
  timestamp: new Date().toISOString(),
  senderName,
  username: undefined,
  type: "activity",
});
