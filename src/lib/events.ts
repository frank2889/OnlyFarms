import { db } from "@/db";
import { events } from "@/db/schema";

/**
 * De primaire conversiemomenten uit Franks CRO-plan (docs/CRO-HYPOTHESES.md).
 * "Terugkeer binnen 7 dagen" is afgeleid uit deze events, geen eigen event;
 * premium bestaat nog niet. Alleen deze namen worden geaccepteerd.
 */
export const CONVERSION_EVENTS = [
  "account_aangemaakt",
  "lijst_gestart",
  "product_toegevoegd",
  "locatie_ingesteld",
  "match_bekeken",
  "route_geopend",
  "lijst_gedeeld",
  "producent_aangemeld",
  "producent_bekeken",
  "lijst_herhaald",
  "producent_opgeslagen",
] as const;

export type ConversionEvent = (typeof CONVERSION_EVENTS)[number];

/**
 * Momenten die client-side gebeuren (sendBeacon naar /api/event) i.p.v.
 * server-side in een action; één bron zodat de API-whitelist en deze lijst
 * nooit uit elkaar kunnen lopen.
 */
export const CLIENT_EVENTS: ReadonlySet<ConversionEvent> = new Set([
  "route_geopend",
  "lijst_gedeeld",
  "producent_bekeken",
]);

/**
 * Best-effort event-log: meting mag nooit het kernpad breken (patroon
 * recordSwipeSignal). Privacyvriendelijk: geen extern script, geen cookies;
 * uitlezen gebeurt geaggregeerd op het beheer-dashboard.
 */
export async function trackConversion(
  name: ConversionEvent,
  opts: {
    userId?: number | null;
    listId?: number | null;
    properties?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    await db.insert(events).values({
      name,
      userId: opts.userId ?? null,
      listId: opts.listId ?? null,
      properties: opts.properties ?? null,
    });
  } catch {}
}
