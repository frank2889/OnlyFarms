import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { swipeSignals } from "@/db/schema";

/**
 * Voorkeurssignaal per swipe (rechts = leuk, links = sla ik over): voedt de
 * bèta-smaakmodus. Smaak is persoonlijk: ingelogd hoort het signaal bij de
 * gebruiker (gezinsleden verschillen), anoniem bij de lijst. Nooit het swipen
 * zelf laten breken op statistiek (kernpad).
 */
export async function recordSwipeSignal(
  scope: { listId: number; householdId: number | null; userId: number | null },
  catalogKey: string,
  liked: boolean
): Promise<void> {
  try {
    await db
      .insert(swipeSignals)
      .values({
        listId: scope.listId,
        householdId: scope.householdId,
        userId: scope.userId,
        catalogKey,
        likes: liked ? 1 : 0,
        skips: liked ? 0 : 1,
      })
      .onConflictDoUpdate({
        target: [swipeSignals.listId, swipeSignals.catalogKey, swipeSignals.userId],
        set: liked
          ? { likes: sql`${swipeSignals.likes} + 1`, lastAt: sql`now()` }
          : { skips: sql`${swipeSignals.skips} + 1`, lastAt: sql`now()` },
      });
  } catch {}
}

export type TasteProfile = {
  top: { key: string; likes: number }[];
  flop: { key: string; skips: number }[];
};

/**
 * Het geleerde smaakprofiel voor op /profiel: wat swipe je het vaakst naar
 * rechts (top) en naar links (flop). Transparantie: de gebruiker mag zien wat
 * het systeem leerde, en het wissen via resetTasteProfile.
 */
export async function tasteProfileFor(userId: number, limit = 5): Promise<TasteProfile> {
  const rows = await db
    .select({ key: swipeSignals.catalogKey, likes: swipeSignals.likes, skips: swipeSignals.skips })
    .from(swipeSignals)
    .where(eq(swipeSignals.userId, userId));
  const merged = new Map<string, { likes: number; skips: number }>();
  for (const r of rows) {
    const cur = merged.get(r.key) ?? { likes: 0, skips: 0 };
    merged.set(r.key, { likes: cur.likes + r.likes, skips: cur.skips + r.skips });
  }
  const all = [...merged.entries()];
  return {
    top: all
      .filter(([, v]) => v.likes > 0)
      .sort((a, b) => b[1].likes - a[1].likes)
      .slice(0, limit)
      .map(([key, v]) => ({ key, likes: v.likes })),
    flop: all
      .filter(([, v]) => v.skips > 0)
      .sort((a, b) => b[1].skips - a[1].skips)
      .slice(0, limit)
      .map(([key, v]) => ({ key, skips: v.skips })),
  };
}

/** Wis het persoonlijke smaakprofiel (datacontrole voor de gebruiker) */
export async function resetTasteProfile(userId: number): Promise<void> {
  await db.delete(swipeSignals).where(eq(swipeSignals.userId, userId));
}

/**
 * Geleerde voorkeur (likes min skips) per catalogusitem. Ingelogd: het eigen
 * profiel over alle lijsten heen; anoniem: alleen deze lijst zonder gebruiker.
 */
export async function swipeSignalsFor(scope: {
  listId: number;
  userId: number | null;
}): Promise<{ key: string; score: number }[]> {
  const rows = await db
    .select({ key: swipeSignals.catalogKey, likes: swipeSignals.likes, skips: swipeSignals.skips })
    .from(swipeSignals)
    .where(
      scope.userId != null
        ? eq(swipeSignals.userId, scope.userId)
        : and(eq(swipeSignals.listId, scope.listId), isNull(swipeSignals.userId))
    );
  const merged = new Map<string, number>();
  for (const r of rows) merged.set(r.key, (merged.get(r.key) ?? 0) + (r.likes - r.skips));
  return [...merged.entries()].map(([key, score]) => ({ key, score }));
}
