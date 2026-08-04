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
