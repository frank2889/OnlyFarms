"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireAdminUser } from "@/lib/authz";
import {
  approveProducerPhoto,
  deleteOfferAdmin,
  publishOffer,
  rejectProducerPhoto,
} from "@/lib/queries/admin";
import { trackEvent } from "@/lib/klaviyo";

function isOwnBlobUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url);
}

async function cleanupBlob(url: string | null): Promise<void> {
  if (url && isOwnBlobUrl(url)) {
    try {
      await del(url);
    } catch {
      // best-effort; de referentie is al weg
    }
  }
}

export async function publishOfferAction(offerId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const result = await publishOffer(offerId);
  revalidatePath("/beheer", "layout");
  revalidatePath("/producent/[slug]", "page");
  if (result) {
    await trackEvent("offer_published", { title: result.title }, result.sellerEmail);
  }
}

export async function deleteOfferAdminAction(offerId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const photoUrl = await deleteOfferAdmin(offerId);
  await cleanupBlob(photoUrl);
  revalidatePath("/beheer", "layout");
  revalidatePath("/producent/[slug]", "page");
  revalidatePath("/portaal");
}

export async function approvePhotoAction(producerId: number, url: string): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const result = await approveProducerPhoto(producerId, url);
  revalidatePath("/beheer", "layout");
  revalidatePath("/producent/[slug]", "page");
  revalidatePath("/portaal");
  if (result) {
    await trackEvent("photo_approved", {}, result.sellerEmail);
  }
}

export async function rejectPhotoAction(producerId: number, url: string): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await rejectProducerPhoto(producerId, url);
  await cleanupBlob(url);
  revalidatePath("/beheer", "layout");
  revalidatePath("/portaal");
}
