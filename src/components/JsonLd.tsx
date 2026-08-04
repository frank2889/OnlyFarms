/**
 * Eén plek voor JSON-LD-injectie; pagina's bouwen hun object via src/lib/seo.ts
 * en renderen het met <JsonLd data={...} />. Server component, geen state.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
