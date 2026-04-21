import type { Route } from "next";
import Link from "next/link";
import { CalendarClock, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { decideApprovalAction } from "@/features/approvals/actions";
import { formatDate, formatNumber } from "@/lib/utils";
import { getApprovals } from "@/services/platform";

type ApprovalListItem = Awaited<ReturnType<typeof getApprovals>>[number];

const entityLabels: Record<string, string> = {
  PLAN: "خطة",
  MISSION_REPORT: "تقرير بعثة",
  MONITORING_CYCLE: "دورة متابعة",
  TRAINING_PROGRAM: "برنامج تدريبي",
  TRAINING_NOMINATION: "ترشيح تدريبي",
  TEMPLATE: "قالب"
};

function approvalHref(approval: ApprovalListItem): Route {
  switch (approval.entityType) {
    case "PLAN":
      return `/plans/${approval.entityId}` as Route;
    case "MISSION_REPORT":
      return `/reports/${approval.entityId}` as Route;
    case "MONITORING_CYCLE":
      return `/monitoring/${approval.entityId}` as Route;
    case "TRAINING_PROGRAM":
      return `/training/${approval.entityId}` as Route;
    case "TRAINING_NOMINATION":
      return approval.trainingNomination
        ? (`/training/${approval.trainingNomination.programId}` as Route)
        : ("/training" as Route);
    case "TEMPLATE":
      return `/templates/${approval.entityId}` as Route;
    default:
      return "/approvals" as Route;
  }
}

function SummaryCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-white/85 p-4 shadow-panel">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-2xl font-bold text-dashboard-ink">{formatNumber(value)}</p>
        <Badge variant={tone}>{label}</Badge>
      </div>
    </div>
  );
}

function ApprovalActions({ approval }: { approval: ApprovalListItem }) {
  return (
    <form action={decideApprovalAction} className="space-y-3">
      <input type="hidden" name="approvalId" value={approval.id} />
      <textarea
        name="comment"
        defaultValue={approval.decisionComment ?? ""}
        placeholder="دوّن خلاصة القرار أو ملاحظات الإرجاع للاستكمال..."
        className="min-h-[120px] w-full rounded-2xl border border-input px-3 py-3 text-sm leading-7"
      />
      <div className="grid gap-2 md:grid-cols-3">
        <Button type="submit" name="decision" value="approve" variant="secondary">
          اعتماد
        </Button>
        <Button type="submit" name="decision" value="return" variant="outline">
          إعادة للاستكمال
        </Button>
        <Button type="submit" name="decision" value="reject" variant="destructive">
          رفض
        </Button>
      </div>
    </form>
  );
}

export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  const pendingApprovals = approvals.filter((approval) => approval.status === "PENDING");
  const approvedApprovals = approvals.filter((approval) => approval.status === "APPROVED");
  const returnedApprovals = approvals.filter((approval) => approval.status === "RETURNED");
  const rejectedApprovals = approvals.filter((approval) => approval.status === "REJECTED");

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="الاعتمادات"
        description="منصة موحدة لمراجعة الخطط والقوالب والتقارير ودورات المتابعة والترشيحات، مع قرارات واضحة وتعليقات قابلة للتتبع."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="بانتظار الإجراء" value={pendingApprovals.length} tone="warning" />
        <SummaryCard label="طلبات معتمدة" value={approvedApprovals.length} tone="success" />
        <SummaryCard label="معادة للاستكمال" value={returnedApprovals.length} tone="danger" />
        <SummaryCard label="طلبات مرفوضة" value={rejectedApprovals.length} tone="neutral" />
      </section>

      {approvals.length === 0 ? (
        <EmptyState
          title="لا توجد عناصر اعتماد"
          description="ستظهر هنا طلبات الاعتماد عند رفع الخطط أو التقارير أو الترشيحات أو القوالب للمراجعة."
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>الطابور التنفيذي</CardTitle>
                <p className="section-subtitle">
                  العناصر المفتوحة التي تحتاج قرارًا مباشرًا أو إعادة للاستكمال.
                </p>
              </div>
              <Badge variant="warning">{formatNumber(pendingApprovals.length)} طلبًا</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <EmptyState
                  title="لا توجد طلبات معلقة"
                  description="الطابور التنفيذي فارغ حاليًا، ويمكن مراجعة القرارات السابقة في السجل أدناه."
                />
              ) : (
                pendingApprovals.map((approval: ApprovalListItem) => {
                  const meta = getStatusMeta(approval.status);

                  return (
                    <div
                      key={approval.id}
                      className="grid gap-4 rounded-[28px] border border-border/70 bg-white/80 p-5 xl:grid-cols-[minmax(0,1fr)_360px]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xl font-bold text-dashboard-ink">
                                {approval.titleAr}
                              </p>
                              <StatusBadge label={meta.label} tone={meta.tone} />
                            </div>
                            <p className="text-sm leading-7 text-muted-foreground">
                              {approval.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{entityLabels[approval.entityType] ?? approval.entityType}</Badge>
                          <Badge variant="outline">
                            الطالب: {approval.requester.fullNameAr}
                          </Badge>
                          <Badge variant="outline">
                            المكلّف: {approval.assignedTo.fullNameAr}
                          </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                            <p className="text-muted-foreground">تاريخ الطلب</p>
                            <p className="mt-2 font-semibold">{formatDate(approval.requestedAt)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                            <p className="text-muted-foreground">آخر موعد مستهدف</p>
                            <p className="mt-2 font-semibold">
                              {approval.dueDate ? formatDate(approval.dueDate) : "غير محدد"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                            <p className="text-muted-foreground">سياق القرار</p>
                            <p className="mt-2 font-semibold">
                              {approval.routeSnapshot ? "يتضمن لقطة مسار" : "قرار مباشر"}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={approvalHref(approval)}
                          className="inline-flex rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-dashboard-ink transition hover:bg-slate-50"
                        >
                          فتح العنصر المرتبط
                        </Link>
                      </div>

                      <ApprovalActions approval={approval} />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سجل القرارات الأخيرة</CardTitle>
              <p className="section-subtitle">
                توثيق موجز للقرارات المنفذة أخيرًا وما ترتب عليها من تعليقات.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvals
                .filter((approval) => approval.status !== "PENDING")
                .slice(0, 8)
                .map((approval: ApprovalListItem) => (
                  <div
                    key={approval.id}
                    className="rounded-[24px] border border-border/70 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-dashboard-ink">{approval.titleAr}</p>
                          <StatusBadge
                            label={getStatusMeta(approval.status).label}
                            tone={getStatusMeta(approval.status).tone}
                          />
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {approval.decisionComment || "تم تنفيذ القرار دون تعليق تفصيلي إضافي."}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {approval.actedAt ? formatDate(approval.actedAt) : formatDate(approval.updatedAt)}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        {entityLabels[approval.entityType] ?? approval.entityType}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {approval.status === "APPROVED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : approval.status === "RETURNED" ? (
                          <RotateCcw className="h-4 w-4 text-amber-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600" />
                        )}
                        بواسطة {approval.assignedTo.fullNameAr}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        من {approval.requester.fullNameAr}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
