"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { BRAND } from "@/lib/brand";
import { SproutIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (result?.error) {
      setError(true);
    } else {
      router.push("/lijsten");
      router.refresh();
    }
  }

  const field =
    "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-8 inline-flex items-center justify-center gap-2 text-xl font-semibold">
        <SproutIcon width={24} height={24} className="text-terra-500" />
        {BRAND.name}
      </Link>
      <h1 className="mb-4 text-center text-2xl font-bold">Inloggen</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          required
          className={field}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
          required
          className={field}
        />
        {error && (
          <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">
            Inloggen mislukt. controleer je e-mailadres en wachtwoord.
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {busy ? "Bezig…" : "Inloggen"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Nog geen account?{" "}
        <Link href="/registreren" className="text-terra-700 underline">
          Maak er gratis een aan
        </Link>
      </p>
    </main>
  );
}
