"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/authz";
import { deleteReview, publishReview } from "@/lib/queries/admin";

export async function publishReviewAction(reviewId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await publishReview(reviewId);
  revalidatePath("/beheer", "layout");
}

export async function deleteReviewAction(reviewId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await deleteReview(reviewId);
  revalidatePath("/beheer", "layout");
}
