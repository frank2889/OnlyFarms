"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { t } from "@/lib/i18n";
import {
  deleteAccountAction,
  leaveHouseholdAction,
  renameHouseholdAction,
  resetTasteProfileAction,
  rotateInviteCodeAction,
  setNearbyRadiusAction,
  updateNameAction,
} from "@/app/account/actions";
import { PencilIcon } from "@/components/icons";

const field = "w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm";

/** Naam inline bewerken (potloodje naast de naam) */
export function NameEditor({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={t("profile.editName")}
        className="p-1 text-ink-500 hover:text-terra-600"
      >
        <PencilIcon width={16} height={16} />
      </button>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const result = await updateNameAction(value);
        setBusy(false);
        if (!result.ok) return setError(result.error);
        setOpen(false);
        setError(null);
        router.refresh();
      }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-1.5 text-base"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-terra-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {t("common.save")}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-500 underline">
        {t("common.cancel")}
      </button>
      {error && <span className="text-sm text-terra-800">{error}</span>}
    </form>
  );
}

/** Huishouden hernoemen, code vernieuwen en verlaten */
export function HouseholdControls({ name }: { name: string }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(name);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) return setError(result.error ?? "Er ging iets mis.");
    setRenaming(false);
    setConfirmLeave(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {renaming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => renameHouseholdAction(value));
          }}
          className="flex items-center gap-2"
        >
          <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus className={field + " max-w-52"} />
          <button type="submit" disabled={busy} className="rounded-full bg-terra-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
            {t("common.save")}
          </button>
          <button type="button" onClick={() => setRenaming(false)} className="text-sm text-ink-500 underline">
            {t("common.cancel")}
          </button>
        </form>
      ) : confirmLeave ? (
        <div className="rounded-xl bg-cream-100 p-3 text-sm">
          <p className="mb-2">{t("profile.leaveConfirm")}</p>
          <div className="flex gap-3">
            <button
              onClick={() => run(() => leaveHouseholdAction())}
              disabled={busy}
              className="rounded-full bg-ink-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {t("profile.leaveYes")}
            </button>
            <button onClick={() => setConfirmLeave(false)} className="text-sm text-ink-500 underline">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 text-sm">
          <button onClick={() => setRenaming(true)} className="text-terra-700 underline">
            {t("profile.renameHousehold")}
          </button>
          <button onClick={() => run(() => rotateInviteCodeAction())} disabled={busy} className="text-terra-700 underline disabled:opacity-50">
            {t("profile.rotateCode")}
          </button>
          <button onClick={() => setConfirmLeave(true)} className="text-ink-500 underline">
            {t("profile.leaveHousehold")}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-terra-800">{error}</p>}
    </div>
  );
}

/** Account-brede vlakbij-meldingsradius */
export function NearbyRadiusSetting({ current }: { current: number | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <select
      value={String(current ?? 0)}
      disabled={busy}
      onChange={async (e) => {
        setBusy(true);
        const v = Number(e.target.value);
        await setNearbyRadiusAction(v === 0 ? null : v);
        setBusy(false);
        router.refresh();
      }}
      className="rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-sm"
    >
      <option value="0">{t("profile.radiusOff")}</option>
      <option value="500">500 m</option>
      <option value="1000">1 km</option>
      <option value="2000">2 km</option>
    </select>
  );
}

/** Smaakprofiel wissen (met bevestiging) */
export function TasteResetButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm text-ink-500 underline">
        {t("profile.tasteReset")}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3 text-sm">
      <button
        onClick={async () => {
          setBusy(true);
          await resetTasteProfileAction();
          setBusy(false);
          setConfirming(false);
          router.refresh();
        }}
        disabled={busy}
        className="rounded-full bg-ink-900 px-4 py-1.5 font-medium text-white disabled:opacity-50"
      >
        {t("profile.tasteResetYes")}
      </button>
      <button onClick={() => setConfirming(false)} className="text-ink-500 underline">
        {t("common.cancel")}
      </button>
    </span>
  );
}

/** Gevarenzone: account verwijderen met wachtwoord-bevestiging */
export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-ink-500 underline">
        {t("profile.deleteAccount")}
      </button>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const result = await deleteAccountAction(password);
        if (!result.ok) {
          setBusy(false);
          return setError(result.error ?? "Er ging iets mis.");
        }
        await signOut({ callbackUrl: "/" });
      }}
      className="flex max-w-sm flex-col gap-2"
    >
      <p className="text-sm text-ink-700">{t("profile.deleteExplain")}</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("profile.deletePasswordPlaceholder")}
        required
        className={field}
      />
      {error && <p className="text-sm text-terra-800">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !password}
          className="rounded-full bg-ink-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("profile.deleteConfirm")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-500 underline">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
