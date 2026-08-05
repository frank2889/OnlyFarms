/**
 * Migratie voor web push, deel 1 (fundament): subscriptions per gebruiker.
 * Idempotent (patroon migrate-favorites.ts).
 *
 *   npx tsx scripts/migrate-push.ts
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
    "select 1 from information_schema.tables where table_name='push_subscriptions'",
    `CREATE TABLE push_subscriptions (
      id serial PRIMARY KEY,
      user_id integer NOT NULL,
      endpoint text NOT NULL,
      p256dh text NOT NULL,
      auth text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT push_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
    )`,
  ],
  [
    "select 1 from pg_indexes where indexname='push_subscriptions_user_idx'",
    "CREATE INDEX push_subscriptions_user_idx ON push_subscriptions (user_id)",
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
