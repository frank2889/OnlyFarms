import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUserId } from "@/auth";
import { membersOfHousehold, userById } from "@/lib/queries/accounts";
import { catalogItem, itemsInSeason } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { boughtBefore, getListByToken, getListItems } from "@/lib/queries/lists";
import { messagesForList } from "@/lib/queries/chat";
import { nearbyCountsByToken, nearbyProducers } from "@/lib/queries/producers";
import { openFirst } from "@/lib/opening-hours";
import type { ItemMatch } from "@/lib/types";
import ListView from "@/components/ListView";
import ClaimListButton from "@/components/ClaimListButton";
import { SproutIcon } from "@/components/icons";

// Altijd vers: gedeelde lijsten veranderen constant
export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const list = await getListByToken(token);
  if (!list) notFound();

  const { open, bought } = await getListItems(list.id);
  const boughtBeforeKeys = await boughtBefore(list.id);

  // Matching per open item met een catalog-key, alleen als de lijst een locatie heeft
  const matches: Record<string, ItemMatch> = {};
  if (list.lat != null && list.lng != null) {
    const keys = [...new Set(open.map((i) => i.catalogKey).filter((k): k is string => !!k))];
    await Promise.all(
      keys.map(async (key) => {
        const item = catalogItem(key);
        if (!item || item.matchTokens.length === 0) return;
        // Laag 1: producenten met dit specifieke product; laag 2: alleen de categorie (suggestie)
        const categoryTokens = item.matchTokens.filter((token) => token !== item.key);
        const [exactResult, categoryResult] = await Promise.all([
          nearbyProducers({
            lat: list.lat!,
            lng: list.lng!,
            radiusKm: list.radiusKm,
            tokens: [item.key],
            limit: 6,
          }),
          categoryTokens.length
            ? nearbyProducers({
                lat: list.lat!,
                lng: list.lng!,
                radiusKm: list.radiusKm,
                tokens: categoryTokens,
                limit: 8,
              })
            : Promise.resolve({ producers: [], usedFallback: false }),
        ]);
        const exactIds = new Set(exactResult.producers.map((p) => p.id));
        // "Nu open" eerst (CRO: open locaties krijgen voorrang), daarbinnen op afstand
        const exact = exactResult.usedFallback ? [] : openFirst(exactResult.producers);
        matches[key] = {
          catalogKey: key,
          exact,
          category: categoryResult.usedFallback
            ? []
            : openFirst(categoryResult.producers.filter((p) => !exactIds.has(p.id)).slice(0, 5)),
          usedFallback:
            exact.length === 0 && (categoryResult.usedFallback || categoryResult.producers.length === 0),
        };
      })
    );
  }

  const seasonal = itemsInSeason(new Date().getMonth() + 1);

  // "N in de buurt"-badges op de catalogustegels
  const nearbyCounts =
    list.lat != null && list.lng != null
      ? await nearbyCountsByToken(list.lat, list.lng, list.radiusKm)
      : {};

  // "Wie haalt het" = gevalideerde leden van het gezin waar deze lijst bij hoort
  const userId = await currentUserId();
  const viewer = userId ? await userById(userId) : null;
  const chatMessages = await messagesForList(list.id);
  const members = list.householdId ? await membersOfHousehold(list.householdId) : [];
  const memberNames = members.map((m) => m.name);
  const viewerIsMember = userId != null && members.some((m) => m.id === userId);

  return (
    <main>
      <header className="flex items-center justify-between border-b border-cream-200 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href="/lijsten" className="text-sm text-terra-700 underline">
          {t("lists.title")}
        </Link>
      </header>
      {userId && !list.ownerUserId && (
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <ClaimListButton token={list.token} />
        </div>
      )}
      <ListView
        list={list}
        open={open}
        bought={bought}
        matches={matches}
        seasonal={seasonal}
        boughtBeforeKeys={boughtBeforeKeys}
        memberNames={memberNames}
        hasHousehold={!!list.householdId}
        viewerIsMember={viewerIsMember}
        nearbyCounts={nearbyCounts}
        chatMessages={chatMessages}
        viewerUserId={userId ?? null}
        accountRadiusM={viewer ? (viewer.nearbyRadiusM ?? null) : undefined}
      />
    </main>
  );
}
