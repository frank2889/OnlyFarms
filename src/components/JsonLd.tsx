const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * "</script>" in een vrij tekstveld (bijv. producer.description) zou de
 * scripttag anders vroegtijdig sluiten en de rest van de pagina als
 * uitvoerbare markup laten renderen (opgeslagen XSS). JSON.stringify
 * escapet dit zelf niet.
 */
function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}

/**
 * Eén plek voor JSON-LD-injectie; pagina's bouwen hun object via src/lib/seo.ts
 * en renderen het met <JsonLd data={...} />. Server component, geen state.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
