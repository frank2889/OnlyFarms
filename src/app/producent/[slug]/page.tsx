import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { producerBySlug } from "@/lib/queries/producers";
import { publicOffersForSeller } from "@/lib/queries/portal";
import { hoursStatusText } from "@/lib/opening-hours";
import { LeafIcon, RouteIcon, SproutIcon, StoreIcon, VendingIcon } from "@/components/icons";
import ReportForm from "@/components/ReportForm";
import ProducerActions from "@/components/ProducerActions";
import AskChefsButton from "@/components/AskChefsButton";

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
    title: `${title} | ${BRAND.name}`,
    description:
      producer.description ??
      `${producer.name} in ${producer.city ?? "Nederland"}: verse producten rechtstreeks van de producent.`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: producer.name,
    description: producer.description ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: producer.address ?? undefined,
      postalCode: producer.postcode ?? undefined,
      addressLocality: producer.city ?? undefined,
      addressRegion: producer.province ?? undefined,
      addressCountry: "NL",
    },
    geo:
      producer.lat != null
        ? { "@type": "GeoCoordinates", latitude: producer.lat, longitude: producer.lng }
        : undefined,
    telephone: producer.phone ?? undefined,
    url: producer.website ?? undefined,
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href="/producenten" className="text-sm text-terra-700 underline">
          {t("producers.title")}
        </Link>
      </header>

      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold">{producer.name}</h1>
        {producer.isMember ? (
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
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${producer.lat},${producer.lng}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full bg-terra-500 px-5 py-2.5 font-medium text-white hover:bg-terra-600"
          >
            <RouteIcon width={16} height={16} /> {t("common.route")}
          </a>
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
        <AskChefsButton producerSlug={producer.slug} producerName={producer.name} />
      </div>

      {producer.photos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2">
          <Image
            src={producer.photos[0]}
            alt={producer.name}
            width={800}
            height={600}
            priority
            className={`aspect-4/3 w-full rounded-tile border border-cream-200 object-cover ${
              producer.photos.length === 1 ? "col-span-2 aspect-2/1" : "row-span-2 h-full"
            }`}
          />
          {producer.photos.slice(1, 3).map((url) => (
            <Image
              key={url}
              src={url}
              alt={producer.name}
              width={400}
              height={300}
              className="aspect-4/3 w-full rounded-tile border border-cream-200 object-cover"
            />
          ))}
        </div>
      )}

      {producer.description && <p className="mb-6 leading-relaxed">{producer.description}</p>}

      {offers.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{t("producers.offersTitle")}</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="overflow-hidden rounded-tile border border-cream-200 bg-white"
              >
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
                  {offer.priceIndication && (
                    <p className="text-sm font-semibold text-terra-700">{offer.priceIndication}</p>
                  )}
                  {offer.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{offer.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
        {producer.openingHours && (
          <div>
            <dt className="text-sm font-semibold text-ink-500">{t("producers.openingHours")}</dt>
            {(() => {
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
            })()}
            <dd className="mt-1 text-sm text-ink-500">{producer.openingHours}</dd>
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
          <Link href="/verkopen" className="text-sm font-medium text-terra-700 underline">
            {t("producers.claimCta")}
          </Link>
        </div>
      )}

      <ReportForm producerId={producer.id} />
    </main>
  );
}
