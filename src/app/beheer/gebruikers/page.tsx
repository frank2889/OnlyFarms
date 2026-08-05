import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { searchUsers } from "@/lib/queries/accounts";
import { t } from "@/lib/i18n";
import DeleteUserButton from "@/components/DeleteUserButton";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const { q } = await searchParams;
  const users = q?.trim() ? await searchUsers(q) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <h1 className="py-4 text-2xl font-bold">{t("admin.usersTitle")}</h1>
      <p className="mb-4 text-sm text-ink-500">{t("admin.usersIntro")}</p>

      <form method="get" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("admin.usersSearchPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600"
        >
          {t("common.search")}
        </button>
      </form>

      {!q?.trim() ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.usersSearchHint")}
        </p>
      ) : users.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.usersEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-2 rounded-tile border border-cream-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.name}</p>
                <p className="truncate text-sm text-ink-500">{u.email}</p>
                <p className="text-xs text-ink-300">
                  {t("admin.usersSince", { date: dateFmt.format(u.createdAt) })}
                </p>
              </div>
              {u.role === "team" && (
                <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                  {t("admin.usersTeamBadge")}
                </span>
              )}
              <DeleteUserButton userId={u.id} email={u.email} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4">
        <Link href="/beheer" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
    </main>
  );
}
