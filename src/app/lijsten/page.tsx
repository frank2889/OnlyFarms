import { currentUserId } from "@/auth";
import { listsForUser, userById } from "@/lib/queries/accounts";
import ListsClient from "@/components/ListsClient";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const userId = await currentUserId();
  const [user, serverLists] = userId
    ? await Promise.all([userById(userId), listsForUser(userId)])
    : [null, []];

  return (
    <ListsClient
      serverLists={serverLists.map((l) => ({ token: l.token, name: l.name }))}
      userName={user?.name ?? null}
    />
  );
}
