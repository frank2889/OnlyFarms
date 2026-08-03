import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { listPendingPhotos, listUnpublishedOffers } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import {
  approvePhotoAction,
  deleteOfferAdminAction,
  publishOfferAction,
  rejectPhotoAction,
} from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

// Screening: alles wat verkopers publiek willen zetten (producten en foto's)
// komt eerst langs het team.
export default async function AdminOffersPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const [offers, photoQueues] = await Promise.all([listUnpublishedOffers(), listPendingPhotos()]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.navOffers")}</h1>

      <h2 className="mb-2 text-sm font-semibold text-ink-500">{t("admin.offersQueueTitle")}</h2>
      {offers.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.offersEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {offers.map((o) => (
            <li key={o.id} className="rounded-tile border border-cream-200 bg-white p-4">
              <div className="flex gap-3">
                {o.photoUrl && (
                  <Image
                    src={o.photoUrl}
                    alt=""
                    width={120}
                    height={90}
                    className="h-[68px] w-[90px] shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate font-medium">{o.title}</span>
                    <span className="shrink-0 text-xs text-ink-500">{dateFmt.format(o.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink-500">
                    {[o.sellerName, o.sellerCity, o.priceIndication].filter(Boolean).join(" · ")}
                  </p>
                  {o.description && (
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm">{o.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={publishOfferAction.bind(null, o.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
                  >
                    {t("admin.approve")}
                  </button>
                </form>
                <form action={deleteOfferAdminAction.bind(null, o.id)}>
                  <button type="submit" className="text-sm text-ink-500 underline">
                    {t("admin.delete")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 mt-8 text-sm font-semibold text-ink-500">{t("admin.photosQueueTitle")}</h2>
      {photoQueues.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.photosEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {photoQueues.map((p) => (
            <li key={p.id} className="rounded-tile border border-cream-200 bg-white p-4">
              <Link href={`/producent/${p.slug}`} className="font-medium hover:underline">
                {p.name}
              </Link>
              {p.city && <span className="text-sm text-ink-500"> · {p.city}</span>}
              <p className="mt-0.5 text-xs text-ink-500">
                {t("admin.photosCurrentCount", { n: p.photos.length })}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.photosPending.map((url) => (
                  <figure key={url} className="overflow-hidden rounded-xl border border-cream-200">
                    <Image
                      src={url}
                      alt=""
                      width={400}
                      height={300}
                      className="aspect-4/3 w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between gap-2 p-2">
                      <form action={approvePhotoAction.bind(null, p.id, url)}>
                        <button
                          type="submit"
                          className="rounded-full bg-terra-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-terra-600"
                        >
                          {t("admin.approve")}
                        </button>
                      </form>
                      <form action={rejectPhotoAction.bind(null, p.id, url)}>
                        <button type="submit" className="text-xs text-ink-500 underline">
                          {t("admin.reject")}
                        </button>
                      </form>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
