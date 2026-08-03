# Datakwaliteit-audit: is de database compleet en up-to-date?

Gemeten op 3 augustus 2026 rechtstreeks op de productiedatabase (2.280 producenten, 275 markten). Methode: SQL-aggregaties per veld, de echte openingstijden-parser (`src/lib/opening-hours.ts`) losgelaten op alle 1.931 urenteksten, en een lichte externe steekproef via OpenStreetMap/Overpass. Geen data gewijzigd; dit is een meting, geen opschoning.

## Samenvatting in één zin

De **geografische en productdekking is goed** (99,6% heeft coördinaten, 91% heeft minstens één product-token), maar de database is **feitelijk bevroren sinds de eenmalige import**: er is maar 1 record ooit als "geverifieerd" gemarkeerd, elk record staat als "boerderijwinkel" genoteerd ook als het overduidelijk een brouwerij of bakkerij is, en contactgegevens (telefoon, website) ontbreken bij 87-95% van de producenten.

## Bevindingen

### 1. Veldcompleetheid

| Veld | Aantal | Percentage |
| --- | --- | --- |
| Totaal producenten | 2.280 | 100% |
| Met coördinaten (lat/lng) | 2.270 | 99,6% |
| Met producten (≥1 token) | 2.076 | 91,1% |
| Met openingstijden | 1.931 | 84,7% |
| Met omschrijving | 2.090 | 91,7% |
| Met postcode | 2.219 | 97,3% |
| Met plaats | 2.274 | 99,7% |
| Met provincie | 2.262 | 99,2% |
| **Met telefoonnummer** | **113** | **5,0%** |
| **Met website** | **296** | **13,0%** |
| Bio bekend (ja/nee, niet null) | 355 | 15,6% |
| Google Place ID gekoppeld | 0 | 0% |

**Conclusie**: de basis (locatie, product, korte omschrijving) is sterk. Contactgegevens zijn de zwakke plek: 95% van de producenten heeft geen telefoonnummer en 87% geen website in onze data, terwijl dat wel op hun eigen pagina getoond wordt als het er is. Dat is grotendeels een eigenschap van de bronsheet (die dit nooit goed bijhield), niet iets wat wij per ongeluk hebben laten vallen.

### 2. Producttokens: dekking is goed, diepte wisselt

- 204 producenten (9%) hebben nul producttokens (matchen dus nergens op).
- 1.140 (50%) hebben 1-2 tokens.
- 935 (41%) hebben 3 of meer tokens.
- 29 producenten hebben **geen omschrijving én geen producten**: dit zijn de enige echt "lege" records, te weinig om automatisch iets van af te leiden.
- Top-tokens: groente (756), eieren (651), fruit (650), vlees (645), melk (532), kaas (436). Logisch voor boerderijwinkels; opvallend weinig `bier`/`brood`-tokens gezien de brede scope (zie punt 4).

### 3. Status en versheid: dit is de grootste bevinding

| Metriek | Waarde |
| --- | --- |
| Status "actief" | 2.269 (99,5%) |
| Status "seizoen" | 10 |
| Status "gestopt" | 1 |
| **Ooit geverifieerd (`last_verified_at` gezet)** | **1 record** |
| Geverifieerd in de laatste 90 dagen | 1 record |
| Bijgewerkt in de laatste 30 dagen | 2.280 (100%, eenmalige bulk-import) |
| Oudste import | 1 aug 2026 |

**Wat dit betekent**: "laatst bevestigd: ..." staat nu bij vrijwel geen enkele producentpagina, terwijl de UI daar wel al op is gebouwd (`producers.lastVerified` in nl.json, getoond op `/producent/[slug]`). Er is dus geen actueel actualiteitssignaal: een producent die twee jaar geleden gestopt is, staat nog gewoon als "actief" te boek totdat iemand een melding stuurt. Met 99,5% "actief" zonder enige verificatiedatum kunnen we op dit moment niet onderscheiden tussen "klopt nog steeds" en "nooit meer gecheckt sinds de import".

### 4. Soort producent (`kind`): 100% staat op de standaardwaarde

Dit is de opvallendste bevinding, direct gekoppeld aan de pivot naar "alle lokale KVK-producenten" (niet alleen boerderijen):

- **Alle 2.280 records hebben `kind = "boerderijwinkel"`.** De kolom bestaat sinds de migratie naar producers, maar er is nooit een afleidingsstap gedraaid; elk record heeft simpelweg de default gehouden.
- Uit naam/omschrijving blijkt dat dit voor een deel niet klopt: 4 producenten met "brouwerij" in de naam (9 met het woord in de omschrijving), 3 met "bakker(ij)" in de naam (8 in de omschrijving), 31 met "imker(ij)" in de naam (55 in de omschrijving), 7 met "wijngaard" in de naam (19 in de omschrijving) staan allemaal als "boerderijwinkel" genoteerd. Voorbeelden: "Brouwerij Artemis en Haegens Distillery", "Waterland Brewery biologische bierbrouwerij", "BakkerBio".
- Praktisch effect: de `producers.kind`-badge en eventuele toekomstige filters op soort ("toon alleen brouwerijen") werken nu voor niemand, want iedereen is een "boerderijwinkel". Dit is zuiver een afgeleid-veld-probleem (de brondata bevat de aanwijzingen wel, in naam/omschrijving), geen ontbrekende brongegevens.

### 5. Openingstijden: 87,7% parseerbaar, met een kleine echte bug

De parser (`hoursStatusText`) losgelaten op alle 1.931 teksten:

- **1.693 (87,7%) parseren correct** naar minstens één tijdvak.
- **238 (12,3%) leveren niets op.** Uitgesplitst:
  - 102× "Zie website" / 4× "zie Facebook/Instagram" — bewust vrije tekst, niet bedoeld als tijdvak, geen bug.
  - 56× seizoensgebonden tekst ("Seizoen", "Plukdagen sept-okt") — idem, terecht niet parseerbaar.
  - 24× "Op afspraak" — idem.
  - **20× een parser-gat**: teksten als `"Dagelijks (automaat)"` of `"Knook Bio Eieren: Dagelijks (automaat)"` zouden wél als "elke dag open" herkend moeten worden, maar de regex in `parseHours` eist dat "dagelijks" het hele segment is (optioneel gevolgd door "geopend"/"open"), dus extra tekst erachter zoals "(automaat)" breekt de match. **Dit is een kleine, gerichte bugfix** (regex verruimen), goed voor ~1% meer dekking.
  - 27 overige losse teksten (bijv. typo's of ongebruikelijke notaties), te divers voor één generieke fix.
- Geen enkele crash: de parser gooit nooit een fout, hij levert in het slechtste geval gewoon 0 intervallen (en de UI valt dan terug op de ruwe tekst).

### 6. Duplicaten: bekend en al gerapporteerd, nog niet opgeruimd

- **37 groepen dubbele adressen** (zelfde postcode+adres), 38 overtollige records. Dit is dezelfde 37 die `scripts/data-quality.ts` al langer rapporteert; sinds de bouw van het beheer (`/beheer/producenten/duplicaten`) is dit voor het eerst ook met één klik in de UI af te handelen, maar het is nog niet gedaan.
- **13 groepen mogelijke naamduplicaten** (zelfde naam + plaats, ander adres) — dit is een nieuwe hoek die `data-quality.ts` niet dekt (die kijkt alleen naar adres). Kan wijzen op filiaalketens (legitiem) of op dubbele invoer met een adresfout.

### 7. Weekmarkten

- 275 markten, 100% met plaatsnaam, maar slechts **191 (69%) met dagen-tekst** (`daysText`); de overige 84 tonen dus geen marktdag op de site. Dit is een beperking van de OSM-brondata zelf (niet elke marktplaats-tag heeft `opening_hours` ingevuld), niet iets wat ons import-script fout doet.
- Laatst ververst: 2 augustus 2026 (eenmalig; `import-markets.ts` is nog niet als terugkerende taak ingepland).

### 8. Externe sanity-check (OpenStreetMap)

Een gecombineerde Overpass-telling van `shop=farm` + biologische slagers + `craft=brewery/bakery/beekeeper` in heel Nederland gaf **797** resultaten, ruim onder onze 2.280. Dat zegt vooral iets over OSM: boerderijwinkels staan daar structureel onvolledig getagd, dus dit is geen betrouwbare maatstaf om onze dekking af te keuren. Losse Overpass-tellingen per categorie (brouwerij, imker) leverden geen bruikbare aparte cijfers op (rate-limit/lege respons); ik heb hier niet verder op doorgezocht omdat de interne bevindingen (punt 3 en 4) veel harder en direct bruikbaar zijn dan een externe telling zou worden.

## Aanbevelingen, op volgorde van impact per inspanning

1. **Openingstijden-parserfix** (klein, ~1 regel regex): lost circa 20 records op waar "Dagelijks (...)" nu niet herkend wordt. Laagste moeite, directe winst.
2. **`kind` afleiden uit naam/omschrijving** (script, patroon `scripts/data-quality.ts`): een eenmalige keyword-pass (brouwerij/brewery → brouwerij, bakker(ij) → bakkerij, imker(ij) → imkerij, wijngaard/wijnhoeve → wijngaard) zou in elk geval de duidelijke gevallen goedzetten. Dit maakt de `kind`-badge en toekomstige soort-filters voor het eerst betekenisvol.
3. **Versheid zichtbaar maken vóór de eerste 25-50 founding members geworven worden** (staat al op de PLAN-lijst): elke keer dat een lid via het beheer zijn eigen vermelding claimt of bewerkt, wordt `last_verified_at` gezet (dat gebeurt al automatisch). Voor de gids-records die niemand claimt, is een lichte steekproef (bijv. via het bestaande `data-quality.ts`-stappenplan of handmatige controle van de oudste/nooit-geverifieerde records) de enige weg; dit schaalt niet vanzelf.
4. **Contactgegevens**: telefoon/website zijn dun (5% / 13%). Zodra `GOOGLE_MAPS_API_KEY` is aangemaakt (staat al op de openstaand-lijst), vult `scripts/google-sync.ts --match` en `--refresh` dit automatisch aan naast de openingstijden, en is dit in één moeite meegenomen.
5. **Duplicaten opruimen via `/beheer/producenten/duplicaten`**: de tooling bestaat al, er is alleen nog niemand doorheen gegaan. Kleine, veilige klus (status op "gestopt" zetten per dubbel record).
6. **Naamduplicaten-check toevoegen aan `data-quality.ts`**: de bestaande dedupe-rapportage kijkt alleen naar adres; de 13 naamgroepen die er los van staan verdienen een eigen regel in het script zodat ze niet stil blijven liggen.
7. **Weekmarkten periodiek verversen**: `import-markets.ts` bestaat en werkt, maar draait niet automatisch. Eén keer per kwartaal handmatig draaien is voldoende voor deze databron.

## Wat dit niet is

Dit rapport past bij "uitzoeken", niet bij "opruimen": er is bewust niets aan de database gewijzigd. Punt 1 en 2 hierboven zijn losse, kleine vervolgtaken die ik apart kan oppakken zodra je groen licht geeft; de rest is een kwestie van bestaande tooling daadwerkelijk gebruiken (Google-key aanmaken, het beheer induiken, scripts periodiek draaien) in plaats van nieuw bouwwerk.
