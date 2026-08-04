"use client";

import { useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

type Prefill = { slug: string; name: string; city: string | null };

export default function VerkopenClient({ prefill }: { prefill: Prefill | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/sellers/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        kvkNumber: form.get("kvkNumber"),
        contactName: form.get("contactName"),
        email: form.get("email"),
        phone: form.get("phone"),
        city: form.get("city"),
        motivation: form.get("motivation"),
        acceptedTerms: form.get("acceptedTerms") === "on",
        claimProducerSlug: prefill?.slug,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => null);
      setErrors(data?.errors ?? [data?.error ?? t("sell.genericError")]);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="mb-4 text-2xl font-bold">{t("sell.received")}</h1>
        <p className="text-ink-500">{t("sell.receivedText")}</p>
        <Link href="/" className="mt-6 inline-block underline">
          {t("sell.backHome")}
        </Link>
      </main>
    );
  }

  const field = "w-full rounded-xl border border-cream-300 px-3 py-2";

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-2xl font-bold">{t("sell.title", { brand: BRAND.name })}</h1>
      <p className="mb-6 text-sm text-ink-500">{t("sell.intro", { brand: BRAND.name })}</p>

      {prefill && (
        <p className="mb-4 inline-block rounded-full bg-terra-50 px-4 py-2 text-sm font-medium text-terra-800">
          {prefill.city
            ? t("sell.claimChipCity", { name: prefill.name, city: prefill.city })
            : t("sell.claimChipNoCity", { name: prefill.name })}
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldCompanyName")}
          <input name="name" required defaultValue={prefill?.name ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldKvk")}
          <input
            name="kvkNumber"
            required
            pattern="[0-9]{8}"
            title={t("sell.fieldKvkHint")}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldContactName")}
          <input name="contactName" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldEmail")}
          <input name="email" type="email" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldPhone")}
          <input name="phone" type="tel" className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldCity")}
          <input name="city" required defaultValue={prefill?.city ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("sell.fieldMotivation", { brand: BRAND.name })}
          <textarea name="motivation" required rows={4} className={field} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input name="acceptedTerms" type="checkbox" required className="mt-1" />
          <span>{t("sell.fieldTerms")}</span>
        </label>

        {errors.length > 0 && (
          <ul className="list-inside list-disc rounded-xl bg-terra-50 p-3 text-sm text-terra-800">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {submitting ? t("sell.submitting") : t("sell.submit")}
        </button>
      </form>
    </main>
  );
}
