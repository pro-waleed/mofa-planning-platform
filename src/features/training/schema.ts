import { z } from "zod";

export const trainingProgramSchema = z.object({
  titleAr: z.string().min(3, "عنوان البرنامج مطلوب"),
  providerAr: z.string().min(2, "اسم الجهة المقدمة مطلوب"),
  locationAr: z.string().min(2, "مكان التنفيذ مطلوب"),
  targetAudience: z.string().min(2, "حدد الفئة المستهدفة"),
  description: z.string().min(10, "أدخل وصفًا مناسبًا"),
  seats: z.coerce.number().min(1, "عدد المقاعد يجب أن يكون 1 على الأقل"),
  startDate: z.string().min(1, "تاريخ البدء مطلوب"),
  endDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
  organizationalUnitId: z.string().optional().default("")
});

export type TrainingProgramFormValues = z.input<typeof trainingProgramSchema>;
