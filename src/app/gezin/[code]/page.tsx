import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { householdByInviteCode } from "@/lib/queries/accounts";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import JoinHouseholdConfirm from "@/components/JoinHouseholdConfirm";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Uitnodigingslink voor een gezin: ingelogd → bevestigen en aansluiten;
// niet ingelogd → registreren met de code alvast ingevuld. Aansluiten
// gebeurt bewust pas na een tik (JoinHouseholdConfirm), nooit al op deze
// GET: een linkpreview of prefetch mag niemand ongevraagd laten wisselen.
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
        <h1 className="mb-2 text-2xl font-bold">{t("household.inviteNotFoundTitle")}</h1>
        <p className="text-ink-500">{t("household.inviteNotFoundText")}</p>
        <Link href="/" className="mt-6 text-terra-700 underline">
          {t("household.toBrand", { brand: BRAND.name })}
        </Link>
      </main>
    );
  }

  const userId = await currentUserId();
  if (!userId) {
    redirect(`/registreren?code=${encodeURIComponent(code)}`);
  }

  return <JoinHouseholdConfirm code={code} householdName={household.name} />;
}
