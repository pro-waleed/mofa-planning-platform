"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Send } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMissionReportAction } from "@/features/reports/actions";
import {
  missionReportSchema,
  type MissionReportFormValues
} from "@/features/reports/schema";

type ReportFormProps = {
  units: Array<{ id: string; nameAr: string }>;
  reviewers: Array<{ id: string; fullNameAr: string }>;
};

export function ReportForm({ units, reviewers }: ReportFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<MissionReportFormValues>({
    resolver: zodResolver(missionReportSchema),
    defaultValues: {
      titleAr: "",
      reportingPeriod: "النصف الأول 2026",
      missionNameAr: "",
      countryAr: "",
      organizationalUnitId: "",
      reviewerId: "",
      executiveSummary: "",
      achievements: "",
      challenges: "",
      supportRequests: ""
    }
  });

  const onSubmit = (values: MissionReportFormValues) => {
    startTransition(async () => {
      await createMissionReportAction(values);
    });
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>بيانات التقرير الأساسية</CardTitle>
          <p className="section-subtitle">
            هوية التقرير والجهة المرجعية ومسار المراجعة الإداري.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">عنوان التقرير</label>
            <Input
              {...form.register("titleAr")}
              placeholder="مثال: التقرير النصف سنوي لبعثة الجمهورية اليمنية في الرياض"
            />
            {errors.titleAr ? (
              <p className="text-sm text-rose-600">{errors.titleAr.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">الفترة المرجعية</label>
            <Input {...form.register("reportingPeriod")} placeholder="النصف الأول 2026" />
            {errors.reportingPeriod ? (
              <p className="text-sm text-rose-600">{errors.reportingPeriod.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">اسم البعثة</label>
            <Input {...form.register("missionNameAr")} placeholder="بعثة الجمهورية اليمنية - الرياض" />
            {errors.missionNameAr ? (
              <p className="text-sm text-rose-600">{errors.missionNameAr.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">الدولة</label>
            <Input {...form.register("countryAr")} placeholder="المملكة العربية السعودية" />
            {errors.countryAr ? (
              <p className="text-sm text-rose-600">{errors.countryAr.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">الوحدة التنظيمية</label>
            <Select {...form.register("organizationalUnitId")}>
              <option value="">اختر الوحدة المالكة</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nameAr}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">المراجع المعتمد</label>
            <Select {...form.register("reviewerId")}>
              <option value="">اختر المراجع</option>
              {reviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.fullNameAr}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4 text-sm leading-7 text-muted-foreground">
            عند إرسال التقرير للمراجعة، ينشئ النظام عنصر اعتماد تلقائيًا ويخطر المراجع
            المعتمد بوجود تقرير جديد بانتظار القرار.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المحتوى التنفيذي</CardTitle>
          <p className="section-subtitle">
            اكتب محتوى يصلح للعرض على الإدارة العامة ويبيّن الإنجاز والتحديات والدعم المطلوب.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">الملخص التنفيذي</label>
            <Textarea
              {...form.register("executiveSummary")}
              placeholder="قدّم خلاصة مركزة لأبرز ما تحقق خلال الفترة، وأثره على العمل الدبلوماسي أو المؤسسي."
            />
            {errors.executiveSummary ? (
              <p className="text-sm text-rose-600">{errors.executiveSummary.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">أبرز الإنجازات</label>
            <Textarea
              {...form.register("achievements")}
              placeholder="اذكر النتائج أو الإنجازات النوعية والأعمال المنجزة خلال الفترة."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">التحديات</label>
            <Textarea
              {...form.register("challenges")}
              placeholder="صف المعوقات أو القضايا التي أثرت في التنفيذ أو سرعة الإنجاز."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">طلبات الدعم</label>
            <Textarea
              {...form.register("supportRequests")}
              placeholder="حدد ما تحتاجه البعثة من دعم أو توجيه أو قرار من الإدارة العامة."
            />
          </div>

          <div className="rounded-[24px] border border-border/70 bg-slate-50 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-dashboard-ink">
              <FileText className="h-4 w-4 text-primary" />
              تذكير تحريري
            </div>
            <p className="mt-2 leading-7 text-muted-foreground">
              كلما كان الربط أوضح بين الإنجازات والتحديات وطلبات الدعم، ظهرت حالة التقرير
              بصورة أكثر مهنية في لوحة القيادة وسجل الاعتماد.
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            <Send className="me-2 h-4 w-4" />
            {isPending ? "جارٍ إنشاء التقرير..." : "إنشاء التقرير"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
