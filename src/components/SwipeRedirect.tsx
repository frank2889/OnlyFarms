"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { activeToken, listsSnapshot, pinnedSnapshot } from "@/lib/lists-local";

// Anonieme bezoeker op /swipen: actieve lijst uit localStorage halen en
// doorsturen naar het deck; zonder lijsten naar het lijstenoverzicht.
export default function SwipeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = activeToken(listsSnapshot(), pinnedSnapshot());
    router.replace(token ? `/lijst/${token}/swipen` : "/lijsten");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-ink-500">
      {t("common.loading")}
    </main>
  );
}
