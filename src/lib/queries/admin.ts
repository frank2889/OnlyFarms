import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { offers, producers, reports, sellerReviews, sellers } from "@/db/schema";
import { slugify } from "@/lib/slug";

// Alle beheer-queries bij elkaar. De aanroepende server actions checken
// requireAdminUser(); deze laag blijft framework-onafhankelijk.

/* ---------- Meldingen ---------- */

export type AdminReport = {
  id: number;
  message: string;
  reporterEmail: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  adminNote: string | null;
  createdAt: Date;
  producerId: number;
  producerName: string;
  producerSlug: string;
};

export async function listReports(resolved: boolean): Promise<AdminReport[]> {
  const rows = await db
    .select({
      id: reports.id,
      message: reports.message,
      reporterEmail: reports.reporterEmail,
      resolved: reports.resolved,
      resolvedAt: reports.resolvedAt,
      adminNote: reports.adminNote,
      createdAt: reports.createdAt,
      producerId: reports.producerId,
      producerName: producers.name,
      producerSlug: producers.slug,
    })
    .from(reports)
    .innerJoin(producers, eq(producers.id, reports.producerId))
    .where(eq(reports.resolved, resolved))
    .orderBy(desc(reports.createdAt))
    .limit(200);
  return rows;
}

export async function resolveReport(
  reportId: number,
  adminUserId: number,
  note?: string
): Promise<void> {
  await db
    .update(reports)
    .set({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: adminUserId,
      adminNote: note?.trim() || null,
    })
    .where(eq(reports.id, reportId));
}

export async function reopenReport(reportId: number): Promise<void> {
  await db
    .update(reports)
    .set({ resolved: false, resolvedAt: null, resolvedBy: null })
    .where(eq(reports.id, reportId));
}

/* ---------- Aanmeldingen (sellers) ---------- */

export type SellerStatus = (typeof sellers.status.enumValues)[number];

export async function listSellers(status?: SellerStatus) {
  return db
    .select({
      id: sellers.id,
      name: sellers.name,
      city: sellers.city,
      kvkNumber: sellers.kvkNumber,
      status: sellers.status,
      createdAt: sellers.createdAt,
    })
    .from(sellers)
    .where(status ? eq(sellers.status, status) : undefined)
    .orderBy(desc(sellers.createdAt))
    .limit(200);
}

export async function sellerById(id: number) {
  const [row] = await db.select().from(sellers).where(eq(sellers.id, id));
  return row ?? null;
}

/** Statuswissel; idempotent doordat de huidige status mee-filtert. */
export async function setSellerStatus(
  id: number,
  status: SellerStatus,
  reason?: string
): Promise<boolean> {
  const rows = await db
    .update(sellers)
    .set({
      status,
      statusReason: reason?.trim() || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(sellers.id, id), ne(sellers.status, status)))
    .returning({ id: sellers.id });
  return rows.length > 0;
}

/** Portaal-toegang: verkoper aan een gebruikersaccount koppelen (uniek per account) */
export async function linkSellerUser(sellerId: number, userId: number): Promise<boolean> {
  try {
    await db
      .update(sellers)
      .set({ userId, updatedAt: new Date() })
      .where(eq(sellers.id, sellerId));
    return true;
  } catch {
    // unique-constraint: dat account is al aan een andere verkoper gekoppeld
    return false;
  }
}

export async function unlinkSellerUser(sellerId: number): Promise<void> {
  await db.update(sellers).set({ userId: null, updatedAt: new Date() }).where(eq(sellers.id, sellerId));
}

/** De vermelding die aan deze verkoper gekoppeld is (na goedkeuring) */
export async function producerForSeller(sellerId: number) {
  const [row] = await db
    .select({ id: producers.id, name: producers.name, slug: producers.slug })
    .from(producers)
    .where(eq(producers.claimedBySellerId, sellerId));
  return row ?? null;
}

/** Gids-vermelding zoeken om een goedgekeurde verkoper aan te koppelen */
export async function adminSearchProducers(query: string) {
  const q = `%${query.trim()}%`;
  return db
    .select({
      id: producers.id,
      name: producers.name,
      city: producers.city,
      slug: producers.slug,
      isMember: producers.isMember,
      status: producers.status,
    })
    .from(producers)
    .where(or(ilike(producers.name, q), ilike(producers.city, q)))
    .orderBy(producers.name)
    .limit(10);
}

export async function linkSellerToProducer(
  sellerId: number,
  producerId: number,
  sellerEmail: string
): Promise<void> {
  await db
    .update(producers)
    .set({
      claimedBySellerId: sellerId,
      claimedByEmail: sellerEmail,
      isMember: true,
      updatedAt: new Date(),
    })
    .where(eq(producers.id, producerId));
}

/** Nieuw producer-record voor een goedgekeurde verkoper zonder gids-vermelding */
export async function createProducerFromSeller(seller: {
  id: number;
  name: string;
  email: string;
  address: string | null;
  postcode: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  bio: string | null;
}): Promise<number> {
  // slug uniek maken bij botsing met een bestaande vermelding
  let slug = slugify(seller.name);
  for (let i = 2; ; i++) {
    const [existing] = await db
      .select({ id: producers.id })
      .from(producers)
      .where(eq(producers.slug, slug));
    if (!existing) break;
    slug = `${slugify(seller.name)}-${i}`;
  }
  const [row] = await db
    .insert(producers)
    .values({
      // synthetische source_id buiten het bereik van de sheet-import
      sourceId: 1_000_000 + seller.id,
      name: seller.name,
      slug,
      isMember: true,
      claimedBySellerId: seller.id,
      claimedByEmail: seller.email,
      address: seller.address,
      postcode: seller.postcode,
      city: seller.city,
      lat: seller.lat,
      lng: seller.lng,
      description: seller.bio,
      status: "actief",
      source: "verkoper",
      lastVerifiedAt: new Date(),
    })
    .returning({ id: producers.id });
  return row.id;
}

/* ---------- Producentenbeheer ---------- */

export type ProducerFilter = {
  q?: string;
  status?: (typeof producers.status.enumValues)[number];
  province?: string;
  member?: boolean;
  withoutProducts?: boolean;
  offset?: number;
  limit?: number;
};

export async function adminListProducers(filter: ProducerFilter) {
  const conditions = [];
  if (filter.q?.trim()) {
    const q = `%${filter.q.trim()}%`;
    conditions.push(or(ilike(producers.name, q), ilike(producers.city, q)));
  }
  if (filter.status) conditions.push(eq(producers.status, filter.status));
  if (filter.province) conditions.push(eq(producers.province, filter.province));
  if (filter.member !== undefined) conditions.push(eq(producers.isMember, filter.member));
  if (filter.withoutProducts) conditions.push(sql`cardinality(${producers.products}) = 0`);

  const where = conditions.length ? and(...conditions) : undefined;
  const limit = filter.limit ?? 50;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: producers.id,
        name: producers.name,
        city: producers.city,
        province: producers.province,
        slug: producers.slug,
        kind: producers.kind,
        status: producers.status,
        isMember: producers.isMember,
        products: producers.products,
        lastVerifiedAt: producers.lastVerifiedAt,
      })
      .from(producers)
      .where(where)
      .orderBy(producers.name)
      .offset(filter.offset ?? 0)
      .limit(limit),
    db.select({ total: sql<number>`count(*)` }).from(producers).where(where),
  ]);
  return { rows, total: Number(total) };
}

export async function producerByIdAdmin(id: number) {
  const [row] = await db.select().from(producers).where(eq(producers.id, id));
  return row ?? null;
}

export type ProducerPatch = Partial<{
  name: string;
  kind: (typeof producers.kind.enumValues)[number];
  status: (typeof producers.status.enumValues)[number];
  isMember: boolean;
  address: string | null;
  postcode: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  openingHours: string | null;
  products: string[];
  photos: string[];
  photosPending: string[];
  organic: boolean;
  vendingMachine: boolean;
  paymentMethods: string | null;
  closedUntil: Date | null;
}>;

/**
 * Bewerken met expliciete kolom-whitelist; zet altijd lastVerifiedAt en
 * updatedAt (het team heeft er net naar gekeken). products gaat bewust via
 * Drizzle .set() en nooit via een raw sql-template (array-valkuil, AGENTS.md).
 */
export async function updateProducerAdmin(id: number, patch: ProducerPatch): Promise<void> {
  await db
    .update(producers)
    .set({ ...patch, lastVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(producers.id, id));
}

export type DuplicateGroup = {
  postcode: string;
  address: string;
  members: {
    id: number;
    name: string;
    city: string | null;
    status: string;
    isMember: boolean;
    slug: string;
  }[];
};

/** Zelfde dedupe-definitie als scripts/data-quality.ts; gestopte records tellen niet mee */
export async function duplicateGroups(): Promise<DuplicateGroup[]> {
  const result = await db.execute(sql`
    select upper(replace(postcode, ' ', '')) as pc, lower(address) as addr,
           json_agg(json_build_object(
             'id', id, 'name', name, 'city', city, 'status', status,
             'isMember', is_member, 'slug', slug
           ) order by id) as members
    from producers
    where postcode is not null and address is not null and status <> 'gestopt'
    group by 1, 2 having count(*) > 1
    order by 1
  `);
  return (result.rows as { pc: string; addr: string; members: DuplicateGroup["members"] }[]).map(
    (r) => ({ postcode: r.pc, address: r.addr, members: r.members })
  );
}

/* ---------- Ervaringen (reviews) ---------- */

export async function listUnpublishedReviews() {
  return db
    .select({
      id: sellerReviews.id,
      comment: sellerReviews.comment,
      reviewerName: sellerReviews.reviewerName,
      createdAt: sellerReviews.createdAt,
      sellerName: sellers.name,
      sellerCity: sellers.city,
    })
    .from(sellerReviews)
    .innerJoin(sellers, eq(sellers.id, sellerReviews.sellerId))
    .where(eq(sellerReviews.published, false))
    .orderBy(desc(sellerReviews.createdAt))
    .limit(200);
}

/** Publiceren; geeft verkoper- en vermeldingdata terug voor Klaviyo + revalidatie */
export async function publishReview(
  id: number
): Promise<{ sellerEmail: string; sellerName: string; comment: string; producerSlug: string | null } | null> {
  const [row] = await db
    .update(sellerReviews)
    .set({ published: true })
    .where(eq(sellerReviews.id, id))
    .returning({ sellerId: sellerReviews.sellerId, comment: sellerReviews.comment });
  if (!row) return null;
  const [seller] = await db
    .select({ email: sellers.email, name: sellers.name })
    .from(sellers)
    .where(eq(sellers.id, row.sellerId));
  if (!seller) return null;
  const [producer] = await db
    .select({ slug: producers.slug })
    .from(producers)
    .where(eq(producers.claimedBySellerId, row.sellerId));
  return {
    sellerEmail: seller.email,
    sellerName: seller.name,
    comment: row.comment,
    producerSlug: producer?.slug ?? null,
  };
}

export async function deleteReview(id: number): Promise<void> {
  await db.delete(sellerReviews).where(eq(sellerReviews.id, id));
}

/* ---------- Aanbod-screening (offers en foto's van verkopers) ---------- */

export async function listUnpublishedOffers() {
  return db
    .select({
      id: offers.id,
      title: offers.title,
      category: offers.category,
      description: offers.description,
      priceIndication: offers.priceIndication,
      photoUrl: offers.photoUrl,
      createdAt: offers.createdAt,
      sellerName: sellers.name,
      sellerCity: sellers.city,
    })
    .from(offers)
    .innerJoin(sellers, eq(sellers.id, offers.sellerId))
    .where(eq(offers.published, false))
    .orderBy(desc(offers.createdAt))
    .limit(200);
}

/** Publiceren; geeft verkoper-e-mail + titel terug voor het Klaviyo-signaal */
export async function publishOffer(
  id: number
): Promise<{ sellerEmail: string; title: string } | null> {
  const [row] = await db
    .update(offers)
    .set({ published: true })
    .where(eq(offers.id, id))
    .returning({ sellerId: offers.sellerId, title: offers.title });
  if (!row) return null;
  const [seller] = await db.select({ email: sellers.email }).from(sellers).where(eq(sellers.id, row.sellerId));
  return seller ? { sellerEmail: seller.email, title: row.title } : null;
}

/** Verwijderen door het team; geeft de foto-URL terug voor blob-opruiming */
export async function deleteOfferAdmin(id: number): Promise<string | null> {
  const [row] = await db.delete(offers).where(eq(offers.id, id)).returning({ photoUrl: offers.photoUrl });
  return row?.photoUrl ?? null;
}

export async function listPendingPhotos() {
  return db
    .select({
      id: producers.id,
      name: producers.name,
      slug: producers.slug,
      city: producers.city,
      photos: producers.photos,
      photosPending: producers.photosPending,
    })
    .from(producers)
    .where(sql`cardinality(${producers.photosPending}) > 0`)
    .limit(100);
}

/**
 * Goedkeuren = verplaatsen naar de publieke galerij (max blijft de zorg van
 * het portaal). Geeft de verkoper-e-mail terug voor het Klaviyo-signaal
 * (null als er geen gekoppelde verkoper is, bijv. bij een gids-record).
 */
export async function approveProducerPhoto(
  producerId: number,
  url: string
): Promise<{ sellerEmail: string } | null> {
  const [row] = await db
    .select({
      photos: producers.photos,
      photosPending: producers.photosPending,
      claimedBySellerId: producers.claimedBySellerId,
    })
    .from(producers)
    .where(eq(producers.id, producerId));
  if (!row || !row.photosPending.includes(url)) return null;
  await db
    .update(producers)
    .set({
      photos: row.photos.includes(url) ? row.photos : [...row.photos, url],
      photosPending: row.photosPending.filter((p) => p !== url),
      updatedAt: new Date(),
    })
    .where(eq(producers.id, producerId));
  if (!row.claimedBySellerId) return null;
  const [seller] = await db
    .select({ email: sellers.email })
    .from(sellers)
    .where(eq(sellers.id, row.claimedBySellerId));
  return seller ? { sellerEmail: seller.email } : null;
}

/** Afwijzen = alleen uit de wachtrij halen; de blob ruimt de caller op */
export async function rejectProducerPhoto(producerId: number, url: string): Promise<void> {
  const [row] = await db
    .select({ photosPending: producers.photosPending })
    .from(producers)
    .where(eq(producers.id, producerId));
  if (!row) return;
  await db
    .update(producers)
    .set({ photosPending: row.photosPending.filter((p) => p !== url), updatedAt: new Date() })
    .where(eq(producers.id, producerId));
}
