/**
 * Activity Message Utilities
 *
 * This module provides utilities for handling activity messages:
 * - Activity message prefix identification
 * - Content filtering and processing
 * - Message type differentiation
 */

/**
 * Prefix used to identify activity messages in the database
 */
export const ACTIVITY_PREFIX = "__ACTIVITY__:";

/**
 * Checks if a message content is an activity message
 *
 * @param content - Message content to check
 * @returns true if the content is an activity message
 */
export function isActivityContent(content: string): boolean {
  return content.startsWith(ACTIVITY_PREFIX);
}

/**
 * Removes the activity prefix from message content
 *
 * @param content - Message content with activity prefix
 * @returns Content without the activity prefix
 */
export function stripActivityPrefix(content: string): string {
  return content.replace(ACTIVITY_PREFIX, "");
}
