"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function approvalRoute(approval: {
  entityType: string;
  entityId: string;
  trainingNomination?: { programId: string } | null;
}) {
  switch (approval.entityType) {
    case "PLAN":
      return `/plans/${approval.entityId}`;
    case "MISSION_REPORT":
      return `/reports/${approval.entityId}`;
    case "MONITORING_CYCLE":
      return `/monitoring/${approval.entityId}`;
    case "TRAINING_PROGRAM":
      return `/training/${approval.entityId}`;
    case "TRAINING_NOMINATION":
      return approval.trainingNomination
        ? `/training/${approval.trainingNomination.programId}`
        : "/training";
    case "TEMPLATE":
      return `/templates/${approval.entityId}`;
    default:
      return "/approvals";
  }
}

export async function decideApprovalAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const approvalId = String(formData.get("approvalId"));
  const decision = String(formData.get("decision"));
  const comment = String(formData.get("comment") ?? "").trim();

  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId },
    include: {
      requester: true,
      assignedTo: true,
      trainingNomination: true
    }
  });

  if (!approval) {
    return;
  }

  const nextStatus =
    decision === "approve"
      ? "APPROVED"
      : decision === "return"
        ? "RETURNED"
        : "REJECTED";

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: nextStatus,
        decisionComment: comment,
        actedAt: now
      }
    });

    if (approval.planId) {
      await tx.plan.update({
        where: { id: approval.planId },
        data: {
          status:
            decision === "approve"
              ? "APPROVED"
              : decision === "return"
                ? "RETURNED"
                : "ARCHIVED"
        }
      });
    }

    if (approval.missionReportId) {
      await tx.missionReport.update({
        where: { id: approval.missionReportId },
        data: {
          status:
            decision === "approve"
              ? "APPROVED"
              : decision === "return"
                ? "RETURNED"
                : "RETURNED",
          approvedAt: decision === "approve" ? now : undefined,
          returnedAt: decision !== "approve" ? now : undefined
        }
      });
    }

    if (approval.trainingNominationId) {
      await tx.trainingNomination.update({
        where: { id: approval.trainingNominationId },
        data: {
          status: decision === "approve" ? "APPROVED" : "REJECTED",
          managerComment: comment || null,
          decidedAt: now
        }
      });

      if (decision === "approve" && approval.trainingNomination) {
        const existingParticipation = await tx.trainingParticipation.findFirst({
          where: {
            nominationId: approval.trainingNominationId
          }
        });

        if (!existingParticipation) {
          await tx.trainingParticipation.create({
            data: {
              programId: approval.trainingNomination.programId,
              participantId: approval.trainingNomination.nomineeId,
              nominationId: approval.trainingNominationId,
              status: "REGISTERED"
            }
          });
        }
      }
    }

    if (approval.monitoringCycleId) {
      await tx.monitoringCycle.update({
        where: { id: approval.monitoringCycleId },
        data: {
          status: decision === "approve" ? "CLOSED" : "RETURNED"
        }
      });
    }

    if (approval.templateId) {
      await tx.template.update({
        where: { id: approval.templateId },
        data: {
          status:
            decision === "approve"
              ? "ACTIVE"
              : decision === "return"
                ? "DRAFT"
                : "ARCHIVED"
        }
      });
    }

    if (approval.entityType === "TRAINING_PROGRAM") {
      await tx.trainingProgram.update({
        where: { id: approval.entityId },
        data: {
          status: decision === "approve" ? "OPEN" : "DRAFT"
        }
      });
    }

    await tx.notification.create({
      data: {
        userId: approval.requesterId,
        titleAr:
          decision === "approve"
            ? "تم اعتماد الطلب"
            : decision === "return"
              ? "أعيد الطلب للاستكمال"
              : "تم رفض الطلب",
        messageAr:
          comment ||
          (decision === "approve"
            ? `اعتمد ${currentUser.fullNameAr} الطلب "${approval.titleAr}".`
            : decision === "return"
              ? `أعاد ${currentUser.fullNameAr} الطلب "${approval.titleAr}" لاستكمال الملاحظات.`
              : `رفض ${currentUser.fullNameAr} الطلب "${approval.titleAr}".`),
        type: "APPROVAL",
        link: approvalRoute(approval)
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: currentUser.id,
        action:
          decision === "approve"
            ? "APPROVE_REQUEST"
            : decision === "return"
              ? "RETURN_REQUEST"
              : "REJECT_REQUEST",
        entityType: "ApprovalRequest",
        entityId: approvalId,
        description:
          decision === "approve"
            ? `اعتمد ${currentUser.fullNameAr} الطلب "${approval.titleAr}".`
            : decision === "return"
              ? `أعاد ${currentUser.fullNameAr} الطلب "${approval.titleAr}" للاستكمال.`
              : `رفض ${currentUser.fullNameAr} الطلب "${approval.titleAr}".`
      }
    });
  });

  revalidatePath("/approvals");
  revalidatePath("/dashboard");
  revalidatePath(approvalRoute(approval));
}
