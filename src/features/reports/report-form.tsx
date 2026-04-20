"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input {...form.register("titleAr")} placeholder="عنوان التقرير" />
          <Input {...form.register("reportingPeriod")} placeholder="الفترة" />
          <Input {...form.register("missionNameAr")} placeholder="اسم البعثة" />
          <Input {...form.register("countryAr")} placeholder="الدولة" />
          <Select {...form.register("organizationalUnitId")}>
            <option value="">اختر الوحدة</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.nameAr}
              </option>
            ))}
          </Select>
          <Select {...form.register("reviewerId")}>
            <option value="">اختر المراجع</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer.id} value={reviewer.id}>
                {reviewer.fullNameAr}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المحتوى التنفيذي</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea {...form.register("executiveSummary")} placeholder="الملخص التنفيذي" />
          <Textarea {...form.register("achievements")} placeholder="أبرز الإنجازات" />
          <Textarea {...form.register("challenges")} placeholder="التحديات" />
          <Textarea {...form.register("supportRequests")} placeholder="طلبات الدعم" />
          <Button type="submit" disabled={isPending}>
            {isPending ? "جارٍ الإنشاء..." : "إنشاء التقرير"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

