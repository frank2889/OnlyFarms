"use server";

import { randomBytes } from "node:crypto";
import { currentUserId } from "@/auth";
import { trackEvent } from "@/lib/klaviyo";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  addHouseholdMember,
  claimList,
  createHousehold,
  createUser,
  householdByInviteCode,
  householdForUser,
  passwordHashFor,
  updatePasswordHash,
  userByEmail,
} from "@/lib/queries/accounts";
import { getListByToken } from "@/lib/queries/lists";

type Result = { ok: true } | { ok: false; error: string };

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  inviteCode?: string;
}): Promise<Result> {
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
  await addHouseholdMember(household.id, userId);
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
