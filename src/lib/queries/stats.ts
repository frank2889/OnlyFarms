import { sql } from "drizzle-orm";
import { db } from "@/db";

// Cijfers voor het beheer-dashboard. KPI-definities zijn gelijk aan
// scripts/data-quality.ts (met_producten, met_coords) zodat de getallen
// overal hetzelfde zijn.

export type QueueCounts = {
  openReports: number;
  pendingSellers: number;
  pendingReviews: number;
  pendingOffers: number;
};

export async function queueCounts(): Promise<QueueCounts> {
  const result = await db.execute(sql`
    select
      (select count(*) from reports where resolved = false) as open_reports,
      (select count(*) from sellers where status in ('aangemeld', 'in_beoordeling')) as pending_sellers,
      (select count(*) from seller_reviews where published = false) as pending_reviews,
      (select count(*) from offers where published = false)
        + (select coalesce(sum(cardinality(photos_pending)), 0) from producers) as pending_offers
  `);
  const row = result.rows[0] as Record<string, unknown>;
  return {
    openReports: Number(row.open_reports),
    pendingSellers: Number(row.pending_sellers),
    pendingReviews: Number(row.pending_reviews),
    pendingOffers: Number(row.pending_offers),
  };
}

export type AdminStats = {
  producers: {
    totaal: number;
    actief: number;
    seizoen: number;
    gestopt: number;
    onbevestigd: number;
    leden: number;
    metProducten: number;
    metCoords: number;
  };
  sellers: {
    aangemeld: number;
    inBeoordeling: number;
    goedgekeurd: number;
    afgewezen: number;
    geschorst: number;
  };
  community: { users: number; households: number; lists: number; items: number };
  growth: {
    users7: number;
    users30: number;
    lists7: number;
    lists30: number;
    sellers7: number;
    sellers30: number;
    reports7: number;
    reports30: number;
  };
};

export async function adminStats(): Promise<AdminStats> {
  const [producersRes, sellersRes, communityRes, growthRes] = await Promise.all([
    db.execute(sql`
      select
        count(*) as totaal,
        count(*) filter (where status = 'actief') as actief,
        count(*) filter (where status = 'seizoen') as seizoen,
        count(*) filter (where status = 'gestopt') as gestopt,
        count(*) filter (where status = 'onbevestigd') as onbevestigd,
        count(*) filter (where is_member) as leden,
        count(*) filter (where cardinality(products) > 0) as met_producten,
        count(*) filter (where lat is not null) as met_coords
      from producers
    `),
    db.execute(sql`
      select
        count(*) filter (where status = 'aangemeld') as aangemeld,
        count(*) filter (where status = 'in_beoordeling') as in_beoordeling,
        count(*) filter (where status = 'goedgekeurd') as goedgekeurd,
        count(*) filter (where status = 'afgewezen') as afgewezen,
        count(*) filter (where status = 'geschorst') as geschorst
      from sellers
    `),
    db.execute(sql`
      select
        (select count(*) from users) as users,
        (select count(*) from households) as households,
        (select count(*) from lists) as lists,
        (select count(*) from list_items) as items
    `),
    db.execute(sql`
      select
        (select count(*) from users where created_at >= now() - interval '7 days') as users7,
        (select count(*) from users where created_at >= now() - interval '30 days') as users30,
        (select count(*) from lists where created_at >= now() - interval '7 days') as lists7,
        (select count(*) from lists where created_at >= now() - interval '30 days') as lists30,
        (select count(*) from sellers where created_at >= now() - interval '7 days') as sellers7,
        (select count(*) from sellers where created_at >= now() - interval '30 days') as sellers30,
        (select count(*) from reports where created_at >= now() - interval '7 days') as reports7,
        (select count(*) from reports where created_at >= now() - interval '30 days') as reports30
    `),
  ]);

  const p = producersRes.rows[0] as Record<string, unknown>;
  const s = sellersRes.rows[0] as Record<string, unknown>;
  const c = communityRes.rows[0] as Record<string, unknown>;
  const g = growthRes.rows[0] as Record<string, unknown>;
  return {
    producers: {
      totaal: Number(p.totaal),
      actief: Number(p.actief),
      seizoen: Number(p.seizoen),
      gestopt: Number(p.gestopt),
      onbevestigd: Number(p.onbevestigd),
      leden: Number(p.leden),
      metProducten: Number(p.met_producten),
      metCoords: Number(p.met_coords),
    },
    sellers: {
      aangemeld: Number(s.aangemeld),
      inBeoordeling: Number(s.in_beoordeling),
      goedgekeurd: Number(s.goedgekeurd),
      afgewezen: Number(s.afgewezen),
      geschorst: Number(s.geschorst),
    },
    community: {
      users: Number(c.users),
      households: Number(c.households),
      lists: Number(c.lists),
      items: Number(c.items),
    },
    growth: {
      users7: Number(g.users7),
      users30: Number(g.users30),
      lists7: Number(g.lists7),
      lists30: Number(g.lists30),
      sellers7: Number(g.sellers7),
      sellers30: Number(g.sellers30),
      reports7: Number(g.reports7),
      reports30: Number(g.reports30),
    },
  };
}
