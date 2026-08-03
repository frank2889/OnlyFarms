import {
  bigint,
  boolean,
  unique,
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
    // Foto's (Vercel Blob-URL's); de eerste is de hoofdfoto
    photos: text("photos").array().notNull().default([]),
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
    // Google Places-koppeling: place_id mag permanent, tijden max 30 dagen cachen (TOS)
    googlePlaceId: text("google_place_id"),
    hoursSyncedAt: timestamp("hours_synced_at", { withTimezone: true }),
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

// Accounts + family accounts (huishoudens): iedereen in het huishouden
// ziet dezelfde lijsten en kan meedoen.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("gebruiker"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const householdMembers = pgTable(
  "household_members",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique("household_members_household_id_user_id_key").on(t.householdId, t.userId),
  ]
);

// Boodschappenlijsten (Bring-model): anoniem via geheime token-link, of
// gekoppeld aan een account/huishouden zodat het hele gezin ze ziet.
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  ownerUserId: integer("owner_user_id").references(() => users.id),
  householdId: integer("household_id").references(() => households.id),
  postcode: text("postcode"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  radiusKm: integer("radius_km").notNull().default(10),
  // eigen loopvolgorde van categorieen per lijst (Bring-klacht: vaste volgorde)
  categoryOrder: text("category_order").array(),
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
    // wie van het gezin de locatie aandroeg ("tip van ...")
    storeSuggestedBy: text("store_suggested_by"),
    assignee: text("assignee"),
    // gevalideerd gezinslid (alleen bij lijsten met een huishouden)
    assigneeUserId: integer("assignee_user_id").references(() => users.id),
    // dringend | normaal | kan-wachten (Bring-urgentie)
    priority: text("priority").notNull().default("normaal"),
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

// Accumulerende koophistorie voor slimme suggesties (swipe-deck, "eerder gekocht").
// Bewust los van list_items: "wis gekochte items" is destructief, dit niet.
export const boughtStats = pgTable(
  "bought_stats",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    householdId: integer("household_id").references(() => households.id, {
      onDelete: "set null",
    }),
    catalogKey: text("catalog_key").notNull(),
    times: integer("times").notNull().default(1),
    lastAt: timestamp("last_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("bought_stats_list_id_catalog_key_unique").on(t.listId, t.catalogKey),
    index("bought_stats_household_idx").on(t.householdId),
  ]
);

// Voorkeurssignaal per swipe (rechts = leuk, links = sla ik over): voedt de
// bèta-smaakmodus van het swipe-deck. Los van bought_stats, dat is "wat kocht
// je echt"; dit is "wat wil je wel/niet nog eens zien". Smaak is persoonlijk:
// ingelogd hoort een signaal bij de gebruiker (gezinsleden verschillen),
// anoniem bij de lijst (user_id NULL). Cascade op users: profiel = persoonsdata.
export const swipeSignals = pgTable(
  "swipe_signals",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    householdId: integer("household_id").references(() => households.id, {
      onDelete: "set null",
    }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    catalogKey: text("catalog_key").notNull(),
    likes: integer("likes").notNull().default(0),
    skips: integer("skips").notNull().default(0),
    lastAt: timestamp("last_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // NULLS NOT DISTINCT: anoniem (user NULL) telt als waarde, dus ook daar één rij per lijst+item
    unique("swipe_signals_list_id_catalog_key_user_id_unique")
      .on(t.listId, t.catalogKey, t.userId)
      .nullsNotDistinct(),
    index("swipe_signals_household_idx").on(t.householdId),
    index("swipe_signals_user_idx").on(t.userId),
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
    // Portaal-toegang: gekoppeld gebruikersaccount (één account, meerdere petten)
    userId: integer("user_id").unique().references(() => users.id),
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
  photoUrl: text("photo_url"),
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

// Weekmarkten (bron: OpenStreetMap, ODbL; aparte dataset met bronvermelding)
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  osmId: bigint("osm_id", { mode: "number" }).notNull().unique(),
  name: text("name").notNull(),
  city: text("city"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  daysText: text("days_text"),
  source: text("source").notNull().default("osm"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Meldingen van bezoekers ("klopt dit niet meer?") — de goedkoopste bron van actualiteit
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  producerId: integer("producer_id")
    .notNull()
    .references(() => producers.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  reporterEmail: text("reporter_email"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: integer("resolved_by").references(() => users.id),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
