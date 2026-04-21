import { z } from "zod";

export const missionReportSchema = z.object({
  titleAr: z.string().min(3, "عنوان التقرير مطلوب"),
  reportingPeriod: z.string().min(2, "الفترة المرجعية مطلوبة"),
  missionNameAr: z.string().min(2, "اسم البعثة مطلوب"),
  countryAr: z.string().min(2, "الدولة مطلوبة"),
  organizationalUnitId: z.string().optional().default(""),
  reviewerId: z.string().optional().default(""),
  executiveSummary: z.string().min(10, "أدخل ملخصًا تنفيذيًا واضحًا"),
  achievements: z.string().optional().default(""),
  challenges: z.string().optional().default(""),
  supportRequests: z.string().optional().default("")
});

export type MissionReportFormValues = z.input<typeof missionReportSchema>;
