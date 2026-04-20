"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPlanAction } from "@/features/plans/actions";
import { type PlanFormValues, planSchema } from "@/features/plans/schema";

type PlanFormProps = {
  templates: Array<{ id: string; nameAr: string }>;
  users: Array<{ id: string; fullNameAr: string }>;
  units: Array<{ id: string; nameAr: string }>;
};

const initialValues: PlanFormValues = {
  titleAr: "",
  code: "",
  description: "",
  periodLabel: "2026",
  templateId: "",
  organizationalUnitId: "",
  ownerId: "",
  startDate: "",
  endDate: ""
};

export function PlanForm({ templates, users, units }: PlanFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: initialValues
  });

  const onSubmit = (values: PlanFormValues) => {
    startTransition(async () => {
      await createPlanAction(values);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>البيانات العامة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">عنوان الخطة</label>
            <Input {...form.register("titleAr")} />
            <p className="text-sm text-rose-600">{form.formState.errors.titleAr?.message}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea {...form.register("description")} />
            <p className="text-sm text-rose-600">
              {form.formState.errors.description?.message}
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">الفترة</label>
            <Input {...form.register("periodLabel")} placeholder="2026 - 2028" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">القالب</label>
            <Select {...form.register("templateId")}>
              <option value="">اختر قالبًا</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.nameAr}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الملكية والجدول الزمني</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">الجهة المالكة</label>
            <Select {...form.register("organizationalUnitId")}>
              <option value="">بدون تحديد</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nameAr}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">مالك الخطة</label>
            <Select {...form.register("ownerId")}>
              <option value="">اختر مستخدمًا</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullNameAr}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">تاريخ البدء</label>
              <Input type="date" {...form.register("startDate")} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">تاريخ الانتهاء</label>
              <Input type="date" {...form.register("endDate")} />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">رمز الخطة الاختياري</label>
            <Input {...form.register("code")} placeholder="PLAN-2026-OPS" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "جارٍ إنشاء الخطة..." : "إنشاء الخطة"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

