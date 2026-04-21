import Link from "next/link";
import { FileClock, FileSearch, Send } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { formatDate, formatNumber } from "@/lib/utils";
import { getMissionReports } from "@/services/platform";

type MissionReportListItem = Awaited<ReturnType<typeof getMissionReports>>[number];

export default async function ReportsPage() {
  const reports = await getMissionReports();
  const underReview = reports.filter((report) => report.status === "UNDER_REVIEW").length;
  const returned = reports.filter((report) => report.status === "RETURNED").length;
  const approved = reports.filter((report) => report.status === "APPROVED").length;

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="تقارير البعثات"
        description="إدارة دورة التقرير من المسودة حتى المراجعة والاعتماد، مع إظهار مستوى الاكتمال والتعليقات وسجل القرار."
        actionHref="/reports/new"
        actionLabel="رفع تقرير جديد"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-700">قيد المراجعة</p>
          <p className="mt-3 text-2xl font-bold text-dashboard-ink">{formatNumber(underReview)}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تقارير وصلت للمراجع وتحتاج قرارًا أو تعليقًا نهائيًا.
          </p>
        </div>
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm font-semibold text-rose-700">معادة للاستكمال</p>
          <p className="mt-3 text-2xl font-bold text-dashboard-ink">{formatNumber(returned)}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تقارير تتطلب استكمال الشواهد أو إعادة صياغة بعض المحاور.
          </p>
        </div>
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-700">تقارير معتمدة</p>
          <p className="mt-3 text-2xl font-bold text-dashboard-ink">{formatNumber(approved)}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تقارير اجتازت المراجعة وأصبحت جزءًا من الذاكرة المؤسسية القابلة للرجوع.
          </p>
        </div>
      </section>

      {reports.length === 0 ? (
        <EmptyState
          title="لا توجد تقارير مرفوعة"
          description="ابدأ برفع أول تقرير بعثة لإظهار مسار المراجعة والتعليق والاعتماد في النسخة التجريبية."
          actionHref="/reports/new"
          actionLabel="رفع تقرير"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {reports.map((report: MissionReportListItem) => {
            const meta = getStatusMeta(report.status);

            return (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="h-full transition hover:-translate-y-1 hover:border-primary/20">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xl font-bold text-dashboard-ink">{report.titleAr}</p>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.missionNameAr} • {report.reportingPeriod}
                        </p>
                      </div>
                      <Badge variant="outline">{report.completionPercent}% اكتمال</Badge>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-dashboard-primary"
                        style={{ width: `${report.completionPercent}%` }}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Send className="h-4 w-4" />
                          مقدم التقرير
                        </div>
                        <p className="mt-2 font-semibold">{report.submittedBy.fullNameAr}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileSearch className="h-4 w-4" />
                          المراجع
                        </div>
                        <p className="mt-2 font-semibold">
                          {report.reviewer?.fullNameAr ?? "غير محدد"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileClock className="h-4 w-4" />
                          آخر تحديث
                        </div>
                        <p className="mt-2 font-semibold">{formatDate(report.updatedAt)}</p>
                      </div>
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
