"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/account/actions";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { SproutIcon } from "@/components/icons";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteCode = params.get("code") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await registerAction({ name, email, password, inviteCode });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/lijsten");
    router.refresh();
  }

  const field = "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-8 inline-flex items-center justify-center gap-2 text-xl font-semibold">
        <SproutIcon width={24} height={24} className="text-terra-500" />
        {BRAND.name}
      </Link>
      <h1 className="mb-1 text-center text-2xl font-bold">{t("auth.registerTitle")}</h1>
      {inviteCode && (
        <p className="mb-3 text-center text-sm text-terra-700">{t("auth.viaInvite")}</p>
      )}
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("auth.namePlaceholder")}
          required
          className={field}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.emailPlaceholder")}
          required
          className={field}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordHintPlaceholder")}
          required
          minLength={8}
          className={field}
        />
        {error && (
          <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {busy ? t("auth.busy") : t("auth.registerCta")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        {t("auth.alreadyAccount")}{" "}
        <Link href="/inloggen" className="text-terra-700 underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </main>
  );
}

export default function RegistrerenClient() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
