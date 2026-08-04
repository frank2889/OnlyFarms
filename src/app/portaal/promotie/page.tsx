import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { producerByIdAdmin, producerForSeller } from "@/lib/queries/admin";
import { absoluteUrl } from "@/lib/seo";
import { producerQrSvg } from "@/lib/qr";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

/** Printbare A5-poster met QR-code naar de publieke producentpagina */
export default async function PromotiePage() {
  const ctx = await requireSellerUser();
  if (!ctx || ctx.seller.status !== "goedgekeurd") redirect("/portaal");
  const linked = await producerForSeller(ctx.seller.id);
  if (!linked) redirect("/portaal");
  const producer = await producerByIdAdmin(linked.id);
  if (!producer) redirect("/portaal");

  const url = absoluteUrl(`/producent/${producer.slug}`);
  const qr = producerQrSvg(url, 10);

  return (
    <>
      <style>{`@page { size: A5; margin: 12mm; }`}</style>
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-8 text-center print:max-w-none print:gap-6 print:py-0">
        <PrintButton className="print:hidden" />
        <p className="text-sm font-semibold uppercase tracking-wide text-terra-700">{BRAND.name}</p>
        <h1 className="text-2xl font-bold">
          {t("portal.promotePosterTitle", { name: producer.name })}
        </h1>
        <div
          className="h-64 w-64 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <p className="break-all text-sm text-ink-500">{url}</p>
      </main>
    </>
  );
}
