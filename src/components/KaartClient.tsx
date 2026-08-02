"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { Farm } from "@/components/FarmMap";

// Leaflet gebruikt window en kan niet server-side renderen
const FarmMap = dynamic(() => import("@/components/FarmMap"), { ssr: false });

function Inner({ farms }: { farms: Farm[] }) {
  const params = useSearchParams();
  const product = params.get("product");
  return (
    <FarmMap farms={farms} initialCategories={product ? [product] : []} />
  );
}

export default function KaartClient({ farms }: { farms: Farm[] }) {
  return (
    <Suspense>
      <Inner farms={farms} />
    </Suspense>
  );
}
