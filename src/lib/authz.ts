import { currentUserId } from "@/auth";
import { userById } from "@/lib/queries/accounts";

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
