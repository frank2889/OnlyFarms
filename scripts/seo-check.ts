/**
 * Technische SEO-controle: draait tegen een draaiende site en valideert
 * canonicals, og-images, titels, noindex en JSON-LD. Hoort bij de
 * deploy-check (AGENTS.md).
 *
 *   npx tsx scripts/seo-check.ts                      # localhost:3000
 *   npx tsx scripts/seo-check.ts https://voorbeeld.nl # productie
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

let failures = 0;
function ok(label: string, cond: boolean, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"} ${label}${extra ? ` :: ${extra}` : ""}`);
  if (!cond) failures++;
}

async function fetchText(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, body: res.status < 300 ? await res.text() : "" };
}

function metas(body: string, needle: RegExp): string[] {
  return [...body.matchAll(needle)].map((m) => m[1]);
}

function jsonLdBlocks(body: string): object[] {
  const blocks = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map((b) => JSON.parse(b[1]));
}

function typesIn(blocks: object[]): string[] {
  return blocks.map((b) => (b as { "@type"?: string })["@type"] ?? "?");
}

async function checkPublicPage(path: string, expectLdTypes: string[] = []) {
  const { status, body } = await fetchText(path);
  ok(`${path}: status 200`, status === 200, String(status));
  if (status !== 200) return;

  const canonicals = metas(body, /<link rel="canonical" href="([^"]+)"/g);
  ok(`${path}: exact één canonical`, canonicals.length === 1, canonicals.join(","));
  if (canonicals.length === 1) {
    ok(`${path}: canonical is absoluut`, canonicals[0].startsWith("https://"), canonicals[0]);
  }

  const ogImages = metas(body, /<meta property="og:image" content="([^"]+)"/g);
  ok(`${path}: og:image absoluut aanwezig`, ogImages.length >= 1 && ogImages[0].startsWith("http"));

  const titles = metas(body, /<title>([^<]*)<\/title>/g);
  ok(`${path}: exact één title`, titles.length === 1);
  if (titles.length === 1) {
    const suffixCount = titles[0].split("|").length - 1;
    ok(`${path}: geen dubbele titel-suffix`, suffixCount <= 1, titles[0]);
  }

  ok(`${path}: geen noindex`, !/name="robots"[^>]*noindex/.test(body));

  let blocks: object[] = [];
  try {
    blocks = jsonLdBlocks(body);
  } catch (e) {
    ok(`${path}: JSON-LD parset`, false, String(e).slice(0, 80));
    return;
  }
  for (const type of expectLdTypes) {
    const found = blocks.find((b) => (b as { "@type"?: string })["@type"] === type) as
      | Record<string, unknown>
      | undefined;
    ok(`${path}: JSON-LD ${type} aanwezig`, !!found, typesIn(blocks).join(","));
    if (!found) continue;
    if (type === "BreadcrumbList") {
      const items = found.itemListElement as unknown[] | undefined;
      ok(`${path}: BreadcrumbList heeft items`, Array.isArray(items) && items.length >= 2);
    }
    if (["LocalBusiness", "GroceryStore", "Brewery", "Bakery", "Winery"].includes(type)) {
      ok(`${path}: LocalBusiness heeft name+address`, !!found.name && !!found.address);
      const geo = found.geo as { latitude?: unknown; longitude?: unknown } | undefined;
      ok(
        `${path}: geo compleet of afwezig`,
        !geo || (geo.latitude != null && geo.longitude != null)
      );
    }
  }
}

async function checkNoindex(path: string) {
  const { status, body } = await fetchText(path);
  ok(`${path}: privé-pagina bereikbaar of redirect`, status === 200 || (status >= 300 && status < 400), String(status));
  if (status === 200) {
    ok(`${path}: meta-noindex aanwezig`, /name="robots"[^>]*noindex/.test(body));
  }
}

async function main() {
  // 1. Sitemap: entries tellen, provincies valideren, producenten samplen
  const { status, body: xml } = await fetchText("/sitemap.xml");
  ok("/sitemap.xml: status 200", status === 200, String(status));
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok("/sitemap.xml: bevat 2000+ URL's", urls.length > 2000, String(urls.length));
  ok("/sitemap.xml: geen /lijsten meer", !urls.some((u) => u.endsWith("/lijsten")));
  ok("/sitemap.xml: lastModified aanwezig", /<lastmod>/.test(xml));
  const provincieUrls = urls.filter((u) => u.includes("/provincie/"));
  ok("/sitemap.xml: 12 provincies", provincieUrls.length === 12, String(provincieUrls.length));

  const producentPaths = urls
    .filter((u) => u.includes("/producent/"))
    .map((u) => new URL(u).pathname);
  const sample = [0, 1, 2].map((i) =>
    producentPaths[Math.floor(((i + 1) / 4) * producentPaths.length)]
  );

  // 2. Publieke pagina's
  await checkPublicPage("/", []);
  await checkPublicPage("/producenten", []);
  await checkPublicPage("/provincie/gelderland", ["BreadcrumbList", "ItemList"]);
  await checkPublicPage("/verkopen", []);
  for (const path of sample) {
    await checkPublicPage(path, ["BreadcrumbList"]);
    // LocalBusiness kan een specifieker type zijn; check dat er naast de
    // breadcrumb nog een tweede blok met name+address is
    const { body } = await fetchText(path);
    const blocks = jsonLdBlocks(body).filter(
      (b) => (b as { "@type"?: string })["@type"] !== "BreadcrumbList"
    ) as Record<string, unknown>[];
    const business = blocks.find((b) => b.name && b.address);
    ok(`${path}: business-JSON-LD met name+address`, !!business, typesIn(blocks).join(","));
  }

  // 3. Facetten en privé-pagina's
  const facet = await fetchText("/producenten?q=kaas");
  ok("/producenten?q=: noindex", /name="robots"[^>]*noindex/.test(facet.body));
  await checkNoindex("/lijsten");
  await checkNoindex("/inloggen");
  await checkNoindex("/registreren");
  await checkNoindex("/gezin/testcode123");
  await checkNoindex("/profiel");

  // 4. Redirects en og-images
  const kaart = await fetch(`${BASE}/kaart`, { redirect: "manual" });
  ok("/kaart: permanente redirect (308)", kaart.status === 308, String(kaart.status));
  const og = await fetch(`${BASE}/opengraph-image`);
  ok("/opengraph-image: rendert (200, image)", og.status === 200 && (og.headers.get("content-type") ?? "").startsWith("image/"));
  if (sample[0]) {
    const pog = await fetch(`${BASE}${sample[0]}/opengraph-image`);
    ok(`${sample[0]}/opengraph-image: rendert`, pog.status === 200 && (pog.headers.get("content-type") ?? "").startsWith("image/"));
  }

  console.log(failures === 0 ? "\nSEO-CHECK GESLAAGD" : `\nSEO-CHECK: ${failures} afwijkingen`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
