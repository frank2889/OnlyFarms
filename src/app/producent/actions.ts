"use server";

import { createReport } from "@/lib/queries/producers";
import { trackEvent } from "@/lib/klaviyo";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export async function reportProducerAction(
  producerId: number,
  message: string,
  email?: string
): Promise<void> {
  const clean = message.trim().slice(0, 1000);
  if (clean.length < 5) return;
  if (isRateLimited(`report:${await clientIp()}`, 10, 60 * 60_000)) return;
  const cleanEmail = email?.trim().toLowerCase().slice(0, 200);
  const validEmail =
    cleanEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail) ? cleanEmail : undefined;
  await createReport(producerId, clean, validEmail);
  // validEmail is vrij ingetypt door een anonieme, onbevestigde bezoeker: nooit
  // gebruiken als Klaviyo-profiel-e-mail (dat zou iedereen toelaten om onder
  // wíllekeurig andermans e-mailadres een profiel/event aan te maken). Wel als
  // property meesturen zodat het team 'm in Klaviyo kan zien voor context.
  await trackEvent("producer_reported", { producerId, reporterEmail: validEmail });
}
