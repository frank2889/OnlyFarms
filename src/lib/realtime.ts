import Pusher from "pusher";

// Realtime lijst-updates via Pusher Channels. Zonder env-keys valt de UI
// terug op polling — alles blijft werken, alleen minder direct.
let client: Pusher | null | undefined;

function pusher(): Pusher | null {
  if (client !== undefined) return client;
  const { PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER } =
    process.env;
  client =
    PUSHER_APP_ID && NEXT_PUBLIC_PUSHER_KEY && PUSHER_SECRET && NEXT_PUBLIC_PUSHER_CLUSTER
      ? new Pusher({
          appId: PUSHER_APP_ID,
          key: NEXT_PUBLIC_PUSHER_KEY,
          secret: PUSHER_SECRET,
          cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
          useTLS: true,
        })
      : null;
  return client;
}

export async function notifyListUpdated(token: string): Promise<void> {
  try {
    await pusher()?.trigger(`list-${token}`, "updated", {});
  } catch {
    // realtime is best-effort; polling vangt het op
  }
}
