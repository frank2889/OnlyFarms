"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { resolveLocationByCoordsAction, resolveLocationByQueryAction, type ResolvedLocation } from "@/app/lijst/actions";
import { MapPinIcon, SearchIcon, XIcon } from "@/components/icons";

/**
 * Homepage-onboarding: spiegelt LocationSearch.tsx visueel, maar navigeert
 * niet naar /producenten — geeft de opgeloste locatie aan de aanroeper zodat
 * die 'm direct op de nieuwe lijst kan zetten (setListLocation, geen aparte
 * navigatiestap).
 */
export default function HomeLocationInput({
  location,
  onLocation,
  onClear,
}: {
  location: ResolvedLocation | null;
  onLocation: (location: ResolvedLocation) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (location) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-terra-300 bg-terra-50 px-4 py-2.5 text-sm">
        <MapPinIcon width={15} height={15} className="shrink-0 text-terra-700" />
        <span className="min-w-0 flex-1 truncate font-medium text-terra-700">{location.label}</span>
        <button
          onClick={onClear}
          aria-label={t("common.close")}
          className="shrink-0 text-terra-700"
        >
          <XIcon width={15} height={15} />
        </button>
      </div>
    );
  }

  async function search() {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError(false);
    const result = await resolveLocationByQueryAction(q.trim());
    setBusy(false);
    if (result) onLocation(result);
    else setError(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
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
          <button type="submit" disabled={busy} className="font-medium text-terra-700 disabled:opacity-50">
            {t("common.search")}
          </button>
        </form>
        <button
          onClick={() => {
            setBusy(true);
            setError(false);
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const result = await resolveLocationByCoordsAction(
                  pos.coords.latitude,
                  pos.coords.longitude
                );
                setBusy(false);
                onLocation(result);
              },
              () => {
                setBusy(false);
                setError(true);
              },
              { timeout: 10_000 }
            );
          }}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-terra-300 px-4 py-2.5 text-terra-700 hover:bg-terra-50 disabled:opacity-50"
        >
          <MapPinIcon width={16} height={16} /> {t("common.myLocation")}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-terra-700">{t("home.locationNotFound")}</p>}
    </div>
  );
}
