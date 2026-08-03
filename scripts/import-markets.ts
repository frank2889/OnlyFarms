/**
 * Weekmarkten importeren uit OpenStreetMap (amenity=marketplace, Nederland).
 * Open data onder ODbL; we tonen "Marktdata (c) OpenStreetMap-bijdragers" bij de sectie
 * en houden markten als aparte dataset naast de producenten.
 *
 *   npx tsx scripts/import-markets.ts
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function reverseCity(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${lat}&lon=${lng}&rows=1&fl=woonplaatsnaam`
    );
    const data = await res.json();
    return data?.response?.docs?.[0]?.woonplaatsnaam ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS markets (
      id serial PRIMARY KEY,
      osm_id bigint NOT NULL UNIQUE,
      name text NOT NULL,
      city text,
      lat double precision NOT NULL,
      lng double precision NOT NULL,
      days_text text,
      source text NOT NULL DEFAULT 'osm',
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);

  // Overpass is soms overbelast; een lokaal JSON-bestand als argument werkt ook
  const localFile = process.argv.find((a) => a.endsWith(".json"));
  let data: { elements?: OsmElement[] };
  if (localFile) {
    data = JSON.parse(readFileSync(localFile, "utf-8"));
  } else {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        data: `[out:json][timeout:90];area["ISO3166-1"="NL"][admin_level=2]->.nl;nwr["amenity"="marketplace"](area.nl);out tags center 2000;`,
      }),
    });
    data = await res.json();
  }
  const elements: OsmElement[] = data.elements ?? [];
  console.log(`OSM-marktplaatsen gevonden: ${elements.length}`);

  let upserted = 0;
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;
    const tags = el.tags ?? {};
    const name = tags.name ?? "Weekmarkt";
    let city: string | null = tags["addr:city"] ?? null;
    if (!city) {
      city = await reverseCity(lat, lng);
      await new Promise((r) => setTimeout(r, 80));
    }
    await pool.query(
      `insert into markets (osm_id, name, city, lat, lng, days_text, updated_at)
       values ($1, $2, $3, $4, $5, $6, now())
       on conflict (osm_id) do update set
         name = excluded.name, city = excluded.city, lat = excluded.lat,
         lng = excluded.lng, days_text = excluded.days_text, updated_at = now()`,
      [el.id, name.slice(0, 120), city, lat, lng, tags.opening_hours ?? null]
    );
    upserted++;
  }
  const stats = await pool.query(
    `select count(*) totaal, count(days_text) met_dagen, count(city) met_plaats from markets`
  );
  console.log(`Geimporteerd/bijgewerkt: ${upserted}. Stand:`, stats.rows[0]);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
