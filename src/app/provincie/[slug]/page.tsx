import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { PROVINCES, provinceFromSlug } from "@/lib/provinces";
import { slugify } from "@/lib/slug";
import { producersByProvince } from "@/lib/queries/producers";
import { SproutIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return PROVINCES.map((p) => ({ slug: slugify(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const province = provinceFromSlug((await params).slug);
  if (!province) return {};
  return {
    title: t("producers.inProvince", { province }),
    description: `Alle lokale producenten in ${province}: boerderijwinkels, verse producten rechtstreeks van de producent.`,
    alternates: { canonical: `/provincie/${(await params).slug}` },
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const province = provinceFromSlug((await params).slug);
  if (!province) notFound();

  const producers = await producersByProvince(province);
  const slug = slugify(province);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Producenten", path: "/producenten" },
          { name: province, path: `/provincie/${slug}` },
        ])}
      />
      <JsonLd
        data={itemListLd(
          t("producers.inProvince", { province }),
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

      <h1 className="mb-1 text-3xl font-bold">
        {t("producers.inProvince", { province })}
      </h1>
      <p className="mb-6 text-ink-500">{producers.length} producenten</p>

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
