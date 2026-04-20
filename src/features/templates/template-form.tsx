"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";

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

const initialValues: TemplateFormValues = {
  nameAr: "",
  code: "",
  description: "",
  moduleScope: "التخطيط المؤسسي",
  status: "DRAFT",
  levels: [
    { nameAr: "أولوية", key: "priority", isRequired: true },
    { nameAr: "هدف استراتيجي", key: "goal", isRequired: true },
    { nameAr: "مبادرة", key: "initiative", isRequired: true }
  ]
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

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      <Card>
        <CardHeader>
          <CardTitle>بيانات القالب</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">اسم القالب</label>
            <Input {...form.register("nameAr")} placeholder="مثال: قالب المحاور والبرامج" />
            <p className="text-sm text-rose-600">{form.formState.errors.nameAr?.message}</p>
          </div>

          {mode === "create" ? (
            <div className="grid gap-2">
              <label className="text-sm font-medium">الرمز الاختياري</label>
              <Input {...form.register("code")} placeholder="TPL-PROGRAM-2026" />
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
              placeholder="صف نوع البنية التي يدعمها القالب وكيف ستستخدمه الإدارات."
            />
            <p className="text-sm text-rose-600">
              {form.formState.errors.description?.message}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>المستويات الديناميكية</CardTitle>
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
          {fieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border border-border/70 bg-slate-50 p-4"
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

