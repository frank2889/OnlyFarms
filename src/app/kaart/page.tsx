"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Leaflet gebruikt window en kan niet server-side renderen
const FarmMap = dynamic(() => import("@/components/FarmMap"), { ssr: false });

function KaartInner() {
  const params = useSearchParams();
  const product = params.get("product");
  return <FarmMap initialCategories={product ? [product] : []} />;
}

export default function KaartPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          🚜 OnlyFarms
        </Link>
        <Link href="/verkopen" className="text-sm underline">
          verkopen via OnlyFarms
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <Suspense>
          <KaartInner />
        </Suspense>
      </div>
    </main>
  );
}
