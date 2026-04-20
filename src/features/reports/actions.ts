"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  missionReportSchema,
  type MissionReportFormValues
} from "@/features/reports/schema";

function reportCode(mission: string, period: string) {
  return `REP-${mission.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "").toUpperCase().slice(0, 10)}-${period.replace(/\s+/g, "").slice(0, 8)}-${Date.now().toString().slice(-4)}`;
}

function completionScore(data: MissionReportFormValues) {
  const fields = [
    data.executiveSummary,
    data.achievements,
    data.challenges,
    data.supportRequests
  ];
  const completed = fields.filter((item) => item && item.trim().length > 4).length;
  return Math.round((completed / fields.length) * 100);
}

export async function createMissionReportAction(payload: MissionReportFormValues) {
  const currentUser = await requireCurrentUser();
  const data = missionReportSchema.parse(payload);

  const report = await prisma.missionReport.create({
    data: {
      code: reportCode(data.missionNameAr, data.reportingPeriod),
      titleAr: data.titleAr,
      reportingPeriod: data.reportingPeriod,
      missionNameAr: data.missionNameAr,
      countryAr: data.countryAr,
      organizationalUnitId: data.organizationalUnitId || null,
      reviewerId: data.reviewerId || null,
      submittedById: currentUser.id,
      executiveSummary: data.executiveSummary,
      achievements: data.achievements || null,
      challenges: data.challenges || null,
      supportRequests: data.supportRequests || null,
      completionPercent: completionScore(data),
      status: "DRAFT"
    }
  });

  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function advanceMissionReportAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const reportId = String(formData.get("reportId"));
  const decision = String(formData.get("decision"));
  const comment = String(formData.get("comment") ?? "");

  if (decision === "submit") {
    await prisma.missionReport.update({
      where: { id: reportId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date()
      }
    });
  }

  if (decision === "approve") {
    await prisma.missionReport.update({
      where: { id: reportId },
      data: {
        status: "APPROVED",
        approvedAt: new Date()
      }
    });
  }

  if (decision === "return") {
    await prisma.missionReport.update({
      where: { id: reportId },
      data: {
        status: "RETURNED",
        returnedAt: new Date()
      }
    });
  }

  if (comment.trim().length > 0) {
    await prisma.missionReportComment.create({
      data: {
        reportId,
        authorId: currentUser.id,
        type:
          decision === "return"
            ? "RETURN"
            : decision === "approve"
              ? "REVIEW"
              : "GENERAL",
        comment
      }
    });
  }

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
}

