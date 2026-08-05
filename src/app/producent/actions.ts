"use server";

import { currentUserId } from "@/auth";
import { createReport, producerBySlug } from "@/lib/queries/producers";
import { createExperience } from "@/lib/queries/experiences";
import { householdForUser } from "@/lib/queries/accounts";
import { toggleSavedProducer } from "@/lib/queries/favorites";
import { trackConversion } from "@/lib/events";
import { trackEvent } from "@/lib/klaviyo";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

type Result = { ok: true } | { ok: false; error: string };

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

/**
 * Ervaring insturen: alleen tekst, geen sterren (PLAN.md-besluit). Komt
 * altijd in de moderatiewachtrij; alleen mogelijk bij een geclaimde,
 * goedgekeurde verkoper (zelfde regel als het publieke aanbod).
 */
export async function submitExperienceAction(
  producerSlug: string,
  input: { name: string; email: string; comment: string; honeypot?: string }
): Promise<Result> {
  // Verborgen veld: een echte bezoeker vult dit nooit in, een script vaak wel
  if (input.honeypot) return { ok: false, error: "Versturen mislukt." };
  if (isRateLimited(`experience:${await clientIp()}`, 5, 60 * 60_000))
    return { ok: false, error: "Even rustig aan: probeer het over een uur opnieuw." };

  const name = input.name.trim().slice(0, 80);
  if (name.length < 2) return { ok: false, error: "Vul je naam in." };
  const email = input.email.trim().toLowerCase().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "Vul een geldig e-mailadres in." };
  const comment = input.comment.trim().slice(0, 1000);
  if (comment.length < 10) return { ok: false, error: "Vertel iets meer, minstens 10 tekens." };

  const producer = await producerBySlug(producerSlug);
  const canReceive =
    producer?.claimedBySellerId &&
    (producer.sellerStatus == null || producer.sellerStatus === "goedgekeurd");
  if (!canReceive) return { ok: false, error: "Deze producent kan nog geen ervaringen ontvangen." };

  await createExperience(producer.claimedBySellerId!, {
    reviewerName: name,
    reviewerEmail: email,
    comment,
  });
  return { ok: true };
}

/**
 * Favoriet aan/uit voor het hele huishouden (CRO #70). Een ingelogde
 * gebruiker kan tijdelijk zonder huishouden zitten (leaveHouseholdAction
 * heeft geen guard tegen het verlaten van je enige huishouden), dus dat is
 * een apart foutresultaat, los van "niet ingelogd".
 */
export async function toggleSavedProducerAction(
  producerSlug: string
): Promise<
  | { ok: true; saved: boolean }
  | { ok: false; error: "login" | "geen-huishouden" | "niet-gevonden" }
> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "login" };
  const household = await householdForUser(userId);
  if (!household) return { ok: false, error: "geen-huishouden" };
  const producer = await producerBySlug(producerSlug);
  if (!producer) return { ok: false, error: "niet-gevonden" };

  const saved = await toggleSavedProducer(household.id, producer.id, userId);
  if (saved) await trackConversion("producent_opgeslagen", { userId, properties: { producerSlug } });
  return { ok: true, saved };
}
