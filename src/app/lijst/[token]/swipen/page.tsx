import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { currentUserId } from "@/auth";
import { BASICS, CATALOG, catalogItem, itemsInSeason } from "@/lib/catalog";
import { boughtStatsFor, getListByToken, getListItems } from "@/lib/queries/lists";
import { swipeSignalsFor } from "@/lib/queries/swipe";
import { SproutIcon } from "@/components/icons";
import SwipeModeSwitcher from "@/components/SwipeModeSwitcher";
import type { SwipeCard } from "@/components/SwipeDeck";

export const metadata = {
  robots: { index: false, follow: false },
};

// Random-gewogen shuffle (Efraimidis-Spirakis): hogere weight komt vaker
// vooraan, maar het blijft door elkaar (geen vaste categorie-volgorde).
function weightedShuffle(cards: SwipeCard[], weight: (card: SwipeCard) => number): SwipeCard[] {
  return cards
    .map((card) => ({ card, key: Math.random() ** (1 / Math.max(weight(card), 0.05)) }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.card);
}

export const dynamic = "force-dynamic";

export default async function SwipePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const list = await getListByToken(token);
  if (!list) notFound();

  const userId = await currentUserId();
  const [items, stats, signals] = await Promise.all([
    getListItems(list.id),
    boughtStatsFor({ id: list.id, householdId: list.householdId ?? null }),
    swipeSignalsFor({ listId: list.id, userId }),
  ]);
  const openKeys = new Set(items.open.map((i) => i.catalogKey).filter(Boolean));

  // Winkelmodus: eigen historie, seizoen, basisset, willekeurig door elkaar
  // (geen vaste categorie-volgorde); wat al open staat wordt niet voorgesteld.
  const shopPool: SwipeCard[] = [];
  const seen = new Set<string>();
  const push = (key: string, times?: number) => {
    if (seen.has(key) || openKeys.has(key)) return;
    const item = catalogItem(key);
    if (!item) return;
    seen.add(key);
    shopPool.push({ key, label: item.label, category: item.category, times });
  };
  for (const s of stats) push(s.key, s.times);
  for (const item of itemsInSeason(new Date().getMonth() + 1)) push(item.key);
  for (const key of BASICS) push(key);
  const shopCards = weightedShuffle(shopPool, () => 1).slice(0, 30);

  // Smaakmodus (bèta): de HELE catalogus als pool (incl. supermarkt-items,
  // die horen er bewust bij), gewogen op het persoonlijke swipe-profiel plus
  // een zetje voor eerder gekocht en seizoen. Wat je vaak wegswipet zakt weg
  // maar verdwijnt nooit helemaal: smaak kan veranderen.
  const signalScore = new Map(signals.map((s) => [s.key, s.score]));
  const boughtTimes = new Map(stats.map((s) => [s.key, s.times]));
  const seasonKeys = new Set(itemsInSeason(new Date().getMonth() + 1).map((i) => i.key));
  const tastePool: SwipeCard[] = CATALOG.filter((i) => !openKeys.has(i.key)).map((i) => ({
    key: i.key,
    label: i.label,
    category: i.category,
    times: boughtTimes.get(i.key),
  }));
  const tasteCards = weightedShuffle(
    tastePool,
    (c) =>
      3 +
      (signalScore.get(c.key) ?? 0) +
      (boughtTimes.has(c.key) ? 2 : 0) +
      (seasonKeys.has(c.key) ? 1 : 0)
  ).slice(0, 30);

  return (
    <main className="mx-auto max-w-md px-4 pb-24">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href={`/lijst/${token}#lijst`} className="text-sm text-terra-700 underline">
          {t("swipe.backToList")}
        </Link>
      </header>

      <h1 className="text-2xl font-bold">{t("swipe.title")}</h1>
      <p className="mb-4 mt-1 text-sm text-ink-500">{t("swipe.hint")}</p>

      <SwipeModeSwitcher token={token} shopCards={shopCards} tasteCards={tasteCards} />
    </main>
  );
}
