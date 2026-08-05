/**
 * Migratie voor het favorieten-systeem: huishouden-brede opgeslagen
 * producenten (CRO #70). Idempotent (patroon migrate-admin.ts).
 *
 *   npx tsx scripts/migrate-favorites.ts
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
    "select 1 from information_schema.tables where table_name='saved_producers'",
    `CREATE TABLE saved_producers (
      id serial PRIMARY KEY,
      household_id integer NOT NULL,
      producer_id integer NOT NULL,
      saved_by_user_id integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT saved_producers_household_id_households_id_fk FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      CONSTRAINT saved_producers_producer_id_producers_id_fk FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
      CONSTRAINT saved_producers_saved_by_user_id_users_id_fk FOREIGN KEY (saved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT saved_producers_household_id_producer_id_unique UNIQUE (household_id, producer_id)
    )`,
  ],
  [
    "select 1 from pg_indexes where indexname='saved_producers_household_idx'",
    "CREATE INDEX saved_producers_household_idx ON saved_producers (household_id)",
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
