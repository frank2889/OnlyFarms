import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { SproutIcon } from "@/components/icons";
import DeadListCleanup from "@/components/DeadListCleanup";

/**
 * Een verwijderde of nooit bestaande lijst-token: eigen uitleg i.p.v. de
 * generieke 404. DeadListCleanup ruimt de dode token meteen uit `of_lists`
 * op zodat de Lijst-tab er niet naar terug blijft wijzen.
 */
export default function ListNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <DeadListCleanup />
      <SproutIcon width={40} height={40} className="text-terra-500" />
      <h1 className="text-2xl font-bold">{t("lists.listGoneTitle")}</h1>
      <p className="max-w-sm text-ink-500">{t("lists.listGoneText")}</p>
      <Link
        href="/lijsten"
        className="mt-2 rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
      >
        {t("lists.startNewList")}
      </Link>
      <Link href="/" className="text-sm text-ink-500 underline">
        {BRAND.name}: {t("common.backHome")}
      </Link>
    </main>
  );
}
