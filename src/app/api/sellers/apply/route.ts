import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { trackConversion } from "@/lib/events";
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
      })
      .returning({ id: sellers.id });

    await trackConversion("producent_aangemeld");
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate key")) {
      return NextResponse.json(
        { errors: ["dit KVK-nummer of e-mailadres is al aangemeld"] },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "aanmelden mislukt" }, { status: 500 });
  }
}
