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
};

export default nextConfig;
