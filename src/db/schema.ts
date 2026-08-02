import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const producerStatus = pgEnum("producer_status", [
  "actief",
  "seizoen",
  "gestopt",
  "onbevestigd",
]);

export const producerKind = pgEnum("producer_kind", [
  "boerderijwinkel",
  "brouwerij",
  "bakkerij",
  "imkerij",
  "wijngaard",
  "overig",
]);

// Alle lokale producenten. isMember scheidt de gids (geïmporteerd/redactie)
// van aangesloten leden — alleen leden draaien mee in de lijst-matching.
export const producers = pgTable(
  "producers",
  {
    id: serial("id").primaryKey(),
    // ID uit de bron-sheet; hierop is de eenmalige seed geüpsert
    sourceId: integer("source_id").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    kind: producerKind("kind").notNull().default("boerderijwinkel"),
    isMember: boolean("is_member").notNull().default(false),
    claimedBySellerId: integer("claimed_by_seller_id").references(
      () => sellers.id
    ),
    address: text("address"),
    postcode: text("postcode"),
    city: text("city"),
    province: text("province"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    products: text("products").array().notNull().default([]),
    openingHours: text("opening_hours"),
    phone: text("phone"),
    website: text("website"),
    organic: boolean("organic"),
    vendingMachine: boolean("vending_machine"),
    paymentMethods: text("payment_methods"),
    description: text("description"),
    status: producerStatus("status").notNull().default("onbevestigd"),
    source: text("source").notNull().default("sheet-import"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    claimedByEmail: text("claimed_by_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("producers_province_idx").on(t.province),
    index("producers_status_idx").on(t.status),
    index("producers_lat_lng_idx").on(t.lat, t.lng),
  ]
);

// Boodschappenlijsten (Bring-model): anoniem, gedeeld via geheime token-link.
// In fase 2 komt hier een koppeling met users/list_members bij.
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  postcode: text("postcode"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  radiusKm: integer("radius_km").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const listItems = pgTable(
  "list_items",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    catalogKey: text("catalog_key"),
    label: text("label").notNull(),
    qty: text("qty"),
    note: text("note"),
    // Taakverdeling: waar halen (vrije tekst of gekozen producent), wie, uiterlijk wanneer
    store: text("store"),
    producerSlug: text("producer_slug"),
    assignee: text("assignee"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    checked: boolean("checked").notNull().default(false),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("list_items_list_idx").on(t.listId, t.checked)]
);

// Aangesloten verkopers: bedrijven (KVK verplicht) die via het platform
// producten aanbieden. Het platform is alleen prikbord — geen betalingen,
// geen logistiek; de verkoper is als voedselondernemer zelf verantwoordelijk.
export const sellerStatus = pgEnum("seller_status", [
  "aangemeld",
  "in_beoordeling",
  "goedgekeurd",
  "afgewezen",
  "geschorst",
]);

export const sellers = pgTable(
  "sellers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    kvkNumber: text("kvk_number").notNull().unique(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    address: text("address"),
    city: text("city").notNull(),
    postcode: text("postcode"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    bio: text("bio"),
    // Selectieproces: wat wil je aanbieden en waarom
    motivation: text("motivation").notNull(),
    acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
    status: sellerStatus("status").notNull().default("aangemeld"),
    statusReason: text("status_reason"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sellers_status_idx").on(t.status)]
);

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => sellers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category"),
  description: text("description"),
  // Indicatie als tekst ("€3 per doos") — het platform verwerkt geen betalingen
  priceIndication: text("price_indication"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Reviews zijn leidend voor zichtbaarheid en voor schorsing van verkopers.
// Publicatie pas na moderatie.
export const sellerReviews = pgTable(
  "seller_reviews",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    reviewerName: text("reviewer_name").notNull(),
    reviewerEmail: text("reviewer_email").notNull(),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("seller_reviews_seller_idx").on(t.sellerId, t.published)]
);

// Meldingen van bezoekers ("klopt dit niet meer?") — de goedkoopste bron van actualiteit
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  producerId: integer("producer_id")
    .notNull()
    .references(() => producers.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  reporterEmail: text("reporter_email"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
