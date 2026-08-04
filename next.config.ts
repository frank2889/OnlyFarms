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
        ],
      },
    ];
  },
};

export default nextConfig;
