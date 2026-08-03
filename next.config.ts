import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Foto's van producenten/producten staan in Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
