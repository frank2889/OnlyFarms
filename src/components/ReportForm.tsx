"use client";

import { useState, useTransition } from "react";
import { t } from "@/lib/i18n";
import { reportProducerAction } from "@/app/producent/actions";

export default function ReportForm({ producerId }: { producerId: number }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (done) {
    return <p className="text-sm text-terra-700">{t("producers.reportThanks")}</p>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-ink-500 underline">
        {t("producers.reportWrong")}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (message.trim().length < 5) return;
        startTransition(async () => {
          await reportProducerAction(producerId, message);
          setDone(true);
        });
      }}
      className="flex flex-col gap-2 rounded-tile border border-cream-200 bg-white p-4"
    >
      <label className="text-sm font-medium">{t("producers.reportWrong")}</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Wat klopt er niet meer? (bijv. gestopt, andere openingstijden)"
        className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || message.trim().length < 5}
          className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          Versturen
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-500 underline">
          Annuleren
        </button>
      </div>
    </form>
  );
}
