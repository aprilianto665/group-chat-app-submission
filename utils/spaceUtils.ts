import { prisma } from "@/lib/prisma";
import { sendActivityMessage } from "@/app/actions/messages";

/**
 * Maps database member data to the expected format
 */
export const mapMemberData = (member: any) => ({
  id: member.id,
  role: member.role,
  joinedAt: member.createdAt.toISOString(),
  user: {
    id: member.user.id,
    name: member.user.name,
    username: member.user.username,
    email: member.user.email,
    avatar: member.user.avatar ?? undefined,
  },
});

/**
 * Gets user display name (name or email fallback)
 */
export const getUserDisplayName = (
  user: { name?: string; email?: string } | null
): string => {
  return user?.name || user?.email || "Someone";
};

/**
 * Checks if user is admin of a space
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
 */
export const sendActivityMessageSafe = async (
  spaceId: string,
  content: string
): Promise<void> => {
  try {
    await sendActivityMessage(spaceId, content);
  } catch (error) {
    // Silently fail for activity messages
    console.warn("Failed to send activity message:", error);
  }
};

/**
 * Creates activity message content for member operations
 */
export const createMemberActivityMessage = (
  action: "added" | "removed" | "role_changed" | "made_admin",
  actorName: string,
  targetName: string,
  role?: "ADMIN" | "MEMBER"
): string => {
  const messages = {
    added: `<strong>${actorName}</strong> joined the space`,
    removed: `<strong>${actorName}</strong> removed <strong>${targetName}</strong> from the space`,
    role_changed: `<strong>${actorName}</strong> changed <strong>${targetName}</strong>'s role`,
    made_admin: `<strong>${actorName}</strong> made <strong>${targetName}</strong> an admin`,
  };

  return messages[action];
};
