// PDOK Locatieserver: gratis geocoder van de Nederlandse overheid, geen key.
export type GeocodeResult = { lat: number; lng: number; label: string };

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
