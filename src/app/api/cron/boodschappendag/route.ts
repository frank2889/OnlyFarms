import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { listsWithCounts, usersWithShoppingDay } from "@/lib/queries/accounts";
import { frequentBought, getListItems } from "@/lib/queries/lists";
import { pushSubscriptionsForUser } from "@/lib/queries/push";
import { sendPush } from "@/lib/push";
import { nowInAmsterdam } from "@/lib/opening-hours";
import { trackEvent } from "@/lib/klaviyo";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vaste lengte via een hash vóór het vergelijken, zodat timingSafeEqual werkt
// ongeacht de lengte van wat de aanvaller instuurt (anders gooit het een fout
// bij een lengteverschil, wat zelf weer een timing-signaal zou zijn).
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * CRO #83, twee onafhankelijke kanalen op je vaste boodschappendag: laag 2
 * (Klaviyo-mail, alleen met reminder_opt_in) en laag 3 (web push, alleen met
 * minstens 1 push-subscription). Draait 1x per dag via vercel.json, binnen
 * dezelfde per-gebruiker-loop (geen nieuwe cron nodig, Hobby-limiet); bepaalt
 * zelf de weekdag (Europe/Amsterdam). Best-effort per gebruiker én per
 * kanaal: één mislukte gebruiker of kanaal mag de rest niet blokkeren.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/boodschappendag?dry=1
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeEqual(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const { day } = nowInAmsterdam();
  const users = await usersWithShoppingDay(day);

  let mailSent = 0;
  let pushSent = 0;
  for (const user of users) {
    try {
      const lists = await listsWithCounts(user.id);
      const list = lists[0];
      if (!list) continue;

      const { open } = await getListItems(list.id);
      const openKeys = new Set(open.map((i) => i.catalogKey).filter((k): k is string => !!k));
      const staples = await frequentBought({ id: list.id, householdId: list.householdId });
      const staplesCount = staples.filter((k) => !openKeys.has(k)).length;
      const listUrl = absoluteUrl(`/lijst/${list.token}#lijst`);

      if (user.reminderOptIn) {
        try {
          if (!dry) {
            await trackEvent(
              "boodschappendag",
              { listName: list.name, listUrl, openItems: list.openCount, staples: staplesCount },
              user.email
            );
          }
          mailSent++;
        } catch {
          // best-effort: mail-kanaal breekt push voor deze gebruiker niet
        }
      }

      const subs = await pushSubscriptionsForUser(user.id);
      if (subs.length > 0) {
        if (!dry) {
          await Promise.all(
            subs.map((sub) =>
              sendPush(sub, {
                title: "Boodschappendag",
                body: `${list.openCount} open op je lijst, ${staplesCount} vaste boodschappen nog niet erop.`,
                url: listUrl,
              })
            )
          );
        }
        pushSent++;
      }
    } catch {
      // best-effort: één mislukte gebruiker breekt de rest niet
    }
  }

  return NextResponse.json({ day, usersChecked: users.length, mailSent, pushSent, dry });
}
