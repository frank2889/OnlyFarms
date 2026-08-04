import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { producers, sellers } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { trackConversion } from "@/lib/events";
import { trackEvent } from "@/lib/klaviyo";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

type ApplyBody = {
  name?: string;
  kvkNumber?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  city?: string;
  motivation?: string;
  acceptedTerms?: boolean;
  claimProducerSlug?: string;
};

export async function POST(req: NextRequest) {
  if (isRateLimited(`sellers-apply:${await clientIp()}`, 5, 60 * 60_000)) {
    return NextResponse.json(
      { errors: ["Even rustig aan: probeer het over een uur opnieuw."] },
      { status: 429 }
    );
  }
  let body: ApplyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ongeldige JSON" }, { status: 400 });
  }

  const errors: string[] = [];
  const name = (body.name ?? "").trim();
  const kvkNumber = (body.kvkNumber ?? "").replace(/\s/g, "");
  const contactName = (body.contactName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const city = (body.city ?? "").trim();
  const motivation = (body.motivation ?? "").trim();

  if (!name) errors.push("bedrijfsnaam is verplicht");
  if (!/^\d{8}$/.test(kvkNumber)) errors.push("KVK-nummer moet 8 cijfers zijn");
  if (!contactName) errors.push("contactpersoon is verplicht");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("geldig e-mailadres is verplicht");
  if (!city) errors.push("plaats is verplicht");
  if (motivation.length < 20)
    errors.push("omschrijf in minstens een paar zinnen wat je wilt aanbieden");
  if (body.acceptedTerms !== true)
    errors.push("je moet akkoord gaan met de voorwaarden");

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Warme funnel: alleen bewaren als de slug daadwerkelijk een bestaande,
  // nog niet geclaimde gids-vermelding is (bodydata is door de bezoeker
  // te manipuleren, dus altijd verifiëren tegen de database).
  const claimSlug = body.claimProducerSlug?.trim();
  let claimProducerSlug: string | null = null;
  if (claimSlug) {
    const [candidate] = await db
      .select({ slug: producers.slug, isMember: producers.isMember })
      .from(producers)
      .where(eq(producers.slug, claimSlug));
    if (candidate && !candidate.isMember) claimProducerSlug = candidate.slug;
  }

  try {
    const [row] = await db
      .insert(sellers)
      .values({
        name,
        slug: `${slugify(`${name}-${city}`)}-${kvkNumber.slice(-4)}`,
        kvkNumber,
        contactName,
        email,
        phone: (body.phone ?? "").trim() || null,
        city,
        motivation,
        acceptedTermsAt: new Date(),
        status: "aangemeld",
        claimProducerSlug,
      })
      .returning({ id: sellers.id });

    await trackConversion("producent_aangemeld");
    await trackEvent("seller_applied", { name, city, claimProducerSlug }, email);
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (err) {
    // Drizzle wrapt de echte postgres-foutmelding ("duplicate key value
    // violates unique constraint...") in err.cause; err.message zelf is
    // alleen "Failed query: ...", dus die matcht de check hieronder nooit.
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : undefined;
    const msg = cause?.message ?? (err instanceof Error ? err.message : String(err));
    if (msg.includes("duplicate key")) {
      return NextResponse.json(
        { errors: ["dit KVK-nummer of e-mailadres is al aangemeld"] },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "aanmelden mislukt" }, { status: 500 });
  }
}
