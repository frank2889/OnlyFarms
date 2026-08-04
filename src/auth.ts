import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

// E-mail + wachtwoord om te starten; magic link en Google komen er later
// als extra providers bij (vereisen mail-/OAuth-keys).
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/inloggen" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        // Tegen brute-force: verifyPassword (scrypt) kost CPU per poging, dus
        // dit is ook een DoS-hendel; limiet zowel per e-mailadres (gerichte
        // aanval op één account) als per IP (credential stuffing).
        const ip = await clientIp();
        if (isRateLimited(`login-email:${email}`, 10, 15 * 60_000)) return null;
        if (isRateLimited(`login-ip:${ip}`, 30, 15 * 60_000)) return null;
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user || !verifyPassword(password, user.passwordHash)) return null;
        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = Number(user.id);
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = String(token.uid);
      return session;
    },
  },
});

/** Ingelogde gebruiker (id als number) of null */
export async function currentUserId(): Promise<number | null> {
  const session = await auth();
  const id = session?.user?.id;
  return id ? Number(id) : null;
}
