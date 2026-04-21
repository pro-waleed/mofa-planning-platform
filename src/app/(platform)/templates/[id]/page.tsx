import { notFound } from "next/navigation";
import { CheckCircle2, Layers3, Network, Workflow } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { TemplateForm } from "@/features/templates/template-form";
import { formatDate, formatNumber } from "@/lib/utils";
import { getTemplateById } from "@/services/platform";

type TemplateDetail = NonNullable<Awaited<ReturnType<typeof getTemplateById>>>;

function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-white/80 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold text-dashboard-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

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
  const totalFields = template.levels.reduce((sum, level) => sum + level.fields.length, 0);
  const structureLocked = template._count.plans > 0;

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title={template.nameAr}
        description={
          template.description ??
          "تفاصيل القالب ومستوياته وحقوله الديناميكية مع معاينة البنية المعتمدة في إنشاء الخطط."
        }
        backHref="/templates"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="الحالة" value={meta.label} helper="جاهزية القالب للاستخدام أو المراجعة." />
        <SummaryCard
          label="عدد المستويات"
          value={formatNumber(template.levels.length)}
          helper="يمثل العمق الهيكلي الذي سيظهر في محرر الخطة."
        />
        <SummaryCard
          label="الحقول المرتبطة"
          value={formatNumber(totalFields)}
          helper="حقول نظامية ومساعدة مرتبطة بكل مستوى."
        />
        <SummaryCard
          label="الخطط المبنية"
          value={formatNumber(template._count.plans)}
          helper="عدد الخطط التي تستخدم هذا القالب حاليًا."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>معاينة البنية الديناميكية</CardTitle>
                  <p className="section-subtitle">
                    هذا التسلسل يحدد ترتيب عقد الخطة في المحرر الشجري، وليس بنية ثابتة
                    مفروضة على النظام.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={meta.label} tone={meta.tone} />
                  <Badge variant="outline">
                    <Network className="me-1 h-3.5 w-3.5" />
                    {template.moduleScope}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Workflow className="h-4 w-4" />
                  بصمة الهيكل
                </div>
                <p className="mt-3 text-base leading-8 text-dashboard-ink">
                  {template.levels.map((level) => level.nameAr).join(" ← ")}
                </p>
              </div>

              <div className="space-y-4">
                {template.levels.map((level: TemplateDetail["levels"][number]) => (
                  <div
                    key={level.id}
                    className="rounded-[24px] border border-border/70 bg-white/85 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-dashboard-ink">
                          {level.levelOrder}. {level.nameAr}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          المفتاح التقني: <span dir="ltr">{level.key}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={level.isRequired ? "success" : "neutral"}>
                          {level.isRequired ? "مستوى إلزامي" : "مستوى اختياري"}
                        </Badge>
                        <Badge variant="outline">{level.fields.length} حقلًا</Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {level.fields.map(
                        (field: TemplateDetail["levels"][number]["fields"][number]) => (
                          <div
                            key={field.id}
                            className="rounded-2xl border border-border/70 bg-slate-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-dashboard-ink">
                                {field.labelAr}
                              </p>
                              {field.isSystem ? (
                                <Badge variant="outline">حقل نظامي</Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              النوع: {field.fieldType}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الاستخدام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-semibold text-dashboard-ink">منشئ القالب</p>
                <p className="mt-2">{template.createdBy.fullNameAr}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-semibold text-dashboard-ink">آخر تحديث</p>
                <p className="mt-2">{formatDate(template.updatedAt)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-semibold text-dashboard-ink">رمز القالب</p>
                <p className="mt-2" dir="ltr">
                  {template.code}
                </p>
              </div>
              {structureLocked ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    القالب مستخدم في خطط فعلية
                  </div>
                  <p className="mt-2 leading-7">
                    يمكن تعديل البيانات الأساسية، لكن من الأفضل إنشاء نسخة جديدة عند الحاجة
                    إلى تغيير عدد المستويات أو هيكلها حتى لا تتأثر الخطط الحالية.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Layers3 className="h-4 w-4" />
                    البنية ما تزال قابلة للتطوير
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    بما أن هذا القالب غير مرتبط بخطط كثيرة، فيمكن استخدامه كمساحة تجريبية
                    لصياغة بنى جديدة قبل تعميمها.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
    </div>
  );
}
