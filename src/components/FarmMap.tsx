"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Farm = {
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

export default function FarmMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([52.2, 5.3], 8);
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    async function loadFarms() {
      const b = map.getBounds();
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(",");
      const res = await fetch(`/api/farms?bbox=${bbox}`);
      if (!res.ok) return;
      const data: { farms: Farm[] } = await res.json();

      layer.clearLayers();
      for (const farm of data.farms) {
        const marker = L.circleMarker([farm.lat, farm.lng], {
          radius: 7,
          color: farm.organic ? "#15803d" : "#b45309",
          fillColor: farm.organic ? "#22c55e" : "#f59e0b",
          fillOpacity: 0.8,
          weight: 2,
        });
        const products = farm.products.length
          ? `<br/>${farm.products.join(", ")}`
          : "";
        const site = farm.website
          ? `<br/><a href="${farm.website}" target="_blank" rel="noopener">website</a>`
          : "";
        marker.bindPopup(
          `<strong>${farm.name}</strong>${farm.city ? `<br/>${farm.city}` : ""}${products}${site}`
        );
        marker.addTo(layer);
      }
    }

    map.on("moveend", loadFarms);
    loadFarms();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
