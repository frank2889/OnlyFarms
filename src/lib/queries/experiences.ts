import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sellerReviews } from "@/db/schema";

export type PublishedExperience = {
  id: number;
  comment: string;
  reviewerName: string;
  createdAt: Date;
};

/** Gepubliceerde, tekst-only ervaringen voor de producentpagina (nieuwste eerst) */
export async function publishedExperiencesForSeller(
  sellerId: number,
  limit = 6
): Promise<PublishedExperience[]> {
  return db
    .select({
      id: sellerReviews.id,
      comment: sellerReviews.comment,
      reviewerName: sellerReviews.reviewerName,
      createdAt: sellerReviews.createdAt,
    })
    .from(sellerReviews)
    .where(and(eq(sellerReviews.sellerId, sellerId), eq(sellerReviews.published, true)))
    .orderBy(desc(sellerReviews.createdAt))
    .limit(limit);
}

/**
 * Nieuwe ervaring: komt altijd in de moderatiewachtrij (published=false).
 * Bewust geen delete-op-e-mailmatch meer: dat liet iedereen die een
 * e-mailadres kende andermans review overschrijven. Dubbele inzendingen
 * vangt de moderatiewachtrij (het team ziet ze allebei).
 */
export async function createExperience(
  sellerId: number,
  input: { reviewerName: string; reviewerEmail: string; comment: string }
): Promise<void> {
  await db.insert(sellerReviews).values({
    sellerId,
    reviewerName: input.reviewerName,
    reviewerEmail: input.reviewerEmail,
    comment: input.comment,
  });
}
