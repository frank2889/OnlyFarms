# Samenwerken op GitHub: uitleg voor het hele team

Deze gids is geschreven voor teamleden die geen developer zijn (Sally, Chimene). Je kunt hiermee zelf aanpassingen doen aan teksten, documenten én design, veilig, zonder dat er iets stuk kan gaan op de live site. Voor het meeste heb je alleen een browser nodig.

## Hoe ons systeem werkt (1 minuut lezen)

- De repository (kortweg "repo") is de map met alle code en documenten van het project: github.com/frank2889/OnlyFarms.
- De branch `main` is de hoofdversie. Alles wat op `main` staat, zet Vercel automatisch live op de site.
- Daarom is `main` op slot: niemand kan er rechtstreeks op schrijven, ook Frank hoort dat niet te doen.
- Elke wijziging gaat zo: je maakt een **branch** (een eigen kopie om in te werken), doet daar je aanpassing, en opent een **pull request** (een voorstel: "dit wil ik wijzigen"). Iemand anders uit het team keurt het goed, de automatische controles moeten slagen, en dan wordt het samengevoegd met `main` en staat het live.

Het klinkt omslachtig, maar het betekent: je kunt niets kapotmaken. Alles wordt eerst gecontroleerd, alles is terug te draaien, en je ziet je wijziging vooraf op een preview-versie van de site.

## Woordenlijst

| Woord | Betekenis |
| --- | --- |
| Branch | Een werk-kopie van het project waarin je veilig kunt wijzigen |
| Commit | Eén opgeslagen wijziging, met een korte omschrijving erbij |
| Pull request (PR) | Je voorstel om jouw branch samen te voegen met `main` |
| Review | Een teamgenoot bekijkt je PR en keurt goed (of vraagt om aanpassing) |
| Merge | Het samenvoegen: jouw wijziging wordt onderdeel van `main` |
| Checks / CI | Automatische controles (lint en build) die bij elke PR draaien |
| Preview | Tijdelijke versie van de site met jouw wijziging erin, om te bekijken |
| Conflict | Twee mensen wijzigden hetzelfde stukje; moet handmatig opgelost worden |

## Route 1: alles via de browser (aanrader)

Voor teksten, documenten en kleine aanpassingen is dit de makkelijkste weg. De knoppen op GitHub zijn in het Engels, daarom staan ze hieronder letterlijk genoemd.

1. Ga naar github.com/frank2889/OnlyFarms en klik naar het bestand dat je wilt aanpassen.
2. Klik rechtsboven op het potlood-icoon ("Edit this file"). Een nieuw bestand toevoegen kan via de knop "Add file".
3. Doe je aanpassing in de editor.
4. Klik op de groene knop "Commit changes...". Omdat `main` beschermd is, stelt GitHub automatisch voor om een nieuwe branch te maken. Dat is precies de bedoeling.
   - Geef je branch een duidelijke naam: `sally/welkomsmail-tekst` (jouw naam, streepje, wat je deed).
   - Vul bij "Commit message" kort in wat je hebt gewijzigd, bijvoorbeeld "Welkomsttekst aangepast".
5. Klik "Propose changes". Je komt op de pagina "Open a pull request".
6. Schrijf in de beschrijving wat je hebt gewijzigd en waarom, en klik "Create pull request".
7. Wacht een paar minuten. Er gebeuren nu twee dingen automatisch:
   - De checks draaien (groen vinkje = goed, rood kruis = er zit een fout in, vraag dan hulp).
   - De Vercel-bot plaatst een reactie met een preview-link ("Visit Preview"). Klik erop en controleer of je wijziging er goed uitziet op de site.
8. Vraag een review: rechts op de PR-pagina bij "Reviewers" kies je een teamgenoot (meestal frank2889).
9. Na goedkeuring klik je op "Merge pull request" en daarna "Confirm merge". Ruim daarna op met "Delete branch" (de kopie is dan niet meer nodig, je wijziging staat veilig in `main`).
10. Vercel zet `main` automatisch live. Na een paar minuten staat je wijziging op de echte site.

Nog iets vergeten terwijl je PR openstaat? Geen probleem: bewerk hetzelfde bestand opnieuw op jouw branch (GitHub vraagt er niet nog eens om, je zit al op je eigen branch via de PR). Elke nieuwe commit komt automatisch in dezelfde PR terecht.

## Route 2: GitHub Desktop (voor grotere klussen)

Wil je meerdere bestanden tegelijk aanpassen of lokaal werken, gebruik dan de gratis app GitHub Desktop (desktop.github.com):

1. Installeer de app en log in met je GitHub-account.
2. "Clone repository" en kies frank2889/OnlyFarms. Je hebt nu de hele map op je computer.
3. Klik bovenin op "Current branch" en dan "New branch". Geef hem een naam (`sally/onderwerp`) en baseer hem op `main`.
4. Pas bestanden aan in je eigen editor. GitHub Desktop ziet vanzelf wat je wijzigde.
5. Typ linksonder een korte omschrijving en klik "Commit to sally/onderwerp".
6. Klik "Publish branch" (of "Push origin") en daarna "Create Pull Request". Vanaf daar gaat het verder in de browser, zoals bij route 1 vanaf stap 6.

Belangrijk: haal vóór je begint altijd de nieuwste versie op ("Fetch origin" en zorg dat je vanaf een actuele `main` vertrekt). Dan voorkom je conflicten.

## Design aanpassen

Design is hier gewoon een bestand wijzigen, dus het proces is identiek: branch, PR, review, merge. Het verschil zit in wélke bestanden je aanpast en hoe je het resultaat bekijkt.

### Waar het design woont

| Wat | Waar | Toelichting |
| --- | --- | --- |
| Kleuren | `src/app/globals.css` | De enige plek met kleurcodes (hexwaarden). Drie families: terra (warm oranjebruin, hoofdkleur), ink (donker neutraal, tekst), cream (achtergrond). Elke familie heeft tinten van licht (50) naar donker (900). |
| Seizoensaccenten | `src/lib/season.ts` | De site kleurt subtiel mee met het seizoen |
| Vormgeving van schermen | `src/components/*.tsx` | Styling staat als woorden in `class="..."` (Tailwind, zie hieronder) |
| Iconen | `src/components/icons.tsx` (lijn-stijl, interface) en `src/components/food-icons.tsx` (gevuld, producten) | Alles is eigen SVG |
| Animaties | onderin `src/app/globals.css` | Zachte micro-animaties |

Styling in componenten werkt met **Tailwind**: korte woorden in het `class`-attribuut. Een paar voorbeelden zodat je het kunt lezen: `p-4` is ruimte aan de binnenkant, `rounded-xl` is afgeronde hoeken, `text-lg` is grotere tekst, `bg-terra-500` is achtergrond in onze hoofdkleur, `font-semibold` is halfvet. Opzoeken wat een woord doet kan op tailwindcss.com. Kleuren verwijzen altijd naar onze eigen families (`terra`, `ink`, `cream`); nooit losse kleurcodes in een component zetten.

### Je designwijziging bekijken

Er zijn twee manieren:

1. **Zonder iets te installeren (prima voor kleine aanpassingen)**: wijzig het bestand via de browser en open een PR zoals bij route 1. De Vercel-bot bouwt automatisch een preview van de hele site met jouw wijziging erin. Niet goed? Pas het bestand op je branch opnieuw aan; elke commit geeft een nieuwe preview. De feedback duurt wel een paar minuten per rondje.
2. **Lokaal werken (voor echt design-werk)**: dan zie je elke wijziging direct in je browser. Eenmalige setup, vraag Frank om even mee te kijken:
   - GitHub Desktop (repo clonen, zie route 2) en een editor zoals VS Code (gratis, code.visualstudio.com).
   - Node 22 installeren (nodejs.org), dan in de projectmap `npm install`.
   - Het bestand `.env.local` van Frank krijgen (staat bewust niet op GitHub).
   - `npm run dev` starten en `http://localhost:3000` openen: elke opgeslagen wijziging verschijnt direct, zonder herladen.
   - Klaar met een klus? Committen en PR openen via GitHub Desktop, zoals bij route 2.

Tip voor allebei: bekijk het resultaat altijd óók op telefoonformaat. In Chrome: rechtermuisklik, "Inspect", dan het telefoon-icoontje linksboven (kies bijvoorbeeld iPhone 12 Pro). Mobiel is bij ons de norm, desktop de bonus.

### Design-huisregels (samenvatting van [../AGENTS.md](../AGENTS.md))

1. **Bring is de lat**: bij twijfel over hoe iets moet werken of voelen, doe wat de Bring-app doet.
2. **Maximaal 3 kleurfamilies** (terra/ink/cream); nieuwe hexcodes alleen in `globals.css`, nergens anders.
3. **Geen emoji's**, alleen eigen SVG-iconen in de bestaande stijl.
4. **Geen dark mode** (bewuste keuze, licht en warm).
5. **Toegankelijk voor oudere gebruikers**: grote tikvlakken, leesbare labels, goed contrast.
6. **Geen em-dashes** in teksten die gebruikers zien.

Grote design-ideeën (nieuwe schermen, andere flows) eerst even overleggen in het team voordat je gaat bouwen; kleuren, afstanden, teksten en iconen kun je gewoon zelf via een PR voorstellen.

## Zelf een review doen

Ook goedkeuren is teamwerk, en je kunt er niets mee stukmaken:

1. Open de PR en klik op het tabblad "Files changed". Groen = toegevoegd, rood = verwijderd.
2. Wil je iets zeggen over een specifieke regel, beweeg eroverheen en klik op de blauwe plus.
3. Klik rechtsboven "Review changes" en kies "Approve" (goed zo) of "Request changes" (eerst dit aanpassen), met een korte toelichting.

Je kunt je eigen PR niet goedkeuren; er is altijd een tweede paar ogen nodig. Dat is bewust.

## Gouden regels

1. **Nooit rechtstreeks op `main`** (lukt ook niet, hij is op slot).
2. **Eén onderwerp per PR.** Kleine voorstellen zijn sneller te beoordelen en veiliger samen te voegen.
3. **Duidelijke branchnamen**: `jouwnaam/wat-je-doet`.
4. **Nooit wachtwoorden, API-keys of klantdata in de repo.** De repo is openbaar, iedereen op internet kan meelezen. Geheimen horen alleen in `.env.local` (lokaal) en in Vercel, vraag Frank.
5. **Huisregels voor teksten**: geen emoji's en geen em-dashes (het lange streepje) in teksten van de site. Alle zichtbare teksten staan in `src/messages/nl.json`. Meer huisregels: [../AGENTS.md](../AGENTS.md).
6. **Twijfel je?** Vraag Frank of laat Claude meekijken. Vragen is gratis, gokken op productie niet.

## Als er iets misgaat

- **Rood kruis bij de checks**: er zit ergens een fout in (bij `nl.json` bijvoorbeeld een vergeten komma of aanhalingsteken). Niets is stuk, want het staat nog niet op `main`. Vraag hulp in de PR.
- **"This branch has conflicts"**: iemand anders wijzigde hetzelfde stuk terwijl jouw PR openstond. Los het niet zelf op als je niet zeker bent; vraag Frank.
- **Toch iets verkeerds gemerged?** Op de PR-pagina staat na het mergen een knop "Revert": die maakt automatisch een nieuwe PR die alles terugdraait.
- Onthoud: in git gaat nooit iets echt verloren. Elke versie van elk bestand blijft bewaard.

## Waar vind ik wat (snel overzicht)

| Wat | Waar |
| --- | --- |
| Alle teksten van de site | `src/messages/nl.json` (JSON: aanhalingstekens en komma's luisteren nauw) |
| Design: kleuren, componenten, iconen | zie het hoofdstuk "Design aanpassen" hierboven |
| Documentatie en plannen | `docs/`, met [PLAN.md](PLAN.md) als productplan |
| Teamuitleg en setup | [../README.md](../README.md) |
| Klaviyo-koppeling | `src/lib/klaviyo.ts` (aanpassen in overleg met Frank) |

Teksten en design kun je dus zelf voorstellen via een PR. Voor de logica erachter (database, zoekfuncties, server-code) geldt: eerst overleggen met Frank of Claude laten meebouwen, maar ook dan is het proces precies hetzelfde: branch, PR, review, merge.
