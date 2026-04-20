"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPlanNodeAction } from "@/features/plans/actions";
import {
  type PlanNodeCreateValues,
  planNodeCreateSchema
} from "@/features/plans/schema";

type PlanNodeFormProps = {
  planId: string;
  parentOptions: Array<{ id: string; titleAr: string }>;
  levelOptions: Array<{ id: string; nameAr: string }>;
  ownerOptions: Array<{ id: string; fullNameAr: string }>;
};

const initialValues: PlanNodeCreateValues = {
  planId: "",
  parentId: "",
  templateLevelId: "",
  titleAr: "",
  description: "",
  ownerId: "",
  startDate: "",
  endDate: ""
};

export function PlanNodeForm({
  planId,
  parentOptions,
  levelOptions,
  ownerOptions
}: PlanNodeFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PlanNodeCreateValues>({
    resolver: zodResolver(planNodeCreateSchema),
    defaultValues: {
      ...initialValues,
      planId
    }
  });

  const onSubmit = (values: PlanNodeCreateValues) => {
    startTransition(async () => {
      await createPlanNodeAction(values);
      form.reset({ ...initialValues, planId });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة عقدة جديدة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">العقدة الأم</label>
            <Select {...form.register("parentId")}>
              <option value="">على المستوى الأعلى</option>
              {parentOptions.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.titleAr}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">المستوى</label>
            <Select {...form.register("templateLevelId")}>
              <option value="">اختر مستوى</option>
              {levelOptions.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.nameAr}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">عنوان العقدة</label>
            <Input {...form.register("titleAr")} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea {...form.register("description")} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">المالك</label>
            <Select {...form.register("ownerId")}>
              <option value="">بدون تعيين</option>
              {ownerOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullNameAr}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input type="date" {...form.register("startDate")} />
            <Input type="date" {...form.register("endDate")} />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "جارٍ الإضافة..." : "إضافة العقدة"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
