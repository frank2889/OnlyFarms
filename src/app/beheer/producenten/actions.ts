"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/authz";
import { mergeProducers, updateProducerAdmin, type ProducerPatch } from "@/lib/queries/admin";

type Result = { ok: true } | { ok: false; error: string };

const KINDS = new Set(["boerderijwinkel", "brouwerij", "bakkerij", "imkerij", "wijngaard", "overig"]);
const STATUSES = new Set(["actief", "seizoen", "gestopt", "onbevestigd"]);

export type ProducerFormInput = {
  name: string;
  kind: string;
  status: string;
  isMember: boolean;
  address: string;
  postcode: string;
  city: string;
  province: string;
  phone: string;
  website: string;
  description: string;
  openingHours: string;
  products: string[];
  organic: boolean;
  vendingMachine: boolean;
  paymentMethods: string;
};

export async function updateProducerAction(
  producerId: number,
  input: ProducerFormInput
): Promise<Result> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Geen toegang." };

  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: "Vul een naam in." };
  if (!KINDS.has(input.kind) || !STATUSES.has(input.status))
    return { ok: false, error: "Ongeldige soort of status." };

  const clean = (v: string) => v.trim().slice(0, 500) || null;
  const products = [
    ...new Set(
      input.products
        .map((p) => p.trim().toLowerCase().slice(0, 40))
        .filter(Boolean)
    ),
  ].slice(0, 60);

  const patch: ProducerPatch = {
    name,
    kind: input.kind as ProducerPatch["kind"],
    status: input.status as ProducerPatch["status"],
    isMember: input.isMember,
    address: clean(input.address),
    postcode: clean(input.postcode),
    city: clean(input.city),
    province: clean(input.province),
    phone: clean(input.phone),
    website: clean(input.website),
    description: input.description.trim().slice(0, 2000) || null,
    openingHours: clean(input.openingHours),
    products,
    organic: input.organic,
    vendingMachine: input.vendingMachine,
    paymentMethods: clean(input.paymentMethods),
  };
  await updateProducerAdmin(producerId, patch);
  revalidatePath("/beheer", "layout");
  revalidatePath("/producent");
  return { ok: true };
}

/** Snelle actie vanuit de duplicaten-wachtrij */
export async function setProducerStoppedAction(producerId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await updateProducerAdmin(producerId, { status: "gestopt" });
  revalidatePath("/beheer", "layout");
}

/** Duplicaten samenvoegen: groupIds is de hele groep, keepId blijft bestaan */
export async function mergeProducersAction(groupIds: number[], keepId: number): Promise<Result> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Geen toegang." };
  if (!groupIds.includes(keepId)) return { ok: false, error: "Ongeldige keuze." };
  const mergeIds = groupIds.filter((id) => id !== keepId);
  await mergeProducers(keepId, mergeIds);
  revalidatePath("/beheer", "layout");
  revalidatePath("/producent/[slug]", "page");
  return { ok: true };
}
