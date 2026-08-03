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
  // Profiel-uitbreiding portaal: foto's op de vermelding, foto per product
  [
    "select 1 from information_schema.columns where table_name='producers' and column_name='photos'",
    "ALTER TABLE producers ADD COLUMN photos text[] NOT NULL DEFAULT '{}'",
  ],
  [
    "select 1 from information_schema.columns where table_name='offers' and column_name='photo_url'",
    "ALTER TABLE offers ADD COLUMN photo_url text",
  ],
  // Swipe-deck: accumulerende koophistorie (wis-bestendig, per lijst/huishouden)
  [
    "select 1 from information_schema.tables where table_name='bought_stats'",
    `CREATE TABLE bought_stats (
      id serial PRIMARY KEY,
      list_id integer NOT NULL,
      household_id integer,
      catalog_key text NOT NULL,
      times integer NOT NULL DEFAULT 1,
      last_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT bought_stats_list_id_lists_id_fk FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
      CONSTRAINT bought_stats_household_id_households_id_fk FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
      CONSTRAINT bought_stats_list_id_catalog_key_unique UNIQUE (list_id, catalog_key)
    )`,
  ],
  [
    "select 1 from pg_indexes where indexname='bought_stats_household_idx'",
    "CREATE INDEX bought_stats_household_idx ON bought_stats (household_id)",
  ],
  // Voorkeurssignaal per swipe (los van koophistorie): voedt de bèta-smaakmodus
  [
    "select 1 from information_schema.tables where table_name='swipe_signals'",
    `CREATE TABLE swipe_signals (
      id serial PRIMARY KEY,
      list_id integer NOT NULL,
      household_id integer,
      catalog_key text NOT NULL,
      likes integer NOT NULL DEFAULT 0,
      skips integer NOT NULL DEFAULT 0,
      last_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT swipe_signals_list_id_lists_id_fk FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
      CONSTRAINT swipe_signals_household_id_households_id_fk FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
      CONSTRAINT swipe_signals_list_id_catalog_key_unique UNIQUE (list_id, catalog_key)
    )`,
  ],
  [
    "select 1 from pg_indexes where indexname='swipe_signals_household_idx'",
    "CREATE INDEX swipe_signals_household_idx ON swipe_signals (household_id)",
  ],
  // Smaak is persoonlijk: signaal per gebruiker (ingelogd) of per lijst (anoniem).
  // Tabel was leeg bij deze herstructurering, dus geen datamigratie nodig.
  [
    "select 1 from information_schema.columns where table_name='swipe_signals' and column_name='user_id'",
    "ALTER TABLE swipe_signals ADD COLUMN user_id integer CONSTRAINT swipe_signals_user_id_users_id_fk REFERENCES users(id) ON DELETE CASCADE",
  ],
  [
    "select 1 where not exists (select 1 from pg_constraint where conname='swipe_signals_list_id_catalog_key_unique')",
    "ALTER TABLE swipe_signals DROP CONSTRAINT swipe_signals_list_id_catalog_key_unique",
  ],
  // NULLS NOT DISTINCT (PG15+): anonieme rijen (user_id NULL) blijven ook uniek per lijst+item
  [
    "select 1 from pg_constraint where conname='swipe_signals_list_id_catalog_key_user_id_unique'",
    "ALTER TABLE swipe_signals ADD CONSTRAINT swipe_signals_list_id_catalog_key_user_id_unique UNIQUE NULLS NOT DISTINCT (list_id, catalog_key, user_id)",
  ],
  [
    "select 1 from pg_indexes where indexname='swipe_signals_user_idx'",
    "CREATE INDEX swipe_signals_user_idx ON swipe_signals (user_id)",
  ],
  // Screening: bestaand aanbod blijft live (DEFAULT true bij toevoegen),
  // daarna default naar false zodat nieuw aanbod op controle wacht
  [
    "select 1 from information_schema.columns where table_name='offers' and column_name='published'",
    "ALTER TABLE offers ADD COLUMN published boolean NOT NULL DEFAULT true",
  ],
  [
    "select 1 from information_schema.columns where table_name='offers' and column_name='published' and column_default='false'",
    "ALTER TABLE offers ALTER COLUMN published SET DEFAULT false",
  ],
  [
    "select 1 from information_schema.columns where table_name='producers' and column_name='photos_pending'",
    "ALTER TABLE producers ADD COLUMN photos_pending text[] NOT NULL DEFAULT '{}'",
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
