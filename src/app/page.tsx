import Link from "next/link";
import { currentUserId } from "@/auth";
import { listsForUser, userById } from "@/lib/queries/accounts";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { currentSeason } from "@/lib/season";
import { iconForCategory } from "@/components/catalog-icons";
import { SproutIcon, StoreIcon } from "@/components/icons";
import HomeListPanel from "@/components/HomeListPanel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const season = currentSeason();
  const userId = await currentUserId();
  const [user, serverLists] = userId
    ? await Promise.all([userById(userId), listsForUser(userId)])
    : [null, []];

  return (
    <main>
      <header className="flex items-center justify-between px-6 py-4">
        <span className="inline-flex items-center gap-2 text-lg font-semibold">
          <SproutIcon width={22} height={22} className="text-terra-500" />
          {BRAND.name}
        </span>
        <nav className="flex gap-4 text-sm">
          <Link href="/producenten" className="text-terra-700 underline">
            {t("producers.title")}
          </Link>
          <Link href="/verkopen" className="text-terra-700 underline">
            Verkopen
          </Link>
          <Link href={user ? "/profiel" : "/inloggen"} className="text-terra-700 underline">
            {user ? user.name : "Inloggen"}
          </Link>
        </nav>
      </header>

      <section className={`${season.heroBg} px-6 py-20 text-center`}>
        <p className={`mb-3 text-sm font-semibold uppercase tracking-wide ${season.accentText}`}>
          {season.label}
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold sm:text-5xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">{t("home.heroText")}</p>
        <div className="mt-8">
          <HomeListPanel
            serverLists={serverLists.map((l) => ({ token: l.token, name: l.name }))}
          />
          <Link
            href="/producenten"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-terra-700 underline"
          >
            <StoreIcon width={16} height={16} /> {t("home.ctaProducers")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">{t("home.howTitle")}</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-terra-500 font-bold text-white">
                {n}
              </div>
              <h3 className="font-semibold">{t(`home.how${n}Title` as "home.how1Title")}</h3>
              <p className="mt-1 text-sm text-ink-500">
                {t(`home.how${n}Text` as "home.how1Text")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-100 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">{t("home.categoriesTitle")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.filter((c) => c.key !== "overig").map((c) => {
              const Icon = iconForCategory(c.key);
              return (
                <Link
                  key={c.key}
                  href={`/producenten?product=${c.key}`}
                  className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
                >
                  <Icon width={24} height={24} className="text-terra-500" />
                  <span className="font-medium">{c.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-ink-500">
        {t("home.footerRole", { brand: BRAND.name })}
      </footer>
    </main>
  );
}
