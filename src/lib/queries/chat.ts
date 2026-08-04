import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { listMessages, users } from "@/db/schema";

export type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  itemLabel: string | null;
  producerSlug: string | null;
  producerName: string | null;
  body: string;
  createdAt: Date;
};

/** "Cheffs": de nieuwste `limit` berichten van een lijst, in chatvolgorde (oudste eerst) */
export async function messagesForList(listId: number, limit = 50): Promise<ChatMessage[]> {
  const rows = await db
    .select({
      id: listMessages.id,
      userId: listMessages.userId,
      userName: users.name,
      itemLabel: listMessages.itemLabel,
      producerSlug: listMessages.producerSlug,
      producerName: listMessages.producerName,
      body: listMessages.body,
      createdAt: listMessages.createdAt,
    })
    .from(listMessages)
    .innerJoin(users, eq(users.id, listMessages.userId))
    .where(eq(listMessages.listId, listId))
    // Nieuwste `limit` berichten ophalen (desc), daarna omkeren naar
    // chatvolgorde: met alleen `asc` + limit kreeg je de oudste in plaats van
    // de nieuwste berichten te zien zodra een lijst er meer dan `limit` had.
    .orderBy(desc(listMessages.createdAt), desc(listMessages.id))
    .limit(limit);
  return rows.reverse();
}

/** Rate limit voor Cheffs: hoeveel berichten stuurde deze gebruiker de laatste `windowMs`? */
export async function countRecentMessagesByUser(
  userId: number,
  windowMs: number
): Promise<number> {
  const since = new Date(Date.now() - windowMs);
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(listMessages)
    .where(and(eq(listMessages.userId, userId), gte(listMessages.createdAt, since)));
  return row?.n ?? 0;
}

export async function sendListMessage(
  listId: number,
  userId: number,
  body: string,
  anchors: {
    item?: { id: number; label: string } | null;
    producer?: { slug: string; name: string } | null;
  } = {}
): Promise<void> {
  await db.insert(listMessages).values({
    listId,
    userId,
    body,
    itemId: anchors.item?.id ?? null,
    itemLabel: anchors.item?.label ?? null,
    producerSlug: anchors.producer?.slug ?? null,
    producerName: anchors.producer?.name ?? null,
  });
}
