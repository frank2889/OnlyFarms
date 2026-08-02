import { NextRequest, NextResponse } from "next/server";
import { and, arrayOverlaps, eq, gte, isNotNull, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import { farms } from "@/db/schema";

export const runtime = "nodejs";

// GET /api/farms?bbox=minLng,minLat,maxLng,maxLat&products=kaas,melk&bio=1&automaat=1
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const conditions = [
    ne(farms.status, "gestopt"),
    isNotNull(farms.lat),
    isNotNull(farms.lng),
  ];

  const bbox = params.get("bbox");
  if (bbox) {
    const parts = bbox.split(",").map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: "ongeldige bbox" }, { status: 400 });
    }
    const [minLng, minLat, maxLng, maxLat] = parts;
    conditions.push(
      gte(farms.lat, minLat),
      lte(farms.lat, maxLat),
      gte(farms.lng, minLng),
      lte(farms.lng, maxLng)
    );
  }

  const products = params.get("products");
  if (products) {
    conditions.push(arrayOverlaps(farms.products, products.split(",")));
  }
  if (params.get("bio") === "1") conditions.push(eq(farms.organic, true));
  if (params.get("automaat") === "1")
    conditions.push(eq(farms.vendingMachine, true));

  const rows = await db
    .select({
      id: farms.id,
      slug: farms.slug,
      name: farms.name,
      city: farms.city,
      lat: farms.lat,
      lng: farms.lng,
      products: farms.products,
      openingHours: farms.openingHours,
      website: farms.website,
      organic: farms.organic,
      vendingMachine: farms.vendingMachine,
      status: farms.status,
    })
    .from(farms)
    .where(and(...conditions))
    .limit(2500);

  return NextResponse.json(
    { farms: rows },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
  );
}
