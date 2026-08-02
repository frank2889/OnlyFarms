/**
 * Importeert/synct de boerderijen uit de bron-sheet naar Postgres.
 *
 *   npm run import -- --dry-run   → alleen ophalen, normaliseren en rapporteren
 *   npm run import                → daadwerkelijk upserten in de database
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // geen .env.local aanwezig — env kan ook via de shell gezet zijn
  }
}

async function main() {
  loadEnvLocal();
  const dryRun = process.argv.includes("--dry-run");

  const { fetchSheetRows, normalizeRows } = await import("@/lib/sheet-sync");

  console.log("Sheet ophalen…");
  const rows = await fetchSheetRows();
  const { producers, issues } = normalizeRows(rows);

  const stats = {
    "rijen in sheet": rows.length,
    "genormaliseerd": producers.length,
    "zonder coördinaten": producers.filter((f) => f.lat === null).length,
    "zonder provincie": producers.filter((f) => f.province === null).length,
    "zonder producten": producers.filter((f) => f.products.length === 0).length,
    "status actief": producers.filter((f) => f.status === "actief").length,
    "status seizoen": producers.filter((f) => f.status === "seizoen").length,
    "status gestopt": producers.filter((f) => f.status === "gestopt").length,
  };
  console.table(stats);

  if (issues.length) {
    console.log(`\n${issues.length} datakwaliteitsissues:`);
    for (const i of issues) {
      console.log(`  #${i.sourceId} ${i.name}: ${i.issue}`);
    }
  }

  if (dryRun) {
    console.log("\nDry-run: er is niets naar de database geschreven.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("\nDATABASE_URL ontbreekt — zet die in .env.local of draai met --dry-run.");
    process.exit(1);
  }

  const { db } = await import("@/db");
  const { syncFarms } = await import("@/lib/sheet-sync");
  const result = await syncFarms(db);
  console.log(
    `\nKlaar: ${result.upserted} producenten geüpsert, ${result.orphaned} verdwenen records op 'onbevestigd' gezet.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
