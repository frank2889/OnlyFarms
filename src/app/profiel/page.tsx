import { createElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { BRAND } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { catalogItem } from "@/lib/catalog";
import { householdForUser, listsWithCounts, userById } from "@/lib/queries/accounts";
import { boughtStatsFor } from "@/lib/queries/lists";
import { sellerForUser } from "@/lib/queries/portal";
import { tasteProfileFor } from "@/lib/queries/swipe";
import { iconForItem, tintForCategory } from "@/components/catalog-icons";
import { BellIcon, SproutIcon, UserIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import PasswordForm, { CopyInviteLink } from "@/components/PasswordForm";
import {
  DeleteAccountForm,
  HouseholdControls,
  NameEditor,
  NearbyRadiusSetting,
  TasteResetButton,
} from "@/components/ProfileControls";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

function ItemChip({ catalogKey, suffix }: { catalogKey: string; suffix: string }) {
  const item = catalogItem(catalogKey);
  if (!item) return null;
  const tint = tintForCategory(item.category);
  return (
    <li className="flex items-center gap-2 rounded-full bg-cream-50 py-1 pl-1.5 pr-3 text-sm">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${tint.tileBg}`}>
        {createElement(iconForItem(item), { width: 16, height: 16, className: tint.icon })}
      </span>
      <span className="font-medium">{item.label}</span>
      <span className="text-xs text-ink-500">{suffix}</span>
    </li>
  );
}

export default async function ProfilePage() {
  const userId = await currentUserId();
  if (!userId) redirect("/inloggen?terug=/profiel");

  const [user, household, myLists, seller, taste] = await Promise.all([
    userById(userId),
    householdForUser(userId),
    listsWithCounts(userId),
    sellerForUser(userId),
    tasteProfileFor(userId),
  ]);
  if (!user) redirect("/inloggen");

  // Koophistorie is bewust gezinsdata, geen persoonsdata
  const bought = household
    ? (await boughtStatsFor({ id: 0, householdId: household.id })).slice(0, 6)
    : [];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <SproutIcon width={20} height={20} className="text-terra-500" />
          {BRAND.name}
        </Link>
        <LogoutButton />
      </header>

      {/* Identiteit */}
      <section className="mb-4 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terra-100 text-terra-700">
          <UserIcon width={28} height={28} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-2xl font-bold">{user.name}</h1>
            <NameEditor name={user.name} />
          </div>
          <p className="truncate text-sm text-ink-500">
            {user.email} <span className="text-ink-300">· {t("profile.emailHint")}</span>
          </p>
        </div>
      </section>

      {/* Team en verkoper */}
      {user.role === "team" && (
        <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t("profile.teamTitle")}
          </h2>
          <p className="text-sm text-ink-700">{t("profile.teamText")}</p>
          <Link href="/beheer" className="mt-1 inline-block text-sm font-medium text-terra-700 underline">
            {t("profile.teamLink")}
          </Link>
        </section>
      )}
      {seller && (
        <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t("portal.profileTitle")}
          </h2>
          <p className="text-sm text-ink-700">{seller.name}</p>
          <Link href="/portaal" className="mt-1 inline-block text-sm font-medium text-terra-700 underline">
            {t("portal.profileLink")}
          </Link>
        </section>
      )}

      {/* Huishouden */}
      {household && (
        <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t("profile.householdTitle")}
          </h2>
          <p className="font-medium">{household.name}</p>
          <p className="mb-2 text-sm text-ink-500">{t("profile.householdIntro")}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {household.members.map((m) => (
              <span
                key={m.id}
                className={`rounded-full px-3 py-1 text-sm ${
                  m.id === userId ? "bg-terra-500 text-white" : "bg-cream-100 text-ink-700"
                }`}
              >
                {m.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CopyInviteLink code={household.inviteCode} />
            <code className="rounded bg-cream-100 px-2 py-0.5 text-sm">{household.inviteCode}</code>
          </div>
          <HouseholdControls name={household.name} />
        </section>
      )}

      {/* Instellingen (account-breed) */}
      <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t("profile.settingsTitle")}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <BellIcon width={15} height={15} className="shrink-0 text-terra-500" />
          <span>{t("profile.radiusLabel")}:</span>
          <NearbyRadiusSetting current={user.nearbyRadiusM} />
        </div>
        <p className="mt-1.5 text-xs text-ink-500">{t("profile.radiusHint")}</p>
      </section>

      {/* Jouw smaak: wat de smaakmodus leerde, transparant en wisbaar */}
      <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t("profile.tasteTitle")}
        </h2>
        <p className="mb-3 text-sm text-ink-500">{t("profile.tasteIntro")}</p>
        {taste.top.length === 0 && taste.flop.length === 0 ? (
          <p className="text-sm text-ink-700">{t("profile.tasteEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {taste.top.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-terra-700">
                  {t("profile.tasteTop")}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {taste.top.map((x) => (
                    <ItemChip key={x.key} catalogKey={x.key} suffix={t("profile.tasteTimes", { n: x.likes })} />
                  ))}
                </ul>
              </div>
            )}
            {taste.flop.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {t("profile.tasteFlop")}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {taste.flop.map((x) => (
                    <ItemChip key={x.key} catalogKey={x.key} suffix={t("profile.tasteTimes", { n: x.skips })} />
                  ))}
                </ul>
              </div>
            )}
            <div>
              <TasteResetButton />
            </div>
          </div>
        )}
        {bought.length > 0 && (
          <div className="mt-4 border-t border-cream-100 pt-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t("profile.boughtTitle")}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {bought.map((b) => (
                <ItemChip key={b.key} catalogKey={b.key} suffix={t("profile.tasteTimes", { n: b.times })} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Lijsten */}
      <section className="mb-4 rounded-tile border border-cream-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t("profile.listsTitle")}
        </h2>
        {myLists.length === 0 ? (
          <p className="text-sm text-ink-700">
            {t("profile.listsEmpty")}{" "}
            <Link href="/lijsten" className="text-terra-700 underline">
              {t("lists.title")}
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {myLists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/lijst/${l.token}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-cream-200 px-3 py-2.5 hover:border-terra-400"
                >
                  <span className="min-w-0 truncate font-medium">{l.name}</span>
                  <span className="flex shrink-0 items-center text-sm text-ink-500">
                    {l.openCount > 0 && (
                      <span className="mr-2 rounded-full bg-terra-100 px-2 py-0.5 text-xs font-bold text-terra-700">
                        {t("profile.listOpenCount", { n: l.openCount })}
                      </span>
                    )}
                    {dateFmt.format(l.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Account: wachtwoord + gevarenzone */}
      <section className="rounded-tile border border-cream-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t("profile.dangerTitle")}
        </h2>
        <div className="flex flex-col gap-3">
          <PasswordForm />
          <DeleteAccountForm />
        </div>
      </section>
    </main>
  );
}
