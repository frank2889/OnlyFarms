import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { syncFarms } from "@/lib/sheet-sync";

export const runtime = "nodejs";
export const maxDuration = 60;

// Aangeroepen door de Vercel-cron (zie vercel.json); Vercel stuurt CRON_SECRET
// automatisch mee als Authorization-header wanneer die env-var bestaat.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncFarms(db);
    return NextResponse.json({
      ok: true,
      upserted: result.upserted,
      orphaned: result.orphaned,
      issues: result.issues,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
