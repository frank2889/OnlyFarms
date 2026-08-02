# OnlyFarms (werktitel)

Lokale-producenten-platform met **gedeelde boodschappenlijsten als kern** (Bring-model): maak samen je lijst met visuele producttegels, en zie per item welke boer, bakker of brouwer bij jou in de buurt het verkoopt. **Bewust géén kaart** — route via je eigen navigatie-app.

Volledig productplan: [docs/PLAN.md](docs/PLAN.md). Begon als herbouw van deboervinder.nl, die dit platform op termijn vervangt.

**Stack:** Next.js (App Router) · Postgres + Drizzle (Neon) · Tailwind v4 · Vercel · Pusher (realtime, optioneel) · Klaviyo (events, optioneel)

## Kernconcepten

- **Offline & app**: installeerbaar als PWA; de lijst opent offline (service worker) en wijzigingen zonder verbinding syncen zodra je weer online bent (let op: pagina herladen terwijl je offline bent verliest nog niet-gesyncte vinkjes — bekende v1-beperking).
- **Lijsten** (`/lijsten`, `/lijst/[token]`): meerdere lijsten, anoniem, delen via geheime link, samen afvinken (realtime via Pusher, anders polling), "onlangs gekocht", seizoenssuggesties. Lijst-links worden niet geïndexeerd (robots).
- **Matching**: per lijst-item tonen we producenten in de buurt (Haversine in SQL; straal instelbaar, fallback dichtstbijzijnde 5). **Gids vs. leden**: geïmporteerde vermeldingen zijn "gids"; alleen aangesloten leden (`producers.is_member`) staan bovenaan — gids eronder met claim-teaser.
- **Producenten**: alle KVK-producenten van eet/drinkwaar (`producers.kind`: boerderijwinkel, brouwerij, bakkerij…). SEO-pagina's: `/producent/[slug]` (JSON-LD), `/producenten` (zoeken op locatie + categorie), `/provincie/[slug]`, sitemap.
- **Huisstijl**: max 3 kleurfamilies (`terra`/`ink`/`cream`) als tokens in `globals.css` — enige plek met hexwaarden. Seizoensthema via `src/lib/season.ts`. **Geen emoji's; alleen SVG-iconen** (`src/components/icons.tsx`). Naam is werktitel → alles via `src/lib/brand.ts`. Teksten via `src/messages/nl.json` (i18n-klaar).
- **Platformrol**: geen betalingen, geen partij bij de verkoop (Marktplaats-model). Aanmelden als verkoper: `/verkopen` (KVK verplicht). Alcohol-items dragen een NIX18-markering.

## Setup (team)

Node 22 (`nvm use`).

```bash
npm install
cp .env.example .env.local   # DATABASE_URL invullen (vraag Frank)
npm run dev                  # http://localhost:3000
```

De database (Neon, via Vercel) bevat al 2.279 producenten. Alleen bij een verse database: `npm run db:push && npm run import` (eenmalige seed uit de oude sheet) en `npx tsx scripts/data-quality.ts`.

### Env-variabelen

| Variabele | Verplicht | Wat |
| --- | --- | --- |
| `DATABASE_URL` | ja | Postgres (Neon) |
| `SHEET_ID` | nee | alleen voor de eenmalige seed |
| `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER` | nee | realtime lijsten; zonder keys valt de UI terug op polling |
| `KLAVIYO_PRIVATE_KEY` | nee | server-side events voor Sally's flows; zonder key wordt niets verstuurd |

## Samenwerken (branch-workflow)

Nooit rechtstreeks naar `main` — branch + pull request, iemand anders reviewt, CI (lint + build) moet groen. Branch protection staat aan. Per klus:

```bash
git checkout main && git pull
git checkout -b jouw-naam/korte-omschrijving
git push -u origin jouw-naam/korte-omschrijving && gh pr create
```

Rollen: Frank (dev), Chimene (socials), Sally (Klaviyo-automations).

## Scripts

```bash
npm run dev / build / lint
npm run db:generate / db:push      # schema-wijzigingen
npm run import                     # eenmalige seed uit oude sheet
npx tsx scripts/data-quality.ts    # producten afleiden, geocoden, dedupe-rapport
```

## Belangrijkste mappen

```text
src/lib/brand.ts         naam/tagline (werktitel — nergens hardcoden)
src/lib/catalog.ts       item-catalogus (tegels) incl. NIX18 en seizoen
src/lib/season.ts        seizoensthema (accenten + seizoensitems)
src/lib/i18n.ts + src/messages/nl.json   teksten
src/lib/queries/         producers (afstand/matching) en lists
src/app/lijst(en)/       lijsten-UI + server actions
src/app/producent(en)/   SEO-pagina's + meldknop
src/db/schema.ts         producers, lists, list_items, sellers, offers, reports
scripts/                 seed, migratie, datakwaliteit
```

## Roadmap (kort)

**UX-uitgangspunt: Bring is de lat.** Bij twijfel over interactieontwerp doen we wat Bring doet (tegels, toggle, long-press voor aantal, gedeelde lijsten) — en wijken we alleen af waar lokaal-kopen erom vraagt.


- **Fase 2**: accounts (Auth.js magic link + Google), profielen (bezocht/ervaringen/wishlist), foto's (Vercel Blob), KVK-API-validatie, admin-scherm, web-push.
- **Verkenning (Chimene)**: mensen willen niet naar 5 plekken — antwoorden: slimme dekking (minder stops), marktstandplaatsen (één plek, veel producenten), en mogelijk supermarkt-alternatieven aanraden met schone ingrediënten/zonder toevoegingen (databron: Open Food Facts, open data) — let op: verbreedt de missie, bewust besluiten.
- **Fase 3**: **marktstandplaatsen per producent** (weekmarkten als locaties — zo krijgt de stad wél aanbod op loopafstand, op de juiste dag), slimme dekking ("dit lid dekt 5 van je 7 items"), lijstsjablonen, recepten-import, aanbiedingen van leden (incl. locatiegebonden melding "de kaas waar je nu bent is goedkoper" — bij openen van de app op een andere plek via web, echte achtergrond-geofencing pas in de native app), deboervinder-migratie (301's), Skal/KVK-SBI-databronnen.
- **Vóór launch**: definitieve naam + domein, voorwaarden via jurist, Neon naar EU-regio, Plausible + GA4, **Pusher-keys aanmaken** (gratis account; vier env-vars in Vercel — dan is samen afvinken echt realtime i.p.v. 10s-polling).
