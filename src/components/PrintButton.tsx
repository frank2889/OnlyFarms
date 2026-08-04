"use client";

import { t } from "@/lib/i18n";

export default function PrintButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={`rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 ${className ?? ""}`}
    >
      {t("portal.promotePrintButton")}
    </button>
  );
}
