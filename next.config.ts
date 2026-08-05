import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Foto's van producenten/producten staan in Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      // De kaart is bewust verwijderd (huisregel: geen kaart); permanent naar Ontdek
      { source: "/kaart", destination: "/producenten", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Lijst-tokens staan in de URL; zonder dit lekt zo'n link via de
          // referrer mee naar elke externe link (route, website) op een pagina.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Niemand hoort deze site in een iframe te tonen (geen embed-usecase)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Report-only als extra vangnet tegen XSS (naast escaping op de bron,
          // zie JsonLd.tsx); observeren vóór eventueel afdwingen in een latere PR.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.public.blob.vercel-storage.com",
              "connect-src 'self' https://*.pusher.com wss://*.pusher.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
