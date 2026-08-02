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

export const farmStatus = pgEnum("farm_status", [
  "actief",
  "seizoen",
  "gestopt",
  "onbevestigd",
]);

export const farms = pgTable(
  "farms",
  {
    id: serial("id").primaryKey(),
    // ID uit de bron-sheet; hierop wordt geüpsert zodat de sync idempotent is
    sourceId: integer("source_id").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
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
    status: farmStatus("status").notNull().default("onbevestigd"),
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
    index("farms_province_idx").on(t.province),
    index("farms_status_idx").on(t.status),
    index("farms_lat_lng_idx").on(t.lat, t.lng),
  ]
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
  farmId: integer("farm_id")
    .notNull()
    .references(() => farms.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  reporterEmail: text("reporter_email"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
