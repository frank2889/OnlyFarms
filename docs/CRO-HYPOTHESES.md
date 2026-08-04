# 100 CRO-hypotheses

Bron: Frank, 4 aug 2026 (aangeleverd onder de werknaam "Raccolo"; de productnaam blijft een werktitel via `src/lib/brand.ts`).

## Status en meting

**Meetfundament**: de primaire conversiemomenten hieronder worden sinds 4 aug 2026 gelogd in de eigen `events`-tabel (`src/lib/events.ts`, privacyvriendelijk: geen extern script, geen cookies) en geaggregeerd getoond op het beheer-dashboard. "Terugkeer binnen 7 dagen" is afleidbaar uit de events; premium bestaat nog niet.

**Al gedekt door gebouwde features** (stand 4 aug 2026):

- #4/#41 (lokale samenvatting bovenaan de lijst): tikbare banner "X van je Y boodschappen zijn lokaal verkrijgbaar" (4 aug 2026)
- #6/#18/#43 ("Nu open" prioriteren): open producenten eerst in matches + terra-chip (4 aug 2026)
- #7/#27-28 (voorbeeldlijst): één tik vanaf de homepage, 8 populaire items met brede dekking (4 aug 2026)
- #16 (zelf reisafstand kiezen): straal-instelling per lijst + account-brede vlakbij-radius op /profiel
- #44 (herkenbare foto) en #45 (praktische info: pinnen/automaat): volledigheids-checklist en praktisch-blok in het verkopersportaal
- #49 (laatst gecontroleerd tonen) en #50 (beschikbaarheid bevestigen): "Alles klopt nog"-knop + laatst-bevestigd-datum, publiek zichtbaar
- #67 (zien wie toevoegde, deels): Cheffs-berichten dragen de afzendernaam; itemniveau-attributie nog niet
- #75-77 (seizoen): seizoenstegels en swipe-deck bestaan; regionale weging nog niet
- #81-82 (vorige lijst/veelgekocht): "Eerder gekocht"-rij, swipe-winkelmodus, lijsten-met-teller op /profiel
- #86 (notificatiefrequentie zelf bepalen, fundament): account-brede instellingenstructuur op /profiel

**Nu meetbaar dankzij het event-fundament**: #1-10 (startpercentages), #21-22 (registratie-timing), #39-41 (match-openratio), #42-43/#59-60 (routeklikken), #61-63 (delen), #81/#88-90 (retentie via terugkeer-analyse).

**Expliciet later**: #36-37 (spraak/scan), #51-58 (slimme routes; vervoerswijze #53 kan eerder), #71-74/78-80 (markten-tab, vereist marktstandplaats-koppeling), #83-85 (push, vereist native app), #91-100 (premium, bestaat nog niet).

---

## Primaire metrics

De belangrijkste conversiemomenten zijn:

1. Account of gastlijst gestart
2. Eerste product toegevoegd
3. Locatie ingesteld
4. Eerste lokale match bekeken
5. Route naar producent geopend
6. Lijst gedeeld
7. Gebruiker komt binnen zeven dagen terug
8. Premium proefperiode gestart
9. Producent claimt profiel

## 1. Propositie en landingspagina

1. Als we "De boodschappenlijst die weet waar de boer woont" als hoofdkop gebruiken, starten meer bezoekers een lijst dan bij een functionele omschrijving. KPI: percentage bezoekers dat een lijst start.
2. Als we direct tonen hoeveel producenten en markten de app bevat, neemt het vertrouwen toe. KPI: klikpercentage naar starten of registreren.
3. Als bezoekers eerst hun postcode kunnen invullen, converteren meer mensen dan wanneer ze eerst een account moeten maken. KPI: percentage bezoekers dat een eerste lokale zoekopdracht uitvoert.
4. Als we concrete lokale resultaten voor registratie tonen, stijgt de accountconversie. KPI: registratiepercentage na resultaatweergave.
5. Als de homepage begint met "Wat staat er op jouw lijst?", begrijpen bezoekers het product sneller. KPI: percentage bezoekers dat een product toevoegt vanaf de homepage.
6. Als we de gedeelde boodschappenlijst als hoofdvoordeel presenteren, trekken we meer gebruikers dan wanneer lokaal kopen centraal staat. KPI: accountstarts en percentage gedeelde lijsten.
7. Als we lokaal kopen als extra gemak presenteren in plaats van als duurzame keuze, stijgt de conversie. KPI: percentage bezoekers dat de app start.
8. Als we echte producenten uit de regio tonen, stijgt het vertrouwen ten opzichte van generieke fotografie. KPI: doorklikpercentage naar producentenprofielen of registratie.
9. Als we een korte video met echte beelden en UI tonen, begrijpen meer bezoekers binnen tien seconden wat de app doet. KPI: videocompletion en startpercentage.
10. Als we "Gratis beginnen" gebruiken in plaats van "Account aanmaken", verlaagt dat de drempel. KPI: CTA-click-through-rate.

## 2. Regionale relevantie

11. Als we automatisch de vermoedelijke plaats van de bezoeker tonen, voelt de app direct relevanter. KPI: percentage gebruikers dat de locatie bevestigt.
12. Als bezoekers direct zien hoeveel lokale adressen binnen vijf kilometer liggen, starten meer mensen een lijst. KPI: lijststartpercentage.
13. Als we lokale resultaten tonen op productniveau, zoals eieren of kaas, converteren meer bezoekers dan bij algemene producentenlijsten. KPI: percentage bezoekers dat een productmatch opent.
14. Als de landingspagina automatisch een regionale kop toont, stijgt de conversie. Voorbeeld: "Lokaal boodschappen doen in Gouda." KPI: startpercentage per regio.
15. Als we een minimale datadichtheid garanderen voordat we een regio promoten, stijgt de activatie. KPI: percentage gebruikers met minimaal een lokale match.
16. Als gebruikers zelf hun maximale reisafstand kiezen, vinden zij de resultaten relevanter. KPI: routeklikpercentage.
17. Als de standaardafstand per productcategorie verschilt, stijgt het aantal bruikbare matches. Voorbeeld: brood binnen drie kilometer, kaasboerderij binnen tien kilometer. KPI: match-openratio.
18. Als locaties die nu open zijn standaard voorrang krijgen, openen meer gebruikers een route. KPI: aantal routeklikken.
19. Als we boerderijautomaten als aparte categorie tonen, stijgt het gebruik buiten reguliere openingstijden. KPI: avond- en zondaggebruik.
20. Als we weekmarkten combineren met producenten in een lokale resultatenweergave, ervaren gebruikers meer aanbod. KPI: percentage lijsten met minimaal een lokale match.

## 3. Onboarding

21. Als gebruikers zonder account kunnen beginnen, voegen meer mensen hun eerste product toe. KPI: percentage bezoekers dat een eerste product toevoegt.
22. Als registratie pas na de eerste lokale match wordt gevraagd, stijgt de registratieconversie. KPI: registratiepercentage na eerste match.
23. Als onboarding maximaal drie stappen bevat, voltooien meer gebruikers deze. KPI: onboarding completion rate.
24. Als locatie-instelling wordt uitgelegd als noodzakelijk voor lokale resultaten, geven meer gebruikers toestemming. KPI: percentage gebruikers dat locatietoestemming geeft.
25. Als gebruikers handmatig een postcode kunnen invoeren, vallen minder mensen af bij locatietoestemming. KPI: percentage gebruikers met een succesvolle locatie-instelling.
26. Als we tijdens onboarding vragen met wie iemand boodschappen doet, kunnen we relevantere functies tonen. KPI: uitnodigingspercentage en lijstdeelpercentage.
27. Als gebruikers een voorbeeldlijst kunnen kiezen, bereiken zij sneller de eerste waarde. KPI: tijd tot eerste lokale match.
28. Als de voorbeeldlijst populaire producten bevat, krijgt een groter percentage gebruikers direct matches. KPI: percentage gebruikers met minimaal een match in de eerste sessie.
29. Als we tijdens onboarding een korte UI-demo tonen, maken minder gebruikers bedieningsfouten. KPI: percentage gebruikers dat succesvol een eerste lijst afrondt.
30. Als we onboarding personaliseren voor gezin, stel of individuele gebruiker, stijgt de activatie. KPI: activatiepercentage per segment.

## 4. Eerste boodschappenlijst

31. Als het invoerveld direct actief staat bij openen, voegen gebruikers sneller een product toe. KPI: tijd tot eerste product.
32. Als populaire producten visueel worden voorgesteld, voegen meer gebruikers meerdere producten toe. KPI: gemiddeld aantal producten op de eerste lijst.
33. Als producttegels illustraties bevatten, herkennen gebruikers producten sneller dan met alleen tekst. KPI: toevoegingssnelheid.
34. Als recente of veelgekochte producten bovenaan staan, wordt een volgende lijst sneller opgebouwd. KPI: tijd tot complete lijst.
35. Als gebruikers meerdere producten achter elkaar kunnen toevoegen zonder het scherm te verlaten, stijgt het aantal producten per sessie. KPI: gemiddeld aantal producten per lijst.
36. Als spraakgestuurd toevoegen beschikbaar is, gebruiken drukke gezinnen de lijst vaker. KPI: gebruik van spraakfunctie en lijstvoltooiing.
37. Als gebruikers een foto of kassabon kunnen scannen om producten toe te voegen, stijgt de activatie. KPI: aantal gescande lijsten en terugkeerpercentage.
38. Als productcategorieen automatisch worden herkend, voelt de lijst overzichtelijker. KPI: lijstvoltooiing en gebruikerstevredenheid.
39. Als de app na drie producten al lokale beschikbaarheid samenvat, ervaren gebruikers sneller de USP. KPI: eerste match-openratio.
40. Als we na elk toegevoegd product subtiel tonen dat er een lokale match is, worden meer matches geopend. KPI: match-click-through-rate.

## 5. Lokale matches en producenten

41. Als we bovenaan tonen "4 van je 8 boodschappen zijn lokaal verkrijgbaar", openen meer gebruikers de matchweergave. KPI: match-openratio.
42. Als afstand, openingstijd en productbeschikbaarheid direct zichtbaar zijn, stijgt het aantal routeklikken. KPI: route-click-through-rate.
43. Als we "Nu open" visueel sterker tonen, kiezen gebruikers vaker voor een direct bezoek. KPI: routeklikken naar geopende locaties.
44. Als een producent een herkenbare locatie- of winkelfoto heeft, stijgt het profielbezoek. KPI: profiel-openratio.
45. Als we praktische informatie tonen zoals pinnen, zelfbediening en parkeren, neemt het vertrouwen toe. KPI: routeklikpercentage.
46. Als resultaten primair op relevantie worden gesorteerd in plaats van alleen op afstand, stijgt het gebruik van matches. KPI: match-openratio.
47. Als gebruikers kunnen kiezen tussen "Dichtstbij" en "Meeste producten", openen meer mensen een route. KPI: routegebruik.
48. Als we meerdere producten aan een producent koppelen, stijgt de kans op bezoek. KPI: routeklikken bij multi-productmatches.
49. Als we expliciet aangeven wanneer productinformatie voor het laatst is gecontroleerd, neemt het vertrouwen toe. KPI: profiel- en routeklikken.
50. Als gebruikers beschikbaarheid kunnen bevestigen, wordt de data sneller actueler en stijgt toekomstig gebruik. KPI: aantal beschikbaarheidsbevestigingen en herhaalbezoek.

## 6. Route en praktisch gebruik

51. Als de app een route langs meerdere producenten maakt, openen meer gebruikers navigatie. KPI: aantal route-starts.
52. Als we extra reistijd tonen in plaats van totale afstand, voelt lokaal kopen haalbaarder. KPI: route-startpercentage.
53. Als gebruikers kunnen kiezen tussen fiets, auto en lopen, stijgt routegebruik. KPI: geselecteerde vervoerswijze en routeklikken.
54. Als de app producenten op de route naar huis toont, stijgt het aantal bezochte locaties. KPI: routeklikken naar tussenstops.
55. Als we eerst de efficientste route tonen, ervaren gebruikers minder gedoe. KPI: routevoltooiing.
56. Als de app waarschuwt dat een locatie bijna sluit, nemen gebruikers sneller actie. KPI: directe routeklikken.
57. Als gebruikers adressen kunnen markeren als "Onderweg", stijgt het herhaalgebruik. KPI: aantal opgeslagen routes en locaties.
58. Als de route ook markten met relevante producten meeneemt, stijgt het aantal lokaal gematchte items. KPI: percentage geopende routes waarin een markt is opgenomen.
59. Als we "Slechts 6 minuten omrijden" als boodschap gebruiken, stijgt de klik naar navigatie. KPI: route-click-through-rate.
60. Als een route direct naar Google Maps of Apple Maps opent zonder extra stappen, daalt uitval. KPI: succesvolle externe navigatiestarts.

## 7. Delen en gezinsgebruik

61. Als een lijst via een link kan worden gedeeld zonder dat de ontvanger eerst een account maakt, stijgt deelname. KPI: percentage geaccepteerde uitnodigingen.
62. Als gastgebruikers direct producten kunnen afvinken, worden meer gedeelde lijsten actief gebruikt. KPI: aantal gastacties.
63. Als registratie pas wordt gevraagd nadat een gast waarde heeft ervaren, stijgt de conversie naar een account. KPI: gast-naar-accountconversie.
64. Als gebruikers boodschappen aan een persoon kunnen toewijzen, stijgt het gezinsgebruik. KPI: aantal toegewezen producten.
65. Als deadlines kunnen worden toegevoegd, worden meer toegewezen boodschappen uitgevoerd. KPI: percentage tijdig afgevinkte taken.
66. Als meldingen alleen bij relevante wijzigingen worden verstuurd, daalt notificatie-uitval. KPI: push-opt-out en retentie.
67. Als gebruikers kunnen zien wie een product heeft toegevoegd, neemt de duidelijkheid toe. KPI: minder verwijderde of dubbel toegevoegde producten.
68. Als de app na de eerste lijst voorstelt om een partner uit te nodigen, stijgt het deelpercentage. KPI: uitnodigingen per actieve gebruiker.
69. Als de uitnodiging de gezamenlijke waarde benoemt, wordt deze vaker geaccepteerd. Voorbeeld: "Doe mee met onze boodschappenlijst." KPI: acceptatiepercentage.
70. Als gezinsleden gezamenlijk favoriete producenten kunnen bewaren, stijgt het terugkerend gebruik. KPI: opgeslagen producenten en retentie.

## 8. Markten, inspiratie en seizoenen

71. Als "Markten bij jou in de buurt" een eigen tab krijgt, wordt deze vaker gebruikt dan wanneer markten tussen producenten staan. KPI: gebruik van de marktentab.
72. Als de app markten sorteert op eerstvolgende marktdag, stijgt de praktische relevantie. KPI: routeklikken naar markten.
73. Als gebruikers een melding krijgen op de dag voor een markt, stijgt marktbezoek. KPI: melding-openratio en routeklikken.
74. Als we tonen hoeveel lijstproducten waarschijnlijk op een markt verkrijgbaar zijn, stijgt de marktinteresse. KPI: percentage gebruikers dat een marktprofiel opent.
75. Als seizoensproducten direct aan de lijst kunnen worden toegevoegd, stijgt inspiratiegebruik. KPI: toevoegingen vanuit de seizoensmodule.
76. Als de app een blok "Nu uit jouw streek" toont, voegen gebruikers meer lokale producten toe. KPI: aantal lokale producttoevoegingen.
77. Als seizoenssuggesties gebaseerd zijn op regio en maand, worden ze vaker geopend. KPI: click-through-rate van seizoenssuggesties.
78. Als gebruikers markten als favoriet kunnen opslaan, stijgt herhaalbezoek rond marktdagen. KPI: terugkeerpercentage op marktdagen.
79. Als gebruikers kunnen aangeven welke productcategorieen zij op een markt zoeken, worden resultaten relevanter. KPI: routeklikken per marktbezoek.
80. Als een markt een eenvoudige kraam- of productindeling toont, neemt onzekerheid af. KPI: routeklikpercentage.

## 9. Retentie en notificaties

81. Als de app een vorige lijst met een tik opnieuw laat gebruiken, stijgt wekelijkse retentie. KPI: percentage gebruikers dat binnen zeven dagen een tweede lijst start.
82. Als veelgekochte producten automatisch worden voorgesteld, daalt de inspanning om een lijst te maken. KPI: tijd tot lijstvoltooiing.
83. Als gebruikers zelf een vaste boodschappendag instellen, werken herinneringen beter. KPI: lijststarts na notificatie.
84. Als meldingen concrete lokale waarde bevatten, worden ze vaker geopend dan generieke reminders. Voorbeeld: "De eieren op je lijst zijn vandaag lokaal verkrijgbaar." KPI: push-openratio.
85. Als notificaties rekening houden met openingstijden, stijgt het aantal bruikbare acties. KPI: routeklikken na push.
86. Als gebruikers hun notificatiefrequentie zelf bepalen, daalt uitschrijving. KPI: notificatiebehoud.
87. Als we na een routeklik vragen of de informatie klopte, stijgen betrokkenheid en datakwaliteit. KPI: feedbackpercentage.
88. Als gebruikers een wekelijkse samenvatting krijgen van lokale mogelijkheden, stijgt herhaalgebruik. KPI: weekretentie.
89. Als we vooruitgang tonen, zoals "3 producten lokaal gevonden", motiveert dat hergebruik. KPI: percentage gebruikers dat een volgende lijst start.
90. Als een inactieve gebruiker zijn vorige lijst direct kan hervatten vanuit e-mail of push, stijgt reactivatie. KPI: heractivatiepercentage.

## 10. Premium en inkomsten

91. Als premium pas wordt aangeboden nadat een gebruiker meerdere lokale matches heeft geopend, stijgt de betaalconversie. KPI: trial-startpercentage.
92. Als de premiumpropositie draait om tijd besparen in plaats van extra functies, stijgt de conversie. KPI: upgradepercentage.
93. Als slimme routes als premiumfunctie worden gepresenteerd, is de betalingsbereidheid hoger dan voor cosmetische voordelen. KPI: klikpercentage op upgrade bij de routefunctie.
94. Als gezinsgebruikers een gezamenlijk abonnement zien in plaats van individuele abonnementen, stijgt de aankoopintentie. KPI: checkout-starts voor het gezinsabonnement.
95. Als we een Founding Family-jaarprijs aanbieden, kiezen meer vroege gebruikers voor betaald. KPI: aantal jaarabonnementen.
96. Als gebruikers premium zeven of veertien dagen gratis kunnen proberen zonder directe betaling, starten meer mensen een proefperiode. KPI: trial-start en trial-to-paid.
97. Als een betaalmuur exact laat zien welke tijd of rit de functie bespaart, stijgt de upgradeconversie. KPI: betaalconversie.
98. Als jaarabonnementen als standaardkeuze worden getoond, stijgt de gemiddelde klantwaarde. KPI: aandeel jaarabonnementen.
99. Als premiumgebruikers exclusieve producentenvoordelen krijgen, stijgt de waargenomen waarde. KPI: upgrade-intentie en gebruik van voordelen.
100. Als we verschillende prijsankers testen, vinden we een prijs die omzet maximaliseert zonder activatie sterk te remmen. Voorbeeldtest: 3,99 versus 4,99 euro individueel en 6,99 versus 8,99 euro voor gezinnen. KPI: omzet per 100 actieve gebruikers.

## Eerste 15 hypotheses om te prioriteren (volgens Frank)

1. Eerst postcode invoeren, daarna pas registratie
2. Gastgebruik toestaan (bestaat al: anonieme lijsten)
3. Waarde tonen voor accountaanmaak
4. "X producten lokaal verkrijgbaar" bovenaan de lijst
5. Direct afstand, openingstijd en route tonen (bestaat grotendeels)
6. "Nu open" prioriteren
7. Een voorbeeldlijst aanbieden
8. Lijst delen via een link zonder account (bestaat al)
9. Marktmelding een dag vooraf
10. Vorige lijst met een tik herhalen
11. Concrete lokale pushmeldingen
12. Slimme route langs meerdere adressen
13. Extra reistijd tonen in plaats van kilometers (reistijd wordt al getoond)
14. Premium pas tonen na bewezen gebruik
15. Founding Family-jaarabonnement testen
