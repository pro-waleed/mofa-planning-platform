import { z } from "zod";

export const templateLevelSchema = z.object({
  nameAr: z.string().min(2, "اسم المستوى مطلوب"),
  key: z
    .string()
    .min(2, "المفتاح مطلوب")
    .regex(/^[a-z0-9_]+$/, "استخدم أحرفًا إنجليزية صغيرة وشرطة سفلية فقط"),
  isRequired: z.boolean().default(true)
});

export const templateSchema = z.object({
  nameAr: z.string().min(3, "اسم القالب مطلوب"),
  code: z.string().optional().default(""),
  description: z.string().min(10, "أدخل وصفًا أوضح للقالب"),
  moduleScope: z.string().min(2, "حدد نطاق الاستخدام"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  levels: z.array(templateLevelSchema).min(2, "أضف مستويين على الأقل")
});

export type TemplateFormValues = z.input<typeof templateSchema>;
