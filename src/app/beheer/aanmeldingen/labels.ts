import { t } from "@/lib/i18n";
import type { SellerStatus } from "@/lib/queries/admin";

export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  aangemeld: t("admin.sellerStatus.aangemeld"),
  in_beoordeling: t("admin.sellerStatus.in_beoordeling"),
  goedgekeurd: t("admin.sellerStatus.goedgekeurd"),
  afgewezen: t("admin.sellerStatus.afgewezen"),
  geschorst: t("admin.sellerStatus.geschorst"),
};

export function sellerStatusBadgeClass(status: SellerStatus): string {
  if (status === "goedgekeurd") return "bg-terra-100 text-terra-700";
  if (status === "afgewezen" || status === "geschorst") return "bg-ink-100 text-ink-700";
  return "bg-cream-200 text-ink-700";
}
