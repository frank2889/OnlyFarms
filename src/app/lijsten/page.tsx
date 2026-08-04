import { currentUserId } from "@/auth";
import { listsWithCounts, userById } from "@/lib/queries/accounts";
import ListsClient from "@/components/ListsClient";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const userId = await currentUserId();
  const [user, serverLists] = userId
    ? await Promise.all([userById(userId), listsWithCounts(userId)])
    : [null, []];

  return (
    <ListsClient
      serverLists={serverLists.map((l) => ({
        token: l.token,
        name: l.name,
        openCount: l.openCount,
        updatedAt: l.updatedAt.toISOString(),
      }))}
      userName={user?.name ?? null}
    />
  );
}
