import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getPlanList } from "@/services/platform";

type PlanListItem = Awaited<ReturnType<typeof getPlanList>>[number];

export default async function PlansPage() {
  const plans = await getPlanList();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="الخطط"
        description="استعراض الخطط المؤسسية المبنية على القوالب الديناميكية، مع حالات التنفيذ والملكية وعدد العقد."
        actionHref="/plans/new"
        actionLabel="إنشاء خطة"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {plans.map((plan: PlanListItem) => {
          const meta = getStatusMeta(plan.status);

          return (
            <Link key={plan.id} href={`/plans/${plan.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-dashboard-ink">
                        {plan.titleAr}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {plan.template.nameAr} • {plan.periodLabel}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">العقد</p>
                      <p className="mt-1 text-2xl font-bold">{plan.nodes.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">المالك</p>
                      <p className="mt-1 text-sm font-semibold">{plan.owner.fullNameAr}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">الجهة</p>
                      <p className="mt-1 text-sm font-semibold">
                        {plan.organizationalUnit?.nameAr ?? "غير محددة"}
                      </p>
                    </div>
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
