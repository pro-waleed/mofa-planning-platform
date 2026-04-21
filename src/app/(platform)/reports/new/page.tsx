import { PageHeader } from "@/components/page-header";
import { ReportForm } from "@/features/reports/report-form";
import { prisma } from "@/lib/prisma";

export default async function NewReportPage() {
  const [units, reviewers] = await Promise.all([
    prisma.organizationalUnit.findMany({
      orderBy: { nameAr: "asc" }
    }),
    prisma.user.findMany({
      where: {
        role: {
          code: {
            in: ["DEPARTMENT_MANAGER", "DIRECTOR_GENERAL"]
          }
        }
      },
      select: {
        id: true,
        fullNameAr: true
      },
      orderBy: { fullNameAr: "asc" }
    })
  ]);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="رفع تقرير بعثة"
        description="نموذج عربي موحد للتقارير الدورية، يراعي الملخص التنفيذي والإنجازات والتحديات وطلبات الدعم ضمن مسار مراجعة واضح."
        backHref="/reports"
      />
      <ReportForm units={units} reviewers={reviewers} />
    </div>
  );
}
