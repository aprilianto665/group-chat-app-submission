/**
 * Message Utility Functions
 *
 * This module provides utilities for creating and formatting messages.
 * Includes functions for generating message IDs and creating activity messages.
 */

import type { Message } from "@/types";

/**
 * Generates a unique message ID using current timestamp
 * Uses Date.now() converted to string for simplicity and uniqueness
 *
 * @returns Unique message ID string
 */
export const createMessageId = (): string => String(Date.now());

/**
 * Creates a formatted activity message for note operations
 * Generates HTML-formatted messages for note editing, deletion, and creation
 *
 * @param action - Type of action performed on the note
 * @param noteTitle - Title of the note being acted upon
 * @param senderName - Optional name of the user performing the action
 * @returns Formatted activity message object
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
 * Creates a generic activity message with custom content
 * Allows for flexible activity message creation with any HTML content
 *
 * @param content - HTML content for the activity message
 * @param senderName - Optional name of the user performing the action
 * @returns Generic activity message object
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
