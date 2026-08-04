"use server";

import { revalidatePath } from "next/cache";
import { currentUserId } from "@/auth";
import { claimList, householdForUser, membersOfHousehold, userById } from "@/lib/queries/accounts";
import { geocode, reverseGeocode } from "@/lib/geocode";
import { trackEvent } from "@/lib/klaviyo";
import { recordSwipeSignal } from "@/lib/queries/swipe";
import { trackConversion } from "@/lib/events";
import { sendListMessage } from "@/lib/queries/chat";

import {
  addItem,
  createList,
  getListByToken,
  getListItems,
  removeItem,
  removeOpenItemByCatalogKey,
  setItemChecked,
  clearBought,
  deleteList,
  renameList,
  setCategoryOrder,
  setListLocation,
  setListRadius,
  updateItem,
} from "@/lib/queries/lists";
import { notifyListUpdated } from "@/lib/realtime";
import { nearbyProducers, producerBySlug, searchProducersByName } from "@/lib/queries/producers";
import { openFirst } from "@/lib/opening-hours";
import { SAMPLE_LIST, catalogItem } from "@/lib/catalog";
import type { Producer } from "@/lib/types";

export type NearbyLite = {
  name: string;
  slug: string;
  city: string | null;
  distanceKm: number;
  openingHours: string | null;
  isMember: boolean;
  lat: number | null;
  lng: number | null;
};

/** Producenten in de buurt voor één catalogusitem (het "N in de buurt"-badge) */
export async function nearbyForItemAction(
  token: string,
  catalogKey: string
): Promise<NearbyLite[]> {
  const list = await requireList(token);
  if (list.lat == null || list.lng == null) return [];
  const item = catalogItem(catalogKey);
  if (!item || !item.matchTokens.length) return [];
  const { producers } = await nearbyProducers({
    lat: list.lat,
    lng: list.lng,
    radiusKm: list.radiusKm ?? 10,
    tokens: item.matchTokens,
    limit: 8,
  });
  await trackConversion("match_bekeken", { listId: list.id, properties: { key: catalogKey } });
  // "Nu open" eerst (CRO), daarbinnen blijft de afstandsvolgorde
  return openFirst(producers).map((p) => ({
    name: p.name,
    slug: p.slug,
    city: p.city,
    distanceKm: p.distanceKm ?? 0,
    openingHours: p.openingHours,
    isMember: p.isMember,
    lat: p.lat,
    lng: p.lng,
  }));
}

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
  // Ingelogd? Dan hoort de lijst bij het account en het huishouden (family account)
  const userId = await currentUserId();
  if (userId) {
    const household = await householdForUser(userId);
    await claimList(list.id, userId, household?.id ?? null);
  }
  await trackEvent("list_created", { listName: list.name });
  await trackConversion("lijst_gestart", { userId, listId: list.id });
  return { token: list.token, name: list.name };
}

/**
 * Voorbeeldlijst (CRO #7): direct een gevulde lijst zodat een nieuwe gebruiker
 * zonder typen bij de eerste lokale match komt. Items gaan er rechtstreeks in
 * (geen per-item conversie-events, dat zou de metrics vervuilen).
 */
export async function createSampleListAction(): Promise<{ token: string }> {
  const list = await createList("Boodschappen");
  const userId = await currentUserId();
  if (userId) {
    const household = await householdForUser(userId);
    await claimList(list.id, userId, household?.id ?? null);
  }
  for (const key of SAMPLE_LIST) {
    const item = catalogItem(key);
    if (item) await addItem(list.id, { catalogKey: key, label: item.label });
  }
  await trackEvent("list_created", { listName: list.name, sample: true });
  await trackConversion("lijst_gestart", { userId, listId: list.id, properties: { sample: true } });
  return { token: list.token };
}

export async function addItemAction(
  token: string,
  item: {
    catalogKey?: string | null;
    label: string;
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
  }
): Promise<void> {
  const list = await requireList(token);
  let storeSuggestedBy: string | null | undefined;
  if (item.store) {
    const userId = await currentUserId();
    const user = userId ? await userById(userId) : null;
    storeSuggestedBy = user?.name ?? "gast";
  }
  await addItem(list.id, { ...item, storeSuggestedBy });
  await trackEvent("item_added", { item: item.catalogKey ?? item.label });
  await trackConversion("product_toegevoegd", {
    listId: list.id,
    properties: { key: item.catalogKey ?? item.label },
  });
  await bump(token);
}

export async function toggleItemAction(
  token: string,
  itemId: number,
  checked: boolean
): Promise<void> {
  const list = await requireList(token);
  await setItemChecked(list.id, itemId, checked, list.householdId ?? null);
  await bump(token);
}

/** Undo van een swipe-toevoeging: open item op catalogKey weer verwijderen */
export async function removeCatalogItemAction(token: string, catalogKey: string): Promise<void> {
  const list = await requireList(token);
  await removeOpenItemByCatalogKey(list.id, catalogKey);
  await bump(token);
}

/**
 * "Cheffs": bericht sturen in de lijst-chat. Alleen met een account (de naam
 * komt uit je account); optioneel gekoppeld aan een item van deze lijst
 * ("waarom heb je deze melk nodig") of aan een producent ("ik ben nu hier,
 * nog iets nodig?"). Lezen kan iedereen met de lijst-link.
 */
export async function sendChatMessageAction(
  token: string,
  body: string,
  itemId?: number | null,
  producerSlug?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const list = await requireList(token);
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "login" };
  const clean = body.trim().slice(0, 500);
  if (!clean) return { ok: false, error: "leeg" };
  let item: { id: number; label: string } | null = null;
  if (itemId) {
    const items = await getListItemsForChat(list.id);
    const match = items.find((i) => i.id === itemId);
    if (match) item = { id: match.id, label: match.label };
  }
  let producer: { slug: string; name: string } | null = null;
  if (producerSlug) {
    const found = await producerBySlug(producerSlug);
    if (found) producer = { slug: found.slug, name: found.name };
  }
  await sendListMessage(list.id, userId, clean, { item, producer });
  await bump(token);
  return { ok: true };
}

async function getListItemsForChat(listId: number): Promise<{ id: number; label: string }[]> {
  const { open, bought } = await getListItems(listId);
  return [...open, ...bought].map((i) => ({ id: i.id, label: i.label }));
}

/** Voorkeurssignaal van een swipe (rechts/links): voedt de bèta-smaakmodus, geen list-refresh nodig */
export async function recordSwipeAction(
  token: string,
  catalogKey: string,
  liked: boolean
): Promise<void> {
  const list = await requireList(token);
  const userId = await currentUserId();
  await recordSwipeSignal(
    { listId: list.id, householdId: list.householdId ?? null, userId },
    catalogKey,
    liked
  );
}

export async function updateItemAction(
  token: string,
  itemId: number,
  patch: {
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
    assignee?: string;
    priority?: string;
    dueAt?: string | null;
  }
): Promise<void> {
  const list = await requireList(token);
  // "Wie haalt het": bij een gezinslijst alleen gevalideerde gezinsleden,
  // en alleen toe te wijzen door een ingelogd gezinslid.
  let assigneeUserId: number | null | undefined;
  if (patch.assignee !== undefined && list.householdId) {
    const userId = await currentUserId();
    const members = await membersOfHousehold(list.householdId);
    const isMember = userId != null && members.some((m) => m.id === userId);
    if (!isMember) {
      delete patch.assignee; // gasten/niet-leden mogen niet toewijzen
    } else if (patch.assignee.trim()) {
      const member = members.find((m) => m.name === patch.assignee!.trim());
      if (!member) {
        delete patch.assignee; // geen vrij verzonnen namen op gezinslijsten
      } else {
        assigneeUserId = member.id;
      }
    } else {
      assigneeUserId = null;
    }
  }
  // Locatie gewijzigd? Leg vast wie de tip gaf (ingelogd gezinslid of "gast")
  let storeSuggestedBy: string | null | undefined;
  if (patch.store !== undefined) {
    if (patch.store.trim()) {
      const userId = await currentUserId();
      const user = userId ? await userById(userId) : null;
      storeSuggestedBy = user?.name ?? "gast";
    } else {
      storeSuggestedBy = null;
    }
  }
  if (patch.priority !== undefined && !VALID_PRIORITIES.has(patch.priority)) {
    delete patch.priority;
  }
  await updateItem(list.id, itemId, {
    ...patch,
    assigneeUserId,
    storeSuggestedBy,
    dueAt:
      patch.dueAt === undefined ? undefined : patch.dueAt ? new Date(patch.dueAt) : null,
  });
  await bump(token);
}

export async function clearBoughtAction(token: string): Promise<void> {
  const list = await requireList(token);
  await clearBought(list.id);
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
  await trackConversion("locatie_ingesteld", { listId: list.id });
  await bump(token);
  return { ok: true, label: result.label };
}

export async function setLocationByCoordsAction(
  token: string,
  lat: number,
  lng: number
): Promise<void> {
  const list = await requireList(token);
  // Toon wélk punt de app gebruikt — geolocation op desktop kan er flink naast zitten
  const label = await reverseGeocode(lat, lng);
  await setListLocation(list.id, { postcode: label ?? "Mijn locatie", lat, lng });
  await trackConversion("locatie_ingesteld", { listId: list.id });
  await bump(token);
}

const VALID_PRIORITIES = new Set(["dringend", "normaal", "kan-wachten"]);

export async function setCategoryOrderAction(token: string, order: string[]): Promise<void> {
  const list = await requireList(token);
  await setCategoryOrder(list.id, order.slice(0, 20));
  await bump(token);
}

/** Producenten op naam zoeken vanaf de lijst-locatie (gecombineerde zoekbalk) */
export async function searchProducersAction(
  token: string,
  query: string
): Promise<Producer[]> {
  const list = await requireList(token);
  if (!list.lat || !list.lng || query.trim().length < 3) return [];
  return searchProducersByName(query, list.lat, list.lng, 4);
}

export async function renameListAction(token: string, name: string): Promise<void> {
  const list = await requireList(token);
  await renameList(list.id, name.trim() || list.name);
  await bump(token);
}

export async function deleteListAction(token: string): Promise<void> {
  const list = await requireList(token);
  await deleteList(list.id);
  await notifyListUpdated(token);
}

export async function setRadiusAction(token: string, radiusKm: number): Promise<void> {
  const list = await requireList(token);
  await setListRadius(list.id, radiusKm);
  await bump(token);
}
