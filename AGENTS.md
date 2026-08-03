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
- Matching: Haversine in SQL (`src/lib/queries/producers.ts`), catalog-`matchTokens` → `producers.products`-tokens; items met lege `matchTokens` (categorie Supermarkt) worden bewust níét gematcht.
- Realtime: Pusher (env-guarded, `src/lib/realtime.ts`) met 10s-polling-fallback. Klaviyo-events env-guarded in `src/lib/klaviyo.ts`.
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
- **Google Places TOS**: `place_id` mag permanent opgeslagen; alle andere Places-data maximaal 30 dagen cachen; weergave buiten een Google-kaart vereist "powered by Google"-vermelding. Sync via `scripts/google-sync.ts` (env-guarded, maandelijks); nooit Google Maps scrapen zonder API.
- **`useOptimistic` leeft alleen binnen een pending transition**: offline-acties blijven pending via `await ensureOnline()` binnen dezelfde transition (zie ListView) — buiten een transition reset de optimistic state direct.

## Openstaand (stand zomer 2026)

Zie [docs/PLAN.md](docs/PLAN.md) § Status. Kort: Pusher-keys aanmaken (realtime), echte-gebruikerstest week, definitieve naam + domein, Neon van us-east-1 naar EU, voorwaarden via jurist, admin-scherm, marktstandplaatsen (fase 3), deboervinder-migratie met 301's, Expo-app (later).
