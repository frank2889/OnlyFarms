/**
 * Migratie voor het "lijst opslaan/hergebruiken/plannen"-spoor. Idempotent
 * (patroon migrate-admin.ts).
 *
 *   npx tsx scripts/migrate-planning.ts
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const steps: [check: string, sql: string][] = [
  // Vaste boodschappendag: 0=zondag..6=zaterdag, null = uit (CRO #83 laag 1).
  [
    "select 1 from information_schema.columns where table_name='users' and column_name='shopping_day'",
    "ALTER TABLE users ADD COLUMN shopping_day integer",
  ],
  // Mail op je boodschappendag: alleen na expliciete keuze (AVG), CRO #83 laag 2.
  [
    "select 1 from information_schema.columns where table_name='users' and column_name='reminder_opt_in'",
    "ALTER TABLE users ADD COLUMN reminder_opt_in boolean NOT NULL DEFAULT false",
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
