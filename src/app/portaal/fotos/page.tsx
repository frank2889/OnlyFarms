import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import PhotoManager from "@/components/PhotoManager";

export const dynamic = "force-dynamic";

export default async function PortaalFotosPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  if (ctx.seller.status !== "goedgekeurd") redirect("/portaal");
  const linked = await producerForSeller(ctx.seller.id);
  if (!linked) redirect("/portaal");
  const producer = await producerByIdAdmin(linked.id);
  if (!producer) redirect("/portaal");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("portal.tabPhotos")}</h1>
      <p className="mb-4 text-sm text-ink-700">{t("portal.photosIntro")}</p>
      <PhotoManager photos={producer.photos} max={8} />
    </main>
  );
}
