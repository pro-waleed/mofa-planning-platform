import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getKpiById } from "@/services/platform";

type KpiDetail = NonNullable<Awaited<ReturnType<typeof getKpiById>>>;

export default async function KpiDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kpi = await getKpiById(id);

  if (!kpi) notFound();

  const meta = getStatusMeta(kpi.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={kpi.titleAr} description={kpi.description ?? "تفاصيل المؤشر"} backHref="/kpis" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>القيم الرئيسية</CardTitle>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">الأساس</p><p className="mt-1 font-bold">{kpi.baselineValue ?? "-"}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">المستهدف</p><p className="mt-1 font-bold">{kpi.targetValue ?? "-"}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">الفعلي</p><p className="mt-1 font-bold">{kpi.actualValue ?? "-"}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">المالك</p><p className="mt-1 font-bold">{kpi.owner?.fullNameAr ?? "غير محدد"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>روابط الخطة</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {kpi.nodeLinks.map((link: KpiDetail["nodeLinks"][number]) => (
              <div key={link.id} className="rounded-2xl border border-border/70 p-4">
                <p className="font-semibold">{link.planNode.titleAr}</p>
                <p className="text-sm text-muted-foreground">{link.planNode.plan.titleAr}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
