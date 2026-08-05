import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { producers, savedProducers } from "@/db/schema";

export async function isProducerSaved(householdId: number, producerId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: savedProducers.id })
    .from(savedProducers)
    .where(
      and(eq(savedProducers.householdId, householdId), eq(savedProducers.producerId, producerId))
    );
  return !!row;
}

/** Toggle voor het hele huishouden; retourneert de nieuwe staat */
export async function toggleSavedProducer(
  householdId: number,
  producerId: number,
  userId: number
): Promise<boolean> {
  const saved = await isProducerSaved(householdId, producerId);
  if (saved) {
    await db
      .delete(savedProducers)
      .where(
        and(
          eq(savedProducers.householdId, householdId),
          eq(savedProducers.producerId, producerId)
        )
      );
    return false;
  }
  await db.insert(savedProducers).values({ householdId, producerId, savedByUserId: userId });
  return true;
}

export type SavedProducer = {
  slug: string;
  name: string;
  city: string | null;
  savedAt: Date;
};

export async function savedProducersForHousehold(
  householdId: number,
  limit = 20
): Promise<SavedProducer[]> {
  const rows = await db
    .select({
      slug: producers.slug,
      name: producers.name,
      city: producers.city,
      savedAt: savedProducers.createdAt,
    })
    .from(savedProducers)
    .innerJoin(producers, eq(producers.id, savedProducers.producerId))
    .where(eq(savedProducers.householdId, householdId))
    .orderBy(desc(savedProducers.createdAt))
    .limit(limit);
  return rows;
}
