import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller } from "@/lib/queries/admin";
import { demandNearProducer } from "@/lib/queries/demand";
import { offersForSeller, producerEngagement } from "@/lib/queries/portal";
import { t } from "@/lib/i18n";
import { CheckIcon, PlusIcon, StoreIcon } from "@/components/icons";
import { ConfirmListingButton } from "@/components/PortalExtras";
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
  const demand = producer ? await demandNearProducer(producer) : [];
  const reach = producer ? await producerEngagement(producer.slug) : null;

  // Profiel-volledigheid: elk ontbrekend punt is een directe link (CRO #44)
  const checklist = producer
    ? [
        { done: producer.photos.length > 0, label: t("portal.checkPhoto"), href: "/portaal/fotos" },
        { done: !!producer.description, label: t("portal.checkDescription"), href: "/portaal/vermelding" },
        { done: !!producer.openingHours, label: t("portal.checkHours"), href: "/portaal/vermelding" },
        { done: !!producer.phone, label: t("portal.checkPhone"), href: "/portaal/vermelding" },
        { done: !!producer.website, label: t("portal.checkWebsite"), href: "/portaal/vermelding" },
        { done: producer.products.length > 0, label: t("portal.checkProducts"), href: "/portaal/vermelding" },
        { done: offers.length > 0, label: t("portal.checkOffers"), href: "/portaal/producten" },
      ]
    : [];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const pendingOffers = offers.filter((o) => !o.published).length;

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
                    <span className="block text-xs text-ink-500">
                      {t("portal.tabPhotos")}
                      {producer.photosPending.length > 0 &&
                        ` (${t("portal.pendingCount", { n: producer.photosPending.length })})`}
                    </span>
                  </Link>
                  <Link
                    href="/portaal/producten"
                    className="rounded-xl border border-cream-200 p-3 text-center hover:border-terra-400"
                  >
                    <span className="block text-xl font-bold">{offers.length}</span>
                    <span className="block text-xs text-ink-500">
                      {t("portal.tabProducts")}
                      {pendingOffers > 0 && ` (${t("portal.pendingCount", { n: pendingOffers })})`}
                    </span>
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

      {/* Profiel-volledigheid + laatst bevestigd */}
      {seller.status === "goedgekeurd" && producer && (
        <section className="mt-4 rounded-tile border border-cream-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              {t("portal.checklistTitle")}
            </h2>
            <span className="rounded-full bg-terra-100 px-2.5 py-0.5 text-xs font-bold text-terra-700">
              {t("portal.checklistPct", { pct })}
            </span>
          </div>
          {pct === 100 ? (
            <p className="text-sm text-terra-700">{t("portal.checklistComplete")}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {checklist
                .filter((c) => !c.done)
                .map((c) => (
                  <li key={c.label}>
                    <Link
                      href={c.href}
                      className="flex items-center gap-2 text-sm text-terra-700 underline"
                    >
                      <PlusIcon width={14} height={14} className="shrink-0" /> {c.label}
                    </Link>
                  </li>
                ))}
              {checklist
                .filter((c) => c.done)
                .map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm text-ink-500">
                    <CheckIcon width={14} height={14} className="shrink-0 text-terra-500" /> {c.label}
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-cream-100 pt-3">
            <span className="text-sm text-ink-500">
              {producer.lastVerifiedAt
                ? t("portal.verifiedOn", { date: dateFmt.format(producer.lastVerifiedAt) })
                : t("portal.verifiedNever")}
            </span>
            <ConfirmListingButton />
          </div>
        </section>
      )}

      {/* Jouw bereik: geaggregeerd en anoniem */}
      {seller.status === "goedgekeurd" && producer && reach && (
        <section className="mt-4 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t("portal.reachTitle")}
          </h2>
          <p className="mb-3 text-sm text-ink-500">{t("portal.reachHint")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-cream-50 p-3 text-center">
              <span className="block text-2xl font-bold">{reach.picksTotal}</span>
              <span className="block text-xs text-ink-500">{t("portal.reachPicks")}</span>
              {reach.picks30d > 0 && (
                <span className="block text-xs text-terra-700">
                  {t("portal.reachPicks30", { n: reach.picks30d })}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-cream-50 p-3 text-center">
              <span className="block text-2xl font-bold">{reach.mentions}</span>
              <span className="block text-xs text-ink-500">{t("portal.reachMentions")}</span>
            </div>
          </div>
        </section>
      )}

      {/* Vraag in de buurt: geaggregeerd en geanonimiseerd (drempel 3 lijsten) */}
      {seller.status === "goedgekeurd" &&
        producer &&
        producer.lat != null &&
        producer.products.length > 0 && (
          <section className="mt-4 rounded-tile border border-cream-200 bg-white p-4">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
              {t("portal.demandTitle")}
            </h2>
            <p className="mb-3 text-sm text-ink-500">{t("portal.demandIntro")}</p>
            {demand.length === 0 ? (
              <p className="text-sm text-ink-700">{t("portal.demandEmpty")}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {demand.map((d) => (
                  <li key={d.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{d.label}</span>
                    <span className="text-ink-500">{t("portal.demandLine", { n: d.lists })}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
    </main>
  );
}
