# Lokale-producenten-platform (werktitel "OnlyFarms")

## STATUS (bijgewerkt 3 aug 2026) — wat is er al?

**Gebouwd en live** (onlyfarms-ten.vercel.app):

- **Fase 0+1 volledig**: huisstijl-tokens (terra/ink/cream), i18n-taalbestand, seizoensthema, kaart volledig verwijderd, producers-datamodel (gids/leden-scheiding), catalogus **151 items met elk een eigen SVG** (incl. categorieen Vis en Supermarkt), lijsten met deel-links, matching per item (Haversine, straal + fallback, reistijden), SEO-pagina's (producent/producenten/provincie, sitemap 2.294 URL's, JSON-LD), meldknop, Klaviyo-events (env-guarded).
- **Fase 2 grotendeels**: accounts (registreren, inloggen, wachtwoord wijzigen), **family accounts** met uitnodigingslink `/gezin/[code]`, lijsten claimen, gevalideerde "wie haalt het" (alleen gezinsleden, server-side afgedwongen), waar/wie/wanneer per item met locatietips ("tip van ..."), testaccounts voor Frank/Chimene/Sally (elk eigen gezin).
- **UX-sprint (Bring-niveau)**: optimistic UI (~40 ms reactie), offline-modus (service worker + acties wachten op reconnect), bottom-nav met badge, lijst-switcher, sticky zoeken met categorie-chips, Enter-quick-add, undo-snackbar, hoeveelheid via long-press + presets, wis-gekocht, categorie-groepering (loopvolgorde winkel), onboarding-kaart, PWA-manifest + app-iconen, gerangschikt accent-ongevoelig zoeken met synoniemen, a11y-basis (dialogs, contrast, grote tikvlakken).
- **Data**: 2.279 producenten geseed; ~89% met productdata (afgeleid uit omschrijvingen + steekproef); dubbele adressen gerapporteerd; 3 Belgische records bewust zonder coordinaten.

**Aanvulling 3 aug 2026 (UX-sprint 2 + lokaal-verdieping, live)**: cart-drawer-model (lijst als winkelwagen, Lijst-tab togglet de drawer), zoek-overlay met veld bovenaan (toetsenbord-proof), tik = +1 met teller en vasthouden = aantal/verwijderen, zichtbaar vink-moment, lijsten hernoemen/verwijderen, matching in twee lagen (zeker > categorie-suggestie > supermarkt onderaan) met inline tip per rij, "N in de buurt"-badges op tegels, producenten-zoeken in de zoekbalk, urgentie + eigen categorie-volgorde + vaak-gekocht, 785 producenten verrijkt met specifieke tokens, openingstijden als nu-status (parser voor alle notaties), 275 weekmarkten uit OSM op Ontdek, hier-halen vanaf producentpagina's, Google Places-sync script (wacht op API-key), em-dash-regel doorgevoerd.

**Aanvulling 3 aug 2026, deel 2 (beheeromgeving, live)**: `/beheer` gebouwd, gemerged en op productie geverifieerd met Playwright (26/26 checks: gates, wachtrijen, bewerken, mobiel). Zie § Fase 2.4 voor de inhoud. Inloggen brengt je via `?terug=` automatisch terug naar waar je heen wilde, dus `/beheer` is de enige URL die het team hoeft te onthouden. Accountfilosofie vastgelegd: **één account per persoon, petten bepalen de toegang** (gebruiker, team, straks verkoper via `sellers.user_id`); een boer is immers zelf ook klant. Team en leden krijgen bewust gescheiden omgevingen (/beheer en straks /portaal): harde veiligheidsgrens, per doelgroep één URL; eventueel later één slimme voordeur (/mijn) die op rol doorstuurt. Ter demonstratie van de verkopersflow is "Demoboerderij van Frank" aangemeld en goedgekeurd (seller 4, producent demoboerderij-van-frank, lid, nog zonder adres/producten dus buiten de matching; opruimen = status gestopt).

**Aanvulling 3 aug 2026, deel 3 (producentenportaal v1, live)**: `/portaal` gebouwd en getest (16/16 Playwright-checks). Een aan een gebruikersaccount gekoppelde verkoper ziet er zijn aanmeldstatus en beheert zijn eigen vermelding met een bewuste subset van het beheer-formulier: telefoon, website, omschrijving, openingstijden en product-tokens (naam, adres en status blijven bij het team; opslaan zet "laatst bevestigd"). Koppeling verkoper-account (`sellers.user_id`, uniek): door het team in het beheer (sectie "Portaal-toegang" op de aanmelding) of automatisch bij goedkeuring als het e-mailadres al een account heeft. Zelf claimen met mailverificatie blijft de latere stap (vereist transactionele mail). Ingelogd zonder gekoppelde verkoper krijgt een uitlegpagina met link naar /verkopen; /portaal staat in robots-disallow; profiel toont een portaal-link voor gekoppelde verkopers.

**Aanvulling 3 aug 2026, deel 4 (portaal-profiel met foto's en aanbod, live)**: het portaal is een volwaardig bedrijfsprofiel geworden (11/11 Playwright-checks). Tabs Overzicht/Gegevens/Foto's/Producten. **Foto's** via Vercel Blob (store `onlyfarms-media`, token in Vercel + .env.local): max 8 per vermelding, upload via `/api/upload` (alleen ingelogde verkopers/team, JPG/PNG/WebP tot 8 MB), eerste foto = hoofdfoto; server actions accepteren alleen URL's uit onze eigen store. **Producten** via de bestaande offers-tabel: titel, categorie, prijsindicatie als tekst, foto, beschikbaar-toggle; prikbord-model, expliciete disclaimer "verwerkt geen betalingen" (platformregel). De publieke producentpagina toont nu een fotogalerij en een Aanbod-sectie voor leden. Verwijderde foto's worden ook uit Blob opgeruimd (best-effort).

**Aanvulling 3 aug 2026, deel 5 (UX-sprint "less is more" + swipe, live)**: homepage geminimaliseerd (categorie-grid weg, dat dubbelde de Ontdek-tab; Verkopen-link nu ook op mobiel zichtbaar). **Swipe-tabblad** (4e tab "Swipen", kaartstapel-icoon): Tinder-patroon voor je vaste boodschappen op `/lijst/[token]/swipen`; rechts = toevoegen, links = overslaan, met grote knop-fallback (toegankelijkheid), undo, teller en eindkaart. Deck = eerder gekocht (frequentie) > seizoen > gecureerde `BASICS`; open items worden uitgefilterd. Fundament: **`bought_stats`**-tabel (accumulerende koophistorie per lijst/huishouden, upsert bij afvinken, wisbestendig; de "Eerder gekocht"-suggestierij leest er nu ook uit). Tegelwand op de lijstpagina: **6 tegels per categorie + "Toon alles (n)"** inklapbaar. Labels "Vorige keer gekocht"/"Vaak gekocht" geünificeerd naar "Eerder gekocht". 17/17 Playwright-checks.

**Aanvulling 3 aug 2026, deel 7 (noten en zaden)**: catalogus uitgebreid met walnoot, amandel, cashewnoot, pinda (noten) en zonnebloempit, pompoenpit, lijnzaad, chiazaad, sesamzaad (zaden), elk met een eigen onderscheidend SVG-icoon onder "Overig". Terzijde ontdekt en meteen gefixt: het Nederlandse meervoud "noten" bevat de tekenreeks "noot" niet (klinkerverkorting), waardoor geen enkel notenitem vindbaar was op het meest voor de hand liggende zoekwoord; opgelost met gerichte synoniemen (noot/walnoot/hazelnoot/cashewnoot).

**Aanvulling 3 aug 2026, deel 8 (swipe: winkelmodus vs. smaakmodus bèta)**: het swipe-deck stond de items nog in vaste categorie-volgorde (eerst alle groente, dan fruit), omdat het seizoen/basisset-blok gewoon de catalogus-volgorde volgde. Nu een pil-schakelaar bovenaan het deck met twee modi: **winkelmodus** (standaard) huselt dezelfde kandidatenpool (historie/seizoen/basisset) willekeurig door elkaar, wat aanvullen impulsiever maakt; **smaakmodus (bèta)** weegt diezelfde pool op een geleerd voorkeurssignaal. Elke swipe registreert, in beide modi, een like/skip in de nieuwe **`swipe_signals`**-tabel (los van `bought_stats`: dat is aankoophistorie, dit is voorkeur), zodat de bèta-modus al leert vóórdat iemand er bewust voor kiest. Terugnavigatie vanaf het swipen (header-link, eindkaart, bottom-nav) opent nu altijd de bestaande lijst-drawer (aantallen aanpassen, bewerken, afvinken) in plaats van soms gewoon de winkelpagina.

**Aanvulling 3 aug 2026, deel 9 (persoonlijk smaakprofiel + brede smaakpool)**: smaak is persoonlijk, gezinsleden verschillen. Swipe-signalen horen nu bij de **gebruiker** als je ingelogd bent (over al je lijsten heen), en anoniem bij de lijst (`swipe_signals.user_id`, unique `NULLS NOT DISTINCT` op lijst+item+gebruiker; cascade bij accountverwijdering want het profiel is persoonsdata). De koophistorie (`bought_stats`, winkelmodus) blijft bewust huishouden-breed: wat het gezin koopt is gedeeld, wat jij lekker vindt niet. De smaakmodus-pool is verbreed van historie/seizoen/basisset naar de **hele catalogus** (incl. supermarkt/drogisterij-items, die horen er bewust bij), gewogen op het persoonlijke profiel plus een zetje voor eerder gekocht en seizoen; veel weggeswipete items zakken weg maar verdwijnen nooit helemaal (smaak kan veranderen).

**Icoon-dekking geverifieerd (3 aug 2026)**: alle 147 catalogusitems hebben nu een eigen, uniek SVG-icoon (147 iconen, 0 gedeeld, 0 items op de categorie-fallback). Enige gevonden gat: "gehakt" hergebruikte het rundvlees-icoon (plak met beenmerg, feitelijk onjuist voor gehakt); gefixt met een nieuw icoon (korrelig hoopje). Ook een dode mapping opgeruimd (verwees naar een niet meer bestaand catalogusitem "vis").

**Aanvulling 3 aug 2026, deel 6 (interactie-bijstelling)**: tegels zijn weer een echte **Bring-toggle** (tik = op de lijst, nog een tik = er weer af; aantallen via vasthouden). Daarmee vervalt "tweede tik = +1" (eerdere suggestie van Chimene); verwijderen zat te verstopt achter vasthouden, en regel 1 (doe wat Bring doet) geeft de doorslag. Introkaart-tekst aangepast. Alle onderste panelen (aantal-paneel, drawer, zoekbalk, snackbar) eindigen nu gegarandeerd boven de tabbalk.

**Datakwaliteit-audit (3 aug 2026)**: volledige meting van de productiedatabase, zie [docs/DATAKWALITEIT.md](DATAKWALITEIT.md). Kernpunten: geo/product-dekking is sterk (99,6% coördinaten, 91% producten), maar er is maar **1 record ooit geverifieerd** (`last_verified_at`) en **alle 2.280 producenten stonden op `kind = "boerderijwinkel"`**. Twee snelle fixes doorgevoerd: openingstijden-parser herkent nu ook "Dagelijks (...)"-varianten (1693 → 1709 parseerbaar), en `kind` is afgeleid uit de bedrijfsnaam (`scripts/classify-kind.ts`, idempotent): 31 imkerij, 7 wijngaard, 3 brouwerij (bakkerij bewust overgeslagen, te onbetrouwbaar signaal via de veelvoorkomende achternaam "Bakker"). Naamduplicaten-check toegevoegd aan `data-quality.ts`. Nog open: 37 bekende adres-duplicaten (oplosbaar via `/beheer/producenten/duplicaten`, vereist een blik per geval) plus 13 naamduplicaten, en contactgegevens (telefoon 5%, website 13%) wachten op de Google Places-sync.

**Openstaand**:

- **GitHub Actions is geblokkeerd door een billing-probleem op het account van frank2889** ("account locked due to a billing issue"): de verplichte CI-check kan niet draaien, dus PR's van Chimene/Sally kunnen niet gemerged worden en de eigenaar moet steeds bypassen. Oplossen via github.com > Settings > Billing and plans (Actions is gratis voor publieke repo's, dus na herstel kost het niets).
- PR #1 (docs/SAMENWERKEN.md, de samenwerkgids voor niet-developers) staat bewust open als review-oefening voor Sally of Chimene; Sally moet ook nog haar repo-uitnodiging accepteren (GitHub: wissalakmadi).
- **Delen is nog minimaal**: "Deel deze lijst" doet alleen de OS-share-sheet of link kopiëren, er is nergens zichtbaar met wie je een lijst deelt of wie er al is toegevoegd. Frank opperde ook een in-app chat binnen de lijst. Richting nog niet gekozen; eerste stap is vermoedelijk een "wie doet mee"-overzicht (leunt op de bestaande household_members-data), chat is een apart, groter idee.

- **Pusher-keys aanmaken** (gratis account, 4 env-vars in Vercel) - realtime i.p.v. 10s-polling
- **Google Places-key aanmaken** (`GOOGLE_MAPS_API_KEY`) - vult in één keer openingstijden, telefoon, website en gestopt-status aan (`scripts/google-sync.ts --match` eenmalig, `--refresh` maandelijks); ~$40-80/maand bij volledige dekking, vereist "powered by Google"-vermelding
- **Week echte-gebruikerstest** (3-5 mensen incl. 65+) - belangrijkste volgende stap; ook de swipe-tab en tegel-toggle zelf op een telefoon voelen
- Definitieve naam + domein; daarna Search Console + SEO-quick-wins (canonicals, og:image, dubbele titel-suffix, interne links producent->provincie)
- Neon van us-east-1 naar EU-regio; voorwaarden via jurist
- Eerste 25-50 leden werven ("founding members"); de beheeromgeving `/beheer` staat hiervoor klaar (aanmeldingen goedkeuren, meldingen, producentenbeheer, cijfers)
- Zelf-claim-flow voor het portaal (verkoper koppelt zichzelf met mailverificatie; vereist eerst een besluit over transactionele mail). Portaal v1 met team-koppeling is live.
- **Duplicaten opruimen** (37 adres- + 13 naamduplicaten, via `/beheer/producenten/duplicaten`; vereist een blik per geval, zie DATAKWALITEIT.md)
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
4. Admin `/beheer`: GEDAAN (aug 2026). Rol-gebaseerd (`users.role` = "team", check per request via `requireAdminUser`), dashboard met kerncijfers en groei, wachtrijen voor meldingen (met afhandelnotitie), verkopersaanmeldingen (goedkeuren = koppelen aan gids-record of nieuw record aanmaken; Klaviyo-events `seller_approved`/`seller_rejected`/`seller_suspended`), ervaringen-moderatie, producentenbeheer (bewerken zet `last_verified_at`) en duplicaten-wachtrij. Vervolg: producentenportaal `/portaal` (fundament ligt er: `claimed_by_seller_id`/`claimed_by_email` worden bij goedkeuring gezet, het bewerkformulier kan met een veld-subset hergebruikt worden; blocker is transactionele mail voor claim-verificatie).

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
