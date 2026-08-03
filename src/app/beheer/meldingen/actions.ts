"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/authz";
import { reopenReport, resolveReport } from "@/lib/queries/admin";

export async function resolveReportAction(reportId: number, formData: FormData): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  const note = String(formData.get("note") ?? "").slice(0, 1000);
  await resolveReport(reportId, admin.id, note);
  revalidatePath("/beheer", "layout");
}

export async function reopenReportAction(reportId: number): Promise<void> {
  const admin = await requireAdminUser();
  if (!admin) return;
  await reopenReport(reportId);
  revalidatePath("/beheer", "layout");
}
