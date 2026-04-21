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

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { getStatusMeta } from "@/config/status";
import { requireCurrentUser } from "@/lib/auth";
import { formatDate, percent } from "@/lib/utils";
import { getDashboardData } from "@/services/platform";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type DashboardPlan = DashboardData["plans"][number];
type DashboardApproval = DashboardData["pendingApprovals"][number];
type DashboardInitiative = DashboardData["overdueInitiatives"][number];
type DashboardReport = DashboardData["missionReports"][number];
type DashboardTraining = DashboardData["trainingPrograms"][number];
type DashboardActivity = DashboardData["recentActivity"][number];

const quickActions = [
  { href: "/templates/new" as Route, label: "إنشاء قالب تخطيط ديناميكي" },
  { href: "/plans/new" as Route, label: "إطلاق خطة من قالب" },
  { href: "/reports/new" as Route, label: "رفع تقرير بعثة" },
  { href: "/training/new" as Route, label: "نشر فرصة تدريبية" }
];

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const data = await getDashboardData(currentUser.id);

  const kpiHealth = data.kpiHealth;
  const watchValue = data.kpiHealth[1]?.value ?? 0;
  const criticalValue = data.kpiHealth[2]?.value ?? 0;

  const approvalHotItems = data.pendingApprovals.filter(
    (approval) => approval.status === "PENDING"
  );

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="لوحة القيادة التنفيذية"
        description="قراءة عربية تنفيذية لحالة الخطط والاعتمادات والمتابعة والتقارير والتدريب، مصممة لاجتماعات المراجعة واتخاذ القرار."
      />

      <section className="hero-panel rounded-[32px] border border-white/70 p-6 shadow-soft">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{currentUser.role.nameAr}</Badge>
              {currentUser.organizationalUnit ? (
                <Badge variant="outline">{currentUser.organizationalUnit.nameAr}</Badge>
              ) : null}
              <Badge variant="outline">تحديث اليوم {formatDate(new Date())}</Badge>
            </div>
            <div className="space-y-3">
              <p className="executive-kicker">ملخص قيادي</p>
              <h2 className="text-3xl font-bold leading-tight text-dashboard-ink">
                المشهد المؤسسي الحالي يظهر {data.metrics.activePlans} خطط فعّالة، مع{" "}
                {data.metrics.pendingApprovals} اعتمادًا معلقًا و{data.metrics.overdueItems}{" "}
                عنصرًا يحتاج تدخلًا قريبًا.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                تم إعداد هذه النسخة لإبراز الصورة التنفيذية لا التفاصيل التشغيلية فقط،
                بما يساعد الإدارة العامة على استعراض الجاهزية، عناصر الخطر، والتقدم
                عبر المسارات المؤسسية الرئيسية.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-dashboard-ink transition hover:border-primary/30 hover:bg-primary/5"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-primary">صحة المؤشرات</p>
              <p className="mt-3 text-3xl font-bold text-dashboard-ink">
                {data.metrics.healthyKpis}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                مؤشرًا ضمن النطاق الصحي، مقابل {watchValue} مؤشرًا يتطلب متابعة و
                {criticalValue} مؤشرًا حرجًا.
              </p>
            </div>
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-700">حساسية الاعتماد</p>
              <p className="mt-3 text-3xl font-bold text-dashboard-ink">
                {approvalHotItems.length}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                طلبات بانتظار إجراء مباشر، منها ما يرتبط بالخطط والتقارير والترشيحات.
              </p>
            </div>
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-semibold text-rose-700">عناصر حرجة</p>
              <p className="mt-3 text-3xl font-bold text-dashboard-ink">
                {data.metrics.overdueItems}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                مبادرات تجاوزت الاستحقاق وتحتاج تدخلًا إداريًا أو تصحيحيًا.
              </p>
            </div>
            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">الجاهزية التدريبية</p>
              <p className="mt-3 text-3xl font-bold text-dashboard-ink">
                {data.metrics.trainingSeats}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                مقعدًا متاحًا ضمن البرامج الحالية لدعم بناء القدرات وتطوير الأداء.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="الخطط النشطة"
          value={String(data.metrics.activePlans)}
          description="خطط في طور التنفيذ أو المراجعة أو الاعتماد."
          icon={ClipboardList}
        />
        <MetricCard
          title="الاعتمادات المعلقة"
          value={String(data.metrics.pendingApprovals)}
          description="طلبات تحتاج إجراءً إداريًا أو مراجعة تنفيذية."
          icon={TimerReset}
          tone="warning"
        />
        <MetricCard
          title="العناصر المتأخرة"
          value={String(data.metrics.overdueItems)}
          description="مبادرات تجاوزت تاريخ الاستحقاق الحالي."
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          title="تقارير بانتظار المراجعة"
          value={String(data.metrics.pendingReports)}
          description="تقارير بعثات ما زالت قيد المراجعة أو الاستكمال."
          icon={ListTodo}
          tone="warning"
        />
        <MetricCard
          title="المؤشرات الصحية"
          value={String(data.metrics.healthyKpis)}
          description="المؤشرات الواقعة ضمن الحدود المستهدفة."
          icon={CheckCheck}
          tone="success"
        />
        <MetricCard
          title="الطاقة التدريبية"
          value={String(data.metrics.trainingSeats)}
          description="إجمالي المقاعد المتاحة في البرامج الجارية."
          icon={GraduationCap}
        />
      </section>

      <DashboardCharts kpiHealth={kpiHealth} progressTrend={data.progressTrend} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>الخطط الجارية</CardTitle>
              <p className="section-subtitle">
                نظرة مركزة على أكثر الخطط حضورًا في الدورة الحالية.
              </p>
            </div>
            <Badge variant="outline">{data.plans.length} خطة</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.plans.length > 0 ? (
              data.plans.map((plan: DashboardPlan) => {
                const meta = getStatusMeta(plan.status);
                const progress =
                  plan.initiatives.length > 0
                    ? Math.round(
                        plan.initiatives.reduce(
                          (sum, item) => sum + item.progressPercent,
                          0
                        ) / plan.initiatives.length
                      )
                    : 0;

                return (
                  <Link
                    key={plan.id}
                    href={`/plans/${plan.id}`}
                    className="block rounded-[24px] border border-border/70 bg-slate-50 p-5 transition hover:border-primary/20 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-dashboard-ink">
                          {plan.titleAr}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {plan.organizationalUnit?.nameAr ?? "من دون جهة مالكة محددة"} •{" "}
                          {plan.periodLabel}
                        </p>
                      </div>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs text-muted-foreground">المالك</p>
                        <p className="mt-1 font-semibold">{plan.owner.fullNameAr}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs text-muted-foreground">عدد المبادرات</p>
                        <p className="mt-1 font-semibold">{plan.initiatives.length}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs text-muted-foreground">متوسط التقدم</p>
                        <p className="mt-1 font-semibold">{percent(progress)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                title="لا توجد خطط معروضة"
                description="ابدأ بإنشاء خطة من قالب ديناميكي لبدء تجربة التخطيط المؤسسي."
                actionHref="/plans/new"
                actionLabel="إنشاء خطة"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>الاعتمادات الحرجة</CardTitle>
                <p className="section-subtitle">
                  عناصر تنتظر قرارًا أو متابعة تنفيذية مباشرة.
                </p>
              </div>
              <Badge variant="warning">{approvalHotItems.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvalHotItems.length > 0 ? (
                approvalHotItems.slice(0, 4).map((approval: DashboardApproval) => {
                  const meta = getStatusMeta(approval.status);

                  return (
                    <Link
                      key={approval.id}
                      href="/approvals"
                      className="block rounded-2xl border border-border/70 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-dashboard-ink">
                            {approval.titleAr}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            مقدم بواسطة {approval.requester.fullNameAr}
                          </p>
                        </div>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <EmptyState
                  title="لا توجد اعتمادات عاجلة"
                  description="المشهد الحالي لا يحتوي على عناصر بانتظار قرار فوري."
                  actionHref="/approvals"
                  actionLabel="فتح الاعتمادات"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>العناصر المتأخرة</CardTitle>
              <p className="section-subtitle">
                مؤشرات تشغيلية للعناصر التي تحتاج تصحيحًا أو تصعيدًا.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.overdueInitiatives.length > 0 ? (
                data.overdueInitiatives.slice(0, 4).map((item: DashboardInitiative) => (
                  <Link
                    key={item.id}
                    href={`/initiatives/${item.id}`}
                    className="block rounded-2xl border border-border/70 p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-dashboard-ink">
                          {item.titleAr}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.plan.titleAr}
                        </p>
                      </div>
                      <Badge variant="danger">{formatDate(item.endDate)}</Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="لا توجد عناصر متأخرة"
                  description="لا توجد حاليًا مبادرات متجاوزة للاستحقاق ضمن البيانات المعروضة."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>تقارير البعثات</CardTitle>
            <p className="section-subtitle">آخر التقارير التي تتطلب مراجعة أو استكمالًا.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.missionReports.length > 0 ? (
              data.missionReports.slice(0, 4).map((report: DashboardReport) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block rounded-2xl border border-border/70 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dashboard-ink">{report.titleAr}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {report.missionNameAr} • {report.reportingPeriod}
                      </p>
                    </div>
                    <StatusBadge
                      label={getStatusMeta(report.status).label}
                      tone={getStatusMeta(report.status).tone}
                    />
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="لا توجد تقارير معلقة"
                description="يمكن رفع تقرير بعثة جديد أو مراجعة التقارير السابقة من وحدة التقارير."
                actionHref="/reports/new"
                actionLabel="رفع تقرير"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>برامج التدريب</CardTitle>
            <p className="section-subtitle">عرض سريع للبرامج المفتوحة وحجم الطلب عليها.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.trainingPrograms.length > 0 ? (
              data.trainingPrograms.map((program: DashboardTraining) => (
                <Link
                  key={program.id}
                  href={`/training/${program.id}`}
                  className="block rounded-2xl border border-border/70 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dashboard-ink">{program.titleAr}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {program.providerAr}
                      </p>
                    </div>
                    <Badge variant="outline">{program.nominations.length} ترشيح</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="لا توجد برامج تدريبية"
                description="ابدأ بنشر فرصة تدريبية لإظهار دورة الترشيح والاعتماد."
                actionHref="/training/new"
                actionLabel="نشر فرصة"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <p className="section-subtitle">أثر العمليات الحديثة على المنصة المؤسسية.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity: DashboardActivity) => (
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
              ))
            ) : (
              <EmptyState
                title="لا يوجد نشاط حديث"
                description="سيظهر هنا آخر ما تم إنجازه على الخطط والتقارير والاعتمادات."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
