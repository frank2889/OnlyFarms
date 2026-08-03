"use client";

import { useMemo, useState, useTransition } from "react";
import { t } from "@/lib/i18n";
import { CATALOG } from "@/lib/catalog";
import { updateProducerAction, type ProducerFormInput } from "@/app/beheer/producenten/actions";

export type ProducerFormField =
  | "name"
  | "kind"
  | "status"
  | "isMember"
  | "address"
  | "contact"
  | "description"
  | "openingHours"
  | "products";

const ALL_FIELDS: ProducerFormField[] = [
  "name",
  "kind",
  "status",
  "isMember",
  "address",
  "contact",
  "description",
  "openingHours",
  "products",
];

const KIND_OPTIONS = [
  { value: "boerderijwinkel", label: t("admin.kind.boerderijwinkel") },
  { value: "brouwerij", label: t("admin.kind.brouwerij") },
  { value: "bakkerij", label: t("admin.kind.bakkerij") },
  { value: "imkerij", label: t("admin.kind.imkerij") },
  { value: "wijngaard", label: t("admin.kind.wijngaard") },
  { value: "overig", label: t("admin.kind.overig") },
];

const STATUS_OPTIONS = [
  { value: "actief", label: t("admin.producerStatus.actief") },
  { value: "seizoen", label: t("admin.producerStatus.seizoen") },
  { value: "gestopt", label: t("admin.producerStatus.gestopt") },
  { value: "onbevestigd", label: t("admin.producerStatus.onbevestigd") },
];

const field = "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm";
const label = "mb-1 block text-sm font-medium";

type SaveAction = (
  producerId: number,
  input: ProducerFormInput
) => Promise<{ ok: true } | { ok: false; error: string }>;

type Props = {
  producerId: number;
  initial: ProducerFormInput;
  /** Subset voor het producentenportaal; beheer gebruikt alles */
  editableFields?: ProducerFormField[];
  /** Portaal geeft zijn eigen (owner-gecheckte) action mee; default is de beheer-action */
  action?: SaveAction;
};

export default function AdminProducerForm({ producerId, initial, editableFields, action }: Props) {
  const save: SaveAction = action ?? updateProducerAction;
  const fields = new Set(editableFields ?? ALL_FIELDS);
  const [form, setForm] = useState<ProducerFormInput>(initial);
  const [tokenInput, setTokenInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const knownTokens = useMemo(
    () => [...new Set(CATALOG.flatMap((item) => item.matchTokens))].sort(),
    []
  );

  const set = <K extends keyof ProducerFormInput>(key: K, value: ProducerFormInput[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addToken = () => {
    const token = tokenInput.trim().toLowerCase();
    if (!token) return;
    if (!form.products.includes(token)) set("products", [...form.products, token]);
    setTokenInput("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await save(producerId, form);
          if (result.ok) setSaved(true);
          else setError(result.error);
        });
      }}
      className="flex flex-col gap-4"
    >
      {fields.has("name") && (
        <div>
          <label className={label} htmlFor="p-name">{t("admin.formName")}</label>
          <input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={field} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.has("kind") && (
          <div>
            <label className={label} htmlFor="p-kind">{t("admin.formKind")}</label>
            <select id="p-kind" value={form.kind} onChange={(e) => set("kind", e.target.value)} className={field}>
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        {fields.has("status") && (
          <div>
            <label className={label} htmlFor="p-status">{t("admin.formStatus")}</label>
            <select id="p-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={field}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {fields.has("isMember") && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isMember}
            onChange={(e) => set("isMember", e.target.checked)}
            className="h-4 w-4 accent-terra-500"
          />
          {t("admin.formIsMember")}
        </label>
      )}

      {fields.has("address") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="p-address">{t("admin.formAddress")}</label>
            <input id="p-address" value={form.address} onChange={(e) => set("address", e.target.value)} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="p-postcode">{t("admin.formPostcode")}</label>
              <input id="p-postcode" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="p-city">{t("admin.formCity")}</label>
              <input id="p-city" value={form.city} onChange={(e) => set("city", e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="p-province">{t("admin.formProvince")}</label>
            <input id="p-province" value={form.province} onChange={(e) => set("province", e.target.value)} className={field} />
          </div>
        </div>
      )}

      {fields.has("contact") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="p-phone">{t("admin.formPhone")}</label>
            <input id="p-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="p-website">{t("admin.formWebsite")}</label>
            <input id="p-website" value={form.website} onChange={(e) => set("website", e.target.value)} className={field} />
          </div>
        </div>
      )}

      {fields.has("description") && (
        <div>
          <label className={label} htmlFor="p-description">{t("admin.formDescription")}</label>
          <textarea
            id="p-description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={field}
          />
        </div>
      )}

      {fields.has("openingHours") && (
        <div>
          <label className={label} htmlFor="p-hours">{t("admin.formHours")}</label>
          <input id="p-hours" value={form.openingHours} onChange={(e) => set("openingHours", e.target.value)} className={field} />
          <p className="mt-1 text-xs text-ink-500">{t("admin.formHoursHint")}</p>
        </div>
      )}

      {fields.has("products") && (
        <div>
          <span className={label}>{t("admin.formProducts")}</span>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {form.products.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => set("products", form.products.filter((p) => p !== token))}
                className="rounded-full bg-cream-100 px-3 py-1 text-sm hover:bg-terra-100"
                title={t("admin.delete")}
              >
                {token} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addToken();
                }
              }}
              list="known-tokens"
              placeholder={t("admin.formProductsPlaceholder")}
              className={`${field} flex-1`}
            />
            <datalist id="known-tokens">
              {knownTokens.map((token) => (
                <option key={token} value={token} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={addToken}
              className="shrink-0 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:border-terra-400"
            >
              {t("admin.formAdd")}
            </button>
          </div>
        </div>
      )}

      {error && <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{error}</p>}
      {saved && <p className="rounded-xl bg-terra-50 px-4 py-2 text-sm text-terra-800">{t("admin.saved")}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600 disabled:opacity-50"
        >
          {t("admin.save")}
        </button>
        <span className="text-xs text-ink-500">{t("admin.saveNote")}</span>
      </div>
    </form>
  );
}
