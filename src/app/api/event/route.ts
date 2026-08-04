import { NextResponse } from "next/server";
import { currentUserId } from "@/auth";
import { getListByToken } from "@/lib/queries/lists";
import { trackConversion, type ConversionEvent } from "@/lib/events";

export const runtime = "nodejs";

// Alleen de momenten die client-side gebeuren (sendBeacon); de rest wordt
// server-side gelogd in de actions zelf. Strikte whitelist tegen misbruik.
const CLIENT_EVENTS = new Set<ConversionEvent>(["route_geopend", "lijst_gedeeld"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name;
  if (typeof name !== "string" || !CLIENT_EVENTS.has(name as ConversionEvent)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const token = typeof body?.token === "string" ? body.token.slice(0, 64) : null;
  const list = token ? await getListByToken(token) : null;
  const userId = await currentUserId();
  await trackConversion(name as ConversionEvent, { userId, listId: list?.id ?? null });
  return NextResponse.json({ ok: true });
}
