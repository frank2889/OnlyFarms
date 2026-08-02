/**
 * Testaccounts + gedeeld huishouden (family account) aanmaken.
 * Idempotent: bestaande accounts worden overgeslagen.
 *
 *   npx tsx scripts/seed-accounts.ts
 */
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const ACCOUNTS = [
  { name: "Frank", email: "frank@webelephant.nl" },
  { name: "Chimene", email: "chimene@webelephant.nl" },
  { name: "Sally", email: "sally@webelephant.nl" },
];

function generatePassword(): string {
  return `Oogst-${randomBytes(4).toString("hex")}-${new Date().getFullYear()}`;
}

async function main() {
  const { hashPassword } = await import("@/lib/password");
  const { db } = await import("@/db");
  const { householdMembers, households, users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  // Huishouden (family account)
  let [household] = await db
    .select()
    .from(households)
    .where(eq(households.name, "Team"));
  if (!household) {
    [household] = await db
      .insert(households)
      .values({ name: "Team", inviteCode: randomBytes(6).toString("base64url") })
      .returning();
    console.log(`huishouden "Team" aangemaakt (uitnodigingscode: ${household.inviteCode})`);
  } else {
    console.log(`huishouden "Team" bestond al`);
  }

  for (const account of ACCOUNTS) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email));
    if (existing) {
      console.log(`${account.email} bestond al — overgeslagen`);
      continue;
    }
    const password = generatePassword();
    const [user] = await db
      .insert(users)
      .values({
        name: account.name,
        email: account.email,
        passwordHash: hashPassword(password),
        role: "team",
      })
      .returning();
    await db.insert(householdMembers).values({ householdId: household.id, userId: user.id });
    console.log(`${account.name}: ${account.email} / wachtwoord: ${password}`);
  }

  console.log("\nKlaar. Wachtwoorden hierboven eenmalig getoond — wijzig ze later via een wachtwoord-flow.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
