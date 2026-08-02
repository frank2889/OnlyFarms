# OnlyFarms

Herbouw van [deboervinder.nl](https://deboervinder.nl): boerderijwinkels in Nederland op een kaart, maar dan met een echte database in plaats van een publieke Google Sheet die client-side wordt geparset.

**Stack:** Next.js (App Router) · Postgres + Drizzle ORM · Leaflet · Vercel

## Architectuur

- De bestaande Google Sheet blijft (voorlopig) de plek waar de redactie boerderijen beheert.
- Een sync-job (`/api/sync`, dagelijks via Vercel-cron) haalt de sheet op, normaliseert de data en upsert die in Postgres. De sheet hoeft dus **nooit meer publiek** te zijn voor bezoekers.
- Bezoekers krijgen data via `/api/farms` — alleen wat in het kaartbeeld past, gecachet op de CDN.
- Elke boerderij heeft verificatievelden (`status`, `source`, `last_verified_at`, `claimed_by_email`) plus een `reports`-tabel voor bezoekersmeldingen, als basis voor het actueel houden van de data.

## Verkopersplatform (Marktplaats-model)

Naast de boerderijwinkels-kaart kunnen **bedrijven** (KVK verplicht) zich aanmelden om producten aan te bieden. Bewuste ontwerpkeuzes om het platform buiten de voedselketen te houden:

- **Geen betalingen via het platform** — koper en verkoper regelen dat onderling. Daardoor geen DAC7-rapportageplicht en geen betaaldienstregels.
- **Verkoper is zelf verantwoordelijk** — als voedselondernemer met eigen KVK; dat akkoord wordt vastgelegd bij aanmelding (`accepted_terms_at`).
- **Selectieproces** — aanmelding via `/verkopen` → status `aangemeld` → handmatige beoordeling (voorlopig via de database-editor) → `goedgekeurd`/`afgewezen`.
- **Reviews zijn leidend** — gepubliceerde reviews bepalen de sortering in `/api/sellers`; slechte scores zijn de basis om een verkoper op `geschorst` te zetten. Reviews komen eerst in een moderatiewachtrij (`published=false`).

⚠️ Laat de gebruikersvoorwaarden (platformrol, aansprakelijkheid, verwijzing naar verantwoordelijkheden van de verkoper) door een jurist opstellen vóór livegang van dit deel.

## Setup (voor iedereen in het team)

Vereist: Node 22 (`nvm use` pakt de juiste versie via `.nvmrc`).

```bash
git clone <repo-url> && cd OnlyFarms
npm install
cp .env.example .env.local   # en vul de drie variabelen in (vraag Frank)
npm run db:push              # maakt de tabellen aan in Postgres
npm run import               # vult de database vanuit de sheet
npm run dev                  # http://localhost:3000
```

### Env-variabelen

| Variabele | Wat |
| --- | --- |
| `DATABASE_URL` | Postgres-connectiestring (Neon via de Vercel-integratie) |
| `SHEET_ID` | ID van de bron-sheet (tussen `/d/` en `/edit` in de URL) |
| `CRON_SECRET` | Geheim voor de sync-route; op Vercel als env-var zetten, cron stuurt hem automatisch mee |

## Samenwerken (branch-workflow)

We pushen **nooit rechtstreeks naar `main`** — alles gaat via een branch en een pull request. Zo werkt dat per klus:

```bash
git checkout main && git pull          # begin altijd vanaf de laatste main
git checkout -b jouw-naam/korte-omschrijving   # bijv. chimene/meldknop
# ... werken, committen (kleine commits met duidelijke boodschap) ...
git push -u origin jouw-naam/korte-omschrijving
gh pr create                           # of via de GitHub-site: "Compare & pull request"
```

Daarna kijkt iemand anders van het team naar je PR (review), de CI-check (lint + build) moet groen zijn, en dan pas mergen — via de knop op GitHub. Na het mergen: branch verwijderen en lokaal weer `git checkout main && git pull`.

Vuistregels:

- Eén PR = één onderwerp; liever drie kleine PR's dan één grote.
- Loop je vast met git? Niet forceren (`--force` e.d.) — vraag even in de groep.
- `main` moet altijd deploybaar zijn.

> Let op: technisch afdwingen dat niemand direct naar `main` pusht (branch protection) kan op een gratis account alleen bij publieke repos. Tot die tijd is dit een teamafspraak.

## Dagelijks werk

```bash
npm run import:dry   # sheet ophalen + normaliseren + kwaliteitsrapport, zonder DB
npm run import       # idem, maar schrijft ook naar de database
npm run db:generate  # na een schemawijziging: migratie genereren
npm run db:push      # schema naar de database pushen
npm run lint
```

De import is idempotent (upsert op `source_id`), dus vaker draaien kan geen kwaad. Boerderijen die uit de sheet verdwijnen worden niet verwijderd maar op status `onbevestigd` gezet.

## Belangrijkste mappen

```text
src/db/schema.ts        Drizzle-schema (farms + reports)
src/lib/sheet-sync.ts   Ophalen, normaliseren en upserten van sheet-data
scripts/import-sheet.ts CLI-import met --dry-run
src/app/api/farms/      Kaartdata per bounding box, met product/bio/automaat-filters
src/app/api/sync/       Dagelijkse sync (Vercel-cron, zie vercel.json)
src/app/kaart/          Kaartpagina (Leaflet, client-side)
```

## Deploy (Vercel)

1. Repo op GitHub, project importeren in Vercel.
2. Neon Postgres toevoegen via de Vercel Marketplace-integratie (zet `DATABASE_URL` automatisch).
3. `SHEET_ID` en `CRON_SECRET` als env-vars toevoegen.
4. Eén keer `npm run db:push` + `npm run import` draaien (lokaal, tegen de productie-DB).
5. De cron in `vercel.json` houdt de data daarna dagelijks bij.

## Nog te doen

- [ ] Admin-flow voor beoordelen van aanmeldingen en modereren van reviews (nu: database-editor)
- [ ] Verkoperspagina's (profiel + aanbod + reviews) en verkopers op de kaart
- [ ] KVK-nummer automatisch valideren (KVK API)
- [ ] Gebruikersvoorwaarden door jurist (platformrol!)
- [ ] Meldknop ("klopt dit niet meer?") die in `reports` schrijft
- [ ] Provincie/plaats-pagina's (server-side gerenderd, voor SEO)
- [ ] Product- en bio/automaat-filters in de kaart-UI (API ondersteunt ze al)
- [ ] Boeren hun vermelding laten claimen en bijwerken
- [ ] Bron-sheet op niet-openbaar zetten zodra de site live draait op Postgres
- [ ] Besluit over de 3 Belgische boerderijen in de data (nu zonder coördinaten geïmporteerd)
