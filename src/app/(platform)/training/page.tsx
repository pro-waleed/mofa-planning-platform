import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { getTrainingPrograms } from "@/services/platform";

type TrainingProgramListItem = Awaited<ReturnType<typeof getTrainingPrograms>>[number];

export default async function TrainingPage() {
  const programs = await getTrainingPrograms();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="التدريب والتأهيل"
        description="نشر الفرص التدريبية وإدارة الترشيحات والحضور وتقارير ما بعد التدريب."
        actionHref="/training/new"
        actionLabel="نشر فرصة تدريبية"
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {programs.map((program: TrainingProgramListItem) => {
          const meta = getStatusMeta(program.status);

          return (
            <Link key={program.id} href={`/training/${program.id}`}>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">{program.titleAr}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {program.providerAr}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">المقاعد</p><p className="mt-1 font-bold">{program.seats}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">الترشيحات</p><p className="mt-1 font-bold">{program.nominations.length}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">المنشئ</p><p className="mt-1 font-bold">{program.createdBy.fullNameAr}</p></div>
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
