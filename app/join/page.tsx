import { redirect } from "next/navigation";
import crypto from "crypto";
import { joinSpace, getSpaceDetail } from "@/app/actions/spaces";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendActivityMessage } from "@/app/actions/messages";
import { Avatar, Button, Heading } from "@/components";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function verifySignature(spaceId: string, expSec: number, sig: string) {
  const secret = process.env.INVITE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Missing INVITE_SECRET/NEXTAUTH_SECRET");
  const payload = `${spaceId}.${expSec}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { space?: string; exp?: string; sig?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const spaceId = (searchParams.space || "").trim();
  const expStr = (searchParams.exp || "").trim();
  const sig = (searchParams.sig || "").trim();
  if (!spaceId || !expStr || !sig) {
    redirect("/");
  }

  const expSec = Number(expStr);
  if (!Number.isFinite(expSec) || expSec < Math.floor(Date.now() / 1000)) {
    redirect("/");
  }

  let valid = false;
  try {
    valid = verifySignature(spaceId, expSec, sig);
  } catch {
    valid = false;
  }
  if (!valid) {
    redirect("/");
  }

  const space = await getSpaceDetail(spaceId);

  async function confirmJoin(formData: FormData) {
    "use server";
    const s = (formData.get("space") as string) || "";
    const e = Number((formData.get("exp") as string) || "0");
    const g = (formData.get("sig") as string) || "";
    if (!s || !e || !g) redirect("/");
    if (e < Math.floor(Date.now() / 1000)) redirect("/");
    let ok = false;
    try {
      ok = verifySignature(s, e, g);
    } catch {}
    if (!ok) redirect("/");

    const ses = await getServerSession(authOptions);
    const userId = ses?.user?.id;
    if (!userId) redirect("/");

    const existing = await prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId: s, userId } },
    select: { spaceId: true },
    });
    if (existing) {
      redirect("/");
    }

    await joinSpace(s);
    const displayName = ses.user.name || ses.user.email || "Someone";
    try {
      await sendActivityMessage(
        s,
        `<strong>${displayName}</strong> joined the space`
      );
    } catch {}
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar
            size="xl"
            src={space.icon && space.icon.length > 0 ? space.icon : undefined}
            className="mb-3"
          >
            {(!space.icon || space.icon.length === 0) &&
              space.name.charAt(0).toUpperCase()}
          </Avatar>
          <Heading level={6} className="text-gray-900">
            Join “{space.name}”?
          </Heading>
          <div className="text-sm text-gray-600 mt-1">
            {space.members?.length || 0}{" "}
            {space.members?.length === 1 ? "member" : "members"}
          </div>
        </div>
        <form action={confirmJoin} className="mt-6 space-y-3">
          <input type="hidden" name="space" value={spaceId} />
          <input type="hidden" name="exp" value={String(expSec)} />
          <input type="hidden" name="sig" value={sig} />
          <Button type="submit" variant="send" className="w-full rounded-full">
            Join Space
          </Button>
          <Link
            href="/"
            className="block w-full text-center text-indigo-600 text-sm py-2"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
