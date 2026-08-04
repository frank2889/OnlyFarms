"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";
import { t } from "@/lib/i18n";

/** Deelknop op de producentpagina: OS-share-sheet, met kopiëren als terugval */
export default function ProducerShareButton({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/producent/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      <button
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-terra-300 px-5 py-2.5 font-medium text-terra-700 hover:bg-terra-50"
      >
        <ShareIcon width={16} height={16} /> {t("producers.share")}
      </button>
      {copied && (
        <p className="mt-2 w-full text-sm text-terra-700">{t("producers.shareCopied")}</p>
      )}
    </>
  );
}
