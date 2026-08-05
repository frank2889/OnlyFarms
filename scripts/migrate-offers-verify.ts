/**
 * Migratie voor "aanbod laten verjaren": een eigen bevestig-datum voor
 * offers, los van updatedAt (dat bumpt ook bij een inhoudelijke wijziging
 * die het aanbod juist terug de controle-wachtrij in stuurt). Idempotent
 * (patroon migrate-planning.ts).
 *
 *   npx tsx scripts/migrate-offers-verify.ts
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
    "select 1 from information_schema.columns where table_name='offers' and column_name='last_verified_at'",
    "ALTER TABLE offers ADD COLUMN last_verified_at timestamptz",
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
