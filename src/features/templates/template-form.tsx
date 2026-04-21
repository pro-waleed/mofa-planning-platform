"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Layers3, Plus, Sparkles, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTemplateAction,
  updateTemplateAction
} from "@/features/templates/actions";
import {
  type TemplateFormValues,
  templateSchema
} from "@/features/templates/schema";

type TemplateFormProps = {
  mode: "create" | "edit";
  templateId?: string;
  defaultValues?: TemplateFormValues;
};

const templatePatterns = [
  {
    label: "مسار استراتيجي",
    description: "أولوية ← هدف استراتيجي ← هدف فرعي ← مبادرة ← مؤشر",
    levels: [
      { nameAr: "أولوية", key: "priority", isRequired: true },
      { nameAr: "هدف استراتيجي", key: "strategic_goal", isRequired: true },
      { nameAr: "هدف فرعي", key: "sub_goal", isRequired: true },
      { nameAr: "مبادرة", key: "initiative", isRequired: true },
      { nameAr: "مؤشر", key: "kpi", isRequired: false }
    ]
  },
  {
    label: "مسار برامج ومشاريع",
    description: "محور ← برنامج ← مشروع ← نشاط ← مخرج ← مؤشر",
    levels: [
      { nameAr: "محور", key: "axis", isRequired: true },
      { nameAr: "برنامج", key: "program", isRequired: true },
      { nameAr: "مشروع", key: "project", isRequired: true },
      { nameAr: "نشاط", key: "activity", isRequired: true },
      { nameAr: "مخرج", key: "output", isRequired: true },
      { nameAr: "مؤشر", key: "indicator", isRequired: false }
    ]
  },
  {
    label: "مسار نتائج وإجراءات",
    description: "هدف ← نتيجة ← إجراء ← مقياس",
    levels: [
      { nameAr: "هدف", key: "objective", isRequired: true },
      { nameAr: "نتيجة", key: "result", isRequired: true },
      { nameAr: "إجراء", key: "action", isRequired: true },
      { nameAr: "مقياس", key: "measure", isRequired: false }
    ]
  }
] as const;

const initialValues: TemplateFormValues = {
  nameAr: "",
  code: "",
  description: "",
  moduleScope: "التخطيط المؤسسي",
  status: "DRAFT",
  levels: [...templatePatterns[0].levels]
};

export function TemplateForm({
  mode,
  templateId,
  defaultValues = initialValues
}: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues
  });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "levels"
  });

  const onSubmit = (values: TemplateFormValues) => {
    startTransition(async () => {
      if (mode === "edit" && templateId) {
        await updateTemplateAction(templateId, values);
      } else {
        await createTemplateAction(values);
      }
    });
  };

  const selectedLevels = form.watch("levels");

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>بيانات القالب</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">اسم القالب</label>
              <Input
                {...form.register("nameAr")}
                placeholder="مثال: قالب الأولويات والأهداف الاستراتيجية"
              />
              <p className="text-sm text-rose-600">{form.formState.errors.nameAr?.message}</p>
            </div>

            {mode === "create" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium">الرمز الاختياري</label>
                <Input {...form.register("code")} placeholder="TPL-STRATEGIC-2026" />
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm font-medium">نطاق الاستخدام</label>
              <Input
                {...form.register("moduleScope")}
                placeholder="مثال: التخطيط المؤسسي"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select {...form.register("status")}>
                <option value="DRAFT">مسودة</option>
                <option value="ACTIVE">نشط</option>
                <option value="ARCHIVED">مؤرشف</option>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">وصف القالب</label>
              <Textarea
                {...form.register("description")}
                placeholder="صف بنية التخطيط التي يدعمها هذا القالب وآلية استخدامه داخل المؤسسة."
              />
              <p className="text-sm text-rose-600">
                {form.formState.errors.description?.message}
              </p>
            </div>
          </CardContent>
        </Card>

        {mode === "create" ? (
          <Card>
            <CardHeader>
              <CardTitle>أنماط سريعة</CardTitle>
              <p className="section-subtitle">
                هذه الأنماط مجرد نقطة بداية. يمكنك تعديل الأسماء والمفاتيح وعدد المستويات
                بحرية.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {templatePatterns.map((pattern) => (
                <button
                  key={pattern.label}
                  type="button"
                  onClick={() => fieldArray.replace([...pattern.levels])}
                  className="rounded-[24px] border border-border/70 bg-slate-50 p-4 text-start transition hover:border-primary/20 hover:bg-white"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">{pattern.label}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {pattern.description}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>المستويات الديناميكية</CardTitle>
            <p className="section-subtitle">
              ترتيب هذه المستويات هو ما يبني محرر الشجرة والخطة لاحقًا.
            </p>
          </div>
          {mode === "create" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                fieldArray.append({
                  nameAr: "",
                  key: `level_${fieldArray.fields.length + 1}`,
                  isRequired: true
                })
              }
            >
              <Plus className="me-2 h-4 w-4" />
              إضافة مستوى
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2 text-primary">
                <Layers3 className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-dashboard-ink">معاينة التسلسل</p>
                <p className="leading-7 text-muted-foreground">
                  {selectedLevels.map((level) => level.nameAr).join(" ← ")}
                </p>
              </div>
            </div>
          </div>

          {fieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-[24px] border border-border/70 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-dashboard-ink">
                  المستوى {index + 1}
                </p>
                {mode === "create" && fieldArray.fields.length > 2 ? (
                  <button
                    type="button"
                    className="text-rose-600"
                    onClick={() => fieldArray.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3">
                <Input
                  {...form.register(`levels.${index}.nameAr`)}
                  placeholder="اسم المستوى بالعربية"
                  disabled={mode === "edit"}
                />
                <Input
                  dir="ltr"
                  {...form.register(`levels.${index}.key`)}
                  placeholder="level_key"
                  disabled={mode === "edit"}
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    {...form.register(`levels.${index}.isRequired`)}
                    disabled={mode === "edit"}
                  />
                  مستوى إلزامي
                </label>
              </div>
            </div>
          ))}

          {mode === "edit" ? (
            <div className="rounded-2xl border border-dashed border-border p-4 text-sm leading-7 text-muted-foreground">
              يمكن تعديل البيانات الأساسية للقالب هنا. أما بنية المستويات نفسها فهي
              مثبتة لهذا العرض لتجنب كسر الخطط الحالية المبنية على القالب.
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "جارٍ الحفظ..."
              : mode === "create"
                ? "إنشاء القالب"
                : "حفظ التعديلات"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
