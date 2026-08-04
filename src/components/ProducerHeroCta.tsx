"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addItemAction, createListAction } from "@/app/lijst/actions";
import { itemForToken } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { ListIcon } from "@/components/icons";
import { activeList, listsSnapshot, pinnedSnapshot, rememberList, subscribeLists } from "@/lib/lists-local";

/**
 * De conversie-ingang voor de koude Google-bezoeker op een producentpagina:
 * één grote knop die alles wat deze producent verkoopt op je lijst zet (lijst
 * wordt zo nodig ter plekke aangemaakt, producent staat als "hier halen" bij
 * elk item) en je de app in brengt. Zodra de native app in de stores staat,
 * is dit blok de plek voor de store-badges.
 */
export default function ProducerHeroCta({
  producerName,
  producerSlug,
  products,
}: {
  producerName: string;
  producerSlug: string;
  products: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const rawLists = useSyncExternalStore(subscribeLists, listsSnapshot, () => "[]");
  const rawPinned = useSyncExternalStore(subscribeLists, pinnedSnapshot, () => "");

  const items = [...new Set(products)]
    .map((token) => itemForToken(token))
    .filter((i): i is NonNullable<typeof i> => !!i);
  if (!items.length) return null;

  const hasList = !!activeList(rawLists, rawPinned);

  function addAll() {
    startTransition(async () => {
      let target = activeList(rawLists, rawPinned);
      if (!target) {
        const created = await createListAction("Boodschappen");
        target = created;
        rememberList(created);
      }
      for (const item of items) {
        await addItemAction(target.token, {
          catalogKey: item.key,
          label: item.label,
          store: producerName,
          producerSlug,
        });
      }
      try {
        const badge = Number(localStorage.getItem("of_badge") ?? "0") || 0;
        localStorage.setItem("of_badge", String(badge + items.length));
      } catch {}
      setDone(true);
      router.push(`/lijst/${target.token}#lijst`);
    });
  }

  return (
    <div className="mb-6 rounded-tile bg-terra-500 p-5 text-white">
      <p className="text-lg font-bold">{t("producers.heroTitle", { name: producerName })}</p>
      <p className="mt-1 text-sm text-terra-100">{t("producers.heroText")}</p>
      <button
        onClick={addAll}
        disabled={pending || done}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-terra-700 hover:bg-cream-50 disabled:opacity-70"
      >
        <ListIcon width={18} height={18} />
        {done
          ? t("producers.heroDone")
          : hasList
            ? t("producers.heroCtaExisting", { n: items.length })
            : t("producers.heroCtaNew", { n: items.length })}
      </button>
    </div>
  );
}
