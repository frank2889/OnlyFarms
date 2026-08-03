<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OnlyFarms (werktitel) — projectkennis

Lokale-producenten-platform met **gedeelde boodschappenlijsten (Bring-model) als kern**: lijst maken → per item zien welke lokale producent het in de buurt verkoopt → samen afvinken. Geen kaart, nergens. Volledig productplan en status: [docs/PLAN.md](docs/PLAN.md); teamuitleg: [README.md](README.md).

Live: https://onlyfarms-ten.vercel.app · Repo: github.com/frank2889/OnlyFarms (publiek!) · Team: Frank (dev), Chimene (socials), Sally (Klaviyo-automations).

## Harde regels (door Frank vastgelegd)

1. **Bring is de UX-lat.** Bij elke interactievraag: doe wat de Bring-app doet (tegel-toggle, long-press = aantal, undo, sticky zoeken, bottom-nav). Nooit hun assets/code kopiëren — alleen patronen. Toegankelijk voor oudere gebruikers: grote tikvlakken, leesbare labels, contrast.
2. **Geen emoji's, nergens.** Alleen eigen SVG-iconen: UI-iconen in `src/components/icons.tsx` (lijnstijl), item-iconen in `src/components/food-icons.tsx` (gevuld, twee-tonig via currentColor + CSS-vars). Elk catalogusitem een eigen, onderscheidend silhouet.
3. **Max 3 kleurfamilies**: `terra`/`ink`/`cream` als tokens in `src/app/globals.css` — de enige plek met hexwaarden. Geen dark mode (bewust licht). Seizoensaccenten via `src/lib/season.ts`.
4. **Naam is werktitel**: alles via `src/lib/brand.ts`, nergens "OnlyFarms" hardcoden.
5. **Alle UI-teksten** in `src/messages/nl.json` via `t()` uit `src/lib/i18n.ts` (i18n-klaar).
6. **Alles moet instant voelen**: optimistic UI is de norm (zie `act()` + `useOptimistic` in `src/components/ListView.tsx`); offline wacht een actie op reconnect i.p.v. te falen.
7. **Geen em-dashes** in gebruikersteksten; vervang door punt, komma of dubbele punt.
8. **Cart-drawer-model**: de lijst is een drawer (winkelwagen-patroon), de tegelwand is de "winkel"; toevoegen kan overal via de vaste onderbalk en vanaf producentpagina's ("hier halen" vult de winkel in).
9. **Platformrol bewaken**: geen betalingen via het platform, geen partij bij de verkoop (buiten NVWA/DAC7 blijven). Alcohol-items dragen `nix18: true`.

## Architectuur in het kort

- Next.js App Router + Tailwind v4 + Drizzle/Neon Postgres + Vercel. Auth.js (credentials/scrypt) met **gezinnen (family accounts)**: `households` + `household_members`; lijsten hangen aan eigenaar én gezin. Anonieme lijsten werken via geheime token-link (`/lijst/[token]`, uitgesloten in robots).
- **Gids vs. leden**: `producers.is_member` scheidt de 2.279 geïmporteerde gids-records van aangesloten leden; alleen leden bovenaan in matching, gids eronder met claim-teaser.
- Matching: Haversine in SQL (`src/lib/queries/producers.ts`), **twee lagen**: specifiek item-token (zeker) boven categorie-token (suggestie), supermarkt-terugval onderaan; items met lege `matchTokens` (categorie Supermarkt) worden bewust niet gematcht. Tegel-badges via `nearbyCountsByToken`.
- Openingstijden: `src/lib/opening-hours.ts` parset alle data-notaties (NL/EN-dagafkortingen, dag-lijsten "Tu,Sa", groepen "Mo-We, Fr", Dagelijks) naar een nu-status in Europe/Amsterdam; `daysSummary` geeft marktdagen ("di & za").
- Weekmarkten: aparte `markets`-tabel uit OpenStreetMap (`scripts/import-markets.ts`, ODbL: bronvermelding verplicht, aparte dataset houden); Overpass is soms overbelast, het script accepteert een lokaal JSON-bestand als argument.
- **Beheer**: `/beheer` is het teambeheer, alleen voor `users.role = "team"`. Autorisatie per request uit de DB via `requireAdminUser()` (`src/lib/authz.ts`, bewust niet in de JWT); **elke page én elke action checkt zelf** (layout is alleen defense-in-depth). Wachtrijen: meldingen (`reports` + afhandelvelden), aanmeldingen (sellers-statusmachine; goedkeuren vereist koppeling aan een gids-record of een nieuw record, en stuurt Klaviyo-events voor Sally), ervaringen (`published`-wachtrij), **aanbod-screening** (`/beheer/aanbod`: `offers.published` + `producers.photos_pending`; nieuw of inhoudelijk gewijzigd verkoper-aanbod en nieuwe foto's wachten op teamcontrole; publieke aanbod-query eist ook verkoper-status goedgekeurd), producentenbeheer (whitelist-update via `updateProducerAdmin`, zet altijd `last_verified_at`) en duplicaten. Producentpagina's revalideren via `revalidatePath("/producent/[slug]", "page")` (het pad zonder slug raakt de dynamische pagina's niet). Eigen shell: AppShell doet een early-return op `/beheer` en `/portaal`; robots-disallow op `/beheer`. `/inloggen?terug=<pad>` brengt je na het inloggen terug (alleen interne paden).
- **Accountfilosofie**: één account per persoon, petten bepalen de toegang (rol "gebruiker"/"team", verkoper via `sellers.user_id`); een boer is zelf ook klant. Team- en ledenomgeving blijven bewust gescheiden (harde veiligheidsgrens, per doelgroep één URL); eventueel later één slimme voordeur die op rol doorstuurt.
- **Portaal**: `/portaal` is de zelfbeheer-omgeving voor verkopers met een gekoppeld account (`requireSellerUser()` in authz.ts): bedrijfsprofiel met tabs Overzicht/Gegevens/Foto's/Producten. Koppelen doet het team in het beheer (of automatisch bij goedkeuring op e-mailmatch); zelf claimen met mailverificatie komt later. Bewerken kan alleen de eigen vermelding en alleen de subset telefoon/website/omschrijving/uren/producten (hergebruikt `AdminProducerForm` met `editableFields` + eigen action-prop); naam, adres en status blijven bij het team. Producten = de `offers`-tabel (prikbord-model, prijsindicatie als tekst, geen betalingen); publieke pagina toont galerij + Aanbod. Het overzicht toont "Vraag in jouw buurt" (`src/lib/queries/demand.ts`): open lijst-items binnen 10 km die de producent ook verkoopt, geanonimiseerd met drempel (pas tonen vanaf 3 lijsten, nooit wie).
- **Media**: Vercel Blob, store `onlyfarms-media` (`BLOB_READ_WRITE_TOKEN`, env-guarded). Upload alleen via `/api/upload` (verkoper of team, JPG/PNG/WebP, max 8 MB); server actions accepteren uitsluitend URL's uit onze eigen store (`isOwnBlobUrl`) — nooit externe URL's opslaan. `producers.photos text[]` (eerste = hoofdfoto, max 8) en `offers.photo_url`; bij verwijderen/vervangen ook `del()` op de blob (best-effort). `next.config.ts` heeft het remotePattern voor `*.public.blob.vercel-storage.com`.
- Realtime: Pusher (env-guarded, `src/lib/realtime.ts`) met 10s-polling-fallback. Klaviyo-events env-guarded in `src/lib/klaviyo.ts`.
- **Swipe-deck**: 4e nav-tab "Swipen" → `/lijst/[token]/swipen` (`SwipeDeck.tsx`, pointer events + dominante-as-check, `of-fly-*`-keyframes; knoppen-fallback verplicht). Twee modi via `SwipeModeSwitcher`: **winkelmodus** (pool = `bought_stats` + `itemsInSeason` + `BASICS`, willekeurig geschud) en **smaakmodus (bèta)** (pool = hele CATALOG, gewogen op `swipe_signals`). Elke swipe registreert een like/skip in `swipe_signals`: ingelogd per gebruiker (smaak is persoonlijk, gezinsleden verschillen), anoniem per lijst (unique is `NULLS NOT DISTINCT` op list+key+user). `bought_stats` blijft huishouden-breed (koophistorie is gedeeld, upsert in `setItemChecked`, wisbestendig). Open items uitgefilterd; terug-links vanaf het swipen gaan naar `#lijst` (opent de drawer). Tegelwand toont 6 tegels per categorie + "Toon alles".
- **Vlakbij-melding** (v1): `NearbyWatch.tsx` op de lijstpagina; instelling uit/500 m/1 km/2 km device-lokaal (`of_nearby_m`), `watchPosition` alleen met de pagina open, kandidaten = de al gematchte producenten uit `matches`, dedupe per producent per 4 uur (sessionStorage). Echte achtergrond-geofencing kan niet in een PWA: dat wordt de Expo-app.
- PWA: `src/app/manifest.ts` + `public/sw.js` (statisch cache-first, navigaties network-first met offline-fallback).
- Server actions zijn dunne wrappers om `src/lib/queries/*` (framework-onafhankelijk houden voor de latere Expo-app).

## Werkwijze

- **Nooit direct naar `main`** (branch protection: PR + 1 review + groene CI); de repo-eigenaar kán bypassen maar hoort dat alleen solo te doen.
- Schemawijzigingen: kolommen toevoegen via een idempotent tsx-script (patroon: `scripts/migrate-producers.ts`) + `src/db/schema.ts` bijwerken + `npm run db:push` ter verificatie ("No changes" = in sync). Nooit drizzle-kit push een tabel laten hernoemen (interactieve prompt, dataverlies-risico).
- Deploy: `npx vercel deploy --prod --yes` (of merge naar main → auto). Altijd daarna smoke-testen.
- Verifiëren doe je **als gebruiker**: Playwright headless op 390×844 tegen productie (zie `.claude/skills/user-test`). Screenshots lezen en er echt naar kijken.
- Secrets staan alleen in `.env.local` (gitignored) en Vercel env — de repo is publiek, dus nooit credentials/sheet-ID's in gecommitte bestanden.

## Geleerde valkuilen (niet opnieuw tegenaan lopen)

- **Drizzle + arrays**: een JS-array in een `sql`-template wordt uitgeklapt tot een ROW-expressie (`transformRowExpr`-fout). Oplossing: array als literal-string met cast, bijv. `` sql`... = any(${`{${ids.join(",")}}`}::int[])` ``.
- **PDOK Locatieserver kent alleen Nederland**: buitenlandse adressen matchen op een fout NL-adres. Altijd filteren op NL-postcodeformaat vóór geocoding (ging mis met 3 Belgische producenten).
- **ESM-hoisting in scripts**: imports draaien vóór je env-loader — `.env.local` laden en dán pas `@/db` **dynamisch** importeren (patroon: `scripts/import-sheet.ts`).
- **React-lintregels van deze repo**: geen component-assignment in render (`react-hooks/static-components`) → gebruik `createElement(iconFor(...), props)`; geen `setState` in effects (`react-hooks/set-state-in-effect`) → `useSyncExternalStore` voor localStorage/online-status; `Date.now()` in render (`react-hooks/purity`) alleen met bewuste disable-regel.
- **Geolocation op desktop is IP-gebaseerd** (kilometers ernaast): toon altijd het reverse-geocodede punt zodat de gebruiker het kan corrigeren.
- **Drizzle unique-constraintnamen**: drizzle-kit push verwacht `*_unique`; handgeschreven SQL geeft `*_key` → push wil dan interactief bevestigen (en faalt zonder TTY). Bij SQL-migraties constraints meteen `tabel_kolom_unique` noemen of hernoemen.
- **Google Places TOS**: `place_id` mag permanent opgeslagen; alle andere Places-data maximaal 30 dagen cachen; weergave buiten een Google-kaart vereist "powered by Google"-vermelding. Sync via `scripts/google-sync.ts` (env-guarded, maandelijks); nooit Google Maps scrapen zonder API.
- **`useOptimistic` leeft alleen binnen een pending transition**: offline-acties blijven pending via `await ensureOnline()` binnen dezelfde transition (zie ListView) — buiten een transition reset de optimistic state direct.
- **`pg`-parameterplaceholders hernummeren als je een WHERE-clause hergebruikt**: een `$1`/`$2`-fragment gebouwd voor een SELECT past niet zomaar in een UPDATE die er nog een parameter (bijv. de nieuwe waarde) voor plakt — de placeholders in de WHERE-string moeten dan mee opschuiven, anders faalt de query (veilig: Postgres valideert de binding vóór uitvoering, dus er wordt niets fout weggeschreven, de query gooit gewoon een fout).
- **drizzle-kit push blijft `producers.products SET DEFAULT '{}'` herhalen**: cosmetische introspectie-quirk; de database heeft die default al en het statement is een no-op. Een strikte "No changes" is op deze database dus niet haalbaar — check bij twijfel `npx drizzle-kit push --verbose` en beoordeel de statements.

## Openstaand (stand zomer 2026)

Zie [docs/PLAN.md](docs/PLAN.md) § Status. Kort: **GitHub Actions geblokkeerd door billing-probleem** (CI kan niet draaien; PR's vereisen eigenaars-bypass tot Frank dit fixt), Pusher-keys (realtime), Google Places-key (urensync), echte-gebruikerstestweek, definitieve naam + domein, Neon van us-east-1 naar EU, voorwaarden via jurist, zelf-claim-flow voor het portaal (vereist transactionele mail; portaal v1 met team-koppeling is live), marktstandplaatsen koppelen aan leden + /markten-pagina, deboervinder-migratie met 301's, Expo-app (later).
