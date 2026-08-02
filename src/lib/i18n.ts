import nl from "@/messages/nl.json";

type Messages = typeof nl;

// Lichte i18n-helper: alle UI-teksten in src/messages/<taal>.json.
// Nu alleen NL; een extra taal = extra JSON + taalkeuze hier.
const messages: Messages = nl;

type Path<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${Path<T[K]>}`;
    }[keyof T & string];

export function t(key: Path<Messages>, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    node = (node as Record<string, unknown>)?.[part];
  }
  let text = typeof node === "string" ? node : key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
