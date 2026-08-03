import type { Metadata } from "next";
import Link from "next/link";
import { currentUserId } from "@/auth";
import { listsForUser } from "@/lib/queries/accounts";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, type CategoryKey } from "@/lib/catalog";
import { geocode } from "@/lib/geocode";
import { t } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import { travelInfo } from "@/lib/travel";
import { allProvinces, nearbyProducers } from "@/lib/queries/producers";
import { iconForCategory } from "@/components/catalog-icons";
import { RouteIcon, SproutIcon } from "@/components/icons";
import LocationSearch from "@/components/LocationSearch";

export const metadata: Metadata = {
  title: `${t("producers.title")} | ${BRAND.name}`,
  description:
    "Vind boerderijwinkels, bakkers, brouwers en andere lokale producenten bij jou in de buurt.",
};

type Search = {
  q?: string;
  lat?: string;
  lng?: string;
  product?: string;
  radius?: string;
};

export default async function ProducersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const radius = Number(params.radius) || 10;
  const category = CATEGORIES.find((c) => c.key === params.product)?.key as
    | CategoryKey
    | undefined;

  let coords: { lat: number; lng: number; label: string } | null = null;
  if (params.lat && params.lng) {
    coords = { lat: Number(params.lat), lng: Number(params.lng), label: "Mijn locatie" };
  } else if (params.q) {
    coords = await geocode(params.q);
  } else {
    // Ingelogd? Dan starten we vanaf je eigen locatie (die van je laatste lijst)
    const userId = await currentUserId();
    if (userId) {
      const myLists = await listsForUser(userId);
      const withLocation = myLists.find((l) => l.lat != null && l.lng != null);
      if (withLocation) {
        coords = {
          lat: withLocation.lat!,
          lng: withLocation.lng!,
          label: withLocation.postcode ?? "jouw locatie",
        };
      }
    }
  }

  const tokens = category ? [category === "zuivel" ? "melk" : category] : undefined;
  const results = coords
    ? await nearbyProducers({ ...coords, radiusKm: radius, tokens, limit: 50 })
    : null;
  const provinces = coords ? [] : await allProvinces();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href="/lijsten" className="text-sm text-terra-700 underline">
          {t("lists.title")}
        </Link>
      </header>

      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{t("producers.searchTitle")}</h1>

      <LocationSearch initialQuery={params.q ?? ""} product={params.product} radius={radius} />
      {coords && !params.q && !params.lat && (
        <p className="mt-2 text-sm text-ink-500">
          Vanaf jouw locatie: {coords.label}. pas hierboven aan als je ergens anders bent.
        </p>
      )}

      <div className="-mx-4 my-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {CATEGORIES.filter((c) => c.key !== "overig").map((c) => {
          const Icon = iconForCategory(c.key);
          const active = c.key === category;
          const query = new URLSearchParams({
            ...(params.q ? { q: params.q } : {}),
            ...(params.lat ? { lat: params.lat, lng: params.lng! } : {}),
            ...(active ? {} : { product: c.key }),
          });
          return (
            <Link
              key={c.key}
              href={`/producenten?${query}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
                active
                  ? "border-terra-500 bg-terra-500 text-white"
                  : "border-cream-300 bg-white hover:border-terra-400"
              }`}
            >
              <Icon width={14} height={14} /> {c.label}
            </Link>
          );
        })}
      </div>

      {results && (
        <>
          {results.usedFallback && (
            <p className="mb-3 text-sm text-ink-500">
              {t("lists.nearestFallback", { km: radius })}
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {results.producers.map((p) => (
              <li key={p.id}>
                <div className="rounded-tile border border-cream-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/producent/${p.slug}`}
                      className="min-w-0 flex-1 truncate font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    {p.isMember && (
                      <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                        {t("producers.memberBadge")}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-ink-500">
                    {[p.city, p.products.slice(0, 4).join(", ")].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                    {p.distanceKm !== undefined && (
                      <span>
                        {t("common.distanceKm", { km: p.distanceKm.toFixed(1) })} ·{" "}
                        {t("common.travel", {
                          min: travelInfo(p.distanceKm).minutes,
                          mode: travelInfo(p.distanceKm).mode,
                        })}
                      </span>
                    )}
                    {p.lat != null && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 text-terra-700 hover:underline"
                      >
                        <RouteIcon width={13} height={13} /> {t("common.route")}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!results && (
        <div className="mb-8 rounded-tile border border-cream-200 bg-white p-5 text-center">
          <p className="mb-1 font-semibold">Waar ben je?</p>
          <p className="text-sm text-ink-500">
            Vul hierboven je postcode in of gebruik je locatie, dan zie je direct wat er bij jou in de buurt is.
          </p>
        </div>
      )}
      {!results && provinces.length > 0 && (
        <>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">Blader per provincie</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {provinces.map((p) => (
            <Link
              key={p.province}
              href={`/provincie/${slugify(p.province)}`}
              className="rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
            >
              <span className="font-medium">{p.province}</span>
              <span className="block text-sm text-ink-500">{p.count} producenten</span>
            </Link>
          ))}
        </div>
        </>
      )}
    </main>
  );
}
