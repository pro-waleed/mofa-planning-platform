"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, GitBranchPlus } from "lucide-react";
import { useEffect, useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

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

type ParentOption = {
  id: string;
  titleAr: string;
  levelOrder: number;
  levelNameAr: string;
};

type LevelOption = {
  id: string;
  nameAr: string;
  levelOrder: number;
};

type PlanNodeFormProps = {
  planId: string;
  parentOptions: ParentOption[];
  levelOptions: LevelOption[];
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

  const parentId = useWatch({
    control: form.control,
    name: "parentId"
  });

  const selectedParent = useMemo(
    () => parentOptions.find((item) => item.id === parentId),
    [parentId, parentOptions]
  );

  const allowedLevels = useMemo(() => {
    const expectedLevelOrder = selectedParent ? selectedParent.levelOrder + 1 : 1;

    return levelOptions.filter((level) => level.levelOrder === expectedLevelOrder);
  }, [levelOptions, selectedParent]);

  useEffect(() => {
    const currentLevelId = form.getValues("templateLevelId");
    const currentLevelAllowed = allowedLevels.some((level) => level.id === currentLevelId);

    if (!currentLevelAllowed) {
      form.setValue("templateLevelId", allowedLevels[0]?.id ?? "");
    }
  }, [allowedLevels, form]);

  const onSubmit = (values: PlanNodeCreateValues) => {
    startTransition(async () => {
      await createPlanNodeAction(values);
      form.reset({
        ...initialValues,
        planId,
        templateLevelId: levelOptions[0]?.id ?? ""
      });
    });
  };

  const nextLevelLabel =
    allowedLevels[0]?.nameAr ?? "لا يوجد مستوى لاحق متاح ضمن القالب";

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة عقدة جديدة</CardTitle>
        <p className="section-subtitle">
          يبني هذا المحرر بنية الخطة وفق ترتيب مستويات القالب، وليس وفق تسلسل ثابت
          مسبقًا.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-[24px] border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-2 text-primary">
              <GitBranchPlus className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-sm leading-7">
              <p className="font-semibold text-dashboard-ink">
                المستوى المتوقع الآن: {nextLevelLabel}
              </p>
              <p className="text-muted-foreground">
                {selectedParent
                  ? `العقدة الجديدة ستندرج تحت "${selectedParent.titleAr}" من مستوى "${selectedParent.levelNameAr}".`
                  : "عدم اختيار عقدة أم يعني أن النظام سيضيف عقدة على المستوى الأعلى في القالب."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">العقدة الأم</label>
            <Select {...form.register("parentId")}>
              <option value="">على المستوى الأعلى</option>
              {parentOptions.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.titleAr} — {parent.levelNameAr}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">المستوى</label>
            <Select {...form.register("templateLevelId")} disabled={allowedLevels.length === 0}>
              <option value="">
                {allowedLevels.length === 0 ? "لا يوجد مستوى متاح" : "اختر المستوى"}
              </option>
              {allowedLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.nameAr}
                </option>
              ))}
            </Select>
          </div>

          {allowedLevels.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
                <p>
                  لا يوجد مستوى تالٍ متاح لهذه العقدة وفق القالب الحالي. إذا كنت تريد
                  توسيع البنية، عدّل القالب أولًا أو اختر عقدة أم أخرى.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium">عنوان العقدة</label>
            <Input {...form.register("titleAr")} placeholder="مثال: تطوير آلية اعتماد الخطط" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">الوصف التنفيذي</label>
            <Textarea
              {...form.register("description")}
              placeholder="صف الغاية من هذه العقدة وعلاقتها بسياق الخطة."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">المالك الإداري</label>
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
            <div className="grid gap-2">
              <label className="text-sm font-medium">تاريخ البدء</label>
              <Input type="date" {...form.register("startDate")} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">تاريخ الانتهاء</label>
              <Input type="date" {...form.register("endDate")} />
            </div>
          </div>

          <Button type="submit" disabled={isPending || allowedLevels.length === 0}>
            {isPending ? "جارٍ إضافة العقدة..." : "إضافة العقدة"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
