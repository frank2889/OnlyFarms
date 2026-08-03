import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listMessages, users } from "@/db/schema";

export type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  itemLabel: string | null;
  body: string;
  createdAt: Date;
};

/** "Chefs": de laatste berichten van een lijst, oudste eerst (chatvolgorde) */
export async function messagesForList(listId: number, limit = 50): Promise<ChatMessage[]> {
  const rows = await db
    .select({
      id: listMessages.id,
      userId: listMessages.userId,
      userName: users.name,
      itemLabel: listMessages.itemLabel,
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
  item?: { id: number; label: string } | null
): Promise<void> {
  await db.insert(listMessages).values({
    listId,
    userId,
    body,
    itemId: item?.id ?? null,
    itemLabel: item?.label ?? null,
  });
}
