"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { subscribePushAction, unsubscribePushAction } from "@/app/account/actions";
import { BellIcon } from "@/components/icons";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function pushSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Meldingen op je apparaat (boodschappendag-herinnering), los van de
 * AVG-mailopt-in. De toggle rendert altijd hetzelfde (geen server/client-
 * afhankelijke aan/uit-render): een niet-ondersteunende browser krijgt pas
 * bij een klik de foutmelding, dat voorkomt een hydratie-mismatch.
 */
export default function PushToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"denied" | "unsupported" | null>(null);

  useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
    );
  }, []);

  async function enable() {
    if (!pushSupported()) {
      setError("unsupported");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    setBusy(true);
    setError(null);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setError("denied");
      setBusy(false);
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const json = sub.toJSON();
    await subscribePushAction({
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    });
    setSubscribed(true);
    setBusy(false);
  }

  async function disable() {
    setBusy(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await unsubscribePushAction(sub.endpoint);
      await sub.unsubscribe();
    }
    setSubscribed(false);
    setBusy(false);
  }

  return (
    <div className="mt-4 border-t border-cream-100 pt-4">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={subscribed}
          disabled={busy}
          onChange={(e) => (e.target.checked ? enable() : disable())}
          className="mt-0.5 h-4 w-4 accent-terra-500"
        />
        <span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <BellIcon width={15} height={15} className="text-terra-500" />
            {t("profile.pushToggle")}
          </span>
          <span className="mt-0.5 block text-xs text-ink-500">{t("profile.pushToggleHint")}</span>
        </span>
      </label>
      {error === "denied" && (
        <p className="mt-1.5 text-xs text-terra-700">{t("profile.pushDenied")}</p>
      )}
      {error === "unsupported" && (
        <p className="mt-1.5 text-xs text-terra-700">{t("profile.pushUnsupported")}</p>
      )}
    </div>
  );
}
