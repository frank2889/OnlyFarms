"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerkopenPage() {
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
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => null);
      setErrors(data?.errors ?? [data?.error ?? "Er ging iets mis, probeer het later opnieuw."]);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="mb-4 text-2xl font-bold">Aanmelding ontvangen</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Bedankt voor je aanmelding. We beoordelen elke aanmelding handmatig en
          nemen contact met je op via het opgegeven e-mailadres.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          terug naar home
        </Link>
      </main>
    );
  }

  const field = "w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Verkopen via OnlyFarms</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
        Voor bedrijven met een KVK-inschrijving. Na aanmelding volgt een
        handmatige beoordeling. OnlyFarms is een platform dat vraag en aanbod
        bij elkaar brengt: wij verwerken geen betalingen en zijn geen partij
        bij de verkoop — jij blijft als verkoper zelf verantwoordelijk voor je
        producten en voor het naleven van de regels die daarvoor gelden.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Bedrijfsnaam *
          <input name="name" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          KVK-nummer *
          <input name="kvkNumber" required pattern="[0-9]{8}" title="8 cijfers" className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Contactpersoon *
          <input name="contactName" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          E-mailadres *
          <input name="email" type="email" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Telefoon
          <input name="phone" type="tel" className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Plaats *
          <input name="city" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Wat wil je aanbieden, en waarom past dat bij OnlyFarms? *
          <textarea name="motivation" required rows={4} className={field} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input name="acceptedTerms" type="checkbox" required className="mt-1" />
          <span>
            Ik ga akkoord met de voorwaarden en begrijp dat ik als verkoper
            zelf verantwoordelijk ben voor mijn producten, de kwaliteit ervan
            en het naleven van de geldende wet- en regelgeving. *
          </span>
        </label>

        {errors.length > 0 && (
          <ul className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {submitting ? "Versturen…" : "Aanmelding versturen"}
        </button>
      </form>
    </main>
  );
}
