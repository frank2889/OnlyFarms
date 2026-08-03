export type Producer = {
  id: number;
  slug: string;
  name: string;
  kind: string;
  isMember: boolean;
  address: string | null;
  postcode: string | null;
  city: string | null;
  province: string | null;
  lat: number | null;
  lng: number | null;
  products: string[];
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  organic: boolean | null;
  vendingMachine: boolean | null;
  description: string | null;
  status: string;
  lastVerifiedAt: Date | null;
  /** alleen gevuld bij afstand-queries */
  distanceKm?: number;
};

export type ListItem = {
  id: number;
  listId: number;
  catalogKey: string | null;
  label: string;
  qty: string | null;
  note: string | null;
  store: string | null;
  producerSlug: string | null;
  storeSuggestedBy: string | null;
  assignee: string | null;
  assigneeUserId: number | null;
  priority: string;
  dueAt: Date | null;
  checked: boolean;
  checkedAt: Date | null;
  position: number;
  createdAt: Date;
};

export type ShoppingList = {
  id: number;
  token: string;
  name: string;
  ownerUserId: number | null;
  householdId: number | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  categoryOrder: string[] | null;
};

export type ItemMatch = {
  catalogKey: string;
  /** verkoopt dit specifieke product (token-match op het item zelf) */
  exact: Producer[];
  /** suggestie: verkoopt de categorie, niet zeker of ze dit product hebben */
  category: Producer[];
  usedFallback: boolean;
};
