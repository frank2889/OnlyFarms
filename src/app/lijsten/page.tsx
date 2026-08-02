"use client";

import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListAction } from "@/app/lijst/actions";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ListIcon, PlusIcon, SproutIcon } from "@/components/icons";

type StoredList = { token: string; name: string };

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export default function ListsPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const rawLists = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem("of_lists") ?? "[]",
    () => "[]"
  );
  const myLists = useMemo<StoredList[]>(() => {
    try {
      return JSON.parse(rawLists);
    } catch {
      return [];
    }
  }, [rawLists]);

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const list = await createListAction(name || "Boodschappen");
      const next = [{ token: list.token, name: list.name }, ...myLists];
      localStorage.setItem("of_lists", JSON.stringify(next.slice(0, 20)));
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
