import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { BASICS, catalogItem } from "@/lib/catalog";
import { provinceFromSlug, provinceSlug } from "@/lib/provinces";
import { allProvinces, producersByProvinceAndToken } from "@/lib/queries/producers";
import { SproutIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd, provinceItemBreadcrumbs } from "@/lib/seo";

export const revalidate = 3600;

// ISR-on-demand: alleen een kleine statische kern vooraf (BASICS x de
// grootste provincies), de rest rendert lazy bij eerste bezoek en blijft
// daarna gecached (dynamicParams staat op de standaardwaarde true).
export async function generateStaticParams() {
  const provinces = await allProvinces();
  const top = [...provinces]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((p) => p.province);
  const params: { slug: string; item: string }[] = [];
  for (const province of top) {
    for (const key of BASICS) {
      params.push({ slug: provinceSlug(province), item: key });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; item: string }>;
}): Promise<Metadata> {
  const { slug, item: itemKey } = await params;
  const province = provinceFromSlug(slug);
  const item = catalogItem(itemKey);
  if (!province || !item) return {};
  return {
    title: t("producers.itemInProvince", { item: item.label, province }),
    description: t("producers.itemInProvinceIntro", { item: item.label.toLowerCase(), province }),
    alternates: { canonical: `/provincie/${slug}/${itemKey}` },
  };
}

export default async function ProvinceItemPage({
  params,
}: {
  params: Promise<{ slug: string; item: string }>;
}) {
  const { slug, item: itemKey } = await params;
  const province = provinceFromSlug(slug);
  const item = catalogItem(itemKey);
  if (!province || !item || item.matchTokens.length === 0) notFound();

  const producers = await producersByProvinceAndToken(province, item.matchTokens);
  if (producers.length === 0) notFound();

  const crumbs = provinceItemBreadcrumbs(province, item.label, itemKey);
  const title = t("producers.itemInProvince", { item: item.label, province });

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={itemListLd(
          title,
          producers.map((p) => ({ name: p.name, path: `/producent/${p.slug}` }))
        )}
      />
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <Link href="/producenten" className="text-sm text-terra-700 underline">
          {t("producers.title")}
        </Link>
      </header>

      {/* Zichtbare breadcrumb: matcht de BreadcrumbList */}
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.slice(0, -1).map((c, i) => (
            <li key={c.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              <Link href={c.path} className="hover:text-terra-700 hover:underline">
                {c.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="mb-1 text-3xl font-bold">{title}</h1>
      <p className="mb-6 text-ink-500">
        {t("producers.itemInProvinceIntro", { item: item.label.toLowerCase(), province })}
      </p>

      <ul className="flex flex-col gap-2">
        {producers.map((p) => (
          <li key={p.id}>
            <Link
              href={`/producent/${p.slug}`}
              className="flex items-center gap-3 rounded-tile border border-cream-200 bg-white p-4 hover:border-terra-400"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium">{p.name}</span>
                <p className="truncate text-sm text-ink-500">
                  {[p.city, p.products.slice(0, 4).join(", ")].filter(Boolean).join(" · ")}
                </p>
              </div>
              {p.isMember && (
                <span className="rounded-full bg-terra-100 px-2 py-0.5 text-xs text-terra-700">
                  {t("producers.memberBadge")}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
