"use server";

import { revalidatePath } from "next/cache";
import { geocode } from "@/lib/geocode";
import { trackEvent } from "@/lib/klaviyo";
import {
  addItem,
  createList,
  getListByToken,
  removeItem,
  setItemChecked,
  setListLocation,
  setListRadius,
  updateItem,
} from "@/lib/queries/lists";
import { notifyListUpdated } from "@/lib/realtime";

async function requireList(token: string) {
  const list = await getListByToken(token);
  if (!list) throw new Error("Lijst niet gevonden");
  return list;
}

async function bump(token: string) {
  await notifyListUpdated(token);
  revalidatePath(`/lijst/${token}`);
}

export async function createListAction(name: string): Promise<{ token: string; name: string }> {
  const list = await createList(name);
  await trackEvent("list_created", { listName: list.name });
  return { token: list.token, name: list.name };
}

export async function addItemAction(
  token: string,
  item: { catalogKey?: string | null; label: string; qty?: string; note?: string }
): Promise<void> {
  const list = await requireList(token);
  await addItem(list.id, item);
  await trackEvent("item_added", { item: item.catalogKey ?? item.label });
  await bump(token);
}

export async function toggleItemAction(
  token: string,
  itemId: number,
  checked: boolean
): Promise<void> {
  const list = await requireList(token);
  await setItemChecked(list.id, itemId, checked);
  await bump(token);
}

export async function updateItemAction(
  token: string,
  itemId: number,
  patch: { qty?: string; note?: string }
): Promise<void> {
  const list = await requireList(token);
  await updateItem(list.id, itemId, patch);
  await bump(token);
}

export async function removeItemAction(token: string, itemId: number): Promise<void> {
  const list = await requireList(token);
  await removeItem(list.id, itemId);
  await bump(token);
}

export async function setLocationByQueryAction(
  token: string,
  query: string
): Promise<{ ok: boolean; label?: string }> {
  const list = await requireList(token);
  const result = await geocode(query);
  if (!result) return { ok: false };
  await setListLocation(list.id, {
    postcode: result.label,
    lat: result.lat,
    lng: result.lng,
  });
  await bump(token);
  return { ok: true, label: result.label };
}

export async function setLocationByCoordsAction(
  token: string,
  lat: number,
  lng: number
): Promise<void> {
  const list = await requireList(token);
  await setListLocation(list.id, { postcode: "Mijn locatie", lat, lng });
  await bump(token);
}

export async function setRadiusAction(token: string, radiusKm: number): Promise<void> {
  const list = await requireList(token);
  await setListRadius(list.id, radiusKm);
  await bump(token);
}
