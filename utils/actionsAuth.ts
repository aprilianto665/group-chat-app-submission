import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isUuidLike(value: string | undefined | null) {
  if (!value) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value
  );
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const baseUser = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };

  if (isUuidLike(baseUser.id)) {
    return baseUser;
  }

  if (baseUser.email && baseUser.email.length > 0) {
    const dbUser = await prisma.user.findUnique({
      where: { email: baseUser.email },
    });
    if (dbUser) {
      return { ...baseUser, id: dbUser.id };
    }
  }

  throw new Error(
    "Your session is outdated. Please sign out and sign in again to refresh your account."
  );
}
