"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { sendChatMessageAction } from "@/app/lijst/actions";
import { ChefHatIcon, XIcon } from "@/components/icons";

type StoredList = { token: string; name: string };

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

/**
 * "Vraag je cheffs" vanaf een producentpagina: preset-vragen (aantikken =
 * versturen, geen getyp) die met deze producent als anker in de chat van je
 * actieve lijst belanden. Onderdeel van Franks "dialoog door het hele systeem".
 */
export default function AskChefsButton({
  producerSlug,
  producerName,
}: {
  producerSlug: string;
  producerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sent" | "login">("idle");
  const [sending, startTransition] = useTransition();

  const rawLists = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_lists") ?? "[]",
    () => "[]"
  );
  let active: StoredList | null = null;
  try {
    const lists: StoredList[] = JSON.parse(rawLists);
    active = lists[0] ?? null;
  } catch {}

  // Zonder actieve lijst is er geen chat om naar te sturen
  if (!active) return null;
  const list = active;

  const PRESETS = [
    t("chefs.producerPreset1"),
    t("chefs.producerPreset2"),
    t("chefs.producerPreset3"),
  ];

  function ask(preset: string) {
    if (sending) return;
    startTransition(async () => {
      const result = await sendChatMessageAction(list.token, preset, null, producerSlug);
      setState(result.ok ? "sent" : "login");
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setState("idle");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-terra-300 px-5 py-2.5 font-medium text-terra-700 hover:bg-terra-50"
      >
        <ChefHatIcon width={16} height={16} /> {t("chefs.askProducer")}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("chefs.askProducer")}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 px-3 pb-20 sm:items-center sm:pb-0"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-tile bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <ChefHatIcon width={20} height={20} className="text-terra-500" />
              <h3 className="flex-1 text-lg font-bold">{t("chefs.title")}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
                className="p-1 text-ink-500"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>

            {state === "sent" ? (
              <div>
                <p className="text-sm text-ink-700">
                  {t("chefs.sentToList", { list: list.name })}
                </p>
                <Link
                  href={`/lijst/${list.token}#lijst`}
                  className="mt-3 inline-block text-sm font-medium text-terra-700 underline"
                >
                  {t("chefs.viewInList")}
                </Link>
              </div>
            ) : state === "login" ? (
              <p className="text-sm text-ink-700">
                <Link
                  href={`/inloggen?terug=/producent/${producerSlug}`}
                  className="font-medium text-terra-700 underline"
                >
                  {t("chefs.loginPrompt")}
                </Link>
              </p>
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("chefs.presetHint", { label: producerName })}
                </p>
                <div className="flex flex-col gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={sending}
                      onClick={() => ask(preset)}
                      className="rounded-full border border-terra-300 px-4 py-2.5 text-left text-sm text-terra-700 hover:bg-terra-50 disabled:opacity-50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
