/**
 * Openingstijden (en bedrijfsstatus) synchroniseren via de Google Places API.
 *
 * Spelregels van Google (Maps Platform TOS), hier bewust nageleefd:
 *  - place_id mag je permanent opslaan; overige Places-data maximaal 30 dagen cachen.
 *  - Daarom draait dit script periodiek (maandelijks) en stempelt het hours_synced_at.
 *  - Weergave van Places-data buiten een Google-kaart vereist "powered by Google"-vermelding
 *    (staat in de footer zodra deze sync actief is).
 *
 * Vereist: GOOGLE_MAPS_API_KEY in .env.local (Places API aan + billing).
 * Kosteninschatting wordt vooraf geprint; niets draait zonder --run.
 *
 *   npx tsx scripts/google-sync.ts --match          # producenten koppelen aan place_ids (eenmalig)
 *   npx tsx scripts/google-sync.ts --refresh        # openingstijden verversen (maandelijks)
 *   ... voeg --run toe om echt te draaien (anders alleen kosteninschatting)
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const RUN = process.argv.includes("--run");

const DAY_NAMES = ["ma", "di", "wo", "do", "vr", "za", "zo"];

function compactHours(weekdayText: string[]): string {
  // Google geeft per dag een regel; wij vatten samen tot bijv. "ma-za 08:00-18:00, zo gesloten"
  const days = weekdayText.map((line) => {
    const [, hours] = line.split(/: (.+)/);
    return (hours ?? "gesloten").replace("Gesloten", "gesloten").replace(/\s/g, " ");
  });
  const parts: string[] = [];
  let start = 0;
  for (let i = 1; i <= days.length; i++) {
    if (i === days.length || days[i] !== days[start]) {
      const label = start === i - 1 ? DAY_NAMES[start] : `${DAY_NAMES[start]}-${DAY_NAMES[i - 1]}`;
      parts.push(`${label} ${days[start]}`);
      start = i;
    }
  }
  return parts.join(", ").slice(0, 200);
}

async function main() {
  if (!KEY) {
    console.error("GOOGLE_MAPS_API_KEY ontbreekt in .env.local. Script doet niets.");
    console.error("Aanmaken: Google Cloud Console > Places API aanzetten + billing + key.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  if (process.argv.includes("--match")) {
    const rows = await pool.query(
      `select id, name, address, postcode, city from producers
       where google_place_id is null and status <> 'gestopt' and address is not null`
    );
    console.log(`Te matchen: ${rows.rowCount} producenten`);
    console.log(`Kosten (Find Place, ~$17/1000): ~$${((rows.rowCount ?? 0) * 0.017).toFixed(2)}`);
    if (!RUN) return console.log("Dry-run. Voeg --run toe om te draaien.");
    let matched = 0;
    for (const row of rows.rows) {
      const query = `${row.name}, ${row.address}, ${row.postcode ?? ""} ${row.city ?? ""}`;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${KEY}`
      );
      const data = await res.json();
      const placeId = data?.candidates?.[0]?.place_id;
      if (placeId) {
        await pool.query(`update producers set google_place_id = $1 where id = $2`, [placeId, row.id]);
        matched++;
      }
      await new Promise((r) => setTimeout(r, 60)); // nette rate
    }
    console.log(`Gematcht: ${matched}/${rows.rowCount}`);
  }

  if (process.argv.includes("--refresh")) {
    const rows = await pool.query(
      `select id, name, google_place_id from producers
       where google_place_id is not null
         and (hours_synced_at is null or hours_synced_at < now() - interval '28 days')`
    );
    console.log(`Te verversen: ${rows.rowCount} producenten`);
    console.log(`Kosten (Place Details basic+contact, ~$20/1000): ~$${((rows.rowCount ?? 0) * 0.02).toFixed(2)}`);
    if (!RUN) return console.log("Dry-run. Voeg --run toe om te draaien.");
    let updated = 0;
    let closed = 0;
    for (const row of rows.rows) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${row.google_place_id}&fields=opening_hours,business_status,website,formatted_phone_number&language=nl&key=${KEY}`
      );
      const data = await res.json();
      const result = data?.result;
      if (!result) continue;
      if (result.business_status === "CLOSED_PERMANENTLY") {
        await pool.query(
          `update producers set status = 'gestopt', hours_synced_at = now(), updated_at = now() where id = $1`,
          [row.id]
        );
        closed++;
        console.log(`  GESTOPT volgens Google: ${row.name}`);
        continue;
      }
      const weekday = result.opening_hours?.weekday_text;
      await pool.query(
        `update producers set
           opening_hours = coalesce($1, opening_hours),
           website = coalesce(website, $2),
           phone = coalesce(phone, $3),
           hours_synced_at = now(),
           last_verified_at = now(),
           updated_at = now()
         where id = $4`,
        [
          weekday ? compactHours(weekday) : null,
          result.website ?? null,
          result.formatted_phone_number ?? null,
          row.id,
        ]
      );
      updated++;
      await new Promise((r) => setTimeout(r, 60));
    }
    console.log(`Bijgewerkt: ${updated}, op gestopt gezet: ${closed}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
