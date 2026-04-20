import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import {
  createNominationAction,
  reviewNominationAction
} from "@/features/training/actions";
import { prisma } from "@/lib/prisma";
import { getTrainingProgramById } from "@/services/platform";

type TrainingProgramDetail = NonNullable<Awaited<ReturnType<typeof getTrainingProgramById>>>;
type ManagerUser = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

export default async function TrainingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getTrainingProgramById(id);

  if (!program) notFound();

  const managers = await prisma.user.findMany({
    where: {
      role: {
        code: "DEPARTMENT_MANAGER"
      }
    },
    orderBy: { fullNameAr: "asc" }
  });

  const meta = getStatusMeta(program.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={program.titleAr} description={program.description ?? ""} backHref="/training" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>الترشيحات والمشاركات</CardTitle>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </CardHeader>
          <CardContent className="space-y-3">
            {program.nominations.map((nomination: TrainingProgramDetail["nominations"][number]) => (
              <div key={nomination.id} className="rounded-2xl border border-border/70 p-4">
                <p className="font-semibold">{nomination.nominee.fullNameAr}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nomination.motivation ?? "لا يوجد تبرير"}
                </p>
                <form action={reviewNominationAction} className="mt-3 grid gap-2">
                  <input type="hidden" name="nominationId" value={nomination.id} />
                  <input type="hidden" name="programId" value={program.id} />
                  <textarea
                    name="managerComment"
                    defaultValue={nomination.managerComment ?? ""}
                    className="min-h-[80px] rounded-xl border border-input px-3 py-2 text-sm"
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button type="submit" name="decision" value="approve" variant="secondary">
                      اعتماد
                    </Button>
                    <Button type="submit" name="decision" value="reject" variant="destructive">
                      رفض
                    </Button>
                  </div>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>تقديم ترشيح</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createNominationAction} className="space-y-3">
              <input type="hidden" name="programId" value={program.id} />
              <select
                name="managerId"
                className="h-11 w-full rounded-xl border border-input px-3 text-sm"
                defaultValue=""
              >
                <option value="">اختر المدير المعتمد</option>
                {managers.map((manager: ManagerUser) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullNameAr}
                  </option>
                ))}
              </select>
              <textarea
                name="motivation"
                placeholder="مبررات الترشيح"
                className="min-h-[110px] w-full rounded-xl border border-input px-3 py-2 text-sm"
              />
              <Button type="submit" className="w-full">
                إرسال طلب الترشيح
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
