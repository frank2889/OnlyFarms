import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";
import { farms } from "@/db/schema";
import { slugify } from "@/lib/slug";
import type { db as Db } from "@/db";

const SHEET_ID = process.env.SHEET_ID ?? "";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Kolomnamen zoals ze in de bron-sheet staan
type SheetRow = {
  ID: string;
  Naam: string;
  Adres: string;
  Postcode: string;
  Plaats: string;
  Lat: string;
  LNG: string;
  producten: string;
  openingstijden: string;
  telefoon: string;
  website: string;
  bio: string;
  omschrijving: string;
  status: string;
  Provincie: string;
  Betaling: string;
  Automaat: string;
};

export type NormalizedFarm = {
  sourceId: number;
  name: string;
  slug: string;
  address: string | null;
  postcode: string | null;
  city: string | null;
  province: string | null;
  lat: number | null;
  lng: number | null;
  products: string[];
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  organic: boolean | null;
  vendingMachine: boolean | null;
  paymentMethods: string | null;
  description: string | null;
  status: "actief" | "seizoen" | "gestopt" | "onbevestigd";
};

export type SyncIssue = { sourceId: number; name: string; issue: string };

const PROVINCES: Record<string, string> = {
  drenthe: "Drenthe",
  flevoland: "Flevoland",
  friesland: "Friesland",
  "fryslân": "Friesland",
  fryslan: "Friesland",
  gelderland: "Gelderland",
  groningen: "Groningen",
  limburg: "Limburg",
  "noord-brabant": "Noord-Brabant",
  brabant: "Noord-Brabant",
  "noord-holland": "Noord-Holland",
  overijssel: "Overijssel",
  utrecht: "Utrecht",
  zeeland: "Zeeland",
  "zuid-holland": "Zuid-Holland",
};

const PRODUCT_SYNONYMS: Record<string, string> = {
  zuivel: "melk",
  yoghurt: "melk",
  aardappels: "aardappelen",
  ei: "eieren",
};

function clean(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

function parseBool(v: string | undefined): boolean | null {
  const s = (v ?? "").trim().toLowerCase();
  if (s === "ja") return true;
  if (s === "nee") return false;
  return null;
}

function parseCoord(v: string): number | null {
  const n = Number.parseFloat(v.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function inNetherlands(lat: number, lng: number): boolean {
  return lat > 50.5 && lat < 53.7 && lng > 3.2 && lng < 7.3;
}

function normalizePostcode(v: string | null): string | null {
  if (!v) return null;
  const s = v.toUpperCase().replace(/\s+/g, "");
  return /^\d{4}[A-Z]{2}$/.test(s) ? `${s.slice(0, 4)} ${s.slice(4)}` : v;
}

function normalizeWebsite(v: string | null): string | null {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function normalizeProducts(v: string): string[] {
  const seen = new Set<string>();
  for (const raw of v.split(/[;,]/)) {
    const p = raw.trim().toLowerCase();
    if (!p) continue;
    seen.add(PRODUCT_SYNONYMS[p] ?? p);
  }
  return [...seen];
}

function normalizeStatus(v: string): NormalizedFarm["status"] {
  const s = v.trim().toLowerCase();
  if (s === "actief" || s === "seizoen" || s === "gestopt") return s;
  return "onbevestigd";
}

export async function fetchSheetRows(): Promise<SheetRow[]> {
  if (!SHEET_ID) throw new Error("SHEET_ID ontbreekt in de omgeving");
  const res = await fetch(SHEET_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`Sheet-download mislukt: HTTP ${res.status}`);
  const csv = await res.text();
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as SheetRow[];
}

export function normalizeRows(rows: SheetRow[]): {
  farms: NormalizedFarm[];
  issues: SyncIssue[];
} {
  const result: NormalizedFarm[] = [];
  const issues: SyncIssue[] = [];
  const slugCounts = new Map<string, number>();

  for (const row of rows) {
    const sourceId = Number.parseInt(row.ID, 10);
    const name = clean(row.Naam);
    if (!Number.isInteger(sourceId) || !name) {
      issues.push({
        sourceId: sourceId || -1,
        name: name ?? "(naamloos)",
        issue: "overgeslagen: geen geldig ID of naam",
      });
      continue;
    }

    let lat = parseCoord(row.Lat);
    let lng = parseCoord(row.LNG);
    if (lat === null || lng === null || !inNetherlands(lat, lng)) {
      if (lat !== null || lng !== null) {
        issues.push({
          sourceId,
          name,
          issue: `coördinaten ongeldig of buiten NL (${row.Lat}, ${row.LNG})`,
        });
      }
      lat = null;
      lng = null;
    }

    const provinceKey = (clean(row.Provincie) ?? "").toLowerCase();
    const province = PROVINCES[provinceKey] ?? null;
    if (provinceKey && !province) {
      issues.push({ sourceId, name, issue: `onbekende provincie "${row.Provincie}"` });
    }

    const city = clean(row.Plaats);
    const base = slugify(city ? `${name}-${city}` : name);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${sourceId}`;

    result.push({
      sourceId,
      name,
      slug,
      address: clean(row.Adres),
      postcode: normalizePostcode(clean(row.Postcode)),
      city,
      province,
      lat,
      lng,
      products: normalizeProducts(row.producten ?? ""),
      openingHours: clean(row.openingstijden),
      phone: clean(row.telefoon),
      website: normalizeWebsite(clean(row.website)),
      organic: parseBool(row.bio),
      vendingMachine: parseBool(row.Automaat),
      paymentMethods: clean(row.Betaling),
      description: clean(row.omschrijving),
      status: normalizeStatus(row.status ?? ""),
    });
  }

  return { farms: result, issues };
}

export async function syncFarms(db: typeof Db): Promise<{
  upserted: number;
  orphaned: number;
  issues: SyncIssue[];
}> {
  const rows = await fetchSheetRows();
  const { farms: normalized, issues } = normalizeRows(rows);

  const batchSize = 250;
  for (let i = 0; i < normalized.length; i += batchSize) {
    const batch = normalized.slice(i, i + batchSize);
    await db
      .insert(farms)
      .values(batch)
      .onConflictDoUpdate({
        target: farms.sourceId,
        set: {
          name: sql`excluded.name`,
          slug: sql`excluded.slug`,
          address: sql`excluded.address`,
          postcode: sql`excluded.postcode`,
          city: sql`excluded.city`,
          province: sql`excluded.province`,
          lat: sql`excluded.lat`,
          lng: sql`excluded.lng`,
          products: sql`excluded.products`,
          openingHours: sql`excluded.opening_hours`,
          phone: sql`excluded.phone`,
          website: sql`excluded.website`,
          organic: sql`excluded.organic`,
          vendingMachine: sql`excluded.vending_machine`,
          paymentMethods: sql`excluded.payment_methods`,
          description: sql`excluded.description`,
          status: sql`excluded.status`,
          updatedAt: sql`now()`,
        },
      });
  }

  // Sheet-records die verdwenen zijn niet weggooien, maar als onbevestigd markeren.
  // Array als één parameter met cast, anders klapt Drizzle hem uit tot een ROW-expressie.
  const idsLiteral = `{${normalized.map((f) => f.sourceId).join(",")}}`;
  const orphanResult = await db
    .update(farms)
    .set({ status: "onbevestigd", updatedAt: sql`now()` })
    .where(
      sql`${farms.source} = 'sheet-import'
        and ${farms.status} <> 'onbevestigd'
        and not (${farms.sourceId} = any(${idsLiteral}::int[]))`
    )
    .returning({ id: farms.id });

  return { upserted: normalized.length, orphaned: orphanResult.length, issues };
}
