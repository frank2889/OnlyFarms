import { BRAND } from "@/lib/brand";
import { producerBySlug } from "@/lib/queries/producers";
import VerkopenClient from "@/components/VerkopenClient";

export const metadata = {
  title: "Verkopen via " + BRAND.name,
  description:
    "Sluit je aan als lokale producent: klanten met een boodschappenlijst vinden jouw winkel, automaat of kraam.",
  alternates: { canonical: "/verkopen" },
};

export default async function VerkopenPage({
  searchParams,
}: {
  searchParams: Promise<{ vermelding?: string }>;
}) {
  const { vermelding } = await searchParams;
  const producer = vermelding ? await producerBySlug(vermelding) : null;
  const prefill =
    producer && !producer.isMember
      ? { slug: producer.slug, name: producer.name, city: producer.city }
      : null;

  return <VerkopenClient prefill={prefill} />;
}
