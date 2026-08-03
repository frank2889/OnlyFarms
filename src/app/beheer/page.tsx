import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { adminStats, queueCounts } from "@/lib/queries/stats";
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
  const [stats, queues] = await Promise.all([adminStats(), queueCounts()]);

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
      </div>

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
