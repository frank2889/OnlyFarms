import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { offers, sellerReviews, sellers } from "@/db/schema";

export const runtime = "nodejs";

// Alleen goedgekeurde verkopers, met gepubliceerde-reviewscore en actueel aanbod.
// Reviews zijn leidend: gemiddelde en aantal gaan mee zodat de UI erop kan sorteren.
export async function GET() {
  const rows = await db
    .select({
      id: sellers.id,
      slug: sellers.slug,
      name: sellers.name,
      city: sellers.city,
      lat: sellers.lat,
      lng: sellers.lng,
      bio: sellers.bio,
      avgRating: sql<number | null>`round(avg(${sellerReviews.rating}) filter (where ${sellerReviews.published}), 1)`,
      reviewCount: sql<number>`count(${sellerReviews.id}) filter (where ${sellerReviews.published})`,
    })
    .from(sellers)
    .leftJoin(sellerReviews, eq(sellerReviews.sellerId, sellers.id))
    .where(eq(sellers.status, "goedgekeurd"))
    .groupBy(sellers.id)
    .orderBy(
      sql`avg(${sellerReviews.rating}) filter (where ${sellerReviews.published}) desc nulls last`
    );

  const sellerIds = rows.map((r) => r.id);
  const allOffers = sellerIds.length
    ? await db
        .select({
          id: offers.id,
          sellerId: offers.sellerId,
          title: offers.title,
          category: offers.category,
          description: offers.description,
          priceIndication: offers.priceIndication,
        })
        .from(offers)
        .where(and(inArray(offers.sellerId, sellerIds), eq(offers.available, true)))
    : [];

  const bySeller = new Map<number, typeof allOffers>();
  for (const offer of allOffers) {
    const list = bySeller.get(offer.sellerId) ?? [];
    list.push(offer);
    bySeller.set(offer.sellerId, list);
  }

  return NextResponse.json(
    {
      sellers: rows.map((r) => ({
        ...r,
        reviewCount: Number(r.reviewCount),
        offers: bySeller.get(r.id) ?? [],
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
  );
}
