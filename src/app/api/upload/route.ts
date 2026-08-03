import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminUser, requireSellerUser } from "@/lib/authz";

export const runtime = "nodejs";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

// Foto-upload voor portaal en beheer. Alleen ingelogde verkopers/teamleden;
// het bestand landt in Vercel Blob en de URL wordt daarna via een server
// action (met eigenaarschapscheck) aan vermelding of product gekoppeld.
export async function POST(req: NextRequest) {
  const [seller, admin] = await Promise.all([requireSellerUser(), requireAdminUser()]);
  if (!seller && !admin) {
    return NextResponse.json({ error: "Niet ingelogd of geen toegang." }, { status: 403 });
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

  const scope = seller ? `verkoper-${seller.seller.id}` : "beheer";
  const blob = await put(`producenten/${scope}/${randomUUID()}.${ext}`, file, {
    access: "public",
  });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}
