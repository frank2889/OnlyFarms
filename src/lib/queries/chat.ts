import { asc, eq } from "drizzle-orm";
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

/** "Cheffs": de laatste berichten van een lijst, oudste eerst (chatvolgorde) */
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
    .orderBy(asc(listMessages.createdAt), asc(listMessages.id))
    .limit(limit);
  return rows;
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
