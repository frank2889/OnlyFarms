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
  assignee: string | null;
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
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
};

export type ItemMatch = {
  catalogKey: string;
  members: Producer[];
  guide: Producer[];
  usedFallback: boolean;
};
