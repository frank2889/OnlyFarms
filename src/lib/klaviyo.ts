// Server-side events naar Klaviyo; Sally bouwt daar de flows op.
// Zonder KLAVIYO_PRIVATE_KEY wordt er stilletjes niets verstuurd.

export async function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  email?: string
): Promise<void> {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key) return;
  try {
    await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        "Content-Type": "application/json",
        revision: "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: event } } },
            properties,
            profile: {
              data: {
                type: "profile",
                attributes: { email: email ?? "anoniem@platform.local" },
              },
            },
          },
        },
      }),
    });
  } catch {
    // events zijn best-effort
  }
}
