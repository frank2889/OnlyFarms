import Link from "next/link";
import { currentUserId } from "@/auth";
import { listsForUser, userById } from "@/lib/queries/accounts";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { currentSeason } from "@/lib/season";
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
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/verkopen" className="text-terra-700 underline">
            Verkopen
          </Link>
          <Link href={user ? "/profiel" : "/inloggen"} className="text-terra-700 underline">
            {user ? user.name : "Inloggen"}
          </Link>
        </nav>
      </header>

      <section className={`${season.heroBg} px-6 py-10 text-center sm:py-16`}>
        <p className={`mb-3 text-sm font-semibold uppercase tracking-wide ${season.accentText}`}>
          {season.label}
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold sm:text-5xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-500 sm:text-lg">{t("home.heroText")}</p>
        <div className="mt-6">
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

      <footer className="border-t border-cream-200 px-6 py-10 text-center text-sm text-ink-500">
        {t("home.footerRole", { brand: BRAND.name })}
      </footer>
    </main>
  );
}
