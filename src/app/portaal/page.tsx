import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerForSeller } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import { SELLER_STATUS_LABELS, sellerStatusBadgeClass } from "@/app/beheer/aanmeldingen/labels";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function PortaalPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  const { seller } = ctx;
  const producer = seller.status === "goedgekeurd" ? await producerForSeller(seller.id) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("portal.welcome", { name: seller.contactName })}</h1>

      <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t("portal.statusLabel")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm ${sellerStatusBadgeClass(seller.status)}`}>
            {SELLER_STATUS_LABELS[seller.status]}
          </span>
          {seller.reviewedAt && (
            <span className="text-sm text-ink-500">
              {t("admin.reviewedOn", { date: dateFmt.format(seller.reviewedAt) })}
            </span>
          )}
        </div>
        {seller.status === "aangemeld" || seller.status === "in_beoordeling" ? (
          <p className="mt-2 text-sm text-ink-700">{t("portal.notApproved")}</p>
        ) : null}
        {seller.status === "afgewezen" && (
          <p className="mt-2 text-sm text-ink-700">{t("portal.rejected")}</p>
        )}
        {seller.status === "geschorst" && (
          <p className="mt-2 text-sm text-ink-700">{t("portal.suspended")}</p>
        )}
        {seller.statusReason && seller.status !== "goedgekeurd" && (
          <p className="mt-1 text-sm text-ink-500">
            {t("portal.statusReasonLabel")}: {seller.statusReason}
          </p>
        )}
      </section>

      {seller.status === "goedgekeurd" && (
        <section className="rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t("portal.myListing")}
          </h2>
          {producer ? (
            <>
              <p className="mb-1 font-medium">{producer.name}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/portaal/vermelding" className="text-terra-700 underline">
                  {t("portal.editListing")}
                </Link>
                <Link href={`/producent/${producer.slug}`} className="text-ink-500 underline">
                  {t("admin.openOnSite")}
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-700">{t("portal.noListing")}</p>
          )}
        </section>
      )}
    </main>
  );
}
