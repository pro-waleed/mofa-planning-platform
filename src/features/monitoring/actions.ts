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

  await prisma.monitoringUpdate.create({
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

  revalidatePath(`/monitoring/${cycleId}`);
}

