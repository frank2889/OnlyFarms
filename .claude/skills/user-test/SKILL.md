---
name: user-test
description: Test de app als echte gebruiker met Playwright op telefoonformaat tegen productie. Gebruik bij "test als gebruiker", "werkt X", "kijk naar de UX", na elke deploy van UI-wijzigingen, of als iemand een bug meldt die je niet kunt verklaren.
---

# Als gebruiker testen (Playwright, 390×844)

Gebruiksvriendelijkheid is hier topprioriteit; verifieer UI-werk altijd zoals een gebruiker het ervaart — niet alleen met curl.

## Opzet

Playwright staat in de sessie-scratchpad geïnstalleerd (anders: `npm i playwright` in een scratch-map, Chromium-builds staan in `~/Library/Caches/ms-playwright`). Draai tegen productie: `https://onlyfarms-ten.vercel.app` (of een preview-URL).

```js
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-formaat
```

## Vaste patronen

- **Lijst-flow**: home → `input[placeholder*="Naam van de lijst"]` vullen → `button:has-text("Start je lijst")` → `waitForURL("**/lijst/**")`.
- **Tegel aanklikken**: eerst `await tile.scrollIntoViewIfNeeded()` — elementen buiten het viewport krijgen anders geen muisevents (bekende testfout).
- **Long-press**: `mouse.down()` → `waitForTimeout(700)` → `mouse.up()` op het tegel-midden.
- **Selectors met aanhalingstekens in de tekst**: gebruik `page.getByRole('button', { name: /regex/ })` — `:has-text("...\"...\"")` parset niet.
- **Offline testen**: `await context.setOffline(true)` → interactie → reload → `setOffline(false)`; controleer de offline-banner, optimistic gedrag en SW-cache.
- **Meet reactietijd**: `Date.now()` vóór klik, `waitForSelector` op het verwachte effect (eis: optimistic UI < 100 ms).
- **Screenshots áltijd bekijken** (Read op de PNG) — de helft van de bevindingen zie je alleen visueel (afgekapte labels, overflow, contrast).
- **Overflow-check**: `page.evaluate(() => document.body.scrollWidth > window.innerWidth)` moet false zijn.

## Testaccounts

Drie testaccounts (Frank/Chimene/Sally), elk een eigen gezin — credentials staan NIET in de repo (publiek); vraag Frank of kijk in de sessiegeschiedenis. Log in via `/inloggen` met `input[type="email"]` / `input[type="password"]`.

## Opruimen

Testlijsten en -accounts die je aanmaakt in productie daarna verwijderen via een tsx-script tegen `DATABASE_URL` (patroon: delete op `users.email like '%@example.com'` en de aangemaakte lijst-ids).
