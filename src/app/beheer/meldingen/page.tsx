import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { listReports } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import { reopenReportAction, resolveReportAction } from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const params = await searchParams;
  const showResolved = params.status === "afgehandeld";
  const rows = await listReports(showResolved);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.navReports")}</h1>

      <div className="mb-4 flex gap-1.5">
        {[
          { label: t("admin.filterOpen"), href: "/beheer/meldingen", active: !showResolved },
          {
            label: t("admin.filterResolved"),
            href: "/beheer/meldingen?status=afgehandeld",
            active: showResolved,
          },
        ].map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              chip.active
                ? "border-terra-500 bg-terra-500 text-white"
                : "border-cream-300 bg-white hover:border-terra-400"
            }`}
          >
            {chip.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.reportsEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-tile border border-cream-200 bg-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/producent/${r.producerSlug}`}
                  className="min-w-0 truncate font-medium hover:underline"
                >
                  {r.producerName}
                </Link>
                <span className="shrink-0 text-xs text-ink-500">
                  {t("admin.reportedOn", { date: dateFmt.format(r.createdAt) })}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{r.message}</p>
              <p className="mt-1 text-xs text-ink-500">
                {r.reporterEmail
                  ? t("admin.reportBy", { email: r.reporterEmail })
                  : t("admin.reportAnonymous")}
              </p>

              {r.resolved ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-ink-700">
                    {t("admin.resolvedOn", {
                      date: r.resolvedAt ? dateFmt.format(r.resolvedAt) : "",
                    })}
                    {r.adminNote ? `: ${r.adminNote}` : ""}
                  </span>
                  <form action={reopenReportAction.bind(null, r.id)}>
                    <button type="submit" className="text-sm text-ink-500 underline">
                      {t("admin.reopen")}
                    </button>
                  </form>
                </div>
              ) : (
                <form
                  action={resolveReportAction.bind(null, r.id)}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input
                    name="note"
                    placeholder={t("admin.resolveNotePlaceholder")}
                    className="min-w-0 flex-1 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
                  >
                    {t("admin.resolve")}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
