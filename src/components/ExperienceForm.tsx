"use client";

import { useState, useTransition } from "react";
import { t } from "@/lib/i18n";
import { submitExperienceAction } from "@/app/producent/actions";

export default function ExperienceForm({ producerSlug }: { producerSlug: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <p className="text-sm text-terra-700">{t("producers.experienceThanks")}</p>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-1 py-1.5 text-sm text-terra-700 underline">
        {t("producers.experienceCta")}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submitExperienceAction(producerSlug, {
            name,
            email,
            comment,
            honeypot,
          });
          if (result.ok) setDone(true);
          else setError(result.error);
        });
      }}
      className="flex flex-col gap-2 rounded-tile border border-cream-200 bg-white p-4"
    >
      <label className="text-sm font-medium">{t("producers.experienceCta")}</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={t("producers.experiencePlaceholder")}
        className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("producers.experienceNamePlaceholder")}
        className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("producers.experienceEmailPlaceholder")}
        title={t("producers.experienceEmailHint")}
        className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm"
      />
      {/* Honeypot: onzichtbaar voor mensen, scripts vullen dit vaak toch in */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      {error && <p className="text-sm text-terra-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || comment.trim().length < 10 || name.trim().length < 2 || !email}
          className="rounded-full bg-terra-500 px-4 py-2 text-sm font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {t("producers.experienceSubmit")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-1 py-1.5 text-sm text-ink-500 underline"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
