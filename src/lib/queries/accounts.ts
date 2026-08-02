import { desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { householdMembers, households, lists, users } from "@/db/schema";
import type { ShoppingList } from "@/lib/types";

export type HouseholdInfo = {
  id: number;
  name: string;
  inviteCode: string;
  members: { id: number; name: string; email: string }[];
};

export async function userById(userId: number) {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
}

export async function householdForUser(userId: number): Promise<HouseholdInfo | null> {
  const [membership] = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));
  if (!membership) return null;

  const [household] = await db
    .select()
    .from(households)
    .where(eq(households.id, membership.householdId));
  if (!household) return null;

  const members = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(householdMembers)
    .innerJoin(users, eq(users.id, householdMembers.userId))
    .where(eq(householdMembers.householdId, household.id));

  return {
    id: household.id,
    name: household.name,
    inviteCode: household.inviteCode,
    members,
  };
}

/** Lijsten van de gebruiker zelf + van het hele huishouden (family account) */
export async function listsForUser(userId: number): Promise<ShoppingList[]> {
  const memberships = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));
  const householdIds = memberships.map((m) => m.householdId);

  const rows = await db
    .select()
    .from(lists)
    .where(
      householdIds.length
        ? or(eq(lists.ownerUserId, userId), inArray(lists.householdId, householdIds))
        : eq(lists.ownerUserId, userId)
    )
    .orderBy(desc(lists.updatedAt));
  return rows as ShoppingList[];
}

/** Anonieme lijst claimen: koppel aan account + huishouden */
export async function claimList(
  listId: number,
  userId: number,
  householdId: number | null
): Promise<void> {
  await db
    .update(lists)
    .set({ ownerUserId: userId, householdId })
    .where(eq(lists.id, listId));
}

export async function userByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()));
  return user ?? null;
}

export async function householdByInviteCode(code: string) {
  const [household] = await db
    .select({ id: households.id, name: households.name })
    .from(households)
    .where(eq(households.inviteCode, code));
  return household ?? null;
}

export async function addHouseholdMember(householdId: number, userId: number): Promise<void> {
  const existing = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));
  if (existing.length) return; // één huishouden per gebruiker (voor nu)
  await db.insert(householdMembers).values({ householdId, userId });
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const [user] = await db
    .insert(users)
    .values({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash })
    .returning({ id: users.id });
  return user.id;
}

export async function createHousehold(name: string, inviteCode: string): Promise<number> {
  const [household] = await db
    .insert(households)
    .values({ name, inviteCode })
    .returning({ id: households.id });
  return household.id;
}

export async function updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function passwordHashFor(userId: number): Promise<string | null> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId));
  return user?.passwordHash ?? null;
}
