import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { producers, reports } from "@/db/schema";
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
  openingHours: producers.openingHours,
  phone: producers.phone,
  website: producers.website,
  organic: producers.organic,
  vendingMachine: producers.vendingMachine,
  description: producers.description,
  status: producers.status,
  lastVerifiedAt: producers.lastVerifiedAt,
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

export async function producerBySlug(slug: string): Promise<Producer | null> {
  const [row] = await db
    .select(baseColumns)
    .from(producers)
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

export async function allProducerSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: producers.slug })
    .from(producers)
    .where(ne(producers.status, "gestopt"));
  return rows.map((r) => r.slug);
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
