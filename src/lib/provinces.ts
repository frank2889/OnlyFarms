import { slugify } from "@/lib/slug";

// De twaalf provincies: één bron voor de provinciepagina's én de sitemap,
// zodat beide altijd exact dezelfde URL's kennen.
export const PROVINCES = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
] as const;

export function provinceFromSlug(slug: string): string | undefined {
  return PROVINCES.find((p) => slugify(p) === slug);
}

export function provinceSlug(province: string): string {
  return slugify(province);
}
