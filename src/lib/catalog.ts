// Item-catalogus voor de boodschappenlijst (Bring-model).
// Keys sluiten aan op de genormaliseerde producten-tokens van producenten,
// zodat item → producent-matching direct werkt.

export type CategoryKey =
  | "zuivel"
  | "eieren"
  | "kaas"
  | "vlees"
  | "groente"
  | "fruit"
  | "aardappelen"
  | "brood"
  | "zoet"
  | "dranken"
  | "overig";

export type CatalogCategory = { key: CategoryKey; label: string };

export type CatalogItem = {
  key: string;
  label: string;
  category: CategoryKey;
  /** producten-tokens van producenten waarop dit item matcht */
  matchTokens: string[];
  nix18?: boolean;
  /** maanden (1-12) waarin dit item in seizoen is */
  seasonMonths?: number[];
};

export const CATEGORIES: CatalogCategory[] = [
  { key: "zuivel", label: "Melk & zuivel" },
  { key: "eieren", label: "Eieren" },
  { key: "kaas", label: "Kaas" },
  { key: "vlees", label: "Vlees" },
  { key: "groente", label: "Groente" },
  { key: "fruit", label: "Fruit" },
  { key: "aardappelen", label: "Aardappelen" },
  { key: "brood", label: "Brood & bakker" },
  { key: "zoet", label: "Honing & zoet" },
  { key: "dranken", label: "Dranken" },
  { key: "overig", label: "Overig" },
];

export const CATALOG: CatalogItem[] = [
  // Zuivel
  { key: "melk", label: "Verse melk", category: "zuivel", matchTokens: ["melk"] },
  { key: "yoghurt", label: "Yoghurt", category: "zuivel", matchTokens: ["melk"] },
  { key: "kwark", label: "Kwark", category: "zuivel", matchTokens: ["melk"] },
  { key: "boter", label: "Roomboter", category: "zuivel", matchTokens: ["melk"] },
  { key: "ijs", label: "Boerderij-ijs", category: "zuivel", matchTokens: ["melk", "ijs"] },
  // Eieren
  { key: "eieren", label: "Eieren", category: "eieren", matchTokens: ["eieren"] },
  // Kaas
  { key: "kaas", label: "Kaas", category: "kaas", matchTokens: ["kaas"] },
  { key: "geitenkaas", label: "Geitenkaas", category: "kaas", matchTokens: ["kaas", "geitenkaas"] },
  // Vlees
  { key: "rundvlees", label: "Rundvlees", category: "vlees", matchTokens: ["vlees"] },
  { key: "varkensvlees", label: "Varkensvlees", category: "vlees", matchTokens: ["vlees"] },
  { key: "kip", label: "Kip", category: "vlees", matchTokens: ["vlees"] },
  { key: "worst", label: "Worst", category: "vlees", matchTokens: ["vlees"] },
  { key: "lamsvlees", label: "Lamsvlees", category: "vlees", matchTokens: ["vlees"] },
  // Groente
  { key: "groente", label: "Verse groente", category: "groente", matchTokens: ["groente"] },
  { key: "tomaten", label: "Tomaten", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] },
  { key: "asperges", label: "Asperges", category: "groente", matchTokens: ["groente", "asperges"], seasonMonths: [4, 5, 6] },
  { key: "pompoen", label: "Pompoen", category: "groente", matchTokens: ["groente"], seasonMonths: [9, 10, 11] },
  { key: "courgette", label: "Courgette", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] },
  { key: "boerenkool", label: "Boerenkool", category: "groente", matchTokens: ["groente"], seasonMonths: [11, 12, 1, 2] },
  { key: "spruiten", label: "Spruitjes", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2] },
  { key: "winterpeen", label: "Winterpeen", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2] },
  { key: "radijs", label: "Radijs", category: "groente", matchTokens: ["groente"], seasonMonths: [4, 5, 6] },
  { key: "stamppotgroente", label: "Stamppotgroente", category: "groente", matchTokens: ["groente"], seasonMonths: [11, 12, 1, 2] },
  // Fruit
  { key: "fruit", label: "Vers fruit", category: "fruit", matchTokens: ["fruit"] },
  { key: "aardbeien", label: "Aardbeien", category: "fruit", matchTokens: ["fruit", "aardbeien"], seasonMonths: [5, 6, 7, 8] },
  { key: "appels", label: "Appels", category: "fruit", matchTokens: ["fruit"], seasonMonths: [9, 10, 11] },
  { key: "peren", label: "Peren", category: "fruit", matchTokens: ["fruit"], seasonMonths: [9, 10, 11] },
  { key: "kersen", label: "Kersen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7] },
  { key: "frambozen", label: "Frambozen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7, 8] },
  { key: "stoofperen", label: "Stoofperen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [10, 11, 12, 1] },
  { key: "rabarber", label: "Rabarber", category: "fruit", matchTokens: ["fruit", "groente"], seasonMonths: [4, 5, 6] },
  // Aardappelen
  { key: "aardappelen", label: "Aardappelen", category: "aardappelen", matchTokens: ["aardappelen"] },
  // Brood
  { key: "brood", label: "Brood", category: "brood", matchTokens: ["brood"] },
  // Zoet
  { key: "honing", label: "Honing", category: "zoet", matchTokens: ["honing"] },
  { key: "jam", label: "Jam", category: "zoet", matchTokens: ["jam", "fruit"] },
  // Dranken
  { key: "sap", label: "Vers sap", category: "dranken", matchTokens: ["sap", "fruit"] },
  { key: "bier", label: "Lokaal bier", category: "dranken", matchTokens: ["bier"], nix18: true },
  { key: "wijn", label: "Nederlandse wijn", category: "dranken", matchTokens: ["wijn"], nix18: true },
  // Overig
  { key: "noten", label: "Noten", category: "overig", matchTokens: ["noten"], seasonMonths: [9, 10, 11] },
  { key: "bloemen", label: "Bloemen", category: "overig", matchTokens: ["bloemen"] },
];

export function catalogItem(key: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.key === key);
}

export function itemsInSeason(month: number): CatalogItem[] {
  return CATALOG.filter((i) => i.seasonMonths?.includes(month));
}

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter((i) => i.label.toLowerCase().includes(q) || i.key.includes(q));
}
