import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/authz";
import { duplicateGroups } from "@/lib/queries/admin";
import { t } from "@/lib/i18n";
import MergeDuplicatesGroup from "@/components/MergeDuplicatesGroup";

export const dynamic = "force-dynamic";

export default async function AdminDuplicatesPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/inloggen");
  const groups = await duplicateGroups();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <p className="pt-4">
        <Link href="/beheer/producenten" className="text-sm text-ink-500 underline">
          {t("admin.back")}
        </Link>
      </p>
      <h1 className="py-3 text-2xl font-bold">{t("admin.duplicatesTitle")}</h1>
      <p className="mb-4 text-sm text-ink-500">{t("admin.duplicatesIntro")}</p>

      {groups.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          {t("admin.duplicatesEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li
              key={`${group.postcode}-${group.address}`}
              className="rounded-tile border border-cream-200 bg-white p-4"
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
                {group.postcode} · {group.address}
              </p>
              <MergeDuplicatesGroup members={group.members} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
