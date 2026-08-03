import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { adminListProducers, type ProducerFilter } from "@/lib/queries/admin";
import { allProvinces } from "@/lib/queries/producers";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });
const PAGE_SIZE = 50;

type Search = {
  q?: string;
  status?: string;
  filter?: string;
  provincie?: string;
  offset?: string;
};

const STATUS_VALUES = ["actief", "seizoen", "gestopt", "onbevestigd"] as const;

function buildQuery(params: Search, overrides: Partial<Search>): string {
  const merged: Record<string, string | undefined> = { ...params, offset: undefined, ...overrides };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) query.set(key, value);
  }
  const s = query.toString();
  return s ? `?${s}` : "";
}

export default async function AdminProducersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const params = await searchParams;

  const status = STATUS_VALUES.find((s) => s === params.status);
  const filter: ProducerFilter = {
    q: params.q,
    status,
    province: params.provincie || undefined,
    member:
      params.filter === "leden" ? true : params.filter === "gids" ? false : undefined,
    withoutProducts: params.filter === "zonder-producten" || undefined,
    offset: Number(params.offset) || 0,
    limit: PAGE_SIZE,
  };
  const [{ rows, total }, provinces] = await Promise.all([
    adminListProducers(filter),
    allProvinces(),
  ]);
  const offset = filter.offset ?? 0;

  const memberChips = [
    { key: undefined, label: t("admin.filterAll") },
    { key: "leden", label: t("admin.filterMembers") },
    { key: "gids", label: t("admin.filterGuide") },
    { key: "zonder-producten", label: t("admin.filterNoProducts") },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <div className="flex items-baseline justify-between gap-3 py-4">
        <h1 className="text-2xl font-bold">{t("admin.navProducers")}</h1>
        <Link href="/beheer/producenten/duplicaten" className="text-sm text-terra-700 underline">
          {t("admin.duplicates")}
        </Link>
      </div>

      <form method="get" className="mb-3 flex gap-2">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder={t("admin.producersSearchPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm"
        />
        <select
          name="provincie"
          defaultValue={params.provincie ?? ""}
          className="max-w-40 rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">{t("admin.formProvince")}</option>
          {provinces.map((p) => (
            <option key={p.province} value={p.province}>
              {p.province}
            </option>
          ))}
        </select>
        {params.status && <input type="hidden" name="status" value={params.status} />}
        {params.filter && <input type="hidden" name="filter" value={params.filter} />}
        <button
          type="submit"
          className="shrink-0 rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
        >
          {t("common.search")}
        </button>
      </form>

      <div className="-mx-4 mb-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {memberChips.map((chip) => (
          <Link
            key={chip.key ?? "alle"}
            href={`/beheer/producenten${buildQuery(params, { filter: chip.key })}`}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
              (params.filter || undefined) === chip.key
                ? "border-terra-500 bg-terra-500 text-white"
                : "border-cream-300 bg-white hover:border-terra-400"
            }`}
          >
            {chip.label}
          </Link>
        ))}
      </div>
      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        <Link
          href={`/beheer/producenten${buildQuery(params, { status: undefined })}`}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
            !status
              ? "border-ink-500 bg-ink-700 text-white"
              : "border-cream-300 bg-white hover:border-terra-400"
          }`}
        >
          {t("admin.filterAll")}
        </Link>
        {STATUS_VALUES.map((s) => (
          <Link
            key={s}
            href={`/beheer/producenten${buildQuery(params, { status: s })}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
              status === s
                ? "border-ink-500 bg-ink-700 text-white"
                : "border-cream-300 bg-white hover:border-terra-400"
            }`}
          >
            {t(`admin.producerStatus.${s}`)}
          </Link>
        ))}
      </div>

      <p className="mb-2 text-sm text-ink-500">{t("admin.producersFound", { n: total })}</p>

      {rows.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.producersEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/beheer/producenten/${p.id}`}
                className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-sm text-ink-500">
                    {[p.city, p.province, p.products.slice(0, 4).join(", ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {p.lastVerifiedAt && (
                    <span className="block text-xs text-ink-300">
                      {t("producers.lastVerified", { date: dateFmt.format(p.lastVerifiedAt) })}
                    </span>
                  )}
                </div>
                {p.isMember && (
                  <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                    {t("producers.memberBadge")}
                  </span>
                )}
                <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-xs text-ink-700">
                  {t(`admin.producerStatus.${p.status}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {offset + PAGE_SIZE < total && (
        <p className="mt-4 text-center">
          <Link
            href={`/beheer/producenten${buildQuery(params, { offset: String(offset + PAGE_SIZE) })}`}
            className="inline-block rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:border-terra-400"
          >
            {t("admin.showMore")}
          </Link>
        </p>
      )}
    </main>
  );
}
