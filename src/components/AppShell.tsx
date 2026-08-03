"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, StoreIcon, UserIcon } from "@/components/icons";

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

// Vaste app-navigatie onderin (Bring-structuur): Lijst · Ontdek · Profiel.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const badge = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_badge") ?? "",
    () => ""
  );
  const badgeCount = Number(badge) || 0;
  // Tab "Lijst" opent direct je actieve (nieuwste) lijst; zonder lijsten het overzicht
  const rawLists = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_lists") ?? "[]",
    () => "[]"
  );
  let listHref = "/lijsten";
  try {
    const lists: { token: string }[] = JSON.parse(rawLists);
    if (lists[0]?.token) listHref = `/lijst/${lists[0].token}`;
  } catch {}

  const tabs = [
    { href: listHref, label: "Lijst", Icon: ListIcon, active: pathname.startsWith("/lijst"), badge: badgeCount },
    { href: "/producenten", label: "Ontdek", Icon: StoreIcon, active: pathname.startsWith("/produc") || pathname.startsWith("/provincie") },
    { href: "/profiel", label: "Profiel", Icon: UserIcon, active: pathname.startsWith("/profiel") || pathname.startsWith("/inloggen") },
  ];

  return (
    <>
      <div className="pb-20 sm:pb-0">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {tabs.map(({ href, label, Icon, active, badge: count }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex min-w-20 flex-col items-center gap-0.5 px-4 pb-3 pt-2.5 ${
                active ? "text-terra-600" : "text-ink-500"
              }`}
            >
              <Icon width={24} height={24} />
              <span className="text-xs font-medium">{label}</span>
              {!!count && label === "Lijst" && (
                <span className="absolute right-3 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
