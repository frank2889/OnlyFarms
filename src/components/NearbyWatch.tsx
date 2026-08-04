"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { setNearbyRadiusAction } from "@/app/account/actions";
import { BellIcon, RouteIcon, XIcon } from "@/components/icons";
import type { ItemMatch, ListItem } from "@/lib/types";

const SETTING_KEY = "of_nearby_m";
const SEEN_KEY = "of_nearby_seen";
const COOLDOWN_MS = 4 * 60 * 60 * 1000; // zelfde producent max 1x per 4 uur

type Candidate = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  itemLabel: string;
};

type Alert = Candidate & { distanceM: number };

// Zelfde-tab-wijzigingen vuren geen 'storage'-event, dus we sturen er zelf een
function subscribeSetting(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("of:nearby-setting", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("of:nearby-setting", cb);
  };
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function recentlySeen(slug: string): boolean {
  try {
    const seen: Record<string, number> = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "{}");
    return Date.now() - (seen[slug] ?? 0) < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markSeen(slug: string): void {
  try {
    const seen: Record<string, number> = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "{}");
    seen[slug] = Date.now();
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {}
}

/**
 * "Je bent vlakbij"-melding (v1, alleen met de app open): volgt je positie
 * zolang de lijstpagina open staat en meldt als een producent die iets van je
 * open lijst verkoopt binnen de gekozen afstand is. Kandidaten zijn de al
 * gematchte producenten (binnen de lijst-radius); echte achtergrond-meldingen
 * komen pas met de native app.
 */
export default function NearbyWatch({
  open,
  matches,
  accountRadiusM,
  token,
}: {
  open: ListItem[];
  matches: Record<string, ItemMatch>;
  /** Ingelogd: de account-brede instelling wint (null = uit); anoniem: undefined → localStorage */
  accountRadiusM?: number | null;
  token?: string;
}) {
  const router = useRouter();
  const hasAccount = accountRadiusM !== undefined;
  const localMeters = Number(
    useSyncExternalStore(
      subscribeSetting,
      () => localStorage.getItem(SETTING_KEY) ?? "0",
      () => "0"
    )
  );
  const meters = hasAccount ? (accountRadiusM ?? 0) : localMeters;
  const [alert, setAlert] = useState<Alert | null>(null);
  const [geoError, setGeoError] = useState(false);

  // Kandidaten: per open item de gematchte producenten (zeker eerst), ontdubbeld op slug
  const candidates = useMemo(() => {
    const bySlug = new Map<string, Candidate>();
    for (const item of open) {
      if (!item.catalogKey) continue;
      const match = matches[item.catalogKey];
      if (!match) continue;
      for (const p of [...match.exact, ...match.category]) {
        if (p.lat == null || p.lng == null || bySlug.has(p.slug)) continue;
        bySlug.set(p.slug, {
          slug: p.slug,
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          itemLabel: item.label,
        });
      }
    }
    return [...bySlug.values()];
  }, [open, matches]);

  useEffect(() => {
    if (!meters || candidates.length === 0 || !("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(false);
        let best: Alert | null = null;
        for (const c of candidates) {
          const d = distanceMeters(pos.coords.latitude, pos.coords.longitude, c.lat, c.lng);
          if (d <= meters && !recentlySeen(c.slug) && (!best || d < best.distanceM)) {
            best = { ...c, distanceM: d };
          }
        }
        if (best) setAlert(best);
      },
      () => setGeoError(true),
      { enableHighAccuracy: true, maximumAge: 30_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [meters, candidates]);

  function setSetting(value: string) {
    if (hasAccount) {
      // Ingelogd: instelling hoort bij het account (geldt op al je apparaten)
      void setNearbyRadiusAction(value === "0" ? null : Number(value)).then(() => router.refresh());
    } else {
      localStorage.setItem(SETTING_KEY, value);
      window.dispatchEvent(new Event("of:nearby-setting"));
    }
    setGeoError(false);
    if (value === "0") setAlert(null);
  }

  function dismiss() {
    if (alert) markSeen(alert.slug);
    setAlert(null);
  }

  const distText =
    alert && (alert.distanceM < 1000 ? `${Math.round(alert.distanceM / 10) * 10} m` : `${(alert.distanceM / 1000).toFixed(1)} km`);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <BellIcon width={15} height={15} className="shrink-0 text-terra-500" />
        <span>{t("lists.nearbyAlertLabel")}</span>
        <select
          value={String(meters)}
          onChange={(e) => setSetting(e.target.value)}
          className="rounded-full border border-cream-300 bg-cream-50 px-2 py-0.5"
        >
          <option value="0">{t("lists.nearbyAlertOff")}</option>
          <option value="500">500 m</option>
          <option value="1000">1 km</option>
          <option value="2000">2 km</option>
        </select>
        {geoError && <span className="text-terra-700">{t("lists.nearbyAlertGeoError")}</span>}
      </div>

      {alert && (
        <div className="animate-snack fixed bottom-[12.4rem] sm:bottom-[8.4rem] left-1/2 z-60 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-tile border border-terra-300 bg-white p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <BellIcon width={20} height={20} className="mt-0.5 shrink-0 text-terra-500" />
            <p className="min-w-0 flex-1 text-sm">
              {t("lists.nearbyAlertText", {
                name: alert.name,
                dist: distText ?? "",
                item: alert.itemLabel,
              })}
            </p>
            <button onClick={dismiss} aria-label={t("common.close")} className="shrink-0 p-1 text-ink-500">
              <XIcon width={16} height={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 pl-8 text-sm">
            <Link href={`/producent/${alert.slug}`} className="font-medium text-terra-700 underline">
              {t("lists.nearbyAlertView")}
            </Link>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${alert.lat},${alert.lng}`}
              target="_blank"
              rel="noopener"
              onClick={() => {
                try {
                  navigator.sendBeacon(
                    "/api/event",
                    new Blob([JSON.stringify({ name: "route_geopend", token })], { type: "application/json" })
                  );
                } catch {}
              }}
              className="inline-flex items-center gap-1 text-terra-700 underline"
            >
              <RouteIcon width={13} height={13} /> {t("common.route")}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
