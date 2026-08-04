import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Gedeelde lijsten en uitnodigingen zijn privé (geheime link); beheer,
      // portaal, profiel, auth en de API horen niet in een index
      disallow: [
        "/lijst/",
        "/gezin/",
        "/beheer",
        "/portaal",
        "/profiel",
        "/inloggen",
        "/registreren",
        "/api/",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
