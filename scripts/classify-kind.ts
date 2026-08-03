/**
 * Soort producent (kind) afleiden uit de bedrijfsnaam voor records die nog op
 * de standaardwaarde 'boerderijwinkel' staan (nooit is dit veld afgeleid sinds
 * de migratie, zie docs/DATAKWALITEIT.md).
 *
 * Bewust conservatief: alleen matchen op de NAAM (een expliciete bedrijfsnaam
 * als "Imkerij X" of "Brouwerij Y"), niet op de omschrijving. Omschrijvingen
 * bevatten vaak meerdere activiteiten door elkaar ("verswinkel, brasserie en
 * bierbrouwerij") en geven dan geen betrouwbaar hoofdsoort. Om diezelfde reden
 * blijft "bakkerij" hier buiten beschouwing: "bakker" is een veelvoorkomende
 * Nederlandse achternaam (bijv. "Bakker's Farm"), te onbetrouwbaar als signaal.
 *
 * Draaien: npx tsx scripts/classify-kind.ts [--dry-run]
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const DRY_RUN = process.argv.includes("--dry-run");

// [kind, naam-patroon]; "thee" expliciet uitgesloten bij brouwerij
// ("Theebrouwerij" is geen bierbrouwerij).
const RULES: [kind: string, pattern: string, exclude?: string][] = [
  ["brouwerij", "\\ybrouwerij\\y|\\ybrewery\\y|bierbrouw", "thee"],
  ["imkerij", "\\yimker(ij)?\\y"],
  ["wijngaard", "wijngaard|wijnhoeve"],
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const [kind, pattern, exclude] of RULES) {
    // Los genummerd per query: $1/$2 voor de select, $1 (kind) + $2/$3 voor de update.
    const selectWhere = exclude
      ? `status <> 'gestopt' and kind = 'boerderijwinkel' and name ~* $1 and name !~* $2`
      : `status <> 'gestopt' and kind = 'boerderijwinkel' and name ~* $1`;
    const selectParams = exclude ? [pattern, exclude] : [pattern];
    const updateWhere = exclude
      ? `status <> 'gestopt' and kind = 'boerderijwinkel' and name ~* $2 and name !~* $3`
      : `status <> 'gestopt' and kind = 'boerderijwinkel' and name ~* $2`;
    const updateParams = exclude ? [kind, pattern, exclude] : [kind, pattern];

    const rows = await pool.query(
      `select id, name from producers where ${selectWhere} order by name`,
      selectParams
    );
    console.log(`\n${kind}: ${rows.rowCount} record(s)`);
    for (const row of rows.rows as { id: number; name: string }[]) {
      console.log(`  #${row.id} ${row.name}`);
    }
    if (!DRY_RUN && rows.rowCount) {
      await pool.query(
        `update producers set kind = $1, updated_at = now() where ${updateWhere}`,
        updateParams
      );
    }
  }

  if (DRY_RUN) console.log("\nDry-run: niets gewijzigd. Draai zonder --dry-run om toe te passen.");

  const stats = await pool.query(
    `select kind, count(*) as n from producers group by kind order by n desc`
  );
  console.log("\nStand na deze run:");
  console.table(stats.rows);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
