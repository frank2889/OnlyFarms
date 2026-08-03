import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireSellerUser } from "@/lib/authz";
import { offersForSeller } from "@/lib/queries/portal";
import { t } from "@/lib/i18n";
import { PlusIcon, StoreIcon } from "@/components/icons";
import { deleteOfferAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function PortaalProductenPage() {
  const ctx = await requireSellerUser();
  if (!ctx) redirect("/inloggen?terug=/portaal");
  if (ctx.seller.status !== "goedgekeurd") redirect("/portaal");
  const offers = await offersForSeller(ctx.seller.id);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <div className="flex items-center justify-between gap-3 py-4">
        <h1 className="text-2xl font-bold">{t("portal.tabProducts")}</h1>
        <Link
          href="/portaal/producten/nieuw"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
        >
          <PlusIcon width={16} height={16} /> {t("portal.newProduct")}
        </Link>
      </div>
      <p className="mb-4 text-sm text-ink-700">{t("portal.productsIntro")}</p>

      {offers.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("portal.productsEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-3"
            >
              {offer.photoUrl ? (
                <Image
                  src={offer.photoUrl}
                  alt=""
                  width={96}
                  height={72}
                  className="aspect-4/3 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex aspect-4/3 w-20 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-ink-300">
                  <StoreIcon width={20} height={20} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{offer.title}</p>
                <p className="truncate text-sm text-ink-500">
                  {[offer.priceIndication, offer.category].filter(Boolean).join(" · ")}
                </p>
                {!offer.available && (
                  <span className="mt-0.5 inline-block rounded-full bg-cream-200 px-2 py-0.5 text-xs text-ink-700">
                    {t("portal.offerUnavailable")}
                  </span>
                )}
                {!offer.published && (
                  <span className="ml-1 mt-0.5 inline-block rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                    {t("portal.offerPending")}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm">
                <Link
                  href={`/portaal/producten/${offer.id}`}
                  className="text-terra-700 underline"
                >
                  {t("portal.offerEdit")}
                </Link>
                <form action={deleteOfferAction.bind(null, offer.id)}>
                  <button type="submit" className="text-ink-500 underline">
                    {t("portal.offerDelete")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
