import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { submitPlanForApprovalAction } from "@/features/plans/actions";
import { PlanNodeForm } from "@/features/plans/plan-node-form";
import { PlanTree } from "@/features/plans/plan-tree";
import { prisma } from "@/lib/prisma";
import { getPlanById } from "@/services/platform";

type ActiveUser = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

export default async function PlanDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [plan, users, kpis] = await Promise.all([
    getPlanById(id),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullNameAr: "asc" }
    }),
    prisma.kPI.findMany({
      orderBy: { titleAr: "asc" }
    })
  ]);

  if (!plan) {
    notFound();
  }

  const meta = getStatusMeta(plan.status);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title={plan.titleAr}
        description={plan.description ?? "تفاصيل الخطة وبنيتها الهرمية."}
        backHref="/plans"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>ملخص الخطة</CardTitle>
                <p className="section-subtitle">{plan.template.nameAr}</p>
              </div>
              <StatusBadge label={meta.label} tone={meta.tone} />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">الفترة</p>
                <p className="mt-1 font-semibold">{plan.periodLabel}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">المالك</p>
                <p className="mt-1 font-semibold">{plan.owner.fullNameAr}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">العقد</p>
                <p className="mt-1 font-semibold">{plan.nodes.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">المبادرات</p>
                <p className="mt-1 font-semibold">{plan.initiatives.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المحرر الهرمي للخطة</CardTitle>
            </CardHeader>
            <CardContent>
              <PlanTree
                planId={plan.id}
                nodes={plan.tree as never}
                users={users}
                kpis={kpis}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PlanNodeForm
            planId={plan.id}
            parentOptions={plan.nodes.map((node: (typeof plan.nodes)[number]) => ({
              id: node.id,
              titleAr: node.titleAr
            }))}
            levelOptions={plan.template.levels.map((level: (typeof plan.template.levels)[number]) => ({
              id: level.id,
              nameAr: level.nameAr
            }))}
            ownerOptions={users.map((user: ActiveUser) => ({
              id: user.id,
              fullNameAr: user.fullNameAr
            }))}
          />

          <Card>
            <CardHeader>
              <CardTitle>إجراء الاعتماد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                بعد اكتمال البنية والملاك والمؤشرات الأساسية، ارفع الخطة لمسار
                الاعتماد التنفيذي.
              </p>
              <form action={submitPlanForApprovalAction}>
                <input type="hidden" name="planId" value={plan.id} />
                <Button type="submit" className="w-full">
                  إرسال الخطة للاعتماد
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
