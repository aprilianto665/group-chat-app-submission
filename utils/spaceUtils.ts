/**
 * Space Management Utilities
 *
 * This module provides utilities for space-related operations including:
 * - Member data mapping and formatting
 * - Permission checking (admin/member roles)
 * - Activity message creation and sending
 * - User display name formatting
 */

import { prisma } from "@/lib/prisma";
import { sendActivityMessage } from "@/app/actions/messages";

/**
 * Type definition for member-like objects from database
 * Represents space member data with user information
 */
type MemberLike = {
  spaceId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt?: Date;
  createdAt?: Date;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string | null;
  };
};

/**
 * Maps raw member data from database to formatted member object
 * Converts dates to ISO strings and handles null avatar values
 *
 * @param member - Raw member data from database
 * @returns Formatted member object with proper data types
 */
export const mapMemberData = (member: MemberLike) => ({
  spaceId: member.spaceId,
  userId: member.userId,
  role: member.role,
  joinedAt: (member.joinedAt ?? member.createdAt)?.toISOString(),
  user: {
    id: member.user.id,
    name: member.user.name,
    username: member.user.username,
    email: member.user.email,
    avatar: member.user.avatar ?? undefined,
  },
});

/**
 * Gets display name for a user with fallback options
 * Returns name, email, or "Someone" as fallback
 *
 * @param user - User object with optional name and email
 * @returns Display name string for the user
 */
export const getUserDisplayName = (
  user: { name?: string; email?: string } | null
): string => {
  return user?.name || user?.email || "Someone";
};

/**
 * Checks if a user has admin permissions in a specific space
 * Queries database to verify user's role in the space
 *
 * @param spaceId - ID of the space to check
 * @param userId - ID of the user to check
 * @returns Promise resolving to true if user is admin, false otherwise
 */
export const checkAdminPermission = async (
  spaceId: string,
  userId: string
): Promise<boolean> => {
  const membership = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { role: true },
  });
  return membership?.role === "ADMIN";
};

/**
 * Sends activity message with error handling
 * Wraps sendActivityMessage with try-catch to prevent failures from breaking the flow
 *
 * @param spaceId - ID of the space to send message to
 * @param content - HTML content of the activity message
 * @returns Promise that resolves when message is sent or fails silently
 */
export const sendActivityMessageSafe = async (
  spaceId: string,
  content: string
): Promise<void> => {
  try {
    await sendActivityMessage(spaceId, content);
  } catch (error) {
    console.warn("Failed to send activity message:", error);
  }
};

/**
 * Creates formatted activity message for member-related actions
 * Generates HTML-formatted messages for member operations
 *
 * @param action - Type of member action performed
 * @param actorName - Name of the user performing the action
 * @param targetName - Name of the user being acted upon
 * @returns HTML-formatted activity message string
 */
export const createMemberActivityMessage = (
  action: "added" | "removed" | "role_changed" | "made_admin",
  actorName: string,
  targetName: string
): string => {
  const messages = {
    added: `<strong>${actorName}</strong> joined the space`,
    removed: `<strong>${actorName}</strong> removed <strong>${targetName}</strong> from the space`,
    role_changed: `<strong>${actorName}</strong> changed <strong>${targetName}</strong>'s role`,
    made_admin: `<strong>${actorName}</strong> made <strong>${targetName}</strong> an admin`,
  };

  return messages[action];
};
