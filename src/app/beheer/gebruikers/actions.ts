"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/authz";
import { deleteUser, userById } from "@/lib/queries/accounts";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Minimale gebruikersbeheer voor AVG-verzoeken. Geen wachtwoordbevestiging
 * nodig (patroon self-service verwijderen): dit is een teamactie namens
 * iemand anders, niet de eigenaar zelf. Team-accounts worden hier bewust
 * beschermd tegen een misklik; dat is geen AVG-verzoek maar een aparte
 * beslissing.
 */
export async function deleteUserAdminAction(userId: number): Promise<Result> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Geen toegang." };
  const target = await userById(userId);
  if (!target) return { ok: false, error: "Gebruiker niet gevonden." };
  if (target.role === "team") return { ok: false, error: "Teamaccounts kun je hier niet verwijderen." };
  await deleteUser(userId);
  revalidatePath("/beheer/gebruikers");
  return { ok: true };
}
