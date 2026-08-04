"use client";

import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListAction, createSampleListAction } from "@/app/lijst/actions";
import { t } from "@/lib/i18n";
import { ListIcon, PlusIcon } from "@/components/icons";
import {
  listsSnapshot,
  parseStoredLists,
  rememberList,
  subscribeLists,
  type StoredList,
} from "@/lib/lists-local";

// De lijst direct op de homepage: nieuwe lijst starten of verder met een bestaande.
export default function HomeListPanel({
  serverLists,
}: {
  serverLists: StoredList[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const rawLists = useSyncExternalStore(subscribeLists, listsSnapshot, () => "[]");
  const myLists = useMemo<StoredList[]>(() => {
    const local = parseStoredLists(rawLists);
    const serverTokens = new Set(serverLists.map((l) => l.token));
    return [...serverLists, ...local.filter((l) => !serverTokens.has(l.token))].slice(0, 4);
  }, [rawLists, serverLists]);

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const list = await createListAction(name || "Boodschappen");
      rememberList({ token: list.token, name: list.name });
      router.push(`/lijst/${list.token}`);
    });
  }

  // CRO #7: zonder typen meteen een gevulde lijst en dus meteen lokale matches
  function createSample() {
    startTransition(async () => {
      const list = await createSampleListAction();
      rememberList({ token: list.token, name: "Boodschappen" });
      router.push(`/lijst/${list.token}`);
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-tile border border-cream-200 bg-white p-4 text-left shadow-sm">
      <form onSubmit={create} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("lists.newListNamePlaceholder")}
          className="min-w-0 flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-terra-500 px-5 py-2.5 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          <PlusIcon width={16} height={16} /> {t("home.ctaList")}
        </button>
      </form>
      <p className="mt-2 text-center text-sm text-ink-500">
        <button
          onClick={createSample}
          disabled={pending}
          className="text-terra-700 underline disabled:opacity-50"
        >
          {t("home.sampleList")}
        </button>
      </p>

      {myLists.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {myLists.map((l) => (
            <li key={l.token}>
              <Link
                href={`/lijst/${l.token}`}
                className="flex items-center gap-2.5 rounded-xl bg-cream-50 px-3 py-2.5 hover:bg-cream-100"
              >
                <ListIcon width={17} height={17} className="text-terra-500" />
                <span className="font-medium">{l.name}</span>
              </Link>
            </li>
          ))}
          <li className="pt-1 text-center">
            <Link href="/lijsten" className="text-sm text-terra-700 underline">
              {t("lists.title")}
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
