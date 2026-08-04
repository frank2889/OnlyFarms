import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { listsForUser } from "@/lib/queries/accounts";
import SwipeRedirect from "@/components/SwipeRedirect";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// /swipen zonder lijst-token: stuur door naar het deck van je actieve lijst.
// Ingelogd weten we die server-side (nieuwste lijst); anoniem staat het
// actieve token alleen in localStorage, dus dat lost de client op.
export default async function SwipenIndexPage() {
  const userId = await currentUserId();
  if (userId) {
    const lists = await listsForUser(userId);
    if (lists[0]?.token) redirect(`/lijst/${lists[0].token}/swipen`);
    redirect("/lijsten");
  }
  return <SwipeRedirect />;
}
