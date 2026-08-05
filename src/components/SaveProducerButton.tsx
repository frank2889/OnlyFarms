"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { toggleSavedProducerAction } from "@/app/producent/actions";
import { HeartIcon } from "@/components/icons";

/**
 * Favoriet aan/uit voor het hele huishouden (CRO #70). Anoniem of zonder
 * huishouden geeft de action een apart foutresultaat (patroon AskChefsButton).
 */
export default function SaveProducerButton({
  producerSlug,
  initialSaved,
}: {
  producerSlug: string;
  initialSaved: boolean;
}) {
  const [saved, applyOptimistic] = useOptimistic<boolean, boolean>(
    initialSaved,
    (_state, next) => next
  );
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "login" | "geen-huishouden">("idle");

  if (state === "login") {
    return (
      <Link
        href={`/inloggen?terug=/producent/${producerSlug}`}
        className="inline-flex items-center gap-2 rounded-full border border-terra-300 px-5 py-2.5 font-medium text-terra-700 hover:bg-terra-50"
      >
        <HeartIcon width={16} height={16} /> {t("producers.saveLoginPrompt")}
      </Link>
    );
  }

  if (state === "geen-huishouden") {
    return <p className="text-sm text-ink-500">{t("producers.saveNoHousehold")}</p>;
  }

  function toggle() {
    if (pending) return;
    startTransition(async () => {
      applyOptimistic(!saved);
      const result = await toggleSavedProducerAction(producerSlug);
      if (!result.ok && result.error !== "niet-gevonden") setState(result.error);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium disabled:opacity-50 ${
        saved
          ? "border-terra-500 bg-terra-500 text-white hover:bg-terra-600"
          : "border-terra-300 text-terra-700 hover:bg-terra-50"
      }`}
    >
      <HeartIcon width={16} height={16} filled={saved} />
      {saved ? t("producers.saved") : t("producers.save")}
    </button>
  );
}
