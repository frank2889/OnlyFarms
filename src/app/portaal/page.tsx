import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller } from "@/lib/queries/admin";
import { offersForSeller } from "@/lib/queries/portal";
import { t } from "@/lib/i18n";
import { StoreIcon } from "@/components/icons";
import { SELLER_STATUS_LABELS, sellerStatusBadgeClass } from "@/app/beheer/aanmeldingen/labels";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function PortaalPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  const { seller } = ctx;
  const linked = seller.status === "goedgekeurd" ? await producerForSeller(seller.id) : null;
  const [producer, offers] = await Promise.all([
    linked ? producerByIdAdmin(linked.id) : Promise.resolve(null),
    seller.status === "goedgekeurd" ? offersForSeller(seller.id) : Promise.resolve([]),
  ]);

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
        <section className="overflow-hidden rounded-tile border border-cream-200 bg-white">
          {producer ? (
            <>
              {producer.photos[0] ? (
                <Image
                  src={producer.photos[0]}
                  alt={producer.name}
                  width={800}
                  height={400}
                  className="aspect-2/1 w-full object-cover"
                />
              ) : (
                <div className="flex aspect-3/1 w-full items-center justify-center bg-cream-100 text-ink-300">
                  <StoreIcon width={40} height={40} />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold">{producer.name}</h2>
                {producer.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-700">{producer.description}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Link
                    href="/portaal/fotos"
                    className="rounded-xl border border-cream-200 p-3 text-center hover:border-terra-400"
                  >
                    <span className="block text-xl font-bold">{producer.photos.length}</span>
                    <span className="block text-xs text-ink-500">{t("portal.tabPhotos")}</span>
                  </Link>
                  <Link
                    href="/portaal/producten"
                    className="rounded-xl border border-cream-200 p-3 text-center hover:border-terra-400"
                  >
                    <span className="block text-xl font-bold">{offers.length}</span>
                    <span className="block text-xs text-ink-500">{t("portal.tabProducts")}</span>
                  </Link>
                  <Link
                    href="/portaal/vermelding"
                    className="col-span-1 flex items-center justify-center rounded-xl border border-cream-200 p-3 text-center text-sm font-medium hover:border-terra-400"
                  >
                    {t("portal.tabDetails")}
                  </Link>
                  <Link
                    href={`/producent/${producer.slug}`}
                    className="col-span-1 flex items-center justify-center rounded-xl bg-terra-500 p-3 text-center text-sm font-medium text-white hover:bg-terra-600"
                  >
                    {t("portal.viewPublic")}
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <p className="p-4 text-sm text-ink-700">{t("portal.noListing")}</p>
          )}
        </section>
      )}
    </main>
  );
}
