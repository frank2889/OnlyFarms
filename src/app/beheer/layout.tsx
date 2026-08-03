import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { requireAdminUser } from "@/lib/authz";
import { queueCounts } from "@/lib/queries/stats";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import AdminNav from "@/components/AdminNav";

export const metadata: Metadata = {
  title: `${t("admin.title")} | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

// Defense-in-depth: deze gate vangt navigatie af, maar elke page en elke
// action onder /beheer checkt daarnaast zélf requireAdminUser() (layouts
// worden bij client-navigatie niet opnieuw gerenderd).
export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser();
  if (!admin) {
    const userId = await currentUserId();
    redirect(userId ? "/" : "/inloggen?terug=/beheer");
  }
  const badges = await queueCounts();

  return (
    <div className="min-h-screen">
      <AdminNav badges={badges} />
      {children}
    </div>
  );
}
