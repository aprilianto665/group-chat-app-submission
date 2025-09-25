/**
 * Pusher Client Configuration
 *
 * This module configures the Pusher client for real-time WebSocket communication on the client side.
 * Handles environment variable validation and singleton pattern for development.
 * Provides real-time messaging capabilities for the application.
 */

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

/**
 * Pusher client instance for real-time communication
 * Returns null if environment variables are not configured
 * Uses singleton pattern to prevent multiple instances
 */
export const pusherClient =
  (typeof window !== "undefined" && window.__pusherClient) ||
  (pusherKey ? new Pusher(pusherKey, { cluster: pusherCluster }) : null);

if (typeof window !== "undefined") {
  window.__pusherClient = pusherClient;
}
