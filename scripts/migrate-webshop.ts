/**
 * Migratie voor het "boer-als-webshop"-spoor. Idempotent (patroon migrate-admin.ts).
 *
 *   npx tsx scripts/migrate-webshop.ts
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const steps: [check: string, sql: string][] = [
  // Expression-index op events.properties->>'slug': goedkope per-producent
  // counts voor "Jouw bereik" in het portaal (producent_bekeken/route_geopend).
  [
    "select 1 from pg_indexes where indexname='events_slug_idx'",
    "CREATE INDEX events_slug_idx ON events ((properties ->> 'slug'))",
  ],
  // Uitlichten van een product op de producentpagina; geen inhoudelijke
  // wijziging (net als available), raakt de screeningsstatus dus niet.
  [
    "select 1 from information_schema.columns where table_name='offers' and column_name='featured'",
    "ALTER TABLE offers ADD COLUMN featured boolean NOT NULL DEFAULT false",
  ],
  // Ervaringen zijn bewust alleen tekst, geen sterren (PLAN.md-besluit).
  // Rijen zonder tekst zijn betekenisloos zonder rating; database was leeg
  // getest voor dit bewust destructieve stuk (steekproef vóór dit script:
  // 0 rijen), maar de check blijft staan voor de volgende keer dat dit
  // script ergens anders draait.
  [
    "select 1 where not exists (select 1 from seller_reviews where comment is null)",
    "DELETE FROM seller_reviews WHERE comment IS NULL",
  ],
  [
    "select 1 where not exists (select 1 from information_schema.columns where table_name='seller_reviews' and column_name='rating')",
    "ALTER TABLE seller_reviews DROP COLUMN rating",
  ],
  [
    "select 1 from information_schema.columns where table_name='seller_reviews' and column_name='comment' and is_nullable='NO'",
    "ALTER TABLE seller_reviews ALTER COLUMN comment SET NOT NULL",
  ],
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  for (const [check, sql] of steps) {
    const done = await pool.query(check);
    if (done.rowCount) {
      console.log(`overslaan (al gedaan): ${sql.slice(0, 60)}…`);
      continue;
    }
    await pool.query(sql);
    console.log(`uitgevoerd: ${sql.slice(0, 60)}…`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
