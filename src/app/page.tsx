import Link from "next/link";

export const revalidate = 3600;

const CATEGORIES = [
  { key: "eieren", emoji: "🥚", label: "Eieren" },
  { key: "melk", emoji: "🥛", label: "Melk & zuivel" },
  { key: "kaas", emoji: "🧀", label: "Kaas" },
  { key: "vlees", emoji: "🥩", label: "Vlees" },
  { key: "groente", emoji: "🥬", label: "Groente" },
  { key: "fruit", emoji: "🍎", label: "Fruit" },
  { key: "aardappelen", emoji: "🥔", label: "Aardappelen" },
  { key: "honing", emoji: "🍯", label: "Honing" },
];

const STEPS = [
  {
    title: "Zoek in de buurt",
    text: "Voer je postcode of plaats in, of gebruik je locatie, en zie direct welke boerderijwinkels bij jou in de buurt zitten.",
  },
  {
    title: "Filter op product",
    text: "Op zoek naar verse eieren, rauwe melk of seizoensgroente? Filter de kaart op wat jij nodig hebt, ook op bio en verkoopautomaten.",
  },
  {
    title: "Bezoek de boerderij",
    text: "Bekijk openingstijden en route, en koop je producten rechtstreeks bij de boer — verser kan niet.",
  },
];

async function farmCount(): Promise<string> {
  try {
    const { db } = await import("@/db");
    const { farms } = await import("@/db/schema");
    const { count, ne } = await import("drizzle-orm");
    const [row] = await db
      .select({ n: count() })
      .from(farms)
      .where(ne(farms.status, "gestopt"));
    return row.n.toLocaleString("nl-NL");
  } catch {
    return "2.200+";
  }
}

export default async function Home() {
  const count = await farmCount();

  return (
    <main>
      <section className="bg-green-800 px-6 py-20 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold sm:text-5xl">
          Verse producten, rechtstreeks van de boer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-green-100">
          Vind {count} boerderijwinkels in heel Nederland — van verse eieren en
          rauwe melk tot seizoensgroente en honing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/kaart"
            className="rounded-lg bg-white px-6 py-3 font-medium text-green-800 hover:bg-green-50"
          >
            🗺️ Bekijk de kaart
          </Link>
          <Link
            href="/verkopen"
            className="rounded-lg border border-white/60 px-6 py-3 font-medium text-white hover:bg-white/10"
          >
            Verkopen via OnlyFarms
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">Zo werkt het</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                {i + 1}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 px-6 py-16 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">Wat zoek je?</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/kaart?product=${c.key}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-green-700 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="font-medium">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-neutral-500">
        OnlyFarms brengt kopers en verkopers bij elkaar en is geen partij bij de
        verkoop.
      </footer>
    </main>
  );
}
