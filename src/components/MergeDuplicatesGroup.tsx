"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mergeProducersAction, setProducerStoppedAction } from "@/app/beheer/producenten/actions";

type Member = {
  id: number;
  name: string;
  city: string | null;
  status: string;
  isMember: boolean;
  slug: string;
};

/**
 * Eén duplicaten-groep: radio kiest welk record blijft bestaan, de rest gaat
 * bij "Samenvoegen" op status gestopt (mergeProducersAction). Geen nieuw
 * generiek bulk-select-patroon, dit is de enige plek die het nodig heeft.
 */
export default function MergeDuplicatesGroup({ members }: { members: Member[] }) {
  const router = useRouter();
  const [keepId, setKeepId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function merge() {
    if (keepId == null || pending) return;
    startTransition(async () => {
      const result = await mergeProducersAction(
        members.map((m) => m.id),
        keepId
      );
      if (result.ok) {
        setDone(true);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="radio"
              name={`keep-${members.map((x) => x.id).join("-")}`}
              checked={keepId === m.id}
              onChange={() => setKeepId(m.id)}
              disabled={done}
              aria-label={t("admin.mergeKeep")}
              className="h-4 w-4 accent-terra-500"
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {m.name}
              {m.city ? ` · ${m.city}` : ""}
            </span>
            {m.isMember && (
              <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                {t("producers.memberBadge")}
              </span>
            )}
            <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-xs text-ink-700">
              {m.status}
            </span>
            <Link href={`/beheer/producenten/${m.id}`} className="shrink-0 text-terra-700 underline">
              {t("admin.view")}
            </Link>
            <form action={setProducerStoppedAction.bind(null, m.id)}>
              <button type="submit" className="text-ink-500 underline">
                {t("admin.setStopped")}
              </button>
            </form>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2">
        {done ? (
          <span className="text-sm font-medium text-terra-700">{t("admin.mergeDone")}</span>
        ) : (
          <button
            type="button"
            onClick={merge}
            disabled={keepId == null || pending}
            className="rounded-full border border-terra-300 px-4 py-2 text-sm font-medium text-terra-700 hover:bg-terra-50 disabled:opacity-50"
          >
            {t("admin.mergeAction")}
          </button>
        )}
        {!done && <span className="text-xs text-ink-500">{t("admin.mergeHint")}</span>}
      </div>
    </div>
  );
}
