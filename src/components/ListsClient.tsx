"use client";

import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListAction } from "@/app/lijst/actions";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ListIcon, PlusIcon, SproutIcon, UserIcon } from "@/components/icons";

type StoredList = { token: string; name: string };
type ServerList = { token: string; name: string };

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export default function ListsClient({
  serverLists,
  userName,
}: {
  serverLists: ServerList[];
  userName: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const rawLists = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_lists") ?? "[]",
    () => "[]"
  );
  const myLists = useMemo<StoredList[]>(() => {
    // Serverlijsten (account/huishouden) eerst, daarna lokale die daar niet in zitten
    let local: StoredList[] = [];
    try {
      local = JSON.parse(rawLists);
    } catch {}
    const serverTokens = new Set(serverLists.map((l) => l.token));
    return [...serverLists, ...local.filter((l) => !serverTokens.has(l.token))];
  }, [rawLists, serverLists]);

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const list = await createListAction(name || "Boodschappen");
      try {
        const stored: StoredList[] = JSON.parse(localStorage.getItem("of_lists") ?? "[]");
        localStorage.setItem(
          "of_lists",
          JSON.stringify([{ token: list.token, name: list.name }, ...stored].slice(0, 20))
        );
      } catch {}
      router.push(`/lijst/${list.token}`);
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link
          href={userName ? "/profiel" : "/inloggen"}
          className="inline-flex items-center gap-1.5 text-sm text-terra-700 underline"
        >
          <UserIcon width={15} height={15} /> {userName ?? "Inloggen"}
        </Link>
      </header>

      <h1 className="mb-4 text-2xl font-bold">{t("lists.title")}</h1>

      <form onSubmit={create} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("lists.newListNamePlaceholder")}
          className="flex-1 rounded-full border border-cream-300 bg-white px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-terra-500 px-5 py-2.5 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          <PlusIcon width={16} height={16} /> {t("lists.create")}
        </button>
      </form>

      {myLists.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-8 text-center text-ink-500">
          {t("lists.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {myLists.map((l) => (
            <li key={l.token}>
              <Link
                href={`/lijst/${l.token}`}
                className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
              >
                <ListIcon width={20} height={20} className="text-terra-500" />
                <span className="font-medium">{l.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
