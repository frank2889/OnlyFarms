import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { markets, producers, reports, sellers } from "@/db/schema";
import type { Producer } from "@/lib/types";

const baseColumns = {
  id: producers.id,
  slug: producers.slug,
  name: producers.name,
  kind: producers.kind,
  isMember: producers.isMember,
  address: producers.address,
  postcode: producers.postcode,
  city: producers.city,
  province: producers.province,
  lat: producers.lat,
  lng: producers.lng,
  products: producers.products,
  photos: producers.photos,
  claimedBySellerId: producers.claimedBySellerId,
  openingHours: producers.openingHours,
  phone: producers.phone,
  website: producers.website,
  organic: producers.organic,
  vendingMachine: producers.vendingMachine,
  paymentMethods: producers.paymentMethods,
  description: producers.description,
  status: producers.status,
  lastVerifiedAt: producers.lastVerifiedAt,
  closedUntil: producers.closedUntil,
};

function distanceKm(lat: number, lng: number) {
  // Haversine in SQL — ruim snel genoeg op deze datasetgrootte
  return sql<number>`6371 * 2 * asin(sqrt(
    pow(sin(radians((${lat} - ${producers.lat}) / 2)), 2) +
    cos(radians(${lat})) * cos(radians(${producers.lat})) *
    pow(sin(radians((${lng} - ${producers.lng}) / 2)), 2)
  ))`;
}

export type NearbyOptions = {
  lat: number;
  lng: number;
  radiusKm?: number;
  /** producten-tokens; matcht als de producent er minstens één voert */
  tokens?: string[];
  membersOnly?: boolean;
  limit?: number;
};

/**
 * Producenten binnen de straal, gesorteerd op afstand. Als de straal niets
 * oplevert: fallback naar de 5 dichtstbijzijnde (usedFallback: true).
 */
export async function nearbyProducers(
  opts: NearbyOptions
): Promise<{ producers: Producer[]; usedFallback: boolean }> {
  const { lat, lng, radiusKm = 10, tokens, membersOnly, limit = 25 } = opts;
  const dist = distanceKm(lat, lng);

  const conditions = [
    ne(producers.status, "gestopt"),
    isNotNull(producers.lat),
    isNotNull(producers.lng),
  ];
  if (tokens?.length) {
    conditions.push(
      sql`${producers.products} && ${`{${tokens.join(",")}}`}::text[]`
    );
  }
  if (membersOnly !== undefined) {
    conditions.push(eq(producers.isMember, membersOnly));
  }

  const query = (withRadius: boolean, take: number) =>
    db
      .select({ ...baseColumns, distanceKm: dist })
      .from(producers)
      .where(
        withRadius
          ? and(...conditions, sql`${dist} <= ${radiusKm}`)
          : and(...conditions)
      )
      .orderBy(dist)
      .limit(take);

  const within = await query(true, limit);
  if (within.length > 0) {
    return { producers: within as Producer[], usedFallback: false };
  }
  const nearest = await query(false, 5);
  return { producers: nearest as Producer[], usedFallback: true };
}

/** Aantal producenten binnen de straal per producten-token — voor de "N in de buurt"-badges */
export async function nearbyCountsByToken(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<Record<string, number>> {
  const dist = distanceKm(lat, lng);
  const rows = await db.execute(sql`
    select token, count(*)::int as n
    from (
      select unnest(${producers.products}) as token
      from ${producers}
      where ${producers.status} <> 'gestopt'
        and ${producers.lat} is not null and ${producers.lng} is not null
        and ${dist} <= ${radiusKm}
    ) t
    group by token
  `);
  const counts: Record<string, number> = {};
  for (const row of rows.rows as { token: string; n: number }[]) {
    counts[row.token] = row.n;
  }
  return counts;
}

/** Producenten op naam zoeken, dichtstbij eerst — voor de gecombineerde zoekbalk */
export async function searchProducersByName(
  query: string,
  lat: number,
  lng: number,
  limit = 4
): Promise<Producer[]> {
  const q = `%${query.trim()}%`;
  const dist = distanceKm(lat, lng);
  const rows = await db
    .select({ ...baseColumns, distanceKm: dist })
    .from(producers)
    .where(
      and(
        ne(producers.status, "gestopt"),
        isNotNull(producers.lat),
        isNotNull(producers.lng),
        sql`${producers.name} ilike ${q}`
      )
    )
    .orderBy(dist)
    .limit(limit);
  return rows as Producer[];
}

export type NearbyMarket = {
  id: number;
  name: string;
  city: string | null;
  lat: number;
  lng: number;
  daysText: string | null;
  distanceKm: number;
};

/** Weekmarkten in de buurt (bron: OSM), dichtstbij eerst */
export async function nearbyMarkets(
  lat: number,
  lng: number,
  limit = 3
): Promise<NearbyMarket[]> {
  const dist = sql<number>`6371 * 2 * asin(sqrt(
    pow(sin(radians((${lat} - ${markets.lat}) / 2)), 2) +
    cos(radians(${lat})) * cos(radians(${markets.lat})) *
    pow(sin(radians((${lng} - ${markets.lng}) / 2)), 2)
  ))`;
  const rows = await db
    .select({
      id: markets.id,
      name: markets.name,
      city: markets.city,
      lat: markets.lat,
      lng: markets.lng,
      daysText: markets.daysText,
      distanceKm: dist,
    })
    .from(markets)
    .where(sql`${dist} <= 15`)
    .orderBy(dist)
    .limit(limit);
  return rows as NearbyMarket[];
}

/**
 * Left join op sellers via claimedBySellerId: een geschorste of afgewezen
 * verkoper mag geen "Aangesloten"-badge of claim-teaser meer krijgen op de
 * publieke pagina, ook al staat isMember nog op true (zie sellerStatus-gebruik
 * op de producentpagina).
 */
export async function producerBySlug(slug: string): Promise<Producer | null> {
  const [row] = await db
    .select({ ...baseColumns, sellerStatus: sellers.status })
    .from(producers)
    .leftJoin(sellers, eq(producers.claimedBySellerId, sellers.id))
    .where(eq(producers.slug, slug));
  return (row as Producer) ?? null;
}

export async function producersByProvince(province: string): Promise<Producer[]> {
  const rows = await db
    .select(baseColumns)
    .from(producers)
    .where(
      and(eq(producers.province, province), ne(producers.status, "gestopt"))
    )
    .orderBy(producers.city, producers.name);
  return rows as Producer[];
}

export async function allProvinces(): Promise<{ province: string; count: number }[]> {
  const rows = await db
    .select({
      province: producers.province,
      count: sql<number>`count(*)`,
    })
    .from(producers)
    .where(and(isNotNull(producers.province), ne(producers.status, "gestopt")))
    .groupBy(producers.province)
    .orderBy(producers.province);
  return rows.filter((r) => r.province) as { province: string; count: number }[];
}

export async function allProducerSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: producers.slug, updatedAt: producers.updatedAt })
    .from(producers)
    .where(ne(producers.status, "gestopt"));
}

export async function createReport(
  producerId: number,
  message: string,
  reporterEmail?: string
): Promise<void> {
  await db.insert(reports).values({
    producerId,
    message,
    reporterEmail: reporterEmail || null,
  });
}
