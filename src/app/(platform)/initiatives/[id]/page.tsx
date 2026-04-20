import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStatusMeta } from "@/config/status";
import { getInitiativeById } from "@/services/platform";

type InitiativeDetail = NonNullable<Awaited<ReturnType<typeof getInitiativeById>>>;

export default async function InitiativeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initiative = await getInitiativeById(id);

  if (!initiative) notFound();

  const meta = getStatusMeta(initiative.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={initiative.titleAr} description={initiative.description ?? ""} backHref="/initiatives" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>حالة التنفيذ</CardTitle>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={initiative.progressPercent} />
            <p className="text-sm text-muted-foreground">
              المالك: {initiative.owner.fullNameAr}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">العوائق</p>
                <p className="mt-1">{initiative.blockerSummary ?? "لا توجد عوائق مسجلة"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">الإجراء التصحيحي</p>
                <p className="mt-1">{initiative.correctiveAction ?? "لم يسجل بعد"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>تحديثات المتابعة</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {initiative.monitoringUpdates.map((update: InitiativeDetail["monitoringUpdates"][number]) => (
              <div key={update.id} className="rounded-2xl border border-border/70 p-4">
                <p className="font-semibold">{update.cycle.titleAr}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {update.correctiveActionText ?? update.obstacleText ?? "لا توجد تفاصيل"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
