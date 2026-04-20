"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTrainingProgramAction } from "@/features/training/actions";
import {
  trainingProgramSchema,
  type TrainingProgramFormValues
} from "@/features/training/schema";

type TrainingProgramFormProps = {
  units: Array<{ id: string; nameAr: string }>;
};

export function TrainingProgramForm({ units }: TrainingProgramFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TrainingProgramFormValues>({
    resolver: zodResolver(trainingProgramSchema),
    defaultValues: {
      titleAr: "",
      providerAr: "",
      locationAr: "",
      targetAudience: "",
      description: "",
      seats: 10,
      startDate: "",
      endDate: "",
      organizationalUnitId: ""
    }
  });

  const onSubmit = (values: TrainingProgramFormValues) => {
    startTransition(async () => {
      await createTrainingProgramAction(values);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input {...form.register("titleAr")} placeholder="اسم البرنامج" />
          <Input {...form.register("providerAr")} placeholder="الجهة المقدمة" />
          <Input {...form.register("locationAr")} placeholder="مكان التنفيذ" />
          <Input {...form.register("targetAudience")} placeholder="الفئة المستهدفة" />
          <Select {...form.register("organizationalUnitId")}>
            <option value="">اختر الوحدة</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.nameAr}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التفاصيل التشغيلية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea {...form.register("description")} placeholder="وصف البرنامج" />
          <Input type="number" min={1} {...form.register("seats")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input type="date" {...form.register("startDate")} />
            <Input type="date" {...form.register("endDate")} />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "جارٍ الإنشاء..." : "نشر الفرصة التدريبية"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
