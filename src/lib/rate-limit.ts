import { headers } from "next/headers";

const buckets = new Map<string, number[]>();

/**
 * Lichtgewicht in-memory rate limiter voor publieke schrijf-endpoints. Werkt
 * per serverless-instance (Vercel is multi-instance, dus geen harde garantie
 * over alle instances heen), maar is een goedkope eerste linie tegen
 * scriptmisbruik zonder externe dependency. Retourneert true zodra de limiet
 * binnen het tijdvenster is bereikt.
 */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  const limited = hits.length >= max;
  hits.push(now);
  buckets.set(key, hits);
  // Voorkom ongelimiteerde geheugengroei bij veel verschillende sleutels
  if (buckets.size > 5000) buckets.clear();
  return limited;
}

/** Beste inschatting van het IP-adres van de aanroeper (werkt in Route Handlers en Server Actions) */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
