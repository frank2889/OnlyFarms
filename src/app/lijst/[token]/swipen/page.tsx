import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { BASICS, catalogItem, itemsInSeason } from "@/lib/catalog";
import { boughtStatsFor, getListByToken, getListItems } from "@/lib/queries/lists";
import { swipeSignalsFor } from "@/lib/queries/swipe";
import { SproutIcon } from "@/components/icons";
import SwipeModeSwitcher from "@/components/SwipeModeSwitcher";
import type { SwipeCard } from "@/components/SwipeDeck";

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

  const [items, stats, signals] = await Promise.all([
    getListItems(list.id),
    boughtStatsFor({ id: list.id, householdId: list.householdId ?? null }),
    swipeSignalsFor({ id: list.id, householdId: list.householdId ?? null }),
  ]);
  const openKeys = new Set(items.open.map((i) => i.catalogKey).filter(Boolean));

  // Kandidatenpool: eigen historie, seizoen, basisset; wat al open op de lijst
  // staat wordt niet nog eens voorgesteld. Beide modi husselen deze pool door
  // elkaar (geen vaste categorie-volgorde) — dat maakt aanvullen impulsiever.
  const cards: SwipeCard[] = [];
  const seen = new Set<string>();
  const push = (key: string, times?: number) => {
    if (seen.has(key) || openKeys.has(key)) return;
    const item = catalogItem(key);
    if (!item) return;
    seen.add(key);
    cards.push({ key, label: item.label, category: item.category, times });
  };
  for (const s of stats) push(s.key, s.times);
  for (const item of itemsInSeason(new Date().getMonth() + 1)) push(item.key);
  for (const key of BASICS) push(key);

  const signalScore = new Map(signals.map((s) => [s.key, s.score]));
  const shopCards = weightedShuffle(cards, () => 1).slice(0, 30);
  const tasteCards = weightedShuffle(cards, (c) => (signalScore.get(c.key) ?? 0) + 3).slice(0, 30);

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
