"use server";

import { revalidatePath } from "next/cache";
import { requireSellerUser } from "@/lib/authz";
import { producerForSeller, updateProducerAdmin, type ProducerPatch } from "@/lib/queries/admin";
import type { ProducerFormInput } from "@/app/beheer/producenten/actions";

type Result = { ok: true } | { ok: false; error: string };

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
