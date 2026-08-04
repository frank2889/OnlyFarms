import { NextRequest, NextResponse } from "next/server";
import { listsWithCounts, usersWithShoppingDay } from "@/lib/queries/accounts";
import { frequentBought, getListItems } from "@/lib/queries/lists";
import { nowInAmsterdam } from "@/lib/opening-hours";
import { trackEvent } from "@/lib/klaviyo";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CRO #83 laag 2: op je vaste boodschappendag een Klaviyo-event met
 * e-mailadres, zodat Sally daar een herinneringsflow op kan bouwen (het
 * eerste niet-anonieme event hier). Draait 1x per dag via vercel.json;
 * bepaalt zelf de weekdag (Europe/Amsterdam) en stuurt alleen naar accounts
 * met een expliciete opt-in (reminder_opt_in). Best-effort per gebruiker:
 * één mislukte gebruiker mag de rest niet blokkeren.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/boodschappendag?dry=1
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const { day } = nowInAmsterdam();
  const users = await usersWithShoppingDay(day);

  let sent = 0;
  for (const user of users) {
    try {
      const lists = await listsWithCounts(user.id);
      const list = lists[0];
      if (!list) continue;

      const { open } = await getListItems(list.id);
      const openKeys = new Set(open.map((i) => i.catalogKey).filter((k): k is string => !!k));
      const staples = await frequentBought({ id: list.id, householdId: list.householdId });
      const staplesCount = staples.filter((k) => !openKeys.has(k)).length;

      if (!dry) {
        await trackEvent(
          "boodschappendag",
          {
            listName: list.name,
            listUrl: absoluteUrl(`/lijst/${list.token}#lijst`),
            openItems: list.openCount,
            staples: staplesCount,
          },
          user.email
        );
      }
      sent++;
    } catch {
      // best-effort: één mislukte gebruiker breekt de rest niet
    }
  }

  return NextResponse.json({ day, usersChecked: users.length, sent, dry });
}
