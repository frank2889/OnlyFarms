"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type SVGProps } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  AppleIcon,
  CarrotIcon,
  CheeseIcon,
  EggIcon,
  HoneyIcon,
  LeafIcon,
  MapPinIcon,
  MeatIcon,
  MilkIcon,
  PotatoIcon,
  VendingIcon,
} from "@/components/icons";

export type Farm = {
  id: number;
  slug: string;
  name: string;
  city: string | null;
  lat: number;
  lng: number;
  products: string[];
  openingHours: string | null;
  website: string | null;
  organic: boolean | null;
  vendingMachine: boolean | null;
  status: string;
};

const CATEGORIES: {
  key: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { key: "eieren", label: "Eieren", Icon: EggIcon },
  { key: "melk", label: "Melk & zuivel", Icon: MilkIcon },
  { key: "kaas", label: "Kaas", Icon: CheeseIcon },
  { key: "vlees", label: "Vlees", Icon: MeatIcon },
  { key: "groente", label: "Groente", Icon: CarrotIcon },
  { key: "fruit", label: "Fruit", Icon: AppleIcon },
  { key: "aardappelen", label: "Aardappelen", Icon: PotatoIcon },
  { key: "honing", label: "Honing", Icon: HoneyIcon },
];

// Nederland, met een kleine marge
const NL_BOUNDS = L.latLngBounds([50.55, 3.0], [53.75, 7.45]);

function popupHtml(farm: Farm): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const badges = [
    farm.organic ? "Bio" : null,
    farm.vendingMachine ? "Verkoopautomaat" : null,
    farm.status === "seizoen" ? "Seizoensgebonden" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const parts = [
    `<strong>${esc(farm.name)}</strong>`,
    farm.city ? esc(farm.city) : null,
    farm.products.length ? esc(farm.products.join(", ")) : null,
    farm.openingHours ? `Openingstijden: ${esc(farm.openingHours)}` : null,
    badges || null,
    [
      farm.website
        ? `<a href="${esc(farm.website)}" target="_blank" rel="noopener">website</a>`
        : null,
      `<a href="https://www.google.com/maps/dir/?api=1&destination=${farm.lat},${farm.lng}" target="_blank" rel="noopener">route</a>`,
    ]
      .filter(Boolean)
      .join(" · "),
  ];
  return parts.filter(Boolean).join("<br/>");
}

const chipClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
    active
      ? "border-green-700 bg-green-700 text-white"
      : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
  }`;

export default function FarmMap({
  farms,
  initialCategories = [],
}: {
  farms: Farm[];
  initialCategories?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const [activeCats, setActiveCats] = useState<Set<string>>(
    () => new Set(initialCategories)
  );
  const [bioOnly, setBioOnly] = useState(false);
  const [automaatOnly, setAutomaatOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Kaart één keer opzetten, vastgepind op Nederland
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.25, 5.3],
      zoom: 8,
      minZoom: 7,
      maxBounds: NL_BOUNDS.pad(0.05),
      maxBoundsViscosity: 1.0,
    });
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      showCoverageOnHover: false,
    });
    cluster.addTo(map);
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  const visible = useMemo(() => {
    return farms.filter((f) => {
      if (bioOnly && !f.organic) return false;
      if (automaatOnly && !f.vendingMachine) return false;
      if (activeCats.size > 0 && !f.products.some((p) => activeCats.has(p)))
        return false;
      return true;
    });
  }, [farms, activeCats, bioOnly, automaatOnly]);

  // Markers verversen als de filters veranderen
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    for (const farm of visible) {
      const marker = L.circleMarker([farm.lat, farm.lng], {
        radius: 7,
        color: farm.organic ? "#15803d" : "#b45309",
        fillColor: farm.organic ? "#22c55e" : "#f59e0b",
        fillOpacity: 0.85,
        weight: 2,
      });
      marker.bindPopup(popupHtml(farm));
      cluster.addLayer(marker);
    }
  }, [visible]);

  function toggleCat(key: string) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const doSearch = useCallback(async () => {
    const q = search.trim();
    if (!q || !mapRef.current) return;
    setSearchError(null);
    try {
      const res = await fetch(
        `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&rows=1&fl=centroide_ll,weergavenaam`
      );
      const data = await res.json();
      const doc = data?.response?.docs?.[0];
      const m = doc?.centroide_ll?.match(/POINT\(([\d.]+) ([\d.]+)\)/);
      if (!m) {
        setSearchError("Niets gevonden — probeer een postcode of plaatsnaam.");
        return;
      }
      mapRef.current.setView([Number(m[2]), Number(m[1])], 12);
    } catch {
      setSearchError("Zoeken mislukte, probeer het nog eens.");
    }
  }, [search]);

  function locateMe() {
    mapRef.current?.locate({ setView: true, maxZoom: 12 });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2 border-b bg-white p-3 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch();
            }}
            className="flex gap-1"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Postcode of plaats"
              className="w-44 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Zoek
            </button>
          </form>
          <button
            onClick={locateMe}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <MapPinIcon width={16} height={16} /> Mijn locatie
          </button>
          <span className="ml-auto text-sm text-neutral-500">
            {visible.length} boerderijen
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => toggleCat(key)}
              className={chipClass(activeCats.has(key))}
            >
              <Icon width={15} height={15} /> {label}
            </button>
          ))}
          <button
            onClick={() => setBioOnly((v) => !v)}
            className={chipClass(bioOnly)}
          >
            <LeafIcon width={15} height={15} /> Bio
          </button>
          <button
            onClick={() => setAutomaatOnly((v) => !v)}
            className={chipClass(automaatOnly)}
          >
            <VendingIcon width={15} height={15} /> Automaat
          </button>
          {(activeCats.size > 0 || bioOnly || automaatOnly) && (
            <button
              onClick={() => {
                setActiveCats(new Set());
                setBioOnly(false);
                setAutomaatOnly(false);
              }}
              className="rounded-full px-3 py-1 text-sm text-neutral-500 underline"
            >
              Wis alles
            </button>
          )}
        </div>
        {searchError && (
          <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
        )}
      </div>

      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  );
}
