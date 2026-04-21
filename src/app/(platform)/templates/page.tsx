import Link from "next/link";
import { Layers3, Network, PenTool, Shapes } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { formatDate, formatNumber } from "@/lib/utils";
import { getTemplateList } from "@/services/platform";

type TemplateListItem = Awaited<ReturnType<typeof getTemplateList>>[number];

export default async function TemplatesPage() {
  const templates = await getTemplateList();

  const activeTemplates = templates.filter((template) => template.status === "ACTIVE").length;
  const draftTemplates = templates.filter((template) => template.status === "DRAFT").length;
  const totalPlans = templates.reduce((sum, template) => sum + template._count.plans, 0);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="القوالب"
        description="محرك القوالب هو الأساس الديناميكي للمنصة. كل قالب يعرّف تسلسلًا هرميًا مختلفًا دون افتراض أي عدد ثابت من الأولويات أو الأهداف أو البرامج."
        actionHref="/templates/new"
        actionLabel="إنشاء قالب جديد"
      />

      <section className="hero-panel rounded-[32px] border border-white/70 p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-primary/10 bg-white/80 p-5">
            <p className="executive-kicker">مرونة البنية</p>
            <h2 className="mt-3 text-2xl font-bold text-dashboard-ink">
              {formatNumber(templates.length)} قالبًا
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              تدعم نماذج تخطيط متعددة مثل الأولويات والأهداف، أو البرامج والمشاريع، أو
              النتائج والإجراءات.
            </p>
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">قوالب فعّالة</p>
            <p className="mt-3 text-2xl font-bold text-dashboard-ink">
              {formatNumber(activeTemplates)}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              جاهزة لتوليد خطط جديدة وإعادة الاستخدام عبر أكثر من وحدة تنظيمية.
            </p>
          </div>
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">أثر القوالب</p>
            <p className="mt-3 text-2xl font-bold text-dashboard-ink">
              {formatNumber(totalPlans)}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              خطط أُنشئت من القوالب الحالية، مع {formatNumber(draftTemplates)} قالبًا
              ما يزال قيد التهيئة أو التحسين.
            </p>
          </div>
        </div>
      </section>

      {templates.length === 0 ? (
        <EmptyState
          title="لا توجد قوالب معرفة بعد"
          description="ابدأ بإنشاء قالب يعرّف تسلسل المستويات والحقول المطلوبة، ثم استخدمه لتوليد خطط مؤسسية ديناميكية."
          actionHref="/templates/new"
          actionLabel="إنشاء أول قالب"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {templates.map((template: TemplateListItem) => {
            const meta = getStatusMeta(template.status);
            const levelPreview = template.levels.map((level) => level.nameAr).join(" ← ");

            return (
              <Link key={template.id} href={`/templates/${template.id}`}>
                <Card className="h-full transition hover:-translate-y-1 hover:border-primary/20">
                  <CardContent className="space-y-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xl font-bold text-dashboard-ink">
                            {template.nameAr}
                          </p>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Shapes className="h-4 w-4" />
                        البنية الحالية
                      </div>
                      <p className="mt-3 text-sm leading-7 text-dashboard-ink">
                        {levelPreview}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        هذا التسلسل ليس ثابتًا داخل النظام، بل يحدد منطق إنشاء الخطة
                        ومحرر الشجرة لاحقًا.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-muted-foreground">عدد المستويات</p>
                        <p className="mt-1 text-2xl font-bold">{template.levels.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-muted-foreground">الحقول المعرفة</p>
                        <p className="mt-1 text-2xl font-bold">{template.fields.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-muted-foreground">الخطط المنشأة</p>
                        <p className="mt-1 text-2xl font-bold">{template._count.plans}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <Network className="me-1 h-3.5 w-3.5" />
                        {template.moduleScope}
                      </Badge>
                      {template.levels.map((level) => (
                        <span key={level.id} className="metric-chip">
                          <Layers3 className="me-1 h-3.5 w-3.5" />
                          {level.nameAr}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        آخر تحديث {formatDate(template.updatedAt)}
                      </span>
                      <span>{template.code}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
