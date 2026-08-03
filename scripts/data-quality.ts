/**
 * Datakwaliteit in drie stappen:
 *  1. Productcategorieën afleiden uit omschrijvingsteksten (voor records zonder producten)
 *  2. Records met ontbrekende coördinaten geocoderen via PDOK (adres is aanwezig)
 *  3. Rapport van dubbele adressen (geen automatische verwijdering)
 *
 * Draaien: npx tsx scripts/data-quality.ts [--dry-run]
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const KEYWORDS: [pattern: RegExp, token: string][] = [
  [/rauwe melk|melktap|verse melk|zuivel|yoghurt|kwark|karnemelk/i, "melk"],
  [/\bkaas|kaasboerderij|kaasmakerij/i, "kaas"],
  [/\beieren|\beitjes|kippenei|legkippen|scharrelei/i, "eieren"],
  [/rundvlees|varkensvlees|kippenvlees|lamsvlees|\bvlees\b|worst|hamburger/i, "vlees"],
  [/groente|moestuin|sla\b|tomaten|courgette|pompoen|asperge/i, "groente"],
  [/\bfruit|appels|peren|aardbeien|kersen|frambozen|bessen|pruimen/i, "fruit"],
  [/aardappel/i, "aardappelen"],
  [/honing|imker|bijen/i, "honing"],
  [/\bbrood|bakkerij|banket/i, "brood"],
  [/\bbier|brouwerij/i, "bier"],
  [/\bwijn|wijngaard|druiven/i, "wijn"],
  [/\bjam\b|confituur/i, "jam"],
  [/bloemen|pluktuin/i, "bloemen"],
  [/\bsap\b|appelsap|perensap/i, "sap"],
  [/\bnoten|walnoten|hazelnoten/i, "noten"],
  [/\bvis\b|forel|paling|rokerij|zalm/i, "vis"],
];

// Specifieke item-tokens (gekoppeld aan catalog-keys) voor item-niveau matching
const SPECIFIC: [pattern: RegExp, token: string][] = [
  [/asperge/i, "asperges"],
  [/aardbei/i, "aardbeien"],
  [/kersen|kersenboomgaard/i, "kersen"],
  [/frambo/i, "frambozen"],
  [/blauwe bes|blauwebessen|bosbes/i, "blauwebessen"],
  [/pruim/i, "pruimen"],
  [/druiven|wijngaard/i, "druiven"],
  [/pompoen/i, "pompoen"],
  [/tomaat|tomaten/i, "tomaten"],
  [/courgette/i, "courgette"],
  [/boerenkool/i, "boerenkool"],
  [/spruit/i, "spruiten"],
  [/witlof/i, "witlof"],
  [/prei\b/i, "prei"],
  [/broccoli/i, "broccoli"],
  [/bloemkool/i, "bloemkool"],
  [/rode biet|bieten/i, "bieten"],
  [/sperzieboon|snijboon/i, "sperziebonen"],
  [/paddenstoel|champignon|oesterzwam|shiitake/i, "paddenstoelen"],
  [/kruiden(?!thee)/i, "kruiden"],
  [/geitenkaas|geiten/i, "geitenkaas"],
  [/forel/i, "vis"],
  [/paling/i, "vis"],
  [/schapenkaas|schapen/i, "kaas"],
  [/yoghurt/i, "melk"],
  [/boerderij-?ijs|schepijs|roomijs/i, "ijs"],
  [/appelsap/i, "sap"],
  [/cider/i, "bier"],
  [/walnoot|walnoten/i, "noten"],
  [/hazelno/i, "noten"],
  [/kastanje/i, "noten"],
  [/zuurkool/i, "groente"],
  [/uien\b|\bui\b/i, "groente"],
  [/knoflook/i, "groente"],
  [/spinazie/i, "groente"],
  [/ma[iï]s/i, "groente"],
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // 1. Producten afleiden
  const empty = await pool.query(
    `select id, name, description from producers
     where cardinality(products) = 0 and description is not null`
  );
  let derived = 0;
  const sample: string[] = [];
  for (const row of empty.rows) {
    const tokens = new Set<string>();
    for (const [pattern, token] of KEYWORDS) {
      if (pattern.test(row.description)) tokens.add(token);
    }
    if (!tokens.size) continue;
    derived++;
    if (sample.length < 25)
      sample.push(`#${row.id} ${row.name}: ${[...tokens].join(", ")}`);
    if (!dryRun) {
      await pool.query(`update producers set products = $1, updated_at = now() where id = $2`, [
        [...tokens],
        row.id,
      ]);
    }
  }
  console.log(`\n1) Afgeleid: ${derived} van ${empty.rowCount} records zonder producten${dryRun ? " (dry-run)" : ""}`);
  console.log("Steekproef (controleer deze 25 handmatig):");
  for (const s of sample) console.log("  " + s);

  // 1b. Specifieke tokens toevoegen bij ALLE producenten met een omschrijving (append, nooit overschrijven)
  const all = await pool.query(
    `select id, name, description, products from producers where description is not null`
  );
  let enriched = 0;
  const enrichSample: string[] = [];
  for (const row of all.rows) {
    const extra = new Set<string>();
    for (const [pattern, token] of SPECIFIC) {
      if (pattern.test(row.description) && !row.products.includes(token)) extra.add(token);
    }
    if (!extra.size) continue;
    enriched++;
    if (enrichSample.length < 25)
      enrichSample.push(`#${row.id} ${row.name}: +${[...extra].join(", ")}`);
    if (!dryRun) {
      await pool.query(
        `update producers set products = products || $1, updated_at = now() where id = $2`,
        [[...extra], row.id]
      );
    }
  }
  console.log(`\n1b) Verrijkt met specifieke tokens: ${enriched} producenten${dryRun ? " (dry-run)" : ""}`);
  console.log("Steekproef:");
  for (const s of enrichSample) console.log("  " + s);

  // 2. Ontbrekende coördinaten geocoderen via PDOK
  // Alleen NL-postcodes: PDOK kent alleen Nederland en matcht buitenlandse
  // adressen anders op een verkeerd NL-adres (ging mis met 3 Belgische records)
  const noCoords = await pool.query(
    `select id, name, address, postcode, city from producers
     where (lat is null or lng is null) and address is not null
       and postcode ~ '^[0-9]{4}\\s?[A-Z]{2}$'`
  );
  let geocoded = 0;
  for (const row of noCoords.rows) {
    const q = [row.address, row.postcode, row.city].filter(Boolean).join(", ");
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&rows=1&fl=centroide_ll`
    );
    const data = await res.json();
    const m = data?.response?.docs?.[0]?.centroide_ll?.match(/POINT\(([\d.]+) ([\d.]+)\)/);
    if (!m) {
      console.log(`  geen geocode-resultaat: #${row.id} ${row.name} (${q})`);
      continue;
    }
    geocoded++;
    if (!dryRun) {
      await pool.query(`update producers set lng = $1, lat = $2, updated_at = now() where id = $3`, [
        Number(m[1]),
        Number(m[2]),
        row.id,
      ]);
    }
    console.log(`  gegeocodeerd: #${row.id} ${row.name} → ${m[2]}, ${m[1]}`);
  }
  console.log(`\n2) Gegeocodeerd: ${geocoded} van ${noCoords.rowCount} records zonder coördinaten${dryRun ? " (dry-run)" : ""}`);

  // 3. Dubbele adressen rapporteren
  const dups = await pool.query(
    `select upper(replace(postcode,' ','')) pc, lower(address) addr,
            array_agg(id order by id) ids, array_agg(name order by id) names
     from producers where postcode is not null and address is not null
     group by 1, 2 having count(*) > 1 order by 1`
  );
  console.log(`\n3) Dubbele adressen: ${dups.rowCount} (handmatig beoordelen, niets verwijderd)`);
  for (const d of dups.rows) {
    console.log(`  ${d.pc} ${d.addr}: ids ${d.ids.join(", ")} (${d.names.join(" | ")})`);
  }

  // 4. Naamduplicaten rapporteren (zelfde naam+plaats, mogelijk ander adres —
  // dekt filiaalketens of dubbele invoer met een adresfout; los van stap 3,
  // die alleen op adres kijkt)
  const nameDups = await pool.query(
    `select lower(name) nm, lower(coalesce(city,'')) city,
            array_agg(id order by id) ids, array_agg(coalesce(address,'(geen adres)') order by id) addresses
     from producers where status <> 'gestopt'
     group by 1, 2 having count(*) > 1 order by 1`
  );
  console.log(`\n4) Naamduplicaten (zelfde naam+plaats): ${nameDups.rowCount} (handmatig beoordelen, niets verwijderd)`);
  for (const d of nameDups.rows) {
    console.log(`  "${d.nm}" (${d.city}): ids ${d.ids.join(", ")} (${d.addresses.join(" | ")})`);
  }

  const stats = await pool.query(
    `select count(*) filter (where cardinality(products) > 0) met_producten,
            count(*) filter (where lat is not null) met_coords, count(*) totaal
     from producers`
  );
  console.log("\nEindstand:", stats.rows[0]);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
