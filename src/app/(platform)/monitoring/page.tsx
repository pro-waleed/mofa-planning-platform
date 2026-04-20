import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getMonitoringCycles } from "@/services/platform";

type MonitoringCycleListItem = Awaited<ReturnType<typeof getMonitoringCycles>>[number];

export default async function MonitoringPage() {
  const cycles = await getMonitoringCycles();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المتابعة والتقييم"
        description="إدارة دورات المتابعة وتحديثات التقدم والعوائق والإجراءات التصحيحية."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {cycles.map((cycle: MonitoringCycleListItem) => {
          const meta = getStatusMeta(cycle.status);

          return (
            <Link key={cycle.id} href={`/monitoring/${cycle.id}`}>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">{cycle.titleAr}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cycle.plan.titleAr}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">الفترة</p><p className="mt-1 font-bold">{cycle.periodLabel}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">التحديثات</p><p className="mt-1 font-bold">{cycle.updates.length}</p></div>
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
