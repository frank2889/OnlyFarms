import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sellerReviews, sellers } from "@/db/schema";

export const runtime = "nodejs";

type ReviewBody = {
  rating?: number;
  comment?: string;
  reviewerName?: string;
  reviewerEmail?: string;
};

// Review indienen; komt in de moderatiewachtrij (published=false).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sellerId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(sellerId)) {
    return NextResponse.json({ error: "ongeldig id" }, { status: 400 });
  }

  let body: ReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ongeldige JSON" }, { status: 400 });
  }

  const rating = body.rating;
  const reviewerName = (body.reviewerName ?? "").trim();
  const reviewerEmail = (body.reviewerEmail ?? "").trim().toLowerCase();

  const errors: string[] = [];
  if (!Number.isInteger(rating) || rating! < 1 || rating! > 5)
    errors.push("rating moet een geheel getal van 1 t/m 5 zijn");
  if (!reviewerName) errors.push("naam is verplicht");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reviewerEmail))
    errors.push("geldig e-mailadres is verplicht");
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  const [seller] = await db
    .select({ id: sellers.id })
    .from(sellers)
    .where(and(eq(sellers.id, sellerId), eq(sellers.status, "goedgekeurd")));
  if (!seller) {
    return NextResponse.json({ error: "verkoper niet gevonden" }, { status: 404 });
  }

  // Eén review per e-mailadres per verkoper; een nieuwe vervangt de oude
  await db
    .delete(sellerReviews)
    .where(
      and(
        eq(sellerReviews.sellerId, sellerId),
        eq(sellerReviews.reviewerEmail, reviewerEmail)
      )
    );

  await db.insert(sellerReviews).values({
    sellerId,
    rating: rating!,
    comment: (body.comment ?? "").trim() || null,
    reviewerName,
    reviewerEmail,
  });

  return NextResponse.json(
    { ok: true, message: "Bedankt! Je review wordt eerst beoordeeld en daarna gepubliceerd." },
    { status: 201 }
  );
}
