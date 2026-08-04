import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { joinHouseholdAction } from "@/app/account/actions";
import { householdByInviteCode } from "@/lib/queries/accounts";
import { BRAND } from "@/lib/brand";
import { SproutIcon } from "@/components/icons";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Uitnodigingslink voor een gezin: ingelogd → direct aansluiten;
// niet ingelogd → registreren met de code alvast ingevuld.
export default async function JoinHouseholdPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const household = await householdByInviteCode(code);

  if (!household) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="mb-2 text-2xl font-bold">Uitnodiging niet gevonden</h1>
        <p className="text-ink-500">
          Deze uitnodigingslink klopt niet (meer). Vraag een nieuwe aan degene
          die je uitnodigde.
        </p>
        <Link href="/" className="mt-6 text-terra-700 underline">
          naar {BRAND.name}
        </Link>
      </main>
    );
  }

  const userId = await currentUserId();
  if (!userId) {
    redirect(`/registreren?code=${encodeURIComponent(code)}`);
  }

  await joinHouseholdAction(code);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
      <SproutIcon width={32} height={32} className="mx-auto mb-4 text-terra-500" />
      <h1 className="mb-2 text-2xl font-bold">Welkom bij {household.name}</h1>
      <p className="text-ink-500">
        Je ziet vanaf nu alle lijsten van dit gezin en kunt meedoen met afvinken.
      </p>
      <Link
        href="/lijsten"
        className="mx-auto mt-6 rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
      >
        Naar de lijsten
      </Link>
    </main>
  );
}
