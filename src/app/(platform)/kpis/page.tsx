import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getKpis } from "@/services/platform";

type KpiListItem = Awaited<ReturnType<typeof getKpis>>[number];

export default async function KpisPage() {
  const kpis = await getKpis();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المؤشرات"
        description="السجل المركزي لمؤشرات الأداء مع القيم الأساسية والمستهدفة والفعلية وحالة الصحة."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {kpis.map((kpi: KpiListItem) => {
          const meta = getStatusMeta(kpi.status);

          return (
            <Link key={kpi.id} href={`/kpis/${kpi.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-dashboard-ink">
                        {kpi.titleAr}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{kpi.code}</p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">الأساس</p>
                      <p className="mt-1 font-bold">{kpi.baselineValue ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">المستهدف</p>
                      <p className="mt-1 font-bold">{kpi.targetValue ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">الفعلي</p>
                      <p className="mt-1 font-bold">{kpi.actualValue ?? "-"}</p>
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
