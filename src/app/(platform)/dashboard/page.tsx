import type { Route } from "next";
import {
  AlertTriangle,
  CheckCheck,
  ClipboardList,
  GraduationCap,
  ListTodo,
  TimerReset
} from "lucide-react";
import Link from "next/link";

import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { requireCurrentUser } from "@/lib/auth";
import { formatDate, percent } from "@/lib/utils";
import { getDashboardData } from "@/services/platform";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type DashboardPlan = DashboardData["plans"][number];
type DashboardApproval = DashboardData["pendingApprovals"][number];
type DashboardActivity = DashboardData["recentActivity"][number];

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const data = await getDashboardData(currentUser.id);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="لوحة القيادة التنفيذية"
        description="نظرة شاملة على حالة الخطط، الاعتمادات، مؤشرات الأداء، تقارير البعثات، وبرامج التدريب في البيئة التجريبية للمؤسسة."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="الخطط النشطة"
          value={String(data.metrics.activePlans)}
          description="خطط قيد التنفيذ أو الاعتماد"
          icon={ClipboardList}
        />
        <MetricCard
          title="الاعتمادات المعلقة"
          value={String(data.metrics.pendingApprovals)}
          description="طلبات تتطلب إجراءً إداريًا"
          icon={TimerReset}
          tone="warning"
        />
        <MetricCard
          title="العناصر المتأخرة"
          value={String(data.metrics.overdueItems)}
          description="مبادرات تجاوزت تاريخ الاستحقاق"
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          title="التقارير بانتظار المراجعة"
          value={String(data.metrics.pendingReports)}
          description="تقارير بعثات في دورة المراجعة الحالية"
          icon={ListTodo}
          tone="warning"
        />
        <MetricCard
          title="المؤشرات الصحية"
          value={String(data.metrics.healthyKpis)}
          description="مؤشرات ضمن حدود الأداء المستهدفة"
          icon={CheckCheck}
          tone="success"
        />
        <MetricCard
          title="الطاقة التدريبية"
          value={String(data.metrics.trainingSeats)}
          description="إجمالي المقاعد المتاحة في البرامج الحالية"
          icon={GraduationCap}
        />
      </section>

      <DashboardCharts
        kpiHealth={data.kpiHealth}
        progressTrend={data.progressTrend}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الخطط الجارية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.plans.map((plan: DashboardPlan) => {
              const meta = getStatusMeta(plan.status);
              const progress =
                plan.initiatives.length > 0
                  ? Math.round(
                      plan.initiatives.reduce(
                        (sum: number, item: DashboardPlan["initiatives"][number]) =>
                          sum + item.progressPercent,
                        0
                      ) / plan.initiatives.length
                    )
                  : 0;

              return (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="block rounded-2xl border border-border/70 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dashboard-ink">
                        {plan.titleAr}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.organizationalUnit?.nameAr}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>الفترة: {plan.periodLabel}</span>
                    <span>متوسط التقدم: {percent(progress)}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الاعتمادات والمهام العاجلة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.pendingApprovals.map((approval: DashboardApproval) => {
              const meta = getStatusMeta(approval.status);

              return (
                <div
                  key={approval.id}
                  className="rounded-2xl border border-border/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dashboard-ink">
                        {approval.titleAr}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        مرفوع بواسطة {approval.requester.fullNameAr}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{approval.entityType}</Badge>
                    <Badge variant="outline">
                      {approval.assignedTo.fullNameAr}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.map((activity: DashboardActivity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-border/70 p-4"
              >
                <p className="font-medium text-dashboard-ink">
                  {activity.description}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activity.entityType} • {formatDate(activity.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/templates/new" as Route, label: "إنشاء قالب ديناميكي جديد" },
              { href: "/plans/new" as Route, label: "إنشاء خطة من قالب" },
              { href: "/reports/new" as Route, label: "رفع تقرير بعثة" },
              { href: "/training/new" as Route, label: "نشر فرصة تدريبية" }
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="block rounded-2xl border border-border/70 px-4 py-3 text-sm font-medium transition hover:bg-slate-50"
              >
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
