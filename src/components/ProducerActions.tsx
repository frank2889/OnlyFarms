"use client";

import { createElement, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { addItemAction, createListAction } from "@/app/lijst/actions";
import { itemForToken } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { iconForItem } from "@/components/catalog-icons";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { activeList, listsSnapshot, pinnedSnapshot, rememberList, subscribeLists } from "@/lib/lists-local";

/**
 * Producten van een producent direct op je actieve lijst zetten,
 * met deze producent alvast als "waar halen" ingevuld.
 */
export default function ProducerActions({
  producerName,
  producerSlug,
  products,
}: {
  producerName: string;
  producerSlug: string;
  products: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);

  const rawLists = useSyncExternalStore(subscribeLists, listsSnapshot, () => "[]");
  const rawPinned = useSyncExternalStore(subscribeLists, pinnedSnapshot, () => "");

  const items = products
    .map((token) => ({ token, item: itemForToken(token) }))
    .filter((x) => x.item);

  if (!items.length) return null;

  function addFrom(token: string) {
    const item = itemForToken(token);
    if (!item) return;
    navigator.vibrate?.(10);
    startTransition(async () => {
      let target = activeList(rawLists, rawPinned);
      if (!target) {
        const created = await createListAction("Boodschappen");
        target = created;
        rememberList(created);
      }
      await addItemAction(target.token, {
        catalogKey: item.key,
        label: item.label,
        store: producerName,
        producerSlug,
      });
      setAddedKeys((prev) => new Set(prev).add(item.key));
      try {
        const badge = Number(localStorage.getItem("of_badge") ?? "0") || 0;
        localStorage.setItem("of_badge", String(badge + 1));
      } catch {}
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    });
  }

  const active = activeList(rawLists, rawPinned);

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-semibold text-ink-500">{t("producers.setOnListTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(({ token, item }) => {
          const added = addedKeys.has(item!.key);
          return (
            <button
              key={token}
              onClick={() => addFrom(token)}
              disabled={pending}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                added
                  ? "bg-terra-600 text-white"
                  : "border border-terra-300 text-terra-700 hover:bg-terra-50"
              }`}
            >
              {createElement(iconForItem(item!), { width: 16, height: 16 })}
              {t("producers.getHere", { product: item!.label })}
              {added ? <CheckIcon width={14} height={14} /> : <PlusIcon width={14} height={14} />}
            </button>
          );
        })}
      </div>

      {toast && (
        <p className="animate-rise mt-2 text-sm font-medium text-terra-700">
          {t("producers.addedToList")}
          {active && (
            <>
              {" "}
              <Link href={`/lijst/${active.token}#lijst`} className="underline">
                {t("producers.viewList")}
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
