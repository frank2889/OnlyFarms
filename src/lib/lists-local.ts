// Centrale toegang tot "mijn lijsten op dit apparaat" (localStorage). Was
// vijfvoudig gedupliceerd: elk component had zijn eigen subscribeStorage +
// JSON.parse + lists[0]-aanname. Consumers gebruiken nog steeds zelf
// useSyncExternalStore (lint-regel react-hooks/set-state-in-effect); deze
// module levert alleen de pure snapshot/mutatie-functies.
//
// Twee sleutels: of_lists (recent bezochte lijsten, nieuwste eerst, max 20)
// en of_pinned (optioneel: één vaste lijst-token die "nieuwste" overstemt).
// Native 'storage'-events vuren niet binnen hetzelfde tabblad; een eigen
// event zorgt dat schrijven en lezen in dezelfde tab elkaar wel zien (zelfde
// patroon als de Cheffs-ongelezen-teller in ListView.tsx).

export type StoredList = { token: string; name: string };

const LISTS_KEY = "of_lists";
const PINNED_KEY = "of_pinned";
const CHANGE_EVENT = "of:lists-changed";

export function subscribeLists(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listsSnapshot(): string {
  return localStorage.getItem(LISTS_KEY) ?? "[]";
}

export function pinnedSnapshot(): string {
  return localStorage.getItem(PINNED_KEY) ?? "";
}

export function parseStoredLists(raw: string): StoredList[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Lijst vooraan zetten (meest recent bezocht/aangemaakt), max 20 bewaard */
export function rememberList(list: StoredList): void {
  try {
    const stored = parseStoredLists(listsSnapshot());
    const next = [list, ...stored.filter((l) => l.token !== list.token)].slice(0, 20);
    localStorage.setItem(LISTS_KEY, JSON.stringify(next));
    notifyChange();
  } catch {}
}

/** Lijst uit het apparaat-geheugen halen (verwijderd, of dode token opruimen) */
export function forgetList(token: string): void {
  try {
    const stored = parseStoredLists(listsSnapshot());
    localStorage.setItem(LISTS_KEY, JSON.stringify(stored.filter((l) => l.token !== token)));
    if (pinnedSnapshot() === token) localStorage.removeItem(PINNED_KEY);
    notifyChange();
  } catch {}
}

export function renameStoredList(token: string, name: string): void {
  try {
    const stored = parseStoredLists(listsSnapshot());
    localStorage.setItem(
      LISTS_KEY,
      JSON.stringify(stored.map((l) => (l.token === token ? { ...l, name } : l)))
    );
    notifyChange();
  } catch {}
}

/** Vaste lijst togglen: nogmaals hetzelfde token zet 'm weer uit */
export function togglePinnedList(token: string): void {
  try {
    localStorage.setItem(PINNED_KEY, pinnedSnapshot() === token ? "" : token);
    notifyChange();
  } catch {}
}

/** De actieve lijst voor apparaat-navigatie (tabbalk, swipen, "zet op je lijst"): pin wint, anders de meest recente */
export function activeToken(listsRaw: string, pinnedRaw: string): string | null {
  if (pinnedRaw) return pinnedRaw;
  return parseStoredLists(listsRaw)[0]?.token ?? null;
}

/** Zelfde als activeToken, maar met de naam erbij (voor Cheffs/toevoegen-flows) */
export function activeList(listsRaw: string, pinnedRaw: string): StoredList | null {
  const stored = parseStoredLists(listsRaw);
  const token = activeToken(listsRaw, pinnedRaw);
  if (!token) return null;
  return stored.find((l) => l.token === token) ?? { token, name: "" };
}
