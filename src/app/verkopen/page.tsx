import { BRAND } from "@/lib/brand";
import VerkopenClient from "@/components/VerkopenClient";

export const metadata = {
  title: "Verkopen via " + BRAND.name,
  description:
    "Sluit je aan als lokale producent: klanten met een boodschappenlijst vinden jouw winkel, automaat of kraam.",
  alternates: { canonical: "/verkopen" },
};

export default function VerkopenPage() {
  return <VerkopenClient />;
}
