import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { offers, sellers } from "@/db/schema";

export type ProducerEngagement = { picksTotal: number; picks30d: number; mentions: number };

/**
 * "Jouw bereik" voor het portaal: hoe vaak is deze producent gekozen als
 * ophaalpunt ("hier halen"/winkelkeuze) en genoemd in Cheffs. Geaggregeerd en
 * anoniem, zelfde privacylijn als het vraaginzicht.
 */
export async function producerEngagement(slug: string): Promise<ProducerEngagement> {
  const result = await db.execute(sql`
    select
      (select count(*) from list_items where producer_slug = ${slug}) as picks_total,
      (select count(*) from list_items where producer_slug = ${slug}
        and created_at >= now() - interval '30 days') as picks_30d,
      (select count(*) from list_messages where producer_slug = ${slug}) as mentions
  `);
  const row = result.rows[0] as Record<string, unknown>;
  return {
    picksTotal: Number(row.picks_total),
    picks30d: Number(row.picks_30d),
    mentions: Number(row.mentions),
  };
}

/** Contactpersoon-gegevens die de verkoper zelf mag beheren (e-mail blijft bij het team) */
export async function updateSellerContact(
  sellerId: number,
  patch: { contactName: string; phone: string | null }
): Promise<void> {
  await db
    .update(sellers)
    .set({ contactName: patch.contactName, phone: patch.phone })
    .where(eq(sellers.id, sellerId));
}

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
