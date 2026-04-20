import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { advanceMissionReportAction } from "@/features/reports/actions";
import { getMissionReportById } from "@/services/platform";

type MissionReportDetail = NonNullable<Awaited<ReturnType<typeof getMissionReportById>>>;

export default async function ReportDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getMissionReportById(id);

  if (!report) notFound();

  const meta = getStatusMeta(report.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={report.titleAr} description={report.executiveSummary ?? ""} backHref="/reports" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>تفاصيل التقرير</CardTitle>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">البعثة</p><p className="mt-1 font-bold">{report.missionNameAr}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">الفترة</p><p className="mt-1 font-bold">{report.reportingPeriod}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">الإنجازات</p><p className="mt-1">{report.achievements ?? "لا توجد بيانات"}</p></div>
              <div className="rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">التحديات</p><p className="mt-1">{report.challenges ?? "لا توجد بيانات"}</p></div>
              <div className="rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">طلبات الدعم</p><p className="mt-1">{report.supportRequests ?? "لا توجد بيانات"}</p></div>
            </div>
            <CardTitle className="pt-2">التعليقات</CardTitle>
            <div className="space-y-3">
              {report.comments.map((comment: MissionReportDetail["comments"][number]) => (
                <div key={comment.id} className="rounded-2xl border border-border/70 p-4">
                  <p className="font-semibold">{comment.author.fullNameAr}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{comment.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجراءات المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={advanceMissionReportAction} className="space-y-3">
              <input type="hidden" name="reportId" value={report.id} />
              <textarea
                name="comment"
                placeholder="أضف تعليقًا أو ملاحظة مراجعة"
                className="min-h-[110px] w-full rounded-xl border border-input px-3 py-2 text-sm"
              />
              <div className="grid gap-3">
                <Button type="submit" name="decision" value="submit">
                  إرسال للمراجعة
                </Button>
                <Button type="submit" name="decision" value="approve" variant="secondary">
                  اعتماد التقرير
                </Button>
                <Button type="submit" name="decision" value="return" variant="destructive">
                  إعادة للاستكمال
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
