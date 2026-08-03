"use client";

import {
  Fragment,
  createElement,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATALOG, CATEGORIES, catalogItem, searchCatalog, type CatalogItem } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import type { ItemMatch, ListItem, ShoppingList } from "@/lib/types";
import { travelInfo } from "@/lib/travel";
import { iconForItem, tintForCategory } from "@/components/catalog-icons";
import {
  CalendarIcon,
  CardsIcon,
  CheckIcon,
  ChevronDownIcon,
  ListIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RouteIcon,
  SearchIcon,
  ShareIcon,
  StoreIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";
import {
  addItemAction,
  clearBoughtAction,
  deleteListAction,
  nearbyForItemAction,
  renameListAction,
  removeItemAction,
  searchProducersAction,
  setCategoryOrderAction,
  setLocationByCoordsAction,
  setLocationByQueryAction,
  setRadiusAction,
  toggleItemAction,
  updateItemAction,
  type NearbyLite,
} from "@/app/lijst/actions";
import { hoursStatusText } from "@/lib/opening-hours";
import type { Producer } from "@/lib/types";

type Props = {
  list: ShoppingList;
  open: ListItem[];
  bought: ListItem[];
  matches: Record<string, ItemMatch>;
  seasonal: CatalogItem[];
  boughtBeforeKeys: string[];
  memberNames?: string[];
  hasHousehold?: boolean;
  viewerIsMember?: boolean;
  nearbyCounts?: Record<string, number>;
};

type Snapshot = { open: ListItem[]; bought: ListItem[] };

type OptAction =
  | { type: "check"; id: number }
  | { type: "uncheck"; id: number }
  | { type: "remove"; id: number }
  | { type: "add"; item: ListItem }
  | { type: "setQty"; id: number; qty: string }
  | { type: "clearBought" };

function optimisticReducer(state: Snapshot, action: OptAction): Snapshot {
  switch (action.type) {
    case "check": {
      const item = state.open.find((i) => i.id === action.id);
      if (!item) return state;
      return {
        open: state.open.filter((i) => i.id !== action.id),
        bought: [{ ...item, checked: true }, ...state.bought],
      };
    }
    case "uncheck": {
      const item = state.bought.find((i) => i.id === action.id);
      if (!item) return state;
      return {
        open: [...state.open, { ...item, checked: false }],
        bought: state.bought.filter((i) => i.id !== action.id),
      };
    }
    case "remove":
      return {
        open: state.open.filter((i) => i.id !== action.id),
        bought: state.bought.filter((i) => i.id !== action.id),
      };
    case "add":
      return { ...state, open: [...state.open, action.item] };
    case "setQty":
      return {
        ...state,
        open: state.open.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)),
      };
    case "clearBought":
      return { ...state, bought: [] };
  }
}

const PRIORITY_RANK: Record<string, number> = { dringend: 0, normaal: 1, "kan-wachten": 2 };

function routeUrl(lat: number | null, lng: number | null): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Offline? Dan wachten we tot de verbinding terug is; de optimistic UI staat al goed. */
async function ensureOnline(): Promise<void> {
  if (typeof navigator === "undefined" || navigator.onLine) return;
  await new Promise<void>((resolve) =>
    window.addEventListener("online", () => resolve(), { once: true })
  );
}

export default function ListView({
  list,
  open,
  bought,
  matches,
  seasonal,
  boughtBeforeKeys,
  memberNames = [],
  hasHousehold = false,
  viewerIsMember = false,
  nearbyCounts = {},
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [snapshot, applyOptimistic] = useOptimistic<Snapshot, OptAction>(
    { open, bought },
    optimisticReducer
  );
  const [shareMsg, setShareMsg] = useState(false);
  const [query, setQuery] = useState("");
  const [locQuery, setLocQuery] = useState("");
  const [locBusy, setLocBusy] = useState(false);
  const [locError, setLocError] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);
  const [qtyItem, setQtyItem] = useState<CatalogItem | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  // "N in de buurt"-badge aangetikt: paneel met de producenten voor dat item
  const [nearbyItem, setNearbyItem] = useState<CatalogItem | null>(null);
  const [nearbyResults, setNearbyResults] = useState<NearbyLite[] | null>(null);

  function openNearby(item: CatalogItem) {
    setNearbyItem(item);
    setNearbyResults(null);
    if (list.lat != null) {
      nearbyForItemAction(list.token, item.key).then(setNearbyResults).catch(() => setNearbyResults([]));
    }
  }
  const [qtyValue, setQtyValue] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(list.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [myLists, setMyLists] = useState<{ token: string; name: string }[]>([]);
  const [undo, setUndo] = useState<{ label: string; action: () => void } | null>(null);
  const [justChecked, setJustChecked] = useState<number | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tempId = useRef(-1);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
  const introFlag = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_intro") ?? "",
    () => "ssr"
  );
  const [introDismissed, setIntroDismissed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [producerHits, setProducerHits] = useState<Producer[]>([]);
  const [catOrder, setCatOrder] = useState<string[]>(() =>
    list.categoryOrder?.length ? list.categoryOrder : CATEGORIES.map((c) => c.key as string)
  );
  const [orderMode, setOrderMode] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const showIntro = introFlag === "" && !introDismissed;

  // Deep-link #lijst opent de drawer; de Lijst-tab togglet hem als je er al bent
  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | null = null;
    if (window.location.hash === "#lijst") {
      id = setTimeout(() => setDrawerOpen(true), 0);
    }
    const onToggle = () => setDrawerOpen((v) => !v);
    window.addEventListener("of:toggle-drawer", onToggle);
    return () => {
      if (id) clearTimeout(id);
      window.removeEventListener("of:toggle-drawer", onToggle);
    };
  }, []);

  // Achtergrond niet mee laten scrollen zolang drawer of zoek-overlay open is
  useEffect(() => {
    if (!drawerOpen && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, searchOpen]);

  // Lijst registreren op dit apparaat + andere lijsten voor de switcher
  useEffect(() => {
    try {
      const stored: { token: string; name: string }[] = JSON.parse(
        localStorage.getItem("of_lists") ?? "[]"
      );
      const next = [
        { token: list.token, name: list.name },
        ...stored.filter((l) => l.token !== list.token),
      ].slice(0, 20);
      localStorage.setItem("of_lists", JSON.stringify(next));
      localStorage.setItem("of_badge", String(open.length));
    } catch {}
  }, [list.token, list.name, open.length]);

  // Realtime: Pusher als er keys zijn, anders polling
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    let cleanup = () => {};
    if (key && cluster) {
      import("pusher-js").then(({ default: Pusher }) => {
        const pusher = new Pusher(key, { cluster });
        const channel = pusher.subscribe(`list-${list.token}`);
        channel.bind("updated", () => router.refresh());
        cleanup = () => pusher.disconnect();
      });
    } else {
      refreshTimer.current = setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, 10_000);
      cleanup = () => {
        if (refreshTimer.current) clearInterval(refreshTimer.current);
      };
    }
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cleanup();
      window.removeEventListener("focus", onFocus);
    };
  }, [list.token, router]);

  /** Directe UI-update; server volgt op de achtergrond (offline: zodra er weer verbinding is) */
  function act(fn: () => Promise<unknown>, optimistic?: OptAction) {
    startTransition(async () => {
      if (optimistic) applyOptimistic(optimistic);
      await ensureOnline();
      await fn();
      router.refresh();
    });
  }

  function showUndo(label: string, action: () => void) {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo({ label, action });
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  }

  function checkItem(item: ListItem) {
    navigator.vibrate?.(10);
    setJustChecked(item.id);
    // vinkje even laten zien voordat het item naar "gekocht" schuift
    setTimeout(() => {
      setJustChecked(null);
      act(() => toggleItemAction(list.token, item.id, true), { type: "check", id: item.id });
      showUndo(`${item.label} afgevinkt`, () =>
        act(() => toggleItemAction(list.token, item.id, false), { type: "uncheck", id: item.id })
      );
    }, 350);
  }

  function makeTempItem(partial: Partial<ListItem> & { label: string }): ListItem {
    return {
      id: tempId.current--,
      listId: list.id,
      catalogKey: null,
      qty: null,
      note: null,
      store: null,
      producerSlug: null,
      storeSuggestedBy: null,
      assignee: null,
      assigneeUserId: null,
      priority: "normaal",
      dueAt: null,
      checked: false,
      checkedAt: null,
      position: 0,
      createdAt: new Date(),
      ...partial,
    };
  }

  function deleteItem(item: ListItem) {
    act(() => removeItemAction(list.token, item.id), { type: "remove", id: item.id });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _droppedId, ...rest } = item;
    showUndo(`${item.label} verwijderd`, () =>
      act(
        () =>
          addItemAction(list.token, {
            catalogKey: item.catalogKey,
            label: item.label,
            qty: item.qty ?? undefined,
            note: item.note ?? undefined,
          }),
        { type: "add", item: makeTempItem({ ...rest, checked: false }) }
      )
    );
  }

  function addCatalogItem(item: CatalogItem, qty?: string) {
    navigator.vibrate?.(10);
    act(() => addItemAction(list.token, { catalogKey: item.key, label: item.label, qty }), {
      type: "add",
      item: makeTempItem({ label: item.label, catalogKey: item.key, qty: qty ?? null }),
    });
  }

  function addFreeText(label: string) {
    act(() => addItemAction(list.token, { label }), {
      type: "add",
      item: makeTempItem({ label }),
    });
  }

  function countNearby(item: CatalogItem): number {
    if (!item.matchTokens.length) return 0;
    return Math.max(0, ...item.matchTokens.map((token) => nearbyCounts[token] ?? 0));
  }

  function tapTile(item: CatalogItem) {
    const existing = snapshot.open.find((i) => i.catalogKey === item.key);
    if (!existing) {
      addCatalogItem(item);
      return;
    }
    // Bring-toggle: nog een keer tikken haalt het er weer af.
    // Aantallen gaan via vasthouden (qty-paneel).
    navigator.vibrate?.(10);
    act(() => removeItemAction(list.token, existing.id), {
      type: "remove",
      id: existing.id,
    });
  }

  function addWithQty() {
    if (!qtyItem) return;
    const qty = qtyValue.trim();
    const existing = snapshot.open.find((i) => i.catalogKey === qtyItem.key);
    if (existing) {
      act(() => updateItemAction(list.token, existing.id, { qty }));
    } else {
      addCatalogItem(qtyItem, qty);
    }
    setQtyItem(null);
    setQtyValue("");
  }

  async function share() {
    const url = `${window.location.origin}/lijst/${list.token}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: list.name, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 3000);
  }

  function useMyLocation() {
    setLocBusy(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        act(() =>
          setLocationByCoordsAction(list.token, pos.coords.latitude, pos.coords.longitude)
        );
        setLocBusy(false);
        setLocOpen(false);
      },
      () => {
        setLocError(true);
        setLocBusy(false);
      },
      { timeout: 10_000 }
    );
  }

  async function submitLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!locQuery.trim()) return;
    setLocBusy(true);
    setLocError(false);
    const result = await setLocationByQueryAction(list.token, locQuery);
    setLocBusy(false);
    if (!result.ok) setLocError(true);
    else {
      setLocQuery("");
      setLocOpen(false);
      router.refresh();
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setProducerHits([]);
  }

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const first = searchCatalog(q)[0];
    if (first) tapTile(first);
    else addFreeText(q);
    setQuery("");
    setProducerHits([]);
    searchInputRef.current?.focus();
  }

  function pickFromPanel(item: CatalogItem) {
    tapTile(item);
    setQuery("");
    setProducerHits([]);
    searchInputRef.current?.focus();
  }

  const searchResults = useMemo(() => searchCatalog(query).slice(0, 7), [query]);
  const groupedOpen = useMemo(() => {
    const orderIndex = (key: string) => {
      const i = catOrder.indexOf(key);
      return i === -1 ? 98 : i;
    };
    const byKey = new Map<string, ListItem[]>();
    for (const item of snapshot.open) {
      const cat = item.catalogKey ? catalogItem(item.catalogKey) : undefined;
      const key = cat?.category ?? "_los";
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(item);
    }
    return [...byKey.entries()]
      .sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]))
      .map(([key, items]) => ({
        key,
        label: key === "_los" ? "Zelf toegevoegd" : CATEGORIES.find((c) => c.key === key)?.label ?? key,
        items: [...items].sort(
          (a, b) => (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
        ),
      }));
  }, [snapshot.open, catOrder]);

  const orderedCategories = useMemo(() => {
    const orderIndex = (key: string) => {
      const i = catOrder.indexOf(key);
      return i === -1 ? 98 : i;
    };
    return [...CATEGORIES].sort((a, b) => orderIndex(a.key) - orderIndex(b.key));
  }, [catOrder]);

  function moveCategory(key: string, dir: -1 | 1) {
    const idx = catOrder.indexOf(key);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= catOrder.length) return;
    const next = [...catOrder];
    [next[idx], next[target]] = [next[target], next[idx]];
    setCatOrder(next);
    act(() => setCategoryOrderAction(list.token, next));
  }
  const openKeys = new Set(snapshot.open.map((i) => i.catalogKey));
  const qtyByKey = new Map(
    snapshot.open.filter((i) => i.catalogKey).map((i) => [i.catalogKey as string, i.qty])
  );
  const suggestions = seasonal.filter((s) => !openKeys.has(s.key)).slice(0, 6);
  const rebuy = boughtBeforeKeys
    .map((k) => catalogItem(k))
    .filter((i): i is CatalogItem => !!i && !openKeys.has(i.key))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-36 sm:pb-24">
      {/* Kop: lijst-switcher + delen */}
      <div className="flex items-center justify-between py-4">
        <div className="relative min-w-0">
          <button
            onClick={() => {
              try {
                setMyLists(JSON.parse(localStorage.getItem("of_lists") ?? "[]"));
              } catch {}
              setSwitcherOpen((v) => !v);
            }}
            className="flex max-w-full items-center gap-1.5 text-2xl font-bold"
          >
            <span className="truncate">{list.name}</span>
            <ChevronDownIcon width={18} height={18} className="shrink-0 text-ink-300" />
          </button>
          {switcherOpen && (
            <div className="absolute left-0 top-10 z-30 w-64 rounded-tile border border-cream-200 bg-white p-2 shadow-lg">
              {myLists
                .filter((l) => l.token !== list.token)
                .slice(0, 6)
                .map((l) => (
                  <Link
                    key={l.token}
                    href={`/lijst/${l.token}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-cream-50"
                  >
                    <ListIcon width={16} height={16} className="text-terra-500" />
                    <span className="truncate">{l.name}</span>
                  </Link>
                ))}
              <Link
                href="/lijsten"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-terra-700 hover:bg-cream-50"
              >
                <PlusIcon width={16} height={16} /> {t("lists.newList")}
              </Link>
              <div className="my-1 border-t border-cream-100" />
              <button
                onClick={() => {
                  setRenameValue(list.name);
                  setRenameOpen(true);
                  setSwitcherOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-cream-50"
              >
                <PencilIcon width={15} height={15} className="text-ink-500" /> Naam wijzigen
              </button>
              <button
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    setTimeout(() => setConfirmDelete(false), 4000);
                    return;
                  }
                  const token = list.token;
                  try {
                    const stored: { token: string }[] = JSON.parse(
                      localStorage.getItem("of_lists") ?? "[]"
                    );
                    localStorage.setItem(
                      "of_lists",
                      JSON.stringify(stored.filter((l) => l.token !== token))
                    );
                    localStorage.setItem("of_badge", "0");
                  } catch {}
                  startTransition(async () => {
                    await deleteListAction(token);
                    router.push("/lijsten");
                  });
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 ${
                  confirmDelete
                    ? "bg-terra-700 font-medium text-white"
                    : "text-terra-800 hover:bg-cream-50"
                }`}
              >
                <TrashIcon width={15} height={15} />
                {confirmDelete ? "Zeker weten? Tik nog een keer" : "Lijst verwijderen"}
              </button>
            </div>
          )}
        </div>
      </div>
      {renameOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(() => renameListAction(list.token, renameValue));
            try {
              const stored: { token: string; name: string }[] = JSON.parse(
                localStorage.getItem("of_lists") ?? "[]"
              );
              localStorage.setItem(
                "of_lists",
                JSON.stringify(
                  stored.map((l) =>
                    l.token === list.token ? { ...l, name: renameValue.trim() || l.name } : l
                  )
                )
              );
            } catch {}
            setRenameOpen(false);
          }}
          className="mb-3 flex gap-2"
        >
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-cream-300 bg-white px-4 py-2"
          />
          <button
            type="submit"
            className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
          >
            Opslaan
          </button>
          <button
            type="button"
            onClick={() => setRenameOpen(false)}
            className="text-sm text-ink-500 underline"
          >
            Annuleren
          </button>
        </form>
      )}
      {shareMsg && (
        <p className="mb-3 rounded-tile bg-terra-50 px-4 py-2 text-sm text-terra-700">
          {t("lists.shareCopied")}
        </p>
      )}
      {!online && (
        <div className="mb-3 animate-rise rounded-tile bg-ink-900 px-4 py-2.5 text-sm text-white">
          Offline. Je wijzigingen staan klaar en worden gesynct zodra je weer verbinding hebt.
        </div>
      )}
      {showIntro && (
        <div className="mb-4 animate-rise rounded-tile bg-terra-50 p-4 text-sm text-terra-800">
          <p className="mb-1.5 font-semibold">Zo werkt je lijst</p>
          <ul className="mb-2 flex flex-col gap-1">
            <li>· Tik op een tegel om iets toe te voegen; tik nog een keer om het er weer af te halen.</li>
            <li>· Houd een tegel vast om een aantal te kiezen (bijv. 2 dozen of 500 gram).</li>
            <li>· Deel de lijst met je gezin en vink samen af; alles synct vanzelf.</li>
          </ul>
          <button
            onClick={() => {
              localStorage.setItem("of_intro", "1");
              setIntroDismissed(true);
            }}
            className="font-medium text-terra-700 underline"
          >
            Begrepen
          </button>
        </div>
      )}

      {/* Locatie: compact zodra ingesteld */}
      {list.lat && !locOpen ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-500">
          <MapPinIcon width={15} height={15} className="shrink-0 text-terra-500" />
          <span className="truncate">{list.postcode}</span>
          <span>·</span>
          <select
            defaultValue={list.radiusKm}
            onChange={(e) => act(() => setRadiusAction(list.token, Number(e.target.value)))}
            className="rounded-full border border-cream-300 bg-cream-50 px-2 py-0.5"
          >
            {[5, 10, 15, 25].map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
          <button onClick={() => setLocOpen(true)} className="text-terra-700 underline">
            {t("common.changeLocation")}
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-tile border border-cream-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <MapPinIcon width={18} height={18} className="text-terra-500" />
            {!list.lat && (
              <span className="text-sm text-ink-500">
                Stel je locatie in om te zien waar je alles koopt
              </span>
            )}
            <button
              onClick={useMyLocation}
              disabled={locBusy}
              className="rounded-full border border-terra-300 px-3 py-1.5 text-sm text-terra-700 hover:bg-terra-50 disabled:opacity-50"
            >
              {t("common.myLocation")}
            </button>
            <form onSubmit={submitLocation} className="flex gap-1">
              <input
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                placeholder={t("common.postcodeOrCity")}
                className="w-36 rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-sm"
              />
              <button type="submit" className="text-sm text-terra-700 underline">
                {t("common.search")}
              </button>
            </form>
            {list.lat && (
              <button
                onClick={() => setLocOpen(false)}
                className="ml-auto text-sm text-ink-500 underline"
              >
                Annuleren
              </button>
            )}
          </div>
          {locError && (
            <p className="mt-2 text-sm text-terra-700">
              Locatie bepalen lukte niet. Probeer een postcode.
            </p>
          )}
        </div>
      )}

      {/* De lijst zelf leeft in de drawer (cart-model) */}
      {/* Suggesties */}
      {(suggestions.length > 0 || rebuy.length > 0) && (
        <div className="mt-6">
          {suggestions.length > 0 && (
            <TileRow
              title={t("lists.seasonNow")}
              items={suggestions}
              onAdd={tapTile}
              nearbyOf={countNearby}
              onNearby={openNearby}
            />
          )}
          {rebuy.length > 0 && (
            <TileRow
              title={t("lists.boughtBefore")}
              items={rebuy}
              onAdd={tapTile}
              nearbyOf={countNearby}
              onNearby={openNearby}
            />
          )}
        </div>
      )}

      {/* Toevoegen: sticky categorie-springer + tegelwand; het zoekveld staat vast onderaan */}
      <div className="mt-8 mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("lists.addItems")}</h2>
        {/* Desktop heeft geen bottom-nav; dit is daar de ingang naar het swipe-deck */}
        <Link
          href={`/lijst/${list.token}/swipen`}
          className="hidden items-center gap-1.5 text-sm font-medium text-terra-700 underline sm:inline-flex"
        >
          <CardsIcon width={16} height={16} /> {t("swipe.title")}
        </Link>
      </div>
      <div className="sticky top-0 z-20 -mx-4 bg-cream-50/95 px-4 pb-1 pt-2 backdrop-blur">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {orderedCategories.map((c) => (
            <a
              key={c.key}
              href={`#cat-${c.key}`}
              className="shrink-0 rounded-full bg-cream-100 px-3 py-1.5 text-sm hover:bg-cream-200"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>

      {(
        <div className="mt-3">
          {orderedCategories.map((cat) => {
            const items = CATALOG.filter((i) => i.category === cat.key);
            if (!items.length) return null;
            // Less is more: eerst 6 tegels per categorie, de rest achter "Toon alles"
            const expanded = expandedCats.has(cat.key);
            const shown = expanded ? items : items.slice(0, 6);
            return (
              <section key={cat.key} id={`cat-${cat.key}`} className="mb-5 scroll-mt-28">
                <h3 className="mb-2 text-sm font-semibold text-ink-500">{cat.label}</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {shown.map((item) => (
                    <AddTile
                      key={item.key}
                      item={item}
                      added={openKeys.has(item.key)}
                      qty={qtyByKey.get(item.key)}
                      nearby={countNearby(item)}
                      onAdd={() => tapTile(item)}
                      onLongPress={() => setQtyItem(item)}
                      onNearby={() => openNearby(item)}
                    />
                  ))}
                </div>
                {items.length > 6 && (
                  <button
                    onClick={() =>
                      setExpandedCats((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat.key)) next.delete(cat.key);
                        else next.add(cat.key);
                        return next;
                      })
                    }
                    className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-cream-200 bg-white text-sm font-medium text-ink-700 hover:border-terra-400"
                  >
                    {expanded ? t("lists.showLess") : t("lists.showAll", { n: items.length })}
                    <ChevronDownIcon
                      width={16}
                      height={16}
                      className={expanded ? "rotate-180" : ""}
                    />
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* De lijst-drawer (cart-model) */}
      <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-ink-900/40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Je lijst"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDrawerOpen(false);
          }}
          className={`absolute inset-x-0 bottom-16 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-tile bg-cream-50 shadow-2xl transition-transform duration-300 sm:bottom-0 ${
            drawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto max-w-2xl px-4 pb-10">
            <button
              onClick={() => setDrawerOpen(false)}
              className="mx-auto block w-full pt-2.5 pb-1"
              aria-label="Lijst sluiten"
            >
              <span className="mx-auto block h-1.5 w-12 rounded-full bg-cream-300" />
            </button>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="min-w-0 flex-1 truncate text-xl font-bold">{list.name}</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Lijst sluiten"
                className="rounded-full bg-cream-200 p-2 text-ink-700 hover:bg-cream-300"
              >
                <ChevronDownIcon width={18} height={18} />
              </button>
              <button
                onClick={share}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
              >
                <ShareIcon width={16} height={16} /> {t("lists.share")}
              </button>
            </div>
      {/* Open items */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-500">
          {t("lists.itemsOpen", { count: snapshot.open.length })}
        </h2>
        {groupedOpen.length > 1 && (
          <button
            onClick={() => setOrderMode((v) => !v)}
            className="text-xs text-ink-500 underline hover:text-terra-700"
          >
            {orderMode ? "Klaar" : t("lists.orderCategories")}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {groupedOpen.map((group) => (
          <Fragment key={group.key}>
            {groupedOpen.length > 1 && (
              <li className="mt-1.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {group.label}
                {orderMode && group.key !== "_los" && (
                  <span className="flex gap-1">
                    <button
                      onClick={() => moveCategory(group.key, -1)}
                      className="rounded-full bg-cream-100 px-2 py-0.5 hover:bg-cream-200"
                      aria-label={`${group.label} omhoog`}
                    >
                      omhoog
                    </button>
                    <button
                      onClick={() => moveCategory(group.key, 1)}
                      className="rounded-full bg-cream-100 px-2 py-0.5 hover:bg-cream-200"
                      aria-label={`${group.label} omlaag`}
                    >
                      omlaag
                    </button>
                  </span>
                )}
              </li>
            )}
            {group.items.map((item) => {
          const cat = item.catalogKey ? catalogItem(item.catalogKey) : undefined;
          const tint = cat
            ? tintForCategory(cat.category)
            : { tileBg: "bg-cream-100", icon: "text-ink-500" };
          const match = item.catalogKey ? matches[item.catalogKey] : undefined;
          return (
            <li key={item.id} className="animate-rise rounded-tile border border-cream-200 bg-white">
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => checkItem(item)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                    justChecked === item.id
                      ? "border-terra-500 bg-terra-500 text-white"
                      : "border-terra-400 text-transparent hover:bg-terra-50 hover:text-terra-400"
                  }`}
                  aria-label="Afvinken"
                >
                  <CheckIcon width={17} height={17} />
                </button>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint.tileBg}`}
                >
                  {createElement(cat ? iconForItem(cat) : StoreIcon, {
                    width: 26,
                    height: 26,
                    className: tint.icon,
                  })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.label}</p>
                  {(item.qty || item.note) && (
                    <p className="truncate text-sm text-ink-500">
                      {[item.qty, item.note].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <ItemBadges item={item} />
                  {!item.store && match && (match.exact[0] ?? match.category[0]) && (
                    <p className="mt-0.5 truncate text-xs text-terra-700">
                      {match.exact[0]
                        ? t("lists.rowTipExact", {
                            name: match.exact[0].name,
                            km: (match.exact[0].distanceKm ?? 0).toFixed(1),
                          })
                        : t("lists.rowTipSuggestion", {
                            name: match.category[0].name,
                            km: (match.category[0].distanceKm ?? 0).toFixed(1),
                          })}
                    </p>
                  )}
                  {!item.store && cat && cat.matchTokens.length === 0 && (
                    <p className="mt-0.5 text-xs text-ink-500">{t("lists.supermarketItem")}</p>
                  )}
                  {!item.store && item.id > 0 && !match && cat && cat.matchTokens.length > 0 && (
                    <button
                      onClick={() => setEditItem(item.id)}
                      className="mt-0.5 text-xs text-ink-500 underline hover:text-terra-700"
                    >
                      Weet jij waar? Geef een tip
                    </button>
                  )}
                </div>
                {cat?.nix18 && (
                  <span className="rounded-full bg-ink-900 px-2 py-0.5 text-xs text-white">18+</span>
                )}
                <button
                  onClick={() => setEditItem(editItem === item.id ? null : item.id)}
                  className="p-1 text-ink-500 hover:text-terra-600"
                  aria-label="Bewerken"
                >
                  <PencilIcon width={16} height={16} />
                </button>
                <button
                  onClick={() => deleteItem(item)}
                  className="p-1 text-ink-500 hover:text-terra-600"
                  aria-label="Verwijderen"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
              {editItem === item.id && (
                <ItemEditor
                  item={item}
                  memberNames={memberNames}
                  hasHousehold={hasHousehold}
                  viewerIsMember={viewerIsMember}
                  onSave={(patch) => {
                    act(() => updateItemAction(list.token, item.id, patch));
                    setEditItem(null);
                  }}
                />
              )}
              {match && list.lat != null && (
                <details className="border-t border-cream-100 px-3 py-2">
                  <summary className="cursor-pointer text-sm text-terra-700">
                    {t("lists.whereToBuy")}{" "}
                    <span className="text-ink-500">
                      ({match.exact.length + match.category.length})
                    </span>
                  </summary>
                  <MatchList
                    match={match}
                    onPick={(name, slug) =>
                      act(() =>
                        updateItemAction(list.token, item.id, { store: name, producerSlug: slug })
                      )
                    }
                  />
                </details>
              )}
            </li>
          );
            })}
          </Fragment>
        ))}
        {snapshot.open.length === 0 && (
          <li className="rounded-tile border border-dashed border-cream-300 p-5 text-center">
            <p className="mb-3 text-ink-500">
              Je lijst is leeg. Probeer iets uit het seizoen:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {seasonal.slice(0, 4).map((item) => (
                <AddTile key={item.key} item={item} onAdd={() => tapTile(item)} />
              ))}
            </div>
          </li>
        )}
      </ul>

      {/* Onlangs gekocht */}
      {snapshot.bought.length > 0 && (
        <>
          <div className="mt-6 mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-500">{t("lists.recentlyBought")}</h2>
            <button
              onClick={() => act(() => clearBoughtAction(list.token), { type: "clearBought" })}
              className="text-xs text-ink-500 underline hover:text-terra-700"
            >
              Wis gekochte items
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {snapshot.bought.slice(0, 10).map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-tile px-3 py-2">
                <button
                  onClick={() =>
                    act(() => toggleItemAction(list.token, item.id, false), {
                      type: "uncheck",
                      id: item.id,
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-terra-500 bg-terra-500 text-white hover:bg-terra-600"
                  aria-label="Terug op de lijst"
                >
                  <CheckIcon width={16} height={16} />
                </button>
                <span className="text-ink-500 line-through">{item.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
          </div>
        </div>
      </div>

      {/* Toevoeg-trigger onderaan; typen gebeurt in de overlay met het veld bovenaan */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-cream-200 bg-white/95 px-4 py-2 backdrop-blur sm:bottom-0">
        <button
          onClick={() => setSearchOpen(true)}
          className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-left text-ink-500"
        >
          <SearchIcon width={16} height={16} className="shrink-0" />
          {t("lists.searchCatalog")}
        </button>
      </div>

      {/* Zoek-overlay: het veld staat bovenaan, dus het toetsenbord zit nooit in de weg */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-cream-50">
          <div className="border-b border-cream-200 bg-white px-4 py-2">
            <form
              onSubmit={quickAdd}
              className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5"
            >
              <SearchIcon width={16} height={16} className="shrink-0 text-ink-500" />
              <input
                ref={searchInputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  if (searchDebounce.current) clearTimeout(searchDebounce.current);
                  if (value.trim().length >= 3 && list.lat != null) {
                    searchDebounce.current = setTimeout(async () => {
                      setProducerHits(await searchProducersAction(list.token, value));
                    }, 300);
                  } else {
                    setProducerHits([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                placeholder={t("lists.searchCatalog")}
                className="w-full bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="shrink-0 text-sm font-medium text-terra-700"
              >
                Klaar
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <div className="mx-auto max-w-2xl">
              {query ? (
                <div className="divide-y divide-cream-100 rounded-tile border border-cream-200 bg-white">
                  {searchResults.map((item) => {
                    const added = openKeys.has(item.key);
                    const n = countNearby(item);
                    const currentQty = qtyByKey.get(item.key) ?? "";
                    return (
                      <button
                        key={item.key}
                        onClick={() => pickFromPanel(item)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream-50"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tintForCategory(item.category).tileBg}`}
                        >
                          {createElement(iconForItem(item), {
                            width: 24,
                            height: 24,
                            className: tintForCategory(item.category).icon,
                          })}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          {n > 0 && (
                            <span className="text-xs text-terra-700">
                              {t("lists.nearbyCount", { n })}
                            </span>
                          )}
                        </span>
                        {added && (
                          <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs font-bold text-terra-700">
                            {/^\d+$/.test(currentQty ?? "") ? `${currentQty}\u00d7` : "op de lijst"}
                          </span>
                        )}
                        <PlusIcon width={18} height={18} className="shrink-0 text-terra-500" />
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      addFreeText(query);
                      setQuery("");
                      setProducerHits([]);
                      searchInputRef.current?.focus();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-cream-300">
                      <PlusIcon width={18} height={18} className="text-terra-500" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {t("lists.freeTextAdd", { label: query })}
                    </span>
                  </button>
                  {producerHits.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                        {t("lists.producersFound")}
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {producerHits.map((p) => (
                          <li key={p.id} className="text-sm">
                            <a href={`/producent/${p.slug}`} className="font-medium hover:underline">
                              {p.name}
                            </a>
                            <span className="text-ink-500">
                              {" "}
                              {p.city ? `\u00b7 ${p.city}` : ""}
                              {p.distanceKm !== undefined &&
                                ` \u00b7 ${t("common.distanceKm", { km: p.distanceKm.toFixed(1) })}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {suggestions.length > 0 && (
                    <TileRow title={t("lists.seasonNow")} items={suggestions} onAdd={tapTile} />
                  )}
                  {rebuy.length > 0 && (
                    <TileRow title={t("lists.boughtBefore")} items={rebuy} onAdd={tapTile} />
                  )}
                  <p className="mt-2 text-center text-sm text-ink-500">
                    Typ hierboven wat je zoekt; Enter voegt het eerste resultaat toe.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Undo-snackbar */}
      {undo && (
        <div className="animate-snack fixed bottom-[8.4rem] sm:bottom-[4.8rem] left-1/2 z-60 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-full bg-ink-900 px-5 py-3 text-sm text-white shadow-lg">
          <span className="truncate">{undo.label}</span>
          <button
            onClick={() => {
              undo.action();
              setUndo(null);
            }}
            className="shrink-0 font-semibold text-terra-300 underline"
          >
            Ongedaan maken
          </button>
        </div>
      )}

      {/* Hoeveelheid-paneel (long-press) */}
      {nearbyItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("lists.nearbySheetTitle", { label: nearbyItem.label })}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 px-3 pb-20 sm:items-center sm:pb-0"
          onClick={() => setNearbyItem(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setNearbyItem(null);
          }}
        >
          {nearbyItem && (
            <div
              className="max-h-[70vh] w-full max-w-sm overflow-y-auto overscroll-contain rounded-tile bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center gap-3">
                {createElement(iconForItem(nearbyItem), {
                  width: 30,
                  height: 30,
                  className: tintForCategory(nearbyItem.category).icon,
                })}
                <h3 className="text-lg font-bold">
                  {t("lists.nearbySheetTitle", { label: nearbyItem.label })}
                </h3>
              </div>
              {list.lat == null ? (
                <p className="text-sm text-ink-700">{t("lists.nearbyNeedsLocation")}</p>
              ) : nearbyResults === null ? (
                <p className="text-sm text-ink-500">{t("common.loading")}</p>
              ) : nearbyResults.length === 0 ? (
                <p className="text-sm text-ink-700">{t("lists.noMatch")}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {nearbyResults.map((p) => (
                    <li key={p.slug} className="text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/producent/${p.slug}`}
                          className="min-w-0 flex-1 truncate font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                        {p.isMember && (
                          <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                            {t("producers.memberBadge")}
                          </span>
                        )}
                        {p.lat != null && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex shrink-0 items-center gap-1 text-terra-700 hover:underline"
                          >
                            <RouteIcon width={13} height={13} /> {t("common.route")}
                          </a>
                        )}
                      </div>
                      <p className="text-ink-500">
                        {[
                          p.city,
                          `${p.distanceKm.toFixed(1)} km · ${t("common.travel", {
                            min: travelInfo(p.distanceKm).minutes,
                            mode: travelInfo(p.distanceKm).mode,
                          })}`,
                          hoursStatusText(p.openingHours),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setNearbyItem(null)}
                className="mt-4 text-sm text-ink-500 underline"
              >
                {t("common.close")}
              </button>
            </div>
          )}
        </div>
      )}

      {qtyItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Hoeveelheid voor ${qtyItem.label}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 px-3 pb-20 sm:items-center sm:pb-0"
          onClick={() => setQtyItem(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQtyItem(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-tile bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              {createElement(iconForItem(qtyItem), {
                width: 32,
                height: 32,
                className: tintForCategory(qtyItem.category).icon,
              })}
              <h3 className="text-lg font-semibold">{qtyItem.label}</h3>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {["1", "2", "3", "500 g", "1 kilo", "1 doos"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setQtyValue(preset)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    qtyValue === preset
                      ? "bg-terra-500 text-white"
                      : "bg-cream-100 hover:bg-cream-200"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addWithQty();
              }}
              className="flex flex-col gap-3"
            >
              <input
                autoFocus
                value={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
                placeholder="Of typ zelf (bijv. 2 dozen)"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-terra-500 px-5 py-3 font-medium text-white hover:bg-terra-600"
                >
                  Op de lijst
                </button>
                <button
                  type="button"
                  onClick={() => setQtyItem(null)}
                  className="rounded-full px-4 text-sm text-ink-500 underline"
                >
                  Annuleren
                </button>
              </div>
              {(() => {
                const existing = snapshot.open.find((i) => i.catalogKey === qtyItem.key);
                if (!existing) return null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      deleteItem(existing);
                      setQtyItem(null);
                      setQtyValue("");
                    }}
                    className="mt-1 inline-flex items-center gap-2 self-start rounded-full px-1 text-sm text-terra-800 underline"
                  >
                    <TrashIcon width={14} height={14} /> Van de lijst halen
                  </button>
                );
              })()}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTile({
  item,
  onAdd,
  onLongPress,
  onNearby,
  added,
  qty,
  nearby = 0,
}: {
  item: CatalogItem;
  onAdd: () => void;
  onLongPress?: () => void;
  onNearby?: () => void;
  added?: boolean;
  qty?: string | null;
  nearby?: number;
}) {
  const tint = tintForCategory(item.category);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function pressStart() {
    if (!onLongPress) return;
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      onLongPress();
    }, 450);
  }
  function pressEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          onAdd();
        }}
        onPointerDown={pressStart}
        onPointerUp={pressEnd}
        onPointerLeave={pressEnd}
        onContextMenu={(e) => e.preventDefault()}
        aria-pressed={added}
        className={`relative flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-tile p-2 text-center transition-[transform,colors] duration-100 active:scale-[.96] ${
          added ? "bg-terra-600 text-white" : `${tint.tileBg} hover:ring-2 hover:ring-terra-300`
        }`}
      >
        {createElement(iconForItem(item), {
          width: 36,
          height: 36,
          className: added ? "text-white" : tint.icon,
        })}
        <span className={`line-clamp-2 w-full text-sm leading-tight ${added ? "text-white" : ""}`}>
          {item.label}
        </span>
        {item.nix18 && (
          <span
            className={`absolute right-1.5 top-1.5 rounded-full px-1.5 text-[10px] font-bold ${
              added ? "bg-white/20 text-white" : "bg-ink-900 text-white"
            }`}
          >
            18+
          </span>
        )}
        {added && qty && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {/^\d+$/.test(qty) ? `${qty}\u00d7` : qty}
          </span>
        )}
      </button>
      {/* Eigen knop (geen geneste button): tik toont wie dit in de buurt verkoopt */}
      {nearby > 0 && (
        <button
          type="button"
          onClick={onNearby}
          aria-label={`${item.label}: ${t("lists.nearbyCount", { n: nearby })}`}
          className={`absolute bottom-1 right-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
            added ? "bg-white/25 text-white" : "bg-terra-500 text-white"
          } ${onNearby ? "active:scale-95" : "pointer-events-none"}`}
        >
          {t("lists.nearbyCount", { n: nearby })}
        </button>
      )}
    </div>
  );
}

function TileRow({
  title,
  items,
  onAdd,
  onNearby,
  nearbyOf,
}: {
  title: string;
  items: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
  onNearby?: (item: CatalogItem) => void;
  nearbyOf?: (item: CatalogItem) => number;
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-ink-500">{title}</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {items.map((item) => (
          <AddTile
            key={item.key}
            item={item}
            onAdd={() => onAdd(item)}
            nearby={nearbyOf?.(item) ?? 0}
            onNearby={onNearby ? () => onNearby(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function MatchList({
  match,
  onPick,
}: {
  match: ItemMatch;
  radiusKm?: number;
  onPick?: (name: string, slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 pb-1 pt-2">
      {match.exact.length > 0 && (
        <ProducerRows title={t("lists.sellsThis")} producers={match.exact} member onPick={onPick} />
      )}
      {match.category.length > 0 && (
        <ProducerRows title={t("lists.suggestion")} producers={match.category} onPick={onPick} />
      )}
      {match.exact.length + match.category.length === 0 && (
        <p className="text-sm text-ink-500">{t("lists.noMatch")}</p>
      )}
      <p className="border-t border-cream-100 pt-2 text-xs text-ink-500">
        {t("lists.supermarketFallback")}
      </p>
    </div>
  );
}

function ProducerRows({
  title,
  producers,
  member,
  onPick,
}: {
  title: string;
  producers: Producer[];
  member?: boolean;
  onPick?: (name: string, slug: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <ul className="flex flex-col gap-2">
        {producers.slice(0, 5).map((p) => (
          <li key={p.id} className="text-sm">
            <div className="flex items-center gap-2">
              <a
                href={`/producent/${p.slug}`}
                className="min-w-0 flex-1 truncate font-medium hover:underline"
              >
                {p.name}
              </a>
              {member && p.isMember && (
                <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                  {t("producers.memberBadge")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-ink-500">
              {p.city && <span>{p.city}</span>}
              {p.distanceKm !== undefined && (
                <span>
                  {t("common.distanceKm", { km: p.distanceKm.toFixed(1) })} ·{" "}
                  {t("common.travel", {
                    min: travelInfo(p.distanceKm).minutes,
                    mode: travelInfo(p.distanceKm).mode,
                  })}
                </span>
              )}
              <a
                href={routeUrl(p.lat, p.lng)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-terra-700 hover:underline"
              >
                <RouteIcon width={12} height={12} /> {t("common.route")}
              </a>
              {onPick && (
                <button
                  onClick={() => onPick(p.name, p.slug)}
                  className="rounded-full border border-terra-300 px-2 py-0.5 text-xs text-terra-700 hover:bg-terra-50"
                >
                  Hier halen
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemBadges({ item }: { item: ListItem }) {
  if (!item.store && !item.assignee && !item.dueAt && item.priority === "normaal") return null;
  const due = item.dueAt ? new Date(item.dueAt) : null;
  // eslint-disable-next-line react-hooks/purity -- klokvergelijking voor "te laat"-badge is hier bewust
  const overdue = due ? due.getTime() < Date.now() - 86_400_000 : false;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {item.store && (
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2 py-0.5 text-xs text-ink-700">
          <StoreIcon width={11} height={11} />
          {item.producerSlug ? (
            <a href={`/producent/${item.producerSlug}`} className="hover:underline">
              {item.store}
            </a>
          ) : (
            item.store
          )}
          {item.storeSuggestedBy && (
            <span className="text-ink-500">· tip van {item.storeSuggestedBy}</span>
          )}
        </span>
      )}
      {item.priority === "dringend" && (
        <span className="rounded-full bg-terra-700 px-2 py-0.5 text-xs font-semibold text-white">
          Dringend
        </span>
      )}
      {item.priority === "kan-wachten" && (
        <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs text-ink-700">
          Kan wachten
        </span>
      )}
      {item.assignee && (
        <span className="inline-flex items-center gap-1 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-800">
          <UserIcon width={11} height={11} /> {item.assignee}
        </span>
      )}
      {due && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
            overdue ? "bg-terra-700 text-white" : "bg-cream-100 text-ink-700"
          }`}
        >
          <CalendarIcon width={11} height={11} />
          {due.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
        </span>
      )}
    </div>
  );
}

function ItemEditor({
  item,
  onSave,
  memberNames = [],
  hasHousehold = false,
  viewerIsMember = false,
}: {
  item: ListItem;
  memberNames?: string[];
  hasHousehold?: boolean;
  viewerIsMember?: boolean;
  onSave: (patch: {
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
    assignee?: string;
    priority?: string;
    dueAt?: string | null;
  }) => void;
}) {
  const [qty, setQty] = useState(item.qty ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [store, setStore] = useState(item.store ?? "");
  const [assignee, setAssignee] = useState(item.assignee ?? "");
  const [dueAt, setDueAt] = useState(
    item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 10) : ""
  );
  const [priority, setPriority] = useState(item.priority ?? "normaal");

  const field = "w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-1.5 text-sm";
  // Gezinslijst: toewijzen alleen door gezinsleden, en alleen aan gezinsleden
  const assigneeLocked = hasHousehold && !viewerIsMember;

  return (
    <div className="flex flex-col gap-2 border-t border-cream-100 p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Aantal
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="2 dozen" className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Notitie
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="de grote bruine" className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Waar halen
          <input
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="winkel of producent"
            className={field}
          />
        </label>
        <div className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Wie haalt het
          {hasHousehold ? (
            assigneeLocked ? (
              <p className="rounded-xl bg-cream-50 px-3 py-2 text-ink-300">
                Alleen gezinsleden kunnen toewijzen
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {memberNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setAssignee(assignee === name ? "" : name)}
                    className={`rounded-full px-3 py-1.5 ${
                      assignee === name
                        ? "bg-terra-500 text-white"
                        : "bg-cream-100 hover:bg-cream-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )
          ) : (
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="naam"
              className={field}
            />
          )}
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Uiterlijk
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={field} />
        </label>
        <div className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          {t("lists.priorityLabel")}
          <div className="flex flex-wrap gap-1">
            {[
              ["dringend", "Dringend"],
              ["normaal", "Normaal"],
              ["kan-wachten", "Kan wachten"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={`rounded-full px-3 py-1.5 ${
                  priority === value ? "bg-terra-500 text-white" : "bg-cream-100 hover:bg-cream-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={() =>
            onSave({
              qty,
              note,
              store,
              // handmatig gewijzigde winkel verbreekt de producent-koppeling
              producerSlug: store === (item.store ?? "") ? undefined : null,
              ...(assigneeLocked ? {} : { assignee }),
              priority,
              dueAt: dueAt || null,
            })
          }
          className="rounded-full bg-terra-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-terra-600"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}
