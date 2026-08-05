"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { deleteUserAdminAction } from "@/app/beheer/gebruikers/actions";

/** Confirm-tap: eerste klik toont de bevestiging, tweede klik verwijdert echt */
export default function DeleteUserButton({ userId, email }: { userId: number; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return <span className="text-sm text-ink-500">{t("admin.userDeleted")}</span>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-terra-700 underline">
        {t("admin.userDelete")}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <p className="text-ink-700">{t("admin.userDeleteConfirm", { email })}</p>
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await deleteUserAdminAction(userId);
              if (result.ok) {
                setDone(true);
                router.refresh();
              } else {
                setError(result.error);
              }
            })
          }
          className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {t("admin.userDeleteYes")}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-500 underline">
          {t("common.cancel")}
        </button>
      </div>
      {error && <p className="text-xs text-terra-700">{error}</p>}
    </div>
  );
}
