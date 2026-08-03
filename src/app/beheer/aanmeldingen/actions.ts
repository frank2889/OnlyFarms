"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import {
  createProducerFromSeller,
  linkSellerToProducer,
  sellerById,
  setSellerStatus,
} from "@/lib/queries/admin";
import { trackEvent } from "@/lib/klaviyo";

export async function takeInReviewAction(sellerId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await setSellerStatus(sellerId, "in_beoordeling");
  revalidatePath("/beheer", "layout");
}

/**
 * Goedkeuren kan alleen mét koppel- of aanmaakkeuze, anders ontstaat een lid
 * zonder vermelding. Het Klaviyo-event voedt Sally's welkomstflow.
 */
export async function approveSellerAction(sellerId: number, formData: FormData): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const seller = await sellerById(sellerId);
  if (!seller) return;
  const choice = String(formData.get("producerId") ?? "");
  if (!choice) redirect(`/beheer/aanmeldingen/${sellerId}?fout=koppeling`);

  if (choice === "nieuw") {
    await createProducerFromSeller(seller);
  } else {
    const producerId = Number(choice);
    if (!Number.isInteger(producerId) || producerId <= 0) {
      redirect(`/beheer/aanmeldingen/${sellerId}?fout=koppeling`);
    }
    await linkSellerToProducer(sellerId, producerId, seller.email);
  }
  const changed = await setSellerStatus(sellerId, "goedgekeurd");
  if (changed) {
    await trackEvent("seller_approved", { sellerName: seller.name, city: seller.city }, seller.email);
  }
  revalidatePath("/beheer", "layout");
  redirect(`/beheer/aanmeldingen/${sellerId}`);
}

export async function rejectSellerAction(sellerId: number, formData: FormData): Promise<void> {
  await declineWith(sellerId, formData, "afgewezen", "seller_rejected");
}

export async function suspendSellerAction(sellerId: number, formData: FormData): Promise<void> {
  await declineWith(sellerId, formData, "geschorst", "seller_suspended");
}

async function declineWith(
  sellerId: number,
  formData: FormData,
  status: "afgewezen" | "geschorst",
  event: string
): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  if (reason.length < 3) redirect(`/beheer/aanmeldingen/${sellerId}?fout=reden`);
  const seller = await sellerById(sellerId);
  if (!seller) return;
  const changed = await setSellerStatus(sellerId, status, reason);
  if (changed) {
    await trackEvent(event, { sellerName: seller.name, city: seller.city, reason }, seller.email);
  }
  revalidatePath("/beheer", "layout");
  redirect(`/beheer/aanmeldingen/${sellerId}`);
}
