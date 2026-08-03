import { sql } from "drizzle-orm";
import { db } from "@/db";
import { catalogItem } from "@/lib/catalog";

export type DemandItem = { label: string; lists: number };

const RADIUS_KM = 10;
// Anonimiteitsdrempel: pas tonen vanaf 3 lijsten, zodat nooit één klant
// herleidbaar is. Platformrol: partijen verbinden, geen transacties.
const MIN_LISTS = 3;

/**
 * "Vraag in jouw buurt" voor het verkopersportaal: welke items staan open op
 * boodschappenlijsten binnen 10 km die deze producent (op token-niveau) ook
 * verkoopt. Geaggregeerd op catalogusitem, alleen aantallen, nooit wie.
 */
export async function demandNearProducer(producer: {
  lat: number | null;
  lng: number | null;
  products: string[];
}): Promise<DemandItem[]> {
  if (producer.lat == null || producer.lng == null || producer.products.length === 0) return [];
  const result = await db.execute(sql`
    select li.catalog_key as key, count(distinct l.id)::int as lists
    from list_items li
    join lists l on l.id = li.list_id
    where li.checked = false
      and li.catalog_key is not null
      and l.lat is not null and l.lng is not null
      and 6371 * 2 * asin(sqrt(
        pow(sin(radians((${producer.lat} - l.lat) / 2)), 2) +
        cos(radians(${producer.lat})) * cos(radians(l.lat)) *
        pow(sin(radians((${producer.lng} - l.lng) / 2)), 2)
      )) <= ${RADIUS_KM}
    group by li.catalog_key
  `);
  const sells = new Set(producer.products);
  const out: DemandItem[] = [];
  for (const row of result.rows as { key: string; lists: number }[]) {
    if (Number(row.lists) < MIN_LISTS) continue;
    const item = catalogItem(row.key);
    if (!item || !item.matchTokens.some((token) => sells.has(token))) continue;
    out.push({ label: item.label, lists: Number(row.lists) });
  }
  return out.sort((a, b) => b.lists - a.lists).slice(0, 10);
}
