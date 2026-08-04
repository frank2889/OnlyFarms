"use client";

import { RouteIcon } from "@/components/icons";
import { t } from "@/lib/i18n";

/** De Route-knop op de producentpagina; logt route_geopend met de producent-slug */
export default function ProducerRouteLink({
  lat,
  lng,
  slug,
}: {
  lat: number;
  lng: number;
  slug: string;
}) {
  function beacon() {
    try {
      navigator.sendBeacon(
        "/api/event",
        new Blob([JSON.stringify({ name: "route_geopend", slug })], {
          type: "application/json",
        })
      );
    } catch {}
  }

  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
      target="_blank"
      rel="noopener"
      onClick={beacon}
      className="inline-flex items-center gap-2 rounded-full bg-terra-500 px-5 py-2.5 font-medium text-white hover:bg-terra-600"
    >
      <RouteIcon width={16} height={16} /> {t("common.route")}
    </a>
  );
}
