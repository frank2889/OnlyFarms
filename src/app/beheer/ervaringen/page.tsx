import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { listUnpublishedReviews } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import { deleteReviewAction, publishReviewAction } from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function AdminReviewsPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const rows = await listUnpublishedReviews();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.navReviews")}</h1>

      {rows.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.reviewsEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-tile border border-cream-200 bg-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate font-medium">
                  {t("admin.reviewAbout", { name: r.sellerName })}
                  {r.sellerCity ? ` · ${r.sellerCity}` : ""}
                </span>
                <span className="shrink-0 text-xs text-ink-500">{dateFmt.format(r.createdAt)}</span>
              </div>
              {r.comment && <p className="mt-1 whitespace-pre-wrap text-sm">{r.comment}</p>}
              <p className="mt-1 text-xs text-ink-500">{r.reviewerName}</p>
              <div className="mt-3 flex gap-2">
                <form action={publishReviewAction.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
                  >
                    {t("admin.publish")}
                  </button>
                </form>
                <form action={deleteReviewAction.bind(null, r.id)}>
                  <button type="submit" className="text-sm text-ink-500 underline">
                    {t("admin.delete")}
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
