import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { PROVINCES, provinceSlug } from "@/lib/provinces";
import { allProducerSlugs } from "@/lib/queries/producers";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const producers = await allProducerSlugs();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/producenten`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/verkopen`, changeFrequency: "monthly", priority: 0.6 },
    // Dezelfde hardcoded provincielijst als de pagina's zelf: nooit een
    // sitemap-URL die 404 geeft door een afwijkende DB-spelling
    ...PROVINCES.map((p) => ({
      url: `${base}/provincie/${provinceSlug(p)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...producers.map((p) => ({
      url: `${base}/producent/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
