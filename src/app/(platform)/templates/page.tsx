import Link from "next/link";
import { Layers3, Network } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { formatDate } from "@/lib/utils";
import { getTemplateList } from "@/services/platform";

type TemplateListItem = Awaited<ReturnType<typeof getTemplateList>>[number];

export default async function TemplatesPage() {
  const templates = await getTemplateList();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="القوالب"
        description="إدارة قوالب التخطيط الديناميكي بحيث يمكن تعريف أي هيكل هرمي مؤسسي دون افتراض مستويات ثابتة."
        actionHref="/templates/new"
        actionLabel="إنشاء قالب جديد"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {templates.map((template: TemplateListItem) => {
          const meta = getStatusMeta(template.status);

          return (
            <Link key={template.id} href={`/templates/${template.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-dashboard-ink">
                        {template.nameAr}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">المستويات</p>
                      <p className="mt-1 text-2xl font-bold">{template.levels.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">الحقول</p>
                      <p className="mt-1 text-2xl font-bold">{template.fields.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">الخطط المبنية</p>
                      <p className="mt-1 text-2xl font-bold">
                        {template._count.plans}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.levels.map((level: TemplateListItem["levels"][number]) => (
                      <span
                        key={level.id}
                        className="metric-chip"
                      >
                        <Layers3 className="me-1 h-3.5 w-3.5" />
                        {level.nameAr}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      {template.moduleScope}
                    </span>
                    <span>{formatDate(template.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
