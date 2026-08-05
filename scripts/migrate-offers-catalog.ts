/**
 * Migratie voor "aanbod koppelen aan de matching-catalogus": een los aanbod-
 * item mag verwijzen naar een specifiek catalogusitem (fijner dan de brede
 * producten-tokens). Idempotent (patroon migrate-offers-verify.ts).
 *
 *   npx tsx scripts/migrate-offers-catalog.ts
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const steps: [check: string, sql: string][] = [
  [
    "select 1 from information_schema.columns where table_name='offers' and column_name='catalog_key'",
    "ALTER TABLE offers ADD COLUMN catalog_key text",
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
