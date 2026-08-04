import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { adminStats, eventCounts, queueCounts } from "@/lib/queries/stats";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function StatTile({ value, label, href }: { value: number; label: string; href?: string }) {
  const inner = (
    <>
      <span className="block text-2xl font-bold">{value.toLocaleString("nl-NL")}</span>
      <span className="block text-sm text-ink-500">{label}</span>
    </>
  );
  const base = "rounded-tile border border-cream-200 bg-white p-4";
  return href ? (
    <Link href={href} className={`${base} block hover:border-terra-400`}>
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  );
}

export default async function AdminDashboardPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const [stats, queues, conversions] = await Promise.all([
    adminStats(),
    queueCounts(),
    eventCounts(),
  ]);
  const EVENT_LABELS: Record<string, string> = {
    lijst_gestart: t("admin.eventListStarted"),
    product_toegevoegd: t("admin.eventItemAdded"),
    locatie_ingesteld: t("admin.eventLocationSet"),
    match_bekeken: t("admin.eventMatchViewed"),
    route_geopend: t("admin.eventRouteOpened"),
    lijst_gedeeld: t("admin.eventListShared"),
    producent_aangemeld: t("admin.eventSellerApplied"),
    producent_bekeken: t("admin.eventProducerViewed"),
    lijst_herhaald: t("admin.eventListRepeated"),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.navDashboard")}</h1>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("admin.statsQueuesTitle")}
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile value={queues.openReports} label={t("admin.statOpenReports")} href="/beheer/meldingen" />
        <StatTile value={queues.pendingSellers} label={t("admin.statPendingSellers")} href="/beheer/aanmeldingen" />
        <StatTile value={queues.pendingReviews} label={t("admin.statPendingReviews")} href="/beheer/ervaringen" />
        <StatTile value={queues.pendingOffers} label={t("admin.statPendingOffers")} href="/beheer/aanbod" />
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("admin.statsConversionsTitle")}
      </h2>
      {conversions.length === 0 ? (
        <p className="mb-6 rounded-tile border border-dashed border-cream-300 p-4 text-sm text-ink-500">
          {t("admin.conversionsEmpty")}
        </p>
      ) : (
        <div className="mb-6 overflow-hidden rounded-tile border border-cream-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-2 font-semibold">{t("admin.conversionMoment")}</th>
                <th className="px-4 py-2 text-right font-semibold">7 {t("admin.days")}</th>
                <th className="px-4 py-2 text-right font-semibold">30 {t("admin.days")}</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((c) => (
                <tr key={c.name} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-2">{EVENT_LABELS[c.name] ?? c.name}</td>
                  <td className="px-4 py-2 text-right font-medium">{c.last7}</td>
                  <td className="px-4 py-2 text-right text-ink-500">{c.last30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("admin.statsProducersTitle")}
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={stats.producers.totaal} label={t("admin.statTotal")} href="/beheer/producenten" />
        <StatTile value={stats.producers.leden} label={t("admin.statMembers")} href="/beheer/producenten?filter=leden" />
        <StatTile value={stats.producers.metProducten} label={t("admin.statWithProducts")} />
        <StatTile value={stats.producers.metCoords} label={t("admin.statWithCoords")} />
        <StatTile value={stats.producers.actief} label={t("admin.statActive")} href="/beheer/producenten?status=actief" />
        <StatTile value={stats.producers.seizoen} label={t("admin.statSeasonal")} href="/beheer/producenten?status=seizoen" />
        <StatTile value={stats.producers.onbevestigd} label={t("admin.statUnconfirmed")} href="/beheer/producenten?status=onbevestigd" />
        <StatTile value={stats.producers.gestopt} label={t("admin.statStopped")} href="/beheer/producenten?status=gestopt" />
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("admin.statsCommunityTitle")}
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={stats.community.users} label={t("admin.statUsers")} />
        <StatTile value={stats.community.households} label={t("admin.statHouseholds")} />
        <StatTile value={stats.community.lists} label={t("admin.statLists")} />
        <StatTile value={stats.community.items} label={t("admin.statItems")} />
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("admin.statsGrowthTitle")}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GrowthRow label={t("admin.growthUsers")} week={stats.growth.users7} month={stats.growth.users30} />
        <GrowthRow label={t("admin.growthLists")} week={stats.growth.lists7} month={stats.growth.lists30} />
        <GrowthRow label={t("admin.growthSellers")} week={stats.growth.sellers7} month={stats.growth.sellers30} />
        <GrowthRow label={t("admin.growthReports")} week={stats.growth.reports7} month={stats.growth.reports30} />
      </ul>
    </main>
  );
}

function GrowthRow({ label, week, month }: { label: string; week: number; month: number }) {
  return (
    <li className="rounded-tile border border-cream-200 bg-white p-4">
      <span className="block font-medium">{label}</span>
      <span className="block text-sm text-ink-500">
        {t("admin.growthWindow", { week, month })}
      </span>
    </li>
  );
}
