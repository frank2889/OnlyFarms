"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller, updateProducerAdmin, type ProducerPatch } from "@/lib/queries/admin";
import {
  confirmOffer,
  createOffer,
  deleteOffer,
  offerByIdForSeller,
  updateOffer,
  updateSellerContact,
  type OfferInput,
} from "@/lib/queries/portal";
import { CATEGORIES, KNOWN_TOKENS, catalogItem } from "@/lib/catalog";
import { t } from "@/lib/i18n";
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
  const { photos, photosPending } = own.producer;
  if (photos.length + photosPending.length >= MAX_PHOTOS)
    return { ok: false, error: `Maximaal ${MAX_PHOTOS} foto's.` };
  if (photos.includes(url) || photosPending.includes(url)) return { ok: true };
  // Screening: nieuwe foto's wachten op teamcontrole vóór ze publiek gaan
  await updateProducerAdmin(own.producer.id, { photosPending: [...photosPending, url] });
  revalidatePath("/portaal");
  revalidatePath("/beheer", "layout");
  return { ok: true };
}

export async function removeProducerPhotoAction(url: string): Promise<Result> {
  const own = await requireOwnProducer();
  if (!own) return { ok: false, error: "Geen toegang." };
  await updateProducerAdmin(own.producer.id, {
    photos: own.producer.photos.filter((p) => p !== url),
    photosPending: own.producer.photosPending.filter((p) => p !== url),
  });
  if (isOwnBlobUrl(url)) {
    try {
      await del(url);
    } catch {
      // opruimen is best-effort; de referentie is al weg
    }
  }
  revalidatePath("/portaal");
  revalidatePath("/producent/[slug]", "page");
  revalidatePath("/beheer", "layout");
  return { ok: true };
}

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.key));

function cleanOffer(input: OfferInput): OfferInput | string {
  const title = input.title.trim().slice(0, 80);
  if (title.length < 2) return "Vul een productnaam in.";
  const photoUrl = input.photoUrl?.trim() || null;
  if (photoUrl && !isOwnBlobUrl(photoUrl)) return "Ongeldige foto.";
  const catalogKey = input.catalogKey?.trim() || null;
  if (catalogKey && !catalogItem(catalogKey)) return "Onbekend catalogusitem.";
  return {
    title,
    category: input.category && VALID_CATEGORIES.has(input.category) ? input.category : null,
    catalogKey,
    description: input.description?.trim().slice(0, 1000) || null,
    priceIndication: input.priceIndication?.trim().slice(0, 60) || null,
    photoUrl,
    available: !!input.available,
    featured: !!input.featured,
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
    // published default false: nieuw aanbod wacht op teamcontrole
    await createOffer(ctx.seller.id, clean);
  } else {
    const existing = await offerByIdForSeller(offerId, ctx.seller.id);
    if (!existing) return { ok: false, error: "Product niet gevonden." };
    // Inhoudelijke wijziging = terug de controle-wachtrij in; alleen de
    // beschikbaar-toggle omzetten raakt de publicatiestatus niet.
    const contentChanged =
      existing.title !== clean.title ||
      existing.category !== clean.category ||
      existing.description !== clean.description ||
      existing.priceIndication !== clean.priceIndication ||
      existing.photoUrl !== clean.photoUrl;
    await updateOffer(offerId, ctx.seller.id, clean, { unpublish: contentChanged });
    // oude foto opruimen als hij vervangen of verwijderd is
    if (existing.photoUrl && existing.photoUrl !== clean.photoUrl && isOwnBlobUrl(existing.photoUrl)) {
      try {
        await del(existing.photoUrl);
      } catch {}
    }
  }
  revalidatePath("/portaal");
  revalidatePath("/producent/[slug]", "page");
  revalidatePath("/beheer", "layout");
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
  revalidatePath("/producent/[slug]", "page");
}

/** "Alles klopt nog" voor één product: zet alleen lastVerifiedAt op dit aanbod */
export async function confirmOfferAction(offerId: number): Promise<Result> {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd") return { ok: false, error: "Geen toegang." };
  const existing = await offerByIdForSeller(offerId, ctx.seller.id);
  if (!existing) return { ok: false, error: "Product niet gevonden." };
  await confirmOffer(offerId, ctx.seller.id);
  revalidatePath("/portaal/producten");
  return { ok: true };
}

/**
 * "Alles klopt nog": zet de laatst-bevestigd-datum (updateProducerAdmin doet
 * dat automatisch, ook bij een lege patch). Direct antwoord op het
 * datakwaliteitsprobleem dat vrijwel niets ooit geverifieerd was.
 */
export async function confirmListingAction(): Promise<Result> {
  const own = await requireOwnProducer();
  if (!own) return { ok: false, error: "Geen toegang." };
  await updateProducerAdmin(own.producer.id, {});
  revalidatePath("/portaal");
  revalidatePath("/producent/[slug]", "page");
  return { ok: true };
}

/** Contactpersoon (sellers-tabel) zelf beheren; e-mail blijft bij het team (koppel-sleutel) */
export async function updateSellerContactAction(input: {
  contactName: string;
  phone: string;
}): Promise<Result> {
  const ctx = await requireSellerUser();
  if (!ctx) return { ok: false, error: "Geen toegang." };
  const name = input.contactName.trim();
  if (name.length < 2) return { ok: false, error: "Vul een naam in." };
  await updateSellerContact(ctx.seller.id, {
    contactName: name.slice(0, 80),
    phone: input.phone.trim().slice(0, 40) || null,
  });
  revalidatePath("/portaal");
  return { ok: true };
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
  const requested = [
    ...new Set(input.products.map((p) => p.trim().toLowerCase().slice(0, 40)).filter(Boolean)),
  ].slice(0, 60);
  const knownTokens = new Set(KNOWN_TOKENS);
  const unknown = requested.filter((p) => !knownTokens.has(p));
  if (unknown.length > 0)
    return { ok: false, error: t("admin.formProductsUnknown", { tokens: unknown.join(", ") }) };
  const products = requested;

  const patch: ProducerPatch = {
    phone: clean(input.phone),
    website: clean(input.website),
    description: input.description.trim().slice(0, 2000) || null,
    openingHours: clean(input.openingHours),
    products,
    organic: !!input.organic,
    vendingMachine: !!input.vendingMachine,
    paymentMethods: clean(input.paymentMethods),
  };
  await updateProducerAdmin(producerId, patch);
  revalidatePath("/portaal");
  revalidatePath("/producent/[slug]", "page");
  return { ok: true };
}

/**
 * Vakantie/tijdelijk gesloten: verloopt vanzelf (geen cron), matching blijft
 * ongemoeid (een gesloten zaak blijft gewoon matchen, alleen de open-status
 * op de publieke pagina wijkt tijdelijk).
 */
export async function setClosedUntilAction(date: string | null): Promise<Result> {
  const own = await requireOwnProducer();
  if (!own) return { ok: false, error: "Geen toegang." };

  if (date === null) {
    await updateProducerAdmin(own.producer.id, { closedUntil: null });
    revalidatePath("/portaal");
    revalidatePath("/producent/[slug]", "page");
    return { ok: true };
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return { ok: false, error: "Ongeldige datum." };
  const max = new Date();
  max.setFullYear(max.getFullYear() + 1);
  if (parsed.getTime() > max.getTime())
    return { ok: false, error: "Kies een datum binnen een jaar." };

  await updateProducerAdmin(own.producer.id, { closedUntil: parsed });
  revalidatePath("/portaal");
  revalidatePath("/producent/[slug]", "page");
  return { ok: true };
}
