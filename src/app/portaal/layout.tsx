import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { requireSellerUser } from "@/lib/authz";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { SproutIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: `${t("portal.title")} | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

// Defense-in-depth: elke portaal-page en -action checkt daarnaast zélf
// requireSellerUser() (layouts renderen niet opnieuw bij client-navigatie).
export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireSellerUser();
  if (!ctx) {
    const userId = await currentUserId();
    if (!userId) redirect("/inloggen?terug=/portaal");
    // Wel ingelogd, geen gekoppelde verkoper: uitleg in plaats van een kale redirect
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-16">
        <h1 className="mb-2 text-2xl font-bold">{t("portal.noSellerTitle")}</h1>
        <p className="mb-6 text-ink-700">{t("portal.noSellerText")}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/verkopen"
            className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
          >
            {t("portal.toSell")}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-cream-300 bg-white px-6 py-3 font-medium hover:border-terra-400"
          >
            {t("portal.toSite")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-cream-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <Link href="/portaal" className="inline-flex min-w-0 items-center gap-2">
            <SproutIcon width={18} height={18} className="text-terra-500" />
            <span className="hidden font-semibold sm:inline">{BRAND.name}</span>
            <span className="rounded-full bg-terra-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              {t("portal.title")}
            </span>
            <span className="min-w-0 truncate text-sm text-ink-500">{ctx.seller.name}</span>
          </Link>
          <nav className="ml-auto flex shrink-0 items-center gap-3 text-sm">
            <Link href="/lijsten" className="text-ink-500 hover:underline">
              {t("portal.myLists")}
            </Link>
            <Link href="/" className="text-terra-700 hover:underline">
              {t("portal.toSite")}
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
