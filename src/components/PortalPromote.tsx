import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { producerQrSvg } from "@/lib/qr";
import { t } from "@/lib/i18n";
import ProducerShareButton from "@/components/ProducerShareButton";

/** "Promoot je pagina": publieke URL, deel/kopieerknop, QR-preview, link naar de printbare poster */
export default function PortalPromote({ slug, name }: { slug: string; name: string }) {
  const url = absoluteUrl(`/producent/${slug}`);
  const qr = producerQrSvg(url, 4);

  return (
    <section className="mt-4 rounded-tile border border-cream-200 bg-white p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {t("portal.promoteTitle")}
      </h2>
      <p className="mb-3 text-sm text-ink-500">{t("portal.promoteHint")}</p>
      <div className="flex items-center gap-4">
        <div
          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-cream-200 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-sm text-ink-700">{url}</p>
          <ProducerShareButton name={name} slug={slug} />
        </div>
      </div>
      <Link href="/portaal/promotie" className="mt-3 inline-block text-sm text-terra-700 underline">
        {t("portal.promotePrint")}
      </Link>
    </section>
  );
}
