// Offline-ondersteuning: statische assets cache-first, pagina's network-first
// met cache-fallback — zodat je lijst ook zonder bereik (supermarktkelder) opent.
const STATIC_CACHE = "of-static-v1";
const PAGE_CACHE = "of-pages-v1";

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

  // Navigaties: network-first, cache als fallback (offline)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/lijsten"))
        )
    );
  }
});
