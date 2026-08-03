"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/catalog";
import { uploadImage } from "@/lib/upload-client";
import { saveOfferAction } from "@/app/portaal/actions";

type OfferValues = {
  title: string;
  category: string;
  description: string;
  priceIndication: string;
  photoUrl: string;
  available: boolean;
};

const field = "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm";
const label = "mb-1 block text-sm font-medium";

export default function OfferForm({
  offerId,
  initial,
}: {
  offerId: number | null;
  initial: OfferValues;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<OfferValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof OfferValues>(key: K, value: OfferValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    const result = await uploadImage(file);
    setBusy(false);
    if (!result.url) setError(result.error ?? "Upload mislukt.");
    else set("photoUrl", result.url);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await saveOfferAction(offerId, {
            title: form.title,
            category: form.category || null,
            description: form.description || null,
            priceIndication: form.priceIndication || null,
            photoUrl: form.photoUrl || null,
            available: form.available,
          });
          if (result.ok) {
            router.push("/portaal/producten");
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className={label} htmlFor="o-title">{t("portal.offerTitle")}</label>
        <input id="o-title" value={form.title} onChange={(e) => set("title", e.target.value)} className={field} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="o-category">{t("portal.offerCategory")}</label>
          <select
            id="o-category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={field}
          >
            <option value="">{t("portal.noCategory")}</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="o-price">{t("portal.offerPrice")}</label>
          <input
            id="o-price"
            value={form.priceIndication}
            onChange={(e) => set("priceIndication", e.target.value)}
            placeholder={t("portal.offerPricePlaceholder")}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="o-description">{t("portal.offerDescription")}</label>
        <textarea
          id="o-description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={field}
        />
      </div>

      <div>
        <span className={label}>{t("portal.offerPhoto")}</span>
        {form.photoUrl ? (
          <div className="relative inline-block overflow-hidden rounded-tile border border-cream-200">
            <Image
              src={form.photoUrl}
              alt=""
              width={280}
              height={210}
              className="aspect-4/3 w-56 object-cover"
            />
            <button
              type="button"
              onClick={() => set("photoUrl", "")}
              className="absolute right-2 top-2 rounded-full bg-ink-900/70 px-3 py-1 text-xs font-medium text-white hover:bg-ink-900"
            >
              {t("portal.removePhoto")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:border-terra-400 disabled:opacity-50"
          >
            {busy ? t("portal.uploading") : t("portal.addPhoto")}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => set("available", e.target.checked)}
          className="h-4 w-4 accent-terra-500"
        />
        {t("portal.offerAvailable")}
      </label>

      {error && <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending || busy}
          className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {t("portal.offerSave")}
        </button>
      </div>
    </form>
  );
}
