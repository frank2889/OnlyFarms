"use client";

import { useState } from "react";
import { changePasswordAction } from "@/app/account/actions";

export default function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-ink-500 underline">
        Wachtwoord wijzigen
      </button>
    );
  }

  const field = "w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const result = await changePasswordAction(current, next);
        setBusy(false);
        setMessage(
          result.ok
            ? { ok: true, text: "Wachtwoord gewijzigd." }
            : { ok: false, text: result.error }
        );
        if (result.ok) {
          setCurrent("");
          setNext("");
          setOpen(false);
        }
      }}
      className="flex max-w-sm flex-col gap-2"
    >
      <input
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Huidig wachtwoord"
        required
        className={field}
      />
      <input
        type="password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        placeholder="Nieuw wachtwoord (minstens 8 tekens)"
        required
        minLength={8}
        className={field}
      />
      {message && (
        <p className={`text-sm ${message.ok ? "text-terra-700" : "text-terra-800"}`}>
          {message.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-terra-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          Opslaan
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-500 underline">
          Annuleren
        </button>
      </div>
    </form>
  );
}

export function CopyInviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const url = `${window.location.origin}/gezin/${code}`;
        if (navigator.share) {
          try {
            await navigator.share({ title: "Doe mee met ons gezin", url });
            return;
          } catch {}
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }}
      className="rounded-full border border-terra-300 px-3 py-1 text-sm text-terra-700 hover:bg-terra-50"
    >
      {copied ? "Link gekopieerd" : "Nodig gezinslid uit"}
    </button>
  );
}
