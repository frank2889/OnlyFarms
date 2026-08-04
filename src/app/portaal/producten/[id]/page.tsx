import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { offerByIdForSeller } from "@/lib/queries/portal";
import { t } from "@/lib/i18n";
import OfferForm from "@/components/OfferForm";

export const dynamic = "force-dynamic";

export default async function BewerkProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  if (ctx.seller.status !== "goedgekeurd") redirect("/portaal");
  const { id } = await params;
  const offer = await offerByIdForSeller(Number(id), ctx.seller.id);
  if (!offer) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/portaal/producten" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <h1 className="py-3 text-2xl font-bold">{offer.title}</h1>
      <div className="rounded-tile border border-cream-200 bg-white p-4">
        <OfferForm
          offerId={offer.id}
          initial={{
            title: offer.title,
            category: offer.category ?? "",
            description: offer.description ?? "",
            priceIndication: offer.priceIndication ?? "",
            photoUrl: offer.photoUrl ?? "",
            available: offer.available,
            featured: offer.featured,
          }}
        />
      </div>
    </main>
  );
}
