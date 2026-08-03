import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { SproutIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <SproutIcon width={40} height={40} className="text-terra-500" />
      <h1 className="text-2xl font-bold">{t("common.notFoundTitle")}</h1>
      <p className="max-w-sm text-ink-500">{t("common.notFoundText")}</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
      >
        {BRAND.name}: {t("common.backHome")}
      </Link>
    </main>
  );
}
