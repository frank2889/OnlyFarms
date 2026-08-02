/**
 * Eenmalige migratie: farms → producers (+ kind/is_member/claim),
 * reports.farm_id → producer_id, en de nieuwe lijst-tabellen.
 * Idempotent: slaat stappen over die al gedaan zijn.
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
    "select 1 from information_schema.tables where table_name='producers'",
    "ALTER TABLE farms RENAME TO producers",
  ],
  [
    "select 1 from pg_type where typname='producer_status'",
    "ALTER TYPE farm_status RENAME TO producer_status",
  ],
  [
    "select 1 from pg_type where typname='producer_kind'",
    "CREATE TYPE producer_kind AS ENUM ('boerderijwinkel','brouwerij','bakkerij','imkerij','wijngaard','overig')",
  ],
  [
    "select 1 from information_schema.columns where table_name='producers' and column_name='kind'",
    "ALTER TABLE producers ADD COLUMN kind producer_kind NOT NULL DEFAULT 'boerderijwinkel'",
  ],
  [
    "select 1 from information_schema.columns where table_name='producers' and column_name='is_member'",
    "ALTER TABLE producers ADD COLUMN is_member boolean NOT NULL DEFAULT false",
  ],
  [
    "select 1 from information_schema.columns where table_name='producers' and column_name='claimed_by_seller_id'",
    "ALTER TABLE producers ADD COLUMN claimed_by_seller_id integer REFERENCES sellers(id)",
  ],
  [
    "select 1 from pg_indexes where indexname='producers_province_idx'",
    "ALTER INDEX farms_province_idx RENAME TO producers_province_idx",
  ],
  [
    "select 1 from pg_indexes where indexname='producers_status_idx'",
    "ALTER INDEX farms_status_idx RENAME TO producers_status_idx",
  ],
  [
    "select 1 from pg_indexes where indexname='producers_lat_lng_idx'",
    "ALTER INDEX farms_lat_lng_idx RENAME TO producers_lat_lng_idx",
  ],
  [
    "select 1 from pg_constraint where conname='producers_source_id_unique'",
    "ALTER TABLE producers RENAME CONSTRAINT farms_source_id_unique TO producers_source_id_unique",
  ],
  [
    "select 1 from pg_constraint where conname='producers_slug_unique'",
    "ALTER TABLE producers RENAME CONSTRAINT farms_slug_unique TO producers_slug_unique",
  ],
  [
    "select 1 from pg_constraint where conname='producers_pkey'",
    "ALTER TABLE producers RENAME CONSTRAINT farms_pkey TO producers_pkey",
  ],
  [
    "select 1 from information_schema.columns where table_name='reports' and column_name='producer_id'",
    "ALTER TABLE reports RENAME COLUMN farm_id TO producer_id",
  ],
  [
    "select 1 from pg_constraint where conname='reports_producer_id_producers_id_fk'",
    "ALTER TABLE reports RENAME CONSTRAINT reports_farm_id_farms_id_fk TO reports_producer_id_producers_id_fk",
  ],
  [
    "select 1 from information_schema.tables where table_name='lists'",
    `CREATE TABLE lists (
      id serial PRIMARY KEY,
      token text NOT NULL UNIQUE,
      name text NOT NULL,
      postcode text,
      lat double precision,
      lng double precision,
      radius_km integer NOT NULL DEFAULT 10,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
  ],
  [
    "select 1 from information_schema.tables where table_name='list_items'",
    `CREATE TABLE list_items (
      id serial PRIMARY KEY,
      list_id integer NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      catalog_key text,
      label text NOT NULL,
      qty text,
      note text,
      checked boolean NOT NULL DEFAULT false,
      checked_at timestamptz,
      position integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
  ],
  [
    "select 1 from pg_indexes where indexname='list_items_list_idx'",
    "CREATE INDEX list_items_list_idx ON list_items (list_id, checked)",
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
  const r = await pool.query("select count(*) n from producers");
  console.log(`producers: ${r.rows[0].n} rijen`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
