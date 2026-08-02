// PDOK Locatieserver: gratis geocoder van de Nederlandse overheid, geen key.
export type GeocodeResult = { lat: number; lng: number; label: string };

/** Coördinaten → leesbare plaatsnaam, zodat de gebruiker ziet welk punt de app gebruikt */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${lat}&lon=${lng}&rows=1&fl=weergavenaam`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.response?.docs?.[0]?.weergavenaam ?? null;
  } catch {
    return null;
  }
}

export async function geocode(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;
  const res = await fetch(
    `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&rows=1&fl=centroide_ll,weergavenaam`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data?.response?.docs?.[0];
  const m = doc?.centroide_ll?.match(/POINT\(([\d.]+) ([\d.]+)\)/);
  if (!m) return null;
  return { lat: Number(m[2]), lng: Number(m[1]), label: doc.weergavenaam ?? q };
}
