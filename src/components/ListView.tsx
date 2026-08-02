"use client";

import { createElement, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATALOG, CATEGORIES, catalogItem, searchCatalog, type CatalogItem } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import type { ItemMatch, ListItem, ShoppingList } from "@/lib/types";
import { travelInfo } from "@/lib/travel";
import { iconForItem, tintForCategory } from "@/components/catalog-icons";
import {
  CalendarIcon,
  CheckIcon,
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
  removeItemAction,
  updateItemAction,
  setLocationByCoordsAction,
  setLocationByQueryAction,
  setRadiusAction,
  toggleItemAction,
} from "@/app/lijst/actions";

type Props = {
  list: ShoppingList;
  open: ListItem[];
  bought: ListItem[];
  matches: Record<string, ItemMatch>;
  seasonal: CatalogItem[];
  boughtBeforeKeys: string[];
  memberNames?: string[];
};

function routeUrl(lat: number | null, lng: number | null): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function ListView({ list, open, bought, matches, seasonal, boughtBeforeKeys, memberNames = [] }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [shareMsg, setShareMsg] = useState(false);
  const [query, setQuery] = useState("");
  const [locQuery, setLocQuery] = useState("");
  const [locBusy, setLocBusy] = useState(false);
  const [locError, setLocError] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lijst registreren op dit apparaat (voor het "Mijn lijsten"-overzicht)
  useEffect(() => {
    try {
      const stored: { token: string; name: string }[] = JSON.parse(
        localStorage.getItem("of_lists") ?? "[]"
      );
      const next = [
        { token: list.token, name: list.name },
        ...stored.filter((l) => l.token !== list.token),
      ];
      localStorage.setItem("of_lists", JSON.stringify(next.slice(0, 20)));
    } catch {}
  }, [list.token, list.name]);

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

  function act(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
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
      router.refresh();
    }
  }

  const searchResults = useMemo(() => searchCatalog(query).slice(0, 8), [query]);
  const openKeys = new Set(open.map((i) => i.catalogKey));
  const openIdByKey = new Map(
    open.filter((i) => i.catalogKey).map((i) => [i.catalogKey as string, i.id])
  );

  function toggleTile(item: CatalogItem) {
    const existingId = openIdByKey.get(item.key);
    if (existingId) {
      act(() => removeItemAction(list.token, existingId));
    } else {
      act(() => addItemAction(list.token, { catalogKey: item.key, label: item.label }));
    }
  }
  const suggestions = seasonal.filter((s) => !openKeys.has(s.key)).slice(0, 8);
  const rebuy = boughtBeforeKeys
    .map((k) => catalogItem(k))
    .filter((i): i is CatalogItem => !!i && !openKeys.has(i.key))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
      {/* Kop + delen */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">{list.name}</h1>
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
        >
          <ShareIcon width={16} height={16} /> {t("lists.share")}
        </button>
      </div>
      {shareMsg && (
        <p className="mb-3 rounded-tile bg-terra-50 px-4 py-2 text-sm text-terra-700">
          {t("lists.shareCopied")}
        </p>
      )}

      {/* Locatie */}
      <div className="mb-4 rounded-tile border border-cream-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <MapPinIcon width={18} height={18} className="text-terra-500" />
          {list.lat ? (
            <span className="text-sm">{list.postcode}</span>
          ) : (
            <span className="text-sm text-ink-500">Stel je locatie in om te zien waar je alles koopt</span>
          )}
          <button
            onClick={useMyLocation}
            disabled={locBusy}
            className="rounded-full border border-terra-300 px-3 py-1 text-sm text-terra-700 hover:bg-terra-50 disabled:opacity-50"
          >
            {t("common.myLocation")}
          </button>
          <form onSubmit={submitLocation} className="flex gap-1">
            <input
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              placeholder={t("common.postcodeOrCity")}
              className="w-36 rounded-full border border-cream-300 bg-cream-50 px-3 py-1 text-sm"
            />
            <button type="submit" className="text-sm text-terra-700 underline">
              {t("common.search")}
            </button>
          </form>
          {list.lat && (
            <label className="ml-auto flex items-center gap-1 text-sm text-ink-500">
              {t("lists.radius")}
              <select
                defaultValue={list.radiusKm}
                onChange={(e) => act(() => setRadiusAction(list.token, Number(e.target.value)))}
                className="rounded-full border border-cream-300 bg-cream-50 px-2 py-1"
              >
                {[5, 10, 15, 25].map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {locError && (
          <p className="mt-2 text-sm text-terra-700">
            Locatie bepalen lukte niet — probeer een postcode.
          </p>
        )}
      </div>

      {/* Open items */}
      <h2 className="mb-2 text-sm font-semibold text-ink-500">
        {t("lists.itemsOpen", { count: open.length })}
      </h2>
      <ul className="flex flex-col gap-2">
        {open.map((item) => {
          const cat = item.catalogKey ? catalogItem(item.catalogKey) : undefined;
          const tint = cat ? tintForCategory(cat.category) : { tileBg: "bg-cream-100", icon: "text-ink-500" };
          const match = item.catalogKey ? matches[item.catalogKey] : undefined;
          return (
            <li key={item.id} className="rounded-tile border border-cream-200 bg-white">
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => act(() => toggleItemAction(list.token, item.id, true))}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-terra-400 text-transparent hover:bg-terra-50 hover:text-terra-400"
                  aria-label="Afvinken"
                >
                  <CheckIcon width={16} height={16} />
                </button>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint.tileBg}`}>
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
                  {!item.store && (
                    <button
                      onClick={() => setEditItem(item.id)}
                      className="mt-1 text-xs text-terra-700 underline"
                    >
                      Weet jij waar? Geef een locatietip
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setEditItem(editItem === item.id ? null : item.id)}
                  className="text-ink-300 hover:text-terra-600"
                  aria-label="Bewerken"
                >
                  <PencilIcon width={15} height={15} />
                </button>
                {cat?.nix18 && (
                  <span className="rounded-full bg-ink-900 px-2 py-0.5 text-xs text-white">18+</span>
                )}
                <button
                  onClick={() => act(() => removeItemAction(list.token, item.id))}
                  className="text-ink-300 hover:text-terra-600"
                  aria-label="Verwijderen"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
              {editItem === item.id && (
                <ItemEditor
                  item={item}
                  memberNames={memberNames}
                  onSave={(patch) => {
                    act(() => updateItemAction(list.token, item.id, patch));
                    setEditItem(null);
                  }}
                />
              )}
              {match && list.lat && (
                <details className="border-t border-cream-100 px-3 py-2">
                  <summary className="cursor-pointer text-sm text-terra-700">
                    {t("lists.whereToBuy")}{" "}
                    <span className="text-ink-500">
                      ({match.members.length + match.guide.length})
                    </span>
                  </summary>
                  <MatchList
                    match={match}
                    radiusKm={list.radiusKm}
                    onPick={(name, slug) =>
                      act(() => updateItemAction(list.token, item.id, { store: name, producerSlug: slug }))
                    }
                  />
                </details>
              )}
            </li>
          );
        })}
        {open.length === 0 && (
          <li className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
            Je lijst is leeg — voeg hieronder producten toe.
          </li>
        )}
      </ul>

      {/* Onlangs gekocht */}
      {bought.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 text-sm font-semibold text-ink-500">
            {t("lists.recentlyBought")}
          </h2>
          <ul className="flex flex-col gap-1">
            {bought.slice(0, 10).map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-tile px-3 py-2">
                <button
                  onClick={() => act(() => toggleItemAction(list.token, item.id, false))}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-terra-500 text-white"
                  aria-label="Terug op de lijst"
                >
                  <PlusIcon width={14} height={14} />
                </button>
                <span className="text-ink-300 line-through">{item.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Suggesties */}
      {(suggestions.length > 0 || rebuy.length > 0) && (
        <div className="mt-6">
          {suggestions.length > 0 && (
            <TileRow
              title={t("lists.seasonNow")}
              items={suggestions}
              onAdd={(i) => act(() => addItemAction(list.token, { catalogKey: i.key, label: i.label }))}
            />
          )}
          {rebuy.length > 0 && (
            <TileRow
              title="Vorige keer gekocht"
              items={rebuy}
              onAdd={(i) => act(() => addItemAction(list.token, { catalogKey: i.key, label: i.label }))}
            />
          )}
        </div>
      )}

      {/* Toevoegen: tegelwand zoals Bring — alles zichtbaar */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">{t("lists.addItems")}</h2>
      <div className="mb-4 flex items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2">
        <SearchIcon width={16} height={16} className="text-ink-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("lists.searchCatalog")}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {query ? (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {searchResults.map((item) => (
            <AddTile
              key={item.key}
              item={item}
              added={openKeys.has(item.key)}
              onAdd={() => {
                toggleTile(item);
                setQuery("");
              }}
            />
          ))}
          <button
            onClick={() => {
              act(() => addItemAction(list.token, { label: query }));
              setQuery("");
            }}
            className="flex flex-col items-center justify-center gap-1.5 rounded-tile border-2 border-dashed border-cream-300 p-3 text-center text-sm hover:border-terra-400"
          >
            <PlusIcon width={22} height={22} className="text-terra-500" />
            <span>{t("lists.freeTextAdd", { label: query })}</span>
          </button>
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const items = CATALOG.filter((i) => i.category === cat.key);
          if (!items.length) return null;
          return (
            <section key={cat.key} className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-ink-500">{cat.label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {items.map((item) => (
                  <AddTile
                    key={item.key}
                    item={item}
                    added={openKeys.has(item.key)}
                    onAdd={() => toggleTile(item)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function AddTile({
  item,
  onAdd,
  added,
}: {
  item: CatalogItem;
  onAdd: () => void;
  added?: boolean;
}) {
  const tint = tintForCategory(item.category);
  return (
    <button
      onClick={onAdd}
      aria-pressed={added}
      className={`relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-tile p-2 text-center transition-colors ${
        added
          ? "bg-terra-600 text-white"
          : `${tint.tileBg} hover:ring-2 hover:ring-terra-300`
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
    </button>
  );
}

function TileRow({
  title,
  items,
  onAdd,
}: {
  title: string;
  items: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-ink-500">{title}</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {items.map((item) => (
          <AddTile key={item.key} item={item} onAdd={() => onAdd(item)} />
        ))}
      </div>
    </div>
  );
}

function MatchList({
  match,
  radiusKm,
  onPick,
}: {
  match: ItemMatch;
  radiusKm: number;
  onPick?: (name: string, slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 pb-1 pt-2">
      {match.usedFallback && (
        <p className="text-xs text-ink-500">{t("lists.nearestFallback", { km: radiusKm })}</p>
      )}
      {match.members.length > 0 && (
        <ProducerRows title={t("lists.membersNearby")} producers={match.members} member onPick={onPick} />
      )}
      {match.guide.length > 0 && (
        <ProducerRows title={t("lists.guideNearby")} producers={match.guide} onPick={onPick} />
      )}
      {match.members.length + match.guide.length === 0 && (
        <p className="text-sm text-ink-500">{t("lists.noMatch")}</p>
      )}
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
  producers: ItemMatch["members"];
  member?: boolean;
  onPick?: (name: string, slug: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-300">{title}</p>
      <ul className="flex flex-col gap-1">
        {producers.slice(0, 5).map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-sm">
            <a href={`/producent/${p.slug}`} className="min-w-0 flex-1 truncate hover:underline">
              {p.name}
              {p.city ? <span className="text-ink-500"> · {p.city}</span> : null}
            </a>
            {member && (
              <span className="rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                {t("producers.memberBadge")}
              </span>
            )}
            {p.distanceKm !== undefined && (
              <span className="whitespace-nowrap text-ink-500">
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
              <RouteIcon width={13} height={13} /> {t("common.route")}
            </a>
            {onPick && (
              <button
                onClick={() => onPick(p.name, p.slug)}
                className="rounded-full border border-terra-300 px-2 py-0.5 text-xs text-terra-700 hover:bg-terra-50"
              >
                Hier halen
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemBadges({ item }: { item: ListItem }) {
  if (!item.store && !item.assignee && !item.dueAt) return null;
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
            <span className="text-ink-300">· tip van {item.storeSuggestedBy}</span>
          )}
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
}: {
  item: ListItem;
  memberNames?: string[];
  onSave: (patch: {
    qty?: string;
    note?: string;
    store?: string;
    producerSlug?: string | null;
    assignee?: string;
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

  const field =
    "w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-1.5 text-sm";

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
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Wie haalt het
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="naam" className={field} />
          {memberNames.length > 0 && (
            <span className="mt-1 flex flex-wrap gap-1">
              {memberNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setAssignee(name)}
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    assignee === name ? "bg-terra-500 text-white" : "bg-cream-100 hover:bg-cream-200"
                  }`}
                >
                  {name}
                </button>
              ))}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
          Uiterlijk
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={field} />
        </label>
      </div>
      <p className="text-xs text-ink-300">
        Tip: onder &ldquo;{t("lists.whereToBuy")}&rdquo; kun je met &ldquo;Hier halen&rdquo; direct een producent uit de buurt kiezen.
      </p>
      <div>
        <button
          onClick={() =>
            onSave({
              qty,
              note,
              store,
              // handmatig gewijzigde winkel verbreekt de producent-koppeling
              producerSlug: store === (item.store ?? "") ? undefined : null,
              assignee,
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
