"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import {
  confirmListingAction,
  confirmOfferAction,
  setClosedUntilAction,
  updateSellerContactAction,
} from "@/app/portaal/actions";
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

const OFFER_STALE_DAYS = 90;

/** "Alles klopt nog" voor één product; verschijnt alleen als het nooit of >90 dagen geleden bevestigd is */
export function ConfirmOfferButton({
  offerId,
  lastVerifiedAt,
}: {
  offerId: number;
  lastVerifiedAt: Date | null;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const staleMs = OFFER_STALE_DAYS * 24 * 60 * 60 * 1000;
  // eslint-disable-next-line react-hooks/purity -- klokvergelijking voor verjaar-drempel is hier bewust
  const isStale = !lastVerifiedAt || Date.now() - new Date(lastVerifiedAt).getTime() > staleMs;
  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-terra-700">
        <CheckIcon width={13} height={13} /> {t("portal.confirmedNow")}
      </span>
    );
  }
  if (!isStale) return null;
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await confirmOfferAction(offerId);
          if (result.ok) {
            setDone(true);
            router.refresh();
          }
        })
      }
      disabled={pending}
      className="text-xs text-terra-700 underline disabled:opacity-50"
    >
      {t("portal.offerConfirm")}
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

/** Vakantie/tijdelijk gesloten: verloopt vanzelf, matching blijft ongemoeid */
export function VacationToggle({ closedUntil }: { closedUntil: Date | null }) {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/purity -- klokvergelijking voor vakantiestatus is hier bewust
  const isActive = closedUntil != null && closedUntil.getTime() > Date.now();
  const [date, setDate] = useState(closedUntil ? closedUntil.toISOString().slice(0, 10) : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (isActive) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-700">
          {t("portal.vacationActive", {
            date: closedUntil!.toLocaleDateString("nl-NL", { day: "numeric", month: "long" }),
          })}
        </p>
        <button
          onClick={() =>
            startTransition(async () => {
              const result = await setClosedUntilAction(null);
              if (!result.ok) return setError(result.error);
              router.refresh();
            })
          }
          disabled={pending}
          className="shrink-0 rounded-full border border-terra-300 px-4 py-2 text-sm font-medium text-terra-700 hover:bg-terra-50 disabled:opacity-50"
        >
          {t("portal.vacationEnd")}
        </button>
        {error && <p className="w-full text-sm text-terra-800">{error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!date) return setError(t("portal.vacationPickDate"));
        startTransition(async () => {
          const result = await setClosedUntilAction(date);
          if (!result.ok) return setError(result.error);
          router.refresh();
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-cream-300 px-4 py-2 text-sm font-medium hover:border-terra-400 disabled:opacity-50"
      >
        {t("portal.vacationSet")}
      </button>
      {error && <p className="w-full text-sm text-terra-800">{error}</p>}
    </form>
  );
}
