import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { producerByIdAdmin } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import AdminProducerForm from "@/components/AdminProducerForm";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function AdminProducerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const { id } = await params;
  const producer = await producerByIdAdmin(Number(id));
  if (!producer) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/beheer/producenten" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
        <h1 className="text-2xl font-bold">{producer.name}</h1>
        <Link
          href={`/producent/${producer.slug}`}
          className="text-sm text-terra-700 underline"
        >
          {t("admin.openOnSite")}
        </Link>
      </div>
      <p className="mb-4 text-sm text-ink-500">
        {producer.source}
        {producer.lastVerifiedAt
          ? ` · ${t("producers.lastVerified", { date: dateFmt.format(producer.lastVerifiedAt) })}`
          : ""}
      </p>

      <div className="rounded-tile border border-cream-200 bg-white p-4">
        <AdminProducerForm
          producerId={producer.id}
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
            organic: producer.organic ?? false,
            vendingMachine: producer.vendingMachine ?? false,
            paymentMethods: producer.paymentMethods ?? "",
          }}
        />
      </div>
    </main>
  );
}
