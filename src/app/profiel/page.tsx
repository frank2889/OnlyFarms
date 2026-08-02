import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { BRAND } from "@/lib/brand";
import { householdForUser, listsForUser, userById } from "@/lib/queries/accounts";
import { ListIcon, SproutIcon, UserIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await currentUserId();
  if (!userId) redirect("/inloggen");

  const [user, household, myLists] = await Promise.all([
    userById(userId),
    householdForUser(userId),
    listsForUser(userId),
  ]);
  if (!user) redirect("/inloggen");

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <LogoutButton />
      </header>

      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-terra-100">
          <UserIcon width={26} height={26} className="text-terra-700" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-ink-500">{user.email}</p>
        </div>
      </div>

      {household && (
        <section className="mb-6 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 font-semibold">Huishouden: {household.name}</h2>
          <p className="mb-3 text-sm text-ink-500">
            Iedereen in dit huishouden ziet dezelfde lijsten en kan afvinken.
          </p>
          <ul className="mb-3 flex flex-wrap gap-2">
            {household.members.map((m) => (
              <li
                key={m.id}
                className={`rounded-full px-3 py-1 text-sm ${
                  m.id === user.id ? "bg-terra-500 text-white" : "bg-cream-100"
                }`}
              >
                {m.name}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-300">
            Uitnodigingscode voor nieuwe leden: <code className="rounded bg-cream-100 px-1.5 py-0.5">{household.inviteCode}</code>
          </p>
        </section>
      )}

      <h2 className="mb-2 font-semibold">Lijsten van jou en je huishouden</h2>
      {myLists.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-6 text-center text-ink-500">
          Nog geen lijsten — <Link href="/lijsten" className="underline">maak er een</Link>.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {myLists.map((l) => (
            <li key={l.id}>
              <Link
                href={`/lijst/${l.token}`}
                className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
              >
                <ListIcon width={20} height={20} className="text-terra-500" />
                <span className="font-medium">{l.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
