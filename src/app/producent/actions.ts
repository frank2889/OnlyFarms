"use server";

import { createReport } from "@/lib/queries/producers";
import { trackEvent } from "@/lib/klaviyo";

export async function reportProducerAction(
  producerId: number,
  message: string,
  email?: string
): Promise<void> {
  const clean = message.trim().slice(0, 1000);
  if (clean.length < 5) return;
  const cleanEmail = email?.trim().toLowerCase().slice(0, 200);
  const validEmail =
    cleanEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail) ? cleanEmail : undefined;
  await createReport(producerId, clean, validEmail);
  await trackEvent("producer_reported", { producerId }, validEmail);
}
