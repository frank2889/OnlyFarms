"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimListAction } from "@/app/account/actions";
import { PlusIcon } from "@/components/icons";

export default function ClaimListButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await claimListAction(token);
          if (result.ok) {
            setDone(true);
            router.refresh();
          }
        })
      }
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-terra-300 bg-terra-50 px-4 py-1.5 text-sm text-terra-800 hover:bg-terra-100 disabled:opacity-50"
    >
      <PlusIcon width={14} height={14} /> Zet deze lijst in mijn gezin
    </button>
  );
}
