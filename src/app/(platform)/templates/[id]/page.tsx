import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { TemplateForm } from "@/features/templates/template-form";
import { getTemplateById } from "@/services/platform";

type TemplateDetail = NonNullable<Awaited<ReturnType<typeof getTemplateById>>>;

export default async function TemplateDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);

  if (!template) {
    notFound();
  }

  const meta = getStatusMeta(template.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title={template.nameAr}
        description={template.description ?? "تفاصيل القالب ومستوياته وحقوله الديناميكية."}
        backHref="/templates"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة البنية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge label={meta.label} tone={meta.tone} />
                <span className="text-sm text-muted-foreground">
                  {template.moduleScope}
                </span>
              </div>

              <div className="space-y-4">
                {template.levels.map((level: TemplateDetail["levels"][number]) => (
                  <div
                    key={level.id}
                    className="rounded-2xl border border-border/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-dashboard-ink">
                          {level.levelOrder}. {level.nameAr}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          المفتاح: <span dir="ltr">{level.key}</span>
                        </p>
                      </div>
                      <StatusBadge
                        label={level.isRequired ? "إلزامي" : "اختياري"}
                        tone={level.isRequired ? "success" : "neutral"}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {level.fields.map((field: TemplateDetail["levels"][number]["fields"][number]) => (
                        <div
                          key={field.id}
                          className="rounded-2xl bg-slate-50 p-3 text-sm"
                        >
                          <p className="font-medium text-dashboard-ink">
                            {field.labelAr}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            النوع: {field.fieldType}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تحديث البيانات الأساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateForm
              mode="edit"
              templateId={template.id}
              defaultValues={{
                nameAr: template.nameAr,
                code: template.code,
                description: template.description ?? "",
                moduleScope: template.moduleScope ?? "",
                status: template.status,
                levels: template.levels.map((level: TemplateDetail["levels"][number]) => ({
                  nameAr: level.nameAr,
                  key: level.key,
                  isRequired: level.isRequired
                }))
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
