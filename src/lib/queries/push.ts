import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/** Opslaan of vervangen (endpoint is uniek per browser-installatie) */
export async function upsertPushSubscription(
  userId: number,
  sub: PushSubscriptionInput
): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ userId, ...sub })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh: sub.p256dh, auth: sub.auth },
    });
}

export async function removePushSubscription(userId: number, endpoint: string): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

/** Best-effort opruimen als de browser een subscription niet meer kent (404/410) */
export async function removePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function pushSubscriptionsForUser(
  userId: number
): Promise<PushSubscriptionInput[]> {
  return db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}
