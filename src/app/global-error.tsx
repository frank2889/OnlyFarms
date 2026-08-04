"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import "./globals.css";

/**
 * Vangnet voor een fout in de root layout zelf (zeldzaam); moet zijn eigen
 * html/body renderen omdat de layout er dan niet is. Bewust minimaal: geen
 * AppShell/JsonLd/lettertypen, alleen wat nodig is om iets bruikbaars te tonen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="min-h-screen bg-cream-50">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-bold">{t("common.errorTitle")}</h1>
          <p className="max-w-sm text-ink-500">{t("common.errorText")}</p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={reset}
              className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
            >
              {t("common.errorRetry")}
            </button>
            <Link
              href="/"
              className="rounded-full border border-cream-300 px-6 py-3 font-medium text-ink-700 hover:bg-cream-50"
            >
              {BRAND.name}: {t("common.backHome")}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
