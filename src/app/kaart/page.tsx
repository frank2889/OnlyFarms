"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// Leaflet gebruikt window en kan niet server-side renderen
const FarmMap = dynamic(() => import("@/components/FarmMap"), { ssr: false });

export default function KaartPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">OnlyFarms — boerderijwinkels</h1>
        <Link href="/" className="text-sm underline">
          home
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <FarmMap />
      </div>
    </main>
  );
}
