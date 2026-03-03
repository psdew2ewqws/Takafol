import webPush from "web-push";
import { prisma } from "@/lib/prisma";

// ─── VAPID Configuration ─────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@takafol.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface WebPushError extends Error {
  statusCode?: number;
  endpoint?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Deactivate a subscription in the database (e.g., after a 410 Gone response).
 */
async function deactivateSubscription(endpoint: string): Promise<void> {
  try {
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });
  } catch (err) {
    console.error("[push-notifications] Failed to deactivate subscription:", err);
  }
}

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send a push notification to a single subscription.
 * Automatically deactivates the subscription if the push service returns 410 Gone.
 *
 * @param subscription - The push subscription object (endpoint + keys).
 * @param payload      - The notification payload.
 */
export async function sendPushNotification(
  subscription: WebPushSubscription,
  payload: PushPayload,
): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[push-notifications] VAPID keys not configured, skipping send.");
    return;
  }

  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    const error = err as WebPushError;
    if (error.statusCode === 410) {
      // 410 Gone: the subscription is no longer valid — deactivate it.
      console.info(
        "[push-notifications] Subscription gone (410), deactivating:",
        subscription.endpoint,
      );
      await deactivateSubscription(subscription.endpoint);
    } else {
      console.error(
        "[push-notifications] Failed to send notification to",
        subscription.endpoint,
        error.message,
      );
    }
  }
}

/**
 * Broadcast a push notification to all active subscriptions in batches of 100,
 * with a 100 ms delay between batches to avoid overwhelming push services.
 *
 * @param payload - The notification payload to broadcast.
 */
export async function broadcastNotification(payload: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[push-notifications] VAPID keys not configured, skipping broadcast.");
    return;
  }

  // Fetch all active subscriptions from the database
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { isActive: true },
    select: {
      endpoint: true,
      p256dhKey: true,
      authKey: true,
    },
  });

  if (subscriptions.length === 0) {
    console.info("[push-notifications] No active subscriptions to broadcast to.");
    return;
  }

  const BATCH_SIZE = 100;
  const BATCH_DELAY_MS = 100;

  console.info(
    `[push-notifications] Broadcasting to ${subscriptions.length} subscriptions in batches of ${BATCH_SIZE}.`,
  );

  for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
    const batch = subscriptions.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((sub) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dhKey,
              auth: sub.authKey,
            },
          },
          payload,
        ),
      ),
    );

    // Delay between batches (skip delay after the last batch)
    if (i + BATCH_SIZE < subscriptions.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.info("[push-notifications] Broadcast complete.");
}

/**
 * Send a streak milestone push notification to a specific user's devices.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function sendStreakMilestoneNotification(
  userId: string,
  streak: number,
): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      select: { endpoint: true, p256dhKey: true, authKey: true },
    });

    if (subscriptions.length === 0) return;

    const multiplierLabel =
      streak >= 30 ? "3x" : streak >= 14 ? "2.5x" : streak >= 7 ? "2x" : "1.5x";

    const payload: PushPayload = {
      title: `${streak}-Day Streak!`,
      body: `You're on fire! ${streak} days in a row. You now earn ${multiplierLabel} bonus points!`,
      icon: "/icons/icon-192x192.png",
      url: "/challenges",
    };

    await Promise.all(
      subscriptions.map((sub) =>
        sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
          payload,
        ),
      ),
    );
  } catch (error) {
    console.error("[push-notifications] Streak milestone notification failed:", error);
  }
}
