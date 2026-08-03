/**
 * Migratie voor de beheeromgeving: afhandelvelden op reports.
 * Idempotent: slaat stappen over die al gedaan zijn (patroon migrate-producers.ts).
 *
 *   npx tsx scripts/migrate-admin.ts
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

// FK-constraint krijgt meteen de naam die drizzle-kit verwacht, anders wil
// db:push interactief bevestigen (zie AGENTS.md, valkuil constraintnamen).
const steps: [check: string, sql: string][] = [
  [
    "select 1 from information_schema.columns where table_name='reports' and column_name='resolved_at'",
    "ALTER TABLE reports ADD COLUMN resolved_at timestamptz",
  ],
  [
    "select 1 from information_schema.columns where table_name='reports' and column_name='resolved_by'",
    "ALTER TABLE reports ADD COLUMN resolved_by integer CONSTRAINT reports_resolved_by_users_id_fk REFERENCES users(id)",
  ],
  [
    "select 1 from information_schema.columns where table_name='reports' and column_name='admin_note'",
    "ALTER TABLE reports ADD COLUMN admin_note text",
  ],
  // Portaal: koppeling verkoper -> gebruikersaccount (één account per persoon)
  [
    "select 1 from information_schema.columns where table_name='sellers' and column_name='user_id'",
    "ALTER TABLE sellers ADD COLUMN user_id integer CONSTRAINT sellers_user_id_users_id_fk REFERENCES users(id)",
  ],
  [
    "select 1 from pg_constraint where conname='sellers_user_id_unique'",
    "ALTER TABLE sellers ADD CONSTRAINT sellers_user_id_unique UNIQUE (user_id)",
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
  const r = await pool.query(
    "select count(*) filter (where resolved = false) open, count(*) totaal from reports"
  );
  console.log(`reports: ${r.rows[0].totaal} totaal, ${r.rows[0].open} open`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
