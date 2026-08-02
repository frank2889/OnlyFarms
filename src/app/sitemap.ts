import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { slugify } from "@/lib/slug";
import { allProducerSlugs, allProvinces } from "@/lib/queries/producers";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${BRAND.domain}`;
  const [slugs, provinces] = await Promise.all([allProducerSlugs(), allProvinces()]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/producenten`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/lijsten`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/verkopen`, changeFrequency: "monthly", priority: 0.6 },
    ...provinces.map((p) => ({
      url: `${base}/provincie/${slugify(p.province)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...slugs.map((slug) => ({
      url: `${base}/producent/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
