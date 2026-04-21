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

  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: "CREATE_TRAINING_PROGRAM",
      entityType: "TrainingProgram",
      entityId: training.id,
      description: `نشر ${currentUser.fullNameAr} برنامجًا تدريبيًا بعنوان "${training.titleAr}".`
    }
  });

  revalidatePath("/training");
  revalidatePath("/dashboard");
  redirect(`/training/${training.id}`);
}

export async function createNominationAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const programId = String(formData.get("programId"));
  const managerId = String(formData.get("managerId"));
  const motivation = String(formData.get("motivation") ?? "").trim();

  const program = await prisma.trainingProgram.findUnique({
    where: { id: programId }
  });

  if (!program || !managerId) {
    return;
  }

  const nomination = await prisma.trainingNomination.create({
    data: {
      programId,
      nomineeId: currentUser.id,
      managerId,
      motivation,
      status: "PENDING_MANAGER_APPROVAL"
    }
  });

  await prisma.$transaction([
    prisma.approvalRequest.create({
      data: {
        titleAr: `اعتماد ترشيح ${currentUser.fullNameAr}`,
        description: `ترشيح للالتحاق ببرنامج "${program.titleAr}" بانتظار اعتماد المدير المباشر.`,
        entityType: "TRAINING_NOMINATION",
        entityId: nomination.id,
        requesterId: currentUser.id,
        assignedToId: managerId,
        trainingNominationId: nomination.id,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        routeSnapshot: {
          programTitleAr: program.titleAr
        }
      }
    }),
    prisma.notification.create({
      data: {
        userId: managerId,
        titleAr: "ترشيح تدريبي بانتظار الاعتماد",
        messageAr: `رفع ${currentUser.fullNameAr} طلب ترشيح لبرنامج "${program.titleAr}".`,
        type: "TRAINING",
        link: `/training/${programId}`
      }
    }),
    prisma.auditLog.create({
      data: {
        actorId: currentUser.id,
        action: "SUBMIT_TRAINING_NOMINATION",
        entityType: "TrainingNomination",
        entityId: nomination.id,
        description: `قدّم ${currentUser.fullNameAr} طلب ترشيح لبرنامج "${program.titleAr}".`
      }
    })
  ]);

  revalidatePath(`/training/${programId}`);
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
}

export async function reviewNominationAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const nominationId = String(formData.get("nominationId"));
  const programId = String(formData.get("programId"));
  const decision = String(formData.get("decision"));
  const managerComment = String(formData.get("managerComment") ?? "").trim();

  const nomination = await prisma.trainingNomination.findUnique({
    where: { id: nominationId },
    include: {
      nominee: true,
      program: true
    }
  });

  if (!nomination) {
    return;
  }

  const approved = decision === "approve";
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.trainingNomination.update({
      where: { id: nominationId },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        managerComment,
        decidedAt: now
      }
    });

    await tx.approvalRequest.updateMany({
      where: {
        trainingNominationId: nominationId,
        status: "PENDING"
      },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        actedAt: now,
        decisionComment:
          managerComment || (approved ? "تم اعتماد الترشيح." : "تم رفض الترشيح.")
      }
    });

    if (approved) {
      const existingParticipation = await tx.trainingParticipation.findFirst({
        where: {
          programId: nomination.programId,
          nominationId
        }
      });

      if (!existingParticipation) {
        await tx.trainingParticipation.create({
          data: {
            programId: nomination.programId,
            participantId: nomination.nomineeId,
            nominationId,
            status: "REGISTERED"
          }
        });
      }
    }

    await tx.notification.create({
      data: {
        userId: nomination.nomineeId,
        titleAr: approved ? "تم اعتماد الترشيح" : "تم رفض الترشيح",
        messageAr:
          managerComment ||
          (approved
            ? `اعتمد ${currentUser.fullNameAr} ترشيحك لبرنامج "${nomination.program.titleAr}".`
            : `رفض ${currentUser.fullNameAr} ترشيحك لبرنامج "${nomination.program.titleAr}".`),
        type: "TRAINING",
        link: `/training/${programId}`
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: currentUser.id,
        action: approved ? "APPROVE_TRAINING_NOMINATION" : "REJECT_TRAINING_NOMINATION",
        entityType: "TrainingNomination",
        entityId: nominationId,
        description: approved
          ? `اعتمد ${currentUser.fullNameAr} ترشيح ${nomination.nominee.fullNameAr} لبرنامج "${nomination.program.titleAr}".`
          : `رفض ${currentUser.fullNameAr} ترشيح ${nomination.nominee.fullNameAr} لبرنامج "${nomination.program.titleAr}".`
      }
    });
  });

  revalidatePath(`/training/${programId}`);
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
}
