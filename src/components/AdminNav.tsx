"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { SproutIcon } from "@/components/icons";

export type QueueBadges = {
  openReports: number;
  pendingSellers: number;
  pendingReviews: number;
  pendingOffers: number;
};

// Beheer-topbar: bewust een ander smoelwerk (donker) dan de consumentenkant,
// maar met dezelfde kleurtokens. Horizontaal scrollbaar zodat hij ook op
// telefoonformaat werkt.
export default function AdminNav({ badges }: { badges: QueueBadges }) {
  const pathname = usePathname();
  const items = [
    { href: "/beheer", label: t("admin.navDashboard"), count: 0 },
    { href: "/beheer/meldingen", label: t("admin.navReports"), count: badges.openReports },
    { href: "/beheer/aanmeldingen", label: t("admin.navSellers"), count: badges.pendingSellers },
    { href: "/beheer/producenten", label: t("admin.navProducers"), count: 0 },
    { href: "/beheer/aanbod", label: t("admin.navOffers"), count: badges.pendingOffers },
    { href: "/beheer/ervaringen", label: t("admin.navReviews"), count: badges.pendingReviews },
    { href: "/beheer/gebruikers", label: t("admin.navUsers"), count: 0 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2" title={t("admin.toSite")}>
          <SproutIcon width={18} height={18} className="text-terra-300" />
          <span className="hidden font-semibold sm:inline">{BRAND.name}</span>
          <span className="rounded-full bg-terra-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
            {t("admin.title")}
          </span>
        </Link>
        <nav className="-mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 py-1">
          {items.map(({ href, label, count }) => {
            const active = href === "/beheer" ? pathname === "/beheer" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  active ? "bg-white/15 font-medium text-white" : "text-cream-200 hover:bg-white/10"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terra-500 px-1 text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
