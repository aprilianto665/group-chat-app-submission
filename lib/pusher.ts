import Pusher from "pusher";

declare global {
  var __pusherServer: Pusher | null | undefined;
}

const pusherAppId = process.env.PUSHER_APP_ID;
const pusherKey = process.env.PUSHER_KEY;
const pusherSecret = process.env.PUSHER_SECRET;
const pusherCluster = process.env.PUSHER_CLUSTER || "ap1";

if (!pusherAppId || !pusherKey || !pusherSecret) {
  console.warn(
    "⚠️ Pusher environment variables are not set. Realtime features will not work."
  );
}

export const pusherServer =
  globalThis.__pusherServer ??
  (pusherAppId && pusherKey && pusherSecret
    ? new Pusher({
        appId: pusherAppId,
        key: pusherKey,
        secret: pusherSecret,
        cluster: pusherCluster,
        useTLS: true,
      })
    : null);

if (process.env.NODE_ENV !== "production") {
  globalThis.__pusherServer = pusherServer;
}
