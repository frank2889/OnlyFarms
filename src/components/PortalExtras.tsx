"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { confirmListingAction, updateSellerContactAction } from "@/app/portaal/actions";
import { CheckIcon } from "@/components/icons";

const field = "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm";

/** "Alles klopt nog": zet laatst-bevestigd op vandaag */
export function ConfirmListingButton() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-terra-700">
        <CheckIcon width={15} height={15} /> {t("portal.confirmedNow")}
      </span>
    );
  }
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await confirmListingAction();
          if (result.ok) {
            setDone(true);
            router.refresh();
          }
        })
      }
      disabled={pending}
      className="rounded-full border border-terra-300 px-4 py-2 text-sm font-medium text-terra-700 hover:bg-terra-50 disabled:opacity-50"
    >
      {t("portal.confirmAll")}
    </button>
  );
}

/** Contactpersoon-gegevens (sellers-tabel) bewerken */
export function SellerContactForm({
  contactName,
  phone,
  email,
}: {
  contactName: string;
  phone: string | null;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(contactName);
  const [tel, setTel] = useState(phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await updateSellerContactAction({ contactName: name, phone: tel });
          if (!result.ok) return setError(result.error);
          setSaved(true);
          router.refresh();
        });
      }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="s-name">
            {t("portal.contactName")}
          </label>
          <input
            id="s-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className={field}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="s-phone">
            {t("portal.contactPhone")}
          </label>
          <input
            id="s-phone"
            value={tel}
            onChange={(e) => {
              setTel(e.target.value);
              setSaved(false);
            }}
            className={field}
          />
        </div>
      </div>
      <p className="text-xs text-ink-500">
        {email} · {t("portal.contactEmailHint")}
      </p>
      {error && <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>}
      {saved && <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{t("admin.saved")}</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-terra-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {t("common.save")}
        </button>
      </div>
    </form>
  );
}
