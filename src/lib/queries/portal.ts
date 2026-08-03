import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sellers } from "@/db/schema";

/** De verkoper die aan dit gebruikersaccount gekoppeld is (elke status) */
export async function sellerForUser(userId: number) {
  const [row] = await db.select().from(sellers).where(eq(sellers.userId, userId));
  return row ?? null;
}
