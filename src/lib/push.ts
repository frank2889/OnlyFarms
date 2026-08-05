import webpush from "web-push";
import { removePushSubscriptionByEndpoint } from "@/lib/queries/push";
import type { PushSubscriptionInput } from "@/lib/queries/push";

const configured = !!(
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
);

if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

/**
 * Best-effort push-verzending: een mislukte push (verlopen subscription,
 * geen VAPID-config lokaal) mag nooit het aanroepende pad breken. Een
 * 404/410 betekent dat de browser de subscription niet meer kent; die
 * ruimen we dan meteen op, anders blijven we 'm keer op keer proberen.
 */
export async function sendPush(
  sub: PushSubscriptionInput,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!configured) return;
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await removePushSubscriptionByEndpoint(sub.endpoint);
    }
  }
}
