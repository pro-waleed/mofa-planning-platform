"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  trainingProgramSchema,
  type TrainingProgramFormValues
} from "@/features/training/schema";

export async function createTrainingProgramAction(
  payload: TrainingProgramFormValues
) {
  const currentUser = await requireCurrentUser();
  const data = trainingProgramSchema.parse(payload);

  const training = await prisma.trainingProgram.create({
    data: {
      code: `TRN-${Date.now().toString().slice(-6)}`,
      titleAr: data.titleAr,
      providerAr: data.providerAr,
      locationAr: data.locationAr,
      targetAudience: data.targetAudience,
      description: data.description,
      seats: data.seats,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      organizationalUnitId: data.organizationalUnitId || null,
      createdById: currentUser.id,
      status: "OPEN"
    }
  });

  revalidatePath("/training");
  redirect(`/training/${training.id}`);
}

export async function createNominationAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const programId = String(formData.get("programId"));
  const managerId = String(formData.get("managerId"));
  const motivation = String(formData.get("motivation") ?? "");

  await prisma.trainingNomination.create({
    data: {
      programId,
      nomineeId: currentUser.id,
      managerId,
      motivation,
      status: "PENDING_MANAGER_APPROVAL"
    }
  });

  revalidatePath(`/training/${programId}`);
}

export async function reviewNominationAction(formData: FormData) {
  const nominationId = String(formData.get("nominationId"));
  const programId = String(formData.get("programId"));
  const decision = String(formData.get("decision"));
  const managerComment = String(formData.get("managerComment") ?? "");

  await prisma.trainingNomination.update({
    where: { id: nominationId },
    data: {
      status: decision === "approve" ? "APPROVED" : "REJECTED",
      managerComment,
      decidedAt: new Date()
    }
  });

  revalidatePath(`/training/${programId}`);
}

