"use server";

import { createReport } from "@/lib/queries/producers";
import { trackEvent } from "@/lib/klaviyo";

export async function reportProducerAction(
  producerId: number,
  message: string
): Promise<void> {
  const clean = message.trim().slice(0, 1000);
  if (clean.length < 5) return;
  await createReport(producerId, clean);
  await trackEvent("producer_reported", { producerId });
}
