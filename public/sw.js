// Offline-ondersteuning: statische assets cache-first, pagina's network-first
// met cache-fallback — zodat je lijst ook zonder bereik (supermarktkelder) opent.
const STATIC_CACHE = "of-static-v1";
// v3: web-push-listeners toegevoegd; bump zodat al geïnstalleerde clients
// de nieuwe sw.js snel oppikken (v2: privépagina's niet meer in de page-cache).
const PAGE_CACHE = "of-pages-v3";

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

// Web push (deel 1: fundament). Nog geen echte verzending gekoppeld; dit
// luistert alleen naar wat er binnenkomt zodra dat er is.
self.addEventListener("push", (event) => {
  let data = { title: "OnlyFarms", body: "" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-512.png",
      data: { url: data.url || "/lijsten" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/lijsten";
  event.waitUntil(clients.openWindow(url));
});
