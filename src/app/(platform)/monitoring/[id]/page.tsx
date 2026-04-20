import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { MonitoringUpdateForm } from "@/features/monitoring/update-form";
import { prisma } from "@/lib/prisma";
import { getMonitoringCycleById } from "@/services/platform";

type MonitoringCycleDetail = NonNullable<Awaited<ReturnType<typeof getMonitoringCycleById>>>;

export default async function MonitoringDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cycle = await getMonitoringCycleById(id);

  if (!cycle) notFound();

  const [planNodes, initiatives, kpis] = await Promise.all([
    prisma.planNode.findMany({
      where: { planId: cycle.planId },
      orderBy: { titleAr: "asc" }
    }),
    prisma.initiative.findMany({
      where: { planId: cycle.planId },
      orderBy: { titleAr: "asc" }
    }),
    prisma.kPI.findMany({
      orderBy: { titleAr: "asc" }
    })
  ]);

  const meta = getStatusMeta(cycle.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={cycle.titleAr} description={cycle.summary ?? ""} backHref="/monitoring" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>تحديثات الدورة</CardTitle>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </CardHeader>
          <CardContent className="space-y-3">
            {cycle.updates.map((update: MonitoringCycleDetail["updates"][number]) => (
              <div key={update.id} className="rounded-2xl border border-border/70 p-4">
                <p className="font-semibold">{update.planNode?.titleAr ?? "تحديث عام"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {update.correctiveActionText ?? update.obstacleText ?? "بدون تفاصيل"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <MonitoringUpdateForm
          cycleId={cycle.id}
          planNodes={planNodes}
          initiatives={initiatives}
          kpis={kpis}
        />
      </div>
    </div>
  );
}
