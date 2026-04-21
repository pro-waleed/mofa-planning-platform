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
  return `REP-${mission
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toUpperCase()
    .slice(0, 10)}-${period.replace(/\s+/g, "").slice(0, 8)}-${Date.now()
    .toString()
    .slice(-4)}`;
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

  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: "CREATE_REPORT",
      entityType: "MissionReport",
      entityId: report.id,
      description: `أنشأ ${currentUser.fullNameAr} تقريرًا جديدًا بعنوان "${report.titleAr}".`
    }
  });

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect(`/reports/${report.id}`);
}

export async function advanceMissionReportAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const reportId = String(formData.get("reportId"));
  const decision = String(formData.get("decision"));
  const comment = String(formData.get("comment") ?? "").trim();

  const report = await prisma.missionReport.findUnique({
    where: { id: reportId },
    include: {
      submittedBy: true,
      reviewer: true
    }
  });

  if (!report) {
    return;
  }

  const now = new Date();

  if (decision === "submit") {
    await prisma.$transaction(async (tx) => {
      await tx.missionReport.update({
        where: { id: reportId },
        data: {
          status: report.reviewerId ? "UNDER_REVIEW" : "SUBMITTED",
          submittedAt: now,
          returnedAt: null
        }
      });

      if (comment.length > 0) {
        await tx.missionReportComment.create({
          data: {
            reportId,
            authorId: currentUser.id,
            type: "GENERAL",
            comment
          }
        });
      }

      if (report.reviewerId) {
        await tx.approvalRequest.create({
          data: {
            titleAr: `مراجعة واعتماد ${report.titleAr}`,
            description:
              "تم رفع التقرير من البعثة وهو جاهز للمراجعة والتعليق أو الإرجاع للاستكمال.",
            entityType: "MISSION_REPORT",
            entityId: reportId,
            requesterId: currentUser.id,
            assignedToId: report.reviewerId,
            dueDate: new Date(now.getTime() + 72 * 60 * 60 * 1000),
            missionReportId: reportId,
            routeSnapshot: {
              missionNameAr: report.missionNameAr,
              reportingPeriod: report.reportingPeriod
            }
          }
        });

        await tx.notification.create({
          data: {
            userId: report.reviewerId,
            titleAr: "تقرير بعثة بانتظار المراجعة",
            messageAr: `تم رفع "${report.titleAr}" من ${report.submittedBy.fullNameAr} وبانتظار المراجعة.`,
            type: "REPORT",
            link: `/reports/${reportId}`
          }
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: currentUser.id,
          action: "SUBMIT_REPORT",
          entityType: "MissionReport",
          entityId: reportId,
          description: `رفع ${currentUser.fullNameAr} التقرير "${report.titleAr}" للمراجعة.`
        }
      });
    });
  }

  if (decision === "approve") {
    await prisma.$transaction(async (tx) => {
      await tx.missionReport.update({
        where: { id: reportId },
        data: {
          status: "APPROVED",
          approvedAt: now
        }
      });

      await tx.approvalRequest.updateMany({
        where: {
          missionReportId: reportId,
          status: "PENDING"
        },
        data: {
          status: "APPROVED",
          actedAt: now,
          decisionComment: comment || "تم اعتماد التقرير."
        }
      });

      if (comment.length > 0) {
        await tx.missionReportComment.create({
          data: {
            reportId,
            authorId: currentUser.id,
            type: "REVIEW",
            comment
          }
        });
      }

      await tx.notification.create({
        data: {
          userId: report.submittedById,
          titleAr: "تم اعتماد التقرير",
          messageAr: `اعتمد ${currentUser.fullNameAr} التقرير "${report.titleAr}".`,
          type: "REPORT",
          link: `/reports/${reportId}`
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: currentUser.id,
          action: "APPROVE_REPORT",
          entityType: "MissionReport",
          entityId: reportId,
          description: `اعتمد ${currentUser.fullNameAr} التقرير "${report.titleAr}".`
        }
      });
    });
  }

  if (decision === "return") {
    await prisma.$transaction(async (tx) => {
      await tx.missionReport.update({
        where: { id: reportId },
        data: {
          status: "RETURNED",
          returnedAt: now
        }
      });

      await tx.approvalRequest.updateMany({
        where: {
          missionReportId: reportId,
          status: "PENDING"
        },
        data: {
          status: "RETURNED",
          actedAt: now,
          decisionComment: comment || "أعيد التقرير للاستكمال."
        }
      });

      if (comment.length > 0) {
        await tx.missionReportComment.create({
          data: {
            reportId,
            authorId: currentUser.id,
            type: "RETURN",
            comment
          }
        });
      }

      await tx.notification.create({
        data: {
          userId: report.submittedById,
          titleAr: "أعيد التقرير للاستكمال",
          messageAr:
            comment.length > 0
              ? comment
              : `أعاد ${currentUser.fullNameAr} التقرير "${report.titleAr}" مع طلب استكمال الملاحظات.`,
          type: "REPORT",
          link: `/reports/${reportId}`
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: currentUser.id,
          action: "RETURN_REPORT",
          entityType: "MissionReport",
          entityId: reportId,
          description: `أعاد ${currentUser.fullNameAr} التقرير "${report.titleAr}" للاستكمال.`
        }
      });
    });
  }

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
}
