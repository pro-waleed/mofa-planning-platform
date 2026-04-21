"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  monitoringUpdateSchema,
  type MonitoringUpdateValues
} from "@/features/monitoring/schema";

function emptyToNull(value?: string) {
  return value && value.trim().length > 0 ? value : null;
}

export async function createMonitoringUpdateAction(
  cycleId: string,
  payload: MonitoringUpdateValues
) {
  const currentUser = await requireCurrentUser();
  const data = monitoringUpdateSchema.parse(payload);

  const cycle = await prisma.monitoringCycle.findUnique({
    where: { id: cycleId },
    include: {
      plan: true,
      createdBy: true
    }
  });

  if (!cycle) {
    return;
  }

  const update = await prisma.monitoringUpdate.create({
    data: {
      cycleId: data.cycleId,
      planNodeId: emptyToNull(data.planNodeId),
      initiativeId: emptyToNull(data.initiativeId),
      kpiId: emptyToNull(data.kpiId),
      reportedProgress: data.reportedProgress,
      obstacleText: emptyToNull(data.obstacleText),
      correctiveActionText: emptyToNull(data.correctiveActionText),
      status: "SUBMITTED",
      submittedById: currentUser.id
    }
  });

  await prisma.$transaction([
    prisma.monitoringCycle.update({
      where: { id: cycleId },
      data: {
        status: "IN_REVIEW"
      }
    }),
    prisma.notification.create({
      data: {
        userId: cycle.createdById,
        titleAr: "تحديث متابعة جديد",
        messageAr:
          data.obstacleText.trim().length > 0
            ? `أضيف تحديث يتضمن عائقًا ضمن "${cycle.titleAr}" ويحتاج مراجعة.`
            : `أضيف تحديث متابعة جديد ضمن "${cycle.titleAr}".`,
        type: "ALERT",
        link: `/monitoring/${cycleId}`
      }
    }),
    prisma.auditLog.create({
      data: {
        actorId: currentUser.id,
        action: "CREATE_MONITORING_UPDATE",
        entityType: "MonitoringUpdate",
        entityId: update.id,
        description: `أضاف ${currentUser.fullNameAr} تحديثًا جديدًا على دورة "${cycle.titleAr}".`
      }
    })
  ]);

  revalidatePath(`/monitoring/${cycleId}`);
  revalidatePath("/monitoring");
  revalidatePath("/dashboard");
}
