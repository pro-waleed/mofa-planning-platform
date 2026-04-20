import { z } from "zod";

export const planSchema = z.object({
  titleAr: z.string().min(3, "اسم الخطة مطلوب"),
  code: z.string().optional().default(""),
  description: z.string().min(10, "أدخل وصفًا واضحًا للخطة"),
  periodLabel: z.string().min(2, "حدد الفترة الزمنية"),
  templateId: z.string().min(1, "اختر قالبًا"),
  organizationalUnitId: z.string().optional().default(""),
  ownerId: z.string().min(1, "اختر مالك الخطة"),
  startDate: z.string().min(1, "تاريخ البدء مطلوب"),
  endDate: z.string().min(1, "تاريخ الانتهاء مطلوب")
});

export const planNodeCreateSchema = z.object({
  planId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  templateLevelId: z.string().min(1, "اختر المستوى"),
  titleAr: z.string().min(2, "عنوان العقدة مطلوب"),
  description: z.string().optional().default(""),
  ownerId: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default("")
});

export type PlanFormValues = z.input<typeof planSchema>;
export type PlanNodeCreateValues = z.input<typeof planNodeCreateSchema>;
