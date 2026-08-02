"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { MapPinIcon, SearchIcon } from "@/components/icons";

export default function LocationSearch({
  initialQuery,
  product,
  radius,
}: {
  initialQuery: string;
  product?: string;
  radius: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [busy, setBusy] = useState(false);

  function push(params: Record<string, string>) {
    const query = new URLSearchParams({
      ...(product ? { product } : {}),
      ...(radius !== 10 ? { radius: String(radius) } : {}),
      ...params,
    });
    router.push(`/producenten?${query}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) push({ q: q.trim() });
        }}
        className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2.5"
      >
        <SearchIcon width={16} height={16} className="text-ink-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("common.postcodeOrCity")}
          className="w-full bg-transparent outline-none"
        />
        <button type="submit" className="font-medium text-terra-700">
          {t("common.search")}
        </button>
      </form>
      <button
        onClick={() => {
          setBusy(true);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              push({
                lat: pos.coords.latitude.toFixed(5),
                lng: pos.coords.longitude.toFixed(5),
              });
              setBusy(false);
            },
            () => setBusy(false),
            { timeout: 10_000 }
          );
        }}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-terra-300 px-4 py-2.5 text-terra-700 hover:bg-terra-50 disabled:opacity-50"
      >
        <MapPinIcon width={16} height={16} /> {t("common.myLocation")}
      </button>
    </div>
  );
}
