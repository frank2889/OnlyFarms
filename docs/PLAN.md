# Lokale-producenten-platform (werktitel "OnlyFarms")

## STATUS (bijgewerkt 2 aug 2026) — wat is er al?

**Gebouwd en live** (onlyfarms-ten.vercel.app):

- **Fase 0+1 volledig**: huisstijl-tokens (terra/ink/cream), i18n-taalbestand, seizoensthema, kaart volledig verwijderd, producers-datamodel (gids/leden-scheiding), catalogus **151 items met elk een eigen SVG** (incl. categorieen Vis en Supermarkt), lijsten met deel-links, matching per item (Haversine, straal + fallback, reistijden), SEO-pagina's (producent/producenten/provincie, sitemap 2.294 URL's, JSON-LD), meldknop, Klaviyo-events (env-guarded).
- **Fase 2 grotendeels**: accounts (registreren, inloggen, wachtwoord wijzigen), **family accounts** met uitnodigingslink `/gezin/[code]`, lijsten claimen, gevalideerde "wie haalt het" (alleen gezinsleden, server-side afgedwongen), waar/wie/wanneer per item met locatietips ("tip van ..."), testaccounts voor Frank/Chimene/Sally (elk eigen gezin).
- **UX-sprint (Bring-niveau)**: optimistic UI (~40 ms reactie), offline-modus (service worker + acties wachten op reconnect), bottom-nav met badge, lijst-switcher, sticky zoeken met categorie-chips, Enter-quick-add, undo-snackbar, hoeveelheid via long-press + presets, wis-gekocht, categorie-groepering (loopvolgorde winkel), onboarding-kaart, PWA-manifest + app-iconen, gerangschikt accent-ongevoelig zoeken met synoniemen, a11y-basis (dialogs, contrast, grote tikvlakken).
- **Data**: 2.279 producenten geseed; ~89% met productdata (afgeleid uit omschrijvingen + steekproef); dubbele adressen gerapporteerd; 3 Belgische records bewust zonder coordinaten.

**Aanvulling 3 aug 2026 (UX-sprint 2 + lokaal-verdieping, live)**: cart-drawer-model (lijst als winkelwagen, Lijst-tab togglet de drawer), zoek-overlay met veld bovenaan (toetsenbord-proof), tik = +1 met teller en vasthouden = aantal/verwijderen, zichtbaar vink-moment, lijsten hernoemen/verwijderen, matching in twee lagen (zeker > categorie-suggestie > supermarkt onderaan) met inline tip per rij, "N in de buurt"-badges op tegels, producenten-zoeken in de zoekbalk, urgentie + eigen categorie-volgorde + vaak-gekocht, 785 producenten verrijkt met specifieke tokens, openingstijden als nu-status (parser voor alle notaties), 275 weekmarkten uit OSM op Ontdek, hier-halen vanaf producentpagina's, Google Places-sync script (wacht op API-key), em-dash-regel doorgevoerd.

**Openstaand**:

- Pusher-keys aanmaken (gratis account, 4 env-vars) - realtime i.p.v. 10s-polling
- Week echte-gebruikerstest (3-5 mensen incl. 65+) - belangrijkste volgende stap
- Definitieve naam + domein; daarna Search Console + SEO-quick-wins (canonicals, og:image, dubbele titel-suffix, interne links producent->provincie)
- Neon van us-east-1 naar EU-regio; voorwaarden via jurist
- Admin-scherm (moderatie draait nu op de Neon-editor); eerste 25-50 leden werven ("founding members")
- Fase 3: marktstandplaatsen, slimme dekking, sjablonen, recepten-import, aanbiedingen (incl. locatiegebonden), deboervinder-migratie met 301's; daarna Expo-app
- Offline-beperking v1: pagina herladen zonder verbinding verliest nog niet-gesyncte vinkjes

---


## Context

Gestart als herbouw van deboervinder.nl (kaart met 2.279 boerderijwinkels, live op onlyfarms-ten.vercel.app). Na 20 richtingvragen is het product wezenlijk gepivoteerd:

**De kern is een gedeelde boodschappenlijst naar het model van de app Bring!** — visuele producttegels, meerdere lijsten per huishouden, samen afvinken — gematcht aan **waar je elk item bij een lokale producent in de buurt koopt**. Geen kaart meer, nergens: navigeren doe je met je eigen telefoon (route-knop → Google/Apple Maps).

**Scope verbreed**: niet alleen boerderijwinkels maar **alle lokale producenten van eet- en drinkwaar met KVK-inschrijving** — brouwers, bakkers, imkers, wijngaarden, kaasmakers. Alcohol gewoon tonen met NIX18-vermelding.

### Alle besluiten uit de vragenronde (samengevat)

| Onderwerp | Besluit |
|---|---|
| Doelgroep v1 | Gezinnen/thuiskoks die bewust (deels) lokaal inkopen |
| deboervinder.nl | Wordt **vervangen** door dit platform (redirects + SEO-waarde overzetten bij livegang) |
| Naam | "OnlyFarms" is **werktitel** — naam-onafhankelijk bouwen (één config-constante voor naam/logo/meta) |
| Launch | Pas live als het áf voelt; tot die tijd besloten previews |
| Lijsten | **Meerdere lijsten** per huishouden (Bring-model), delen via geheime link, eerst zonder account |
| Realtime | **Echt realtime** afvinken (1–2 s) via Pusher Channels (gratis tier); polling als fallback |
| Item-details | Aantal/hoeveelheid + notitie in MVP; **foto's** zodra Vercel Blob erin zit (fase 2) |
| Suggesties | Seizoenssuggesties + "vorige keer gekocht" |
| Producenten-instroom | Alle drie: redactie verzamelt actief, zelf aanmelden (KVK-flow), gebruikers dragen aan |
| Gids vs. leden | **Gescheiden**: de 2.279 bestaande vermeldingen zijn een informatieve *gids*; alleen aangemelde *leden* draaien mee in de lijst-matching. Gids-vermeldingen tonen als "staat in de gids — nog niet aangesloten" met claim-knop (brug naar lidmaatschap) |
| Productdata (78% leeg) | Automatisch categorieën afleiden uit omschrijvingsteksten + steekproefcontrole |
| Zoekafstand | Standaard 10 km, instelbaar (5/15/25), en altijd fallback "5 dichtstbijzijnde" als de radius leeg is |
| Reviews | **Alleen tekst-ervaringen** — geen sterren (vriendelijk voor kleine producenten) |
| Moderatie | Zo min mogelijk handwerk: KVK-validatie via KVK Zoeken-API, woordfilters, alleen randgevallen handmatig |
| Notificaties | Via **Klaviyo** — het platform stuurt server-side events; Sally bouwt de flows, Chimene doet socials |
| Monetisatie | **Eerst gratis groeien**; betaalde opties pas bij bewezen verkeer (platform blijft betalingsvrij — Marktplaats-model) |
| Analytics | **Plausible** (cookieloos teamdashboard) + **GA4** (met consent-banner) |
| Taal | NL, maar **i18n-klaar** (alle teksten in taalbestanden vanaf dag één) |
| Succes na 6 mnd | Dashboard met doel per pijler: wekelijkse lijst-gebruikers (retentie), aangesloten leden, SEO-verkeer |
| Design | Max **3 kleuren** (terra/ink/cream) met tintenschema's; hele site illustratief/cartoonish; **geen emoji — alleen SVG**; **seizoens- en weersgebonden thema** |
| Bring-assets | Tegel-UX nabouwen mag (interactiepatroon); hun SVG's/code alleen na schriftelijke aanlevering/licentie door Bring zelf — tot die tijd eigen illustraties in huisstijl (passen toch beter) |
| Toekomstige app | Next.js blijft (Next ís React); App Store later via Expo/React Native op dezelfde backend — logica framework-onafhankelijk in `src/lib/`, mutaties als dunne wrappers zodat er later een `/api/v1` naast kan |

---

## Bring-pariteit — wat, wanneer

| Bring-functie | Bij ons | Fase |
| --- | --- | --- |
| Meerdere lijsten, delen, samen afvinken | Idem, deel-link + realtime (Pusher) | 1 |
| Tegel-catalogus per categorie + zoeken | Idem, eigen SVG-tegels in huisstijl, zoekveld | 1 |
| Specificaties (aantal, notitie) | Idem | 1 |
| Afgevinkt → "onlangs gekocht" + snel opnieuw toevoegen | Idem, sectie onderaan per lijst | 1 |
| Seizoens-/aanbevolen sectie | Seizoenscatalogus bovenaan (sluit aan op seizoensdesign) | 1 |
| Pushberichten ("X toegevoegd") | Web-push (PWA) + Klaviyo-mails | 2 |
| Profiel (naam/foto) | Idem, bij accounts | 2 |
| Foto bij item | Vercel Blob | 2 |
| Lijstsjablonen ("standaard week") | Idem | 3 |
| Recepten-import (URL → items) | Idem, mooi groeikanaal | 3 |
| "Angebote" (aanbiedingen/folders) | **Aanbiedingen van leden** — tevens de monetisatie-parallel | 3/4 |
| Klantenkaarten/wallet, supermarktfolders | **Bewust niet** — past niet bij lokaal | — |

## Locatie-UX ("vanaf mijn locatie")

- Primair: **"Gebruik mijn locatie"-knop** (browser-geolocation) — coördinaten direct bruikbaar voor afstandsberekening, geen geocoding nodig.
- Fallback/correctie: postcode of plaats via PDOK.
- Locatie wordt onthouden per apparaat (localStorage) én per lijst (voor gedeelde matching); overal een klein "wijzig locatie"-affordance.
- Afstand zichtbaar op elke producentkaart; radius instelbaar (10 km default, 5/15/25), fallback "5 dichtstbijzijnde" bij lege radius.
- "Onderweg"-modus (locatie live verversen + reminder nabij producent, zoals Bring's winkelherinnering): fase 3.

## Datastrategie — bestaand slim gebruiken + betere bronnen

**Bestaande data (2.279 records) maximaal benutten:**

1. `derive-products.ts`: categorieën afleiden uit omschrijvingen (78% leeg → naar verwachting grotendeels gevuld) + steekproefcontrole.
2. De 5 records met (0,0)-coördinaten alsnog geocoderen via PDOK (adres is aanwezig).
3. De 37 dubbele adressen deduperen (script + handmatige check).
4. 3 Belgische records: besluit (verwijderen of "grensstreek"-vlag).
5. **Volledigheidsscore** per producent (heeft producten/tijden/site/telefoon?) → werklijst voor de redactie, en "laatst bevestigd"-transparantie op de site.

**Nieuwe bronnen (redactie-leads, gefaseerd):**

- **Skal-register** (publiek register bio-certificering): bio-claims verifiëren én lead-lijst van gecertificeerde producenten — maakt onze "bio"-badge hard i.p.v. zelfverklaard.
- **KVK Zoeken-API op SBI-codes** (bakkerijen, brouwerijen, zuivel, vleesverwerking, tuinbouw): lead-lijsten per branche voor de gids-uitbreiding naar alle producenten.
- OSM / VVV- en gemeentelijsten / streekkeurmerken: alleen als research-leads voor de redactie (OSM-data niet 1-op-1 in de productie-db i.v.m. ODbL share-alike).
- Gebruikers ("mis je een producent?") en leden-aanmeldingen als doorlopende instroom.

## Ontwerpsysteem

**Tokens** (Tailwind v4 `@theme` in `src/app/globals.css`, enige plek met hexwaarden):
- `terra` 50–900 (hoofdkleur, terracotta; 500 = #C4552C), `ink` 300–900 (donker neutraal), `cream` 50–300 (achtergrond). Dark mode schrappen (bewust licht); alle bestaande `green-*`/`neutral-*`/`dark:` classes vervangen.

**Seizoens- en weerthema**:
- `src/lib/season.ts`: bepaalt seizoen (datum) → thema-object met accent-tint (binnen de 3 families: lente = terra-300-accenten, zomer = terra-400, herfst = terra-600, winter = ink-zwaarder), illustratie-set en seizoenscatalogus-items.
- Illustratieve headers/lege-staten per seizoen (eigen SVG's, uitbreiding van `src/components/icons.tsx` naar `src/components/illustrations/`).
- Weer (subtiel, fase 2+): Open-Meteo (gratis, geen key) voor een klein accent ("mooi fietsweer om de kaasboer te bezoeken") — nooit blokkerend.

**Naam-onafhankelijk**: `src/lib/brand.ts` met `BRAND = { name, tagline, domain }` — overal uit putten, nergens hardcoden.

**i18n-klaar**: alle UI-teksten in `src/messages/nl.json` (next-intl of lichte eigen helper); componenten bevatten geen letterlijke strings meer.

---

## Datamodel (wijzigingen op bestaand schema in `src/db/schema.ts`)

- `farms` → hernoemen naar **`producers`** + nieuwe velden: `kind` enum (`boerderijwinkel | brouwerij | bakkerij | imkerij | wijngaard | overig`), `isMember` boolean (default false — de gids/leden-scheiding), `claimedBySellerId` FK naar bestaand `sellers`. Bestaande 2.279 records = gids (`isMember: false`).
- Bestaand `sellers`/`offers` blijft de leden-kant; `offers.category` koppelen aan catalog-keys (voedt de matching).
- Nieuw: `lists` (id, token, naam, postcode+lat/lng, seizoen-onafhankelijk), `list_items` (list FK, catalog_key nullable, label, qty, note, checked, position), later fase 2: `users` (Auth.js), `list_members`, `visits`, `experiences` (tekst-ervaringen met moderatiestatus), `wishlist`.
- `farm_reviews` uit eerder plan vervalt → `experiences` (alleen tekst, geen rating-kolom).

**Datavul-script** (`scripts/derive-products.ts`): leidt catalog-keys af uit `description`-teksten (keyword-matching per categorie), schrijft met `source: 'derived'`-markering; rapport + steekproeflijst voor controle.

---

## Fasering (elke stap deploybaar; launch pas als fase 1+2 áf voelen)

### Fase 0 — Fundament
1. `brand.ts`, kleurtokens, dark mode eruit, i18n-opzet, seizoensthema-mechanisme.
2. Kaart eruit: `FarmMap.tsx`, `KaartClient.tsx`, leaflet-deps weg; `/kaart` → redirect `/producenten`.
3. Schema-migratie farms→producers + kind/isMember; datavul-script draaien + steekproef.
4. Plausible + GA4 (consent-banner alleen voor GA4-cookies) + simpel doelen-dashboard (kan later).

### Fase 1 — Kern: lijst + matching + gids (anoniem)
1. **Catalogus** `src/lib/catalog.ts`: items per categorie (incl. brood, bier, wijn, honing...; alcohol-items dragen `nix18: true` → vermelding in UI), elk met eigen SVG-tegel in huisstijl, seizoensmarkering per item.
2. **Lijsten**: meerdere lijsten, tegel-grid + zoekveld om toe te voegen (Bring-UX), qty/notitie, afvinken → "onlangs gekocht"-sectie met snel opnieuw toevoegen, delen via `/lijst/[token]`; realtime via Pusher Channels (`lijst-{token}`-kanaal, events bij elke mutatie), polling-fallback. Mutaties via server actions die `src/lib/queries/lists.ts` aanroepen.
3. **Matching per item**: locatie via "Gebruik mijn locatie"-knop (geolocation) of postcode (PDOK, `src/lib/geocode.ts`), onthouden per apparaat + per lijst, overal wijzigbaar; per item: leden die het voeren binnen radius (10 km default, instelbaar 5/15/25, fallback 5 dichtstbijzijnde — Haversine in SQL), afstand op elke kaart; daaronder gids-vermeldingen "nog niet aangesloten" met route-knop en claim-teaser.
4. **SEO-pagina's**: `/producent/[slug]` (server-rendered, JSON-LD LocalBusiness, route-knop, meldknop → `reports`, claim-knop), `/producenten` (zoeken op afstand + categoriefilters, hergebruik filterchips-UI), `/provincie/[slug]`, `sitemap.ts`, `robots.ts`.
5. **Homepage**: lijst-propositie, seizoensheader, categorie-grid.
6. **Klaviyo-events** (server-side API): `list_created`, `item_added`, `producer_claim_started` — Sally bouwt er flows op.

### Fase 2 — Accounts, profielen, leden
1. Auth.js (magic link + Google); anonieme lijsten claimen; `list_members` (huishouden).
2. Profiel: bezochte producenten (check-in), tekst-ervaringen (moderatiewachtrij met woordfilter-voorcheck), wishlist; foto's bij items/ervaringen via Vercel Blob.
3. Leden-flow afmaken: aanmelden (bestaand) + **KVK Zoeken-API-validatie** (automatische check van nummer/naam), aanbod beheren gekoppeld aan catalogus, "geverifieerd lid"-badge; gids-vermelding claimen = gids-record wordt lid.
4. Admin `/admin` (rol-gebaseerd, moderatie-arm): wachtrijen voor randgevallen, meldingen, ervaringen.

### Fase 3 — Slim & groei
1. Slimme dekking: "dit lid dekt 5 van je 7 items" (set-cover over leden-matches).
2. Suggesties: seizoen + eerder gekocht; seizoensnotificatie-segmenten naar Klaviyo.
3. deboervinder.nl-migratie: 301-redirects per boerderij naar `/producent/[slug]`, domein/merk-switch (naam dan definitief).
4. Monetisatie-verkenning pas hierna (gratis groeien): uitgelicht-vermeldingen, premium ledenprofiel — betalingsvrij platform blijft uitgangspunt.

---

## Belangrijkste bestanden

- **Weg**: `src/components/FarmMap.tsx`, `KaartClient.tsx`, leaflet-dependencies.
- **Nieuw**: `src/lib/{brand,season,catalog,geocode,realtime,klaviyo}.ts`, `src/lib/queries/{lists,producers}.ts`, `src/messages/nl.json`, `src/components/illustrations/`, `src/app/lijst/**`, `src/app/producent(en)/**`, `src/app/provincie/[slug]/`, `src/app/sitemap.ts`, `src/app/robots.ts`, `scripts/derive-products.ts`.
- **Aangepast**: `src/db/schema.ts` (producers, lists, list_items; fase 2: users/visits/experiences/wishlist), `globals.css` (tokens), `page.tsx` (homepage), `verkopen` (KVK-validatie, teksten uit taalbestand), README (nieuwe architectuur + rollen: Frank dev, Chimene socials, Sally Klaviyo-automations).

## Verificatie
1. `npm run lint && build`; migraties via `db:generate`/`db:push`; datavul-script met rapport + handmatige steekproef van 25 records.
2. Flow-test op preview: 2 telefoons, zelfde lijst — item toevoegen/afvinken verschijnt binnen 2 s bij de ander (Pusher) en na refresh (fallback).
3. Matching: postcode in dunbevolkt gebied → fallback "5 dichtstbijzijnde" werkt; alcohol-item toont NIX18-vermelding.
4. SEO: `curl` producent-pagina toont content + JSON-LD; sitemap geldig; oude `/kaart` en boerderij-URL's redirecten.
5. Design-checks: grep op `green-|neutral-|dark:` leeg; geen emoji; seizoenswissel testen door datum te mocken.
6. Klaviyo: testevent zichtbaar in Klaviyo-dashboard (Sally bevestigt).

## Openstaand (geen blokkade, wel agenderen)
- Definitieve naam + domein (nodig vóór publieke launch en deboervinder-migratie).
- Schriftelijke Bring-toestemming als hun assets echt gewenst zijn.
- Gebruikersvoorwaarden door jurist (platformrol, NIX18, UGC/ervaringen).
- Neon-database verhuizen van us-east-1 naar EU-regio (latency + AVG-netheid) — 10 min werk, vóór launch doen.
