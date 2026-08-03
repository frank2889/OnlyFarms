import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import AdminProducerForm from "@/components/AdminProducerForm";
import { updateOwnProducerAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function PortaalVermeldingPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  if (ctx.seller.status !== "goedgekeurd") redirect("/portaal");
  const linked = await producerForSeller(ctx.seller.id);
  if (!linked) redirect("/portaal");
  const producer = await producerByIdAdmin(linked.id);
  if (!producer) redirect("/portaal");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/portaal" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <h1 className="py-3 text-2xl font-bold">{producer.name}</h1>
      <p className="mb-2 text-sm text-ink-700">{t("portal.editIntro")}</p>
      <p className="mb-4 text-sm text-ink-500">{t("portal.editHint")}</p>

      <div className="rounded-tile border border-cream-200 bg-white p-4">
        <AdminProducerForm
          producerId={producer.id}
          action={updateOwnProducerAction}
          editableFields={["contact", "description", "openingHours", "products"]}
          initial={{
            name: producer.name,
            kind: producer.kind,
            status: producer.status,
            isMember: producer.isMember,
            address: producer.address ?? "",
            postcode: producer.postcode ?? "",
            city: producer.city ?? "",
            province: producer.province ?? "",
            phone: producer.phone ?? "",
            website: producer.website ?? "",
            description: producer.description ?? "",
            openingHours: producer.openingHours ?? "",
            products: producer.products,
          }}
        />
      </div>
    </main>
  );
}
