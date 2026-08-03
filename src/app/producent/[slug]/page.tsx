import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { producerBySlug } from "@/lib/queries/producers";
import { hoursStatusText } from "@/lib/opening-hours";
import { LeafIcon, RouteIcon, SproutIcon, VendingIcon } from "@/components/icons";
import ReportForm from "@/components/ReportForm";
import ProducerActions from "@/components/ProducerActions";

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
      </div>

      {producer.description && <p className="mb-6 leading-relaxed">{producer.description}</p>}

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
