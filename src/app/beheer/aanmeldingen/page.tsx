import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { listSellers, type SellerStatus } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import { SELLER_STATUS_LABELS, sellerStatusBadgeClass } from "./labels";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

const STATUSES: SellerStatus[] = [
  "aangemeld",
  "in_beoordeling",
  "goedgekeurd",
  "afgewezen",
  "geschorst",
];

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const params = await searchParams;
  const status = STATUSES.find((s) => s === params.status);
  const rows = await listSellers(status);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.navSellers")}</h1>

      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {[
          { key: undefined, label: t("admin.filterAll") },
          ...STATUSES.map((s) => ({ key: s, label: SELLER_STATUS_LABELS[s] })),
        ].map((chip) => (
          <Link
            key={chip.key ?? "alle"}
            href={chip.key ? `/beheer/aanmeldingen?status=${chip.key}` : "/beheer/aanmeldingen"}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
              chip.key === status
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
          {t("admin.sellersEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/beheer/aanmeldingen/${s.id}`}
                className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.name}</span>
                  <span className="block truncate text-sm text-ink-500">
                    {s.city} · KVK {s.kvkNumber} ·{" "}
                    {t("admin.appliedOn", { date: dateFmt.format(s.createdAt) })}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm ${sellerStatusBadgeClass(s.status)}`}
                >
                  {SELLER_STATUS_LABELS[s.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
