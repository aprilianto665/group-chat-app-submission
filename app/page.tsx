import { AppWrapper } from "@/components/organisms/AppWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const u = (session?.user || {}) as unknown as {
    id?: string;
    username?: string;
    avatar?: string;
    name?: string | null;
    email?: string | null;
  };
  const user = {
    id: u.id ?? "",
    name: u.name ?? "",
    username: u.username ?? "",
    email: u.email ?? "",
    avatar: u.avatar ?? "/avatar_default.jpg",
  };

  return <AppWrapper user={user} />;
}
