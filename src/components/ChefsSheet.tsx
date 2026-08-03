"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { sendChatMessageAction } from "@/app/lijst/actions";
import type { ChatMessage } from "@/lib/queries/chat";
import { ChefHatIcon, XIcon } from "@/components/icons";

const timeFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * "Chefs": de lijst-chat tussen echte mensen. Schrijven kan alleen ingelogd;
 * lezen kan iedereen met de lijst-link. Een bericht kan aan een item hangen
 * (anchor), zodat je gericht kunt vragen: "waarom heb je deze melk nodig?".
 */
export default function ChefsSheet({
  token,
  messages,
  viewerUserId,
  anchor,
  onClearAnchor,
  onClose,
}: {
  token: string;
  messages: ChatMessage[];
  viewerUserId: number | null;
  anchor: { id: number; label: string } | null;
  onClearAnchor: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function deliver(text: string, itemId: number | null) {
    if (sending) return;
    startTransition(async () => {
      const result = await sendChatMessageAction(token, text, itemId);
      if (result.ok) {
        setBody("");
        onClearAnchor();
        router.refresh();
        // na de refresh onderaan het gesprek blijven
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }, 300);
      }
    });
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const clean = body.trim();
    if (!clean) return;
    deliver(clean, null);
  }

  // Item-vragen zijn bewust alleen presets (Frank): aantikken = versturen,
  // geen getyp, grote tikvlakken. Vrije tekst blijft er voor de algemene chat.
  const PRESETS = [
    t("chefs.preset1"),
    t("chefs.preset2"),
    t("chefs.preset3"),
    t("chefs.preset4"),
    t("chefs.preset5"),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("chefs.title")}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 px-3 pb-20 sm:items-center sm:pb-0"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="flex max-h-[75vh] w-full max-w-sm flex-col rounded-tile bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-cream-200 p-4">
          <ChefHatIcon width={20} height={20} className="text-terra-500" />
          <h3 className="flex-1 text-lg font-bold">{t("chefs.title")}</h3>
          <button onClick={onClose} aria-label={t("common.close")} className="p-1 text-ink-500">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-ink-500">{t("chefs.empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m) => {
                const own = viewerUserId != null && m.userId === viewerUserId;
                return (
                  <li key={m.id} className={own ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={`max-w-[85%] rounded-tile px-3.5 py-2.5 ${
                        own ? "bg-terra-50" : "bg-cream-100"
                      }`}
                    >
                      <p className="mb-0.5 text-xs text-ink-500">
                        {m.userName} · {timeFmt.format(m.createdAt)}
                      </p>
                      {m.itemLabel && (
                        <span className="mb-1 inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-terra-700">
                          {t("chefs.aboutItem", { label: m.itemLabel })}
                        </span>
                      )}
                      {m.producerName && (
                        <Link
                          href={`/producent/${m.producerSlug}`}
                          className="mb-1 inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-terra-700 underline"
                        >
                          {t("chefs.aboutItem", { label: m.producerName })}
                        </Link>
                      )}
                      <p className="whitespace-pre-wrap wrap-break-word text-sm">{m.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-cream-200 p-3">
          {viewerUserId == null ? (
            <p className="text-sm text-ink-700">
              <Link
                href={`/inloggen?terug=/lijst/${token}`}
                className="font-medium text-terra-700 underline"
              >
                {t("chefs.loginPrompt")}
              </Link>
            </p>
          ) : anchor ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {t("chefs.presetHint", { label: anchor.label })}
                </p>
                <button
                  type="button"
                  onClick={onClearAnchor}
                  aria-label={t("common.close")}
                  className="shrink-0 p-1 text-ink-500"
                >
                  <XIcon width={14} height={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={sending}
                    onClick={() => deliver(preset, anchor.id)}
                    className="rounded-full border border-terra-300 px-4 py-2.5 text-left text-sm text-terra-700 hover:bg-terra-50 disabled:opacity-50"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={send}>
              <div className="flex gap-2">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t("chefs.placeholder")}
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="shrink-0 rounded-full bg-terra-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-terra-600 disabled:opacity-50"
                >
                  {t("chefs.send")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
