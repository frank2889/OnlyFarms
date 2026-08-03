import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { t } from "@/lib/i18n";
import OfferForm from "@/components/OfferForm";

export const dynamic = "force-dynamic";

export default async function NieuwProductPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  if (ctx.seller.status !== "goedgekeurd") redirect("/portaal");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/portaal/producten" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <h1 className="py-3 text-2xl font-bold">{t("portal.newProduct")}</h1>
      <div className="rounded-tile border border-cream-200 bg-white p-4">
        <OfferForm
          offerId={null}
          initial={{
            title: "",
            category: "",
            description: "",
            priceIndication: "",
            photoUrl: "",
            available: true,
          }}
        />
      </div>
    </main>
  );
}
