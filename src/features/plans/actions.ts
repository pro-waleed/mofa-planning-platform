"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type PlanFormValues,
  type PlanNodeCreateValues,
  planNodeCreateSchema,
  planSchema
} from "@/features/plans/schema";

function toNullable(value?: string | null) {
  return value && value.trim().length > 0 ? value : null;
}

function planCode(seed: string) {
  return `PLAN-${seed
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toUpperCase()
    .slice(0, 20)}-${Date.now().toString().slice(-4)}`;
}

export async function createPlanAction(payload: PlanFormValues) {
  const currentUser = await requireCurrentUser();
  const data = planSchema.parse(payload);
  const template = await prisma.template.findUnique({
    where: { id: data.templateId },
    include: {
      levels: {
        orderBy: { levelOrder: "asc" }
      }
    }
  });

  if (!template) {
    throw new Error("تعذر العثور على القالب المحدد.");
  }

  const plan = await prisma.plan.create({
    data: {
      code: data.code?.trim() || planCode(data.periodLabel),
      titleAr: data.titleAr,
      description: data.description,
      periodLabel: data.periodLabel,
      templateId: data.templateId,
      organizationalUnitId: toNullable(data.organizationalUnitId),
      ownerId: data.ownerId,
      createdById: currentUser.id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      templateSnapshot: {
        templateName: template.nameAr,
        levels: template.levels.map((level) => ({
          id: level.id,
          key: level.key,
          nameAr: level.nameAr,
          levelOrder: level.levelOrder
        }))
      }
    }
  });

  revalidatePath("/plans");
  redirect(`/plans/${plan.id}`);
}

export async function createPlanNodeAction(payload: PlanNodeCreateValues) {
  const data = planNodeCreateSchema.parse(payload);

  const plan = await prisma.plan.findUnique({
    where: { id: data.planId },
    include: {
      template: {
        include: {
          levels: {
            orderBy: { levelOrder: "asc" }
          }
        }
      }
    }
  });

  if (!plan) {
    throw new Error("تعذر العثور على الخطة.");
  }

  const selectedLevel = plan.template.levels.find(
    (level) => level.id === data.templateLevelId
  );

  if (!selectedLevel) {
    throw new Error("المستوى المحدد لا ينتمي إلى قالب الخطة.");
  }

  const parentId = toNullable(data.parentId);
  let expectedLevelOrder = 1;

  if (parentId) {
    const parentNode = await prisma.planNode.findUnique({
      where: { id: parentId },
      include: {
        templateLevel: true
      }
    });

    if (!parentNode || parentNode.planId !== plan.id) {
      throw new Error("العقدة الأم المحددة غير صالحة.");
    }

    expectedLevelOrder = parentNode.templateLevel.levelOrder + 1;
  }

  if (selectedLevel.levelOrder !== expectedLevelOrder) {
    throw new Error("ترتيب العقدة لا يطابق تسلسل القالب الديناميكي.");
  }

  const siblings = await prisma.planNode.count({
    where: {
      planId: data.planId,
      parentId
    }
  });

  await prisma.planNode.create({
    data: {
      planId: data.planId,
      parentId,
      templateLevelId: data.templateLevelId,
      titleAr: data.titleAr,
      description: toNullable(data.description),
      ownerId: toNullable(data.ownerId),
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      sortOrder: siblings + 1,
      status: "DRAFT"
    }
  });

  revalidatePath(`/plans/${data.planId}`);
}

export async function updatePlanNodeAction(formData: FormData) {
  const nodeId = String(formData.get("nodeId"));
  const planId = String(formData.get("planId"));
  const progressPercent = Math.min(
    100,
    Math.max(0, Number(formData.get("progressPercent") ?? 0))
  );
  const sortOrder = Math.max(1, Number(formData.get("sortOrder") ?? 1));

  await prisma.planNode.update({
    where: { id: nodeId },
    data: {
      titleAr: String(formData.get("titleAr")),
      description: toNullable(String(formData.get("description") ?? "")),
      ownerId: toNullable(String(formData.get("ownerId") ?? "")),
      status: String(formData.get("status")) as
        | "DRAFT"
        | "ACTIVE"
        | "AT_RISK"
        | "COMPLETED"
        | "ON_HOLD",
      progressPercent,
      sortOrder,
      startDate: toNullable(String(formData.get("startDate") ?? ""))
        ? new Date(String(formData.get("startDate")))
        : null,
      endDate: toNullable(String(formData.get("endDate") ?? ""))
        ? new Date(String(formData.get("endDate")))
        : null
    }
  });

  revalidatePath(`/plans/${planId}`);
}

export async function deletePlanNodeAction(formData: FormData) {
  const nodeId = String(formData.get("nodeId"));
  const planId = String(formData.get("planId"));

  const childrenCount = await prisma.planNode.count({
    where: { parentId: nodeId }
  });

  if (childrenCount === 0) {
    await prisma.planNodeKPI.deleteMany({
      where: { planNodeId: nodeId }
    });
    await prisma.planNode.delete({
      where: { id: nodeId }
    });
  }

  revalidatePath(`/plans/${planId}`);
}

export async function linkKpiToNodeAction(formData: FormData) {
  const planNodeId = String(formData.get("planNodeId"));
  const planId = String(formData.get("planId"));
  const kpiId = String(formData.get("kpiId"));

  if (kpiId) {
    await prisma.planNodeKPI.upsert({
      where: {
        planNodeId_kpiId: {
          planNodeId,
          kpiId
        }
      },
      update: {},
      create: {
        planNodeId,
        kpiId,
        weight: 100
      }
    });
  }

  revalidatePath(`/plans/${planId}`);
}

export async function submitPlanForApprovalAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const planId = String(formData.get("planId"));

  const [plan, planNodeCount, directorGeneral] = await Promise.all([
    prisma.plan.findUnique({
      where: { id: planId }
    }),
    prisma.planNode.count({
      where: { planId }
    }),
    prisma.user.findFirst({
      where: {
        role: {
          code: "DIRECTOR_GENERAL"
        }
      }
    })
  ]);

  if (!plan) {
    throw new Error("تعذر العثور على الخطة.");
  }

  if (planNodeCount === 0) {
    throw new Error("لا يمكن رفع الخطة قبل إضافة عقدة واحدة على الأقل.");
  }

  await prisma.plan.update({
    where: { id: planId },
    data: {
      status: "UNDER_REVIEW",
      submittedAt: new Date()
    }
  });

  if (directorGeneral) {
    await prisma.approvalRequest.create({
      data: {
        titleAr: `اعتماد الخطة: ${plan.titleAr}`,
        description:
          "تم رفع الخطة إلى مسار الاعتماد بعد استكمال بنيتها الأساسية ومسارات الملكية.",
        entityType: "PLAN",
        entityId: plan.id,
        requesterId: currentUser.id,
        assignedToId: directorGeneral.id,
        planId: plan.id,
        status: "PENDING"
      }
    });

    await prisma.notification.create({
      data: {
        userId: directorGeneral.id,
        titleAr: "طلب اعتماد خطة جديد",
        messageAr: `تم رفع الخطة "${plan.titleAr}" بانتظار المراجعة والقرار.`,
        type: "APPROVAL",
        link: "/approvals"
      }
    });
  }

  revalidatePath(`/plans/${planId}`);
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
}
