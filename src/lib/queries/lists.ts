import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { boughtStats, listItems, lists } from "@/db/schema";
import type { ListItem, ShoppingList } from "@/lib/types";

export async function createList(name: string): Promise<ShoppingList> {
  const token = randomBytes(12).toString("base64url");
  const [row] = await db
    .insert(lists)
    .values({ token, name: name.trim() || "Boodschappen" })
    .returning();
  return row as ShoppingList;
}

export async function getListByToken(token: string): Promise<ShoppingList | null> {
  const [row] = await db.select().from(lists).where(eq(lists.token, token));
  return (row as ShoppingList) ?? null;
}

export async function getListItems(listId: number): Promise<{
  open: ListItem[];
  bought: ListItem[];
}> {
  const rows = (await db
    .select()
    .from(listItems)
    .where(eq(listItems.listId, listId))
    .orderBy(asc(listItems.position), asc(listItems.createdAt))) as ListItem[];
  const open = rows.filter((r) => !r.checked);
  const bought = rows
    .filter((r) => r.checked)
    .sort((a, b) => (b.checkedAt?.getTime() ?? 0) - (a.checkedAt?.getTime() ?? 0));
  return { open, bought };
}

export async function addItem(
  listId: number,
  item: {
    catalogKey?: string | null;
    label: string;
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
    storeSuggestedBy?: string | null;
  }
): Promise<void> {
  // Zelfde item opnieuw toevoegen terwijl het afgevinkt staat = weer op de lijst
  if (item.catalogKey) {
    const [existing] = await db
      .select({ id: listItems.id })
      .from(listItems)
      .where(
        and(eq(listItems.listId, listId), eq(listItems.catalogKey, item.catalogKey))
      );
    if (existing) {
      await db
        .update(listItems)
        .set({
          checked: false,
          checkedAt: null,
          qty: item.qty || null,
          note: item.note || null,
          ...(item.store ? { store: item.store, producerSlug: item.producerSlug ?? null, storeSuggestedBy: item.storeSuggestedBy ?? null } : {}),
        })
        .where(eq(listItems.id, existing.id));
      await touch(listId);
      return;
    }
  }
  await db.insert(listItems).values({
    listId,
    catalogKey: item.catalogKey ?? null,
    label: item.label.trim(),
    qty: item.qty?.trim() || null,
    note: item.note?.trim() || null,
    store: item.store?.trim() || null,
    producerSlug: item.producerSlug ?? null,
    storeSuggestedBy: item.storeSuggestedBy ?? null,
  });
  await touch(listId);
}

export async function setItemChecked(
  listId: number,
  itemId: number,
  checked: boolean,
  householdId: number | null = null
): Promise<void> {
  const [row] = await db
    .update(listItems)
    .set({ checked, checkedAt: checked ? sql`now()` : null })
    .where(and(eq(listItems.id, itemId), eq(listItems.listId, listId)))
    .returning({ catalogKey: listItems.catalogKey });
  // Koophistorie bijhouden voor het swipe-deck; nooit het afvinken laten falen
  // op statistiek (kernpad). Undo binnen 5s telt eens te veel: acceptabel.
  if (checked && row?.catalogKey) {
    try {
      await db
        .insert(boughtStats)
        .values({ listId, householdId, catalogKey: row.catalogKey })
        .onConflictDoUpdate({
          target: [boughtStats.listId, boughtStats.catalogKey],
          set: { times: sql`${boughtStats.times} + 1`, lastAt: sql`now()`, householdId },
        });
    } catch {}
  }
  await touch(listId);
}

/** Koophistorie voor het swipe-deck: huishouden-breed waar mogelijk, anders per lijst */
export async function boughtStatsFor(list: {
  id: number;
  householdId: number | null;
}): Promise<{ key: string; times: number }[]> {
  const rows = await db
    .select({ key: boughtStats.catalogKey, times: boughtStats.times })
    .from(boughtStats)
    .where(
      list.householdId
        ? eq(boughtStats.householdId, list.householdId)
        : eq(boughtStats.listId, list.id)
    )
    .orderBy(desc(boughtStats.times), desc(boughtStats.lastAt))
    .limit(30);
  // huishouden-scope kan hetzelfde item vanuit meerdere lijsten bevatten: sommeren
  const merged = new Map<string, number>();
  for (const r of rows) merged.set(r.key, (merged.get(r.key) ?? 0) + r.times);
  return [...merged.entries()].map(([key, times]) => ({ key, times }));
}

/** Open item van de lijst halen op catalogKey (undo van een swipe-toevoeging) */
export async function removeOpenItemByCatalogKey(listId: number, catalogKey: string): Promise<void> {
  await db
    .delete(listItems)
    .where(
      and(
        eq(listItems.listId, listId),
        eq(listItems.catalogKey, catalogKey),
        eq(listItems.checked, false)
      )
    );
  await touch(listId);
}

export async function updateItem(
  listId: number,
  itemId: number,
  patch: {
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
    storeSuggestedBy?: string | null;
    assignee?: string;
    assigneeUserId?: number | null;
    priority?: string;
    dueAt?: Date | null;
  }
): Promise<void> {
  await db
    .update(listItems)
    .set({
      ...(patch.qty !== undefined ? { qty: patch.qty.trim() || null } : {}),
      ...(patch.note !== undefined ? { note: patch.note.trim() || null } : {}),
      ...(patch.store !== undefined ? { store: patch.store.trim() || null } : {}),
      ...(patch.producerSlug !== undefined ? { producerSlug: patch.producerSlug } : {}),
      ...(patch.storeSuggestedBy !== undefined ? { storeSuggestedBy: patch.storeSuggestedBy } : {}),
      ...(patch.assignee !== undefined ? { assignee: patch.assignee.trim() || null } : {}),
      ...(patch.assigneeUserId !== undefined ? { assigneeUserId: patch.assigneeUserId } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
      ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt } : {}),
    })
    .where(and(eq(listItems.id, itemId), eq(listItems.listId, listId)));
  await touch(listId);
}

/** "Vorige lijst met een tik herhalen" (CRO #81): alles wat gekocht is weer open zetten */
export async function restoreBought(listId: number): Promise<void> {
  await db
    .update(listItems)
    .set({ checked: false, checkedAt: null })
    .where(and(eq(listItems.listId, listId), eq(listItems.checked, true)));
  await touch(listId);
}

export async function clearBought(listId: number): Promise<void> {
  await db
    .delete(listItems)
    .where(and(eq(listItems.listId, listId), eq(listItems.checked, true)));
  await touch(listId);
}

export async function removeItem(listId: number, itemId: number): Promise<void> {
  await db
    .delete(listItems)
    .where(and(eq(listItems.id, itemId), eq(listItems.listId, listId)));
  await touch(listId);
}

export async function setListLocation(
  listId: number,
  loc: { postcode?: string | null; lat: number; lng: number; radiusKm?: number }
): Promise<void> {
  await db
    .update(lists)
    .set({
      postcode: loc.postcode ?? null,
      lat: loc.lat,
      lng: loc.lng,
      ...(loc.radiusKm ? { radiusKm: loc.radiusKm } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(lists.id, listId));
}

export async function setListRadius(listId: number, radiusKm: number): Promise<void> {
  await db
    .update(lists)
    .set({ radiusKm, updatedAt: sql`now()` })
    .where(eq(lists.id, listId));
}

export async function deleteList(listId: number): Promise<void> {
  await db.delete(lists).where(eq(lists.id, listId));
}

export async function renameList(listId: number, name: string): Promise<void> {
  await db
    .update(lists)
    .set({ name: name.trim(), updatedAt: sql`now()` })
    .where(eq(lists.id, listId));
}

async function touch(listId: number): Promise<void> {
  await db
    .update(lists)
    .set({ updatedAt: sql`now()` })
    .where(eq(lists.id, listId));
}

/** "Eerder gekocht": catalog-keys op frequentie (meest gekocht eerst).
 *  Leest uit de wisbestendige bought_stats; valt terug op de oude aggregatie
 *  zolang een lijst nog geen historie heeft opgebouwd. */
export async function boughtBefore(listId: number): Promise<string[]> {
  const stats = await db
    .select({ key: boughtStats.catalogKey })
    .from(boughtStats)
    .where(eq(boughtStats.listId, listId))
    .orderBy(desc(boughtStats.times), desc(boughtStats.lastAt))
    .limit(12);
  if (stats.length) return stats.map((r) => r.key);

  const rows = await db
    .select({
      key: listItems.catalogKey,
      n: sql<number>`count(*)`,
      last: sql<Date>`max(${listItems.checkedAt})`,
    })
    .from(listItems)
    .where(and(eq(listItems.listId, listId), eq(listItems.checked, true)))
    .groupBy(listItems.catalogKey)
    .orderBy(sql`count(*) desc`, sql`max(${listItems.checkedAt}) desc`)
    .limit(12);
  return rows.map((r) => r.key).filter((k): k is string => !!k);
}

export async function setCategoryOrder(listId: number, order: string[]): Promise<void> {
  await db
    .update(lists)
    .set({ categoryOrder: order, updatedAt: sql`now()` })
    .where(eq(lists.id, listId));
}
