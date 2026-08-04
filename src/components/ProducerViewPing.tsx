"use client";

import { useEffect } from "react";

/**
 * Logt één keer per sessie een producent_bekeken-event voor deze producent.
 * De pagina is ISR (revalidate 300), dus server-side tellen kan niet; dit is
 * een onzichtbaar client component zonder eigen UI.
 */
export default function ProducerViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    const seenKey = `of_pv:${slug}`;
    if (sessionStorage.getItem(seenKey)) return;
    try {
      navigator.sendBeacon(
        "/api/event",
        new Blob([JSON.stringify({ name: "producent_bekeken", slug })], {
          type: "application/json",
        })
      );
      sessionStorage.setItem(seenKey, "1");
    } catch {}
  }, [slug]);

  return null;
}
