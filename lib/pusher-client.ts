import Pusher from "pusher-js";

declare global {
  interface Window {
    __pusherClient?: Pusher | null;
  }
}

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

if (!pusherKey) {
  console.warn("⚠️ NEXT_PUBLIC_PUSHER_KEY is not set. Pusher will not work.");
}

export const pusherClient =
  (typeof window !== "undefined" && window.__pusherClient) ||
  (pusherKey ? new Pusher(pusherKey, { cluster: pusherCluster }) : null);

if (typeof window !== "undefined") {
  window.__pusherClient = pusherClient;
}
