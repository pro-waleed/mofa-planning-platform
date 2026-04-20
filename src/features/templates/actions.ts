"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type TemplateFormValues,
  templateSchema
} from "@/features/templates/schema";

function toCode(seed: string) {
  return seed
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toUpperCase();
}

export async function createTemplateAction(payload: TemplateFormValues) {
  const currentUser = await requireCurrentUser();
  const data = templateSchema.parse(payload);
  const code =
    data.code?.trim() ||
    `TPL-${toCode(data.moduleScope)}-${Date.now().toString().slice(-6)}`;

  const template = await prisma.$transaction(async (tx) => {
    const createdTemplate = await tx.template.create({
      data: {
        code,
        nameAr: data.nameAr,
        description: data.description,
        moduleScope: data.moduleScope,
        status: data.status,
        createdById: currentUser.id
      }
    });

    for (const [index, level] of data.levels.entries()) {
      const createdLevel = await tx.templateLevel.create({
        data: {
          templateId: createdTemplate.id,
          key: level.key,
          nameAr: level.nameAr,
          isRequired: level.isRequired ?? true,
          levelOrder: index + 1
        }
      });

      await tx.templateField.createMany({
        data: [
          {
            templateId: createdTemplate.id,
            levelId: createdLevel.id,
            key: `${level.key}_owner`,
            labelAr: "المالك الإداري",
            fieldType: "USER",
            fieldOrder: 1,
            isRequired: true,
            isSystem: true
          },
          {
            templateId: createdTemplate.id,
            levelId: createdLevel.id,
            key: `${level.key}_note`,
            labelAr: "ملاحظات",
            fieldType: "LONG_TEXT",
            fieldOrder: 2,
            isRequired: false,
            isSystem: false
          }
        ]
      });
    }

    return createdTemplate;
  });

  revalidatePath("/templates");
  redirect(`/templates/${template.id}`);
}

export async function updateTemplateAction(
  templateId: string,
  payload: Pick<TemplateFormValues, "nameAr" | "description" | "moduleScope" | "status">
) {
  const data = templateSchema.pick({
    nameAr: true,
    description: true,
    moduleScope: true,
    status: true
  }).parse(payload);

  await prisma.template.update({
    where: { id: templateId },
    data
  });

  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}
