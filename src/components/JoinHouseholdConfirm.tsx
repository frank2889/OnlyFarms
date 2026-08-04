"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { joinHouseholdAction } from "@/app/account/actions";
import { SproutIcon } from "@/components/icons";
import { t } from "@/lib/i18n";

/**
 * Aansluiten bij een gezin gebeurt pas na een expliciete tik, nooit
 * automatisch op het laden van de pagina: een linkpreview of prefetch van
 * een ingelogde gebruiker mag hem niet ongevraagd van gezin laten wisselen.
 */
export default function JoinHouseholdConfirm({
  code,
  householdName,
}: {
  code: string;
  householdName: string;
}) {
  const [state, setState] = useState<"idle" | "joined" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function join() {
    startTransition(async () => {
      const result = await joinHouseholdAction(code);
      if (result.ok) {
        setState("joined");
      } else {
        setState("error");
        setError(result.error);
      }
    });
  }

  if (state === "joined") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <SproutIcon width={32} height={32} className="mx-auto mb-4 text-terra-500" />
        <h1 className="mb-2 text-2xl font-bold">{t("household.joinedTitle", { name: householdName })}</h1>
        <p className="text-ink-500">{t("household.joinedText")}</p>
        <Link
          href="/lijsten"
          className="mx-auto mt-6 rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
        >
          {t("household.goToLists")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
      <SproutIcon width={32} height={32} className="mx-auto mb-4 text-terra-500" />
      <h1 className="mb-2 text-2xl font-bold">{t("household.joinTitle", { name: householdName })}</h1>
      <p className="text-ink-500">{t("household.joinText")}</p>
      {error && <p className="mt-3 text-sm text-terra-700">{error}</p>}
      <button
        onClick={join}
        disabled={pending}
        className="mx-auto mt-6 rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
      >
        {t("household.joinCta")}
      </button>
    </main>
  );
}
