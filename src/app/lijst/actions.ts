"use server";

import { revalidatePath } from "next/cache";
import { currentUserId } from "@/auth";
import {
  claimList,
  householdForUser,
  isHouseholdMember,
  membersOfHousehold,
  userById,
} from "@/lib/queries/accounts";
import { geocode, reverseGeocode } from "@/lib/geocode";
import { trackEvent } from "@/lib/klaviyo";
import { recordSwipeSignal } from "@/lib/queries/swipe";
import { trackConversion } from "@/lib/events";
import { countRecentMessagesByUser, sendListMessage } from "@/lib/queries/chat";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

import {
  addItem,
  createList,
  getListByToken,
  getListItems,
  recheckItems,
  removeItem,
  removeOpenItemsByCatalogKeys,
  restoreBought,
  restoreClearedItems,
  setItemChecked,
  clearBought,
  deleteList,
  duplicateList,
  frequentBought,
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
import type { ListItem, Producer, ShoppingList } from "@/lib/types";

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

type ManageResult = { ok: true; list: ShoppingList } | { ok: false; error: string };

/**
 * Rechtencheck voor destructieve/identiteitsacties (hernoemen, verwijderen).
 * Een anonieme lijst (geen eigenaar, geen gezin) blijft volledig bestuurbaar
 * met alleen de link, zoals de rest van de app; zodra een lijst geclaimd is,
 * mag alleen de eigenaar of een gezinslid haar nog hernoemen of verwijderen.
 * Lezen, afvinken, toevoegen en chatten blijven ongemoeid (requireList).
 */
async function requireListManage(token: string): Promise<ManageResult> {
  const list = await requireList(token);
  if (!list.ownerUserId && !list.householdId) return { ok: true, list };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Log in om deze lijst te beheren." };
  if (list.ownerUserId === userId) return { ok: true, list };
  if (list.householdId && (await isHouseholdMember(userId, list.householdId)))
    return { ok: true, list };
  return { ok: false, error: "Je hebt geen rechten om deze lijst te beheren." };
}

async function bump(token: string) {
  await notifyListUpdated(token);
  revalidatePath(`/lijst/${token}`);
}

export async function createListAction(
  name: string,
  via: string = "lijst"
): Promise<{ token: string; name: string }> {
  // Ruime limiet tegen runaway scripts, niet tegen normaal gebruik
  if (isRateLimited(`create-list:${await clientIp()}`, 30, 60_000)) {
    throw new Error("Te veel lijsten in korte tijd. Probeer het over een minuutje opnieuw.");
  }
  const list = await createList(name);
  // Ingelogd? Dan hoort de lijst bij het account en het huishouden (family account)
  const userId = await currentUserId();
  if (userId) {
    const household = await householdForUser(userId);
    await claimList(list.id, userId, household?.id ?? null);
  }
  await trackEvent("list_created", { listName: list.name });
  await trackConversion("lijst_gestart", { userId, listId: list.id, properties: { via } });
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
  await trackConversion("lijst_gestart", {
    userId,
    listId: list.id,
    properties: { via: "sample", sample: true },
  });
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
  // Ruime limiet tegen runaway scripts, niet tegen een gezin dat een grote lijst opbouwt
  if (isRateLimited(`add-item:${await clientIp()}`, 120, 60_000)) {
    throw new Error("Te veel wijzigingen in korte tijd. Probeer het over een minuutje opnieuw.");
  }
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
  await removeOpenItemsByCatalogKeys(list.id, [catalogKey]);
  await bump(token);
}

/** Undo van "Zet mijn vaste boodschappen erop": de zojuist toegevoegde items weer weg */
export async function removeCatalogItemsAction(token: string, catalogKeys: string[]): Promise<void> {
  const list = await requireList(token);
  await removeOpenItemsByCatalogKeys(list.id, catalogKeys);
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
  // Rate limit: max 20 berichten per minuut per gebruiker (tegen scripts, niet tegen normaal gebruik)
  if ((await countRecentMessagesByUser(userId, 60_000)) >= 20) {
    return { ok: false, error: "te-snel" };
  }
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

/** CRO #81: de vorige boodschappen in een tik weer op de lijst. Retourneert de
 *  geraakte ids zodat de undo-knop ze precies kan terugzetten. */
export async function restoreBoughtAction(token: string): Promise<number[]> {
  const list = await requireList(token);
  const ids = await restoreBought(list.id);
  if (ids.length) {
    const userId = await currentUserId();
    await trackConversion("lijst_herhaald", {
      userId,
      listId: list.id,
      properties: { via: "terugzetten", n: ids.length },
    });
  }
  await bump(token);
  return ids;
}

/**
 * "Zet mijn vaste boodschappen erop": items die minstens 3x gekocht zijn en
 * nog niet open staan, in één tik toevoegen (heropent afgevinkte items
 * idempotent via addItem). Retourneert de toegevoegde keys voor de undo.
 */
export async function addStaplesAction(token: string): Promise<string[]> {
  const list = await requireList(token);
  const staples = await frequentBought(list);
  const { open } = await getListItems(list.id);
  const openKeys = new Set(open.map((i) => i.catalogKey).filter((k): k is string => !!k));
  const toAdd = staples.filter((key) => !openKeys.has(key));
  for (const key of toAdd) {
    const item = catalogItem(key);
    if (item) await addItem(list.id, { catalogKey: key, label: item.label });
  }
  if (toAdd.length) {
    const userId = await currentUserId();
    await trackConversion("lijst_herhaald", {
      userId,
      listId: list.id,
      properties: { via: "vaste-boodschappen", n: toAdd.length },
    });
  }
  await bump(token);
  return toAdd;
}

/** Undo van restoreBoughtAction */
export async function recheckItemsAction(token: string, ids: number[]): Promise<void> {
  const list = await requireList(token);
  await recheckItems(list.id, ids);
  await bump(token);
}

/** Retourneert de gewiste items zodat de undo-knop ze exact kan terugzetten */
export async function clearBoughtAction(token: string): Promise<ListItem[]> {
  const list = await requireList(token);
  const removed = await clearBought(list.id);
  await bump(token);
  return removed;
}

/** Undo van clearBoughtAction */
export async function restoreClearedAction(token: string, items: ListItem[]): Promise<void> {
  const list = await requireList(token);
  await restoreClearedItems(list.id, items);
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

export async function renameListAction(
  token: string,
  name: string
): Promise<{ ok: boolean; error?: string }> {
  const manage = await requireListManage(token);
  if (!manage.ok) return manage;
  await renameList(manage.list.id, name.trim() || manage.list.name);
  await bump(token);
  return { ok: true };
}

export async function deleteListAction(token: string): Promise<{ ok: boolean; error?: string }> {
  const manage = await requireListManage(token);
  if (!manage.ok) return manage;
  await deleteList(manage.list.id);
  await notifyListUpdated(token);
  return { ok: true };
}

/**
 * Lijst dupliceren: niet-destructief (de bron blijft ongemoeid), dus geen
 * beheerrecht nodig, net als lezen/toevoegen — alleen de link is genoeg.
 * De kopie wordt voor een ingelogde gebruiker meteen geclaimd.
 */
export async function duplicateListAction(
  token: string,
  name: string
): Promise<{ ok: true; token: string; name: string } | { ok: false; error: string }> {
  const list = await requireList(token);
  const created = await duplicateList(list.id, name);
  const userId = await currentUserId();
  if (userId) {
    const household = await householdForUser(userId);
    await claimList(created.id, userId, household?.id ?? null);
  }
  await trackConversion("lijst_gestart", { userId, listId: created.id, properties: { via: "duplicaat" } });
  return { ok: true, token: created.token, name: created.name };
}

export async function setRadiusAction(token: string, radiusKm: number): Promise<void> {
  const list = await requireList(token);
  await setListRadius(list.id, radiusKm);
  await bump(token);
}
