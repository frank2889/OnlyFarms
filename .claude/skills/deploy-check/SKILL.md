---
name: deploy-check
description: Standaard oplever-flow voor dit project - lint, build, commit, deploy naar Vercel en smoke-test. Gebruik bij "zet live", "deploy", of na afronden van elke wijziging die naar productie moet.
---

# Opleveren: lint → build → commit → deploy → smoke-test

Volgorde is verplicht; sla geen stap over.

```bash
npm run lint && npm run build          # moet allebei schoon zijn
git add -A && git commit -m "..."      # NL commit-bericht, wat+waarom
git push                                # main is protected; eigenaar kan bypassen (alleen solo doen)
npx vercel deploy --prod --yes          # CLI-deploy; merge naar main deployt ook automatisch
```

Smoke-test daarna minimaal:

```bash
for p in "/" "/lijsten" "/producenten" "/producent/boeren-pitstop-zeewolde" "/sitemap.xml"; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "https://onlyfarms-ten.vercel.app$p"
done
```

Bij UI-wijzigingen: daarna ook de `user-test`-skill draaien (echte browser, telefoonformaat, screenshots bekijken).

## Wetenswaardigheden

- Env-vars beheren: `npx vercel env ls|add|rm` (project "onlyfarms", team frank-pirets-projects). Nieuwe env-var werkt pas na een nieuwe deploy.
- Database-scripts draaien lokaal tegen productie-Neon via `.env.local`; laad env vóór dynamische `@/db`-import (ESM-hoisting).
- `db:push` na schemawijziging hoort "No changes" te melden als je de kolommen al via een migratie-script hebt gezet.
- Bij een mislukte deploy: `npx vercel inspect <url> --logs`.
