import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import {
  adminSearchProducers,
  producerForSeller,
  sellerById,
} from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import { SELLER_STATUS_LABELS, sellerStatusBadgeClass } from "../labels";
import {
  approveSellerAction,
  rejectSellerAction,
  suspendSellerAction,
  takeInReviewAction,
} from "../actions";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function AdminSellerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; fout?: string }>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const { id } = await params;
  const { q, fout } = await searchParams;
  const seller = await sellerById(Number(id));
  if (!seller) notFound();

  const [linked, results] = await Promise.all([
    producerForSeller(seller.id),
    q?.trim() ? adminSearchProducers(q) : Promise.resolve([]),
  ]);
  const open = seller.status === "aangemeld" || seller.status === "in_beoordeling";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/beheer/aanmeldingen" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-3 py-3">
        <h1 className="text-2xl font-bold">{seller.name}</h1>
        <span className={`rounded-full px-3 py-1 text-sm ${sellerStatusBadgeClass(seller.status)}`}>
          {SELLER_STATUS_LABELS[seller.status]}
        </span>
      </div>
      <p className="mb-4 text-sm text-ink-500">
        {t("admin.appliedOn", { date: dateFmt.format(seller.createdAt) })}
        {seller.reviewedAt
          ? ` · ${t("admin.reviewedOn", { date: dateFmt.format(seller.reviewedAt) })}`
          : ""}
      </p>

      <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">KVK</dt>
            <dd className="flex items-center gap-2 font-medium">
              {seller.kvkNumber}
              <a
                href={`https://www.kvk.nl/zoeken/?q=${seller.kvkNumber}`}
                target="_blank"
                rel="noopener"
                className="text-terra-700 underline"
              >
                {t("admin.kvkCheck")}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-ink-500">{t("admin.formName")}</dt>
            <dd className="font-medium">{seller.contactName}</dd>
          </div>
          <div>
            <dt className="text-ink-500">E-mail</dt>
            <dd className="font-medium">{seller.email}</dd>
          </div>
          <div>
            <dt className="text-ink-500">{t("admin.formPhone")}</dt>
            <dd className="font-medium">{seller.phone || "-"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ink-500">{t("admin.formAddress")}</dt>
            <dd className="font-medium">
              {[seller.address, seller.postcode, seller.city].filter(Boolean).join(", ")}
            </dd>
          </div>
          {seller.bio && (
            <div className="sm:col-span-2">
              <dt className="text-ink-500">{t("admin.formDescription")}</dt>
              <dd>{seller.bio}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mb-4 rounded-tile border border-terra-200 bg-terra-50 p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-terra-800">
          {t("admin.motivation")}
        </h2>
        <p className="whitespace-pre-wrap text-sm">{seller.motivation}</p>
      </section>

      {seller.statusReason && (
        <p className="mb-4 rounded-xl bg-cream-100 px-4 py-2 text-sm">
          {t("admin.statusReason")}: {seller.statusReason}
        </p>
      )}

      {linked && (
        <p className="mb-4 text-sm">
          {t("admin.linkedProducer")}:{" "}
          <Link href={`/producent/${linked.slug}`} className="text-terra-700 underline">
            {linked.name}
          </Link>{" "}
          ·{" "}
          <Link href={`/beheer/producenten/${linked.id}`} className="text-ink-500 underline">
            {t("admin.view")}
          </Link>
        </p>
      )}

      {seller.status === "aangemeld" && (
        <form action={takeInReviewAction.bind(null, seller.id)} className="mb-4">
          <button
            type="submit"
            className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:border-terra-400"
          >
            {t("admin.takeInReview")}
          </button>
        </form>
      )}

      {seller.status !== "goedgekeurd" && (
        <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 font-semibold">{t("admin.approveTitle")}</h2>
          <p className="mb-3 text-sm text-ink-500">{t("admin.approveExplain")}</p>

          <form method="get" className="mb-3 flex gap-2">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("admin.searchProducerPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:border-terra-400"
            >
              {t("common.search")}
            </button>
          </form>

          <form action={approveSellerAction.bind(null, seller.id)}>
            <div className="mb-3 flex flex-col gap-1.5">
              {results.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-cream-200 px-3 py-2 text-sm hover:border-terra-400"
                >
                  <input type="radio" name="producerId" value={p.id} className="accent-terra-500" />
                  <span className="min-w-0 flex-1 truncate">
                    {p.name}
                    {p.city ? ` · ${p.city}` : ""}
                  </span>
                  {p.isMember && (
                    <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                      {t("producers.memberBadge")}
                    </span>
                  )}
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-cream-300 px-3 py-2 text-sm hover:border-terra-400">
                <input type="radio" name="producerId" value="nieuw" className="accent-terra-500" />
                {t("admin.createNewOption")}
              </label>
            </div>
            {fout === "koppeling" && (
              <p className="mb-2 rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">
                {t("admin.chooseLinkFirst")}
              </p>
            )}
            <button
              type="submit"
              className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
            >
              {t("admin.approve")}
            </button>
          </form>
        </section>
      )}

      {(open || seller.status === "goedgekeurd") && (
        <section className="rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">
            {seller.status === "goedgekeurd" ? t("admin.suspend") : t("admin.reject")}
          </h2>
          {fout === "reden" && (
            <p className="mb-2 rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">
              {t("admin.reasonRequired")}
            </p>
          )}
          <form
            action={(seller.status === "goedgekeurd" ? suspendSellerAction : rejectSellerAction).bind(
              null,
              seller.id
            )}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              name="reason"
              placeholder={t("admin.reasonPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
            >
              {seller.status === "goedgekeurd" ? t("admin.suspend") : t("admin.reject")}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
