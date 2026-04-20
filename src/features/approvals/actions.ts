"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function decideApprovalAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const decision = String(formData.get("decision"));
  const comment = String(formData.get("comment") ?? "");

  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId }
  });

  if (!approval) return;

  const nextStatus =
    decision === "approve"
      ? "APPROVED"
      : decision === "return"
        ? "RETURNED"
        : "REJECTED";

  await prisma.approvalRequest.update({
    where: { id: approvalId },
    data: {
      status: nextStatus,
      decisionComment: comment,
      actedAt: new Date()
    }
  });

  if (approval.planId) {
    await prisma.plan.update({
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
    await prisma.missionReport.update({
      where: { id: approval.missionReportId },
      data: {
        status:
          decision === "approve"
            ? "APPROVED"
            : decision === "return"
              ? "RETURNED"
              : "RETURNED"
      }
    });
  }

  if (approval.trainingNominationId) {
    await prisma.trainingNomination.update({
      where: { id: approval.trainingNominationId },
      data: {
        status: decision === "approve" ? "APPROVED" : "REJECTED"
      }
    });
  }

  if (approval.monitoringCycleId) {
    await prisma.monitoringCycle.update({
      where: { id: approval.monitoringCycleId },
      data: {
        status: decision === "approve" ? "CLOSED" : "RETURNED"
      }
    });
  }

  if (approval.templateId && decision === "approve") {
    await prisma.template.update({
      where: { id: approval.templateId },
      data: { status: "ACTIVE" }
    });
  }

  revalidatePath("/approvals");
}
