# OnlyFarms (werktitel)

Lokale-producenten-platform met **gedeelde boodschappenlijsten als kern** (Bring-model): maak samen je lijst met visuele producttegels, en zie per item welke boer, bakker of brouwer bij jou in de buurt het verkoopt. **Bewust géén kaart** — route via je eigen navigatie-app.

Volledig productplan: [docs/PLAN.md](docs/PLAN.md). Begon als herbouw van deboervinder.nl, die dit platform op termijn vervangt.

**Stack:** Next.js (App Router) · Postgres + Drizzle (Neon) · Tailwind v4 · Vercel · Pusher (realtime, optioneel) · Klaviyo (events, optioneel)

## Kernconcepten

- **Offline & app**: installeerbaar als PWA; de lijst opent offline (service worker) en wijzigingen zonder verbinding syncen zodra je weer online bent (let op: pagina herladen terwijl je offline bent verliest nog niet-gesyncte vinkjes — bekende v1-beperking).
- **Cart-drawer-model**: de lijstpagina is een "winkel" (tegelwand centraal); je lijst is een drawer die je opent met de Lijst-tab. Toevoegen via de vaste balk onderin, die een zoek-overlay opent met het veld bovenaan (toetsenbord zit nooit in de weg). Tik = toevoegen, nog een tik = eentje extra (teller), vasthouden = aantal kiezen of verwijderen. Afvinken toont eerst een vinkje, dan schuift het item naar gekocht. Lijsten zijn te hernoemen en verwijderen via het lijstmenu.
- **Swipen**: eigen tab met een kaarten-deck (Tinder-patroon) om je vaste boodschappen snel op de lijst te zetten: rechts = toevoegen, links = overslaan, grote knoppen als alternatief. Volgorde: eerder gekocht (frequentie, wisbestendig via `bought_stats`), dan seizoen, dan een basisset voor nieuwe gebruikers.
- **Lijsten** (`/lijsten`, `/lijst/[token]`): meerdere lijsten, anoniem, delen via geheime link, samen afvinken (realtime via Pusher, anders polling), "vaak gekocht" (frequentie), seizoenssuggesties, urgentie per item, eigen categorie-volgorde per lijst. Lijst-links worden niet geïndexeerd (robots).
- **Matching in twee lagen**: per item eerst producenten die het specifieke product aantoonbaar verkopen, daaronder categorie-suggesties, en de supermarkt-terugval onderaan; elke rij toont inline de beste tip. Tegels tonen "N in de buurt"-badges. Gids vs. leden: alleen aangesloten leden (`producers.is_member`) krijgen het leden-badge.
- **Openingstijden als status**: parser (`src/lib/opening-hours.ts`) begrijpt alle notaties uit de data (NL/EN-afkortingen, dag-lijsten, Dagelijks) en toont "Nu open, tot 17:00" / "Opent morgen om 09:00" in Europe/Amsterdam.
- **Weekmarkten**: 275 markten uit OpenStreetMap (ODbL, met bronvermelding) in een aparte `markets`-tabel; Ontdek toont de dichtstbijzijnde met marktdagen, status en route.
- **Producenten**: alle KVK-producenten van eet/drinkwaar (`producers.kind`: boerderijwinkel, brouwerij, bakkerij…). SEO-pagina's: `/producent/[slug]` (JSON-LD), `/producenten` (zoeken op locatie + categorie), `/provincie/[slug]`, sitemap.
- **Huisstijl**: max 3 kleurfamilies (`terra`/`ink`/`cream`) als tokens in `globals.css` — enige plek met hexwaarden. Seizoensthema via `src/lib/season.ts`. **Geen emoji's; alleen SVG-iconen** (`src/components/icons.tsx`). Naam is werktitel → alles via `src/lib/brand.ts`. Teksten via `src/messages/nl.json` (i18n-klaar).
- **Platformrol**: geen betalingen, geen partij bij de verkoop (Marktplaats-model). Aanmelden als verkoper: `/verkopen` (KVK verplicht). Alcohol-items dragen een NIX18-markering.
- **Beheer**: `/beheer` is het teambeheer (alleen accounts met rol "team"): dashboard met kerncijfers, meldingen afhandelen, verkopersaanmeldingen goedkeuren of afwijzen (goedkeuren koppelt aan een gids-vermelding of maakt er een aan), producenten bewerken (zet "laatst bevestigd"), duplicaten-wachtrij en ervaringen-moderatie. Niet geïndexeerd; werkt ook op telefoon.
- **Portaal**: `/portaal` is het bedrijfsprofiel voor aangesloten verkopers met een gekoppeld gebruikersaccount (koppeling door het team, of automatisch bij goedkeuring): aanmeldstatus, gegevens bewerken (telefoon, website, omschrijving, openingstijden, product-tokens), foto's uploaden (Vercel Blob, max 8, eerste = hoofdfoto) en producten beheren (titel, prijsindicatie, foto, beschikbaar; prikbord-model, geen betalingen). De publieke producentpagina toont de galerij en het aanbod. Eén account per persoon; petten bepalen de toegang.

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
| `BLOB_READ_WRITE_TOKEN` | nee | foto-uploads (Vercel Blob); zonder token geeft /api/upload een nette fout |

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
npx tsx scripts/import-markets.ts  # weekmarkten uit OpenStreetMap verversen
npx tsx scripts/google-sync.ts     # openingstijden via Google Places (vereist API-key; zie script)
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


- **Fase 2**: accounts (Auth.js magic link + Google), profielen (bezocht/ervaringen/wishlist), foto's (Vercel Blob), KVK-API-validatie, zelf-claim-flow voor het portaal (mailverificatie), web-push. Het beheer-scherm (`/beheer`) en portaal v1 (`/portaal`) zijn er al.
- **Verkenning (Chimene)**: mensen willen niet naar 5 plekken — antwoorden: slimme dekking (minder stops), marktstandplaatsen (één plek, veel producenten), en mogelijk supermarkt-alternatieven aanraden met schone ingrediënten/zonder toevoegingen (databron: Open Food Facts, open data) — let op: verbreedt de missie, bewust besluiten.
- **Fase 3**: **marktstandplaatsen per producent** (weekmarkten als locaties — zo krijgt de stad wél aanbod op loopafstand, op de juiste dag), slimme dekking ("dit lid dekt 5 van je 7 items"), lijstsjablonen, recepten-import, aanbiedingen van leden (incl. locatiegebonden melding "de kaas waar je nu bent is goedkoper" — bij openen van de app op een andere plek via web, echte achtergrond-geofencing pas in de native app), deboervinder-migratie (301's), Skal/KVK-SBI-databronnen.
- **Vóór launch**: definitieve naam + domein (onderzoek + shortlist: [docs/NAAMKEUZE.md](docs/NAAMKEUZE.md)), voorwaarden via jurist, Neon naar EU-regio, Plausible + GA4, **Pusher-keys aanmaken** (gratis account; vier env-vars in Vercel), **Google Places-sync activeren** (GOOGLE_MAPS_API_KEY; `scripts/google-sync.ts --match` eenmalig en `--refresh` maandelijks houdt openingstijden en gestopt-status actueel; ~$40-80 per maand bij volledige dekking, en de site moet dan "powered by Google" bij de tijden tonen — dan is samen afvinken echt realtime i.p.v. 10s-polling).
