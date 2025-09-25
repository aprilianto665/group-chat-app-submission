import { prisma } from "@/lib/prisma";
import { sendActivityMessage } from "@/app/actions/messages";

type MemberLike = {
  spaceId: string;
  userId: string;
  id: string;
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

export const mapMemberData = (member: MemberLike) => ({
  spaceId: member.spaceId,
  userId: member.userId,
  id: member.id,
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

export const getUserDisplayName = (
  user: { name?: string; email?: string } | null
): string => {
  return user?.name || user?.email || "Someone";
};

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
