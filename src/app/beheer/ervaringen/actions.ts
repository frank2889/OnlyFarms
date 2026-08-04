"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/authz";
import { deleteReview, publishReview } from "@/lib/queries/admin";
import { trackEvent } from "@/lib/klaviyo";

export async function publishReviewAction(reviewId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const result = await publishReview(reviewId);
  revalidatePath("/beheer", "layout");
  if (result?.producerSlug) revalidatePath("/producent/[slug]", "page");
  if (result) {
    await trackEvent(
      "experience_published",
      { sellerName: result.sellerName, excerpt: result.comment.slice(0, 140) },
      result.sellerEmail
    );
  }
}

export async function deleteReviewAction(reviewId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await deleteReview(reviewId);
  revalidatePath("/beheer", "layout");
}
