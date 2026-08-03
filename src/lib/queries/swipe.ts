import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { swipeSignals } from "@/db/schema";

/**
 * Voorkeurssignaal per swipe (rechts = leuk, links = sla ik over): voedt de
 * bèta-smaakmodus. Nooit het swipen zelf laten breken op statistiek (kernpad).
 */
export async function recordSwipeSignal(
  list: { id: number; householdId: number | null },
  catalogKey: string,
  liked: boolean
): Promise<void> {
  try {
    await db
      .insert(swipeSignals)
      .values({
        listId: list.id,
        householdId: list.householdId,
        catalogKey,
        likes: liked ? 1 : 0,
        skips: liked ? 0 : 1,
      })
      .onConflictDoUpdate({
        target: [swipeSignals.listId, swipeSignals.catalogKey],
        set: liked
          ? { likes: sql`${swipeSignals.likes} + 1`, lastAt: sql`now()`, householdId: list.householdId }
          : { skips: sql`${swipeSignals.skips} + 1`, lastAt: sql`now()`, householdId: list.householdId },
      });
  } catch {}
}

/** Geleerde voorkeur (likes min skips) per catalogusitem, huishouden-breed waar mogelijk */
export async function swipeSignalsFor(list: {
  id: number;
  householdId: number | null;
}): Promise<{ key: string; score: number }[]> {
  const rows = await db
    .select({ key: swipeSignals.catalogKey, likes: swipeSignals.likes, skips: swipeSignals.skips })
    .from(swipeSignals)
    .where(
      list.householdId
        ? eq(swipeSignals.householdId, list.householdId)
        : eq(swipeSignals.listId, list.id)
    );
  const merged = new Map<string, number>();
  for (const r of rows) merged.set(r.key, (merged.get(r.key) ?? 0) + (r.likes - r.skips));
  return [...merged.entries()].map(([key, score]) => ({ key, score }));
}
