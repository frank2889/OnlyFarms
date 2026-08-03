import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offers, sellers } from "@/db/schema";

/** De verkoper die aan dit gebruikersaccount gekoppeld is (elke status) */
export async function sellerForUser(userId: number) {
  const [row] = await db.select().from(sellers).where(eq(sellers.userId, userId));
  return row ?? null;
}

/* ---------- Producten (offers): prikbord-model, geen betalingen ---------- */

export type OfferInput = {
  title: string;
  category: string | null;
  description: string | null;
  priceIndication: string | null;
  photoUrl: string | null;
  available: boolean;
};

export async function offersForSeller(sellerId: number) {
  return db
    .select()
    .from(offers)
    .where(eq(offers.sellerId, sellerId))
    .orderBy(desc(offers.available), asc(offers.title));
}

export async function offerByIdForSeller(offerId: number, sellerId: number) {
  const [row] = await db
    .select()
    .from(offers)
    .where(and(eq(offers.id, offerId), eq(offers.sellerId, sellerId)));
  return row ?? null;
}

export async function createOffer(sellerId: number, input: OfferInput): Promise<number> {
  const [row] = await db
    .insert(offers)
    .values({ sellerId, ...input })
    .returning({ id: offers.id });
  return row.id;
}

/**
 * Update is altijd gescopet op de eigenaar (sellerId in de where).
 * unpublish: inhoudelijke wijzigingen gaan terug de controle-wachtrij in.
 */
export async function updateOffer(
  offerId: number,
  sellerId: number,
  input: OfferInput,
  opts: { unpublish?: boolean } = {}
): Promise<void> {
  await db
    .update(offers)
    .set({ ...input, ...(opts.unpublish ? { published: false } : {}), updatedAt: new Date() })
    .where(and(eq(offers.id, offerId), eq(offers.sellerId, sellerId)));
}

export async function deleteOffer(offerId: number, sellerId: number): Promise<void> {
  await db.delete(offers).where(and(eq(offers.id, offerId), eq(offers.sellerId, sellerId)));
}

/**
 * Publiek aanbod voor de producentpagina: alleen beschikbaar, door het team
 * goedgekeurd (published) en van een nog steeds goedgekeurde verkoper (een
 * geschorste verkoper houdt zijn claim maar zijn aanbod verdwijnt).
 */
export async function publicOffersForSeller(sellerId: number) {
  return db
    .select({
      id: offers.id,
      title: offers.title,
      category: offers.category,
      description: offers.description,
      priceIndication: offers.priceIndication,
      photoUrl: offers.photoUrl,
    })
    .from(offers)
    .innerJoin(sellers, eq(sellers.id, offers.sellerId))
    .where(
      and(
        eq(offers.sellerId, sellerId),
        eq(offers.available, true),
        eq(offers.published, true),
        eq(sellers.status, "goedgekeurd")
      )
    )
    .orderBy(asc(offers.title))
    .limit(60);
}
