import { currentUserId } from "@/auth";
import { userById } from "@/lib/queries/accounts";
import { sellerForUser } from "@/lib/queries/portal";

export type AuthUser = { id: number; email: string; name: string; role: string };

// Rol per request uit de database, bewust niet in de JWT: intrekken werkt dan
// direct en bestaande sessies hoeven niet opnieuw in te loggen. Het beheer
// wordt door drie mensen gebruikt; de extra lookup is verwaarloosbaar.
async function userWithRole(role: string): Promise<AuthUser | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const user = await userById(userId);
  if (!user || user.role !== role) return null;
  return user;
}

/** Ingelogd teamlid (rol "team") of null. Elke beheer-page en -action checkt zelf. */
export async function requireAdminUser(): Promise<AuthUser | null> {
  return userWithRole("team");
}

/**
 * Ingelogde gebruiker mét gekoppelde verkoper (sellers.user_id), of null.
 * De koppeling wordt door het team gelegd in het beheer (of automatisch bij
 * goedkeuring als het e-mailadres al een account heeft); zelf claimen met
 * mailverificatie komt later. Elke portaal-page en -action checkt zelf.
 */
export async function requireSellerUser(): Promise<{
  userId: number;
  seller: NonNullable<Awaited<ReturnType<typeof sellerForUser>>>;
} | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const seller = await sellerForUser(userId);
  if (!seller) return null;
  return { userId, seller };
}
