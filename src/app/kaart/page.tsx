import { redirect } from "next/navigation";

// De kaart is bewust verdwenen: producenten vind je via de lijst en /producenten.
export default function KaartRedirect() {
  redirect("/producenten");
}
