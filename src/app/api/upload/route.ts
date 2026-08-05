import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminUser, requireSellerUser } from "@/lib/authz";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

// file.type komt van de client en is dus niet te vertrouwen; de eerste
// bytes van het bestand zelf ("magic numbers") liegen niet.
async function sniffedTypeMatches(file: File, mimeType: string): Promise<boolean> {
  const head = Buffer.from(await file.slice(0, 12).arrayBuffer());
  if (mimeType === "image/jpeg") return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (mimeType === "image/png")
    return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  if (mimeType === "image/webp")
    return head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP";
  return false;
}

// Foto-upload voor portaal en beheer. Alleen ingelogde verkopers/teamleden;
// het bestand landt in Vercel Blob en de URL wordt daarna via een server
// action (met eigenaarschapscheck) aan vermelding of product gekoppeld.
export async function POST(req: NextRequest) {
  const [seller, admin] = await Promise.all([requireSellerUser(), requireAdminUser()]);
  if (!seller && !admin) {
    return NextResponse.json({ error: "Niet ingelogd of geen toegang." }, { status: 403 });
  }
  // Ruime limiet tegen scripts, niet tegen normaal fotograferen/uploaden
  const identity = seller ? `seller-${seller.userId}` : `admin-${admin!.id}`;
  if (isRateLimited(`upload:${identity}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Even rustig aan, probeer het straks opnieuw." }, { status: 429 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Fotoberging is niet geconfigureerd." }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Geen bestand ontvangen." }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Alleen JPG, PNG of WebP wordt ondersteund." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Maximaal 8 MB per foto." }, { status: 400 });
  }
  if (!(await sniffedTypeMatches(file, file.type))) {
    return NextResponse.json(
      { error: "Het bestand is geen geldige JPG, PNG of WebP-afbeelding." },
      { status: 400 }
    );
  }

  const scope = seller ? `verkoper-${seller.seller.id}` : "beheer";
  const blob = await put(`producenten/${scope}/${randomUUID()}.${ext}`, file, {
    access: "public",
  });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}
