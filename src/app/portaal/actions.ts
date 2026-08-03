"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller, updateProducerAdmin, type ProducerPatch } from "@/lib/queries/admin";
import {
  createOffer,
  deleteOffer,
  offerByIdForSeller,
  updateOffer,
  type OfferInput,
} from "@/lib/queries/portal";
import { CATEGORIES } from "@/lib/catalog";
import type { ProducerFormInput } from "@/app/beheer/producenten/actions";

type Result = { ok: true } | { ok: false; error: string };

const MAX_PHOTOS = 8;

// Alleen foto's uit onze eigen Blob-store accepteren, nooit externe URL's
function isOwnBlobUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url);
}

async function requireOwnProducer() {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd") return null;
  const linked = await producerForSeller(ctx.seller.id);
  if (!linked) return null;
  const producer = await producerByIdAdmin(linked.id);
  return producer ? { ctx, producer } : null;
}

export async function addProducerPhotoAction(url: string): Promise<Result> {
  const own = await requireOwnProducer();
  if (!own) return { ok: false, error: "Geen toegang." };
  if (!isOwnBlobUrl(url)) return { ok: false, error: "Ongeldige foto." };
  if (own.producer.photos.length >= MAX_PHOTOS)
    return { ok: false, error: `Maximaal ${MAX_PHOTOS} foto's.` };
  if (own.producer.photos.includes(url)) return { ok: true };
  await updateProducerAdmin(own.producer.id, { photos: [...own.producer.photos, url] });
  revalidatePath("/portaal");
  revalidatePath("/producent");
  return { ok: true };
}

export async function removeProducerPhotoAction(url: string): Promise<Result> {
  const own = await requireOwnProducer();
  if (!own) return { ok: false, error: "Geen toegang." };
  await updateProducerAdmin(own.producer.id, {
    photos: own.producer.photos.filter((p) => p !== url),
  });
  if (isOwnBlobUrl(url)) {
    try {
      await del(url);
    } catch {
      // opruimen is best-effort; de referentie is al weg
    }
  }
  revalidatePath("/portaal");
  revalidatePath("/producent");
  return { ok: true };
}

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.key));

function cleanOffer(input: OfferInput): OfferInput | string {
  const title = input.title.trim().slice(0, 80);
  if (title.length < 2) return "Vul een productnaam in.";
  const photoUrl = input.photoUrl?.trim() || null;
  if (photoUrl && !isOwnBlobUrl(photoUrl)) return "Ongeldige foto.";
  return {
    title,
    category: input.category && VALID_CATEGORIES.has(input.category) ? input.category : null,
    description: input.description?.trim().slice(0, 1000) || null,
    priceIndication: input.priceIndication?.trim().slice(0, 60) || null,
    photoUrl,
    available: !!input.available,
  };
}

export async function saveOfferAction(
  offerId: number | null,
  input: OfferInput
): Promise<Result> {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd") return { ok: false, error: "Geen toegang." };
  const clean = cleanOffer(input);
  if (typeof clean === "string") return { ok: false, error: clean };

  if (offerId === null) {
    await createOffer(ctx.seller.id, clean);
  } else {
    const existing = await offerByIdForSeller(offerId, ctx.seller.id);
    if (!existing) return { ok: false, error: "Product niet gevonden." };
    await updateOffer(offerId, ctx.seller.id, clean);
    // oude foto opruimen als hij vervangen of verwijderd is
    if (existing.photoUrl && existing.photoUrl !== clean.photoUrl && isOwnBlobUrl(existing.photoUrl)) {
      try {
        await del(existing.photoUrl);
      } catch {}
    }
  }
  revalidatePath("/portaal");
  revalidatePath("/producent");
  return { ok: true };
}

export async function deleteOfferAction(offerId: number): Promise<void> {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd") return;
  const existing = await offerByIdForSeller(offerId, ctx.seller.id);
  if (!existing) return;
  await deleteOffer(offerId, ctx.seller.id);
  if (existing.photoUrl && isOwnBlobUrl(existing.photoUrl)) {
    try {
      await del(existing.photoUrl);
    } catch {}
  }
  revalidatePath("/portaal");
  revalidatePath("/producent");
}

/**
 * Eigen vermelding bewerken: alleen de eigenaar (gekoppelde, goedgekeurde
 * verkoper) en alleen de portaal-velden (contact, omschrijving, uren,
 * producten). Naam, adres en status blijven bij het team.
 */
export async function updateOwnProducerAction(
  producerId: number,
  input: ProducerFormInput
): Promise<Result> {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd")
    return { ok: false, error: "Geen toegang." };
  const producer = await producerForSeller(ctx.seller.id);
  if (!producer || producer.id !== producerId)
    return { ok: false, error: "Dit is niet jouw vermelding." };

  const clean = (v: string) => v.trim().slice(0, 500) || null;
  const products = [
    ...new Set(input.products.map((p) => p.trim().toLowerCase().slice(0, 40)).filter(Boolean)),
  ].slice(0, 60);

  const patch: ProducerPatch = {
    phone: clean(input.phone),
    website: clean(input.website),
    description: input.description.trim().slice(0, 2000) || null,
    openingHours: clean(input.openingHours),
    products,
  };
  await updateProducerAdmin(producerId, patch);
  revalidatePath("/portaal");
  revalidatePath("/producent");
  return { ok: true };
}
