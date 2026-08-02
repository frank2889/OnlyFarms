import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Gedeelde lijsten zijn privé (geheime link) — niet indexeren
      disallow: ["/lijst/"],
    },
    sitemap: `https://${BRAND.domain}/sitemap.xml`,
  };
}
