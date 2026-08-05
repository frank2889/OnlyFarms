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
  | "vis"
  | "brood"
  | "zoet"
  | "dranken"
  | "overig"
  | "supermarkt";

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
  /** zoektermen die gebruikers typen maar niet in het label staan */
  synonyms?: string[];
};

export const CATEGORIES: CatalogCategory[] = [
  { key: "zuivel", label: "Melk & zuivel" },
  { key: "eieren", label: "Eieren" },
  { key: "kaas", label: "Kaas" },
  { key: "vlees", label: "Vlees" },
  { key: "groente", label: "Groente" },
  { key: "fruit", label: "Fruit" },
  { key: "aardappelen", label: "Aardappelen" },
  { key: "vis", label: "Vis" },
  { key: "brood", label: "Brood & bakker" },
  { key: "zoet", label: "Honing & zoet" },
  { key: "dranken", label: "Dranken" },
  { key: "overig", label: "Overig" },
  { key: "supermarkt", label: "Supermarkt" },
];

export const CATALOG: CatalogItem[] = [
  // Zuivel
  { key: "melk", label: "Verse melk", category: "zuivel", matchTokens: ["melk"] , synonyms: ["rauwe melk", "volle melk", "melktap"] },
  { key: "yoghurt", label: "Yoghurt", category: "zuivel", matchTokens: ["melk"] },
  { key: "kwark", label: "Kwark", category: "zuivel", matchTokens: ["melk"] },
  { key: "boter", label: "Roomboter", category: "zuivel", matchTokens: ["melk"] , synonyms: ["boter"] },
  { key: "ijs", label: "Boerderij-ijs", category: "zuivel", matchTokens: ["melk", "ijs"] },
  { key: "karnemelk", label: "Karnemelk", category: "zuivel", matchTokens: ["melk"] },
  { key: "slagroom", label: "Slagroom", category: "zuivel", matchTokens: ["melk"] },
  { key: "vla", label: "Vla", category: "zuivel", matchTokens: ["melk"] },
  { key: "geitenzuivel", label: "Geitenzuivel", category: "zuivel", matchTokens: ["melk", "geitenkaas"] },
  { key: "kefir", label: "Kefir", category: "zuivel", matchTokens: ["melk"] },
  // Eieren
  { key: "eieren", label: "Eieren", category: "eieren", matchTokens: ["eieren"] , synonyms: ["ei", "eitjes", "scharreleieren"] },
  // Kaas
  { key: "kaas", label: "Kaas", category: "kaas", matchTokens: ["kaas"] },
  { key: "geitenkaas", label: "Geitenkaas", category: "kaas", matchTokens: ["kaas", "geitenkaas"] },
  { key: "brie", label: "Zachte kaas & brie", category: "kaas", matchTokens: ["kaas"] },
  { key: "blauwekaas", label: "Blauwe kaas", category: "kaas", matchTokens: ["kaas"] },
  // Vlees
  { key: "rundvlees", label: "Rundvlees", category: "vlees", matchTokens: ["vlees"] , synonyms: ["biefstuk", "sudderlappen", "riblappen"] },
  { key: "varkensvlees", label: "Varkensvlees", category: "vlees", matchTokens: ["vlees"] , synonyms: ["karbonade", "speklap"] },
  { key: "kip", label: "Kip", category: "vlees", matchTokens: ["vlees"] , synonyms: ["kipfilet", "drumsticks"] },
  { key: "worst", label: "Worst", category: "vlees", matchTokens: ["vlees"] },
  { key: "lamsvlees", label: "Lamsvlees", category: "vlees", matchTokens: ["vlees"] },
  { key: "gehakt", label: "Gehakt", category: "vlees", matchTokens: ["vlees"] },
  { key: "spek", label: "Spek", category: "vlees", matchTokens: ["vlees"] },
  { key: "eend", label: "Eend", category: "vlees", matchTokens: ["vlees"] },
  { key: "kalkoen", label: "Kalkoen", category: "vlees", matchTokens: ["vlees"] },
  { key: "hamburgers", label: "Hamburgers", category: "vlees", matchTokens: ["vlees"] },
  { key: "saucijzen", label: "Saucijzen", category: "vlees", matchTokens: ["vlees"] },
  { key: "drogeworst", label: "Droge worst", category: "vlees", matchTokens: ["vlees"] , synonyms: ["salami", "fuet", "metworst"] },
  // Groente
  { key: "groente", label: "Verse groente", category: "groente", matchTokens: ["groente"] },
  { key: "tomaten", label: "Tomaten", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] },
  { key: "asperges", label: "Asperges", category: "groente", matchTokens: ["groente", "asperges"], seasonMonths: [4, 5, 6] },
  { key: "pompoen", label: "Pompoen", category: "groente", matchTokens: ["groente"], seasonMonths: [9, 10, 11] },
  { key: "courgette", label: "Courgette", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] },
  { key: "boerenkool", label: "Boerenkool", category: "groente", matchTokens: ["groente"], seasonMonths: [11, 12, 1, 2] },
  { key: "spruiten", label: "Spruitjes", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2] },
  { key: "winterpeen", label: "Winterpeen", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2] , synonyms: ["wortels", "wortel", "peen"] },
  { key: "radijs", label: "Radijs", category: "groente", matchTokens: ["groente"], seasonMonths: [4, 5, 6] },
  { key: "stamppotgroente", label: "Stamppotgroente", category: "groente", matchTokens: ["groente"], seasonMonths: [11, 12, 1, 2] , synonyms: ["stamppot", "hutspot"] },
  { key: "sla", label: "Sla", category: "groente", matchTokens: ["groente"], seasonMonths: [5, 6, 7, 8, 9] },
  { key: "komkommer", label: "Komkommer", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] },
  { key: "paprika", label: "Paprika", category: "groente", matchTokens: ["groente"], seasonMonths: [7, 8, 9, 10] },
  { key: "ui", label: "Uien", category: "groente", matchTokens: ["groente"] },
  { key: "knoflook", label: "Knoflook", category: "groente", matchTokens: ["groente"] , synonyms: ["look"] },
  { key: "prei", label: "Prei", category: "groente", matchTokens: ["groente"], seasonMonths: [9, 10, 11, 12, 1, 2, 3] },
  { key: "broccoli", label: "Broccoli", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9, 10] },
  { key: "bloemkool", label: "Bloemkool", category: "groente", matchTokens: ["groente"], seasonMonths: [5, 6, 7, 8, 9, 10] },
  { key: "bieten", label: "Rode bieten", category: "groente", matchTokens: ["groente"], seasonMonths: [7, 8, 9, 10, 11] },
  { key: "sperziebonen", label: "Sperziebonen", category: "groente", matchTokens: ["groente"], seasonMonths: [7, 8, 9] },
  { key: "paddenstoelen", label: "Paddenstoelen", category: "groente", matchTokens: ["groente", "paddenstoelen"], seasonMonths: [9, 10, 11] },
  { key: "kruiden", label: "Verse kruiden", category: "groente", matchTokens: ["groente", "kruiden"] },
  { key: "moestuinplantjes", label: "Moestuinplantjes", category: "groente", matchTokens: ["groente", "bloemen"], seasonMonths: [3, 4, 5] , synonyms: ["plantjes", "zaailingen", "stekjes"] },
  { key: "spinazie", label: "Spinazie", category: "groente", matchTokens: ["groente"], seasonMonths: [4, 5, 6, 9, 10] },
  { key: "andijvie", label: "Andijvie", category: "groente", matchTokens: ["groente"], seasonMonths: [5, 6, 7, 8, 9, 10] },
  { key: "witlof", label: "Witlof", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2, 3] },
  { key: "rodekool", label: "Rode kool", category: "groente", matchTokens: ["groente"], seasonMonths: [9, 10, 11, 12, 1, 2] },
  { key: "spitskool", label: "Spitskool", category: "groente", matchTokens: ["groente"], seasonMonths: [5, 6, 7, 8, 9] },
  { key: "snijbonen", label: "Snijbonen", category: "groente", matchTokens: ["groente"], seasonMonths: [7, 8, 9] },
  { key: "doperwten", label: "Doperwten", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7] },
  { key: "tuinbonen", label: "Tuinbonen", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7] },
  { key: "mais", label: "Ma\u00efs", category: "groente", matchTokens: ["groente"], seasonMonths: [8, 9, 10] },
  { key: "pastinaak", label: "Pastinaak", category: "groente", matchTokens: ["groente"], seasonMonths: [10, 11, 12, 1, 2] },
  { key: "knolselderij", label: "Knolselderij", category: "groente", matchTokens: ["groente"], seasonMonths: [9, 10, 11, 12, 1, 2] },
  { key: "snoeptomaatjes", label: "Snoeptomaatjes", category: "groente", matchTokens: ["groente"], seasonMonths: [6, 7, 8, 9] , synonyms: ["cherrytomaatjes", "kerstomaatjes"] },
  // Fruit
  { key: "fruit", label: "Vers fruit", category: "fruit", matchTokens: ["fruit"] },
  { key: "aardbeien", label: "Aardbeien", category: "fruit", matchTokens: ["fruit", "aardbeien"], seasonMonths: [5, 6, 7, 8] },
  { key: "appels", label: "Appels", category: "fruit", matchTokens: ["fruit"], seasonMonths: [9, 10, 11] },
  { key: "peren", label: "Peren", category: "fruit", matchTokens: ["fruit"], seasonMonths: [9, 10, 11] },
  { key: "kersen", label: "Kersen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7] },
  { key: "frambozen", label: "Frambozen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7, 8] },
  { key: "stoofperen", label: "Stoofperen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [10, 11, 12, 1] },
  { key: "rabarber", label: "Rabarber", category: "fruit", matchTokens: ["fruit", "groente"], seasonMonths: [4, 5, 6] },
  { key: "druiven", label: "Druiven", category: "fruit", matchTokens: ["fruit", "wijn"], seasonMonths: [9, 10] },
  { key: "bessen", label: "Rode bessen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7, 8] },
  { key: "bramen", label: "Bramen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [7, 8, 9] },
  { key: "pruimen", label: "Pruimen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [8, 9] },
  { key: "meloen", label: "Meloen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [7, 8, 9] },
  { key: "blauwebessen", label: "Blauwe bessen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [7, 8, 9] },
  { key: "kruisbessen", label: "Kruisbessen", category: "fruit", matchTokens: ["fruit"], seasonMonths: [6, 7] },
  // Aardappelen
  { key: "aardappelen", label: "Aardappelen", category: "aardappelen", matchTokens: ["aardappelen"], synonyms: ["piepers", "krieltjes", "pieper"] },
  // Vis
  { key: "forel", label: "Verse forel", category: "vis", matchTokens: ["vis"] },
  { key: "paling", label: "Gerookte paling", category: "vis", matchTokens: ["vis"] },
  { key: "zalmforel", label: "Zalmforel", category: "vis", matchTokens: ["vis"] },
  // Brood
  { key: "brood", label: "Brood", category: "brood", matchTokens: ["brood"] },
  { key: "croissant", label: "Croissants", category: "brood", matchTokens: ["brood"] },
  { key: "stokbrood", label: "Stokbrood", category: "brood", matchTokens: ["brood"] },
  { key: "taart", label: "Taart & gebak", category: "brood", matchTokens: ["brood"] },
  { key: "koekjes", label: "Koekjes", category: "brood", matchTokens: ["brood"] },
  { key: "volkorenbrood", label: "Volkorenbrood", category: "brood", matchTokens: ["brood"] },
  { key: "speltbrood", label: "Speltbrood", category: "brood", matchTokens: ["brood"] },
  { key: "roggebrood", label: "Roggebrood", category: "brood", matchTokens: ["brood"] },
  { key: "krentenbrood", label: "Krentenbrood", category: "brood", matchTokens: ["brood"] },
  { key: "ontbijtkoek", label: "Ontbijtkoek", category: "brood", matchTokens: ["brood"] },
  { key: "appeltaart", label: "Appeltaart", category: "brood", matchTokens: ["brood", "fruit"] , synonyms: ["taart", "gebak"] },
  // Zoet
  { key: "honing", label: "Honing", category: "zoet", matchTokens: ["honing"] , synonyms: ["imker"] },
  { key: "jam", label: "Jam", category: "zoet", matchTokens: ["jam", "fruit"] },
  { key: "appelstroop", label: "Appelstroop", category: "zoet", matchTokens: ["jam", "fruit"] },
  { key: "stroopwafels", label: "Stroopwafels", category: "zoet", matchTokens: ["brood"] },
  { key: "honingraat", label: "Honingraat", category: "zoet", matchTokens: ["honing"] },
  { key: "chocolade", label: "Chocolade", category: "zoet", matchTokens: [] },
  // Dranken
  { key: "sap", label: "Vers sap", category: "dranken", matchTokens: ["sap", "fruit"] },
  { key: "bier", label: "Lokaal bier", category: "dranken", matchTokens: ["bier"], nix18: true , synonyms: ["speciaalbier", "pils"] },
  { key: "wijn", label: "Nederlandse wijn", category: "dranken", matchTokens: ["wijn"], nix18: true },
  { key: "cider", label: "Cider", category: "dranken", matchTokens: ["bier", "fruit"], nix18: true },
  { key: "appelsap", label: "Appelsap", category: "dranken", matchTokens: ["sap", "fruit"] },
  { key: "perensap", label: "Perensap", category: "dranken", matchTokens: ["sap", "fruit"] },
  { key: "siroop", label: "Limonadesiroop", category: "dranken", matchTokens: ["sap", "fruit"] },
  { key: "kruidenthee", label: "Kruidenthee", category: "dranken", matchTokens: ["kruiden"] , synonyms: ["thee"] },
  { key: "koffie", label: "Koffie (branderij)", category: "dranken", matchTokens: [] , synonyms: ["koffiebonen", "bonen"] },
  // Overig
  { key: "noten", label: "Noten", category: "overig", matchTokens: ["noten"], synonyms: ["noot"], seasonMonths: [9, 10, 11] },
  { key: "kastanjes", label: "Kastanjes", category: "overig", matchTokens: ["noten"], seasonMonths: [10, 11] },
  { key: "meel", label: "Meel & bloem", category: "overig", matchTokens: ["meel", "brood"] },
  { key: "mosterd", label: "Mosterd", category: "overig", matchTokens: ["streekproducten"] },
  { key: "koolzaadolie", label: "Koolzaadolie", category: "overig", matchTokens: ["streekproducten"] },
  { key: "azijn", label: "Azijn", category: "overig", matchTokens: ["streekproducten"] },
  { key: "pesto", label: "Pesto", category: "overig", matchTokens: ["streekproducten", "kruiden"] },
  { key: "soep", label: "Verse soep", category: "overig", matchTokens: ["groente"] },
  { key: "zuurkool", label: "Zuurkool", category: "overig", matchTokens: ["groente"] },
  { key: "hazelnoten", label: "Hazelnoten", category: "overig", matchTokens: ["noten"], synonyms: ["hazelnoot"], seasonMonths: [9, 10] },
  { key: "walnoten", label: "Walnoten", category: "overig", matchTokens: ["noten"], synonyms: ["walnoot"], seasonMonths: [9, 10] },
  { key: "amandelen", label: "Amandelen", category: "overig", matchTokens: ["noten"] },
  { key: "cashewnoten", label: "Cashewnoten", category: "overig", matchTokens: ["noten"], synonyms: ["cashewnoot"] },
  { key: "pinda", label: "Pinda's", category: "overig", matchTokens: ["noten"], synonyms: ["pinda's", "pindas"] },
  { key: "zonnebloempitten", label: "Zonnebloempitten", category: "overig", matchTokens: ["zaden"] },
  { key: "pompoenpitten", label: "Pompoenpitten", category: "overig", matchTokens: ["zaden"] },
  { key: "lijnzaad", label: "Lijnzaad", category: "overig", matchTokens: ["zaden"] },
  { key: "chiazaad", label: "Chiazaad", category: "overig", matchTokens: ["zaden"] },
  { key: "sesamzaad", label: "Sesamzaad", category: "overig", matchTokens: ["zaden"] },
  { key: "bloemen", label: "Bloemen", category: "overig", matchTokens: ["bloemen"] },
  // Supermarkt: geen producent-matching, wel op je lijst (zodat dit je enige lijst-app is)
  { key: "pasta", label: "Pasta", category: "supermarkt", matchTokens: [] },
  { key: "rijst", label: "Rijst", category: "supermarkt", matchTokens: [] },
  { key: "muesli", label: "Muesli & granen", category: "supermarkt", matchTokens: [] },
  { key: "suiker", label: "Suiker", category: "supermarkt", matchTokens: [] },
  { key: "zout", label: "Zout", category: "supermarkt", matchTokens: [] },
  { key: "peper", label: "Peper", category: "supermarkt", matchTokens: [] },
  { key: "pindakaas", label: "Pindakaas", category: "supermarkt", matchTokens: [] , synonyms: ["pinda"] },
  { key: "hagelslag", label: "Hagelslag", category: "supermarkt", matchTokens: [] , synonyms: ["vlokken", "chocoladehagel"] },
  { key: "chips", label: "Chips", category: "supermarkt", matchTokens: [] },
  { key: "water", label: "Water", category: "supermarkt", matchTokens: [] },
  { key: "frisdrank", label: "Frisdrank", category: "supermarkt", matchTokens: [] , synonyms: ["cola", "sinas", "limonade", "sisi"] },
  { key: "wcpapier", label: "Wc-papier", category: "supermarkt", matchTokens: [] , synonyms: ["toiletpapier", "wc papier"] },
  { key: "keukenrol", label: "Keukenrol", category: "supermarkt", matchTokens: [] },
  { key: "schoonmaak", label: "Schoonmaak", category: "supermarkt", matchTokens: [] , synonyms: ["allesreiniger", "schoonmaakmiddel", "reiniger"] },
  { key: "wasmiddel", label: "Wasmiddel", category: "supermarkt", matchTokens: [] , synonyms: ["wasgel", "waspoeder"] },
  { key: "vuilniszakken", label: "Vuilniszakken", category: "supermarkt", matchTokens: [] , synonyms: ["afvalzakken"] },
  { key: "zeep", label: "Zeep", category: "supermarkt", matchTokens: [] },
  { key: "shampoo", label: "Shampoo", category: "supermarkt", matchTokens: [] },
  { key: "tandpasta", label: "Tandpasta", category: "supermarkt", matchTokens: [] },
  { key: "luiers", label: "Luiers", category: "supermarkt", matchTokens: [] },
];

/** Gecureerde basisboodschappen: vult het swipe-deck voor gebruikers zonder historie */
export const BASICS: string[] = [
  "melk",
  "eieren",
  "brood",
  "kaas",
  "boter",
  "yoghurt",
  "appels",
  "aardappelen",
  "ui",
  "tomaten",
  "sla",
  "gehakt",
  "kip",
  "sap",
  "jam",
];

// Voorbeeldlijst (CRO #7): populaire items met brede lokale dekking, zodat een
// nieuwe gebruiker meteen matches ziet zonder eerst te hoeven typen.
export const SAMPLE_LIST: string[] = [
  "melk",
  "eieren",
  "brood",
  "kaas",
  "boter",
  "appels",
  "aardappelen",
  "tomaten",
];

export function catalogItem(key: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.key === key);
}

/** Alle geldige producten-tokens (waarop de matching daadwerkelijk kijkt) */
export const KNOWN_TOKENS: string[] = [
  ...new Set(CATALOG.flatMap((item) => item.matchTokens)),
].sort();

/**
 * Tokens gegroepeerd per categorie, voor een chip-picker. Een token hoort bij
 * de categorie van "zijn" catalogusitem (waar token === item.key); tokens
 * zonder zo'n zelfdefiniërend item (bijv. "zaden", "streekproducten") krijgen
 * de categorie van het eerste item waarin ze voorkomen.
 */
export function tokensByCategory(): { category: CategoryKey; label: string; tokens: string[] }[] {
  const byToken = new Map<string, CategoryKey>();
  for (const item of CATALOG) {
    for (const token of item.matchTokens) {
      if (!byToken.has(token) || item.key === token) byToken.set(token, item.category);
    }
  }
  const grouped = new Map<CategoryKey, Set<string>>();
  for (const [token, category] of byToken) {
    if (!grouped.has(category)) grouped.set(category, new Set());
    grouped.get(category)!.add(token);
  }
  return CATEGORIES.filter((c) => grouped.has(c.key)).map((c) => ({
    category: c.key,
    label: c.label,
    tokens: [...grouped.get(c.key)!].sort(),
  }));
}

/**
 * Catalogusitems gegroepeerd per categorie, voor een aanbod-item-picker
 * (item-niveau, niet token-niveau zoals tokensByCategory). Alleen items met
 * matchTokens: een leeg-matchTokens-item (bijv. categorie Supermarkt) matcht
 * toch nooit, dus die aanbieden zou een keuze zijn die nergens toe leidt.
 */
export function catalogByCategory(): {
  category: CategoryKey;
  label: string;
  items: { key: string; label: string }[];
}[] {
  const grouped = new Map<CategoryKey, { key: string; label: string }[]>();
  for (const item of CATALOG) {
    if (item.matchTokens.length === 0) continue;
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category)!.push({ key: item.key, label: item.label });
  }
  return CATEGORIES.filter((c) => grouped.has(c.key)).map((c) => ({
    category: c.key,
    label: c.label,
    items: grouped.get(c.key)!,
  }));
}

/** Producten-token van een producent naar het best passende catalogusitem */
export function itemForToken(token: string): CatalogItem | undefined {
  return (
    CATALOG.find((i) => i.key === token) ??
    CATALOG.find((i) => i.matchTokens.includes(token))
  );
}

export function itemsInSeason(month: number): CatalogItem[] {
  return CATALOG.filter((i) => i.seasonMonths?.includes(month));
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Accent-ongevoelig zoeken met rangschikking: exact begin > woordbegin > bevat.
 * Synoniemen tellen mee ("piepers" vindt aardappelen).
 */
export function searchCatalog(query: string): CatalogItem[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const scored: { item: CatalogItem; score: number }[] = [];
  for (const item of CATALOG) {
    const haystacks = [item.label, item.key, ...(item.synonyms ?? [])].map(normalize);
    let score = 0;
    for (const h of haystacks) {
      if (h === q) score = Math.max(score, 5);
      else if (h.startsWith(q)) score = Math.max(score, 4);
      else if (h.split(/[\s-]/).some((w) => w.startsWith(q))) score = Math.max(score, 3);
      else if (q.length >= 3 && h.includes(q)) score = Math.max(score, 1);
    }
    if (score > 0) scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.item.label.length - b.item.label.length)
    .map((s) => s.item);
}
