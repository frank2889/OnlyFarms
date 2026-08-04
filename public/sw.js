// Offline-ondersteuning: statische assets cache-first, pagina's network-first
// met cache-fallback — zodat je lijst ook zonder bereik (supermarktkelder) opent.
const STATIC_CACHE = "of-static-v1";
// v2: privépagina's (lijst/profiel/beheer/portaal) mogen niet meer in de
// page-cache staan; bump ruimt oude, mogelijk gevoelige v1-cache op.
const PAGE_CACHE = "of-pages-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(PAGE_CACHE).then((c) => c.addAll(["/lijsten"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, PAGE_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Privépagina's: nooit in de page-cache bewaren, anders blijft de HTML na
// uitloggen op een gedeeld toestel (gezinstablet) offline opvraagbaar.
const PRIVATE_PREFIXES = ["/lijst/", "/profiel", "/beheer", "/portaal"];
function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Statische assets: cache-first
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icon")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
            return res;
          })
      )
    );
    return;
  }

  // Navigaties: network-first, cache als fallback (offline). Privépagina's
  // worden nooit weggeschreven (isPrivatePath), dus daar is ook nooit een
  // stale, mogelijk andermans, versie om terug te vallen.
  if (req.mode === "navigate") {
    const isPrivate = isPrivatePath(url.pathname);
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!isPrivate) {
            const clone = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          isPrivate
            ? caches.match("/lijsten")
            : caches.match(req).then((hit) => hit || caches.match("/lijsten"))
        )
    );
  }
});
