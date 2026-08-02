import Link from "next/link";
import { and, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { farms } from "@/db/schema";
import KaartClient from "@/components/KaartClient";
import { SproutIcon } from "@/components/icons";
import type { Farm } from "@/components/FarmMap";

// Data gaat server-side mee de pagina in; elke 5 minuten opnieuw opgebouwd
export const revalidate = 300;

async function getFarms(): Promise<Farm[]> {
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
    .where(
      and(ne(farms.status, "gestopt"), isNotNull(farms.lat), isNotNull(farms.lng))
    );
  return rows as Farm[];
}

export default async function KaartPage() {
  const data = await getFarms();

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
          <SproutIcon width={22} height={22} className="text-green-700" />
          OnlyFarms
        </Link>
        <Link href="/verkopen" className="text-sm underline">
          verkopen via OnlyFarms
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <KaartClient farms={data} />
      </div>
    </main>
  );
}
