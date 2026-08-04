import { BRAND } from "@/lib/brand";
import { parseHours, type Interval } from "@/lib/opening-hours";
import { provinceSlug } from "@/lib/provinces";
import type { Producer } from "@/lib/types";

/**
 * Centrale technische SEO-laag: alle absolute URL's en JSON-LD komen hier
 * vandaan. De domeinwissel is dus één regel in src/lib/brand.ts; pagina's
 * bouwen nooit zelf schema.org-objecten.
 */

export function siteUrl(): string {
  return `https://${BRAND.domain}`;
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}

/* ---------- Organization en WebSite (root layout) ---------- */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: BRAND.name,
    url: siteUrl(),
    logo: absoluteUrl("/icon-512.png"),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: BRAND.name,
    url: siteUrl(),
    inLanguage: "nl",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/producenten?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ---------- Breadcrumbs en lijsten ---------- */

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/* ---------- Openingstijden naar schema.org ---------- */

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Eigen formatter: de interne fmt() van opening-hours doet uur % 24, waardoor
// het 24/7-geval (eind = 1440) als "00:00" zou eindigen; schema.org wil "23:59".
function schemaTime(minutes: number): string {
  if (minutes >= 1440) return "23:59";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function openingHoursSpecificationFor(text: string | null) {
  if (!text) return undefined;
  const intervals: Interval[] = parseHours(text);
  if (!intervals.length) return undefined;
  // Dagen met dezelfde tijden groeperen in één spec
  const byTimes = new Map<string, { days: number[]; start: number; end: number }>();
  for (const i of intervals) {
    const key = `${i.start}-${i.end}`;
    const group = byTimes.get(key) ?? { days: [], start: i.start, end: i.end };
    if (!group.days.includes(i.day)) group.days.push(i.day);
    byTimes.set(key, group);
  }
  return [...byTimes.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days.sort((a, b) => a - b).map((d) => SCHEMA_DAYS[d]),
    opens: schemaTime(g.start),
    closes: schemaTime(g.end),
  }));
}

/* ---------- Producent (LocalBusiness en specifieker) ---------- */

const KIND_TO_SCHEMA_TYPE: Record<string, string> = {
  brouwerij: "Brewery",
  bakkerij: "Bakery",
  wijngaard: "Winery",
  boerderijwinkel: "GroceryStore",
  imkerij: "LocalBusiness",
  overig: "LocalBusiness",
};

export type PublicOffer = { title: string; priceIndication: string | null };

/**
 * Verrijkte LocalBusiness voor de producentpagina. Bewust GEEN
 * aggregateRating: reviews zijn nergens publiek zichtbaar en Google eist dat
 * een rating op de pagina staat; toevoegen zodra ervaringen publiek worden.
 */
export function producerLd(producer: Producer, offers: PublicOffer[] = []) {
  const pageUrl = absoluteUrl(`/producent/${producer.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": KIND_TO_SCHEMA_TYPE[producer.kind] ?? "LocalBusiness",
    "@id": `${pageUrl}#business`,
    name: producer.name,
    url: pageUrl,
    // De eigen site van de producent is een ander profiel van dezelfde zaak
    sameAs: producer.website ?? undefined,
    description: producer.description ?? undefined,
    image: producer.photos.length ? producer.photos : undefined,
    telephone: producer.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: producer.address ?? undefined,
      postalCode: producer.postcode ?? undefined,
      addressLocality: producer.city ?? undefined,
      addressRegion: producer.province ?? undefined,
      addressCountry: "NL",
    },
    // Alleen complete coördinaten zijn geldige GeoCoordinates
    geo:
      producer.lat != null && producer.lng != null
        ? { "@type": "GeoCoordinates", latitude: producer.lat, longitude: producer.lng }
        : undefined,
    openingHoursSpecification: openingHoursSpecificationFor(producer.openingHours),
    paymentAccepted: producer.paymentMethods ?? undefined,
    hasOfferCatalog: offers.length
      ? {
          "@type": "OfferCatalog",
          name: "Aanbod",
          itemListElement: offers.map((o) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Product", name: o.title },
            // priceIndication is vrije tekst ("3 euro per doos"), geen valide price
            description: o.priceIndication ?? undefined,
          })),
        }
      : undefined,
  };
}

/** Breadcrumb-items voor een producent; provincie-schakel alleen als die bekend is */
export function producerBreadcrumbs(producer: Producer): { name: string; path: string }[] {
  const items = [
    { name: "Home", path: "/" },
    { name: "Producenten", path: "/producenten" },
  ];
  if (producer.province) {
    items.push({
      name: producer.province,
      path: `/provincie/${provinceSlug(producer.province)}`,
    });
  }
  items.push({ name: producer.name, path: `/producent/${producer.slug}` });
  return items;
}
