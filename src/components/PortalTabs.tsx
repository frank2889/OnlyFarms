"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

export default function PortalTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/portaal", label: t("portal.tabOverview"), exact: true },
    { href: "/portaal/vermelding", label: t("portal.tabDetails") },
    { href: "/portaal/fotos", label: t("portal.tabPhotos") },
    { href: "/portaal/producten", label: t("portal.tabProducts") },
  ];
  return (
    <nav className="-mx-4 flex gap-1.5 overflow-x-auto border-b border-cream-200 bg-white px-4 py-2">
      {tabs.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
              active ? "bg-terra-500 font-medium text-white" : "text-ink-700 hover:bg-cream-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
