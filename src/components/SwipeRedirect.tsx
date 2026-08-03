"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

// Anonieme bezoeker op /swipen: actieve lijst uit localStorage halen en
// doorsturen naar het deck; zonder lijsten naar het lijstenoverzicht.
export default function SwipeRedirect() {
  const router = useRouter();

  useEffect(() => {
    let token: string | null = null;
    try {
      const lists: { token: string }[] = JSON.parse(localStorage.getItem("of_lists") ?? "[]");
      token = lists[0]?.token ?? null;
    } catch {}
    router.replace(token ? `/lijst/${token}/swipen` : "/lijsten");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-ink-500">
      {t("common.loading")}
    </main>
  );
}
