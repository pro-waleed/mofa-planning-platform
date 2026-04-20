import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getMissionReports } from "@/services/platform";

type MissionReportListItem = Awaited<ReturnType<typeof getMissionReports>>[number];

export default async function ReportsPage() {
  const reports = await getMissionReports();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="تقارير البعثات"
        description="متابعة التقارير الدورية للبعثات، حالات المراجعة، التعليقات، والإرجاع للاستكمال."
        actionHref="/reports/new"
        actionLabel="رفع تقرير جديد"
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {reports.map((report: MissionReportListItem) => {
          const meta = getStatusMeta(report.status);

          return (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">{report.titleAr}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {report.missionNameAr} • {report.reportingPeriod}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    مقدم التقرير: {report.submittedBy.fullNameAr}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
