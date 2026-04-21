import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { submitPlanForApprovalAction } from "@/features/plans/actions";
import { PlanNodeForm } from "@/features/plans/plan-node-form";
import { PlanTree, type PlanTreeNode } from "@/features/plans/plan-tree";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getPlanById } from "@/services/platform";

type PlanDetail = NonNullable<Awaited<ReturnType<typeof getPlanById>>>;
type ActiveUser = { id: string; fullNameAr: string };

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
      select: {
        id: true,
        fullNameAr: true
      },
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
  const levelBlueprint = plan.template.levels;

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title={plan.titleAr}
        description={
          plan.description ??
          "تفاصيل الخطة وبنيتها الهرمية ومسار الاعتماد المرتبط بها."
        }
        backHref="/plans"
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="القالب" value={plan.template.nameAr} />
        <SummaryCard label="الفترة" value={plan.periodLabel} />
        <SummaryCard label="المالك" value={plan.owner.fullNameAr} />
        <SummaryCard label="العقد" value={String(plan.nodes.length)} />
        <SummaryCard label="المبادرات" value={String(plan.initiatives.length)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>ملخص الخطة</CardTitle>
                <p className="section-subtitle">
                  جاهزية الخطة الحالية ومسارها التنفيذي ضمن الدورة المؤسسية.
                </p>
              </div>
              <StatusBadge label={meta.label} tone={meta.tone} />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                <p className="mt-1 font-semibold">{formatDate(plan.startDate)}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                <p className="mt-1 font-semibold">{formatDate(plan.endDate)}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">الجهة المالكة</p>
                <p className="mt-1 font-semibold">
                  {plan.organizationalUnit?.nameAr ?? "من دون تحديد"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>المحرر الهرمي للخطة</CardTitle>
                <p className="section-subtitle">
                  كل عقدة تُبنى وفق ترتيب مستويات القالب، مع ربط الملكية والمؤشرات
                  ونطاق الزمن.
                </p>
              </div>
              <BadgePill>{plan.nodes.length} عقدة</BadgePill>
            </CardHeader>
            <CardContent>
              <PlanTree
                planId={plan.id}
                nodes={plan.tree as PlanTreeNode[]}
                users={users}
                kpis={kpis}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>بصمة القالب الديناميكي</CardTitle>
              <p className="section-subtitle">
                هذه الخطة غير مبنية على تسلسل ثابت؛ النظام يقرأ مستويات القالب كما هي.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {levelBlueprint.map((level) => (
                <div
                  key={level.id}
                  className="rounded-2xl border border-border/70 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dashboard-ink">
                        {level.levelOrder}. {level.nameAr}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                        {level.key}
                      </p>
                    </div>
                    <BadgePill>{level.isRequired ? "إلزامي" : "اختياري"}</BadgePill>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <PlanNodeForm
            planId={plan.id}
            parentOptions={plan.nodes.map((node: PlanDetail["nodes"][number]) => ({
              id: node.id,
              titleAr: node.titleAr,
              levelOrder: node.templateLevel.levelOrder,
              levelNameAr: node.templateLevel.nameAr
            }))}
            levelOptions={plan.template.levels.map((level) => ({
              id: level.id,
              nameAr: level.nameAr,
              levelOrder: level.levelOrder
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
              <p className="text-sm leading-8 text-muted-foreground">
                بعد اكتمال الهيكل وربط الملكية والمؤشرات الأساسية، ارفع الخطة إلى مسار
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

          <Card>
            <CardHeader>
              <CardTitle>سجل الاعتمادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.approvals.length > 0 ? (
                plan.approvals.map((approval) => (
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
                          المكلف: {approval.assignedTo.fullNameAr}
                        </p>
                      </div>
                      <StatusBadge
                        label={getStatusMeta(approval.status).label}
                        tone={getStatusMeta(approval.status).tone}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="لا توجد طلبات اعتماد بعد"
                  description="سيظهر هنا سجل الرفع والمراجعة والقرار بمجرد تحويل الخطة إلى مسار الاعتماد."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-white p-5 shadow-panel">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold text-dashboard-ink">{value}</p>
    </div>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}
