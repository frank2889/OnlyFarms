"use client";

import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListAction, deleteListAction, duplicateListAction, renameListAction } from "@/app/lijst/actions";
import { t } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import {
  listsSnapshot,
  parseStoredLists,
  pinnedSnapshot,
  rememberList,
  renameStoredList,
  forgetList,
  subscribeLists,
  togglePinnedList,
  type StoredList,
} from "@/lib/lists-local";
import { CopyIcon, ListIcon, PencilIcon, PinIcon, PlusIcon, SproutIcon, TrashIcon, UserIcon } from "@/components/icons";

type ServerList = { token: string; name: string; openCount: number; updatedAt: string };
type Row = { token: string; name: string; openCount: number | null; updatedAt: string | null };

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

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
  const [renamingToken, setRenamingToken] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteToken, setConfirmDeleteToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rawLists = useSyncExternalStore(subscribeLists, listsSnapshot, () => "[]");
  const rawPinned = useSyncExternalStore(subscribeLists, pinnedSnapshot, () => "");

  const rows = useMemo<Row[]>(() => {
    const local: StoredList[] = parseStoredLists(rawLists);
    const serverTokens = new Set(serverLists.map((l) => l.token));
    return [
      ...serverLists.map((l) => ({ ...l } as Row)),
      ...local
        .filter((l) => !serverTokens.has(l.token))
        .map((l) => ({ token: l.token, name: l.name, openCount: null, updatedAt: null })),
    ];
  }, [rawLists, serverLists]);

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const list = await createListAction(name || "Boodschappen");
      rememberList({ token: list.token, name: list.name });
      router.push(`/lijst/${list.token}`);
    });
  }

  function startRename(row: Row) {
    setRenamingToken(row.token);
    setRenameValue(row.name);
    setError(null);
  }

  function submitRename(e: React.FormEvent, token: string) {
    e.preventDefault();
    const value = renameValue;
    startTransition(async () => {
      const result = await renameListAction(token, value);
      if (!result.ok) {
        setError(result.error ?? t("lists.manageDenied"));
        return;
      }
      renameStoredList(token, value.trim() || "Boodschappen");
      setRenamingToken(null);
      router.refresh();
    });
  }

  function remove(token: string) {
    if (confirmDeleteToken !== token) {
      setConfirmDeleteToken(token);
      setTimeout(() => setConfirmDeleteToken((cur) => (cur === token ? null : cur)), 4000);
      return;
    }
    startTransition(async () => {
      const result = await deleteListAction(token);
      setConfirmDeleteToken(null);
      if (!result.ok) {
        setError(result.error ?? t("lists.manageDenied"));
        return;
      }
      forgetList(token);
      router.refresh();
    });
  }

  function duplicate(row: Row) {
    startTransition(async () => {
      const result = await duplicateListAction(row.token, `${row.name}${t("lists.duplicateSuffix")}`);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      rememberList({ token: result.token, name: result.name });
      router.push(`/lijst/${result.token}`);
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

      {error && (
        <p className="mb-4 rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-tile border border-dashed border-cream-300 p-8 text-center text-ink-500">
          {t("lists.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const pinned = rawPinned === row.token;
            const isRenaming = renamingToken === row.token;
            return (
              <li key={row.token} className="rounded-tile border border-cream-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  {isRenaming ? (
                    <form
                      onSubmit={(e) => submitRename(e, row.token)}
                      className="flex min-w-0 flex-1 gap-2"
                    >
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="min-w-0 flex-1 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-full bg-terra-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-terra-600"
                      >
                        {t("common.save")}
                      </button>
                    </form>
                  ) : (
                    <Link href={`/lijst/${row.token}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <ListIcon width={20} height={20} className="shrink-0 text-terra-500" />
                      <div className="min-w-0">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="truncate">{row.name}</span>
                          {pinned && (
                            <span className="shrink-0 rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                              {t("lists.pinnedBadge")}
                            </span>
                          )}
                        </span>
                        <p className="truncate text-xs text-ink-500">
                          {row.openCount != null
                            ? [
                                t("lists.openCount", { n: row.openCount }),
                                row.updatedAt
                                  ? t("lists.updatedAt", {
                                      date: dateFmt.format(new Date(row.updatedAt)),
                                    })
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")
                            : t("lists.deviceOnly")}
                        </p>
                      </div>
                    </Link>
                  )}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      onClick={() => togglePinnedList(row.token)}
                      title={pinned ? t("lists.unpin") : t("lists.pin")}
                      className={`rounded-full p-2 hover:bg-cream-50 ${pinned ? "text-terra-500" : "text-ink-300"}`}
                    >
                      <PinIcon width={16} height={16} />
                    </button>
                    <button
                      onClick={() => startRename(row)}
                      title={t("lists.renameList")}
                      className="rounded-full p-2 text-ink-500 hover:bg-cream-50"
                    >
                      <PencilIcon width={16} height={16} />
                    </button>
                    <button
                      onClick={() => duplicate(row)}
                      title={t("lists.duplicate")}
                      className="rounded-full p-2 text-ink-500 hover:bg-cream-50"
                    >
                      <CopyIcon width={16} height={16} />
                    </button>
                    <button
                      onClick={() => remove(row.token)}
                      title={t("lists.deleteList")}
                      className={`rounded-full p-2 hover:bg-cream-50 ${
                        confirmDeleteToken === row.token ? "text-terra-700" : "text-ink-300"
                      }`}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
