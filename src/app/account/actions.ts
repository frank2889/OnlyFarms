"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentUserId } from "@/auth";
import { trackEvent } from "@/lib/klaviyo";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  addHouseholdMember,
  claimList,
  createHousehold,
  createUser,
  deleteUser,
  householdByInviteCode,
  householdForUser,
  leaveHousehold,
  passwordHashFor,
  renameHousehold,
  rotateInviteCode,
  updateNearbyRadius,
  updatePasswordHash,
  updateUserName,
  userByEmail,
} from "@/lib/queries/accounts";
import { resetTasteProfile } from "@/lib/queries/swipe";
import { getListByToken } from "@/lib/queries/lists";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

type Result = { ok: true } | { ok: false; error: string };

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  inviteCode?: string;
}): Promise<Result> {
  if (isRateLimited(`register:${await clientIp()}`, 10, 60 * 60_000))
    return { ok: false, error: "Even rustig aan: probeer het over een uur opnieuw." };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false, error: "Vul je naam in." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "Vul een geldig e-mailadres in." };
  if (input.password.length < 8)
    return { ok: false, error: "Kies een wachtwoord van minstens 8 tekens." };
  if (await userByEmail(email))
    return { ok: false, error: "Er bestaat al een account met dit e-mailadres." };

  // Uitnodigingscode? Dan sluit je aan bij dat gezin; anders krijg je je eigen gezin
  let householdId: number;
  if (input.inviteCode?.trim()) {
    const household = await householdByInviteCode(input.inviteCode.trim());
    if (!household) return { ok: false, error: "Uitnodigingscode niet gevonden." };
    householdId = household.id;
  } else {
    householdId = await createHousehold(
      `Gezin van ${name}`,
      randomBytes(6).toString("base64url")
    );
  }

  const userId = await createUser(name, email, hashPassword(input.password));
  await addHouseholdMember(householdId, userId);
  await trackEvent("account_created", { viaInvite: !!input.inviteCode }, email);
  return { ok: true };
}

export async function changePasswordAction(
  current: string,
  next: string
): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  if (next.length < 8)
    return { ok: false, error: "Kies een wachtwoord van minstens 8 tekens." };
  const stored = await passwordHashFor(userId);
  if (!stored || !verifyPassword(current, stored))
    return { ok: false, error: "Je huidige wachtwoord klopt niet." };
  await updatePasswordHash(userId, hashPassword(next));
  return { ok: true };
}

export async function joinHouseholdAction(code: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Log eerst in." };
  const household = await householdByInviteCode(code.trim());
  if (!household) return { ok: false, error: "Uitnodigingscode niet gevonden." };
  // addHouseholdMember weigert stil als je al ergens lid bent; wees eerlijk
  const current = await householdForUser(userId);
  if (current && current.id !== household.id)
    return { ok: false, error: "Je zit al in een gezin. Verlaat dat eerst via je profiel." };
  await addHouseholdMember(household.id, userId);
  revalidatePath("/profiel");
  return { ok: true };
}

export async function updateNameAction(name: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  if (name.trim().length < 2) return { ok: false, error: "Vul je naam in." };
  await updateUserName(userId, name.trim().slice(0, 80));
  revalidatePath("/profiel");
  return { ok: true };
}

const RADIUS_CHOICES = new Set([500, 1000, 2000]);

/** Account-brede vlakbij-meldingsradius; null = uit */
export async function setNearbyRadiusAction(meters: number | null): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  if (meters !== null && !RADIUS_CHOICES.has(meters))
    return { ok: false, error: "Ongeldige afstand." };
  await updateNearbyRadius(userId, meters);
  revalidatePath("/profiel");
  return { ok: true };
}

export async function renameHouseholdAction(name: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  const household = await householdForUser(userId);
  if (!household) return { ok: false, error: "Je zit niet in een gezin." };
  if (name.trim().length < 2) return { ok: false, error: "Vul een naam in." };
  await renameHousehold(household.id, name.trim().slice(0, 80));
  revalidatePath("/profiel");
  return { ok: true };
}

export async function leaveHouseholdAction(): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  const household = await householdForUser(userId);
  if (!household) return { ok: false, error: "Je zit niet in een gezin." };
  await leaveHousehold(household.id, userId);
  revalidatePath("/profiel");
  return { ok: true };
}

export async function rotateInviteCodeAction(): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  const household = await householdForUser(userId);
  if (!household) return { ok: false, error: "Je zit niet in een gezin." };
  await rotateInviteCode(household.id, randomBytes(6).toString("base64url"));
  revalidatePath("/profiel");
  return { ok: true };
}

/** Wis het geleerde smaakprofiel (transparantie en controle over je data) */
export async function resetTasteProfileAction(): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  await resetTasteProfile(userId);
  revalidatePath("/profiel");
  return { ok: true };
}

/**
 * Account verwijderen (AVG): persoonsdata (smaakprofiel, berichten,
 * gezinslidmaatschap) verdwijnt mee; gezinslijsten en de koophistorie van het
 * gezin blijven bestaan. De client logt daarna uit.
 */
export async function deleteAccountAction(password: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Je bent niet ingelogd." };
  const stored = await passwordHashFor(userId);
  if (!stored || !verifyPassword(password, stored))
    return { ok: false, error: "Je wachtwoord klopt niet." };
  await deleteUser(userId);
  return { ok: true };
}

/** Anonieme (via link gedeelde) lijst toevoegen aan je account en gezin */
export async function claimListAction(token: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Log eerst in." };
  const list = await getListByToken(token);
  if (!list) return { ok: false, error: "Lijst niet gevonden." };
  const household = await householdForUser(userId);
  await claimList(list.id, userId, household?.id ?? null);
  return { ok: true };
}
