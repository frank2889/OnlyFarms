import { NextResponse } from "next/server";
import { currentUserId } from "@/auth";
import { getListByToken } from "@/lib/queries/lists";
import { CLIENT_EVENTS, trackConversion, type ConversionEvent } from "@/lib/events";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

export async function POST(req: Request) {
  // Ruime limiet tegen scriptmisbruik (log-vervuiling maakt het dashboard
  // onbruikbaar); normaal gebruik zit hier nooit in de buurt van.
  if (isRateLimited(`event:${await clientIp()}`, 120, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const name = body?.name;
  if (typeof name !== "string" || !CLIENT_EVENTS.has(name as ConversionEvent)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const token = typeof body?.token === "string" ? body.token.slice(0, 64) : null;
  const list = token ? await getListByToken(token) : null;
  const slug = typeof body?.slug === "string" && SLUG_RE.test(body.slug) ? body.slug : null;
  const userId = await currentUserId();
  await trackConversion(name as ConversionEvent, {
    userId,
    listId: list?.id ?? null,
    ...(slug ? { properties: { slug } } : {}),
  });
  return NextResponse.json({ ok: true });
}
