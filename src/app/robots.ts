import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Gedeelde lijsten zijn privé (geheime link); beheer en portaal zijn intern
      disallow: ["/lijst/", "/beheer", "/portaal"],
    },
    sitemap: `https://${BRAND.domain}/sitemap.xml`,
  };
}
