import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { currentUserId } from "@/auth";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { nearbyProducers, producerBySlug } from "@/lib/queries/producers";
import { publicOffersForSeller } from "@/lib/queries/portal";
import { publishedExperiencesForSeller } from "@/lib/queries/experiences";
import { householdForUser } from "@/lib/queries/accounts";
import { isProducerSaved } from "@/lib/queries/favorites";
import { hoursStatusText } from "@/lib/opening-hours";
import { LeafIcon, SproutIcon, StoreIcon, VendingIcon } from "@/components/icons";
import ExperienceForm from "@/components/ExperienceForm";
import ReportForm from "@/components/ReportForm";
import ProducerActions from "@/components/ProducerActions";
import AskChefsButton from "@/components/AskChefsButton";
import JsonLd from "@/components/JsonLd";
import ProducerHeroCta from "@/components/ProducerHeroCta";
import ProducerRouteLink from "@/components/ProducerRouteLink";
import ProducerShareButton from "@/components/ProducerShareButton";
import ProducerViewPing from "@/components/ProducerViewPing";
import SaveProducerButton from "@/components/SaveProducerButton";
import { CATEGORIES, catalogItem } from "@/lib/catalog";
import { breadcrumbLd, producerBreadcrumbs, producerLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const producer = await producerBySlug((await params).slug);
  if (!producer) return {};
  const title = `${producer.name}${producer.city ? `, ${producer.city}` : ""}`;
  return {
    title,
    description:
      producer.description ??
      `${producer.name} in ${producer.city ?? "Nederland"}: verse producten rechtstreeks van de producent.`,
    alternates: { canonical: `/producent/${producer.slug}` },
    // Gestopte zaken blijven bereikbaar voor oude links maar horen niet in de index
    ...(producer.status === "gestopt" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const producer = await producerBySlug((await params).slug);
  if (!producer) notFound();
  const offers = producer.claimedBySellerId
    ? await publicOffersForSeller(producer.claimedBySellerId)
    : [];

  const viewerUserId = await currentUserId();
  const viewerHousehold = viewerUserId ? await householdForUser(viewerUserId) : null;
  const initialSaved = viewerHousehold
    ? await isProducerSaved(viewerHousehold.id, producer.id)
    : false;

  // Lokale interne linking (SEO-mesh) en handig voor de bezoeker: buren binnen 15 km
  const nearby =
    producer.lat != null && producer.lng != null
      ? (
          await nearbyProducers({
            lat: producer.lat,
            lng: producer.lng,
            radiusKm: 15,
            limit: 7,
          })
        ).producers
          .filter((p) => p.id !== producer.id)
          .slice(0, 6)
      : [];

  const crumbs = producerBreadcrumbs(producer);

  // Een geschorste of afgewezen verkoper houdt zijn claim (isMember blijft
  // true) maar verliest de "Aangesloten"-badge; de claim-teaser blijft al
  // correct verborgen (die kijkt naar isMember, niet naar de badge) en het
  // aanbod is al leeg via publicOffersForSeller.
  const isActiveMember =
    producer.isMember &&
    (producer.sellerStatus == null || producer.sellerStatus === "goedgekeurd");

  const experiences =
    producer.claimedBySellerId && isActiveMember
      ? await publishedExperiencesForSeller(producer.claimedBySellerId)
      : [];

  // eslint-disable-next-line react-hooks/purity -- klokvergelijking voor vakantiestatus is hier bewust
  const isOnVacation = producer.closedUntil != null && producer.closedUntil.getTime() > Date.now();

  const ALCOHOL_TOKENS = ["bier", "wijn", "cider"];
  const showsNix18 =
    producer.kind === "brouwerij" ||
    producer.kind === "wijngaard" ||
    producer.products.some((p) => ALCOHOL_TOKENS.includes(p));

  // Aanbod gegroepeerd per categorie (CATEGORIES-volgorde), uitgelicht eerst
  // binnen elke groep (de query sorteert al featured desc, title; sort is
  // stabiel dus die volgorde blijft staan binnen elke groep hieronder).
  const availableOffers = offers.filter((o) => o.available);
  const unavailableOffers = offers.filter((o) => !o.available);
  const offersByCategory = new Map<string, typeof offers>();
  for (const o of availableOffers) {
    const key = o.category ?? "_overig";
    if (!offersByCategory.has(key)) offersByCategory.set(key, []);
    offersByCategory.get(key)!.push(o);
  }
  const orderedCategoryKeys = [...CATEGORIES.map((c) => c.key), "_overig"].filter((k) =>
    offersByCategory.has(k)
  );

  const KIND_LABELS: Record<string, string> = {
    boerderijwinkel: t("producers.kind.boerderijwinkel"),
    brouwerij: t("producers.kind.brouwerij"),
    bakkerij: t("producers.kind.bakkerij"),
    imkerij: t("producers.kind.imkerij"),
    wijngaard: t("producers.kind.wijngaard"),
    overig: t("producers.kind.overig"),
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40">
      <ProducerViewPing slug={producer.slug} />
      <JsonLd data={producerLd(producer, offers)} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href="/producenten" className="text-sm text-terra-700 underline">
          {t("producers.title")}
        </Link>
      </header>

      {/* Zichtbare breadcrumb: matcht de BreadcrumbList en linkt naar de provincie */}
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.slice(0, -1).map((c, i) => (
            <li key={c.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              <Link href={c.path} className="hover:text-terra-700 hover:underline">
                {c.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold">{producer.name}</h1>
        {isActiveMember ? (
          <span className="rounded-full bg-terra-500 px-3 py-1 text-xs font-medium text-white">
            {t("producers.memberBadge")}
          </span>
        ) : (
          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-ink-700">
            {t("producers.guideBadge")}
          </span>
        )}
      </div>
      <p className="mb-4 text-ink-500">
        {[producer.address, producer.postcode, producer.city, producer.province]
          .filter(Boolean)
          .join(", ")}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {producer.lat != null && (
          <ProducerRouteLink lat={producer.lat} lng={producer.lng!} slug={producer.slug} />
        )}
        {producer.website && (
          <a
            href={producer.website}
            target="_blank"
            rel="noopener"
            className="rounded-full border border-terra-300 px-5 py-2.5 font-medium text-terra-700 hover:bg-terra-50"
          >
            {t("common.website")}
          </a>
        )}
        {producer.phone && (
          <a
            href={`tel:${producer.phone}`}
            className="rounded-full border border-terra-300 px-5 py-2.5 font-medium text-terra-700 hover:bg-terra-50"
          >
            {producer.phone}
          </a>
        )}
        <AskChefsButton producerSlug={producer.slug} producerName={producer.name} />
        <ProducerShareButton name={producer.name} slug={producer.slug} />
        <SaveProducerButton producerSlug={producer.slug} initialSaved={initialSaved} />
      </div>

      {/* Conversie-ingang voor de Google-bezoeker: alles in een tik op je lijst */}
      <ProducerHeroCta
        producerName={producer.name}
        producerSlug={producer.slug}
        products={producer.products}
      />

      {producer.photos.length > 0 && (
        <div className="mb-6">
          <Image
            src={producer.photos[0]}
            alt={producer.name}
            width={800}
            height={600}
            priority
            className="aspect-2/1 w-full rounded-tile border border-cream-200 object-cover"
          />
          {producer.photos.length > 1 && (
            <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
              {producer.photos.slice(1, 8).map((url, i) => (
                <Image
                  key={url}
                  src={url}
                  alt={`${producer.name}, foto ${i + 2}`}
                  width={300}
                  height={225}
                  className="aspect-4/3 w-32 shrink-0 snap-start rounded-tile border border-cream-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
      {showsNix18 && (
        <p className="mb-4 flex items-center gap-2 text-sm text-ink-500">
          <span className="rounded-full bg-ink-900 px-2 py-0.5 text-xs font-bold text-white">
            18+
          </span>
          {t("producers.nix18Notice")}
        </p>
      )}

      {producer.description && <p className="mb-6 leading-relaxed">{producer.description}</p>}

      {offers.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{t("producers.offersTitle")}</h2>
          {orderedCategoryKeys.map((catKey) => {
            const group = offersByCategory.get(catKey)!;
            const categoryLabel =
              CATEGORIES.find((c) => c.key === catKey)?.label ?? t("producers.offersOther");
            return (
              <div key={catKey} className="mb-4">
                {orderedCategoryKeys.length > 1 && (
                  <h3 className="mb-2 text-sm font-semibold text-ink-500">{categoryLabel}</h3>
                )}
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.map((offer) => (
                    <li
                      key={offer.id}
                      className="relative overflow-hidden rounded-tile border border-cream-200 bg-white"
                    >
                      {offer.featured && (
                        <span className="absolute left-2 top-2 z-10 rounded-full bg-terra-500 px-2 py-0.5 text-xs font-medium text-white">
                          {t("producers.offersFeatured")}
                        </span>
                      )}
                      {offer.photoUrl ? (
                        <Image
                          src={offer.photoUrl}
                          alt={offer.title}
                          width={400}
                          height={300}
                          className="aspect-4/3 w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-4/3 w-full items-center justify-center bg-cream-100 text-ink-300">
                          <StoreIcon width={26} height={26} />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium">{offer.title}</p>
                        {offer.catalogKey && catalogItem(offer.catalogKey) && (
                          <p className="mt-0.5 text-xs text-ink-500">
                            {t("producers.offersMatchesItem", {
                              item: catalogItem(offer.catalogKey)!.label,
                            })}
                          </p>
                        )}
                        {offer.priceIndication && (
                          <p className="text-sm font-semibold text-terra-700">
                            {offer.priceIndication}
                          </p>
                        )}
                        {offer.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {unavailableOffers.length > 0 && (
            <div className="mt-2">
              <h3 className="mb-2 text-sm font-semibold text-ink-500">
                {t("producers.offersUnavailableTitle")}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {unavailableOffers.map((offer) => (
                  <li
                    key={offer.id}
                    className="rounded-full bg-cream-100 px-3 py-1 text-sm text-ink-500"
                  >
                    {offer.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-2 text-xs text-ink-500">
            {t("producers.offersNote", { brand: BRAND.name })}
          </p>
        </section>
      )}

      <ProducerActions
        producerName={producer.name}
        producerSlug={producer.slug}
        products={producer.products}
      />

      <dl className="mb-6 flex flex-col gap-3 rounded-tile border border-cream-200 bg-white p-4">
        <div>
          <dt className="text-sm font-semibold text-ink-500">{t("producers.kindLabel")}</dt>
          <dd className="mt-1 text-sm">{KIND_LABELS[producer.kind] ?? producer.kind}</dd>
        </div>
        {producer.products.length > 0 && (
          <div>
            <dt className="text-sm font-semibold text-ink-500">{t("producers.products")}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {producer.products.map((p) => (
                <span key={p} className="rounded-full bg-cream-100 px-3 py-1 text-sm">
                  {p}
                </span>
              ))}
            </dd>
          </div>
        )}
        {(producer.openingHours || isOnVacation) && (
          <div>
            <dt className="text-sm font-semibold text-ink-500">{t("producers.openingHours")}</dt>
            {isOnVacation ? (
              <dd className="mt-1 font-medium text-terra-700">
                {t("producers.closedUntil", {
                  date: producer.closedUntil!.toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                  }),
                })}
              </dd>
            ) : (
              (() => {
                const status = hoursStatusText(producer.openingHours);
                return status ? (
                  <dd
                    className={`mt-1 ${
                      status.startsWith("Nu open") ? "font-medium text-terra-700" : ""
                    }`}
                  >
                    {status}
                  </dd>
                ) : null;
              })()
            )}
            {producer.openingHours && (
              <dd className="mt-1 text-sm text-ink-500">{producer.openingHours}</dd>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {producer.organic && (
            <span className="inline-flex items-center gap-1.5 text-sm text-terra-700">
              <LeafIcon width={15} height={15} /> {t("producers.organic")}
            </span>
          )}
          {producer.vendingMachine && (
            <span className="inline-flex items-center gap-1.5 text-sm text-terra-700">
              <VendingIcon width={15} height={15} /> {t("producers.vendingMachine")}
            </span>
          )}
          {producer.status === "seizoen" && (
            <span className="text-sm text-ink-500">{t("producers.seasonal")}</span>
          )}
        </div>
        {producer.paymentMethods && (
          <div>
            <dt className="text-sm font-semibold text-ink-500">
              {t("producers.paymentMethods")}
            </dt>
            <dd className="mt-1 text-sm text-ink-700">{producer.paymentMethods}</dd>
          </div>
        )}
        {producer.lastVerifiedAt && (
          <p className="text-xs text-ink-300">
            {t("producers.lastVerified", {
              date: producer.lastVerifiedAt.toLocaleDateString("nl-NL"),
            })}
          </p>
        )}
      </dl>

      {!producer.isMember && (
        <div className="mb-6 rounded-tile bg-terra-50 p-4">
          <p className="mb-2 text-sm text-terra-800">{t("producers.notMemberNotice")}</p>
          <Link
            href={`/verkopen?vermelding=${producer.slug}`}
            className="text-sm font-medium text-terra-700 underline"
          >
            {t("producers.claimCta")}
          </Link>
        </div>
      )}

      {isActiveMember && producer.claimedBySellerId && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{t("producers.experiencesTitle")}</h2>
          {experiences.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
              {experiences.map((e) => (
                <li key={e.id} className="rounded-tile border border-cream-200 bg-white p-3">
                  <p className="text-sm">{e.comment}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {e.reviewerName} ·{" "}
                    {e.createdAt.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <ExperienceForm producerSlug={producer.slug} />
        </section>
      )}

      {nearby.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{t("producers.nearbyTitle")}</h2>
          <ul className="flex flex-col gap-2">
            {nearby.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/producent/${p.slug}`}
                  className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-3 hover:border-terra-400"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{p.name}</span>
                    <p className="truncate text-sm text-ink-500">
                      {[p.city, p.distanceKm != null ? t("common.distanceKm", { km: p.distanceKm.toFixed(1) }) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {p.isMember && (
                    <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                      {t("producers.memberBadge")}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReportForm producerId={producer.id} />
    </main>
  );
}
