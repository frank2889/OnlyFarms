"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { uploadImage } from "@/lib/upload-client";
import { addProducerPhotoAction, removeProducerPhotoAction } from "@/app/portaal/actions";
import { PlusIcon } from "@/components/icons";

export default function PhotoManager({ photos, max }: { photos: string[]; max: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    const result = await uploadImage(file);
    setBusy(false);
    if (!result.url) {
      setError(result.error ?? "Upload mislukt.");
      return;
    }
    startTransition(async () => {
      const saved = await addProducerPhotoAction(result.url!);
      if (!saved.ok) setError(saved.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((url) => (
          <figure key={url} className="relative overflow-hidden rounded-tile border border-cream-200 bg-white">
            <Image
              src={url}
              alt=""
              width={400}
              height={300}
              className="aspect-4/3 w-full object-cover"
            />
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await removeProducerPhotoAction(url);
                  router.refresh();
                })
              }
              className="absolute right-2 top-2 rounded-full bg-ink-900/70 px-3 py-1 text-xs font-medium text-white hover:bg-ink-900"
            >
              {t("portal.removePhoto")}
            </button>
          </figure>
        ))}
        {photos.length < max && (
          <button
            type="button"
            disabled={busy || pending}
            onClick={() => fileRef.current?.click()}
            className="flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-tile border border-dashed border-cream-300 bg-white text-ink-500 hover:border-terra-400 disabled:opacity-50"
          >
            <PlusIcon width={22} height={22} />
            <span className="text-sm font-medium">
              {busy || pending ? t("portal.uploading") : t("portal.addPhoto")}
            </span>
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-3 rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>
      )}
      {photos.length === 0 && !busy && (
        <p className="mt-3 text-sm text-ink-500">{t("portal.photosEmpty")}</p>
      )}
    </div>
  );
}
